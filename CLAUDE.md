# Chrome Extension Boilerplate with Proxy - 開発ガイド

## プロジェクト概要

このプロジェクトは、プロキシ機能を提供するChrome拡張機能です。
React + TypeScript + Viteを使用したモダンな開発環境で、Chrome Extensions Manifest V3をサポートし、Turborepoを使用したモノレポ構成で高速な開発体験を提供します。

### 技術スタック
- **React**: 19.1.0
- **TypeScript**: 5.8.3
- **Vite**: 6.3.5 (ビルドツール)
- **Turborepo**: 2.5.3 (モノレポ管理)
- **Tailwind CSS**: 3.4.17
- **Chrome Extensions Manifest V3**
- **pnpm**: 10.11.0 (パッケージマネージャー)

### 仕様書管理

プロダクトの詳細仕様は [SPECIFICATION.md](./SPECIFICATION.md) で管理されています。

**重要事項:**
- **仕様追加・変更時は必ずSPECIFICATION.mdを更新すること**
- **実装前に仕様書の内容を確認すること**
- **仕様変更がある場合は関連ドキュメント（README.md、CLAUDE.md等）も合わせて更新すること**

## 開発ベストプラクティス

### 1. 計画・設計フェーズ
- 作業開始前に作業内容と方針を詳細に整理し、指示者に確認を取る
- 範囲の広い開発の場合は、事前に簡単な設計（シーケンス図、フロー図など）を作成し、承認を得る
- 要件や仕様に不明な点があれば、必ず事前に確認する

### 2. 実装フェーズ
- **仕様書確認**: 実装前にSPECIFICATION.mdで仕様を確認する
- テスト駆動開発（TDD）を実践：先にテストを実装してから本体コードを開発する
- 既存コードの調査と方針決定：
  - 類似のコードが存在する場合は、そのコーディングスタイルと方針に従って実装する
  - 類似のコードがない場合は、コードの簡略版サンプルを作成し、指示者に承認を得てから本格的な開発に着手する
- 小さな単位で実装を進め、こまめに動作確認を行う
- コードレビューを意識したコーディング（可読性、保守性を重視）

### 3. 品質保証
- 作業が一区切りついた段階で以下を実行：
  - ビルドの実行（コンパイルエラーがないことを確認）
  - テストの実行（既存テストの回帰チェック、新規テストの動作確認）
  - リンタ（lint）の実行（コード品質チェック）
  - 型チェック（TypeScript等の場合）
- 問題が発見された場合は必ず修正してから次のステップに進む

### 4. 確認・報告
- 各段階での作業完了時に指示者への報告・確認を行う
- **仕様変更が必要な場合**: SPECIFICATION.mdを更新し、関連ドキュメントも合わせて修正する
- 想定外の問題や仕様変更が必要な場合は、即座に相談する
- 作業ログや変更内容を適切に記録・共有する

## プロジェクト固有の開発ガイド

### プロジェクト構成

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
│   └── ui/                  # UI コンポーネント
└── tests/                   # E2Eテスト
```

### 主要なコマンド

#### 開発
```bash
pnpm dev           # Chrome向け開発モード
pnpm dev:firefox   # Firefox向け開発モード
```

#### ビルド
```bash
pnpm build         # Chrome向けプロダクションビルド
pnpm build:firefox # Firefox向けプロダクションビルド
```

#### 品質チェック
```bash
pnpm lint          # ESLint実行
pnpm lint:fix      # ESLint自動修正
pnpm type-check    # TypeScript型チェック
pnpm format        # Prettier実行
```

#### テスト・パッケージング
```bash
pnpm e2e           # E2Eテスト実行
pnpm zip           # 拡張機能のZIPパッケージ作成
```

#### 依存関係管理
```bash
# ルートレベルの依存関係追加
pnpm i <package> -w

