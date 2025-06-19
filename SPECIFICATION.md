# Chrome Extension - テーブルデータAI分析ツール 製品仕様書

## 概要

このChrome拡張機能は、Webページ上の特定のテーブルデータを読み取り、OpenAI GPTを使用してAI分析を行うReact + TypeScript + Viteベースのモダンな拡張機能です。
Chrome Extensions Manifest V3に対応し、テーブルデータの効率的なAI分析を提供します。

## 基本仕様

### 対応ブラウザ
- Google Chrome (Manifest V3対応版)

### 技術要件
- Node.js >= 22.15.1
- Chrome Extensions Manifest V3
- TypeScript 5.8.3
- React 19.1.0
- OpenAI API (gpt-4o, gpt-4o-mini)
- Vercel AI SDK (@ai-sdk/react 対応)

## 機能仕様

### 1. 拡張機能ページ構成

#### 1.1 Options（設定画面）
- **ファイル**: `pages/options/`
- **機能**:
  - **AIモデル選択**: gpt-4o / gpt-4o-mini の選択
  - **Personal Access Token設定**: OpenAI APIキーの設定
  - **カスタムプロンプト設定**: システムプロンプトの編集（デフォルト値表示）
  - **設定の保存・読み込み**

#### 1.2 Popup（拡張機能アイコンクリック時）
- **ファイル**: `pages/popup/`
- **機能**: 
  - 現在のページでのテーブル検出状況表示
  - AI分析実行ボタン
  - 設定画面への遷移ボタン

### 2. Content Scripts

#### 2.1 テーブル検出・UI注入
- **ファイル**: `pages/content-ui/`
- **機能**:
  - 対象テーブルの検出（`ai-target-table-table`クラス）
  - 分析実行ボタンの注入（テーブルの左側）
  - AI応答結果の吹き出し表示

#### 2.2 テーブルデータ処理
- **ファイル**: `pages/content/`
- **機能**:
  - テーブルデータの読み取り処理
  - AI API通信の管理

### 3. Background Script

#### 3.1 API通信管理
- **ファイル**: `chrome-extension/src/background/`
- **機能**:
  - OpenAI API通信の実行
  - 設定データの管理
  - セキュリティトークンの管理

## テーブル仕様

### 1. 対象テーブル構造
```html
<table class="ai-target-table-table">
  <tbody class="ai-target-table-tbody">
    <tr class="ai-target-table-tr">
      <td class="ai-target-table-td">データ1</td>
      <td class="ai-target-table-td">対象データ1</td> ← 2列目を取得
      <td class="ai-target-table-td">データ3</td>
    </tr>
    <tr class="ai-target-table-tr">
      <td class="ai-target-table-td">データ1</td>
      <td class="ai-target-table-td">対象データ2</td> ← 2列目を取得
      <td class="ai-target-table-td">データ3</td>
    </tr>
    <tr class="ai-target-table-tr">
      <td class="ai-target-table-td">データ1</td>
      <td class="ai-target-table-td">対象データ3</td> ← 2列目を取得
      <td class="ai-target-table-td">データ3</td>
    </tr>
  </tbody>
</table>
```

### 2. データ抽出ルール
- **対象テーブル**: クラス名`ai-target-table-table`の最初のテーブル
- **対象tbody**: クラス名`ai-target-table-tbody`の最初のtbody
- **対象行**: クラス名`ai-target-table-tr`の全てのtr
- **対象列**: 各行の2番目のtd（クラス名`ai-target-table-td`）
- **除外条件**: 中身が空の行は無視

## AI分析仕様

### 1. システムプロンプト
**デフォルト**:
```
以下の3つの項目について、以下の指示に沿って書けているかそれぞれ分析し100文字以内で回答してください。

項目1: {テーブル1行目2列目の内容}
項目2: {テーブル2行目2列目の内容}
項目3: {テーブル3行目2列目の内容}

指示: {ユーザー設定のカスタムプロンプト}
```

### 2. API仕様
- **エンドポイント**: OpenAI Chat Completion API準拠
- **モデル**: gpt-4o / gpt-4o-mini（ユーザー選択）
- **レスポンス形式**: プレーンテキスト
- **文字数制限**: 各項目100文字以内

### 3. UI表示仕様
- **表示位置**: 対応するセル（2列目各行）の右側に吹き出し
- **表示形式**: プレーンテキスト
- **ローディング表示**: AI処理中の視覚的フィードバック

## 操作仕様

### 1. トリガー操作
- **分析ボタン**: テーブル左側に配置されたボタンクリック
- **拡張機能メニュー**: 拡張機能アイコンクリック → 分析実行

### 2. 処理フロー
1. ボタンクリック
2. テーブルデータ抽出（空行除外）
3. AI API呼び出し
4. レスポンス受信
5. 吹き出し表示

## ストレージ仕様

### 1. 設定データ
```typescript
interface AISettings {
  model: 'gpt-4o' | 'gpt-4o-mini';
  apiToken: string;
  customPrompt: string;
  defaultSystemPrompt: string;
}
```

### 2. 分析結果キャッシュ
```typescript
interface AnalysisResult {
  timestamp: number;
  inputData: string[];
  responses: string[];
  model: string;
}
```

## 開発・テスト用仕様

### 1. サンプルHTMLサーバー
- **目的**: 動作確認用
- **テーブル**: 3x3のサンプルテーブル
- **クラス名**: 上記テーブル仕様に準拠
- **内容**: 分析テスト用のサンプルデータ

### 2. モックAPIサーバー
- **形式**: OpenAI API準拠
- **レスポンス**: 入力の最初30文字を利用した簡易分析結果
- **目的**: 開発段階での動作確認

## 権限仕様

### 必要な権限
```json
{
  "permissions": [
    "storage",           // 設定データの保存
    "scripting",         // Content Scriptsの動的注入
    "tabs",              // タブ情報へのアクセス
    "notifications"      // ユーザー通知
  ],
  "host_permissions": [
    "https://api.openai.com/*",  // OpenAI API
    "http://localhost:*"         // 開発用モックAPI
  ]
}
```

## セキュリティ仕様

### 1. APIキー保護
- Chrome拡張機能のセキュアストレージに暗号化保存
- メモリ上での最小限の保持時間
- ログへの出力禁止

### 2. データプライバシー
- テーブルデータの最小限取得
- 分析結果の適切な管理
- 外部への不要なデータ送信禁止

## パフォーマンス仕様

### 1. 応答時間
- テーブル検出: 0.5秒以内
- データ抽出: 0.3秒以内
- AI分析結果表示: APIレスポンス + 0.2秒以内

### 2. メモリ使用量
- Content Scripts: ページあたり最大5MB
- 設定データ: 最大500KB

## 制約事項

### 1. 技術制約
- Chrome Extensions Manifest V3の制限に準拠
- OpenAI API利用制限に依存
- ネットワーク接続必須

### 2. 機能制約
- 1ページあたり1つのテーブルのみ対応
- 最大3行までの分析
- プレーンテキスト形式のみ対応

## 更新履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|----------|
| 1.0.0 | 2024-12-XX | 初期仕様策定（テーブルAI分析機能） |

---

## 注意事項

1. **本仕様書は製品開発の指針となる文書です**
2. **仕様変更時は必ずこのファイルを更新してください**
3. **実装前に仕様の妥当性を確認してください**
4. **OpenAI APIキーの適切な管理を徹底してください**