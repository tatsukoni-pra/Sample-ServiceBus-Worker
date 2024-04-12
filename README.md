# 動かし方

## 初期環境構築

node, npm を実行環境にインストールした上で以下を実行してください。

```
npm install
```

## ServiceBusにメッセージを送信する

```
node sample-sender.js
```

## ServiceBusからメッセージを受信する

```
node sample-worker.js
```
