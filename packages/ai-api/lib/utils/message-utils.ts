/**
 * @fileoverview Chrome メッセージング ユーティリティ
 *
 * Chrome拡張機能のContent ScriptとBackground Script間の
 * メッセージング通信を簡素化するユーティリティです。
 * 型安全な通信とエラーハンドリングを提供します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

/**
 * Chrome メッセージの基本構造
 *
 * @interface ChromeMessage
 */
export interface ChromeMessage<T = unknown> {
  /** メッセージタイプ */
  type: string;
  /** メッセージデータ */
  data?: T;
  /** リクエストID（オプション） */
  requestId?: string;
  /** タイムスタンプ */
  timestamp?: number;
}

/**
 * Chrome メッセージレスポンスの構造
 *
 * @interface ChromeMessageResponse
 */
export interface ChromeMessageResponse<T = unknown> {
  /** 成功フラグ */
  success: boolean;
  /** レスポンスデータ */
  data?: T;
  /** エラーメッセージ */
  error?: string;
  /** エラーコード */
  errorCode?: string;
  /** リクエストID */
  requestId?: string;
}

/**
 * メッセージ送信オプション
 *
 * @interface MessageOptions
 */
export interface MessageOptions {
  /** タイムアウト時間（ミリ秒） */
  timeout?: number;
  /** リトライ回数 */
  retries?: number;
  /** ログ出力の有効化 */
  enableLogging?: boolean;
}

/**
 * Chrome Runtime メッセージを送信する
 *
 * Content ScriptからBackground Scriptにメッセージを送信します。
 * タイムアウト、リトライ、エラーハンドリングを含む包括的な通信機能です。
 *
 * @example
 * ```typescript
 * // AI分析リクエストの送信
 * const response = await sendChromeMessage({
 *   type: 'AI_ANALYSIS_REQUEST',
 *   data: {
 *     messages: [...],
 *     settings: aiSettings
 *   }
 * });
 *
 * if (response.success) {
 *   console.log('Analysis result:', response.data);
 * } else {
 *   console.error('Analysis failed:', response.error);
 * }
 * ```
 *
 * @param message - 送信するメッセージ
 * @param options - メッセージ送信オプション
 * @returns メッセージレスポンス
 * @throws {Error} 通信失敗時
 *
 * @since 1.0.0
 */
export const sendChromeMessage = async <TRequest = unknown, TResponse = unknown>(
  message: ChromeMessage<TRequest>,
  options: MessageOptions = {},
): Promise<ChromeMessageResponse<TResponse>> => {
  const { timeout = 30000, retries = 2, enableLogging = false } = options;

  // リクエストIDを生成
  const requestId = generateRequestId();

  const messageWithMeta: ChromeMessage<TRequest> = {
    ...message,
    requestId,
    timestamp: Date.now(),
  };

  if (enableLogging) {
    console.log('[Chrome Message] Sending:', messageWithMeta);
  }

  // Chrome Runtime API の存在チェック
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
    throw new Error('Chrome Runtime API is not available');
  }

  return await executeWithRetry(() => sendMessageWithTimeout(messageWithMeta, timeout), retries, enableLogging);
};

/**
 * タイムアウト付きでメッセージを送信する
 *
 * @param message - 送信するメッセージ
 * @param timeout - タイムアウト時間（ミリ秒）
 * @returns メッセージレスポンス
 *
 * @private
 */
