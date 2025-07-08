# Content Script Package

Chrome拡張機能のContent Script部分を担当するパッケージです。ウェブページ上でテーブルデータの検出・抽出・UI注入を行います。

## 概要

このパッケージは、テーブルデータAI分析ツールのCore機能を提供します：

- **テーブル検出**: 特定のCSSクラスを持つテーブルの自動検出
- **データ抽出**: テーブルの2列目データの抽出
- **UI注入**: 分析ボタンや結果表示用の吹き出しをページに動的追加

## ディレクトリ構成

```
src/
├── matches/
│   └── all/
│       └── index.ts          # メインのContent Script
├── table-detection.ts        # テーブル検出・データ抽出機能
├── table-detection.spec.ts   # テーブル検出機能のテスト
├── ui-injection.ts           # UI注入機能
├── ui-injection.spec.ts      # UI注入機能のテスト
└── sample-function.ts        # サンプル関数（削除予定）
```

## 主要機能

### 1. テーブル検出・データ抽出 (`table-detection.ts`)

```typescript
import { detectAndExtractTableData } from '@src/table-detection';

// 対象テーブルを検出してデータを抽出
const data = detectAndExtractTableData();
console.log('抽出されたデータ:', data);
```

**利用可能な関数:**
- `detectTargetTable()`: `ai-target-table-table` クラスを持つテーブルを検出
- `extractTableData(table)`: テーブルの2列目データを抽出
- `detectAndExtractTableData()`: 検出と抽出を一括実行

### 2. UI注入機能 (`ui-injection.ts`)

```typescript
import { injectAnalyzeButton, showBalloon, showLoading } from '@src/ui-injection';

// 分析ボタンをページに注入
const success = injectAnalyzeButton(() => {
  console.log('分析ボタンがクリックされました');
});

// 結果を吹き出しで表示
const targetElement = document.querySelector('td');
showBalloon('分析結果: 前月比20%増加', targetElement);

// ローディング表示
showLoading(targetElement);
```

**利用可能な関数:**
- `createAnalyzeButton(onClick)`: 分析ボタン要素を作成
- `injectAnalyzeButton(onClick)`: ボタンをページに注入
- `showBalloon(content, element)`: 分析結果の吹き出しを表示
- `hideBalloon()`: 吹き出しを非表示
- `showLoading(element)`: ローディング表示
- `hideLoading()`: ローディング非表示

## 使用方法

### 基本的な使用例

```typescript
// Content Scriptのメイン処理
import { detectAndExtractTableData } from '@src/table-detection';
import { injectAnalyzeButton } from '@src/ui-injection';

const initializeAnalysis = () => {
  // 1. テーブルデータを検出・抽出
  const data = detectAndExtractTableData();
  
  if (data.length > 0) {
    console.log('抽出されたデータ:', data);
    
    // 2. 分析ボタンを注入
    const success = injectAnalyzeButton(() => {
      // 3. ボタンクリック時の処理
      handleAnalyzeClick(data);
    });
    
    if (success) {
      console.log('分析ボタンを配置しました');
    }
  } else {
    console.log('対象テーブルが見つかりません');
  }
};

// ページ読み込み完了後に実行
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAnalysis);
} else {
  initializeAnalysis();
}
```

## 対象テーブルの要件

分析対象となるテーブルは以下の要件を満たす必要があります：

```html
<!-- 必須: ai-target-table-table クラス -->
<table class="ai-target-table-table">
  <tbody>
    <tr>
      <td>項目名1</td>
      <td>値1</td>  <!-- この列のデータが抽出される -->
    </tr>
    <tr>
      <td>項目名2</td>
      <td>値2</td>  <!-- この列のデータが抽出される -->
    </tr>
  </tbody>
</table>
```

- `ai-target-table-table` CSSクラスが必要
- 少なくとも2列のデータが必要（1列目: 項目名、2列目: 値）
- `tbody` 要素の有無は問わない
- 空のセルは自動的に除外される

## 開発・テスト

### テスト実行

```bash
# 全テストを実行
pnpm test

# ウォッチモードでテスト実行
pnpm test:watch
```

### テストカバレッジ

現在のテストカバレッジ:
- **table-detection.ts**: 11テスト（検出ロジック、データ抽出、統合テスト）
- **ui-injection.ts**: 16テスト（ボタン作成、注入、吹き出し、ローディング）

### ビルド

```bash
# Content Scriptをビルド
pnpm build

# 開発モード（ウォッチ）
pnpm dev
```

## Chrome拡張機能での使用

このContent Scriptは、Chrome拡張機能のManifest V3形式で動作します：

```json
{
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content-script/index.js"]
    }
  ]
}
```

## 依存関係

- `@extension/shared`: 共通型定義
- `@extension/storage`: ストレージユーティリティ
- `@extension/env`: 環境設定

## Chrome拡張機能開発者向けのポイント

### Content Scriptの特徴

1. **ページコンテキスト**: Webページと同じDOMにアクセス可能
2. **分離されたJavaScript環境**: ページのJavaScriptとは独立
3. **Chrome APIアクセス**: 制限付きでChrome拡張機能APIを使用可能

### スタイルの競合回避

UI要素には独自のCSSクラス名を使用：
- `ai-analyze-button`: 分析ボタン
- `ai-balloon`: 結果表示用吹き出し
- `ai-loading`: ローディングインジケーター

### パフォーマンス考慮事項

- DOM操作は最小限に抑制
- 既存要素の重複チェックを実装
- 不要になった要素は適切に削除

## トラブルシューティング

### よくある問題

1. **テーブルが検出されない**
   - `ai-target-table-table` クラスが正しく設定されているか確認
   - テーブルがページロード完了後に追加される場合は、適切なタイミングで実行

2. **ボタンが表示されない**
   - テーブルの位置が画面外の場合、ボタンも画面外に配置される
   - CSSのz-indexが他の要素に負けていないか確認

3. **スタイルが適用されない**
   - Content ScriptのスタイルはページのCSSと競合する可能性
   - インラインスタイルで重要なプロパティを設定済み

## 今後の拡張予定

- [ ] AI API統合機能の実装
- [ ] 複数テーブル対応
- [ ] カスタムテーブル選択機能
- [ ] 分析結果の永続化

## Content Scriptの追加方法

新しいContent Scriptを追加する場合：

1. `matches/example` フォルダーをコピーして新しい名前で作成
2. `manifest.ts` を編集して `content-scripts` セクションに追加：

```typescript
{
  matches: ['URL_FOR_INJECT'], 
  js: ['content/{matches_folder_name}.iife.js']
}
```

詳細: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

## 関連ドキュメント

- [Chrome拡張機能開発ガイド](../../README.md)
- [ストレージパッケージ](../../packages/storage/README.md)
- [オプション画面](../options/README.md)