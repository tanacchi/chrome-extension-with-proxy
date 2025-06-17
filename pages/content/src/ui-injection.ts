import {
  ANALYZE_BUTTON_CLASS,
  ANALYZE_BUTTON_SELECTOR,
  BALLOON_CLASS,
  BALLOON_SELECTOR,
  LOADING_CLASS,
  LOADING_SELECTOR,
  ANALYZE_BUTTON_Z_INDEX,
  BALLOON_Z_INDEX,
  LOADING_Z_INDEX,
  BUTTON_LEFT_OFFSET,
  RIGHT_ELEMENT_OFFSET,
  ANALYZE_BUTTON_TEXT,
  LOADING_TEXT,
  BUTTON_BACKGROUND_COLOR,
  BUTTON_HOVER_COLOR,
  LOADING_BACKGROUND_COLOR,
  BALLOON_MAX_WIDTH,
  BORDER_RADIUS,
  PADDING,
} from './constants';
import { detectTargetTable } from './table-detection';

/**
 * @fileoverview UI注入機能モジュール
 *
 * このモジュールは、テーブルデータAI分析ツールのUI要素を
 * ウェブページに動的に注入する機能を提供します。
 *
 * 主な機能:
 * - 分析ボタンの作成と注入
 * - 分析結果表示用の吹き出し（バルーン）
 * - ローディングインジケーター
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

/**
 * AI分析実行ボタンを作成する
 *
 * このメソッドは、ユーザーがテーブルデータの分析を開始するためのボタン要素を生成します。
 * ボタンには適切なスタイリングとイベントハンドラーが設定されます。
 * Chrome拡張機能の一部として、ウェブページ上に表示されることを想定しています。
 *
 * @example
 * ```typescript
 * // 分析ボタンの作成例
 * const handleAnalyze = () => {
 *   console.log('分析を開始します');
 *   // 分析処理を実行
 * };
 *
 * const button = createAnalyzeButton(handleAnalyze);
 * document.body.appendChild(button);
 * ```
 *
 * @param {() => void} onClick - ボタンがクリックされたときに実行されるコールバック関数
 * @returns {HTMLButtonElement} 設定済みの分析ボタン要素
 *
 * @since 1.0.0
 * @see {@link injectAnalyzeButton} ボタンをページに注入する関数
 */
export const createAnalyzeButton = (onClick: () => void): HTMLButtonElement => {
  // ボタン要素を作成
  const button = document.createElement('button');
  button.textContent = ANALYZE_BUTTON_TEXT;
  button.className = ANALYZE_BUTTON_CLASS;

  // ボタンの基本スタイリングを設定
  // 絶対位置指定により、ページ上の任意の場所に配置可能
  button.style.position = 'absolute';
  button.style.zIndex = ANALYZE_BUTTON_Z_INDEX.toString();
  button.style.backgroundColor = BUTTON_BACKGROUND_COLOR;
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.borderRadius = BORDER_RADIUS.button;
  button.style.padding = PADDING.button;
  button.style.fontSize = '12px';
  button.style.fontWeight = 'bold';
  button.style.cursor = 'pointer';
  button.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';

  // ホバー効果を追加してユーザビリティを向上
  button.addEventListener('mouseenter', () => {
    // マウスオーバー時: より濃い青色に変更
    button.style.backgroundColor = BUTTON_HOVER_COLOR;
  });

  button.addEventListener('mouseleave', () => {
    // マウスアウト時: 元の青色に戻す
    button.style.backgroundColor = BUTTON_BACKGROUND_COLOR;
  });

  // クリックイベントハンドラーを設定
  button.addEventListener('click', onClick);

  return button;
};

