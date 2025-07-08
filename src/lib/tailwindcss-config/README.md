# @extension/tailwindcss-config

Tailwind CSS設定パッケージ - Chrome拡張機能プロジェクト全体で使用される共通のTailwind CSS設定を提供します。

## 概要

このパッケージは、Chrome拡張機能プロジェクト内のすべてのページとコンポーネントで一貫したスタイリングを実現するための共通Tailwind CSS設定を提供します。プロジェクト全体でのデザインシステムの統一と保守性の向上を目的としています。

## 主要機能

- **共通設定**: プロジェクト全体で使用する基本Tailwind CSS設定
- **拡張可能**: 各パッケージやページで設定を拡張可能
- **型安全**: TypeScriptによる設定の型サポート
- **軽量**: 最小限の設定でシンプルな構成

## インストール

このパッケージは内部パッケージのため、プロジェクトのワークスペース設定により自動的に利用可能です。

## 使用方法

### 基本的な使用

各パッケージやページのTailwind CSS設定で共通設定をインポートします：

```typescript
// tailwind.config.ts
import baseConfig from '@extension/tailwindcss-config';
import type { Config } from 'tailwindcss';

export default {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/**/*.html',
  ],
} satisfies Config;
```

### 設定の拡張

共通設定を基盤として、パッケージ固有のカスタマイズを追加できます：

```typescript
// 特定のパッケージでの拡張例
import baseConfig from '@extension/tailwindcss-config';
import type { Config } from 'tailwindcss';

export default {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    ...baseConfig.plugins,
    // 追加のプラグイン
  ],
} satisfies Config;
```

### deepmergeを使用した詳細な統合

複雑な設定の統合には`deepmerge`を使用できます：

```typescript
import baseConfig from '@extension/tailwindcss-config';
import deepmerge from 'deepmerge';
import type { Config } from 'tailwindcss';

export default deepmerge(baseConfig, {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
}) satisfies Config;
```

## 設定内容

現在の基本設定（`tailwind.config.ts`）:

```typescript
import type { Config } from 'tailwindcss';

export default {
  theme: {
    extend: {},
  },
  plugins: [],
} as Omit<Config, 'content'>;
```

この設定は以下の特徴があります：

- **content省略**: 各パッケージで個別に設定することを前提
- **拡張可能なテーマ**: `theme.extend`により既存テーマの拡張が容易
- **プラグイン対応**: 追加プラグインの組み込みが可能
- **型安全**: TypeScriptによる設定の型チェック

## 依存関係

### 開発依存関係
- `@extension/tsconfig`: TypeScript設定（ワークスペース参照）

## ディレクトリ構造

```
packages/tailwindcss-config/
├── node_modules/            # 依存関係
├── package.json             # パッケージ設定
├── tailwind.config.ts       # Tailwind CSS基本設定
└── tsconfig.json            # TypeScript設定
```

## パッケージ設定

```json
{
  "name": "@extension/tailwindcss-config",
  "version": "0.5.0",
  "description": "chrome extension - tailwindcss configuration",
  "main": "tailwind.config.ts",
  "private": true,
  "sideEffects": false
}
```

## 使用例

### PopupページでのTailwind設定

```typescript
// pages/popup/tailwind.config.ts
import baseConfig from '@extension/tailwindcss-config';
import type { Config } from 'tailwindcss';

export default {
  ...baseConfig,
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './index.html',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      width: {
        'popup': '320px',
      },
      height: {
        'popup': '480px',
      },
    },
  },
} satisfies Config;
```

### UIコンポーネントパッケージでの設定

```typescript
// packages/ui/tailwind.config.ts
import baseConfig from '@extension/tailwindcss-config';
import type { Config } from 'tailwindcss';

export default {
  ...baseConfig,
  content: [
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    ...baseConfig.theme,
    extend: {
      ...baseConfig.theme?.extend,
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
} satisfies Config;
```

## 推奨される拡張設定

プロジェクトでよく使用される拡張設定の例：

```typescript
{
  theme: {
    extend: {
      colors: {
        'extension': {
          primary: '#1e40af',
          secondary: '#64748b',
          accent: '#f59e0b',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxWidth: {
        'popup': '320px',
        'options': '768px',
        'side-panel': '400px',
      },
      zIndex: {
        'modal': '1000',
        'tooltip': '1010',
        'dropdown': '1020',
      },
    },
  },
}
```

## ベストプラクティス

1. **一貫性**: 全てのパッケージで共通設定を使用する
2. **拡張**: 基本設定を上書きせず、`extend`を使用する
3. **型安全**: TypeScriptを使用して設定の型安全性を確保
4. **ドキュメント**: カスタム拡張は適切にコメントを追加
5. **テスト**: 設定変更後はビルドテストを実行

## 注意事項

- この設定は`content`プロパティを含まないため、各パッケージで個別に設定する必要があります
- 共通設定の変更は全てのパッケージに影響するため、慎重に行ってください
- Tailwind CSSのバージョン更新時は、設定の互換性を確認してください

## 関連パッケージ

- `@extension/ui`: UIコンポーネントパッケージ（この設定を使用）
- `@extension/vite-config`: Vite設定（PostCSS/Tailwind統合）

## ライセンス

このパッケージはプライベートパッケージです。