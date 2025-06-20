# Chrome拡張機能 テーブルデータAI分析ツール - コードツアーガイド

## 🗺️ ツアー全体像

このドキュメントは、Chrome拡張機能のテーブルデータAI分析ツールの全コードを体系的に理解するためのガイドです。

**ツアーの流れ**：
```
1. 📋 開発設定 (基本設定の理解)
2. 🏗️ 拡張機能設定 (Chrome拡張機能の構造)
3. 🧠 Background Script (AI API通信の心臓部)
4. 💾 Storage Layer (設定管理システム)
5. 🎨 UI Components (ユーザーインターフェース)
6. 📄 Content Scripts (ウェブページ内での動作)
7. 🔗 AI API Package (AI分析ロジック)
8. 🧪 Mock API Server (開発用サーバー)
9. 🧪 E2E Tests (テスト)
```

---

## 📋 【STEP 1】開発設定

**現在地**: プロジェクトルート  
**目的**: 開発時の動作設定を理解する

### 読むべきファイル

#### `./dev-config.json`
```json
{
  "apiKey": "sk-test-development-api-key-placeholder",
  "model": "gpt-4o-mini",
  "customPrompt": "以下のテーブルデータを分析して、パターンや傾向を教えてください：",
  "useCustomPrompt": false,
  "_comment": "開発時のデフォルト値です。apiKeyを実際のOpenAI APIキーに置き換えてください。"
}
```

**重要ポイント**:
- `sk-test-development-api-key-placeholder`は開発モードの判定キー
- この値の時は Mock APIサーバー（localhost:3001）を使用
- 実際のOpenAI APIキーを設定すると本番モードに切り替わる
- 開発時のUI設定画面で「開発用設定をロード」ボタンでこの値が読み込まれる

---

## 🏗️ 【STEP 2】拡張機能設定

**現在地**: プロジェクトルート → Chrome拡張機能の核心部分  
**目的**: Chrome拡張機能の全体構造と設定を理解する

### 読むべきファイル

#### `./chrome-extension/manifest.ts`
Chrome Extensions Manifest V3の設定ファイル

**重要な設定項目**:
- **Background Script**: `background.js` (AI API通信担当)
- **Content Scripts**: ウェブページ内でのテーブル検出・UI注入
- **権限**: `storage`, `scripting`, `tabs`, `notifications`, `sidePanel`
- **UI エントリーポイント**:
  - ポップアップ: `popup/index.html`
  - オプション画面: `options/index.html`
  - サイドパネル: `side-panel/index.html`
  - 新しいタブ: `new-tab/index.html`
  - DevTools: `devtools/index.html`

**manifest.tsの利用の流れ**:
1. `manifest.ts` → TypeScriptビルド → `manifest.js`
2. `scripts/generate-manifest.js` が `manifest.js` を読み込み
3. `dist/manifest.json` として出力
4. Chrome拡張機能が `manifest.json` を使用

### ディレクトリ構造と関係性

```
📁 プロジェクトルート/
├── 🏗️ chrome-extension/     # Chrome拡張機能本体
│   ├── manifest.ts          # 拡張機能設定（設計図）
│   ├── src/background/      # Background Script（AI API通信担当）
│   ├── public/             # アイコン、CSS
│   └── utils/              # ビルド用プラグイン
│
├── 📦 packages/            # 共有ライブラリ
│   ├── ai-api/            # AI分析システムの核心
│   ├── storage/           # データ永続化
│   ├── ui/                # 共通UIコンポーネント
│   ├── shared/            # 共通ユーティリティ
│   └── その他...
│
├── 📄 pages/              # UI画面
│   ├── popup/             # ツールバーポップアップ
│   ├── options/           # 設定画面
│   ├── side-panel/        # サイドパネル
│   ├── content/           # ウェブページ内スクリプト
│   ├── content-ui/        # ウェブページ内UI
│   └── その他...
│
├── 🧪 dev-servers/        # 開発用サーバー
│   ├── mock-api/          # Mock APIサーバー
│   └── sample-html/       # テスト用HTMLサーバー
│
└── 🧪 tests/              # テスト
    └── e2e/               # E2Eテスト
```

