import { sendMessageToGuestList } from "./utils";

async function main() {
  await sendMessageToGuestList("Hello World!", true);
}

main();
