# @extension/tsconfig

TypeScript設定パッケージ - Chrome拡張機能プロジェクト全体で使用される共通のTypeScript設定を提供します。

## 概要

このパッケージは、Chrome拡張機能プロジェクト内のすべてのパッケージとページで一貫したTypeScript設定を実現するための共通設定ファイルを提供します。型安全性、コンパイル設定、モジュール解決の統一を目的としています。

## 主要機能

- **共通基本設定**: プロジェクト全体の基本TypeScript設定
- **用途別設定**: アプリケーション用とモジュール用の特化設定
- **拡張可能**: 各パッケージで設定をカスタマイズ可能
- **Chrome API対応**: Chrome拡張機能開発に最適化

## インストール

このパッケージは内部パッケージのため、プロジェクトのワークスペース設定により自動的に利用可能です。

## 使用方法

### 基本設定の継承

各パッケージのtsconfig.jsonで共通設定を継承します：

```json
{
  "extends": "@extension/tsconfig/base.json",
  "compilerOptions": {
    // パッケージ固有の設定
  },
  "include": [
    "src/**/*"
  ]
}
```

### アプリケーション用設定

React アプリケーションやページには app.json を使用：

```json
{
  "extends": "@extension/tsconfig/app.json",
  "compilerOptions": {
    "outDir": "./dist"
  },
  "include": [
    "src/**/*",
    "public/**/*"
  ]
}
```

### モジュール用設定

ライブラリやモジュールパッケージには module.json を使用：

```json
{
  "extends": "@extension/tsconfig/module.json",
  "compilerOptions": {
    "outDir": "./lib",
    "declarationDir": "./lib"
  },
  "include": [
    "src/**/*"
  ]
}
```

## 設定ファイル

### base.json

すべての設定の基盤となる基本設定です：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Base",
  "compilerOptions": {
    "allowJs": true,
    "noEmit": true,
    "downlevelIteration": true,
    "isolatedModules": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noImplicitReturns": true,
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ESNext",
    "lib": ["DOM", "ESNext"],
    "types": ["node", "chrome"]
  }
}
```

**主要な設定項目:**

- **strict**: 厳格な型チェックを有効
- **jsx**: React JSX変換を設定（React 17+の新しいJSX変換）
- **module/target**: 最新のESNext仕様を使用
- **moduleResolution**: bundler（Vite/Rollup）に最適化
- **types**: Node.jsとChrome API型定義を含む

### app.json

アプリケーション（React ページなど）向けの設定：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Chrome Extension App",
  "extends": "./base.json"
}
```

- base.jsonの設定をそのまま継承
- 主にpages/配下のReactアプリケーションで使用

### module.json

ライブラリ・モジュールパッケージ向けの設定：

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Module",
  "extends": "./base.json",
  "compilerOptions": {
    "noEmit": false,
    "moduleResolution": "NodeNext",
    "module": "NodeNext"
  }
}
```

**base.jsonからの変更点:**

- **noEmit**: false（ファイル出力を有効）
- **moduleResolution**: NodeNext（Node.js標準の解決方法）
- **module**: NodeNext（Node.jsモジュール形式）

## 依存関係

このパッケージには外部依存関係はありません（TypeScript設定のみ）。

## ディレクトリ構造

```
packages/tsconfig/
├── app.json                 # アプリケーション用設定
├── base.json                # 基本設定
├── module.json              # モジュール用設定
└── package.json             # パッケージ設定
```

## パッケージ設定

```json
{
  "name": "@extension/tsconfig",
  "version": "0.5.0",
  "description": "chrome extension - tsconfig",
  "private": true,
  "sideEffects": false
}
```

## 使用例

### Popup ページでの使用

```json
// pages/popup/tsconfig.json
{
  "extends": "@extension/tsconfig/app.json",
  "compilerOptions": {
    "outDir": "../../dist/popup"
  },
  "include": [
    "src/**/*",
    "index.html"
  ]
}
```

### shared パッケージでの使用

```json
// packages/shared/tsconfig.json
{
  "extends": "@extension/tsconfig/module.json",
  "compilerOptions": {
    "outDir": "./lib",
    "declaration": true,
    "declarationDir": "./lib"
  },
  "include": [
    "lib/**/*"
  ]
}
```

### storage パッケージでの使用

```json
// packages/storage/tsconfig.json
{
  "extends": "@extension/tsconfig/module.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true
  }
}
```

## 設定の選び方

| パッケージタイプ | 推奨設定 | 用途 |
|------------------|----------|------|
| React ページ | `app.json` | popup, options, side-panel等 |
| ライブラリ | `module.json` | shared, storage, ui等 |
| Content Scripts | `app.json` | content, content-ui等 |
| Background Scripts | `app.json` | background |
| 設定ファイル | `base.json` | vite.config.ts等 |

## カスタマイズ例

### 特定のパッケージでの拡張

```json
{
  "extends": "@extension/tsconfig/module.json",
  "compilerOptions": {
    "outDir": "./dist",
    "declaration": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*",
    "types/**/*"
  ],
  "exclude": [
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

### テスト用設定の追加

```json
{
  "extends": "@extension/tsconfig/base.json",
  "compilerOptions": {
    "types": ["node", "chrome", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": [
    "**/*.spec.ts",
    "**/*.test.ts"
  ]
}
```

## 共通の型定義

base.jsonに含まれる型定義：

- **node**: Node.js標準ライブラリの型
- **chrome**: Chrome拡張機能API の型（`@types/chrome`）

これらの型は全てのパッケージで自動的に利用可能です。

## Chrome API対応

Chrome拡張機能特有のAPI（chrome.storage、chrome.tabs等）の型サポートが含まれています：

```typescript
// 自動的に型サポートされる例
chrome.storage.local.set({ key: 'value' });
chrome.tabs.query({ active: true }, (tabs) => {
  // tabs は Tab[] 型として推論される
});
```

## ベストプラクティス

1. **適切な設定選択**: パッケージの用途に応じて適切な設定を選択
2. **最小限の拡張**: 必要最小限のカスタマイズに留める
3. **型安全性**: strictモードを活用して型安全性を確保
4. **一貫性**: プロジェクト全体で設定の一貫性を保つ
5. **パス設定**: 必要に応じてpathsマッピングを活用

## 注意事項

- ESNext設定のため、対象ブラウザがES2020+をサポートする必要があります
- Chrome拡張機能はモダンブラウザ環境なので、最新のJavaScript機能が使用可能です
- `skipLibCheck: true`により、ライブラリの型チェックをスキップして高速化されています
- `isolatedModules: true`により、単一ファイル変換（Vite/esbuild）に最適化されています

## トラブルシューティング

### モジュール解決エラー
- `moduleResolution`設定が適切か確認
- ワークスペース参照（`workspace:*`）が正しく設定されているか確認

### 型エラー
- `types`配列に必要な型定義が含まれているか確認
- `@types/chrome`がインストールされているか確認

### ビルドエラー
- `outDir`設定が適切か確認
- `include`/`exclude`設定でファイルが適切に含まれているか確認

## 関連パッケージ

- `@extension/vite-config`: Vite設定（TypeScript統合）
- `@extension/shared`: 共通型定義とユーティリティ

## ライセンス

このパッケージはプライベートパッケージです。