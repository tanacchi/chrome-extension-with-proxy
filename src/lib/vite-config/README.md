# @extension/vite-config

Vite設定パッケージ - Chrome拡張機能プロジェクト全体で使用される共通のVite設定とユーティリティを提供します。

## 概要

このパッケージは、Chrome拡張機能プロジェクト内のすべてのページとパッケージで一貫したVite設定を実現するための共通設定とユーティリティ関数を提供します。React、TypeScript、HMR、Content Scripts の統合に最適化されています。

## 主要機能

- **共通Vite設定**: プロジェクト全体で使用する基本Vite設定
- **ページ設定ヘルパー**: React ページ用の設定生成
- **Content Script統合**: Chrome拡張機能のContent Script対応
- **HMR統合**: 開発時のホットリロード機能
- **環境変数管理**: 環境に応じた設定の切り替え

## インストール

このパッケージは内部パッケージのため、プロジェクトのワークスペース設定により自動的に利用可能です。

## 使用方法

### 基本的なページ設定

React ページ（popup、options等）での使用：

```typescript
// pages/popup/vite.config.ts
import { withPageConfig } from '@extension/vite-config';
import { defineConfig } from 'vite';

export default withPageConfig({
  build: {
    outDir: '../../dist/popup',
    rollupOptions: {
      input: './index.html',
    },
  },
});
```

### Content Script 用の設定

Content Scripts のビルドには専用のユーティリティを使用：

```typescript
// pages/content/vite.config.ts
import { defineConfig } from 'vite';
import { withPageConfig, getContentScriptEntries } from '@extension/vite-config';

export default withPageConfig({
  build: {
    outDir: '../../dist/content-scripts',
    rollupOptions: {
      input: getContentScriptEntries('./src'),
    },
  },
});
```

### カスタム設定の追加

既存の設定を拡張してカスタマイズ：

```typescript
import { withPageConfig } from '@extension/vite-config';
import { defineConfig } from 'vite';

export default withPageConfig({
  // 追加のプラグイン
  plugins: [
    // withPageConfigの基本プラグインに追加される
  ],
  
  // ビルド設定
  build: {
    outDir: '../../dist/custom',
    sourcemap: true,
    minify: 'esbuild',
  },
  
  // 開発サーバー設定
  server: {
    port: 3000,
    open: true,
  },
});
```

## API リファレンス

### withPageConfig(config)

React ページ用のVite設定を生成します。

**パラメータ:**
- `config: UserConfig` - カスタムVite設定

**戻り値:** `UserConfig` - 統合されたVite設定

**含まれる機能:**
- React SWCプラグイン
- Node.js polyfills
- 環境変数の定義
- HMR設定（開発時）
- ビルド最適化

### getContentScriptEntries(srcDir)

Content Scripts用のエントリーポイントを自動検出します。

**パラメータ:**
- `srcDir: string` - ソースディレクトリのパス

**戻り値:** `Record<string, string>` - エントリーポイントマップ

**使用例:**
```typescript
// src/content-script-1.ts
// src/content-script-2.ts
// の場合

const entries = getContentScriptEntries('./src');
// {
//   'content-script-1': './src/content-script-1.ts',
//   'content-script-2': './src/content-script-2.ts'
// }
```

## 内部設定詳細

### withPageConfig の内部設定

```typescript
{
  define: {
    'process.env': env, // @extension/env からの環境変数
  },
  base: '', // 相対パスでのビルド
  plugins: [
    react(),                              // React SWCプラグイン
    IS_DEV && watchRebuildPlugin({        // HMRプラグイン（開発時のみ）
      refresh: true 
    }),
    nodePolyfills(),                      // Node.js polyfills
  ],
  build: {
    sourcemap: IS_DEV,                    // 開発時のみソースマップ
    minify: IS_PROD,                      // 本番時のみ圧縮
    reportCompressedSize: IS_PROD,        // 本番時のみサイズレポート
    emptyOutDir: IS_PROD,                 // 本番時のみディレクトリクリア
    watch: watchOption,                   // 開発時の監視設定
  },
}
```

### 監視設定 (watchOption)

開発時のファイル監視設定：

```typescript
const watchOption = IS_DEV ? {
  chokidar: {
    awaitWriteFinish: true, // ファイル書き込み完了を待機
  },
} : undefined;
```

## 依存関係

### 主要依存関係
- `@extension/env`: 環境変数管理（ワークスペース参照）

