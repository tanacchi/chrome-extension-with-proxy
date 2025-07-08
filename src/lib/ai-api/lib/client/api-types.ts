/**
 * @fileoverview AI API統合のための型定義
 *
 * OpenAI APIとの統合に必要な型定義を提供します。
 * レスポンス、リクエスト、エラーハンドリングなどの
 * 包括的な型安全性を確保します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

/**
 * OpenAI APIのチャットメッセージ
 *
 * @interface ChatMessage
 */
export interface ChatMessage {
  /** メッセージの役割 */
  role: 'system' | 'user' | 'assistant'
  /** メッセージの内容 */
  content: string
  /** メッセージの名前（オプション） */
  name?: string
}

/**
 * OpenAI APIのチャット補完リクエスト
 *
 * @interface ChatCompletionRequest
 */
export interface ChatCompletionRequest {
  /** 使用するモデル */
  model: 'gpt-4o' | 'gpt-4o-mini'
  /** メッセージの配列 */
  messages: ChatMessage[]
  /** 応答の最大トークン数 */
  max_tokens?: number
  /** 温度パラメータ（0-2） */
  temperature?: number
  /** トップPパラメータ（0-1） */
  top_p?: number
  /** ストリーミングの有効化 */
  stream?: boolean
  /** ストップシーケンス */
  stop?: string | string[]
  /** 存在ペナルティ */
  presence_penalty?: number
  /** 頻度ペナルティ */
  frequency_penalty?: number
}

/**
 * OpenAI APIのチャット補完レスポンス
 *
 * @interface ChatCompletionResponse
 */
export interface ChatCompletionResponse {
  /** 一意のID */
  id: string
  /** オブジェクトタイプ */
  object: 'chat.completion'
  /** 作成日時（Unix timestamp） */
  created: number
  /** 使用されたモデル */
  model: string
  /** 選択肢の配列 */
  choices: ChatCompletionChoice[]
  /** 使用量情報 */
  usage?: ChatCompletionUsage
  /** システムフィンガープリント */
  system_fingerprint?: string
}

/**
 * チャット補完の選択肢
 *
 * @interface ChatCompletionChoice
 */
export interface ChatCompletionChoice {
  /** インデックス */
  index: number
  /** メッセージ */
  message: ChatMessage
  /** 終了理由 */
  finish_reason: 'stop' | 'length' | 'content_filter' | null
  /** ログ確率（オプション） */
  logprobs?: unknown
}

/**
 * API使用量情報
 *
 * @interface ChatCompletionUsage
 */
export interface ChatCompletionUsage {
  /** プロンプトトークン数 */
  prompt_tokens: number
  /** 補完トークン数 */
  completion_tokens: number
  /** 総トークン数 */
  total_tokens: number
}

/**
 * ストリーミングレスポンスのチャンク
 *
 * @interface ChatCompletionChunk
 */
export interface ChatCompletionChunk {
  /** 一意のID */
  id: string
  /** オブジェクトタイプ */
  object: 'chat.completion.chunk'
  /** 作成日時（Unix timestamp） */
  created: number
  /** 使用されたモデル */
  model: string
  /** デルタの配列 */
  choices: ChatCompletionDelta[]
  /** システムフィンガープリント */
  system_fingerprint?: string
}

/**
 * ストリーミングのデルタ情報
 *
 * @interface ChatCompletionDelta
 */
export interface ChatCompletionDelta {
  /** インデックス */
  index: number
  /** デルタメッセージ */
  delta: {
    /** 役割（最初のチャンクのみ） */
    role?: string
    /** コンテンツの差分 */
    content?: string
  }
  /** 終了理由 */
  finish_reason: 'stop' | 'length' | 'content_filter' | null
}

/**
 * APIエラーの種別
 *
 * @enum APIErrorType
 */
export enum APIErrorType {
  /** 認証エラー */
  AUTHENTICATION = 'authentication',
  /** レート制限エラー */
  RATE_LIMIT = 'rate_limit',
  /** クォータ超過エラー */
  QUOTA_EXCEEDED = 'quota_exceeded',
  /** ネットワークエラー */
  NETWORK = 'network',
  /** 不正なリクエスト */
  INVALID_REQUEST = 'invalid_request',
  /** サーバーエラー */
  SERVER_ERROR = 'server_error',
  /** 不明なエラー */
  UNKNOWN = 'unknown',
}

