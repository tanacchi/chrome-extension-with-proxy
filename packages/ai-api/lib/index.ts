/**
 * @fileoverview AI API統合パッケージのメインエクスポート
 *
 * @ai-sdk/reactを使用したAI分析機能を提供する
 * Chrome拡張機能向けパッケージです。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

// Hooks
export { useAnalysis, type UseAnalysisOptions, type UseAnalysisReturn } from './hooks/use-analysis';
export { useAISettings, type UseAISettingsReturn, isAISettingsAvailable, maskApiKey } from './hooks/use-ai-settings';

// Services
export {
  buildAnalysisPrompt,
  buildAnalysisPromptDetailed,
  getDefaultPrompt,
  validatePrompt,
  type PromptBuildOptions,
  type PromptBuildResult,
} from './services/prompt-service';

// Utils
export {
  sendChromeMessage,
  setupMessageListener,
  MESSAGE_TYPES,
  calculateMessageSize,
  sanitizeMessageForLogging,
  type ChromeMessage,
  type ChromeMessageResponse,
  type MessageOptions,
} from './utils/message-utils';

export { APIErrorHandler, createAPIError, isRetryableError, DEFAULT_RETRY_CONFIG } from './utils/error-handler';

// Types
export {
  type AnalysisResult,
  type TableAnalysisRequest,
  AnalysisStatus,
  type AnalysisHistoryEntry,
} from './types/analysis';

export {
  APIErrorType,
  type APIError,
  type RetryConfig,
  type RateLimitStatus,
  type HealthCheckResult,
  type ClientConfig,
} from './client/api-types';

// Re-export from @ai-sdk/react for convenience
export { useChat, type UseChatOptions } from '@ai-sdk/react';
