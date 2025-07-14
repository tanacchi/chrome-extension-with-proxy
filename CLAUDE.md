# Chrome Extension with Proxy - AI Assistant Guidelines

**重要: このガイドラインは必ず遵守しなければならない。**

**AI ASSISTANT 要件:**

- 全ての指示を正確に実行すること
- 独断での判断・省略・簡略化は禁止
- 不明な点は必ず確認を求めること
- 作業前に必ず計画を提示し、承認を得ること

🚨 **必須遵守事項**

以下は例外なく遵守しなければならない。違反した場合は即座に作業を停止し、問題を報告すること。

1. **コード品質の保証**

```bash
# 全ての作業完了前に必ず実行すること
pnpm lint && pnpm type-check && pnpm build
```

2. **仕様書の同期管理**

- 仕様追加・変更時は**必ず**README.mdを更新しなければならない
- 実装前に**必ず**仕様の内容を確認すること
- 仕様変更時は関連ドキュメントも**必ず**同期更新すること

3. **テスト駆動開発の実践**

- **必ず**テスト実装→本体実装の順序を守ること
- テストのskip・削除は**禁止**
- 全てのテストは**必ず**日本語で記述すること

4. **Git操作の禁止事項**

- `git reset`、`git reflog`の使用は**禁止**
- 破壊的変更は許可しない

## 📋 プロジェクト概要

Chrome Extension with Proxy は、テーブルデータAI分析機能を提供するChrome拡張機能です。

## 🔧 技術スタック

- **React**: 19.1.0
- **TypeScript**: 5.8.3
- **Vite**: 6.3.5 (ビルドツール)
- **Turborepo**: 2.5.3 (モノレポ管理)
- **Tailwind CSS**: 3.4.17
- **Chrome Extensions Manifest V3**
- **pnpm**: 10.11.0 (パッケージマネージャー)
- **AI SDK**: @ai-sdk/react + @ai-sdk/openai
- **テスト**: Vitest + WebdriverIO (E2E)

## 📚 仕様書管理

プロダクトの詳細仕様は [README.md](./README.md) で管理されています。

**重要事項:**

- **仕様追加・変更時は必ずREADME.mdを更新しなければならない**
- **実装前に仕様書の内容を注意深く確認すること**
- **仕様変更がある場合は関連ドキュメント（CLAUDE.md等）も合わせて更新すること**

## 📁 ディレクトリ構造

```
chrome-extension-with-proxy/
├── chrome-extension/          # Chrome拡張機能本体
│   ├── manifest.ts           # Manifest設定
│   ├── src/background/       # Background Script
│   └── public/               # アイコン・CSS
├── pages/                    # 拡張機能のUIページ群
│   ├── popup/               # ポップアップ画面
│   ├── options/             # オプション画面
│   ├── new-tab/             # 新しいタブ画面
│   ├── side-panel/          # サイドパネル
│   ├── devtools/            # DevTools
│   ├── content/             # Content Scripts
│   ├── content-ui/          # Content UI Components
│   └── content-runtime/     # Content Runtime Scripts
├── packages/                # 共有パッケージ
│   ├── shared/              # 共通型定義・ユーティリティ
│   ├── storage/             # ストレージヘルパー
│   ├── i18n/                # 国際化
│   ├── hmr/                 # Hot Module Reload
│   ├── ui/                  # UI コンポーネント
│   └── ai-api/              # AI API クライアント
├── tests/                   # E2Eテスト
├── dev-servers/             # 開発用サーバー
│   └── sample-html/         # サンプルHTMLサーバー
└── CLAUDE.md                # このファイル
```

## 🔧 開発ルール

### 重要な実行フロー

全ての作業完了前に以下のコマンドを必ず実行しなければならない：

```bash
pnpm lint && pnpm type-check && pnpm build
```

### パッケージ管理規則

- pnpm以外のパッケージマネージャー使用は禁止
- npm、yarn使用は禁止
- `@extension/`プレフィックス以外の共有パッケージ命名は禁止
- `workspace:*`以外の参照方式は禁止

### 必須実行コマンド群

```bash
# 開発
pnpm dev           # Chrome向け開発モード
pnpm dev:firefox   # Firefox向け開発モード

# ビルド
pnpm build         # Chrome向けプロダクションビルド
pnpm build:firefox # Firefox向けプロダクションビルド

# 品質チェック
pnpm lint          # Biome lint実行
pnpm lint:fix      # Biome lint自動修正
pnpm type-check    # TypeScript型チェック
pnpm format        # Biome format実行

# E2Eテスト（デフォルト：ヘッドレス）
pnpm e2e           # Chrome E2Eテスト（ヘッドレス）
pnpm e2e:firefox   # Firefox E2Eテスト（ヘッドレス）
pnpm e2e:headed    # Chrome E2Eテスト（ブラウザ表示）

# パッケージング
pnpm zip           # 拡張機能のZIPパッケージ作成
```

## ⚡ コーディング規約

### TypeScript・React要件

- **必須**: アロー関数のみ使用（関数宣言は禁止）
- **必須**: `import-x/order`ルール厳格遵守
- **必須**: `@typescript-eslint/consistent-type-imports`強制使用
- **必須**: any型使用は禁止（テスト以外）
- **必須**: JSXでのReactインポート禁止

### テスト要件