**依存関係**:
```
chrome-extension (本体)
    ↓ 使用
packages/* (共有ライブラリ)
    ↓ 使用  
pages/* (UI画面)
```

---

## 🧠 【STEP 3】Background Script (AI API通信の心臓部)

**現在地**: Chrome拡張機能本体 → Background Script  
**目的**: AI分析の中核機能を理解する

### 読むべきファイル

#### `./chrome-extension/src/background/index.ts`
Background Scriptのエントリーポイント
```typescript
import 'webextension-polyfill';
import { aiAPIHandler } from './ai-api-handler';
import { exampleThemeStorage } from '@extension/storage';

// AI API ハンドラーを初期化
aiAPIHandler.initialize();
```

#### `./chrome-extension/src/background/ai-api-handler.ts`
AI API通信の実装

**主要機能**:
1. **Content Scriptからのメッセージ受信**
2. **開発/本番モードの自動切り替え**
3. **OpenAI API / Mock API との通信**
4. **エラーハンドリング**

**開発/本番切り替えロジック**:
```typescript
// 開発時はmock-api、本番時はOpenAI APIを使用
const isDevelopment = settings.apiKey === 'sk-test-development-api-key-placeholder';

let client: ReturnType<typeof openai>;
if (isDevelopment) {
  // Mock API サーバーを使用
  console.log('AI Analysis: Mock APIサーバー使用 (http://localhost:3001)');
  client = openai({
    apiKey: 'mock-api-key',
    baseURL: 'http://localhost:3001/v1',
  });
} else {
  // OpenAI API を使用
  console.log('AI Analysis: OpenAI API使用');
  client = openai({
    apiKey: settings.apiKey,
  });
}
```

**AI分析実行**:
```typescript
const result = await generateText({
  model: client(settings.model),
  messages: message.data.messages.map(msg => ({
    role: msg.role as 'system' | 'user' | 'assistant',
    content: msg.content,
  })),
  temperature: settings.temperature || 0.7,
  maxTokens: settings.maxTokens || 1000,
});
```

---

## 💾 【STEP 4】Storage Layer (設定管理システム)

**現在地**: 共有パッケージ → Storage  
**目的**: AI設定の永続化機能を理解する

### 読むべきファイル

#### `./packages/storage/lib/types.ts`
型定義
```typescript
export interface AISettings {
  apiKey: string;
  model: 'gpt-4o' | 'gpt-4o-mini';
  customPrompt?: string;
  useCustomPrompt: boolean;
}

export interface AnalysisResult {
  content: string;
  timestamp: Date;
  model: string;
  promptUsed: string;
  tableData?: string[];
}
```

#### `./packages/storage/lib/ai-settings-storage.ts`
AI設定専用ストレージ

**主要機能**:
- **Chrome Local Storage** を使用した設定永続化
- **リアルタイム更新** (`liveUpdate: true`)
- **シリアライゼーション** (JSON形式)
- **エラーハンドリング** (デフォルト値へのフォールバック)

```typescript
export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  model: 'gpt-4o-mini',
  customPrompt: '',
  useCustomPrompt: false,
  ...getDevConfig(),
};

export const aiSettingsStorage = createAISettingsStorage();
```

#### `./packages/storage/lib/base/`
ストレージ基盤システム
- `base.ts`: ストレージの基本実装
- `enums.ts`: ストレージ種別（Local/Session）
- `types.ts`: 基本型定義

---

## 🎨 【STEP 5】UI Components (ユーザーインターフェース)

**現在地**: UI画面群  
**目的**: ユーザーとの接点を理解する

### 5.1 ポップアップ (`./pages/popup/`)

