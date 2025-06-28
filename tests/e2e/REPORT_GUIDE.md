# E2Eテストレポート機能

## 概要

E2Eテストの実行結果を美しいHTMLレポートとして生成・表示する機能です。
Allureフレームワークを使用して、詳細な分析情報を提供します。

## 使用方法

### 1. レポート付きでテスト実行

```bash
# ルートディレクトリから
pnpm e2e:report

# または、e2eディレクトリから
cd tests/e2e
pnpm e2e:report
```

### 2. 生成済みレポートを表示

```bash
# 静的HTMLレポートをブラウザで開く
pnpm e2e:report:open

# ライブサーバーでレポートを表示（推奨）
pnpm e2e:report:serve
```

## レポート出力先

```
tests/e2e/reports/
├── allure-report/       # 生成されたHTMLレポート
├── allure-results/      # テスト実行の生データ
└── junit/              # JUnit形式のレポート（CI用）
```

## レポートの特徴

### 📊 ダッシュボード
- テスト成功率の円グラフ
- 実行時間のトレンド
- 失敗したテストの詳細

### 🔍 詳細分析
- **Suites**: テストスイート別の結果
- **Graphs**: 実行時間・成功率のグラフ
- **Timeline**: 実行順序と時間の可視化
- **Behaviors**: 機能別テスト結果

### 📸 視覚的情報
- **スクリーンショット**: 失敗時の画面キャプチャ
- **ステップ詳細**: 各テストステップの実行ログ
- **環境情報**: ブラウザ・OS・実行環境の詳細

### 📈 トレンド分析
- 過去のテスト実行との比較
- 成功率の推移
- 実行時間の変化

## コマンド詳細

### `pnpm e2e:report`
1. サーバー起動（`scripts/start-e2e-servers.sh`）
2. 拡張機能ビルド（`pnpm zip`）
3. E2Eテスト実行（レポーター有効）
4. HTMLレポート生成（Allure）

### `pnpm e2e:report:open`
- 生成済みの静的HTMLレポートをデフォルトブラウザで開く
- レポートが存在しない場合はエラー

### `pnpm e2e:report:serve`
- Allureサーバーを起動してレポートを動的表示
- より詳細な情報とリアルタイム更新が可能
- `Ctrl+C`で停止

## 設定カスタマイズ

### スクリーンショット設定
`config/wdio.report.conf.ts`でスクリーンショットの動作を変更可能：

```typescript
afterTest: async (test, _context, { passed }) => {
  // 失敗時のみスクリーンショット（デフォルト）
  if (!passed) {
    await browser.takeScreenshot()
  }
  
  // 全テストでスクリーンショットを取る場合
  // await browser.takeScreenshot()
}
```

### レポート出力先変更
`config/wdio.report.conf.ts`の`outputDir`を変更：

```typescript
[
  'allure',
  {
    outputDir: '../reports/custom-location',
    // その他の設定...
  },
]
```

## トラブルシューティング

### レポートが生成されない
1. `tests/e2e/reports/`ディレクトリの権限を確認
2. `allure-commandline`が正しくインストールされているか確認
3. テストが実際に実行されているか確認

### レポートが表示されない
1. `pnpm e2e:report:serve`を試す（動的表示）
2. ブラウザのポップアップブロッカーを確認
3. ローカルファイルアクセスの許可を確認

### 古いレポートが残る
```bash
# レポートディレクトリをクリア
cd tests/e2e
pnpm clean:reports

# または全体クリーンアップ
pnpm clean
```

## CI/CD連携

GitHub Actionsでレポートを生成する場合：

```yaml
- name: Run E2E with Reports
  run: pnpm e2e:report

- name: Upload Test Reports
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: e2e-reports
    path: tests/e2e/reports/
```

これにより、CI実行時にもレポートファイルがアーティファクトとして保存され、ダウンロード可能になります。