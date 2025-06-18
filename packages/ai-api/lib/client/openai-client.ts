/**
 * @fileoverview OpenAI API クライアント
 * 
 * OpenAI の Chat Completion API との通信を行うクライアントクラスです。
 * エラーハンドリング、タイムアウト、ストリーミング対応を含む
 * 包括的なAPI統合機能を提供します。
 * 
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

import { APIErrorHandler } from '../utils/error-handler';
import {
  type ChatCompletionRequest,
  type ChatCompletionResponse,
  type ChatCompletionChunk,
  type ClientConfig,
  type HealthCheckResult,
  type APIError
} from './api-types';

/**
 * OpenAI API クライアント
 * 
 * OpenAI の Chat Completion API との安全で効率的な通信を提供します。
 * タイムアウト、エラーハンドリング、ストリーミング、バリデーション機能を含みます。
 * 
 * @example
 * ```typescript
 * const client = new OpenAIClient({
 *   apiKey: 'your-openai-api-key',
 *   timeout: 30000
 * });
 * 
 * // 通常のチャット補完
 * const response = await client.createChatCompletion({
 *   model: 'gpt-4o',
 *   messages: [{ role: 'user', content: 'Hello!' }],
 *   max_tokens: 150
 * });
 * 
 * // ストリーミング
 * for await (const chunk of client.createChatCompletionStream(request)) {
 *   console.log(chunk.choices[0].delta.content);
 * }
 * ```
 * 
 * @since 1.0.0
 */
export class OpenAIClient {
  private readonly apiKey: string;
  private readonly baseURL: string;
  private readonly timeout: number;
  private readonly userAgent: string;
  private readonly errorHandler: APIErrorHandler;

  /**
   * 有効なOpenAIモデルのリスト
   */
  private readonly validModels = ['gpt-4o', 'gpt-4o-mini'] as const;

  /**
   * OpenAI API クライアントを初期化する
   * 
   * @param config - クライアント設定
   * @throws {Error} APIキーが未設定の場合
   * 
   * @since 1.0.0
   */
  constructor(config: ClientConfig) {
    if (!config.apiKey || config.apiKey.trim() === '') {
      throw new Error('API key is required');
    }

    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.timeout = config.timeout || 30000;
    this.userAgent = config.userAgent || 'chrome-extension-ai-api/1.0.0';
    this.errorHandler = new APIErrorHandler();
  }

