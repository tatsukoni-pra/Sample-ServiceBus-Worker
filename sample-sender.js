import { ServiceBusClient } from "@azure/service-bus";
import crypto from "crypto";
import { config } from "dotenv";
config();

const connectionString = process.env.CONNECTION_STRING;
const topicName = process.env.TOPIC_NAME;

// ユニークIDを生成
const messageId = () => {
  return crypto.randomUUID() + '--' + new Date().getTime();
}

async function main() {
  const sbClient = new ServiceBusClient(connectionString);
  const sender = sbClient.createSender(topicName);

  try {
    const message = {
      messageId: messageId(),
      body: {
        "content": "sample"
      }
    };
    let batch = await sender.createMessageBatch();
    if (!batch.tryAddMessage(message)) {
      throw new Error("メッセージバッチの追加に失敗しました");
    }
    await sender.sendMessages(batch);
    console.log(`Sent a batch of messages to the queue: ${topicName}`);
  } catch (err) {
    console.log("Error occurred: ", err);
  } finally {
    await sender.close();
    await sbClient.close();
  }
}

main().catch((err) => {
  console.log("Error occurred: ", err);
  process.exit(1);
});
