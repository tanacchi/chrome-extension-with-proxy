/**
 * @fileoverview AI分析関連の型定義
 *
 * テーブルデータAI分析機能で使用される
 * 型定義を提供します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

/**
 * 分析結果
 *
 * @interface AnalysisResult
 */
export interface AnalysisResult {
  /** 一意のID */
  id: string
  /** 分析結果の内容 */
  content: string
  /** 分析実行日時 */
  timestamp: Date
  /** 使用されたモデル */
  model: string
  /** 入力データ */
  inputData: string[]
  /** 処理時間（ミリ秒） */
  processingTime: number
  /** 使用されたプロンプト */
  promptUsed?: string
  /** トークン使用量 */
  tokenUsage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

/**
 * テーブル分析リクエスト
 *
 * @interface TableAnalysisRequest
 */
export interface TableAnalysisRequest {
  /** テーブルデータ */
  tableData: string[]
  /** AI設定 */
  settings: {
    apiKey: string
    model: 'gpt-4o' | 'gpt-4o-mini'
    customPrompt?: string
    useCustomPrompt: boolean
  }
  /** リクエストID */
  requestId?: string
  /** タイムスタンプ */
  timestamp?: number
}

/**
 * 分析状態
 *
 * @enum AnalysisStatus
 */
export enum AnalysisStatus {
  /** 待機中 */
  IDLE = 'idle',
  /** 実行中 */
  RUNNING = 'running',
  /** 完了 */
  COMPLETED = 'completed',
  /** エラー */
  ERROR = 'error',
  /** キャンセル */
  CANCELLED = 'cancelled',
}

/**
 * 分析履歴エントリ
 *
 * @interface AnalysisHistoryEntry
 */
export interface AnalysisHistoryEntry {
  /** 分析結果 */
  result: AnalysisResult
  /** 分析状態 */
  status: AnalysisStatus
  /** エラー情報（エラー時） */
  error?: string
}
