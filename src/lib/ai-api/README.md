# @extension/ai-api

AI API統合パッケージ - Chrome拡張機能向けAI分析機能を提供するReactフックとユーティリティライブラリです。

## 概要

このパッケージは、`@ai-sdk/react`を基盤として、Chrome拡張機能内でのテーブルデータAI分析に特化したインターフェースを提供します。OpenAI APIとの統合、エラーハンドリング、Chrome拡張機能特有のメッセージング機能を含みます。

## 主要機能

- **AI分析フック**: `useAnalysis` - テーブルデータの分析を行うReactフック
- **AI設定フック**: `useAISettings` - OpenAI APIキーなどの設定管理
- **プロンプトサービス**: 分析用プロンプトの構築と検証
- **メッセージユーティリティ**: Chrome拡張機能内でのメッセージング
- **エラーハンドリング**: API呼び出し時のエラー処理とリトライ機能

## インストール

このパッケージは内部パッケージのため、プロジェクトのワークスペース設定により自動的に利用可能です。

## 使用方法

### AI分析フック

```typescript
import { useAnalysis } from '@extension/ai-api';

export function TableAnalyzer() {
  const { analyzeTableData, isAnalyzing, latestResult, error } = useAnalysis({
    onAnalysisComplete: (result) => {
      console.log('分析完了:', result);
    },
    onError: (error) => {
      console.error('分析エラー:', error);
    }
  });

  const handleAnalyze = async (tableRows: string[]) => {
    await analyzeTableData(tableRows);
  };

  return (
    <div>
      {isAnalyzing && <p>分析中...</p>}
      {error && <p>エラー: {error.message}</p>}
      {latestResult && <p>結果: {latestResult}</p>}
    </div>
  );
}
```

### AI設定フック

```typescript
import { useAISettings, isAISettingsAvailable } from '@extension/ai-api';

export function SettingsPanel() {
  const { settings, updateSettings, isLoading } = useAISettings();

  if (!isAISettingsAvailable()) {
    return <p>設定が利用できません</p>;
  }

  return (
    <div>
      <input
        value={settings?.apiKey || ''}
        onChange={(e) => updateSettings({ apiKey: e.target.value })}
        placeholder="OpenAI APIキー"
      />
    </div>
  );
}
```

### プロンプトサービス

```typescript
import { buildAnalysisPrompt, validatePrompt } from '@extension/ai-api';

// 基本的な分析プロンプトの構築
const prompt = buildAnalysisPrompt({
  tableData: ['name,age', 'John,25', 'Jane,30'],
  analysisType: 'summary'
});

// プロンプトの検証
if (validatePrompt(prompt)) {
  console.log('有効なプロンプト');
}
```

## API リファレンス

### Hooks

#### useAnalysis(options?)

テーブルデータのAI分析を行うフック。

**パラメータ:**
- `options.onAnalysisComplete?: (result: AnalysisResult) => void` - 分析完了時のコールバック
- `options.onError?: (error: Error) => void` - エラー発生時のコールバック
- `options.onAnalysisStart?: () => void` - 分析開始時のコールバック

**戻り値:**
- `analyzeTableData: (tableData: string[]) => Promise<void>` - 分析実行関数
- `isAnalyzing: boolean` - 分析実行中フラグ
- `analysisMessages: Array<{role: string; content: string}>` - メッセージ履歴
- `latestResult: string | null` - 最新の分析結果
- `error: Error | null` - エラー情報
- `resetAnalysis: () => void` - 分析状態リセット関数

#### useAISettings()

AI設定（APIキーなど）の管理を行うフック。

**戻り値:**
- `settings: AISettings | null` - 現在の設定
- `updateSettings: (updates: Partial<AISettings>) => Promise<void>` - 設定更新関数
- `isLoading: boolean` - 読み込み中フラグ

### Services

#### buildAnalysisPrompt(options)

分析用プロンプトを構築します。

**パラメータ:**
- `options.tableData: string[]` - テーブルデータ
- `options.analysisType?: string` - 分析タイプ
- `options.customPrompt?: string` - カスタムプロンプト

**戻り値:** `PromptBuildResult`

### Utils

#### sendChromeMessage(message, options?)

Chrome拡張機能内でメッセージを送信します。

**パラメータ:**
- `message: ChromeMessage` - 送信するメッセージ
- `options?: MessageOptions` - オプション設定

**戻り値:** `Promise<ChromeMessageResponse>`

## 依存関係

### 主要依存関係
- `@ai-sdk/openai`: OpenAI APIクライアント
- `@ai-sdk/react`: React用AI SDKフック
- `react`: Reactフレームワーク
- `@extension/shared`: 共通ユーティリティ
- `@extension/storage`: ストレージ管理

### 開発依存関係
- `typescript`: TypeScript型チェック
- `vitest`: テストフレームワーク
- `@testing-library/react`: Reactコンポーネントテスト
- `@vitest/coverage-v8`: テストカバレッジ

## ディレクトリ構造

```
packages/ai-api/
├── lib/
│   ├── client/              # APIクライアント
│   │   ├── api-types.ts     # API型定義
│   │   └── openai-client.ts # OpenAIクライアント実装
│   ├── hooks/               # Reactフック
│   │   ├── use-ai-settings.ts # AI設定フック
│   │   └── use-analysis.ts    # AI分析フック
│   ├── services/            # サービス層
│   │   └── prompt-service.ts  # プロンプト構築サービス
│   ├── types/               # 型定義
│   │   └── analysis.ts      # 分析関連型定義
│   ├── utils/               # ユーティリティ
│   │   ├── error-handler.ts # エラーハンドリング
│   │   └── message-utils.ts # メッセージングユーティリティ
│   └── index.ts             # メインエクスポート
├── tests/                   # テストファイル
│   ├── client/
│   ├── hooks/
│   ├── services/
│   └── utils/
├── package.json
└── tsconfig.json
```

## テスト

```bash
# テスト実行（ルートから統合ワークスペースで実行）
pnpm test --project ai-api

# 個別パッケージ内でのテスト実行
pnpm test

# ウォッチモードでテスト実行
pnpm test:watch

# カバレッジ付きテスト実行
pnpm test:coverage
```

注意: プロジェクトはVitest統合ワークスペース設定を使用しており、ルートディレクトリから全プロジェクトの統合テストが実行できます。

## ビルド

```bash
# TypeScriptコンパイル
pnpm build

# 開発モード（ウォッチ）
pnpm dev

# 型チェック
pnpm type-check

# Lint実行
pnpm lint
```

## 型定義

このパッケージはフル型サポートを提供しており、TypeScriptプロジェクトで安全に使用できます。主要な型定義は以下の通りです：

- `AnalysisResult`: 分析結果の型
- `TableAnalysisRequest`: テーブル分析リクエストの型  
- `APIError`: APIエラーの型
- `ChromeMessage`: Chrome拡張機能メッセージの型

## 注意事項

- このパッケージは Chrome拡張機能の Context で使用することを前提として設計されています
- OpenAI APIキーが必要です（`@extension/storage`で管理）
- Chrome拡張機能のManifest V3に対応しています
- React 19.1.0以上が必要です

## ライセンス

このパッケージはプライベートパッケージです。