const sendMessageWithTimeout = async <TRequest = unknown, TResponse = unknown>(
  message: ChromeMessage<TRequest>,
  timeout: number,
): Promise<ChromeMessageResponse<TResponse>> =>
  new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Message timeout after ${timeout}ms`));
    }, timeout);

    chrome.runtime.sendMessage(message, (response: ChromeMessageResponse<TResponse>) => {
      clearTimeout(timeoutId);

      // Chrome Runtime エラーチェック
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      // レスポンスの存在チェック
      if (!response) {
        reject(new Error('No response received from background script'));
        return;
      }

      resolve(response);
    });
  });

/**
 * リトライ機能付きで関数を実行する
 *
 * @param operation - 実行する操作
 * @param maxRetries - 最大リトライ回数
 * @param enableLogging - ログ出力の有効化
 * @returns 操作の結果
 *
 * @private
 */
const executeWithRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number,
  enableLogging: boolean,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();

      if (enableLogging && attempt > 0) {
        console.log(`[Chrome Message] Succeeded on attempt ${attempt + 1}`);
      }

      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (enableLogging) {
        console.warn(`[Chrome Message] Attempt ${attempt + 1} failed:`, lastError.message);
      }

      if (attempt < maxRetries) {
        // 指数バックオフで待機
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
};

/**
 * Background Script でメッセージリスナーを設定する
 *
 * Background Script側でContent Scriptからのメッセージを
 * 受信するためのリスナーを設定します。
 *
 * @example
 * ```typescript
 * // Background Script
 * setupMessageListener((message, sender) => {
 *   if (message.type === 'AI_ANALYSIS_REQUEST') {
 *     return handleAIAnalysisRequest(message.data);
 *   }
 *   return null;
 * });
 * ```
 *
 * @param handler - メッセージハンドラー関数
 *
 * @since 1.0.0
 */
export const setupMessageListener = <TRequest = unknown, TResponse = unknown>(
  handler: (
    message: ChromeMessage<TRequest>,
    sender: chrome.runtime.MessageSender,
  ) => Promise<ChromeMessageResponse<TResponse>> | ChromeMessageResponse<TResponse> | null,
): void => {
  if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.onMessage) {
    console.warn('Chrome Runtime API is not available for message listener');
    return;
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
      const result = handler(message, sender);

      if (result === null) {
        // このハンドラーでは処理しない
        return false;
      }

      if (result instanceof Promise) {
        // 非同期処理
        result
          .then(response => sendResponse(response))
          .catch(error => {
            console.error('Message handler error:', error);
            sendResponse({
              success: false,
              error: error.message || 'Unknown error',
              requestId: message.requestId,
            });
          });

        // 非同期レスポンスを示すためtrueを返す
        return true;
      } else {
        // 同期処理
        sendResponse(result);
        return false;
      }
    } catch (error) {
      console.error('Message handler error:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId: message.requestId,
      });
      return false;
    }
  });
};

/**
 * メッセージタイプの定数
 *
 * @since 1.0.0
 */
export const MESSAGE_TYPES = {
  /** AI分析リクエスト */
  AI_ANALYSIS_REQUEST: 'AI_ANALYSIS_REQUEST',
  /** AI設定取得 */
  GET_AI_SETTINGS: 'GET_AI_SETTINGS',
  /** AI設定更新 */
  UPDATE_AI_SETTINGS: 'UPDATE_AI_SETTINGS',
  /** ヘルスチェック */
  HEALTH_CHECK: 'HEALTH_CHECK',
  /** テーブルデータ取得 */
  GET_TABLE_DATA: 'GET_TABLE_DATA',
} as const;

/**
 * 一意のリクエストIDを生成する
 *
 * @returns リクエストID
 *
 * @private
 */
const generateRequestId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
};

/**
 * メッセージサイズを計算する（デバッグ用）
 *
 * @param message - サイズを計算するメッセージ
 * @returns バイト数
 *
 * @since 1.0.0
 */
export const calculateMessageSize = (message: ChromeMessage): number => {
  const jsonString = JSON.stringify(message);
  return new Blob([jsonString]).size;
};

/**
 * メッセージをログ出力用にサニタイズする
 *
 * APIキーなどの機密情報を除去してログ出力に安全な形式にします。
 *
 * @param message - サニタイズするメッセージ
 * @returns サニタイズ済みメッセージ
 *
 * @since 1.0.0
 */
export const sanitizeMessageForLogging = (message: ChromeMessage): ChromeMessage => {
  const sanitized = JSON.parse(JSON.stringify(message));

  // APIキーやトークンを除去
  const sensitiveKeys = ['apiKey', 'api_key', 'token', 'password', 'secret'];

  const sanitizeObject = (obj: unknown): void => {
    if (typeof obj !== 'object' || obj === null) return;

    const objectRecord = obj as Record<string, unknown>;
    for (const key in objectRecord) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        objectRecord[key] = '[REDACTED]';
      } else if (typeof objectRecord[key] === 'object') {
        sanitizeObject(objectRecord[key]);
      }
    }
  };

  sanitizeObject(sanitized);
  return sanitized;
};
