# AI設定管理モジュール

Chrome拡張機能のAI分析機能で使用する設定とプロンプトを管理するモジュールです。

## 概要

このディレクトリには、AI API ハンドラーで使用される以下の設定ファイルが含まれています：

- **fixed-responses.ts**: 開発モード用の固定レスポンス
- **system-prompts.ts**: OpenAI APIに送信するシステムプロンプト

## ファイル構成

```
ai-config/
├── README.md              # このファイル
├── fixed-responses.ts     # 開発モード用の固定レスポンス設定
└── system-prompts.ts      # AI分析用システムプロンプト設定
```

## fixed-responses.ts

開発モード時に使用される固定のAI分析結果レスポンスを管理します。

### 主な機能

- **テーブルデータ分析用レスポンス**: 構造化されたテーブルデータの分析結果
- **一般的な質問応答用レスポンス**: 汎用的なAI応答
- **データ判定機能**: 入力メッセージからテーブルデータの存在を自動判定

### 使用例

```typescript
import { getFixedResponse } from './fixed-responses';

const messages = [
  { role: 'user', content: 'このテーブルを分析してください' }
];

const response = getFixedResponse(messages);
console.log(response); // テーブル分析用の固定レスポンスが返される
```

### 設定可能な内容

- レスポンステキストの内容
- テーブルデータ判定条件
- 分析結果のフォーマット

## system-prompts.ts

OpenAI APIに送信するシステムプロンプトを管理します。

### 主な機能

- **テーブルデータ分析用プロンプト**: データ分析に特化した指示
- **一般質問応答用プロンプト**: 汎用的な回答指示
- **プライバシー保護プロンプト**: 個人情報保護の追加指示
- **自動プロンプト選択**: 入力内容に基づく適切なプロンプトの自動選択

### 使用例

```typescript
import { getSystemPrompt, detectPromptType, SystemPromptType } from './system-prompts';

const messages = [
  { role: 'user', content: 'テーブルデータを分析してください' }
];

// 自動判定
const promptType = detectPromptType(messages);
const systemPrompt = getSystemPrompt(promptType, true);

// 手動指定
const tablePrompt = getSystemPrompt(SystemPromptType.TABLE_ANALYSIS);
```

### プロンプトタイプ

| タイプ | 説明 | 用途 |
|--------|------|------|
| `TABLE_ANALYSIS` | テーブルデータ分析用 | 構造化データの解析・洞察提供 |
| `GENERAL` | 一般的な質問応答用 | 汎用的なAI会話・サポート |

### 分析観点（TABLE_ANALYSIS）

テーブルデータ分析時には以下の観点から分析を行います：

1. **データの特徴**: データの種類、パターン、分布の特定
2. **傾向分析**: 数値の変化、成長率、相関関係の分析
3. **異常値検出**: 他と大きく異なる値や特異なパターンの特定
4. **ビジネス洞察**: データから読み取れるビジネス上の示唆
5. **推奨事項**: 改善提案や次のアクション

## 設定のカスタマイズ

### 固定レスポンスの変更

`fixed-responses.ts`で以下の定数を変更できます：

```typescript
// テーブル分析用レスポンス
export const TABLE_ANALYSIS_RESPONSE = `カスタムレスポンス内容`;

// 一般応答用レスポンス
export const GENERAL_RESPONSE = `カスタムレスポンス内容`;

// テーブルデータ判定条件
export const TABLE_DATA_INDICATORS = [
  'custom_keyword',
  '特定文字列'
];
```

### システムプロンプトの変更

`system-prompts.ts`で以下の定数を変更できます：

```typescript
// テーブル分析用プロンプト
export const TABLE_ANALYSIS_SYSTEM_PROMPT = `カスタムプロンプト内容`;

// 一般質問応答用プロンプト
export const GENERAL_SYSTEM_PROMPT = `カスタムプロンプト内容`;

// プライバシー保護プロンプト
export const PRIVACY_PROTECTION_PROMPT = `カスタムプライバシー指示`;
```

## 開発・運用時の注意事項

### 開発モード判定

AI API ハンドラーは以下の条件で開発モードを判定します：

```typescript
const isDevelopment = settings.apiKey === 'sk-test-development-api-key-placeholder';
```

### プロンプトの更新時

1. **一貫性の確保**: 分析結果の品質と一貫性を保つため、プロンプトの変更は慎重に行う
2. **テスト実施**: 変更後は必ず動作確認を実施
3. **バックアップ**: 既存のプロンプトをバックアップしてから変更

### セキュリティ考慮事項

- システムプロンプトには機密情報を含めない
- プライバシー保護プロンプトは常に有効にする
- 固定レスポンスにも実際のデータは含めない

## 関連ファイル

- **ai-api-handler.ts**: これらの設定を使用するメインハンドラー
- **packages/ai-api/**: AI分析機能のパッケージ
- **pages/content/**: コンテンツスクリプト（UI表示）

## バージョン情報

- **作成日**: 2025-06-22
- **最終更新**: 2025-06-22
- **作成者**: Chrome Extension Development Team
- **バージョン**: 1.0.0