### 開発依存関係
- `@extension/hmr`: HMRプラグイン（ワークスペース参照）
- `@extension/tsconfig`: TypeScript設定（ワークスペース参照）
- `@vitejs/plugin-react-swc` ^3.9.0: React SWCプラグイン

## ディレクトリ構造

```
packages/vite-config/
├── lib/
│   ├── build-content-script.ts         # Content Script ビルドユーティリティ
│   ├── get-content-script-entires.ts   # エントリーポイント検出
│   ├── index.ts                        # メインエクスポート
│   └── with-page-config.ts             # ページ設定ヘルパー
├── index.mts                           # メインエクスポート
├── package.json                        # パッケージ設定
├── tailwind.d.ts                       # Tailwind CSS型定義
└── tsconfig.json                       # TypeScript設定
```

## スクリプト

```bash
# node_modulesクリーンアップ
pnpm clean:node_modules

# バンドルクリーンアップ
pnpm clean:bundle

# 全クリーンアップ
pnpm clean

# TypeScriptビルド
pnpm ready
```

## 使用例

### Popup ページ

```typescript
// pages/popup/vite.config.ts
import { withPageConfig } from '@extension/vite-config';

export default withPageConfig({
  build: {
    outDir: '../../dist/popup',
    rollupOptions: {
      input: './index.html',
    },
  },
});
```

### Options ページ

```typescript
// pages/options/vite.config.ts
import { withPageConfig } from '@extension/vite-config';

export default withPageConfig({
  build: {
    outDir: '../../dist/options',
    rollupOptions: {
      input: './index.html',
    },
  },
  server: {
    port: 3001, // ポート番号をカスタマイズ
  },
});
```

### Side Panel ページ

```typescript
// pages/side-panel/vite.config.ts
import { withPageConfig } from '@extension/vite-config';

export default withPageConfig({
  build: {
    outDir: '../../dist/side-panel',
    rollupOptions: {
      input: './index.html',
    },
  },
});
```

### Content Scripts

```typescript
// pages/content/vite.config.ts
import { withPageConfig, getContentScriptEntries } from '@extension/vite-config';

export default withPageConfig({
  build: {
    outDir: '../../dist/content-scripts',
    lib: {
      entry: getContentScriptEntries('./src'),
      formats: ['iife'], // Content Scriptsは即座実行関数形式
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
```

## 環境変数統合

`@extension/env`パッケージから環境変数を自動的に統合：

```typescript
// 自動的に利用可能な環境変数
process.env.NODE_ENV    // 'development' | 'production'
process.env.IS_DEV      // boolean
process.env.IS_PROD     // boolean
process.env.IS_FIREFOX  // boolean
```

## HMR統合

開発時には自動的にHMR（Hot Module Reload）機能が有効になります：

- **リフレッシュ**: ページレベルでの自動更新
- **WebSocket通信**: 開発サーバーとの通信
- **自動再接続**: 接続失敗時の自動リトライ

## プラグイン統合

### 含まれるプラグイン

1. **React SWC**: 高速なReact変換
2. **HMRプラグイン**: 開発時の自動リロード
3. **Node.js Polyfills**: ブラウザ環境でのNode.jsモジュール使用

### 追加プラグインの統合

```typescript
import { withPageConfig } from '@extension/vite-config';
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default withPageConfig({
  plugins: [
    // 追加のプラグインはここに
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

## ベストプラクティス

1. **統一設定**: 全てのページで`withPageConfig`を使用
2. **適切なoutDir**: プロジェクトルートの`dist`配下に出力
3. **エントリーポイント**: HTMLまたはTS/JSファイルを明確に指定
4. **開発サーバー**: 各ページで異なるポートを使用
5. **ソースマップ**: 開発時のデバッグのためにソースマップを有効化

## 注意事項

- Chrome拡張機能のManifest V3に対応
- Content Scriptsは特別な設定が必要（IIFE形式）
- 開発時と本番時で異なる最適化設定
- WebSocketを使用するHMR機能はポート8081を使用

## トラブルシューティング

### ビルドエラー
- `outDir`設定が正しいか確認
- エントリーポイントファイルが存在するか確認

### HMRが動作しない
- ポート8081が使用可能か確認
- `@extension/hmr`パッケージが正しくインストールされているか確認

### 環境変数が読み込まれない
- `@extension/env`パッケージの設定を確認
- `.env`ファイルが適切に配置されているか確認

## 関連パッケージ

- `@extension/hmr`: Hot Module Reload機能
- `@extension/env`: 環境変数管理
- `@extension/tsconfig`: TypeScript設定

## ライセンス

このパッケージはプライベートパッケージです。