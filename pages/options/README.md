# Options Page Package

Chrome拡張機能のオプション設定画面を担当するパッケージです。AI分析ツールの設定管理UIを提供します。

## 概要

このパッケージは以下の機能を提供します：

- **AI設定管理UI**: OpenAI APIキー、モデル選択、プロンプト設定
- **リアルタイム設定反映**: 設定変更の即座な反映
- **フォームバリデーション**: 入力値の検証とエラー表示
- **レスポンシブデザイン**: デスクトップ・モバイル対応

## ディレクトリ構成

```
src/
├── AISettingsOptions.tsx         # AI設定コンポーネント
├── AISettingsOptions.spec.tsx    # AI設定コンポーネントテスト
├── Options.tsx                   # メインオプション画面
├── Options.css                   # スタイルシート
├── index.tsx                     # エントリーポイント
└── index.css                     # グローバルスタイル
```

## 主要機能

### 1. AI設定管理 (`AISettingsOptions.tsx`)

```typescript
import { AISettingsOptions } from './AISettingsOptions';

// AI設定画面コンポーネント
const OptionsPage = () => {
  return (
    <div>
      <h1>拡張機能設定</h1>
      <AISettingsOptions />
    </div>
  );
};
```

**提供機能:**
- OpenAI APIキー設定
- モデル選択（GPT-3.5, GPT-4, GPT-4 Turbo）
- カスタムプロンプト設定
- デフォルトプロンプト表示
- 設定の保存・読み込み

### 2. 設定項目

#### API設定
- **APIキー**: OpenAI APIキーの設定（マスク表示）
- **モデル選択**: 利用するGPTモデルの選択
- **接続テスト**: API接続の確認機能

#### プロンプト設定
- **カスタムプロンプト**: 独自の分析プロンプト設定
- **デフォルトプロンプト**: システム標準プロンプトの表示
- **プロンプト切り替え**: カスタム/デフォルトの選択

## 使用方法

### コンポーネントの使用

```typescript
import React from 'react';
import { AISettingsOptions } from './AISettingsOptions';

const SettingsPage = () => {
  return (
    <div className="settings-container">
      <header>
        <h1>テーブルデータAI分析ツール設定</h1>
      </header>
      
      <main>
        <AISettingsOptions />
      </main>
    </div>
  );
};

export default SettingsPage;
```

### 設定データの管理

```typescript
import { useStorage, aiSettingsStorage } from '@extension/storage';

const MyComponent = () => {
  // リアクティブな設定データ取得
  const settings = useStorage(aiSettingsStorage);
  
  // 設定の更新
  const updateSettings = async (newSettings: Partial<AISettings>) => {
    await aiSettingsStorage.set({
      ...settings,
      ...newSettings
    });
  };
  
  return (
    <div>
      <p>現在のモデル: {settings.model}</p>
      <button onClick={() => updateSettings({ model: 'gpt-4' })}>
        GPT-4に変更
      </button>
    </div>
  );
};
```

## 設定項目詳細

### AISettings型定義

```typescript
interface AISettings {
  apiKey: string;                                    // OpenAI APIキー
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo'; // 使用モデル
  customPrompt?: string;                             // カスタムプロンプト
  useCustomPrompt: boolean;                          // カスタムプロンプト使用フラグ
}
```

### デフォルト設定

```typescript
const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  model: 'gpt-3.5-turbo',
  customPrompt: '',
  useCustomPrompt: false,
};
```

## UI設計

### レスポンシブデザイン

```css
/* モバイル対応 */
@media (max-width: 768px) {
  .settings-form {
    padding: 16px;
    margin: 8px;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
}

/* デスクトップ */
@media (min-width: 769px) {
  .settings-form {
    max-width: 600px;
    margin: 0 auto;
    padding: 24px;
  }
}
```

### アクセシビリティ

- **キーボードナビゲーション**: Tab順序の最適化
- **スクリーンリーダー対応**: 適切なARIA属性
- **フォーカス管理**: 視覚的フィードバック
- **ラベル関連付け**: すべての入力要素にラベル

## フォームバリデーション

### APIキー検証

```typescript
const validateApiKey = (apiKey: string): string | null => {
  if (!apiKey.trim()) {
    return 'APIキーは必須です';
  }
  
  if (!apiKey.startsWith('sk-')) {
    return 'OpenAI APIキーは"sk-"で始まる必要があります';
  }
  
  if (apiKey.length < 20) {
    return 'APIキーの形式が正しくありません';
  }
  
  return null;
};
```

### プロンプト検証

```typescript
const validatePrompt = (prompt: string): string | null => {
  if (prompt.length > 1000) {
    return 'プロンプトは1000文字以内で入力してください';
  }
  
  return null;
};
```

## 状態管理

### 保存処理

