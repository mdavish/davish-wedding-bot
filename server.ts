import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import { client } from "./twilioClient";
import { ChatCore, type Message } from "@yext/chat-core";

const logger = morgan("combined");
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(logger);

const chat = new ChatCore({
  apiKey: process.env.YEXT_API_KEY || "",
  botId: "davish-wedding-bot",
});

const MAX_MESSAGES = 10;
const SPLIT_CHAR = "ℹ";

app.post("/incoming-message", async (req, res) => {
  const messageBody = req.body.Body;
  const sender = req.body.From;

  // Your logic to process the message and generate a response

  // Console log the message history
  const messagesFromSender = await client.messages.list({
    from: sender,
  });

  const messagesToSender = await client.messages.list({
    to: sender,
  });

  const allMessages = messagesFromSender
    .concat(messagesToSender)
    .sort((a, b) => {
      return a.dateCreated > b.dateCreated ? 1 : -1;
    });

  const messageHistory: Message[] = allMessages.map((message) => ({
    source: message.direction === "inbound" ? "USER" : "BOT",
    text: message.body,
    timestamp: message.dateCreated.toDateString(),
  }));

  console.log({ messageHistory });

  const chatResponse = await chat.getNextMessage({
    messages: messageHistory,
    context: {
      method: "SMS",
      senderNumber: sender,
    },
  });

  console.log({ chatResponse });

  res.set("Content-Type", "text/plain");
  const messageText = chatResponse.message.text;
  const splitMessage = messageText.split(SPLIT_CHAR);
  res.send(splitMessage[0]);
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
