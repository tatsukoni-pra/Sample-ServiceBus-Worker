import { ServiceBusClient } from "@azure/service-bus";
import { config } from "dotenv";
config();

const connectionString = process.env.CONNECTION_STRING;
const topicName = process.env.TOPIC_NAME;
const subscriptionName = process.env.SUBSCRIPTION_NAME;

async function main() {
  const sbClient = new ServiceBusClient(connectionString);
  const receiver = sbClient.createReceiver(topicName, subscriptionName);

  receiver.subscribe({
    processMessage: async (message) => {
      console.log((new Date()).toISOString() + "Received message: ", message.messageId);
      execute(message.messageId)
        .catch((err) => {
          console.error("execute でエラー発生");
          console.error("エラーの詳細: ", err);
        })
        .finally(() => {
          console.log((new Date()).toISOString() + "execute完了");
          receiver.completeMessage(message).catch((err) => {
            console.error("completeMessage でエラー発生");
            console.error("エラーの詳細: ", err);
          });
        });
      console.log((new Date()).toISOString() + "processMessage Finish messageId: ", message.messageId);
    },
    processError: async (err) => {
      console.error("processError発生");
      console.error("エラーの理由: ", err.error.code);
      console.error("エラーの詳細: ", err);
    },
  }, {
    autoCompleteMessages: false,
    maxConcurrentCalls: 1,
  });
}

async function execute(messageId) {
  console.log((new Date()).toISOString() + "Start Execute message: ", messageId);
  console.log((new Date()).toISOString() + "Finish Execute message: ", messageId);
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
