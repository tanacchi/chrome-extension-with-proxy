import {
  TARGET_TABLE_SELECTOR,
  TABLE_BODY_TAG,
  TABLE_ROW_TAG,
  TABLE_CELL_TAG,
  TARGET_COLUMN_INDEX,
} from './constants'

/**
 * テーブルデータAI分析ツール用のテーブルを検出する
 *
 * このメソッドは、Chrome拡張機能が分析対象とするテーブルを見つけるために使用されます。
 * 特定のCSSクラス名 'ai-target-table-table' を持つテーブル要素を検索し、
 * 最初に見つかったテーブル要素を返します。
 *
 * @example
 * ```typescript
 * // HTMLに以下のようなテーブルがある場合
 * // <table class="ai-target-table-table">...</table>
 *
 * const table = detectTargetTable();
 * if (table) {
 *   console.log('分析対象テーブルが見つかりました');
 * } else {
 *   console.log('分析対象テーブルが見つかりません');
 * }
 * ```
 *
 * @returns {HTMLTableElement | null}
 *   - 成功時: 'ai-target-table-table' クラスを持つ最初のテーブル要素
 *   - 失敗時: null（該当するテーブルが存在しない場合）
 *
 * @since 1.0.0
 * @see {@link extractTableData} テーブルからデータを抽出する関数
 * @see {@link detectAndExtractTableData} テーブル検出とデータ抽出を一括で行う関数
 */
export const detectTargetTable = (): HTMLTableElement | null => {
  // document.querySelector を使用してDOMから該当するテーブルを検索
  // constants.tsで定義されたセレクタを使用してテーブル要素を探す
  const targetTable = document.querySelector(TARGET_TABLE_SELECTOR) as HTMLTableElement | null
  return targetTable
}

/**
 * テーブルの2列目からデータを抽出する
 *
 * 指定されたテーブル要素から2列目（インデックス1）のセルデータを取得します。
 * このメソッドは、tbodyがある場合は優先的に使用し、ない場合は直接テーブルの行を処理します。
 * 空のセルやホワイトスペースのみのセルは除外されます。
 *
 * @example
 * ```typescript
 * // HTMLテーブルの例:
 * // <table>
 * //   <tbody>
 * //     <tr><td>名前</td><td>田中太郎</td></tr>
 * //     <tr><td>年齢</td><td>30</td></tr>
 * //     <tr><td>職業</td><td></td></tr> <!-- 空のセルは除外される -->
 * //   </tbody>
 * // </table>
 *
 * const table = document.querySelector('table');
 * const data = extractTableData(table);
 * console.log(data); // ['田中太郎', '30'] （空の職業欄は除外）
 * ```
 *
 * @param {HTMLTableElement} table - データを抽出するテーブル要素
 * @returns {string[]} 2列目のデータの配列（空の要素は除外済み）
 *
 * @since 1.0.0
 * @see {@link detectTargetTable} 対象テーブルを検出する関数
 * @see {@link detectAndExtractTableData} テーブル検出とデータ抽出を一括で行う関数
 */
export const extractTableData = (table: HTMLTableElement): string[] => {
  const data: string[] = []

  // まずtbody要素を探し、見つからない場合は直接テーブルの行を取得
  // constants.tsで定義されたタグ名を使用
  const tbody = table.querySelector(TABLE_BODY_TAG)
  const rows = tbody ? tbody.querySelectorAll(TABLE_ROW_TAG) : table.querySelectorAll(TABLE_ROW_TAG)

  // 各行を順次処理してデータを抽出
  rows.forEach(row => {
    // 現在の行のすべてのセル（td要素）を取得
    const cells = row.querySelectorAll(TABLE_CELL_TAG)

    // 行に対象列より多くのセルがあることを確認
    if (cells.length > TARGET_COLUMN_INDEX) {
      // 対象列のテキストコンテンツを取得し、前後の空白を除去
      const columnData = cells[TARGET_COLUMN_INDEX].textContent?.trim() || ''

      // 空でないデータのみを配列に追加
      // 空文字列、null、undefinedの場合は除外
      if (columnData) {
        data.push(columnData)
      }
    }
  })

  return data
}

/**
 * テーブル検出とデータ抽出を一括で実行するメイン関数
 *
 * この関数は、テーブルデータAI分析ツールの中核となる機能です。
 * 対象テーブルの検出とデータ抽出を一度に実行し、結果を返します。
 * Chrome拡張機能のContent Scriptから呼び出されることを想定しています。
 *
 * 処理の流れ:
 * 1. {@link detectTargetTable} を使用して対象テーブルを検出
 * 2. テーブルが見つかった場合、{@link extractTableData} でデータを抽出
 * 3. テーブルが見つからない場合は空配列を返す
 *
 * @example
 * ```typescript
 * // Content Scriptでの使用例
 * const initializeAnalysis = () => {
 *   const data = detectAndExtractTableData();
 *
 *   if (data.length > 0) {
 *     console.log('抽出されたデータ:', data);
 *     // AI分析APIにデータを送信
 *     sendToAIAnalysis(data);
 *   } else {
 *     console.log('分析対象のテーブルが見つかりません');
 *     showErrorMessage('対象テーブルが見つかりません');
 *   }
 * };
 * ```
 *
 * @returns {string[]}
 *   - 成功時: 検出されたテーブルの2列目データの配列
 *   - 失敗時: 空配列（対象テーブルが見つからない場合）
 *
 * @since 1.0.0
 * @see {@link detectTargetTable} テーブル検出処理
 * @see {@link extractTableData} データ抽出処理
 */
export const detectAndExtractTableData = (): string[] => {
  // 対象テーブルを検出
  const table = detectTargetTable()

  // テーブルが見つからない場合は空配列を返す
  if (!table) {
    return []
  }

  // テーブルが見つかった場合はデータを抽出して返す
  return extractTableData(table)
}
