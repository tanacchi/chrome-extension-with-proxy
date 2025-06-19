# Mock API Server

OpenAI互換のモックAPIサーバーです。Chrome拡張機能の開発・テスト用に使用します。

## 機能

- OpenAI Chat Completions APIの互換実装
- テストデータに基づく分析結果の生成
- OpenAPI Schema対応
- Swagger UI による API ドキュメント
- Postman コレクション対応

## 起動方法

```bash
# 依存関係のインストール
pnpm install

# サーバー起動（ポート3001）
pnpm start

# 別ポートで起動する場合
PORT=3002 pnpm start
```

## エンドポイント

### API情報
- `GET /` - API情報とエンドポイント一覧
- `GET /health` - ヘルスチェック

### ドキュメント
- `GET /docs` - Swagger UI（ブラウザーでアクセス）
- `GET /openapi.yaml` - OpenAPI Schema

### OpenAI互換API
- `POST /v1/chat/completions` - チャット補完API

## 使用例

### 基本的なリクエスト

```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "system",
        "content": "あなたはテーブルデータの分析を行うAIアシスタントです。"
      },
      {
        "role": "user",
        "content": "以下のテーブルデータを分析してください: りんご, バナナ, オレンジ"
      }
    ]
  }'
```

### ヘルスチェック

```bash
curl http://localhost:3001/health
```

### CORS設定テスト

```bash
curl -H "Origin: http://localhost:3000" http://localhost:3001/cors-test
```

## テスト

### 単体テスト

```bash
pnpm test
```

### Postmanテスト

```bash
# サーバー起動付きPostmanテスト（推奨）
pnpm run test:e2e

# ローカルサーバー前提のPostmanテスト
pnpm run test:postman:local

# 環境ファイル使用のPostmanテスト
pnpm run test:postman

# 全テスト実行（単体テスト + Postman）
pnpm run test:all
```

### メインプロジェクトから実行

```bash
# プロジェクトルートから
pnpm test:mock-api:postman
```

### Postmanコレクション（手動）

1. Postmanで `postman-collection.json` をインポート
2. 環境変数 `baseUrl` を `http://localhost:3001` に設定
3. コレクションを実行

### 手動テスト

```bash
# テストスクリプトの実行
./test-request.sh
```

## API仕様

### Chat Completions

**Request:**
```json
{
  "model": "gpt-4o-mini",
  "messages": [
    {
      "role": "system",
      "content": "システムメッセージ"
    },
    {
      "role": "user", 
      "content": "ユーザーメッセージ"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1000
}
```

**Response:**
```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1678901234,
  "model": "gpt-4o-mini",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "分析結果..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 62,
    "total_tokens": 107
  }
}
```

## モック分析ロジック

- ユーザーメッセージの最初の30文字を抽出
- 事前定義された分析パターンからランダムに選択
- 入力データに応じた日本語の分析結果を生成

## 開発情報

### ファイル構成

- `server.js` - メインサーバーファイル
- `openapi.yaml` - OpenAPI仕様
- `swagger-ui.html` - Swagger UIページ
- `postman-collection.json` - Postmanテストコレクション
- `test-request.sh` - 手動テストスクリプト

### 環境変数

- `PORT` - サーバーポート（デフォルト: 3002）
- `NODE_ENV` - 実行環境（development/production）

## CORS設定

このサーバーは以下のオリジンからのアクセスを許可しています：

### 許可されたオリジン
- `http://localhost:*` (全てのlocalhostポート)
- `http://127.0.0.1:*` (全ての127.0.0.1ポート)
- `chrome-extension://*` (Chrome拡張機能)
- `moz-extension://*` (Firefox拡張機能)

### 許可されたメソッド
- GET, POST, PUT, DELETE, OPTIONS

### 許可されたヘッダー
- Content-Type, Authorization, X-Requested-With, Accept, Origin等

### CORS設定確認
```bash
# CORS設定のテスト
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3001/v1/chat/completions

# CORS テストエンドポイント
curl -H "Origin: http://localhost:3000" http://localhost:3001/cors-test
```

## トラブルシューティング

### ポートが使用中の場合

```bash
# ポート使用状況確認
lsof -i :3001

# プロセス終了
kill -9 <PID>
```

### CORS エラーの場合

1. オリジンがlocalhost系であることを確認
2. `/cors-test` エンドポイントでCORS設定を確認
3. ブラウザーの開発者ツールでプリフライトリクエストを確認
4. 必要に応じてサーバーログでCORSデバッグ情報を確認