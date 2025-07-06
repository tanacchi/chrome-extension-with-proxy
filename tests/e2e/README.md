# E2Eテストスイート - AI分析機能

このディレクトリには、テーブルデータAI分析ツール Chrome拡張機能のE2E（End-to-End）テストが含まれています。

## テストの概要

### 実装済みテストスイート

1. **ai-analysis.test.ts** - 基本的なAI分析機能のE2Eテスト
   - テーブル検出機能
   - Content Script統合
   - オプション画面との連携
   - エラーハンドリング
   - パフォーマンスとユーザビリティ

2. **ai-analysis-mock.test.ts** - 基本的なAI分析機能テスト
   - 基本機能の確認
   - パフォーマンステスト
   - 異なるテーブル構成への対応

3. **ai-analysis-helpers.ts** - E2Eテスト共通ヘルパー関数
   - サーバーヘルスチェック
   - 拡張機能ページナビゲーション
   - 設定管理
   - パフォーマンス測定

## テスト実行の前提条件

### 必要なサーバー

1. **サンプルHTMLサーバー** (ポート3000)
   ```bash
   cd dev-servers/sample-html
   pnpm start
   ```

2. **Chrome拡張機能のビルド**
   ```bash
   pnpm build
   ```

### ブラウザ設定

- Chrome拡張機能が適切にインストールされている
- Chrome拡張機能がE2Eテスト用に設定されている
- WebDriverが正しく設定されている

## テスト実行コマンド

```bash
# 全E2Eテストの実行
pnpm e2e

# 特定のテストファイルのみ実行
pnpm e2e --spec ai-analysis.test.ts

# ヘッドレスモードでの実行
pnpm e2e:headless

# デバッグモードでの実行
pnpm e2e:debug
```

## テストカバレッジ

### 機能テスト

- [x] テーブル検出（クラス名: `ai-target-table-table`）
- [x] データ抽出（2列目データ）
- [x] Content Script注入と動作
- [x] 分析ボタンの表示と動作
- [x] ローディング状態の表示
- [x] 分析結果の表示
- [x] エラーハンドリング

### UI/UXテスト

- [x] オプション画面の表示と設定保存
- [x] 設定項目の検証（APIキー、モデル、カスタムプロンプト）
- [x] レスポンシブデザインの確認
- [x] 元ページレイアウトへの非侵襲性

### パフォーマンステスト

- [x] 分析完了時間の測定
- [x] メモリ使用量の監視
- [x] 連続分析リクエストの処理
- [x] ページロード時間への影響測定

### エラーシナリオ

- [x] APIキー未設定時のエラー処理
- [x] テーブル未検出時の動作
- [x] ネットワークエラー時の処理
- [x] 無効なAPI応答の処理

### 異なるデータ構成

- [x] 標準的なテーブル構造
- [x] 異なるデータ型（数値、日付、URL）
- [x] 空のテーブル
- [x] 大量データのテーブル

## テスト環境の設定

### Chrome拡張機能のテスト設定

```typescript
// wdio.conf.ts での拡張機能設定例
const extensionPath = path.join(__dirname, '../../dist');

capabilities: [{
  browserName: 'chrome',
  'goog:chromeOptions': {
    args: [
      `--load-extension=${extensionPath}`,
      '--disable-extensions-except=' + extensionPath,
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor'
    ]
  }
}]
```

### AI API設定

テストでは以下のAI APIエンドポイントを使用します：

- 外部モックAPIサービス（https://api.openai-mock.com/v1など）
- 実際のOpenAI API（テスト時は注意が必要）

## 実際のAPIとの統合テスト

### 設定方法

1. `.env.test`ファイルに実際のAPIキーを設定
2. `OPENAI_API_KEY`環境変数を設定
3. 実API用のテストファイルを実行

```bash
# 実APIを使用したテスト（注意：APIコストが発生）
OPENAI_API_KEY=your-real-api-key pnpm e2e:real-api
```

### 注意事項

- 実APIテストはAPIコストが発生します
- レート制限に注意してテスト頻度を調整してください
- 機密データをテストで使用しないでください

## CI/CDでの実行

### GitHub Actions設定例

```yaml
- name: Run E2E Tests
  run: |
    # サンプルサーバー起動
    cd dev-servers/sample-html && pnpm start &
    
    # E2Eテスト実行
    pnpm e2e:ci
  env:
    CI: true
    HEADLESS: true
```

## トラブルシューティング

### よくある問題

1. **拡張機能が読み込まれない**
   - ビルドが完了していることを確認
   - Manifestファイルの構文確認
   - Chrome拡張機能の権限設定確認

2. **テストがタイムアウトする**
   - サーバーが起動していることを確認
   - ネットワーク接続の確認
   - タイムアウト値の調整

3. **要素が見つからない**
   - Content Scriptの注入タイミング確認
   - CSS セレクタの確認
   - 待機条件の調整

### デバッグ方法

```typescript
// ヘルパー関数でのデバッグログ有効化
await collectConsoleLogs();

// スクリーンショット撮影
await browser.saveScreenshot('./debug-screenshot.png');

// HTML ソース出力
const html = await browser.getPageSource();
console.log(html);
```

## 今後の拡張予定

- [ ] 複数ブラウザでのテスト（Firefox、Safari）
- [ ] モバイルブラウザでのテスト
- [ ] アクセシビリティテスト
- [ ] セキュリティテスト
- [ ] 多言語対応テスト
- [ ] 大量データでの負荷テスト