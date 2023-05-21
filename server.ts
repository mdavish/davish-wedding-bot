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

  console.log("Message received:", messageBody);

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