#### `./pages/popup/src/Popup.tsx`
ツールバーのポップアップUI

**主要機能**:
- 拡張機能の基本情報表示
- 各画面への遷移リンク
- シンプルなエントリーポイント

### 5.2 設定画面 (`./pages/options/`)

#### `./pages/options/src/Options.tsx`
拡張機能の設定画面メイン

#### `./pages/options/src/AISettingsOptions.tsx`
AI設定専用コンポーネント

**主要機能**:
- **API キー設定**
- **AI モデル選択**
- **カスタムプロンプト設定**
- **開発用設定ロード機能**

```typescript
// 開発用設定をロードする機能
const loadDevConfig = async () => {
  try {
    const response = await fetch('/dev-config.json');
    const config = await response.json();
    
    await aiSettingsStorage.set({
      apiKey: config.apiKey,
      model: config.model,
      customPrompt: config.customPrompt || '',
      useCustomPrompt: config.useCustomPrompt || false,
    });
    
    setMessage('開発用設定をロードしました');
  } catch (error) {
    setMessage('開発用設定のロードに失敗しました');
  }
};
```

### 5.3 サイドパネル (`./pages/side-panel/`)

#### `./pages/side-panel/src/SidePanel.tsx`
Chrome拡張機能のサイドパネル

**主要機能**:
- **タブ式UI** (「AI分析」「設定」)
- **AI分析実行**
- **設定画面の統合**
- **リアルタイム設定更新**

**タブ構造**:
```typescript
const tabs = [
  { id: 'analysis', label: 'AI分析', icon: '🧠' },
  { id: 'settings', label: '設定', icon: '⚙️' },
];
```

### 5.4 共通UIコンポーネント (`./packages/ui/`)

#### `./packages/ui/lib/components/`
- **LoadingSpinner.tsx**: ローディング表示
- **ToggleButton.tsx**: トグルボタン
- **error-display/**: エラー表示系コンポーネント群

---

## 📄 【STEP 6】Content Scripts (ウェブページ内での動作)

**現在地**: ウェブページ内実行スクリプト  
**目的**: テーブル検出とAI分析実行機能を理解する

### 6.1 基本Content Script (`./pages/content/`)

#### `./pages/content/src/table-detection.ts`
ウェブページ内のテーブル検出機能

**主要機能**:
- **HTMLテーブル要素の検出**
- **テーブルデータの抽出**
- **データの正規化**

```typescript
/**
 * ページ内の全てのテーブルを検出する
 */
export const detectTables = (): HTMLTableElement[] => {
  const tables = document.querySelectorAll('table');
  return Array.from(tables).filter(table => {
    // 最小行数・列数のチェック
    const rows = table.querySelectorAll('tr');
    return rows.length >= 2; // ヘッダー + データ行
  });
};

/**
 * テーブルからデータを抽出する
 */
export const extractTableData = (table: HTMLTableElement): string[] => {
  const rows = table.querySelectorAll('tr');
  const data: string[] = [];
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td, th');
    const rowData = Array.from(cells).map(cell => cell.textContent?.trim() || '');
    data.push(rowData.join('\t'));
  });
  
  return data;
};
```

#### `./pages/content/src/ai-analysis.ts`
Content Script内でのAI分析実行

**主要機能**:
- **Background Scriptとの通信**
- **AI分析リクエストの送信**
- **エラーハンドリング**
- **進捗管理**

```typescript
/**
 * テーブルデータのAI分析を実行
 */
