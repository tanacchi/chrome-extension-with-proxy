/**
 * @fileoverview テーブルデータAI分析ツールで使用する定数定義
 *
 * このファイルは、拡張機能全体で使用される定数値を集約管理します。
 * CSSクラス名、セレクタ、設定値などの変更可能な定数を一元化し、
 * 保守性と一貫性を向上させます。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

// =============================================================================
// テーブル関連の定数
// =============================================================================

/**
 * 分析対象テーブルを識別するためのCSSクラス名
 *
 * このクラス名を持つテーブル要素が自動検出され、
 * データ抽出の対象となります。
 *
 * @example
 * ```html
 * <table class="ai-target-table-table">
 *   <!-- このテーブルが検出される -->
 * </table>
 * ```
 */
export const TARGET_TABLE_CLASS = 'ai-target-table-table'

/**
 * 分析対象テーブルを検出するためのCSSセレクタ
 *
 * document.querySelector() で使用される完全なセレクタ文字列です。
 */
export const TARGET_TABLE_SELECTOR = `table.${TARGET_TABLE_CLASS}`

/**
 * テーブル内のデータ行を表すHTMLタグ名
 */
export const TABLE_ROW_TAG = 'tr'

/**
 * テーブル内のデータセルを表すHTMLタグ名
 */
export const TABLE_CELL_TAG = 'td'

/**
 * テーブルのボディ部分を表すHTMLタグ名
 */
export const TABLE_BODY_TAG = 'tbody'

/**
 * データ抽出対象となる列のインデックス（0から開始）
 *
 * 現在は2列目（インデックス1）のデータを抽出します。
 * この値を変更することで、異なる列のデータを抽出できます。
 */
export const TARGET_COLUMN_INDEX = 1

// =============================================================================
// UI要素のCSSクラス名
// =============================================================================

/**
 * 分析ボタンのCSSクラス名
 *
 * 動的に注入される分析ボタン要素に設定されるクラス名です。
 * 重複チェックやスタイリングに使用されます。
 */
export const ANALYZE_BUTTON_CLASS = 'ai-analyze-button'

/**
 * 分析結果表示用の吹き出し（バルーン）のCSSクラス名
 *
 * AI分析結果を表示する吹き出し要素に設定されるクラス名です。
 */
export const BALLOON_CLASS = 'ai-balloon'

/**
 * ローディングインジケーターのCSSクラス名
 *
 * 分析処理中に表示されるローディング要素のクラス名です。
 */
export const LOADING_CLASS = 'ai-loading'

// =============================================================================
// UI要素のセレクタ
// =============================================================================

/**
 * 分析ボタンを検索するためのCSSセレクタ
 */
export const ANALYZE_BUTTON_SELECTOR = `.${ANALYZE_BUTTON_CLASS}`

/**
 * 吹き出し要素を検索するためのCSSセレクタ
 */
export const BALLOON_SELECTOR = `.${BALLOON_CLASS}`

/**
 * ローディング要素を検索するためのCSSセレクタ
 */
export const LOADING_SELECTOR = `.${LOADING_CLASS}`

// =============================================================================
// UI配置・スタイル関連の定数
// =============================================================================

/**
 * UI要素のz-indexベース値
 *
 * 各UI要素は、この値をベースとして適切な重なり順序を持ちます。
 */
export const BASE_Z_INDEX = 10000

/**
 * 分析ボタンのz-index値
 */
export const ANALYZE_BUTTON_Z_INDEX = BASE_Z_INDEX

/**
 * 吹き出しのz-index値（ボタンより前面）
 */
export const BALLOON_Z_INDEX = BASE_Z_INDEX + 1

/**
 * ローディングインジケーターのz-index値（最前面）
 */
export const LOADING_Z_INDEX = BASE_Z_INDEX + 2

/**
 * ボタンをテーブルの左側に配置する際のオフセット（px）
 */
export const BUTTON_LEFT_OFFSET = 100

/**
 * 吹き出しやローディングを要素の右側に配置する際のオフセット（px）
 */
export const RIGHT_ELEMENT_OFFSET = 10

// =============================================================================
// テキスト・メッセージ関連の定数
// =============================================================================

/**
 * 分析ボタンに表示されるテキスト
 */
export const ANALYZE_BUTTON_TEXT = 'AI分析'

/**
 * ローディング表示時のテキスト
 */
export const LOADING_TEXT = '分析中...'

/**
 * テーブルが見つからない場合のメッセージ
 */
export const NO_TABLE_FOUND_MESSAGE = '分析対象のテーブルが見つかりません'

/**
 * データが見つからない場合のメッセージ
 */
export const NO_DATA_FOUND_MESSAGE = 'No data found in target table'

// =============================================================================
// スタイル関連の定数
// =============================================================================

/**
 * 分析ボタンの背景色（通常状態）
 */
export const BUTTON_BACKGROUND_COLOR = 'rgb(59, 130, 246)'

/**
 * 分析ボタンの背景色（ホバー状態）
 */
export const BUTTON_HOVER_COLOR = 'rgb(37, 99, 235)'

/**
 * ローディング表示の背景色
 */
export const LOADING_BACKGROUND_COLOR = 'rgba(0, 0, 0, 0.8)'

/**
 * 吹き出しの最大幅（px）
 */
export const BALLOON_MAX_WIDTH = '300px'

/**
 * 要素の境界線の角丸半径
 */
export const BORDER_RADIUS = {
  button: '4px',
  balloon: '8px',
  loading: '4px',
} as const

/**
 * パディング値の定義
 */
export const PADDING = {
  button: '8px 12px',
  balloon: '12px',
  loading: '8px 12px',
} as const

// =============================================================================
// デバッグ・ログ関連の定数
// =============================================================================

/**
 * コンソールログのプレフィックス
 *
 * 拡張機能からのログメッセージを識別するために使用されます。
 */
export const LOG_PREFIX = '[CEB]'

/**
 * デバッグメッセージのテンプレート
 */
export const DEBUG_MESSAGES = {
  CONTENT_SCRIPT_LOADED: `${LOG_PREFIX} All content script loaded`,
  TABLE_DATA_EXTRACTED: `${LOG_PREFIX} Table data extracted:`,
  NO_TABLE_FOUND: `${LOG_PREFIX} No table with class "${TARGET_TABLE_CLASS}" found`,
  BUTTON_INJECTED: `${LOG_PREFIX} Analyze button injected successfully`,
  NO_DATA_FOUND: `${LOG_PREFIX} No data found in target table`,
} as const
