# 概要

- ServiceBusを動作させるサンプルスクリプト
- 接続文字列認証で動作させます
- トピック・サブスクリプション方式です

# 動かし方

## 初期環境構築

node, npm を実行環境にインストールした上で以下を実行してください。

```
npm install
cp .env.samlpe .env
```

`.env`には、必要な設定値を記述してください。

## ServiceBusにメッセージを送信する

```
node sample-sender.js
```

## ServiceBusからメッセージを受信する

```
node sample-worker.js
```
