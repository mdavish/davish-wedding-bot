import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

export const client = twilio(accountSid, authToken);

export async function sendMessage(to: string, body: string): Promise<void> {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log("Message sent successfully:", message.sid);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}
