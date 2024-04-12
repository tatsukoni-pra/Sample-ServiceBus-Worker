import { ServiceBusClient } from "@azure/service-bus";

const connectionString = "ServiceBus接続文字列に置き換える";
const topicName = "ServiceBusトピック名に置き換える";
const subscriptionName = "ServiceBusサブスクリプション名に置き換える";

async function main() {
  const sbClient = new ServiceBusClient(connectionString);
  const receiver = sbClient.createReceiver(topicName, subscriptionName);

  receiver.subscribe({
    processMessage: async (message) => {
      console.log("Received message: ", message.messageId);
    },
    processError: async (err) => {
      console.error(err);
    },
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