- **必須**: 全テストのdescribe()・it()は**日本語のみ**
- **必須**: `*.spec.ts`形式のみ許可
- **必須**: テスト対象と**完全同一**ディレクトリ配置
- **禁止**: テストのskip・削除は厳禁

## 🧪 テスト実行

```bash
# E2E テスト
pnpm e2e                      # Chrome E2Eテスト（ヘッドレス）
pnpm e2e:firefox              # Firefox E2Eテスト（ヘッドレス）
pnpm e2e:headed               # Chrome E2Eテスト（ブラウザ表示）
pnpm e2e:firefox:headed       # Firefox E2Eテスト（ブラウザ表示）

# HTMLレポート生成
pnpm e2e:report               # E2Eテスト実行 + HTMLレポート生成
pnpm e2e:report:open          # 生成済みレポートをブラウザで開く
pnpm e2e:report:serve         # レポートサーバーを起動して表示

# 単体テスト
pnpm test                     # Vitest実行（該当パッケージで）
```

� **CRITICAL VIOLATIONS - 致命的違反事項**

以下の違反は**即座に作業停止**し、ユーザーへの謝罪と再計画を要求する：

**IMMEDIATE TERMINATION TRIGGERS - 即座停止トリガー**

1. **破壊的変更の防止 - ZERO TOLERANCE**

```bash
# これを実行せずに作業完了を報告した場合は重大違反
pnpm lint && pnpm type-check && pnpm build
```

- TypeScriptエラー1個でも存在は**完全失格**
- E2Eテスト失敗は**プロジェクト終了レベル**

1. **拡張機能開発 - MANIFEST V3 ABSOLUTE COMPLIANCE**

- Manifest V3以外は**完全禁止**
- 本番環境での`<all_urls>`権限は**死罪レベル**違反
- Firefox/Chrome両対応は**絶対必須**
- HMR非対応は**開発効率違反**

1. **AI分析機能 - STRICT DEPENDENCY CONTROL**

- `@ai-sdk/react`、`@ai-sdk/openai`以外のAI SDK使用は**絶対禁止**
- モックファースト以外の開発手法は**完全禁止**
- TASKS.mdのフェーズスキップは**重大違反**

1. **環境変数管理 - SECURITY CRITICAL**

- `CLI_CEB_*`プレフィックス以外のCLI変数は**セキュリティ違反**
- `CEB_*`プレフィックス以外の手動変数は**規約違反**
- `bash-scripts/set_global_env.sh`以外のグローバル設定は**禁止**

� **DEVELOPMENT EXECUTION PROTOCOL - 開発実行プロトコル**

**VIOLATION CONSEQUENCES - 違反時の結果**

- 同一問題で3回失敗 → **即座に作業停止**
- テストskip/削除 → **プロジェクト永久BAN**
- コマンド実行時異常終了の未調査 → **重大過失**
- 終了コード無視 → **品質管理違反**

**ABSOLUTE DEVELOPMENT ENVIRONMENT REQUIREMENTS**

- Windows: 管理者権限なしでの`pnpm dev`実行は**完全禁止**
- Node.js 22.15.1未満は動作不保証
- WSL環境でのRemote-WSL拡張未使用は環境違反

---

## 🎯 ワークフロー実行

### 1. 課題の把握と計画立案

**要件:**

- 問題発生時は注意深く徹底調査を実行すること
- コードベースの関連ファイル**全て**を読むこと
- README.mdの仕様確認は**必須**
- 計画記載は必須
- ToDo形式以外のチェックリストは禁止

### 2. 作業前のレビュー

**チェックポイント:**

- 計画とToDoリスト**完全作成後**にレビュワーへ連絡**必須**
- 広範囲開発時の設計図作成は**必須**
- 類似コード存在時は**完全準拠**必須
- 類似コード非存在時のサンプル作成・承認は**必須**

### 3. 実施と追跡

**実行規則:**

- ToDo項目ベースの作業進行は**必須**
- 完了時のチェックマーク**即座付与**必須
- 各ステップの変更説明は**必須**
- シンプル実装以外は禁止
- TDD実践（テスト→実装）は**必須順序**
- 小単位実装・動作確認は必須

### 4. 作業記録とコミット

**最終チェックポイント:**

- 変更内容の記録・共有は**必須**
- 仕様変更時のREADME.md更新は**必須**
- git commit前の**完全確認**は必須

## 📋 Git管理規則

### ブランチ戦略

- フェーズ管理での`phase-X`ブランチ作成は**必須**
- 作業単位での定期的`git commit`は必須
- コミットメッセージの明確記述は**必須**

### 禁止事項

- `git reset`、`git reflog`使用は禁止
- 破壊的変更は禁止

### 代替手段

- 変更一時保存: `git stash`**のみ**許可
- 変更取消: `git revert`**のみ**許可
- ファイル復元: `git restore`**のみ**許可

### ブランチ命名規則

- フェーズブランチ: `phase-X`**以外禁止**
- 機能ブランチ: `feature/`**プレフィックス必須**
- 修正ブランチ: `fix/`**プレフィックス必須**

---

## 🚨 最終警告

このガイドラインは必ず遵守しなければならない。違反は即座に作業停止し、再計画を要求する。品質と安定性は重要な要件である。テスト実行なしの変更報告は重大な違反とみなす。
