/**
 * @fileoverview API エラーハンドリング機能
 *
 * OpenAI APIとの通信で発生するエラーを適切に分類・処理し、
 * リトライ戦略とエラー情報のサニタイズを提供します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

import { APIErrorType } from '../client/api-types';
import type { APIError, RetryConfig } from '../client/api-types';

/**
 * APIエラーの分類と処理を行うエラーハンドラー
 *
 * HTTPステータスコード、エラーメッセージ、ネットワーク状況を基に
 * エラーを適切に分類し、リトライ戦略を決定します。
 *
 * @example
 * ```typescript
 * const errorHandler = new APIErrorHandler();
 *
 * try {
 *   await apiCall();
 * } catch (error) {
 *   const apiError = errorHandler.handleError(error);
 *
 *   if (errorHandler.shouldRetry(apiError, currentRetry, maxRetries)) {
 *     const delay = errorHandler.calculateBackoffDelay(currentRetry);
 *     await new Promise(resolve => setTimeout(resolve, delay));
 *     // リトライ実行
 *   }
 * }
 * ```
 *
 * @since 1.0.0
 */
export class APIErrorHandler {
  private readonly sensitivePatterns = [
    /sk-[a-zA-Z0-9_-]{20,}/g, // OpenAI APIキー
    /Bearer\s+[a-zA-Z0-9._-]+/g, // Bearer トークン
    /api[_-]?key['":\s=]+[a-zA-Z0-9._-]+/gi, // APIキー
    /token['":\s=]+[a-zA-Z0-9._-]+/gi, // トークン
    /password['":\s=]+[^\s'"]+/gi, // パスワード
  ];

  /**
   * エラーを APIError 形式に変換・分類する
   *
   * @param error - 変換対象のエラー
   * @returns 分類済みのAPIエラー
   *
   * @since 1.0.0
   */
  public handleError(error: unknown): APIError {
    // HTTPエラーの場合
    if (error && typeof error === 'object' && ('status' in error || 'statusCode' in error)) {
      return this.handleHTTPError(error);
    }

    // ネットワークエラーの場合
    if (this.isNetworkError(error)) {
      return createAPIError(
        APIErrorType.NETWORK,
        error instanceof Error ? error.message : 'Network request failed',
        undefined,
        undefined,
        undefined,
        error instanceof Error ? error : undefined,
      );
    }

    // その他の不明なエラー
    return createAPIError(
      APIErrorType.UNKNOWN,
      error instanceof Error ? error.message : 'An unknown error occurred',
      undefined,
      undefined,
      undefined,
      error instanceof Error ? error : undefined,
    );
  }

  /**
   * HTTPエラーを分類する
   *
   * @param error - HTTPエラー
   * @returns 分類済みのAPIエラー
   *
   * @private
   */
  private handleHTTPError(error: unknown): APIError {
    const errorObj = error as Record<string, unknown>;
    const statusCode = (errorObj.status || errorObj.statusCode) as number | undefined;
    const message = (
      typeof errorObj.message === 'string' ? errorObj.message : `HTTP Error ${statusCode || 'Unknown'}`
    ) as string;
    let errorType: APIErrorType;
    let retryAfter: number | undefined;

    // ステータスコードに基づく分類
    switch (statusCode) {
      case 401:
      case 403:
        errorType = APIErrorType.AUTHENTICATION;
        break;
      case 429:
        errorType = APIErrorType.RATE_LIMIT;
        retryAfter = this.extractRetryAfter(error);
        break;
      case 400:
      case 422:
        errorType = APIErrorType.INVALID_REQUEST;
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        errorType = APIErrorType.SERVER_ERROR;
        break;
      default:
        if (statusCode && statusCode >= 400 && statusCode < 500) {
          errorType = APIErrorType.INVALID_REQUEST;
        } else if (statusCode && statusCode >= 500) {
          errorType = APIErrorType.SERVER_ERROR;
        } else {
          errorType = APIErrorType.UNKNOWN;
        }
    }

    // クォータ超過の特別処理
    if (message.toLowerCase().includes('quota') || message.toLowerCase().includes('insufficient_quota')) {
      errorType = APIErrorType.QUOTA_EXCEEDED;
    }

    return createAPIError(
      errorType,
      message,
      statusCode,
      retryAfter,
      (errorObj as Record<string, unknown>).data ||
        ((errorObj as Record<string, unknown>).response as Record<string, unknown> | undefined)?.data,
      errorObj instanceof Error ? errorObj : undefined,
    );
  }

  /**
   * ネットワークエラーかどうかを判定する
   *
   * @param error - チェック対象のエラー
   * @returns ネットワークエラーの場合 true
   *
   * @private
   */
  private isNetworkError(error: unknown): boolean {
    if (!error || typeof error !== 'object') {
      return false;
    }

    const err = error as { name?: string; code?: string; message?: string };
    return Boolean(
      err.name === 'NetworkError' ||
        err.name === 'TimeoutError' ||
        err.name === 'AbortError' ||
        err.code === 'ECONNREFUSED' ||
        err.code === 'ENOTFOUND' ||
        err.code === 'ETIMEDOUT' ||
        (err.message &&
          typeof err.message === 'string' &&
          (err.message.toLowerCase().includes('network') ||
            err.message.toLowerCase().includes('timeout') ||
            err.message.toLowerCase().includes('connection') ||
            err.message.toLowerCase().includes('failed') ||
            err.message.toLowerCase().includes('request timeout') ||
            err.message.includes('fetch'))),
    );
  }

  /**
   * Retry-After ヘッダーから待機時間を抽出する
   *
   * @param error - HTTPエラー
   * @returns 待機時間（秒）
   *
   * @private
   */
  private extractRetryAfter(error: unknown): number | undefined {
    const errorObj = error as Record<string, unknown>;
    const headers = (errorObj.headers || (errorObj.response as Record<string, unknown> | undefined)?.headers) as
      | Record<string, unknown>
      | undefined;
    if (!headers) return undefined;

    const retryAfter = headers['retry-after'] || headers['Retry-After'];
    if (!retryAfter) return undefined;

    const seconds = parseInt(String(retryAfter), 10);
    return isNaN(seconds) ? undefined : seconds;
  }

  /**
   * エラーがリトライ可能かどうかを判定する
   *
   * @param error - 判定対象のエラー
   * @param currentRetry - 現在のリトライ回数
   * @param maxRetries - 最大リトライ回数
   * @returns リトライ可能な場合 true
   *
   * @since 1.0.0
   */
  public shouldRetry(error: APIError, currentRetry: number, maxRetries: number): boolean {
    // 最大リトライ回数を超えている場合
    if (currentRetry >= maxRetries) {
      return false;
    }

    // リトライ可能なエラータイプかチェック
    return isRetryableError(error);
  }

  /**
   * 指数バックオフによる遅延時間を計算する
   *
   * @param retryCount - リトライ回数
   * @param baseDelay - 基本遅延時間（ミリ秒）
   * @param maxDelay - 最大遅延時間（ミリ秒）
   * @param backoffMultiplier - バックオフ倍率
   * @param enableJitter - ジッターの有効化（デフォルト: true）
   * @returns 遅延時間（ミリ秒）
   *
   * @since 1.0.0
   */
  public calculateBackoffDelay(
    retryCount: number,
    baseDelay: number = 1000,
    maxDelay: number = 30000,
    backoffMultiplier: number = 2,
    enableJitter: boolean = true,
  ): number {
    // 指数バックオフ計算
    const exponentialDelay = baseDelay * Math.pow(backoffMultiplier, retryCount);

    // 最大遅延時間の制限
    const boundedDelay = Math.min(exponentialDelay, maxDelay);

    if (!enableJitter) {
      return boundedDelay;
    }

    // ジッターを追加（25%の範囲でランダム化）
    const jitter = boundedDelay * 0.25 * Math.random();

    return Math.floor(boundedDelay + jitter);
  }

  /**
   * ログ出力用にエラー情報をサニタイズする
   *
   * APIキーやトークンなどの機密情報を除去・マスクします。
   *
   * @param error - サニタイズ対象のエラー
   * @returns サニタイズ済みのエラー情報
   *
   * @since 1.0.0
   */
  public sanitizeErrorForLogging(error: APIError): APIError {
    const sanitized = { ...error };

    // メッセージのサニタイズ
    sanitized.message = this.sanitizeString(error.message);

    // 詳細情報のサニタイズ
    if (error.details && typeof error.details === 'object') {
      sanitized.details = this.sanitizeObject(error.details);
    }

    return sanitized;
  }

  /**
   * 文字列から機密情報を除去する
   *
   * @param text - サニタイズ対象の文字列
   * @returns サニタイズ済みの文字列
   *
   * @private
   */
  private sanitizeString(text: string): string {
    let sanitized = text;

    this.sensitivePatterns.forEach(pattern => {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    });

    return sanitized;
  }

  /**
   * オブジェクトから機密情報を除去する
   *
   * @param obj - サニタイズ対象のオブジェクト
   * @returns サニタイズ済みのオブジェクト
   *
   * @private
   */
  private sanitizeObject(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = ['apikey', 'api_key', 'token', 'password', 'secret', 'authorization'];

    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();

      if (sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        sanitized[key] = this.sanitizeString(value);
      } else if (typeof value === 'object') {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}

/**
 * APIエラーを作成する
 *
 * @param type - エラータイプ
 * @param message - エラーメッセージ
 * @param statusCode - HTTPステータスコード
 * @param retryAfter - リトライ可能時間（秒）
 * @param details - エラーの詳細情報
 * @param originalError - 元のエラー
 * @returns 作成されたAPIエラー
 *
 * @since 1.0.0
 */
export const createAPIError = (
  type: APIErrorType,
  message: string,
  statusCode?: number,
  retryAfter?: number,
  details?: unknown,
  originalError?: Error,
): APIError => {
  const error = new Error(message) as APIError;
  error.name = 'APIError';
  error.type = type;
  error.statusCode = statusCode;
  error.retryAfter = retryAfter;
  error.details = details;
  error.originalError = originalError;

  return error;
};

/**
 * エラーがリトライ可能かどうかを判定する
 *
 * @param error - 判定対象のエラー
 * @returns リトライ可能な場合 true
 *
 * @since 1.0.0
 */
export const isRetryableError = (error: APIError): boolean => {
  const retryableTypes = [APIErrorType.RATE_LIMIT, APIErrorType.NETWORK, APIErrorType.SERVER_ERROR];

  return retryableTypes.includes(error.type);
};

/**
 * デフォルトのリトライ設定
 *
 * @since 1.0.0
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: [APIErrorType.RATE_LIMIT, APIErrorType.NETWORK, APIErrorType.SERVER_ERROR],
};
