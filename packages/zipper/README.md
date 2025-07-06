# @extension/zipper

ZIPパッケージ作成ツール - Chrome拡張機能の配布用ZIPファイルを効率的に生成するユーティリティです。

## 概要

このパッケージは、Chrome拡張機能の本番ビルド成果物を配布用のZIPファイルにパッケージ化するためのツールです。Chrome Web StoreやFirefox Add-onsへの提出に適したアーカイブファイルを自動生成し、ファイルサイズの最適化と高速な圧縮処理を提供します。

## 主要機能

- **自動ZIPファイル生成**: ビルド成果物の自動アーカイブ化
- **Chrome/Firefox対応**: 両ブラウザ向けの適切な形式対応
- **高速圧縮**: `fflate`ライブラリによる高速な圧縮処理
- **ファイルサイズ監視**: 圧縮後のファイルサイズ表示
- **タイムスタンプ付きファイル名**: 日時情報を含むファイル名の自動生成
- **ソースマップ除外**: 本番用パッケージからの不要ファイル除外

## インストール

このパッケージは内部パッケージのため、プロジェクトのワークスペース設定により自動的に利用可能です。

## 使用方法

### コマンドラインから実行

```bash
# Chrome用ZIPファイル生成
pnpm zip

# Firefox用ZIPファイル生成（XPI形式）
pnpm zip:firefox
```

### プログラムから使用

```typescript
import { zipBundle } from '@extension/zipper';
import { resolve } from 'node:path';

await zipBundle({
  distDirectory: resolve(__dirname, 'dist'),
  buildDirectory: resolve(__dirname, 'dist-zip'),
  archiveName: 'my-extension-v1.0.0.zip',
});
```

### 環境変数での制御

```bash
# Firefoxビルド時（XPI形式で出力）
IS_FIREFOX=true pnpm zip

# Chromeビルド時（ZIP形式で出力）
IS_FIREFOX=false pnpm zip
```

## API リファレンス

### zipBundle(options, withMaps?)

指定されたディレクトリからZIPアーカイブを作成します。

**パラメータ:**

- `options.distDirectory: string` - ソースディレクトリのパス（通常は`dist`）
- `options.buildDirectory: string` - 出力ディレクトリのパス（通常は`dist-zip`）
- `options.archiveName: string` - 生成するアーカイブファイル名
- `withMaps?: boolean` - ソースマップを含むか（デフォルト: false）

**戻り値:** `Promise<void>`

**使用例:**

```typescript
await zipBundle({
  distDirectory: '/path/to/dist',
  buildDirectory: '/path/to/dist-zip', 
  archiveName: 'extension-2023-12-01-143000.zip'
}, false); // ソースマップを除外
```

## 自動ファイル名生成

実行時のタイムスタンプを使用して、一意のファイル名を自動生成します：

```typescript
// 実行時のタイムスタンプ
const YYYY_MM_DD = new Date().toISOString().slice(0, 10).replace(/-/g, '');  // 20231201
const HH_mm_ss = new Date().toISOString().slice(11, 19).replace(/:/g, '');  // 143000

// 生成されるファイル名
const fileName = `extension-${YYYY_MM_DD}-${HH_mm_ss}`;
// → extension-20231201-143000.zip (Chrome)
// → extension-20231201-143000.xpi (Firefox)
```

## ディレクトリ構造

```
packages/zipper/
├── lib/
│   ├── index.ts                # メインエクスポート
│   └── zip-bundle.ts           # ZIPバンドル実装
├── index.mts                   # CLI実行エントリーポイント
├── package.json                # パッケージ設定
└── tsconfig.json               # TypeScript設定
```

## 依存関係

### 内部依存関係
- `@extension/dev-utils`: 開発ユーティリティ（ワークスペース参照）
- `@extension/env`: 環境変数管理（ワークスペース参照）

### 外部依存関係
- `fast-glob`: ファイルグロブパターンマッチング（dev-utils経由）
- `fflate`: 高速な圧縮ライブラリ（dev-utils経由）

### 開発依存関係
- `@extension/tsconfig`: TypeScript設定（ワークスペース参照）