  /**
   * チャット補完リクエストを実行する
   * 
   * OpenAI の Chat Completion API を呼び出してレスポンスを取得します。
   * リクエストのバリデーション、エラーハンドリング、タイムアウト処理を含みます。
   * 
   * @param request - チャット補完リクエスト
   * @returns チャット補完レスポンス
   * @throws {APIError} API呼び出し失敗時
   * 
   * @since 1.0.0
   */
  public async createChatCompletion(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    // リクエストバリデーション
    this.validateRequest(request);

    try {
      const response = await this.makeRequest('/chat/completions', request);
      
      if (!response.ok) {
        throw await this.handleHTTPError(response);
      }

      const data = await response.json();
      return data as ChatCompletionResponse;

    } catch (error) {
      // 既にAPIErrorの場合はそのまま投げる
      if (this.isAPIError(error)) {
        throw error;
      }
      
      // その他のエラーをAPIErrorに変換
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * ストリーミングチャット補完リクエストを実行する
   * 
   * サーバーサイドイベント（SSE）ストリームとして
   * チャット補完レスポンスを逐次受信します。
   * 
   * @param request - ストリーミングチャット補完リクエスト
   * @returns チャット補完チャンクの非同期イテラブル
   * @throws {APIError} API呼び出し失敗時
   * 
   * @since 1.0.0
   */
  public async *createChatCompletionStream(
    request: ChatCompletionRequest
  ): AsyncIterable<ChatCompletionChunk> {
    // ストリーミングフラグを設定
    const streamRequest = { ...request, stream: true };
    
    this.validateRequest(streamRequest);

    try {
      const response = await this.makeRequest('/chat/completions', streamRequest);
      
      if (!response.ok) {
        throw await this.handleHTTPError(response);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          
          // 最後の不完全な行をバッファに保持
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '') continue;
            if (trimmedLine === 'data: [DONE]') return;
            if (!trimmedLine.startsWith('data: ')) continue;

            try {
              const data = JSON.parse(trimmedLine.slice(6));
              yield data as ChatCompletionChunk;
            } catch {
              // JSONパースエラーは警告として記録するが処理は続行
              console.warn('Failed to parse SSE data:', trimmedLine);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (this.isAPIError(error)) {
        throw error;
      }
      throw this.errorHandler.handleError(error);
    }
  }

  /**
   * API接続のヘルスチェックを実行する
   * 
   * OpenAI API へのシンプルなリクエストを送信して
   * 接続状態とレスポンス時間を確認します。
   * 
   * @returns ヘルスチェック結果
   * 
   * @since 1.0.0
   */
  public async healthCheck(): Promise<HealthCheckResult> {
    const startTime = Date.now();
    
    try {
      // モデル一覧取得APIでヘルスチェック（軽量）
      const response = await this.makeRequest('/models', null, 'GET');
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        return {
          healthy: true,
          responseTime,
          timestamp: new Date()
        };
      } else {
        const error = await this.handleHTTPError(response);
        return {
          healthy: false,
          responseTime,
          error: error.message,
          timestamp: new Date()
        };
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        healthy: false,
        responseTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * HTTPリクエストを実行する
   * 
   * @param endpoint - APIエンドポイント
   * @param body - リクエストボディ
   * @param method - HTTPメソッド
   * @returns Fetchレスポンス
   * 
   * @private
   */
  private async makeRequest(
    endpoint: string, 
    body: unknown, 
    method: 'GET' | 'POST' = 'POST'
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: this.buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        timeoutError.name = 'TimeoutError';
        throw timeoutError;
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * HTTPリクエストヘッダーを構築する
   * 
   * @returns HTTPヘッダーオブジェクト
   * 
   * @private
   */
  private buildHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': this.userAgent
    };
  }

  /**
   * リクエストパラメータをバリデーションする
   * 
   * @param request - バリデーション対象のリクエスト
   * @throws {Error} バリデーション失敗時
   * 
   * @private
   */
  private validateRequest(request: ChatCompletionRequest): void {
    // モデルの検証
    if (!this.validModels.includes(request.model)) {
      throw new Error(`Invalid model: ${request.model}. Valid models: ${this.validModels.join(', ')}`);
    }

    // メッセージ配列の検証
    if (!Array.isArray(request.messages) || request.messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    // 温度パラメータの検証
    if (request.temperature !== undefined && (request.temperature < 0 || request.temperature > 2)) {
      throw new Error('Temperature must be between 0 and 2');
    }

    // トップPパラメータの検証
    if (request.top_p !== undefined && (request.top_p < 0 || request.top_p > 1)) {
      throw new Error('Top P must be between 0 and 1');
    }

    // 最大トークン数の検証
    if (request.max_tokens !== undefined && request.max_tokens < 1) {
      throw new Error('Max tokens must be greater than 0');
    }

    // ペナルティパラメータの検証
    if (request.presence_penalty !== undefined && 
        (request.presence_penalty < -2 || request.presence_penalty > 2)) {
      throw new Error('Presence penalty must be between -2 and 2');
    }

    if (request.frequency_penalty !== undefined && 
        (request.frequency_penalty < -2 || request.frequency_penalty > 2)) {
      throw new Error('Frequency penalty must be between -2 and 2');
    }
  }

  /**
   * HTTPエラーレスポンスを処理する
   * 
   * @param response - HTTPレスポンス
   * @returns APIエラー
   * 
   * @private
   */
  private async handleHTTPError(response: Response): Promise<APIError> {
    let errorData: any;
    
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: { message: `HTTP ${response.status}` } };
    }

    // ヘッダーの安全な変換
    const headers: Record<string, string> = {};
    if (response.headers && typeof response.headers.entries === 'function') {
      for (const [key, value] of response.headers.entries()) {
        headers[key] = value;
      }
    }

    const error = {
      message: errorData?.error?.message || `HTTP Error ${response.status}`,
      status: response.status,
      statusCode: response.status,
      headers: headers,
      data: errorData
    };

    return this.errorHandler.handleError(error);
  }

  /**
   * エラーがAPIErrorかどうかを判定する
   * 
   * @param error - 判定対象のエラー
   * @returns APIErrorの場合 true
   * 
   * @private
   */
  private isAPIError(error: unknown): error is APIError {
    return error && typeof error.type === 'string' && error.name === 'APIError';
  }
}