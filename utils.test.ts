import dotenv from "dotenv";

dotenv.config();

import { formatPhoneNumber, sendMessageToGuestList } from "./utils";

const somePhoneNumbers = [
  "+44 7803 803962",
  "+49 151 10678260",
  "203-921-6015",
  "2155346876",
];

function main() {
  somePhoneNumbers.forEach((phoneNumber) => {
    console.log(
      `formatting ${phoneNumber} to ${formatPhoneNumber(phoneNumber)}`
    );
  });
  sendMessageToGuestList("Hello, World!", true);
}

main();
