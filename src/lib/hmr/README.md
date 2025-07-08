# @extension/hmr

Hot Module Reload (HMR) パッケージ - Chrome拡張機能開発時のホットリロード・リフレッシュ機能を提供します。

## 概要

このパッケージは、Chrome拡張機能の開発体験を向上させるためのHMR（Hot Module Reload）機能を提供します。ファイル変更を検知して自動的にブラウザ拡張機能をリロードまたはリフレッシュし、開発効率を大幅に改善します。

## 主要機能

- **自動リロード**: 拡張機能全体の再読込
- **自動リフレッシュ**: ページレベルでのリフレッシュ
- **WebSocket通信**: 開発サーバーとの通信による変更検知
- **プラグインシステム**: Vite環境での統合サポート
- **エラーハンドリング**: 接続失敗時の自動再接続

## インストール

このパッケージは内部パッケージのため、プロジェクトのワークスペース設定により自動的に利用可能です。

## 使用方法

### Vite設定での使用

```typescript
import { defineConfig } from 'vite';
import { watchRebuildPlugin } from '@extension/hmr';

export default defineConfig({
  plugins: [
    // リフレッシュ機能を有効にする場合
    watchRebuildPlugin({ 
      refresh: true,
      reload: false,
      id: 'unique-plugin-id' 
    }),
    
    // リロード機能を有効にする場合
    watchRebuildPlugin({ 
      refresh: false, 
      reload: true 
    }),
    
    // 両方を有効にする場合
    watchRebuildPlugin({ 
      refresh: true, 
      reload: true 
    }),
  ],
});
```

### 開発サーバーの起動

```bash
# HMRサーバーを起動
pnpm dev
```

### プラグイン設定オプション

```typescript
interface PluginConfigType {
  refresh?: boolean;    // ページリフレッシュを有効にする
  reload?: boolean;     // 拡張機能リロードを有効にする
  id?: string;         // プラグインの一意識別子
  onStart?: () => void; // 開始時のコールバック
}
```

## API リファレンス

### プラグイン

#### watchRebuildPlugin(config)

ファイル変更を監視してリビルド時に自動リロード/リフレッシュを行うViteプラグイン。

**パラメータ:**
- `config.refresh?: boolean` - ページリフレッシュを有効にする（デフォルト: false）
- `config.reload?: boolean` - 拡張機能リロードを有効にする（デフォルト: false）
- `config.id?: string` - プラグインの一意識別子（デフォルト: ランダム生成）
- `config.onStart?: () => void` - 開始時のコールバック

**戻り値:** `PluginOption` - Viteプラグインオブジェクト

#### watchPublicPlugin()

publicディレクトリの変更を監視するプラグイン。

#### makeEntryPointPlugin()

エントリーポイントの生成と管理を行うプラグイン。

## 依存関係

### 開発依存関係
- `@extension/env`: 環境変数管理（ワークスペース参照）
- `@extension/tsconfig`: TypeScript設定（ワークスペース参照）
- `@rollup/plugin-sucrase` ^5.0.2: Sucraseプラグイン
- `@types/ws` ^8.18.1: WebSocket型定義
- `esbuild` ^0.25.4: JavaScript/TypeScriptバンドラー
- `esm` ^3.2.25: ESModuleサポート
- `rollup` ^4.41.0: モジュールバンドラー
- `ts-node` ^10.9.2: TypeScript実行環境
- `ws` ^8.18.2: WebSocketライブラリ

## ディレクトリ構造

```
packages/hmr/
├── dist/                           # コンパイル済みファイル
├── lib/
│   ├── consts.ts                   # 定数定義
│   ├── initializers/               # 初期化処理
│   │   ├── init-client.ts          # クライアント初期化
│   │   └── init-reload-server.ts   # リロードサーバー初期化
│   ├── injections/                 # 注入スクリプト
│   │   ├── refresh.ts              # リフレッシュスクリプト
│   │   └── reload.ts               # リロードスクリプト
│   ├── interpreter/                # メッセージ解釈
│   │   └── index.ts                # メッセージインタープリター
│   ├── plugins/                    # Viteプラグイン
│   │   ├── index.ts                # プラグインエクスポート
│   │   ├── make-entry-point-plugin.ts    # エントリーポイントプラグイン
│   │   ├── watch-public-plugin.ts        # publicディレクトリ監視
│   │   └── watch-rebuild-plugin.ts       # リビルド監視プラグイン
│   └── types.ts                    # 型定義
├── index.mts                       # メインエクスポート
├── package.json                    # パッケージ設定
├── rollup.config.ts                # Rollup設定
└── tsconfig.json                   # TypeScript設定
```

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

# ビルド準備（TypeScript + Rollup）
pnpm ready

# 開発サーバー起動
pnpm dev

# Lint実行
pnpm lint

# Lint自動修正
pnpm lint:fix

# フォーマット実行
pnpm format

# 型チェック
pnpm type-check
```

## 設定ファイル

### rollup.config.ts

Rollupビルド設定でSucraseプラグインを使用してTypeScriptをコンパイルします。

### tsconfig.json

TypeScript設定は`@extension/tsconfig`パッケージの基本設定を継承しています。

## WebSocket通信

HMR機能はWebSocketを使用して開発サーバーとブラウザ間で通信を行います：

- **デフォルトURL**: `ws://localhost:8081`
- **メッセージタイプ**: `BUILD_COMPLETE` - ビルド完了通知
- **自動再接続**: 接続失敗時の自動リトライ機能

## 動作原理

1. **ファイル監視**: Viteの監視機能でソースファイルの変更を検知
2. **ビルド実行**: ファイル変更時に自動的にビルドを実行
3. **通知送信**: WebSocket経由でクライアントに変更を通知
4. **自動処理**: 設定に応じてリロードまたはリフレッシュを実行

## デバッグ

HMR機能のデバッグ情報はコンソールに出力されます：

```
[HMR] Connected to dev-server at ws://localhost:8081
[HMR] Build completed, triggering reload...
[HMR] Extension reloaded
```

## 注意事項

- Chrome拡張機能の開発時のみ使用してください
- WebSocketサーバーはデフォルトでポート8081を使用します
- リロード機能使用時は拡張機能の再読込が発生します
- リフレッシュ機能はページレベルでの更新のみ行います
- 本番ビルドではHMR機能は無効化されます

## トラブルシューティング

### 接続エラー
- 開発サーバーが起動しているか確認してください
- ポート8081が他のプロセスで使用されていないか確認してください

### リロードが動作しない
- Chrome拡張機能の管理画面で拡張機能が有効になっているか確認してください
- ブラウザのコンソールでエラーメッセージを確認してください

## ライセンス

このパッケージはプライベートパッケージです。