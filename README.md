{ Chrome Extension with Proxy - テーブルデータAI分析ツール
  "$schema": "<https://json.schemastore.org/tsconfig>",
  "display": "ESLint",るChrome拡張機能**
  "extends": "./packages/tsconfig/base.json",
  "compilerOptions": {I APIを使用して自動的にデータ分析・洞察を提供するモダンなChrome拡張機能です。React + TypeScript + Viteを使用した高速開発環境で、Chrome Extensions Manifest V3をサポートし、Turborepoを使用したモノレポ構成で効率的な開発体験を提供します。
    "noImplicitAny": false,
    "noEmit": true,
    "target": "ESNext",
    "strict": true主要機能
  },
  "include": ["eslint.config.ts", "packages/**/*", "pages/**/*", "chrome-extension/**/*"],ーブルを自動識別
  "exclude": ["**/dist/**", "**/node_modules/**", "**/*.spec.ts"] **🧠 AI分析エンジン**: OpenAI GPTによる高度なデータ分析・洞察生成
}- **🔧 開発/本番切り替え**: モックAPIと本番APIの自動切り替え

- **⚙️ 直感的な設定画面**: APIキー、AIモデル、カスタムプロンプトの簡単設定
- **📱 多様なUI**: ポップアップ、サイドパネル、設定画面、DevTools統合
- **🔥 ホットリロード**: カスタムHMRによる高速開発サイクル

### 対象ユーザー

- **データアナリスト**: Webページのデータを瞬時に分析したい方
- **研究者**: オンラインデータの傾向把握を効率化したい方
- **ビジネスパーソン**: 競合調査や市場分析を自動化したい方
- **開発者**: Chrome拡張機能開発の参考実装を求める方