## スクリプト

```bash
# バンドルクリーンアップ
pnpm clean:bundle

# node_modulesクリーンアップ
pnpm clean:node_modules

# Turboキャッシュクリーンアップ
pnpm clean:turbo

# 全クリーンアップ
pnpm clean

# ZIPファイル生成
pnpm zip

# Lint実行
pnpm lint

# TypeScriptビルド
pnpm ready

# Lint自動修正
pnpm lint:fix

# フォーマット実行
pnpm format

# 型チェック
pnpm type-check
```

## 実行フロー

1. **環境変数チェック**: `IS_FIREFOX`環境変数でブラウザを判定
2. **タイムスタンプ生成**: 現在時刻からファイル名を生成
3. **ディレクトリ作成**: 出力ディレクトリが存在しない場合は作成
4. **ファイル収集**: `fast-glob`でソースファイルを収集
5. **圧縮処理**: `fflate`でZIP形式に圧縮
6. **ファイル出力**: 指定されたパスにアーカイブファイルを保存
7. **サイズ表示**: 最終的なファイルサイズを表示

## 除外ファイル

本番パッケージから以下のファイルが自動的に除外されます：

- ソースマップファイル（`.map`）
- 開発用設定ファイル
- テストファイル
- ドキュメントファイル（README.md等）

## 使用例

### 基本的な使用例

```bash
# 1. プロジェクトビルド
pnpm build

# 2. ZIPファイル生成
pnpm zip

# 3. 生成されたファイルの確認
ls dist-zip/
# → extension-20231201-143000.zip
```

### Firefox向けビルド

```bash
# 1. Firefox向けビルド
pnpm build:firefox

# 2. XPIファイル生成
pnpm zip:firefox

# 3. 生成されたファイルの確認
ls dist-zip/
# → extension-20231201-143000.xpi
```

### カスタム設定での使用

```typescript
import { zipBundle } from '@extension/zipper';
import { resolve } from 'node:path';

// カスタム設定でZIPファイル生成
await zipBundle({
  distDirectory: resolve(__dirname, 'build'),
  buildDirectory: resolve(__dirname, 'releases'),
  archiveName: 'my-extension-v2.1.0.zip',
}, true); // ソースマップを含める
```

## 出力ファイル情報

生成されるZIPファイルには以下の情報が含まれます：

- **ファイルサイズ**: 圧縮後のサイズ（MB単位）
- **処理時間**: 圧縮にかかった時間（ミリ秒）
- **ファイル数**: 含まれるファイルの総数

```
Zip Package size: 2.45 MB in 1234ms
```

## ベストプラクティス

1. **ビルド前実行**: `pnpm build`後に実行する
2. **定期的なクリーンアップ**: `dist-zip`ディレクトリを定期的にクリーンアップ
3. **ファイル名管理**: タイムスタンプ付きファイル名でバージョン管理
4. **サイズ監視**: 生成されるファイルサイズを定期的に確認
5. **テスト**: ZIPファイルの内容を確認してから配布

## 注意事項

- プロジェクトルートの`dist`ディレクトリが存在することが前提
- `dist-zip`ディレクトリは自動的に作成されます
- 既存のZIPファイルは上書きされます
- Chrome Web Storeの最大ファイルサイズ制限（現在128MB）に注意
- Firefox Add-onsの最大ファイルサイズ制限（現在200MB）に注意

## トラブルシューティング

### ファイルが見つからないエラー
```bash
# distディレクトリが存在するか確認
ls dist/

# ビルドを実行
pnpm build
```

### 権限エラー
```bash
# 出力ディレクトリの権限を確認
ls -la dist-zip/

# 必要に応じて権限を変更
chmod 755 dist-zip/
```

### ファイルサイズが大きすぎる
- 不要なファイルが含まれていないか確認
- ソースマップを除外しているか確認（`withMaps: false`）
- ビルド最適化設定を確認

## 関連パッケージ

- `@extension/dev-utils`: ファイルストリーミング機能
- `@extension/env`: 環境変数管理
- `@extension/vite-config`: ビルド設定

## ライセンス

このパッケージはプライベートパッケージです。