# 特定モジュールの依存関係追加
pnpm i <package> -F <module-name>
```

### 環境変数管理

プロジェクトでは独自の環境変数管理システムを使用：

- `CLI_CEB_*` プレフィックス：CLI経由でのみ編集可能
- `CEB_*` プレフィックス：手動編集可能
- `bash-scripts/set_global_env.sh`でグローバル環境変数を設定

### コーディング規約

#### TypeScript・React
- **関数スタイル**: アロー関数を推奨（`func-style: ['error', 'expression']`）
- **インポート順序**: `import-x/order`ルールに従う
- **型インポート**: `@typescript-eslint/consistent-type-imports`を使用
- **React**: JSXでのReactインポート不要（`react/react-in-jsx-scope: 'off'`）

#### パッケージ管理
- `type-fest`は`@extension/shared`経由で使用
- 共有パッケージは`@extension/`プレフィックスを使用
- ワークスペース内パッケージは`workspace:*`で参照

#### ESLint設定
- `eslint.config.ts`で設定管理
- TypeScript Project Service使用
- Chrome API用の`chrome`グローバル変数を定義

### 拡張機能開発

#### Manifest設定
- `chrome-extension/manifest.ts`でManifest V3設定
- 開発時は`<all_urls>`権限を使用（本番では最小限に制限）
- Chrome/Firefox両対応

#### Content Scripts
- `pages/content/` - 基本的なコンテンツスクリプト
- `pages/content-ui/` - React UIコンポーネント注入
- `pages/content-runtime/` - ランタイム注入スクリプト

#### ホットリロード
- `packages/hmr/`でカスタムHMRプラグイン実装
- 開発時に自動的にブラウザ拡張機能をリロード

### パフォーマンス最適化

#### Turborepo設定
- 並行実行数：12
- キャッシュは無効化（`cache: false`）
- 依存関係の適切な管理（`dependsOn`）

#### ビルド最適化
- Vite + Rollupによる最適化
- TypeScriptの型チェックは別プロセス実行
- Tree-shakingによる不要コード削除

## セキュリティ

### 基本原則
- 秘密情報やAPIキーをコードに直接記述しない
- 環境変数やシークレット管理システムを活用する
- 入力値の検証を徹底する
- 拡張機能の権限は最小限に制限する

### 拡張機能固有のセキュリティ
- Content Security Policy（CSP）の適切な設定
- Cross-Origin Resource Sharing（CORS）の理解
- ユーザーデータの適切な取り扱い

## 保守性

### 命名規則
- ファイル名：kebab-case
- コンポーネント名：PascalCase
- 関数・変数名：camelCase
- 定数：UPPER_SNAKE_CASE

### モジュール化
- 機能ごとにパッケージを分割
- 責任範囲を明確にする
- 既存のコード規約やパターンに従う
- 適切な型定義を提供

### ドキュメント
- **SPECIFICATION.md**: プロダクト仕様の管理（機能追加・変更時は必須更新）
- **README.md**: 基本的な使用方法・セットアップ手順
- **CLAUDE.md**: 開発ガイド・ベストプラクティス
- 型定義でのコメント記述
- 複雑なロジックには適切なコメント

## Git管理

### コミット規約
- 意味のある単位でコミットを行う
- わかりやすいコミットメッセージを記述する
- 機能追加、バグ修正、リファクタリングなど、変更の種類を明確にする

### ブランチ戦略
- **フェーズ管理**: フェーズが変わるごとに `phase-X` ブランチを作成（Xは数字）
- **作業単位でのコミット**: 意味のある作業単位で定期的に `git commit` を実行
- **コミットメッセージ**: 明確で理解しやすいメッセージを記述
  - 1行目: 変更内容の簡潔な要約
  - 2行目: 空行
  - 3行目以降: 修正の経緯や詳細説明（必要に応じて）
- メインブランチへのマージ前にコードレビューを実施する
- 不要になったブランチは定期的に削除する

### Git操作の禁止事項
- **絶対に使用しない**: `git reset`、`git reflog`
- **推奨される代替手段**: 
  - 変更の一時保存: `git stash`
  - 変更の取り消し: `git revert`
  - ファイルの復元: `git restore`

### ブランチ命名規則
- **フェーズブランチ**: `phase-X` （Xは数字）
  - 例: `phase-1`, `phase-2`, `phase-3`
- **機能ブランチ**: `feature/機能名`
- **修正ブランチ**: `fix/修正内容`

### フェーズ別ブランチ例
- `phase-1`: フェーズ1（計画・設計）
- `phase-2`: フェーズ2（開発・テスト用インフラ整備）  
- `phase-3`: フェーズ3（設定管理機能）
- `phase-4`: フェーズ4（テーブル検出・データ抽出機能）
- 以降同様...

## テスト戦略

### E2Eテスト
- WebdriverIOを使用
- Chrome/Firefox両方でテスト実行
- `tests/e2e/`配下でテスト管理

### テストコマンド
```bash
pnpm e2e           # Chrome E2Eテスト
pnpm e2e:firefox   # Firefox E2Eテスト
```

## デプロイ・配布

### パッケージング
```bash
pnpm zip           # Chrome用ZIPパッケージ作成
pnpm zip:firefox   # Firefox用ZIPパッケージ作成
```

### 配布準備
1. バージョン更新：`pnpm update-version <version>`
2. 本番ビルド：`pnpm build`
3. E2Eテスト：`pnpm e2e`
4. ZIPパッケージ作成：`pnpm zip`

## トラブルシューティング

### 開発環境
- HMRが停止した場合：`Ctrl+C`で停止後、`pnpm dev`で再起動
- `grpc`エラー：`turbo`プロセスを終了後、`pnpm dev`で再起動

### WSL環境
- VS CodeのRemote-WSL拡張機能を使用
- インポート解決の問題はWSLリモート接続で解決

## 重要な注意事項

### 開発時の注意
- Windowsでは管理者権限で`pnpm dev`を実行
- Node.js 22.15.1以上が必要
- 開発時は`<all_urls>`権限を使用するが、本番では最小限に制限

### 本番環境での注意
- 権限は必要最小限に制限する
- マニフェストの`host_permissions`を適切に設定
- セキュリティレビューを実施する

## ドキュメント管理ルール

### 更新責任
1. **SPECIFICATION.md**: 機能仕様の追加・変更時は必ず更新
2. **CLAUDE.md**: 開発プロセスやベストプラクティスの変更時に更新
3. **README.md**: セットアップ手順や基本コマンドの変更時に更新
4. **TASKS.md**: 実装タスクの進捗管理（タスク完了時にチェック）

### 更新タイミング
- 新機能実装前：SPECIFICATION.mdに仕様を記載
- 実装完了時：実装結果に応じてドキュメントを更新
- 仕様変更時：変更内容をSPECIFICATION.mdに反映し、関連ドキュメントも更新

### 品質確保
- ドキュメント間の整合性を保つ
- 古い情報の削除・更新を怠らない
- 実装との乖離を防ぐため定期的な見直しを実施

## タスク管理プロセス

### TASKS.mdの活用
- **実装開始前**: TASKS.mdで作業計画を確認
- **タスク実行時**: 対応するチェックボックスにチェックを入れる
- **フェーズ完了時**: 全体動作確認を実施してから次フェーズに進む

### 進捗管理の原則
- **細かい粒度**: 小さなステップでタスクを分割
- **テスト駆動**: テスト実装 → 実装 → テスト実行の順序を守る
- **継続的確認**: 各タスク完了時に動作確認を実施
- **即座対応**: 不具合発見時は即座に修正し、関連テストを追加

### チェック必須事項
- [ ] タスク完了時のチェックボックスへのチェック
- [ ] 関連するテストの実行・確認
- [ ] 品質チェック（lint、type-check、format）の実行
- [ ] ドキュメントの更新（必要に応じて）

## テーブルデータAI分析ツール開発方針

### 依存関係
- **AI SDK**: `@ai-sdk/react` および `@ai-sdk/openai` を使用
- **単体テスト**: `vitest` を使用
- **テストファイル**: `*.spec.ts` 形式でテスト対象と同じディレクトリに配置

### 開発サーバー配置
- **モックAPIサーバー**: 独立したディレクトリに配置
- **サンプルHTMLサーバー**: 独立したディレクトリに配置
- 必要に応じてAPIサーバーとHTMLサーバーを分離

### 開発プロセス
- **段階的実装**: TASKS.mdの全フェーズを順次実行
- **フェーズごとレビュー**: 各フェーズ完了時に動作確認・レビュー実施
- **モックファースト**: モックAPIサーバーで開発後、OpenAI APIに切り替え

この文書は、プロジェクトの成長とともに定期的に更新し、最新の開発ベストプラクティスを反映させること。