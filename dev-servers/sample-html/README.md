# Sample HTML Server

Chrome拡張機能のテスト用HTMLページを提供する開発サーバーです。

## 概要

このサーバーは、Chrome拡張機能のContent ScriptやAI分析機能をテストするためのサンプルHTMLページを提供します。特にテーブルデータの検出・抽出・AI分析機能のテストに使用されます。

## 主要機能

- **サンプルテーブル提供**: AI分析テスト用のHTMLテーブル
- **静的ファイル配信**: HTMLファイルの配信
- **E2Eテスト支援**: WebDriverIOテスト環境

## サーバー設定

- **ポート**: 3000番
- **ホスト**: localhost
- **ドキュメントルート**: `public/`

## 提供コンテンツ

### `public/table-sample.html`
フルーツデータを含む3x3のHTMLテーブル

```html
<table class="ai-target-table-table">
  <thead>
    <tr>
      <th>フルーツ</th>
      <th>色</th>
      <th>価格</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>りんご</td>
      <td>赤</td>
      <td>100円</td>
    </tr>
    <!-- 他のデータ行 -->
  </tbody>
</table>
```

**特徴**:
- `.ai-target-table-table` クラス: Content Scriptのテーブル検出対象
- 日本語データ: 国際化テスト対応
- シンプルな構造: AI分析テストに最適

## 使用方法

### 開発サーバーの起動

```bash
# ルートディレクトリから
cd dev-servers/sample-html
npm start

# または
node server.js
```

### アクセス方法

- **メインページ**: `http://localhost:3000/`
- **テーブルサンプル**: `http://localhost:3000/table-sample.html`

### E2Eテストでの使用

```typescript
// E2Eテストでの使用例
describe('AI分析機能', () => {
  it('サンプルテーブルで分析実行', async () => {
    await browser.url('http://localhost:3000/table-sample.html');
    
    // テーブルが表示されるまで待機
    const table = await $('.ai-target-table-table');
    await table.waitForDisplayed();
    
    // AI分析ボタンをクリック
    const analyzeButton = await $('[data-testid="analyze-button"]');
    await analyzeButton.click();
  });
});
```

## ディレクトリ構造

```
sample-html/
├── README.md           # このファイル
├── server.js          # Express.jsサーバー
├── package.json        # 依存関係
└── public/             # 静的ファイル
    ├── index.html      # メインページ
    └── table-sample.html # テーブルサンプル
```

## 依存関係

```json
{
  "dependencies": {
    "express": "^4.x.x"
  }
}
```

## 設定のカスタマイズ

### ポート番号の変更

```javascript
// server.js
const PORT = process.env.PORT || 3000; // 環境変数で変更可能
```

### 新しいテストページの追加

1. `public/` ディレクトリに新しいHTMLファイルを追加
2. 必要に応じて `.ai-target-table-table` クラスを設定
3. E2Eテストケースを追加

## テスト対象機能

このサーバーで提供されるページは、以下の機能をテストするために使用されます：

- **テーブル検出**: `pages/content/src/table-detection.ts`
- **データ抽出**: `extractTableData()` 関数
- **AI分析**: Content Script経由でのAI分析実行
- **UI注入**: `pages/content/src/ui-injection.ts`

## トラブルシューティング

### ポート衝突エラー

```bash
Error: listen EADDRINUSE :::3000
```

**解決方法**:
```bash
# ポートを使用しているプロセスを確認
lsof -ti:3000

# プロセスを終了
kill -9 $(lsof -ti:3000)

# または環境変数でポート変更
PORT=3001 node server.js
```

### HTMLファイルが見つからない

**原因**: `public/` ディレクトリのパスが正しくない

**解決方法**:
```javascript
// server.js でパスを確認
console.log('Static files directory:', path.join(__dirname, 'public'));
```

## 関連ドキュメント

- [E2Eテストガイド](../../tests/e2e/README.md)
- [Content Scriptドキュメント](../../pages/content/README.md)

## メンテナンス

### 定期的な更新項目

- Express.jsのセキュリティアップデート
- テストデータの多様化
- 新しいテストケースに対応したHTMLページの追加

### サンプルデータの拡張

新しいAI分析テストシナリオに対応するため、以下のようなサンプルページの追加を検討：

- 大規模テーブル（100行以上）
- 複数テーブルが混在するページ
- 複雑な構造のテーブル（colspan, rowspan使用）
- 動的に生成されるテーブル