import { ServiceBusClient } from "@azure/service-bus";
import crypto from "crypto";

const connectionString = "ServiceBus接続文字列に置き換える";
const topicName = "ServiceBusトピック名に置き換える";

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
      await sender.sendMessages(batch);
      batch = await sender.createMessageBatch();
      if (!batch.tryAddMessage()) {
        throw new Error("Message too big to fit in a batch");
      }
    }
    await sender.sendMessages(batch);
    console.log(`Sent a batch of messages to the queue: ${topicName}`);
    await sender.close();
  } finally {
    await sbClient.close();
  }
}

main().catch((err) => {
  console.log("Error occurred: ", err);
  process.exit(1);
});
