# AI設定管理モジュール

Chrome拡張機能のAI分析機能で使用する設定とプロンプトを管理するモジュールです。

## 概要

このディレクトリには、AI API ハンドラーで使用される以下の設定ファイルが含まれています：

- **response-generator.ts**: 開発モード用の動的レスポンス生成機能
- **system-prompts.ts**: OpenAI APIに送信するシステムプロンプト

## ファイル構成

```
ai-config/
├── README.md              # このファイル
├── response-generator.ts  # 開発モード用の動的レスポンス生成機能
└── system-prompts.ts      # AI分析用システムプロンプト設定
```

## response-generator.ts

開発モード時に使用される動的AI分析結果レスポンスを生成します。

### 主な機能

- **動的テーブルデータ分析**: 実際のセル内容に基づく個別分析結果生成
- **セル固有レスポンス**: 各セルの内容を参照した具体的分析
- **フォールバック機能**: 固定レスポンスによる安定動作保証
- **データ判定機能**: 入力メッセージからテーブルデータの存在を自動判定

### 使用例

```typescript
import { getFixedResponse, generateDynamicTableResponse } from './response-generator';

// 動的レスポンス生成
const tableData = ['データA', 'データB', 'データC'];
const dynamicResponse = generateDynamicTableResponse(tableData);

// メッセージベースのレスポンス取得
const messages = [
  { role: 'user', content: 'このテーブルを分析してください\nデータ:\n1. 売上実績\n2. 顧客満足度' }
];
const response = getFixedResponse(messages);
```

### 動的生成の特徴

- 実際のテーブルセル内容を解析
- セルごとに個別の評価を生成
- 「〜についてですが、」形式での具体的言及
- 2番目のセルは自動的に「特に問題ありません」

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

### レスポンス生成の設定変更

`response-generator.ts`で以下の設定を変更できます：

```typescript
// 動的分析パターン
const analysisTexts = [
  '良好な品質です',
  '改善の余地があります',
  '注意が必要です',
  '優秀な状態です',
  '標準的なレベルです'
];

// テーブルデータ判定条件
export const TABLE_DATA_INDICATORS = [
  'custom_keyword',
  '特定文字列'
];

// 固定レスポンステンプレート
export const TABLE_ANALYSIS_RESPONSE = `カスタムレスポンス内容`;
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