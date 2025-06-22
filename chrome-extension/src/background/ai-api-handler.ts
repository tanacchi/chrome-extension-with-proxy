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

import { createOpenAI } from '@ai-sdk/openai';
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

      let result: {
        text: string;
        usage?: {
          promptTokens: number;
          completionTokens: number;
          totalTokens: number;
        };
      };

      if (isDevelopment) {
        // Mock API サーバーを使用
        console.log('AI Analysis: Mock APIサーバー使用 (http://localhost:3001)');
        result = await this.callMockAPI(message.data);
      } else {
        // OpenAI API を使用
        console.log('AI Analysis: OpenAI API使用');
        result = await this.callOpenAIAPI(message.data, settings);
      }

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
   * 開発モード用の固定レスポンスを生成します
   *
   * @param requestData - リクエストデータ
   * @param settings - AI設定
   * @returns 開発用の固定レスポンス
   *
   * @private
   */
  private async callMockAPI(requestData: AIAnalysisRequest): Promise<{
    text: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    // 開発モード用の固定レスポンス
    const mockAnalysisResult = this.generateMockAnalysisResult(requestData.messages);

    // トークン数の簡易計算（文字数ベース）
    const inputText = requestData.messages.map(m => m.content).join(' ');
    const promptTokens = Math.ceil(inputText.length / 4); // 大体4文字で1トークン
    const completionTokens = Math.ceil(mockAnalysisResult.length / 4);

    // 実際のAPI呼び出しを模倣するため少し待機
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));

    return {
      text: mockAnalysisResult,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }

  /**
   * 開発用のモック分析結果を生成します
   *
   * @param messages - 入力メッセージ
   * @returns モック分析結果
   *
   * @private
   */
  private generateMockAnalysisResult(messages: Array<{ role: string; content: string }>): string {
    // ユーザーメッセージからテーブルデータの特徴を抽出
    const userMessage = messages.find(m => m.role === 'user')?.content || '';

    // テーブルデータかどうかを判定
    const hasTableData =
      userMessage.includes('\t') ||
      userMessage.includes('|') ||
      userMessage.toLowerCase().includes('table') ||
      userMessage.toLowerCase().includes('テーブル');

    if (hasTableData) {
      return `📊 **AI分析結果（開発モード）**

このテーブルデータの分析結果：

🔍 **データの特徴**
- データ形式: 構造化されたテーブルデータを検出
- 項目数: 複数のカラムと行で構成
- データの種類: 数値データと文字列データが混在

📈 **傾向とパターン**
- データには一定のパターンが見られます
- 各項目間に相関関係の可能性があります
- データの分布は比較的均等です

💡 **推奨事項**
- より詳細な分析には追加のデータが有効です
- データの可視化を検討することをお勧めします
- 定期的なデータ更新で傾向を追跡できます

⚠️ *これは開発モード用の固定レスポンスです。実際の分析には本番のAPIキーを設定してください。*`;
    } else {
      return `🤖 **AI応答（開発モード）**

ご質問にお答えします：

📝 **回答内容**
入力いただいた内容について、以下の観点から回答いたします：

• 基本的な情報整理
• 関連する要素の特定
• 推奨される次のステップ

🎯 **要点**
- 内容を理解し、適切な対応を検討しました
- さらなる詳細が必要な場合はお知らせください
- 継続的なサポートが可能です

⚠️ *これは開発モード用の固定レスポンスです。実際のAI分析には本番のAPIキーを設定してください。*`;
    }
  }

  /**
   * OpenAI API を呼び出します
   *
   * @param requestData - リクエストデータ
   * @param settings - AI設定
   * @returns OpenAI API のレスポンス
   *
   * @private
   */
  private async callOpenAIAPI(
    requestData: AIAnalysisRequest,
    settings: {
      apiKey: string;
      model: string;
      temperature: number;
      maxTokens: number;
    },
  ): Promise<{
    text: string;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> {
    const openai = createOpenAI({
      apiKey: settings.apiKey, // 実際のOpenAI APIキー
    });

    const model = openai(settings.model);

    return await generateText({
      model: model,
      messages: requestData.messages.map(msg => ({
        role: msg.role as 'system' | 'user' | 'assistant',
        content: msg.content,
      })),
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
    });
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