## 🏗️ 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|---------|------|-----------|------|
| **フロントエンド** | React | 19.1.0 | UI構築 |
| **言語** | TypeScript | 5.8.3 | 型安全性 |
| **ビルド** | Vite | 6.3.5 | 高速ビルド |
| **モノレポ** | Turborepo | 2.5.3 | 並列処理・キャッシュ |
| **スタイリング** | Tailwind CSS | 3.4.17 | モダンCSS |
| **拡張機能** | Manifest V3 | - | 最新セキュリティ |
| **パッケージ管理** | pnpm | 10.12.4 | 高速インストール |
| **AI** | @ai-sdk/* | 1.3.22+ | OpenAI統合 |
| **テスト** | Vitest + WebdriverIO | 3.2.3+ | 単体・E2Eテスト |

## 🚀 クイックスタート

### 前提条件

```bash
# Node.js 22.15.1以上が必要
node --version  # v22.15.1+

# pnpmインストール
npm install -g pnpm
```

### 1. プロジェクトセットアップ

```bash
# リポジトリクローン
git clone https://github.com/tanacchi/chrome-extension-with-proxy.git
cd chrome-extension-with-proxy

# 依存関係インストール
pnpm install
```

### 2. 開発環境起動

```bash
# Chrome向け開発モード
pnpm dev

# Firefox向け開発モード（Firefox開発時）
pnpm dev:firefox
```

### 3. Chrome拡張機能インストール

1. Chrome開発モード起動後、`chrome://extensions`を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. プロジェクトの`dist`ディレクトリを選択

### 4. 初期設定

1. 拡張機能アイコンをクリック→「設定」
2. **開発時**: 「開発用設定をロード」ボタンをクリック（外部モックAPI使用）
3. **本番時**: OpenAI APIキーを入力

## 💻 開発コマンド一覧

### 📦 開発・ビルド

```bash
# 🔥 開発サーバー
pnpm dev           # Chrome開発モード（HMR有効）
pnpm dev:firefox   # Firefox開発モード

# 🏗️ プロダクションビルド
pnpm build         # Chrome向けビルド
pnpm build:firefox # Firefox向けビルド

# 📦 拡張機能パッケージ作成
pnpm zip           # Chrome用ZIPパッケージ
pnpm zip:firefox   # Firefox用ZIPパッケージ
pnpm zip:firefox   # Firefox用ZIPパッケージ
```

### 🔍 品質チェック（**作業完了前必須実行**）

```bash
# ⚡ 必須実行フロー（全作業完了前）
pnpm lint && pnpm type-check && pnpm build

# 🔎 個別実行
pnpm lint          # Biome lint実行
pnpm lint:fix      # lint自動修正
pnpm type-check    # TypeScript型チェック
pnpm format        # コードフォーマット
```

### 🧪 テスト

```bash
# 🤖 E2Eテスト（推奨：ヘッドレス）
pnpm e2e           # Chrome E2E（ヘッドレス）
pnpm e2e:firefox   # Firefox E2E（ヘッドレス）
pnpm e2e:headed    # Chrome E2E（ブラウザ表示）

# 📊 レポート生成
pnpm e2e:report         # テスト+HTMLレポート生成
pnpm e2e:report:open    # レポートをブラウザで表示

# 🔬 単体テスト
pnpm test               # Vitestテスト実行
pnpm test:watch         # Vitestウォッチモード
pnpm test:ui            # Vitest UIモード
pnpm test:storage       # Storageパッケージテスト
pnpm test:ai-api        # AI APIパッケージテスト
pnpm test:content       # Content Scriptテスト
pnpm test:coverage      # カバレッジ付きテスト
```

### 🛠️ ユーティリティ

```bash
# 🧹 クリーンアップ
pnpm clean                     # 全クリーンアップ
pnpm clean:bundle             # ビルド成果物削除
pnpm clean:install            # クリーン再インストール

# 🛠️ その他
pnpm module-manager           # モジュール管理ツール
```

## 📁 プロジェクト構造と開発ガイド

### アーキテクチャ概要

```text
chrome-extension-with-proxy/
├── 🏗️ chrome-extension/      # Chrome拡張機能本体
├── 📄 pages/                # UI画面群（Popup/Options/Content Script等）
├── 📦 packages/             # 共有ライブラリ（Storage/AI API/UI等）
├── 🧪 tests/               # E2Eテスト
├── 🌐 dev-servers/         # 開発用サーバー
├── 📝 scripts/             # ビルドスクリプト・環境設定
└── 📋 *.md                 # ドキュメント（README.md、CLAUDE.md等）
```

### 機能別開発ガイド

#### 🧠 AI分析機能の修正

**修正対象ディレクトリ**:

- `packages/ai-api/` - AI分析ロジック・API通信
- `chrome-extension/src/background/ai-api-handler.ts` - Background Script
- `pages/content/src/ai-analysis.ts` - Content Script内AI実行

**主要ファイル**:

```bash
packages/ai-api/lib/
├── client/openai-client.ts    # OpenAI API通信
├── hooks/use-analysis.ts      # React AI分析フック
├── services/prompt-service.ts # プロンプト構築
└── utils/error-handler.ts     # エラーハンドリング
```

#### ⚙️ UI画面の修正

**各画面別ディレクトリ**:

```bash
pages/
├── popup/           # ツールバーポップアップ → 基本情報表示
├── options/         # 設定画面 → AI設定・APIキー管理
├── side-panel/      # サイドパネル → AI分析実行画面
├── content/         # Content Script → テーブル検出・分析
├── content-ui/      # ウェブページ内UI → 分析ボタン・結果表示
├── content-runtime/ # Content Runtime Scripts
├── devtools/        # DevTools → 開発者向け機能
├── devtools-panel/  # DevToolsパネル
└── new-tab/         # 新しいタブ画面
```

**UI修正手順**:

1. 対応ディレクトリの`src/`配下を編集
2. `packages/ui/lib/components/`の共通コンポーネント活用
3. `pnpm dev`でリアルタイム確認

#### 💾 データ管理機能の修正

**修正対象**: `packages/storage/`

```bash
packages/storage/lib/
├── ai-settings-storage.ts     # AI設定永続化
├── base/base.ts              # ストレージ基盤
└── types.ts                  # 型定義
```

**新しいストレージ追加手順**:

1. `types.ts`に型定義追加
2. `lib/`配下に新ストレージファイル作成
3. `index.mts`でエクスポート

#### 🧪 テストの追加・修正

**E2Eテスト**: `tests/e2e/specs/`

- `ai-analysis.test.ts` - AI分析機能テスト
- `page-*.test.ts` - 各画面テスト

**単体テスト**: 各パッケージの同階層

- `*.spec.ts`形式で実装
- テスト記述は**必ず日本語**

## 🔧 開発環境詳細設定

### Windows開発者向け

```bash
# 管理者権限でターミナル起動（必須）
# PowerShellまたはコマンドプロンプトを管理者として実行
pnpm dev
```

### WSL環境での開発

```bash
# VS Code Remote-WSL拡張機能使用推奨
code . # WSL内でVS Code起動
```

### Firefox開発時

```bash
# Firefox開発モード
pnpm dev:firefox

# Firefox拡張機能インストール
# about:debugging#/runtime/this-firefox → 一時的なアドオンを読み込む
# dist/manifest.json を選択
```

## 🏃‍♂️ 実際の使用手順

### 1. 開発環境での動作確認

```bash
# 1. 開発サーバー起動
pnpm dev

# 2. テスト用HTMLサーバー起動（別ターミナル）
cd dev-servers/sample-html
pnpm dev  # localhost:3000でサンプルページ提供

# 3. Chrome拡張機能で localhost:3000 にアクセス
# 4. サイドパネルでAI分析実行
```

### 2. 本番環境での使用

```bash
# 1. プロダクションビルド
pnpm build

# 2. ZIPパッケージ作成
pnpm zip

# 3. Chrome Web Storeへアップロード
# dist.zip を Chrome Developer Dashboard に提出
```

## 🌟 開発・本番モード切り替え

### 開発モード（外部モックAPI使用）

1. 設定画面で「開発用設定をロード」ボタンクリック
2. APIキーが`sk-test-development-api-key-placeholder`に設定
3. 外部モックAPIサービス（`https://api.openai-mock.com/v1`）を自動使用
4. OpenAI APIキー不要で即座にテスト可能

### 本番モード（OpenAI API使用）

1. OpenAI APIキーを設定画面で入力
2. 実際のOpenAI APIに接続
3. 使用料金が発生するため注意

## 📊 プロジェクト品質指標

### テストカバレッジ

- **Storage Package**: 82.42%
- **E2Eテスト**: 11ファイル、Chrome/Firefox並列実行
- **HTMLレポート**: Allure形式で詳細分析可能

### 開発効率

- **Turborepo**: 最大12並列実行
- **HMR**: カスタムホットリロード対応
- **Biome**: ESLint + Prettier統合による高速lint

## 🚨 重要な注意事項

### 必須遵守事項

1. **品質チェック必須実行**:

   ```bash
   pnpm lint && pnpm type-check && pnpm build
   ```

2. **Git操作禁止事項**:
   - `git reset`、`git reflog`は**絶対使用禁止**
   - 代替: `git stash`、`git revert`、`git restore`使用

3. **テスト方針**:
   - テストのskip・削除は**完全禁止**
   - 全テスト記述は**日本語必須**

### セキュリティ

- APIキーは`dev-config.json`に直接記述せず、設定画面から入力
- 本番ビルド時は開発用設定を除外
- Content Security Policy（CSP）遵守

## 📚 コードアーキテクチャ詳細

### 🔄 処理フロー

#### AI分析実行の流れ

1. **ユーザー操作**: サイドパネルで「AI分析実行」ボタンクリック
2. **テーブル検出**: Content Scriptがページ内のHTMLテーブルを自動検出
3. **データ抽出**: テーブルからテキストデータを構造化して抽出
4. **Background Script通信**: Content ScriptからBackground Scriptへメッセージ送信
5. **API選択**: 開発/本番モードに応じてOpenAI API/外部モックAPIを選択
6. **AI分析**: プロンプトと共にテーブルデータをAIに送信
7. **結果表示**: 分析結果をサイドパネルに表示

#### 設定変更の流れ

1. **設定画面アクセス**: Options画面またはサイドパネル設定タブ
2. **リアルタイム保存**: 設定変更時にChrome Local Storageへ即座に保存
3. **全コンポーネント同期**: Storage変更イベントで全UI画面が自動更新

### 🔧 開発時の重要ファイル

#### Core Background Script

- `chrome-extension/src/background/ai-api-handler.ts` - AI API通信の核心部分
- `chrome-extension/src/background/index.ts` - Background Scriptエントリーポイント

#### AI分析システム

- `packages/ai-api/lib/client/openai-client.ts` - OpenAI API通信クライアント
- `packages/ai-api/lib/hooks/use-analysis.ts` - React AI分析フック
- `packages/ai-api/lib/services/prompt-service.ts` - プロンプト構築ロジック

#### Content Scripts

- `pages/content/src/table-detection.ts` - テーブル検出・データ抽出
- `pages/content/src/ai-analysis.ts` - Content Script内AI分析実行
- `pages/content/src/ui-injection.ts` - ウェブページUI注入

#### Storage System

- `packages/storage/lib/ai-settings-storage.ts` - AI設定専用ストレージ
- `packages/storage/lib/base/base.ts` - ストレージ基盤システム

### 🧪 テスト環境詳細

#### E2Eテスト構成

- **WebDriverIO**: ブラウザ自動化フレームワーク
- **Chrome/Firefox並列実行**: 複数ブラウザでの同時テスト
- **Allure HTMLレポート**: 詳細なテスト結果可視化
- **スクリーンショット**: 失敗時の自動キャプチャ

#### 重要テストファイル

- `tests/e2e/specs/ai-analysis.test.ts` - AI分析機能の包括的テスト
- `tests/e2e/specs/ai-analysis-basic.test.ts` - 基本的なAI分析機能テスト
- `tests/e2e/helpers/ai-analysis-helpers.ts` - AI分析テスト用ヘルパー

### 🌐 開発サーバー

#### Sample HTML Server

- **URL**: `http://localhost:3000`
- **目的**: E2Eテスト用のサンプルテーブル提供
- **起動**: `cd dev-servers/sample-html && pnpm dev`
- **提供コンテンツ**: AI分析対象のテストテーブル

## 📚 詳細ドキュメント

- **[CLAUDE.md](./CLAUDE.md)**: AI向け開発ガイドライン（強制力有り）

## 🔗 関連リンク

- **OpenAI API**: [https://openai.com/api/](https://openai.com/api/)
- **Chrome Extensions**: [https://developer.chrome.com/docs/extensions/](https://developer.chrome.com/docs/extensions/)
- **WebdriverIO**: [https://webdriver.io/](https://webdriver.io/)

## 📄 ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)を参照

---

## 🎯 新規参画者ガイド

### 📖 学習ステップ

1. **README.md（このファイル）**: プロジェクト全体概要・技術スタック・開発手順
2. **CLAUDE.md**: AI向け開発ガイドライン（強制力有り）・品質基準・禁止事項
3. **実際の開発開始**: 環境構築→サンプル実行→コード理解

### 🚀 初回セットアップフロー

```bash
# 1. 環境準備
node --version  # v22.15.1以上必須
npm install -g pnpm

# 2. プロジェクト取得・セットアップ
git clone https://github.com/tanacchi/chrome-extension-with-proxy.git
cd chrome-extension-with-proxy
pnpm install

# 3. 開発サーバー起動
pnpm dev

# 4. Chrome拡張機能インストール
# chrome://extensions → デベロッパーモード有効 → distディレクトリ選択

# 5. 動作確認
# 設定画面で「開発用設定をロード」→サイドパネルでAI分析実行
```

### ❓ よくある質問

**Q: OpenAI APIキーが必要ですか？**
A: 開発時は不要です。「開発用設定をロード」で外部モックAPIを使用できます。

**Q: どのブラウザで開発すべきですか？**
A: Chrome推奨。Firefox開発時は`pnpm dev:firefox`を使用。

**Q: テストはどう実行しますか？**
A: `pnpm e2e`でE2Eテスト、`pnpm test`で単体テスト実行。

**Q: コード修正後の確認方法は？**
A: `pnpm lint && pnpm type-check && pnpm build`で品質チェック必須。

**🎯 新規参画者へ**: まずこのREADMEで全体を把握し、[CLAUDE.md](./CLAUDE.md)の開発ガイドラインを確認してから開発を開始してください。
