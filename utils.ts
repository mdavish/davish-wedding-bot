import { readGuestList, getSheetAuth } from "./googleSheets";
import { GuestSchema } from "./sheetsSchemas";
import { sendMessage } from "./twilioClient";

interface Report {
  sent: number;
  skippedNoPhone: number;
  skippedNoEvents: number;
  errors: number;
}

const ASHLEY_PHONE = "9724002844";
const MAX_PHONE = "2155346876";

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

  await Promise.all(
    parsedList.map(async (guest, index) => {
      const isAttendingAnyEvents =
        guest.Rehearsal || guest.Wedding || guest["Welcome Drinks"];
      if (!isAttendingAnyEvents) {
        console.log(
          `${index}. ${guest["First Name"]} ${guest["Last Name"]} is not attending any events.`
        );
        report.skippedNoEvents++;
      } else if (guest.Phone && guest.Phone.length > 1) {
        console.log(
          `${index}. Sending message to ${guest["First Name"]} ${
            guest["Last Name"]
          } @ ${guest.Phone} ${test ? "(test)" : ""}.`
        );
        if (!test) {
          try {
            await sendMessage(guest.Phone, message);
          } catch (error) {
            console.error(error);
          }
        }
        report.sent++;
      } else {
        console.log(
          `${index}. No phone number for ${guest["First Name"]} ${guest["Last Name"]}.`
        );
        report.skippedNoPhone++;
      }
    })
  );

  if (test) {
    console.log(`Sending test message to ${ASHLEY_PHONE} and ${MAX_PHONE}`);
    await sendMessage(ASHLEY_PHONE, message);
    await sendMessage(MAX_PHONE, message);
  }
  return report;
}
