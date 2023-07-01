import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import { readGuestList, getSheetAuth } from "./googleSheets";
import { GuestSchema } from "./sheetsSchemas";
import { sendMessage } from "./twilioClient";

interface Report {
  sent: number;
  skippedNoPhone: number;
  skippedNoEvents: number;
  errors: number;
}

const ASHLEY_PHONE = "+19724002844";
const MAX_PHONE = "+12155346876";
const NICK_PHONE = "+19723101405";
const DANIEL_PHONE = "+12149120568";
const SAM_PHONE = "+13148092321";

const phoneUtil = PhoneNumberUtil.getInstance();

export function formatPhoneNumber(number: string, countryCode = "US") {
  try {
    const phoneNumber = phoneUtil.parseAndKeepRawInput(number, countryCode);
    if (phoneUtil.isValidNumber(phoneNumber)) {
      return phoneUtil.format(phoneNumber, PhoneNumberFormat.E164);
    } else {
      console.log("Invalid number:", number);
      return null;
    }
  } catch (error) {
    console.error("Failed to parse number:", number, "Error:", error);
    return null;
  }
}

export async function sendMessageToGuestList(
  message: string,
  test?: boolean
): Promise<Report> {
  const sheetAuth = getSheetAuth();
  const guestList = await readGuestList(sheetAuth);
  const parsedList = guestList.map((guest) => {
    return GuestSchema.parse(guest);
  });
  console.log(`About to send message to ${parsedList.length} guests.`);
  console.log(`Message: ${message}`);
  const report: Report = {
    sent: 0,
    skippedNoPhone: 0,
    skippedNoEvents: 0,
    errors: 0,
  };

  for (let i = 0; i < parsedList.length; i++) {
    const guest = parsedList[i];
    const isAttendingAnyEvents =
      guest.Rehearsal || guest.Wedding || guest["Welcome Drinks"];

    if (!isAttendingAnyEvents) {
      console.log(
        `${i}. ${guest["First Name"]} ${guest["Last Name"]} is not attending any events.`
      );
      report.skippedNoEvents++;
    } else if (guest.Phone && guest.Phone.length > 1) {
      // The rest of your code here...
      // First we format the number
      let formattedNumber;
      try {
        formattedNumber = formatPhoneNumber(guest.Phone);
      } catch (error) {
        console.error(error);
        report.errors++;
        await sendMessage(
          MAX_PHONE,
          `Failed formatting number for guest: ${guest["First Name"]} ${guest["Last Name"]} @ ${guest.Phone}`
        );
        continue;
      }

      if (!test && formattedNumber) {
        try {
          console.log(
            `Sending message to ${formattedNumber}. for ${guest["First Name"]} ${guest["Last Name"]}`
          );
          await sendMessage(formattedNumber, message);
          // Introduce delay here
        } catch (error) {
          console.error(error);
          report.errors++;
          await sendMessage(
            MAX_PHONE,
            `Failed sending message to guest: ${guest["First Name"]} ${guest["Last Name"]} @ ${guest.Phone}`
          );
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay between messages
      }
      report.sent++;
    } else {
      console.log(
        `${i}. No phone number for ${guest["First Name"]} ${guest["Last Name"]}.`
      );
      report.skippedNoPhone++;
    }
  }

  // For tests, we send Max, Ashley, Nick, Sam, and Daniel
  if (test) {
    const phones = [
      ASHLEY_PHONE,
      MAX_PHONE,
      NICK_PHONE,
      DANIEL_PHONE,
      SAM_PHONE
    ]

    // For each phone number, send the message
    for (let i = 0; i < phones.length; i++) {
      const phone = phones[i];
      console.log(`Sending test message to ${phone}`);
      await sendMessage(phone, message);
    }
  }
  return report;
}
