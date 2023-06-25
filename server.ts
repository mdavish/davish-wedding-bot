import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { client } from "./twilioClient";
import { ChatCore, type Message } from "@yext/chat-core";
import { z } from "zod";
import { sendMessageToGuestList } from "./utils";

const logger = morgan("combined");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger);

const chat = new ChatCore({
  apiKey: process.env.YEXT_API_KEY || "",
  botId: "davish-wedding-bot",
});

const MAX_MESSAGES = 3; // Something weird is happening when you make this too high
const SPLIT_CHAR = "ℹ";

app.post("/incoming-message", async (req, res) => {
  try {
    // We respond in plain text no matter what.
    res.set("Content-Type", "text/plain");
    const messageBody = req.body.Body;
    const sender = req.body.From;

    console.log("Message received:", messageBody);

    const messagesFromSender = await client.messages.list({
      from: sender,
    });

    const messagesToSender = await client.messages.list({
      to: sender,
    });

    const parsedBody = z.string().safeParse(messageBody);

    if (!parsedBody.success) {
      return res.send("Sorry, something went wrong. Please try again later.");
    }

    if (parsedBody.data.startsWith("<BLAST>")) {
      const truncatedMessage = parsedBody.data.replace("<BLAST>", "");
      const report = await sendMessageToGuestList(truncatedMessage);
      return res.send(
        `Sent message to ${report.sent} guests. Skipping ${report.skippedNoPhone} guests without phone numbers and ${report.skippedNoEvents} guests not attending any events.`
      );
    }

    if (parsedBody.data.startsWith("<TEST>")) {
      const truncatedMessage = parsedBody.data.replace("<TEST>", "");
      const report = await sendMessageToGuestList(truncatedMessage, true);
      return res.send(
        `Test report: I would have sent this message to ${report.sent} guests, skipped ${report.skippedNoPhone} guests without phone numbers, and skipped ${report.skippedNoEvents} guests not attending any events.`
      );
    }

    const allMessages = messagesFromSender
      .concat(messagesToSender)
      .sort((a, b) => {
        return a.dateCreated > b.dateCreated ? 1 : -1;
      });

    const messageHistory: Message[] = allMessages.map((message) => ({
      source: message.direction === "inbound" ? "USER" : "BOT",
      text: message.body,
      timestamp: message.dateCreated.toISOString(),
    }));

    const truncatedMessageHistory = messageHistory.slice(-MAX_MESSAGES);

    console.log({ truncatedMessageHistory });

    const chatResponse = await chat.getNextMessage({
      messages: truncatedMessageHistory,
    });

    console.dir({ chatResponse }, { depth: null });
    const messageText = chatResponse.message.text;
    const splitMessage = messageText.split(SPLIT_CHAR);
    return res.send(splitMessage[0]);
  } catch (e) {
    console.log("Error in incoming-message route");
    console.log(e);
    return res.send("Sorry, something went wrong. Please try again later.");
  }
});

const port = process.env.PORT || 3000; // 3000 or any default port for your local development

// Custom 404 Handler
app.use((req, res) => {
  console.log("Received request for unknown path:", req.path);
  console.log("Request body:", req.body);
  res.status(404).send("Not Found");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
