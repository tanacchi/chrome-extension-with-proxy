/**
 * @fileoverview AI分析カスタムフック
 *
 * @ai-sdk/reactのuseChatフックを内部で使用し、
 * テーブルデータのAI分析に特化したインターフェースを提供します。
 * Chrome拡張機能のContent ScriptでReactコンポーネントから使用されます。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

import { useAISettings } from './use-ai-settings';
import { buildAnalysisPrompt } from '../services/prompt-service';
import { sendChromeMessage } from '../utils/message-utils';
import { useChat } from '@ai-sdk/react';
import { useCallback, useMemo } from 'react';
import type { AnalysisResult } from '../types/analysis';

/**
 * AI分析フックのオプション
 *
 * @interface UseAnalysisOptions
 */
export interface UseAnalysisOptions {
  /** 分析完了時のコールバック */
  onAnalysisComplete?: (result: AnalysisResult) => void;
  /** エラー発生時のコールバック */
  onError?: (error: Error) => void;
  /** 分析開始時のコールバック */
  onAnalysisStart?: () => void;
}

/**
 * AI分析フックの戻り値
 *
 * @interface UseAnalysisReturn
 */
export interface UseAnalysisReturn {
  /** テーブルデータを分析する関数 */
  analyzeTableData: (tableData: string[]) => Promise<void>;
  /** 分析実行中かどうか */
  isAnalyzing: boolean;
  /** 分析結果のメッセージリスト */
  analysisMessages: Array<{ role: string; content: string }>;
  /** 最新の分析結果 */
  latestResult: string | null;
  /** エラー情報 */
  error: Error | null;
  /** 分析をリセットする関数 */
  resetAnalysis: () => void;
  /** 分析を停止する関数 */
  stopAnalysis: () => void;
}

/**
 * AI分析カスタムフック
 *
 * @ai-sdk/reactのuseChatを内部で使用して、テーブルデータの
 * AI分析機能を提供します。Chrome拡張機能のBackground Scriptと
 * 連携してOpenAI APIを呼び出します。
 *
 * @example
 * ```typescript
 * const AnalysisComponent: React.FC = () => {
 *   const { analyzeTableData, isAnalyzing, latestResult, error } = useAnalysis({
 *     onAnalysisComplete: (result) => {
 *       console.log('Analysis completed:', result);
 *     },
 *     onError: (error) => {
 *       console.error('Analysis failed:', error);
 *     }
 *   });
 *
 *   const handleAnalyze = async () => {
 *     const tableData = ['データ1', 'データ2', 'データ3'];
 *     await analyzeTableData(tableData);
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleAnalyze} disabled={isAnalyzing}>
 *         {isAnalyzing ? '分析中...' : 'AI分析実行'}
 *       </button>
 *       {error && <div>エラー: {error.message}</div>}
 *       {latestResult && <div>結果: {latestResult}</div>}
 *     </div>
 *   );
 * };
 * ```
 *
 * @param options - フックのオプション
 * @returns AI分析機能を提供するオブジェクト
 *
 * @since 1.0.0
 */
export const useAnalysis = (options: UseAnalysisOptions = {}): UseAnalysisReturn => {
  const { onAnalysisComplete, onError, onAnalysisStart } = options;
  const { settings, isLoading: settingsLoading } = useAISettings();

  /**
   * Chrome拡張機能用のカスタムAPI関数
   * Background Scriptとの通信を行います
   */
  const chromeExtensionAPI = useCallback(
    async (request: { messages: Array<{ role: string; content: string }> }) => {
      try {
        const response = await sendChromeMessage({
          type: 'AI_ANALYSIS_REQUEST',
          data: {
            messages: request.messages,
            settings: settings,
          },
        });

        if (!response.success) {
          throw new Error(response.error || 'Analysis request failed');
        }

        return response.data;
      } catch (error) {
        console.error('Chrome message error:', error);
        throw error;
      }
    },
    [settings],
  );

  /**
   * useChatフックの設定
   */
  const { messages, append, isLoading, error, stop, setMessages } = useChat({
    api: chromeExtensionAPI,
    onError: error => {
      console.error('AI Analysis Error:', error);
      onError?.(error);
    },
    onFinish: message => {
      if (message.role === 'assistant' && message.content) {
        const result: AnalysisResult = {
          id: `analysis-${Date.now()}`,
          content: message.content,
          timestamp: new Date(),
          model: settings?.model || 'unknown',
          inputData: [], // 後で設定される
          processingTime: 0, // 後で計算される
        };
        onAnalysisComplete?.(result);
      }
    },
  });

  /**
   * テーブルデータを分析する関数
   */
  const analyzeTableData = useCallback(
    async (tableData: string[]) => {
      if (!settings) {
        throw new Error('AI settings not loaded');
      }

      if (settingsLoading) {
        throw new Error('AI settings are still loading');
      }

      if (!tableData || tableData.length === 0) {
        throw new Error('Table data is empty');
      }

      try {
        onAnalysisStart?.();

        // プロンプトを構築
        const prompt = buildAnalysisPrompt(tableData, settings.customPrompt);

        // AI分析を実行
        await append({
          role: 'user',
          content: prompt,
        });
      } catch (error) {
        console.error('Analysis error:', error);
        const analysisError = error instanceof Error ? error : new Error('Unknown analysis error');
        onError?.(analysisError);
        throw analysisError;
      }
    },
    [settings, settingsLoading, append, onAnalysisStart, onError],
  );

  /**
   * 分析をリセットする関数
   */
  const resetAnalysis = useCallback(() => {
    setMessages([]);
  }, [setMessages]);

  /**
   * 分析を停止する関数
   */
  const stopAnalysis = useCallback(() => {
    stop();
  }, [stop]);

  /**
   * 最新の分析結果を取得
   */
  const latestResult = useMemo(() => {
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    const latestMessage = assistantMessages[assistantMessages.length - 1];
    return latestMessage?.content || null;
  }, [messages]);

  /**
   * 分析実行中の判定
   * 設定読み込み中も含める
   */
  const isAnalyzing = isLoading || settingsLoading;

  return {
    analyzeTableData,
    isAnalyzing,
    analysisMessages: messages,
    latestResult,
    error,
    resetAnalysis,
    stopAnalysis,
  };
};

/**
 * 分析結果のメッセージをフィルタリングするヘルパー関数
 *
 * @param messages - メッセージの配列
 * @returns アシスタントのメッセージのみ
 *
 * @since 1.0.0
 */
export const getAnalysisResults = (messages: Array<{ role: string; content: string }>): string[] =>
  messages
    .filter(message => message.role === 'assistant')
    .map(message => message.content)
    .filter(Boolean);

/**
 * 分析実行時間を計算するヘルパー関数
 *
 * @param messages - メッセージの配列
 * @returns 実行時間（ミリ秒）
 *
 * @since 1.0.0
 */
export const calculateAnalysisTime = (messages: Array<{ role: string; content: string; createdAt?: Date }>): number => {
  if (messages.length < 2) return 0;

  const userMessage = messages.find(m => m.role === 'user');
  const assistantMessage = messages.find(m => m.role === 'assistant');

  if (!userMessage?.createdAt || !assistantMessage?.createdAt) return 0;

  const startTime = new Date(userMessage.createdAt).getTime();
  const endTime = new Date(assistantMessage.createdAt).getTime();

  return endTime - startTime;
};
