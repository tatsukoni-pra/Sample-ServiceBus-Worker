import { ServiceBusClient } from "@azure/service-bus";
import { config } from "dotenv";
config();

const connectionString = process.env.CONNECTION_STRING;
const topicName = process.env.TOPIC_NAME;
const subscriptionName = process.env.SUBSCRIPTION_NAME;

async function main() {
  // const sbClient = new ServiceBusClient(connectionString, {
  //   retryOptions: {
  //     maxRetries: 3
  //   }
  // });
  const sbClient = new ServiceBusClient(connectionString);
  const receiver = sbClient.createReceiver(topicName, subscriptionName);

  receiver.subscribe({
    processMessage: async (message) => {
      console.log("Received message: ", message.messageId);
      // throw new Error("sample error");
      // executeは非同期で実行させる
      execute(message.messageId)
        .then(() => {
          // 以下処理でエラーが発生すると、processMessage自体は既に正常終了しているため、
          // processError に補足されず、UncaughtException となって、Node.jsプロセスが異常終了する
          // そのため、この時点でcatchしておく
          receiver.completeMessage(message).catch((err) => {
            console.error("receiver.completeMessage でエラー発生");
            console.error("エラーの詳細: ", err);
          });
        })
        .catch((err) => {
          console.error("processMessage でエラー発生");
          console.error("エラーの詳細: ", err);
          receiver.abandonMessage(message).catch((err) => {
            console.error("receiver.abandonMessage でエラー発生");
            console.error("エラーの詳細: ", err);
          });
        });
      console.log("processMessage Finish messageId: ", message.messageId);
    },
    processError: async (err) => {
      // processMessageハンドラ内で(処理が完了するまでの間に)エラーが発生したら、processErrorハンドラが呼び出される
      // ↓の処理が動いたのち、最大配信数に達するまで自動的に再実行される
      // 再実行回数が、最大配信数に達した場合は、dead-letter queue に移動される
      console.error("processError発生");
      console.error("エラーの理由: ", err.error.code);
      console.error("エラーの詳細: ", err);
    },
  });
}

async function execute(messageId) {
  console.log("Start Execute message: ", messageId);
  await wait(5000);
  console.log("Finish Execute message: ", messageId);
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