/**
 * 対象テーブルの近くに分析ボタンを注入する
 *
 * このメソッドは、検出されたテーブルの左側に分析ボタンを配置します。
 * 既にボタンが存在する場合は重複して作成しません。
 * ボタンの位置は、テーブルの位置に基づいて自動計算されます。
 *
 * @example
 * ```typescript
 * // 分析ボタンの注入例
 * const handleAnalysis = () => {
 *   const data = detectAndExtractTableData();
 *   if (data.length > 0) {
 *     // AI分析を実行
 *     performAIAnalysis(data);
 *   }
 * };
 *
 * const success = injectAnalyzeButton(handleAnalysis);
 * if (success) {
 *   console.log('分析ボタンを配置しました');
 * } else {
 *   console.log('対象テーブルが見つかりません');
 * }
 * ```
 *
 * @param {() => void} onClick - ボタンクリック時に実行されるコールバック関数
 * @returns {boolean}
 *   - true: ボタンの注入に成功（または既に存在）
 *   - false: 対象テーブルが見つからないため失敗
 *
 * @since 1.0.0
 * @see {@link createAnalyzeButton} ボタン要素を作成する関数
 * @see {@link detectTargetTable} 対象テーブルを検出する関数
 */
export const injectAnalyzeButton = (onClick: () => void): boolean => {
  // 対象テーブルを検出
  const table = detectTargetTable();
  if (!table) {
    return false;
  }

  // 既にボタンが存在するかチェックして重複を防ぐ
  const existingButton = document.querySelector(ANALYZE_BUTTON_SELECTOR);
  if (existingButton) {
    return true;
  }

  // 新しい分析ボタンを作成
  const button = createAnalyzeButton(onClick);

  // テーブルの位置に基づいてボタンの位置を計算
  const tableRect = table.getBoundingClientRect();
  button.style.left = `${tableRect.left - BUTTON_LEFT_OFFSET}px`;
  button.style.top = `${tableRect.top + window.scrollY}px`;

  // ページにボタンを追加
  document.body.appendChild(button);
  return true;
};

/**
 * AI分析結果を表示する吹き出し（バルーン）を表示する
 *
 * このメソッドは、分析結果をユーザーに視覚的に表示するための吹き出しを作成します。
 * 指定された要素の右側に配置され、既存の吹き出しがある場合は置き換えます。
 *
 * @example
 * ```typescript
 * // 分析結果の表示例
 * const tableCell = document.querySelector('td');
 * const analysisResult = 'この数値は前月比20%増加しています。';
 *
 * showBalloon(analysisResult, tableCell);
 *
 * // 数秒後に非表示にする場合
 * setTimeout(() => {
 *   hideBalloon();
 * }, 5000);
 * ```
 *
 * @param {string} content - 吹き出しに表示するテキストコンテンツ
 * @param {HTMLElement} targetElement - 吹き出しの位置基準となる要素
 *
 * @since 1.0.0
 * @see {@link hideBalloon} 吹き出しを非表示にする関数
 * @see {@link showLoading} ローディングインジケーターを表示する関数
 */
export const showBalloon = (content: string, targetElement: HTMLElement): void => {
  // 既存の吹き出しを削除してから新しいものを表示
  hideBalloon();

  // 吹き出し要素を作成
  const balloon = document.createElement('div');
  balloon.className = BALLOON_CLASS;
  balloon.textContent = content;

  // 吹き出しのスタイリングを設定
  balloon.style.position = 'absolute';
  balloon.style.zIndex = BALLOON_Z_INDEX.toString();
  balloon.style.backgroundColor = 'white';
  balloon.style.border = '1px solid #ccc';
  balloon.style.borderRadius = BORDER_RADIUS.balloon;
  balloon.style.padding = PADDING.balloon;
  balloon.style.maxWidth = BALLOON_MAX_WIDTH;
  balloon.style.fontSize = '14px';
  balloon.style.lineHeight = '1.4';
  balloon.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
  balloon.style.wordWrap = 'break-word'; // 長いテキストの折り返し

  // 対象要素の右側に吹き出しを配置
  const targetRect = targetElement.getBoundingClientRect();
  balloon.style.left = `${targetRect.right + RIGHT_ELEMENT_OFFSET}px`;
  balloon.style.top = `${targetRect.top + window.scrollY}px`;

  // ページに吹き出しを追加
  document.body.appendChild(balloon);
};

