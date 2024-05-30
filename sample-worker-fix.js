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
      // receiver.abandonMessage(message);
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
  }, {
    // 以下の追記が必要。
    // 追記がない場合だと、autoCompleteMessages: true(デフォルト)となる。
    // この場合、processMessageハンドラ完了後に、自動的にメッセージが解決される。
    // しかし、execute関数は非同期で動くので、processMessageハンドラ完了後、メッセージが既に解決された状態から、completeMessage/abandonMessage を実施しようとしてエラーになる
    // 参考：https://learn.microsoft.com/ja-jp/javascript/api/%40azure/service-bus/subscribeoptions?view=azure-node-latest#@azure-service-bus-subscribeoptions-autocompletemessages
    autoCompleteMessages: false
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
