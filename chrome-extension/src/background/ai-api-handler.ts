/**
 * @fileoverview Background Script AI API ハンドラー
 *
 * Content ScriptからのAI分析リクエストを受信し、
 * OpenAI APIとの実際の通信を行います。
 * Chrome拡張機能のセキュリティポリシーに従い、
 * API通信はBackground Scriptで集中管理されます。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

import { openai } from '@ai-sdk/openai';
import { aiSettingsStorage } from '@extension/storage';
import { generateText } from 'ai';
import type { ChromeMessage, ChromeMessageResponse } from '@extension/ai-api';

/**
 * AI分析リクエストの型定義
 *
 * @interface AIAnalysisRequest
 */
interface AIAnalysisRequest {
  /** チャットメッセージの配列 */
  messages: Array<{ role: string; content: string }>;
  /** AI設定 */
  settings?: {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

/**
 * AI分析レスポンスの型定義
 *
 * @interface AIAnalysisResponse
 */
interface AIAnalysisResponse {
  /** 生成されたテキスト */
  text: string;
  /** 使用量情報 */
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  /** 処理時間（ミリ秒） */
  processingTime: number;
}

/**
 * AI API ハンドラークラス
 *
 * OpenAI APIとの通信を管理し、エラーハンドリングと
 * セキュリティ対策を提供します。
 *
 * @example
 * ```typescript
 * const handler = new AIAPIHandler();
 * handler.initialize();
 * ```
 *
 * @since 1.0.0
 */
export class AIAPIHandler {
  private isInitialized = false;

  /**
   * ハンドラーを初期化します
   * Chrome拡張機能のメッセージリスナーを設定します
   *
   * @since 1.0.0
   */
  public initialize(): void {
    if (this.isInitialized) {
      console.warn('AI API Handler is already initialized');
      return;
    }

    // Chrome拡張機能のメッセージリスナーを設定
    chrome.runtime.onMessage.addListener(
      (
        message: ChromeMessage<AIAnalysisRequest>,
        sender: chrome.runtime.MessageSender,
        sendResponse: (response: ChromeMessageResponse<AIAnalysisResponse>) => void,
      ) => {
        // AI分析リクエストのみを処理
        if (message.type === 'AI_ANALYSIS_REQUEST') {
          this.handleAIAnalysisRequest(message, sender, sendResponse);
          return true; // 非同期レスポンスを示す
        }
        return false;
      },
    );

    this.isInitialized = true;
    console.log('AI API Handler initialized successfully');
  }

  /**
   * AI分析リクエストを処理します
   *
   * @param message - Chrome メッセージ
   * @param sender - 送信者情報
   * @param sendResponse - レスポンス関数
   *
   * @private
   */
  private async handleAIAnalysisRequest(
    message: ChromeMessage<AIAnalysisRequest>,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: ChromeMessageResponse<AIAnalysisResponse>) => void,
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // リクエストデータの検証
      if (!message.data || !message.data.messages) {
        throw new Error('Invalid request: messages are required');
      }

      // AI設定の取得
      const settings = await this.getAISettings(message.data.settings);

      // APIキーの検証
      if (!settings.apiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      // 開発時はmock-api、本番時はOpenAI APIを使用
      const isDevelopment = settings.apiKey === 'sk-test-development-api-key-placeholder';

      let client: ReturnType<typeof openai>;
      if (isDevelopment) {
        // Mock API サーバーを使用
        console.log('AI Analysis: Mock APIサーバー使用 (http://localhost:3001)');
        client = openai({
          apiKey: 'mock-api-key',
          baseURL: 'http://localhost:3001/v1',
        });
      } else {
        // OpenAI API を使用
        console.log('AI Analysis: OpenAI API使用');
        client = openai({
          apiKey: settings.apiKey,
        });
      }

      // AI分析の実行
      const result = await generateText({
        model: client(settings.model),
        messages: message.data.messages.map(msg => ({
          role: msg.role as 'system' | 'user' | 'assistant',
          content: msg.content,
        })),
        temperature: settings.temperature || 0.7,
        maxTokens: settings.maxTokens || 1000,
      });

      const processingTime = Date.now() - startTime;

      // 成功レスポンス
      const response: ChromeMessageResponse<AIAnalysisResponse> = {
        success: true,
        data: {
          text: result.text,
          usage: result.usage
            ? {
                promptTokens: result.usage.promptTokens,
                completionTokens: result.usage.completionTokens,
                totalTokens: result.usage.totalTokens,
              }
            : undefined,
          processingTime,
        },
        requestId: message.requestId,
      };

      sendResponse(response);
    } catch (error) {
      const processingTime = Date.now() - startTime;

      console.error('AI Analysis Error:', error, `(Processing time: ${processingTime}ms)`);

      // エラーレスポンス
      const errorResponse: ChromeMessageResponse<AIAnalysisResponse> = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        errorCode: this.getErrorCode(error),
        requestId: message.requestId,
      };

      sendResponse(errorResponse);
    }
  }

  /**
   * AI設定を取得します
   * リクエストの設定とストレージの設定をマージします
   *
   * @param requestSettings - リクエストに含まれる設定
   * @returns マージされた設定
   *
   * @private
   */
  private async getAISettings(requestSettings?: AIAnalysisRequest['settings']) {
    try {
      // ストレージから基本設定を取得
      const storedSettings = await aiSettingsStorage.get();

      // リクエスト設定とマージ（リクエスト設定が優先）
      return {
        apiKey: requestSettings?.apiKey || storedSettings.apiKey,
        model: requestSettings?.model || storedSettings.model || 'gpt-4o-mini',
        temperature: requestSettings?.temperature ?? 0.7,
        maxTokens: requestSettings?.maxTokens ?? 1000,
      };
    } catch (error) {
      console.error('Failed to load AI settings:', error);
      // フォールバック設定
      return {
        apiKey: requestSettings?.apiKey || '',
        model: requestSettings?.model || 'gpt-4o-mini',
        temperature: requestSettings?.temperature ?? 0.7,
        maxTokens: requestSettings?.maxTokens ?? 1000,
      };
    }
  }

  /**
   * エラーコードを生成します
   *
   * @param error - エラーオブジェクト
   * @returns エラーコード
   *
   * @private
   */
  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      // OpenAI API エラーの分類
      if (message.includes('api key')) {
        return 'INVALID_API_KEY';
      }
      if (message.includes('rate limit')) {
        return 'RATE_LIMIT_EXCEEDED';
      }
      if (message.includes('quota')) {
        return 'QUOTA_EXCEEDED';
      }
      if (message.includes('network') || message.includes('fetch')) {
        return 'NETWORK_ERROR';
      }
    }
    return 'UNKNOWN_ERROR';
  }

  /**
   * ハンドラーの状態をチェックします
   *
   * @returns 初期化済みかどうか
   *
   * @since 1.0.0
   */
  public isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * ハンドラーをシャットダウンします
   * リスナーを削除し、リソースをクリーンアップします
   *
   * @since 1.0.0
   */
  public shutdown(): void {
    if (!this.isInitialized) {
      return;
    }

    // リスナーの削除
    // Note: chrome.runtime.onMessage.removeListener は特定のリスナー関数が必要
    // 実装上は通常拡張機能のライフサイクル終了時に自動的にクリーンアップされる

    this.isInitialized = false;
    console.log('AI API Handler shutdown completed');
  }
}

/**
 * グローバルハンドラーインスタンス
 */
export const aiAPIHandler = new AIAPIHandler();
