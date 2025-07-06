# Storage Package

Chrome拡張機能のストレージ管理を担当するパッケージです。Chrome Storage APIの型安全なラッパーとAI設定の永続化機能を提供します。

## 概要

このパッケージは以下の機能を提供します：

- **Chrome Storage APIラッパー**: 型安全なストレージ操作
- **AI設定管理**: OpenAI APIキーやモデル設定の永続化
- **リアクティブストレージ**: 設定変更のリアルタイム反映
- **シリアライゼーション**: カスタムデータ変換機能

## ディレクトリ構成

```
lib/
├── base/
│   ├── base.ts                    # 基本ストレージ実装
│   ├── enums.ts                   # ストレージ種別定義
│   ├── index.ts                   # 基本機能エクスポート
│   └── types.ts                   # 基本型定義
├── impl/
│   ├── exampleThemeStorage.ts     # テーマ設定サンプル
│   └── index.ts                   # 実装エクスポート
├── ai-settings-storage.ts         # AI設定ストレージ
├── index.ts                       # パッケージエントリーポイント
└── types.ts                       # 型定義
```

## 主要機能

### 1. AI設定管理 (`ai-settings-storage.ts`)

```typescript
import { aiSettingsStorage, useStorage } from '@extension/storage';

// AI設定の取得
const settings = await aiSettingsStorage.get();
console.log('現在の設定:', settings);

// AI設定の更新
await aiSettingsStorage.set({
  apiKey: 'your-openai-api-key',
  model: 'gpt-4o',
  customPrompt: 'カスタムプロンプト',
  useCustomPrompt: true
});

// Reactフックでの使用（リアクティブ）
const Component = () => {
  const storage = useStorage(aiSettingsStorage);

  return (
    <div>
      <p>現在のモデル: {storage.model}</p>
      <button onClick={() => aiSettingsStorage.set({
        ...storage,
        model: 'gpt-4o'
      })}>
        モデルを変更
      </button>
    </div>
  );
};
```

### 2. 基本ストレージ操作

```typescript
import { createStorage, StorageEnum } from '@extension/storage';

// カスタムストレージの作成
interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
}

const userStorage = createStorage<UserSettings>('user-settings', {
  theme: 'light',
  language: 'ja'
}, {
  storageEnum: StorageEnum.Sync, // Chrome Sync Storage使用
  liveUpdate: true
});

// 設定の取得・更新
const settings = await userStorage.get();
await userStorage.set({ ...settings, theme: 'dark' });
```

## 利用可能なAPI

### AI設定関連

```typescript
// AI設定ストレージインスタンス
export const aiSettingsStorage: BaseStorageType<AISettings>

// デフォルト設定
export const DEFAULT_AI_SETTINGS: AISettings

// AI設定の型定義
export interface AISettings {
  apiKey: string;
  model: 'gpt-4o' | 'gpt-4o' | 'gpt-4o';
  customPrompt?: string;
  useCustomPrompt: boolean;
}

// 分析結果の型定義
export interface AnalysisResult {
  content: string;
  timestamp: Date;
  model: string;
  promptUsed: string;
  tableData?: string[];
}
```

### ストレージ作成

```typescript
// ストレージファクトリー関数
export function createStorage<T>(
  key: string,
  defaultValue: T,
  options?: StorageOptions
): BaseStorageType<T>

// ストレージ種別
export enum StorageEnum {
  Local = 'local',        // ローカルストレージ
  Sync = 'sync',          // 同期ストレージ
  Session = 'session',    // セッションストレージ
  Managed = 'managed'     // 管理されたストレージ
}
```

### Reactフック

```typescript
// リアクティブストレージフック
export function useStorage<T>(storage: BaseStorageType<T>): T

// 使用例
const settings = useStorage(aiSettingsStorage);
```

## 設定オプション

### StorageOptions

```typescript
interface StorageOptions {
  storageEnum?: StorageEnum;           // ストレージ種別
  liveUpdate?: boolean;                // リアルタイム更新
  serialization?: {                    // カスタムシリアライゼーション
    serialize: (value: T) => string;
    deserialize: (text: string) => T;
  };
}
```

### ストレージ種別の選択

- **Local**: ローカルデバイスのみ、大容量
- **Sync**: Googleアカウント間で同期、制限あり
- **Session**: セッション中のみ有効
- **Managed**: 企業ポリシーで管理

## 使用例

### 基本的な使用パターン

