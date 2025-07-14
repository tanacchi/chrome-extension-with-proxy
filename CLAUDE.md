📘 LLM向け プロジェクト共通指示テンプレート

本ファイルは、ChatGPT や Claude などの LLM にプロジェクト文脈を正しく理解させ、意図に沿った提案・生成をさせるための指示集です。必要に応じて内容を追記・修正してください。

⸻

# Chrome Extension with Proxy - AI Assistant Guidelines

以下のガイドに厳密に従うこと。

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

🔧 開発ルール

必須実行フロー

コード修正やタスク完了前に以下を必ず実行して、壊れないことを確認してください：

```bash
pnpm lint && pnpm type-check && pnpm build
```

パッケージ管理

- 全プロジェクト: pnpm ワークスペースで統一管理
- 注意: npm や yarn は使わず、必ず pnpm を使用すること
- 共有パッケージは `@extension/` プレフィックスを使用
- ワークスペース内パッケージは `workspace:*` で参照

主要なコマンド

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

コーディング規約

TypeScript・React

- **関数スタイル**: アロー関数を推奨（`func-style: ['error', 'expression']`）
- **インポート順序**: `import-x/order`ルールに従う
- **型インポート**: `@typescript-eslint/consistent-type-imports`を使用
- **React**: JSXでのReactインポート不要（`react/react-in-jsx-scope: 'off'`）
- **厳密な型定義**: any 型の使用を禁止（テスト以外）

テスト記述規約

- **テスト記述言語**: すべてのテスト（E2E・単体テスト）のdescribe()・it()は**日本語で記述**する
- **テストファイル形式**: `*.spec.ts`または`*.test.ts`を使用
- **テストファイル配置**: `*.spec.ts` 形式でテスト対象と同じディレクトリに配置

🧪 テスト実行

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

📝 重要な注意事項

1. 破壊的変更の防止

- 必ず以下を実行してから変更を完了する

```bash
pnpm lint && pnpm type-check && pnpm build
```

- TypeScript エラーは0個にする
- E2Eテストが通ることを確認

2. 拡張機能開発

- Manifest V3に準拠
- 開発時は `<all_urls>` 権限を使用（本番では最小限に制限）
- Chrome/Firefox両対応
- HMR（Hot Module Reload）対応

3. AI分析機能

- **依存関係**: `@ai-sdk/react` および `@ai-sdk/openai` を使用
- **モックファースト**: モックAPIサーバーで開発後、OpenAI APIに切り替え
- **段階的実装**: TASKS.mdの全フェーズを順次実行

4. 環境変数管理

- `CLI_CEB_*` プレフィックス：CLI経由でのみ編集可能
- `CEB_*` プレフィックス：手動編集可能
- `bash-scripts/set_global_env.sh`でグローバル環境変数を設定

🚨 開発時の注意点

コマンド実行

- コマンド実行時は必ず終了コードを確認し、異常終了したのなら原因を注意深く調査してください。
- 同じ問題（テストや lint が通らない、pnpm コマンドが失敗するなど）に対して３回修正を試みて解決が見込めなかった場合は問題を簡単にまとめてユーザに報告し、作業を止める

テスト方針

- テストがうまく実行できないからといって決してそのテストに対し skip や削除をしてはならない。根本解決を目指すこと。
- すべてのテスト（E2E・単体テスト）のdescribe()・it()は**日本語で記述**する

開発環境

- Windowsでは管理者権限で `pnpm dev` を実行
- Node.js 22.15.1以上が必要
- WSL環境では VS CodeのRemote-WSL拡張機能を使用

⸻

🔄 作業ごとのワークフロー

1. 課題の把握と計画立案

- 問題が発生した場合、まず徹底的に調査する。
- コードベースで関連ファイルを読み、状況を正確に把握する。
- **仕様書確認**: 実装前にSPECIFICATION.mdで仕様を確認する
- TASKS.md に計画を書き出し、完了できるようなチェックリスト（ToDo形式）を作成すること。

2. 作業前のレビュー

- 作業を開始する前に、計画とToDoリストを作成したうえで私（レビュワー）に連絡を取り、計画を確認してもらうこと。
- 範囲の広い開発の場合は、事前に簡単な設計（シーケンス図、フロー図など）を作成し、承認を得る
- 類似のコードが存在する場合は、そのコーディングスタイルと方針に従って実装する
- 類似のコードがない場合は、コードの簡略版サンプルを作成し、指示者に承認を得てから本格的な開発に着手する

3. 実施と追跡

- 承認後、ToDo項目に基づいて作業を進め、完了したらチェックマークを付ける。
- 各ステップごとに「どのような変更を加えたか」を簡潔に説明すること。
- タスク・コード変更は可能な限りシンプルに保つ。複雑な変更は避け、影響範囲は最小限とする。
- テスト駆動開発（TDD）を実践：先にテストを実装してから本体コードを開発する
- 小さな単位で実装を進め、こまめに動作確認を行う

4. 作業記録とコミット

- 作業が完了したら、変更内容を適切に記録・共有する
- **仕様変更が必要な場合**: SPECIFICATION.mdを更新し、関連ドキュメントも合わせて修正する
- すべて完了後、git commit を行い変更を反映させる。

📋 Git管理ルール

ブランチ戦略

- **フェーズ管理**: フェーズが変わるごとに `phase-X` ブランチを作成（Xは数字）
- **作業単位でのコミット**: 意味のある作業単位で定期的に `git commit` を実行
- **コミットメッセージ**: 明確で理解しやすいメッセージを記述
  - 1行目: 変更内容の簡潔な要約
  - 2行目: 空行
  - 3行目以降: 修正の経緯や詳細説明（必要に応じて）

Git操作の禁止事項

- **絶対に使用しない**: `git reset`、`git reflog`
- **推奨される代替手段**:
  - 変更の一時保存: `git stash`
  - 変更の取り消し: `git revert`
  - ファイルの復元: `git restore`

ブランチ命名規則

- **フェーズブランチ**: `phase-X` （Xは数字）
  - 例: `phase-1`, `phase-2`, `phase-3`
- **機能ブランチ**: `feature/機能名`
- **修正ブランチ**: `fix/修正内容`

⸻

重要: このガイドラインに従い、常に品質と安定性を保ちながら開発を進めてください。変更前後で必ずテストを実行し、破壊的変更を防止してください。