/**
 * 表示されている分析結果の吹き出しを非表示にする
 *
 * このメソッドは、現在表示されている吹き出し要素をDOMから削除します。
 * 吹き出しが存在しない場合は何も実行しません。
 *
 * @example
 * ```typescript
 * // 吹き出しを表示後、一定時間で自動非表示
 * showBalloon('分析完了', targetElement);
 * setTimeout(hideBalloon, 3000); // 3秒後に非表示
 * ```
 *
 * @since 1.0.0
 * @see {@link showBalloon} 吹き出しを表示する関数
 */
export const hideBalloon = (): void => {
  // constants.tsで定義されたセレクタを使用して要素を検索
  const balloon = document.querySelector(BALLOON_SELECTOR);
  if (balloon) {
    // 要素が存在する場合はDOMから削除
    balloon.remove();
  }
};

/**
 * AI分析処理中のローディングインジケーターを表示する
 *
 * このメソッドは、AI分析処理の実行中にユーザーに待機状態を示すための
 * ローディング表示を作成します。分析処理中の視覚的フィードバックを提供します。
 *
 * @example
 * ```typescript
 * // 分析開始時にローディングを表示
 * const targetCell = document.querySelector('td');
 *
 * showLoading(targetCell);
 *
 * // AI分析を実行
 * performAIAnalysis().then(result => {
 *   hideLoading(); // 分析完了後にローディングを非表示
 *   showBalloon(result, targetCell); // 結果を表示
 * });
 * ```
 *
 * @param {HTMLElement} targetElement - ローディング表示の位置基準となる要素
 *
 * @since 1.0.0
 * @see {@link hideLoading} ローディングインジケーターを非表示にする関数
 * @see {@link showBalloon} 分析結果を表示する関数
 */
export const showLoading = (targetElement: HTMLElement): void => {
  // 既存のローディング表示を削除してから新しいものを表示
  hideLoading();

  // ローディング要素を作成
  const loading = document.createElement('div');
  loading.className = LOADING_CLASS;
  loading.textContent = LOADING_TEXT;

  // ローディングのスタイリングを設定
  loading.style.position = 'absolute';
  loading.style.zIndex = LOADING_Z_INDEX.toString();
  loading.style.backgroundColor = LOADING_BACKGROUND_COLOR;
  loading.style.color = 'white';
  loading.style.border = 'none';
  loading.style.borderRadius = BORDER_RADIUS.loading;
  loading.style.padding = PADDING.loading;
  loading.style.fontSize = '12px';
  loading.style.fontWeight = 'bold';

  // 対象要素の右側にローディング表示を配置
  const targetRect = targetElement.getBoundingClientRect();
  loading.style.left = `${targetRect.right + RIGHT_ELEMENT_OFFSET}px`;
  loading.style.top = `${targetRect.top + window.scrollY}px`;

  // ページにローディング表示を追加
  document.body.appendChild(loading);
};

/**
 * 表示されているローディングインジケーターを非表示にする
 *
 * このメソッドは、現在表示されているローディング要素をDOMから削除します。
 * ローディング表示が存在しない場合は何も実行しません。
 *
 * @example
 * ```typescript
 * // 分析処理の完了時にローディングを非表示
 * analyzeData().finally(() => {
 *   hideLoading(); // 成功・失敗に関わらずローディングを非表示
 * });
 * ```
 *
 * @since 1.0.0
 * @see {@link showLoading} ローディングインジケーターを表示する関数
 */
export const hideLoading = (): void => {
  // constants.tsで定義されたセレクタを使用して要素を検索
  const loading = document.querySelector(LOADING_SELECTOR);
  if (loading) {
    // 要素が存在する場合はDOMから削除
    loading.remove();
  }
};