```typescript
import { aiSettingsStorage } from '@extension/storage';

// Options画面での設定保存
export const saveAISettings = async (newSettings: Partial<AISettings>) => {
  const currentSettings = await aiSettingsStorage.get();
  await aiSettingsStorage.set({
    ...currentSettings,
    ...newSettings
  });
};

// Background Scriptでの設定取得
export const getAPIKey = async (): Promise<string> => {
  const settings = await aiSettingsStorage.get();
  return settings.apiKey;
};

// Content Scriptでの設定確認
export const isCustomPromptEnabled = async (): Promise<boolean> => {
  const settings = await aiSettingsStorage.get();
  return settings.useCustomPrompt;
};
```

### エラーハンドリング

```typescript
try {
  const settings = await aiSettingsStorage.get();
  console.log('設定を取得しました:', settings);
} catch (error) {
  console.error('設定の取得に失敗:', error);
  // デフォルト設定を使用
  const defaultSettings = DEFAULT_AI_SETTINGS;
}
```

### カスタムシリアライゼーション

```typescript
const dateStorage = createStorage('last-analysis', new Date(), {
  storageEnum: StorageEnum.Local,
  serialization: {
    serialize: (date: Date) => date.toISOString(),
    deserialize: (str: string) => new Date(str)
  }
});
```

## 開発・テスト

### テスト実行

```bash
# 全テストを実行
pnpm test

# カバレッジ付きテスト
pnpm test:coverage

# ウォッチモードでテスト実行
pnpm test:watch
```

### テストカバレッジ

現在のテストカバレッジ: **82.42%**

- **Statement Coverage**: 82.42%
- **Branch Coverage**: 84.09%
- **Function Coverage**: 78.94%

### テストファイル

- `ai-settings-storage.spec.ts`: AI設定ストレージのテスト
- `storage-integration.spec.ts`: 統合テスト
- `types.spec.ts`: 型定義のテスト
- `basic-coverage.spec.ts`: 基本機能カバレッジテスト

## Chrome拡張機能での使用

### Manifest権限

```json
{
  "permissions": [
    "storage"
  ]
}
```

### 各コンテキストでの使用

```typescript
// Background Script
import { aiSettingsStorage } from '@extension/storage';

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'GET_API_KEY') {
    const settings = await aiSettingsStorage.get();
    sendResponse({ apiKey: settings.apiKey });
  }
});

// Options Page (React)
import { useStorage, aiSettingsStorage } from '@extension/storage';

const OptionsPage = () => {
  const settings = useStorage(aiSettingsStorage);

  const handleSave = async (newSettings: Partial<AISettings>) => {
    await aiSettingsStorage.set({ ...settings, ...newSettings });
  };

  return <SettingsForm settings={settings} onSave={handleSave} />;
};

// Content Script
import { aiSettingsStorage } from '@extension/storage';

const performAnalysis = async () => {
  const { model, apiKey } = await aiSettingsStorage.get();
  // AI分析を実行
};
```

## パフォーマンス考慮事項

### ベストプラクティス

1. **頻繁な更新を避ける**: バッチで更新処理を実行
2. **適切なストレージ種別を選択**: 用途に応じてLocal/Syncを使い分け
3. **大きなデータの分割**: 大容量データは分割して保存

### Chrome Storage制限

- **Local Storage**: ~5MB
- **Sync Storage**: ~100KB（アイテムあたり~8KB）
- **Session Storage**: RAM依存

## 依存関係

- `@extension/shared`: 共通型定義とユーティリティ

## トラブルシューティング

### よくある問題

1. **ストレージクォータ超過**

   ```typescript
   // エラーハンドリング例
   try {
     await storage.set(largeData);
   } catch (error) {
     if (error.message.includes('QUOTA_BYTES')) {
       // データサイズを削減
     }
   }
   ```

2. **同期エラー**

   ```typescript
   // Sync Storageの制限確認
   const info = await chrome.storage.sync.getBytesInUse();
   if (info > chrome.storage.sync.QUOTA_BYTES * 0.8) {
     console.warn('Syncストレージが80%を超えています');
   }
   ```

3. **デシリアライゼーションエラー**

   ```typescript
   // 安全なデシリアライゼーション
   const storage = createStorage('data', defaultValue, {
     serialization: {
       serialize: JSON.stringify,
       deserialize: (text) => {
         try {
           return JSON.parse(text);
         } catch {
           return defaultValue; // フォールバック
         }
       }
     }
   });
   ```

## 関連ドキュメント

- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [Options画面パッケージ](../../pages/options/README.md)
- [Content Scriptパッケージ](../../pages/content/README.md)
