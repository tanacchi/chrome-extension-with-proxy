/**
 * サンプル関数
 *
 * Content Scriptから呼び出されるサンプル関数です。
 * 他のモジュールから呼び出されることを想定したデモンストレーション用の関数です。
 *
 * @example
 * ```typescript
 * import { sampleFunction } from './sample-function';
 *
 * // 関数を呼び出してコンソールにメッセージを表示
 * sampleFunction();
 * ```
 *
 * @since 1.0.0
 * @see {@link https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts} Content Scripts documentation
 */
export const sampleFunction = () => {
  console.log('content script - sampleFunction() called from another module');
};
