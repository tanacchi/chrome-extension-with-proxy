/**
 * @fileoverview AI分析機能
 *
 * Content ScriptでのAI分析処理を実装します。
 * Background Scriptとの通信を通じて、
 * OpenAI APIを使用してテーブルデータの分析を行います。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

import { sendChromeMessage, buildAnalysisPrompt } from '@extension/ai-api';
import { aiSettingsStorage } from '@extension/storage';

/**
 * AI分析結果の型定義
 *
 * @interface AnalysisResult
 */
interface AnalysisResult {
  /** 分析結果テキスト */
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
 * AI分析のエラー種別
 *
 * @enum AnalysisErrorType
 */
export enum AnalysisErrorType {
  /** 設定が無効 */
  INVALID_SETTINGS = 'invalid_settings',
  /** APIキーが未設定 */
  NO_API_KEY = 'no_api_key',
  /** ネットワークエラー */
  NETWORK_ERROR = 'network_error',
  /** API制限エラー */
  API_LIMIT_ERROR = 'api_limit_error',
  /** 不明なエラー */
  UNKNOWN_ERROR = 'unknown_error',
}

/**
 * AI分析エラーの詳細情報
 *
 * @interface AnalysisError
 */
export interface AnalysisError extends Error {
  /** エラーの種別 */
  type: AnalysisErrorType;
  /** エラーコード */
  code?: string;
  /** 詳細メッセージ */
  details?: string;
}

/**
 * AI分析オプション
 *
 * @interface AnalysisOptions
 */
interface AnalysisOptions {
  /** カスタムプロンプト */
  customPrompt?: string;
  /** カスタムプロンプトを使用するかどうか */
  useCustomPrompt?: boolean;
  /** 進捗コールバック */
  onProgress?: (stage: string) => void;
  /** エラーコールバック */
  onError?: (error: AnalysisError) => void;
}

/**
 * テーブルデータのAI分析を実行します
 *
 * 1. AI設定の検証
 * 2. プロンプトの構築
 * 3. Background Scriptとの通信
 * 4. 分析結果の処理
 *
 * @param tableData - 分析対象のテーブルデータ
 * @param options - 分析オプション
 * @returns 分析結果
 *
 * @throws {AnalysisError} 分析処理でエラーが発生した場合
 *
 * @example
 * ```typescript
 * const data = ['項目1のデータ', '項目2のデータ', '項目3のデータ'];
 *
 * try {
 *   const result = await analyzeTableData(data, {
 *     onProgress: (stage) => console.log(`進捗: ${stage}`),
 *     onError: (error) => console.error('分析エラー:', error)
 *   });
 *
 *   console.log('分析結果:', result.text);
 * } catch (error) {
 *   console.error('分析に失敗:', error);
 * }
 * ```
 *
 * @since 1.0.0
 */
export const analyzeTableData = async (tableData: string[], options: AnalysisOptions = {}): Promise<AnalysisResult> => {
  const { customPrompt, useCustomPrompt, onProgress, onError } = options;

  try {
    // 1. データの検証
    onProgress?.('データ検証中...');
    if (!tableData || tableData.length === 0) {
      throw createAnalysisError(AnalysisErrorType.INVALID_SETTINGS, '分析対象のデータが指定されていません');
    }

    // 2. AI設定の取得と検証
    onProgress?.('設定確認中...');
    const settings = await aiSettingsStorage.get();

    if (!settings.apiKey || settings.apiKey.trim().length === 0) {
      throw createAnalysisError(
        AnalysisErrorType.NO_API_KEY,
        'OpenAI APIキーが設定されていません。設定ページで設定してください。',
      );
    }

    // 3. プロンプトの構築
    onProgress?.('プロンプト構築中...');
    const finalCustomPrompt = useCustomPrompt && customPrompt ? customPrompt : settings.customPrompt;
    const prompt = buildAnalysisPrompt(tableData, finalCustomPrompt);

    // 4. メッセージの準備
    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    // 5. Background Scriptとの通信
    onProgress?.('AI分析実行中...');
    const response = await sendChromeMessage({
      type: 'AI_ANALYSIS_REQUEST',
      data: {
        messages,
        settings: {
          apiKey: settings.apiKey,
          model: settings.model,
          temperature: 0.7,
          maxTokens: 1000,
        },
      },
    });

    // 6. レスポンスの検証
    if (!response.success) {
      const errorType = classifyAPIError(response.errorCode);
      throw createAnalysisError(errorType, response.error || '分析処理でエラーが発生しました', response.errorCode);
    }

    if (!response.data) {
      throw createAnalysisError(AnalysisErrorType.UNKNOWN_ERROR, '分析結果を取得できませんでした');
    }

    onProgress?.('分析完了');

    return {
      text: response.data.text,
      usage: response.data.usage,
      processingTime: response.data.processingTime,
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);

    // AnalysisError以外のエラーを変換
    if (!(error instanceof Error) || !('type' in error)) {
      const analysisError = createAnalysisError(
        AnalysisErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : '不明なエラーが発生しました',
      );
      onError?.(analysisError);
      throw analysisError;
    }

    onError?.(error as AnalysisError);
    throw error;
  }
};

/**
 * AI設定が正しく設定されているかチェックします
 *
 * @returns 設定状況の詳細
 *
 * @since 1.0.0
 */
export const checkAISettings = async (): Promise<{
  isValid: boolean;
  hasApiKey: boolean;
  model: string;
  errors: string[];
}> => {
  try {
    console.log('AI Settings: チェック開始');
    const settings = await aiSettingsStorage.get();
    console.log('AI Settings: 取得された設定', settings);
    const errors: string[] = [];

    const hasApiKey = Boolean(settings.apiKey && settings.apiKey.trim().length > 0);
    if (!hasApiKey) {
      errors.push('OpenAI APIキーが設定されていません');
    }

    if (!settings.model) {
      errors.push('AIモデルが設定されていません');
    }

    const result = {
      isValid: errors.length === 0,
      hasApiKey,
      model: settings.model || 'gpt-4o-mini',
      errors,
    };

    console.log('AI Settings: チェック結果', result);
    return result;
  } catch (error) {
    console.error('Failed to check AI settings:', error);
    return {
      isValid: false,
      hasApiKey: false,
      model: '',
      errors: ['設定の読み込みに失敗しました'],
    };
  }
};

/**
 * AnalysisErrorを作成するヘルパー関数
 *
 * @param type - エラーの種別
 * @param message - エラーメッセージ
 * @param code - エラーコード（オプション）
 * @returns AnalysisError
 *
 * @private
 */
const createAnalysisError = (type: AnalysisErrorType, message: string, code?: string): AnalysisError => {
  const error = new Error(message) as AnalysisError;
  error.type = type;
  error.code = code;
  return error;
};

/**
 * APIエラーコードからAnalysisErrorTypeに分類します
 *
 * @param errorCode - APIエラーコード
 * @returns 分析エラーの種別
 *
 * @private
 */
const classifyAPIError = (errorCode?: string): AnalysisErrorType => {
  if (!errorCode) return AnalysisErrorType.UNKNOWN_ERROR;

  switch (errorCode) {
    case 'INVALID_API_KEY':
      return AnalysisErrorType.NO_API_KEY;
    case 'RATE_LIMIT_EXCEEDED':
    case 'QUOTA_EXCEEDED':
      return AnalysisErrorType.API_LIMIT_ERROR;
    case 'NETWORK_ERROR':
      return AnalysisErrorType.NETWORK_ERROR;
    default:
      return AnalysisErrorType.UNKNOWN_ERROR;
  }
};

/**
 * 分析結果を表示用に整形します
 *
 * @param result - 分析結果
 * @returns 整形されたテキスト
 *
 * @since 1.0.0
 */
export const formatAnalysisResult = (result: AnalysisResult): string => {
  let formatted = result.text;

  // 使用量情報を追加
  if (result.usage) {
    formatted += `\n\n--- 使用量情報 ---\n`;
    formatted += `プロンプトトークン: ${result.usage.promptTokens}\n`;
    formatted += `完了トークン: ${result.usage.completionTokens}\n`;
    formatted += `総トークン: ${result.usage.totalTokens}`;
  }

  // 処理時間を追加
  if (result.processingTime) {
    formatted += `\n処理時間: ${(result.processingTime / 1000).toFixed(2)}秒`;
  }

  return formatted;
};