```typescript
const handleSave = async () => {
  setIsSaving(true);
  setSaveMessage('');
  
  try {
    // バリデーション
    const apiKeyError = validateApiKey(formData.apiKey);
    if (apiKeyError) {
      setSaveMessage(apiKeyError);
      return;
    }
    
    // 設定保存
    await aiSettingsStorage.set(formData);
    setSaveMessage('設定を保存しました！');
    
    // 3秒後にメッセージをクリア
    setTimeout(() => setSaveMessage(''), 3000);
    
  } catch (error) {
    setSaveMessage('設定の保存に失敗しました。再試行してください。');
    console.error('設定保存エラー:', error);
  } finally {
    setIsSaving(false);
  }
};
```

### エラーハンドリング

```typescript
const [errors, setErrors] = useState<Record<string, string>>({});

const validateForm = (data: AISettings): Record<string, string> => {
  const newErrors: Record<string, string> = {};
  
  // APIキー検証
  const apiKeyError = validateApiKey(data.apiKey);
  if (apiKeyError) {
    newErrors.apiKey = apiKeyError;
  }
  
  // カスタムプロンプト検証
  if (data.useCustomPrompt && data.customPrompt) {
    const promptError = validatePrompt(data.customPrompt);
    if (promptError) {
      newErrors.customPrompt = promptError;
    }
  }
  
  return newErrors;
};
```

## 開発・テスト

### テスト実行

```bash
# 全テストを実行
pnpm test

# ウォッチモードでテスト実行
pnpm test:watch

# カバレッジ付きテスト（ルートから）
pnpm test:coverage
```

### テストカバレッジ

現在のテストカバレッジ:
- **AISettingsOptions.spec.tsx**: 5テスト（コンポーネント動作、状態管理、イベント処理）

### テストケース

```typescript
describe('AISettingsOptions', () => {
  it('should render all form elements', () => {
    render(<AISettingsOptions />);
    
    expect(screen.getByLabelText(/APIキー/)).toBeInTheDocument();
    expect(screen.getByLabelText(/モデル/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /保存/ })).toBeInTheDocument();
  });
  
  it('should save settings on form submission', async () => {
    const { getByLabelText, getByRole } = render(<AISettingsOptions />);
    
    fireEvent.change(getByLabelText(/APIキー/), {
      target: { value: 'sk-test-api-key' }
    });
    
    fireEvent.click(getByRole('button', { name: /保存/ }));
    
    await waitFor(() => {
      expect(screen.getByText(/保存しました/)).toBeInTheDocument();
    });
  });
});
```

## Chrome拡張機能での使用

### Manifest設定

```json
{
  "options_page": "options/index.html",
  "permissions": [
    "storage"
  ]
}
```

### オプション画面の開き方

```typescript
// Background Scriptから
chrome.runtime.openOptionsPage();

// Popup画面から
const openOptionsPage = () => {
  chrome.runtime.openOptionsPage();
  window.close();
};
```

## スタイリング

### CSS設計

- **BEM記法**: ブロック、エレメント、モディファイア
- **CSS Variables**: 色やサイズの一元管理
- **Flexbox/Grid**: レスポンシブレイアウト

### テーマ対応

```css
:root {
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --success-color: #10b981;
  --error-color: #ef4444;
  --background-color: #ffffff;
  --text-color: #1e293b;
}

/* ダークモード */
@media (prefers-color-scheme: dark) {
  :root {
    --background-color: #0f172a;
    --text-color: #f8fafc;
  }
}
```

## ビルド・デプロイ

### 開発サーバー

```bash
# 開発モードで起動
pnpm dev

# ビルド（プロダクション）
pnpm build
```

### ビルド設定

- **Vite**: 高速ビルドツール
- **TypeScript**: 型安全性
- **React**: UI フレームワーク
- **Tailwind CSS**: ユーティリティファーストCSS

## パフォーマンス最適化

### バンドルサイズ最適化

- **Code Splitting**: 必要な部分のみロード
- **Tree Shaking**: 未使用コードの除去
- **Lazy Loading**: 動的インポート

### レンダリング最適化

```typescript
// React.memoでの最適化
const AISettingsOptions = React.memo(() => {
  // コンポーネント実装
});

// useCallbackでのイベントハンドラー最適化
const handleSave = useCallback(async () => {
  // 保存処理
}, [formData]);
```

## トラブルシューティング

### よくある問題

1. **設定が保存されない**
   - Storage権限の確認
   - エラーログの確認
   - バリデーションエラーの確認

2. **UIが表示されない**
   - CSSの読み込み確認
   - React/Viteのビルド確認
   - マニフェストの設定確認

3. **フォームのバリデーションが動作しない**
   - イベントハンドラーの設定確認
   - 状態管理の実装確認

## 今後の拡張予定

- [ ] 設定のインポート/エクスポート機能
- [ ] 複数APIプロバイダー対応
- [ ] 分析履歴の表示
- [ ] プロンプトテンプレート機能

## 関連ドキュメント

- [Chrome Extension Options](https://developer.chrome.com/docs/extensions/develop/ui/options-page)
- [Storage パッケージ](../../packages/storage/README.md)
- [Content Script パッケージ](../content/README.md)