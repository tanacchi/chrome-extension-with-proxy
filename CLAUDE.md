# Chrome Extension with Proxy - AI Assistant Guidelines

**CRITICAL: このガイドラインは絶対に遵守すること。違反は一切許可されない。**

**AI ASSISTANT STRICT REQUIREMENTS:**

- 全ての指示を文字通り実行すること
- 独断での判断・省略・簡略化は禁止
- 不明な点は必ず確認を求めること
- 作業前に必ず計画を提示し、承認を得ること

🚨 **絶対厳守事項 - ABSOLUTE REQUIREMENTS**

以下は例外なく遵守すること。違反した場合は即座に作業を停止し、問題を報告すること。

1. **コード品質の絶対保証**

```bash
# 全ての作業完了前に必須実行 - NO EXCEPTIONS
pnpm lint && pnpm type-check && pnpm build
```

2. **SPECIFICATION.md の絶対同期**

- 仕様追加・変更時は**必ず**SPECIFICATION.mdを更新
- 実装前に**必ず**仕様書の内容を確認
- 仕様変更時は関連ドキュメントも**必ず**同期更新

3. **テスト駆動開発の絶対実践**

- **必ず**テスト実装→本体実装の順序を守る
- テストのskip・削除は**絶対禁止**
- 全てのテストは**必ず**日本語で記述

4. **Git操作の絶対禁止事項**

- `git reset`、`git reflog`の使用は**絶対禁止**
- 破壊的変更は**一切許可しない**

📋 プロジェクト概要

Chrome Extension with Proxy は、テーブルデータAI分析機能を提供するChrome拡張機能です。

技術スタック

- **React**: 19.1.0
- **TypeScript**: 5.8.3
- **Vite**: 6.3.5 (ビルドツール)
- **Turborepo**: 2.5.3 (モノレポ管理)
- **Tailwind CSS**: 3.4.17
- **Chrome Extensions Manifest V3**
- **pnpm**: 10.11.0 (パッケージマネージャー)
- **AI SDK**: @ai-sdk/react + @ai-sdk/openai
- **テスト**: Vitest + WebdriverIO (E2E)

仕様書管理

プロダクトの詳細仕様は [SPECIFICATION.md](./SPECIFICATION.md) で管理されています。

**重要事項:**

- **仕様追加・変更時は必ずSPECIFICATION.mdを更新すること**
- **実装前に仕様書の内容を確認すること**
- **仕様変更がある場合は関連ドキュメント（README.md、CLAUDE.md等）も合わせて更新すること**

📁 ディレクトリ構造

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

🔧 **強制開発ルール - MANDATORY DEVELOPMENT RULES**

**CRITICAL EXECUTION FLOW - 絶対実行フロー**

全ての作業完了前に以下のコマンドを**例外なく**実行すること：

```bash
pnpm lint && pnpm type-check && pnpm build
```

**FAILURE IS NOT ACCEPTABLE - 失敗は許可されない**

**PACKAGE MANAGEMENT - 絶対的パッケージ管理規則**

- pnpm以外のパッケージマネージャー使用は**絶対禁止**
- npm、yarn使用は**完全禁止**
- `@extension/`プレフィックス以外の共有パッケージ命名は**禁止**
- `workspace:*`以外の参照方式は**禁止**

**MANDATORY COMMANDS - 強制実行コマンド群**

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

⚡ **NON-NEGOTIABLE CODING STANDARDS - 絶対遵守コーディング規約**

**TypeScript・React - ABSOLUTE REQUIREMENTS**

- **MANDATORY**: アロー関数のみ使用（関数宣言は**絶対禁止**）
- **MANDATORY**: `import-x/order`ルール厳格遵守
- **MANDATORY**: `@typescript-eslint/consistent-type-imports`強制使用
- **MANDATORY**: any型使用は**完全禁止**（テスト以外）
- **MANDATORY**: JSXでのReactインポート**絶対禁止**

**TEST REQUIREMENTS - 絶対的テスト要件**

- **MANDATORY**: 全テストのdescribe()・it()は**日本語のみ**
- **MANDATORY**: `*.spec.ts`形式のみ許可
- **MANDATORY**: テスト対象と**完全同一**ディレクトリ配置
- **ABSOLUTE PROHIBITION**: テストのskip・削除は**死罪レベル**で禁止

🧪 **MANDATORY TEST EXECUTION - 強制テスト実行**

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
- Node.js 22.15.1未満は**動作不保証**
- WSL環境でのRemote-WSL拡張未使用は**環境違反**

⸻

🎯 **MANDATORY WORKFLOW EXECUTION - 強制ワークフロー実行**

**ZERO DEVIATION ALLOWED - 逸脱は一切許可されない**

### 1. 課題の把握と計画立案 - MANDATORY PHASE

**ABSOLUTE REQUIREMENTS:**

- 問題発生時は**完全な徹底調査**を実行すること
- コードベースの関連ファイル**全て**を読むこと
- SPECIFICATION.mdの仕様確認は**絶対必須**
- TASKS.mdへの計画記載は**完全義務**
- ToDo形式以外のチェックリストは**禁止**

### 2. 作業前のレビュー - MANDATORY APPROVAL PHASE

**CRITICAL CHECKPOINT:**

- 計画とToDoリスト**完全作成後**にレビュワーへ連絡**必須**
- 広範囲開発時の設計図作成は**絶対必須**
- 類似コード存在時は**完全準拠**必須
- 類似コード非存在時のサンプル作成・承認は**絶対必須**

### 3. 実施と追跡 - MANDATORY EXECUTION PHASE

**STRICT EXECUTION RULES:**

- ToDo項目ベースの作業進行は**絶対必須**
- 完了時のチェックマーク**即座付与**必須
- 各ステップの変更説明は**完全義務**
- シンプル実装以外は**完全禁止**
- TDD実践（テスト→実装）は**絶対順序**
- 小単位実装・動作確認は**強制実行**

### 4. 作業記録とコミット - MANDATORY COMPLETION PHASE

**FINAL CHECKPOINT:**

- 変更内容の記録・共有は**完全義務**
- 仕様変更時のSPECIFICATION.md更新は**絶対必須**
- git commit前の**完全確認**は絶対必須

📋 **ABSOLUTE GIT MANAGEMENT RULES - 絶対Git管理規則**

**BRANCH STRATEGY - 絶対ブランチ戦略**

- フェーズ管理での`phase-X`ブランチ作成は**絶対必須**
- 作業単位での定期的`git commit`は**強制実行**
- コミットメッセージの明確記述は**完全義務**

**ABSOLUTE PROHIBITION - 絶対禁止事項**

- `git reset`、`git reflog`使用は**死罪レベル**違反
- 破壊的変更は**プロジェクト終了レベル**違反

**MANDATORY ALTERNATIVES - 強制代替手段**

- 変更一時保存: `git stash`**のみ**許可
- 変更取消: `git revert`**のみ**許可
- ファイル復元: `git restore`**のみ**許可

**BRANCH NAMING ENFORCEMENT - ブランチ命名強制**

- フェーズブランチ: `phase-X`**以外禁止**
- 機能ブランチ: `feature/`**プレフィックス必須**
- 修正ブランチ: `fix/`**プレフィックス必須**

⸻

🚨 **FINAL WARNING - 最終警告**

このガイドラインは**法的契約**レベルで遵守すること。違反は**即座に作業停止**し、**完全な再計画**を要求する。品質と安定性は**交渉不可能**な絶対要件である。テスト実行なしの変更報告は**重大な契約違反**とみなす。