export const analyzeTableData = async (
  tableData: string[], 
  options: AnalysisOptions = {}
): Promise<AnalysisResult> => {
  
  // 1. データ検証
  if (!tableData || tableData.length === 0) {
    throw createAnalysisError(AnalysisErrorType.INVALID_SETTINGS, '分析対象のデータが指定されていません');
  }

  // 2. AI設定の取得
  const settings = await aiSettingsStorage.get();
  if (!settings.apiKey || settings.apiKey.trim().length === 0) {
    throw createAnalysisError(AnalysisErrorType.NO_API_KEY, 'OpenAI APIキーが設定されていません');
  }

  // 3. Background Scriptとの通信
  const response = await sendChromeMessage({
    type: 'AI_ANALYSIS_REQUEST',
    data: {
      messages: [{ role: 'user', content: buildAnalysisPrompt(tableData) }],
      settings: {
        apiKey: settings.apiKey,
        model: settings.model,
        temperature: 0.7,
        maxTokens: 1000,
      },
    },
  });

  return {
    text: response.data.text,
    usage: response.data.usage,
    processingTime: response.data.processingTime,
  };
};
```

#### `./pages/content/src/ui-injection.ts`
ウェブページへのUI注入機能

**主要機能**:
- **AI分析ボタンの追加**
- **結果表示UI の注入**
- **Shadow DOM を使用した分離**

### 6.2 Content UI (`./pages/content-ui/`)

React コンポーネントをウェブページに注入するためのスクリプト群

#### `./pages/content-ui/src/matches/all/App.tsx`
全ページ対象のUI注入

#### `./pages/content-ui/src/matches/example/App.tsx`
特定サイト専用のUI注入

---

## 🔗 【STEP 7】AI API Package (AI分析ロジック)

**現在地**: 共有パッケージ → AI API  
**目的**: AI分析システムの詳細を理解する

### 7.1 OpenAI クライアント (`./packages/ai-api/lib/client/`)

#### `./packages/ai-api/lib/client/openai-client.ts`
OpenAI API通信クライアント

**主要機能**:
- **HTTPリクエスト処理**
- **エラーハンドリング**
- **レスポンス正規化**
- **リトライ機能**

#### `./packages/ai-api/lib/client/api-types.ts`
API型定義

### 7.2 React フック (`./packages/ai-api/lib/hooks/`)

#### `./packages/ai-api/lib/hooks/use-ai-settings.ts`
AI設定管理フック

```typescript
export const useAISettings = () => {
  const [settings, setSettings] = useState<AISettings>(DEFAULT_AI_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Chrome Storage との同期
  useEffect(() => {
    const unsubscribe = aiSettingsStorage.subscribe(() => {
      const newSettings = aiSettingsStorage.getSnapshot();
      if (newSettings) {
        setSettings(newSettings);
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return { settings, setSettings, isLoading };
};
```

#### `./packages/ai-api/lib/hooks/use-analysis.ts`
AI分析実行フック

**主要機能**:
- **@ai-sdk/react との統合**
- **Chrome拡張機能メッセージング**
- **分析状態管理**

### 7.3 ビジネスロジック (`./packages/ai-api/lib/services/`)

#### `./packages/ai-api/lib/services/prompt-service.ts`
プロンプト構築サービス

**主要機能**:
- **テーブルデータのプロンプト化**
- **カスタムプロンプトの統合**
- **コンテキスト最適化**

```typescript
/**
 * テーブルデータ分析用のプロンプトを構築
 */
export const buildAnalysisPrompt = (
  tableData: string[], 
  customPrompt?: string
): string => {
  const basePrompt = customPrompt || 
    "以下のテーブルデータを分析して、パターンや傾向を教えてください：";
  
  const dataSection = tableData.join('\n');
  
  return `${basePrompt}\n\n${dataSection}\n\n分析をお願いします。`;
};
```

### 7.4 ユーティリティ (`./packages/ai-api/lib/utils/`)

#### `./packages/ai-api/lib/utils/error-handler.ts`
エラーハンドリングシステム

**エラー分類**:
- **認証エラー** (401, 403)
- **レート制限** (429)
- **サーバーエラー** (500系)
- **ネットワークエラー**
- **クォータ超過**

#### `./packages/ai-api/lib/utils/message-utils.ts`
Chrome拡張機能メッセージングユーティリティ

**主要機能**:
- **メッセージ送信/受信**
- **型安全なメッセージング**
- **エラーハンドリング**
- **ログの機密情報除去**

### 7.5 型定義 (`./packages/ai-api/lib/types/`)

#### `./packages/ai-api/lib/types/analysis.ts`
分析関連の型定義

```typescript
export interface AnalysisResult {
  id: string;
  content: string;
  timestamp: Date;
  model: string;
  inputData: string[];
  processingTime: number;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChromeMessage<T = unknown> {
  type: string;
  data: T;
  requestId: string;
}

export interface ChromeMessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
  requestId: string;
}
```

---

## 🧪 【STEP 8】Mock API Server (開発用サーバー)

**現在地**: 開発用サーバー  
**目的**: 開発時のAI API代替システムを理解する

### 読むべきファイル

#### `./dev-servers/mock-api/server.js`
Mock APIサーバーの実装

**主要機能**:
- **OpenAI API互換エンドポイント**
- **CORS設定** (Chrome拡張機能対応)
- **Swagger UI** (`/docs`)
- **固定レスポンス** (開発用)

```javascript
// OpenAI Chat Completions API 互換エンドポイント
app.post('/v1/chat/completions', (req, res) => {
  const { messages, model = 'gpt-4o-mini', temperature = 0.7 } = req.body;
  
  // モック分析結果を生成
  const analysisResult = generateMockAnalysis(messages);
  
  res.json({
    id: `chatcmpl-mock-${Date.now()}`,
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: model,
    choices: [{
      index: 0,
      message: {
        role: 'assistant',
        content: analysisResult
      },
      finish_reason: 'stop'
    }],
    usage: {
      prompt_tokens: 50,
      completion_tokens: 100,
      total_tokens: 150
    }
  });
});
```

#### `./dev-servers/mock-api/openapi.yaml`
OpenAPI 3.0.3 仕様書

**主要定義**:
- **Chat Completions API**
- **リクエスト/レスポンス スキーマ**
- **エラーレスポンス**
- **認証方法**

#### `./dev-servers/mock-api/swagger-ui.html`
Swagger UI インターフェース

**アクセス**: `http://localhost:3001/docs`

#### `./dev-servers/mock-api/postman-collection.json`
Postman テストコレクション

**テスト項目**:
- **正常系API呼び出し**
- **エラーケース**
- **レスポンス検証**

#### `./dev-servers/sample-html/server.js`
テスト用HTMLサーバー

**提供コンテンツ**:
- **サンプルテーブル** (E2Eテスト用)
- **テストページ**

---

## 🧪 【STEP 9】E2E Tests (テスト)

**現在地**: テスト → E2Eテスト  
**目的**: 自動テストシステムを理解する

### 読むべきファイル

#### `./tests/e2e/config/wdio.conf.ts`
WebDriverIO設定

**主要設定**:
- **Chrome/Firefox対応**
- **拡張機能ロード**
- **テスト並列実行**
- **スクリーンショット**

#### `./tests/e2e/specs/` (テストファイル群)

**主要テスト**:

##### `ai-analysis.test.ts`
AI分析機能のテスト
```typescript
describe('AI分析機能', () => {
  it('設定画面でAPIキーを設定できる', async () => {
    await browser.url('chrome-extension://[ID]/options/index.html');
    
    const apiKeyInput = await $('[data-testid="api-key-input"]');
    await apiKeyInput.setValue('test-api-key');
    
    const saveButton = await $('[data-testid="save-button"]');
    await saveButton.click();
    
    // 保存確認
    const message = await $('[data-testid="save-message"]');
    await expect(message).toHaveText('設定を保存しました');
  });

  it('Mock APIサーバーとの通信ができる', async () => {
    // Mock API分析のテスト
    await browser.url('http://localhost:3002/table-sample.html');
    
    const analyzeButton = await $('[data-testid="analyze-button"]');
    await analyzeButton.click();
    
    // 分析結果の確認
    const result = await $('[data-testid="analysis-result"]');
    await expect(result).toBeDisplayed();
  });
});
```

##### その他のテストファイル:
- `page-popup.test.ts`: ポップアップのテスト
- `page-options.test.ts`: 設定画面のテスト
- `page-side-panel.test.ts`: サイドパネルのテスト
- `page-content.test.ts`: Content Scriptのテスト
- `smoke.test.ts`: 基本動作確認

#### `./tests/e2e/helpers/`
テストヘルパー関数

##### `ai-analysis-helpers.ts`
AI分析テスト用のヘルパー関数
```typescript
export const setupMockApiMode = async () => {
  // 開発用設定をロード
  await loadDevConfig();
  
  // Mock APIサーバーの起動確認
  await waitForMockApiServer();
};

export const performTableAnalysis = async (tableSelector: string) => {
  const table = await $(tableSelector);
  await table.waitForDisplayed();
  
  const analyzeButton = await $('[data-testid="analyze-button"]');
  await analyzeButton.click();
  
  // 分析完了まで待機
  await browser.waitUntil(async () => {
    const result = await $('[data-testid="analysis-result"]');
    return await result.isDisplayed();
  }, { timeout: 10000 });
};
```

#### `./scripts/start-e2e-servers.sh`
E2Eテスト用サーバー起動スクリプト

**起動サーバー**:
1. **Mock APIサーバー** (localhost:3001)
2. **Sample HTMLサーバー** (localhost:3002)

---

## 🔧 【APPENDIX】開発・ビルドシステム

### 主要なpackage.jsonコマンド

```json
{
  "scripts": {
    "dev": "pnpm set-global-env CLI_CEB_DEV=true && pnpm base-dev",
    "build": "pnpm set-global-env && pnpm base-build",
    "type-check": "turbo type-check",
    "lint": "turbo lint",
    "e2e": "bash scripts/start-e2e-servers.sh && pnpm zip && turbo e2e",
    "zip": "pnpm build && pnpm -F zipper zip"
  }
}
```

### Turborepo設定 (`./turbo.json`)

**並列実行設定**:
- **type-check**: 型チェック
- **build**: ビルド
- **dev**: 開発モード
- **e2e**: E2Eテスト

### 環境変数管理

#### `./bash-scripts/set_global_env.sh`
グローバル環境変数の設定

**主要な環境変数**:
- `CLI_CEB_DEV`: 開発モードフラグ
- `CLI_CEB_FIREFOX`: Firefox対応フラグ

---

## 🎯 理解のポイント

### 1. アーキテクチャの理解
- **Monorepo構成**: Turborepoによる効率的な開発
- **Chrome Extensions Manifest V3**: 最新のセキュリティモデル
- **Background Script集中管理**: API通信のセキュリティ確保

### 2. 開発体験の工夫
- **Mock APIサーバー**: 開発時のOpenAI API代替
- **ホットリロード**: HMRパッケージによる高速開発
- **TypeScript**: 型安全性の確保

### 3. テスト戦略
- **E2Eテスト**: WebDriverIOによる実ブラウザテスト
- **単体テスト**: Vitestによる高速テスト
- **Postman**: API統合テスト

### 4. 本番運用
- **設定管理**: Chrome Local Storageによる永続化
- **エラーハンドリング**: 包括的なエラー分類と処理
- **セキュリティ**: APIキーの安全な管理

---

## 🚀 次のステップ

このツアーを完了したら、以下を試してみてください：

1. **開発環境の構築**:
   ```bash
   pnpm install
   pnpm dev
   ```

2. **Mock APIでの動作確認**:
   - 設定画面で「開発用設定をロード」
   - サンプルページでAI分析実行

3. **E2Eテストの実行**:
   ```bash
   pnpm e2e
   ```

4. **新機能の追加**:
   - 新しいAI分析機能
   - UI改善
   - テストケース追加

---

**🎉 ツアー完了！これで全コードの理解ができました。**