/**
 * APIエラーの詳細情報
 *
 * @interface APIError
 * @extends Error
 */
export interface APIError extends Error {
  /** エラーの種別 */
  type: APIErrorType
  /** HTTPステータスコード */
  statusCode?: number
  /** リトライ可能時間（秒） */
  retryAfter?: number
  /** エラーの詳細情報 */
  details?: unknown
  /** オリジナルのエラー */
  originalError?: Error
}

/**
 * リトライ設定
 *
 * @interface RetryConfig
 */
export interface RetryConfig {
  /** 最大リトライ回数 */
  maxRetries: number
  /** 基本遅延時間（ミリ秒） */
  baseDelay: number
  /** 最大遅延時間（ミリ秒） */
  maxDelay: number
  /** バックオフ倍率 */
  backoffMultiplier: number
  /** リトライ可能なエラータイプ */
  retryableErrors: APIErrorType[]
}

/**
 * レート制限の状況
 *
 * @interface RateLimitStatus
 */
export interface RateLimitStatus {
  /** リクエスト制限数 */
  limit: number
  /** 残りリクエスト数 */
  remaining: number
  /** リセット時刻（Unix timestamp） */
  resetTime: number
  /** 次のリクエスト可能時刻 */
  nextRequestTime?: number
}

/**
 * 分析結果
 *
 * @interface AnalysisResult
 */
export interface AnalysisResult {
  /** 一意のID */
  id: string
  /** 入力データ */
  inputData: string[]
  /** 分析結果の配列 */
  responses: string[]
  /** 使用されたモデル */
  model: string
  /** 使用されたプロンプト */
  promptUsed: string
  /** 作成日時 */
  timestamp: Date
  /** 処理時間（ミリ秒） */
  processingTime: number
  /** トークン使用量 */
  tokenUsage?: ChatCompletionUsage
}

/**
 * プロンプト検証結果
 *
 * @interface ValidationResult
 */
export interface ValidationResult {
  /** 検証結果 */
  isValid: boolean
  /** エラーメッセージ（検証失敗時） */
  errors: string[]
  /** 警告メッセージ */
  warnings: string[]
}

/**
 * キャッシュエントリ
 *
 * @interface CacheEntry
 */
export interface CacheEntry<T = unknown> {
  /** キャッシュされたデータ */
  data: T
  /** 作成日時 */
  createdAt: Date
  /** 有効期限 */
  expiresAt: Date
  /** アクセス回数 */
  accessCount: number
  /** 最終アクセス日時 */
  lastAccessedAt: Date
}

/**
 * AI設定（storageパッケージからの拡張）
 *
 * @interface ExtendedAISettings
 */
export interface ExtendedAISettings {
  /** OpenAI APIキー */
  apiKey: string
  /** 使用するモデル */
  model: 'gpt-4o' | 'gpt-4o-mini'
  /** カスタムプロンプト */
  customPrompt?: string
  /** カスタムプロンプトの使用フラグ */
  useCustomPrompt: boolean
  /** リクエスト設定 */
  requestConfig?: {
    /** 最大トークン数 */
    maxTokens?: number
    /** 温度パラメータ */
    temperature?: number
    /** タイムアウト（ミリ秒） */
    timeout?: number
  }
  /** キャッシュ設定 */
  cacheConfig?: {
    /** キャッシュの有効化 */
    enabled: boolean
    /** TTL（秒） */
    ttl: number
    /** 最大キャッシュサイズ */
    maxSize: number
  }
}

/**
 * APIクライアントの設定
 *
 * @interface ClientConfig
 */
export interface ClientConfig {
  /** APIキー */
  apiKey: string
  /** ベースURL */
  baseURL?: string
  /** タイムアウト（ミリ秒） */
  timeout?: number
  /** リトライ設定 */
  retryConfig?: RetryConfig
  /** ユーザーエージェント */
  userAgent?: string
}

/**
 * ヘルスチェック結果
 *
 * @interface HealthCheckResult
 */
export interface HealthCheckResult {
  /** ヘルスチェック結果 */
  healthy: boolean
  /** レスポンス時間（ミリ秒） */
  responseTime: number
  /** エラーメッセージ（失敗時） */
  error?: string
  /** チェック実行日時 */
  timestamp: Date
}
