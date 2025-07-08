/**
 * @fileoverview AI APIハンドラーのテスト
 *
 * Background ScriptでのAI API通信処理の
 * 単体テストを提供します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

import { AIAPIHandler } from './ai-api-handler'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Chrome API のモック
const mockChrome = {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
}

// グローバルオブジェクトにchromeを設定
global.chrome = mockChrome as unknown as typeof chrome

// AI SDK のモック
vi.mock('@ai-sdk/openai', () => ({
  createOpenAI: vi.fn(() => vi.fn((model: string) => `mocked-${model}`)),
}))

vi.mock('ai', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: 'Mock AI analysis result',
    usage: {
      promptTokens: 10,
      completionTokens: 20,
      totalTokens: 30,
    },
  }),
}))

// Storage のモック
vi.mock('@extension/storage', () => ({
  aiSettingsStorage: {
    get: vi.fn().mockResolvedValue({
      apiKey: 'sk-test-key',
      model: 'gpt-4o-mini',
      customPrompt: '',
      useCustomPrompt: false,
    }),
  },
}))

describe('AIAPIHandler', () => {
  let handler: AIAPIHandler

  beforeEach(() => {
    handler = new AIAPIHandler()
    vi.clearAllMocks()
  })

  afterEach(() => {
    if (handler.isReady()) {
      handler.shutdown()
    }
  })

  describe('初期化', () => {
    it('正常に初期化される', () => {
      handler.initialize()

      expect(handler.isReady()).toBe(true)
      expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledOnce()
    })

    it('重複初期化が防がれる', () => {
      handler.initialize()
      handler.initialize()

      expect(mockChrome.runtime.onMessage.addListener).toHaveBeenCalledOnce()
    })
  })

  describe('メッセージハンドリング', () => {
    beforeEach(() => {
      handler.initialize()
    })

    it('AI_ANALYSIS_REQUESTメッセージを処理する', async () => {
      const { generateText } = await import('ai')
      const mockGenerateText = generateText as ReturnType<typeof vi.fn>

      mockGenerateText.mockResolvedValue({
        text: 'AI分析結果',
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      })

      // メッセージリスナーの取得
      const addListenerCall = mockChrome.runtime.onMessage.addListener.mock.calls[0]
      const messageListener = addListenerCall[0]

      const mockMessage = {
        type: 'AI_ANALYSIS_REQUEST',
        data: {
          messages: [{ role: 'user', content: 'テストメッセージ' }],
        },
        requestId: 'test-request-123',
      }

      const mockSender = {}
      const mockSendResponse = vi.fn()

      // メッセージリスナーを呼び出し
      const result = messageListener(mockMessage, mockSender, mockSendResponse)

      expect(result).toBe(true) // 非同期処理を示す

      // 少し待機して非同期処理の完了を待つ
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mocked-gpt-4o-mini',
          temperature: 0.7,
          maxTokens: 1000,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('あなたは親切で知識豊富な'),
            }),
            expect.objectContaining({
              role: 'user',
              content: 'テストメッセージ',
            }),
          ]),
        }),
      )

      expect(mockSendResponse).toHaveBeenCalledWith({
        success: true,
        data: {
          text: 'AI分析結果',
          usage: {
            promptTokens: 10,
            completionTokens: 20,
            totalTokens: 30,
          },
          processingTime: expect.any(Number),
        },
        requestId: 'test-request-123',
      })
    })

    it('無効なメッセージタイプは処理しない', () => {
      const addListenerCall = mockChrome.runtime.onMessage.addListener.mock.calls[0]
      const messageListener = addListenerCall[0]

      const mockMessage = {
        type: 'OTHER_MESSAGE_TYPE',
        data: {},
      }

      const result = messageListener(mockMessage, {}, vi.fn())

      expect(result).toBe(false)
    })

    it('無効なリクエストでエラーレスポンスを返す', async () => {
      const addListenerCall = mockChrome.runtime.onMessage.addListener.mock.calls[0]
      const messageListener = addListenerCall[0]

      const mockMessage = {
        type: 'AI_ANALYSIS_REQUEST',
        data: {}, // messagesが欠如
        requestId: 'test-request-456',
      }

      const mockSendResponse = vi.fn()

      messageListener(mockMessage, {}, mockSendResponse)

      // 少し待機して非同期処理の完了を待つ
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid request: messages are required',
        errorCode: 'UNKNOWN_ERROR',
        requestId: 'test-request-456',
        data: {
          text: '',
          processingTime: expect.any(Number),
        },
      })
    })
  })

  describe('エラーハンドリング', () => {
    beforeEach(() => {
      handler.initialize()
    })

    it('API キーエラーを適切に分類する', async () => {
      const { generateText } = await import('ai')
      const mockGenerateText = generateText as ReturnType<typeof vi.fn>

      mockGenerateText.mockRejectedValue(new Error('Invalid API key provided'))

      const addListenerCall = mockChrome.runtime.onMessage.addListener.mock.calls[0]
      const messageListener = addListenerCall[0]

      const mockMessage = {
        type: 'AI_ANALYSIS_REQUEST',
        data: {
          messages: [{ role: 'user', content: 'test' }],
        },
        requestId: 'test-request-789',
      }

      const mockSendResponse = vi.fn()

      messageListener(mockMessage, {}, mockSendResponse)

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Invalid API key provided',
        errorCode: 'INVALID_API_KEY',
        requestId: 'test-request-789',
        data: {
          text: '',
          processingTime: expect.any(Number),
        },
      })
    })

    it('レート制限エラーを適切に分類する', async () => {
      const { generateText } = await import('ai')
      const mockGenerateText = generateText as ReturnType<typeof vi.fn>

      mockGenerateText.mockRejectedValue(new Error('Rate limit exceeded'))

      const addListenerCall = mockChrome.runtime.onMessage.addListener.mock.calls[0]
      const messageListener = addListenerCall[0]

      const mockMessage = {
        type: 'AI_ANALYSIS_REQUEST',
        data: {
          messages: [{ role: 'user', content: 'test' }],
        },
        requestId: 'test-request-101',
      }

      const mockSendResponse = vi.fn()

      messageListener(mockMessage, {}, mockSendResponse)

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockSendResponse).toHaveBeenCalledWith({
        success: false,
        error: 'Rate limit exceeded',
        errorCode: 'RATE_LIMIT_EXCEEDED',
        requestId: 'test-request-101',
        data: {
          text: '',
          processingTime: expect.any(Number),
        },
      })
    })
  })

  describe('設定管理', () => {
    beforeEach(() => {
      handler.initialize()
    })

    it('ストレージからAI設定を取得する', async () => {
      const { generateText } = await import('ai')
      const { aiSettingsStorage } = await import('@extension/storage')
      const mockGenerateText = generateText as ReturnType<typeof vi.fn>

      mockGenerateText.mockResolvedValue({
        text: 'result',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      })

      const addListenerCall = mockChrome.runtime.onMessage.addListener.mock.calls[0]
      const messageListener = addListenerCall[0]

      const mockMessage = {
        type: 'AI_ANALYSIS_REQUEST',
        data: {
          messages: [{ role: 'user', content: 'test' }],
        },
      }

      messageListener(mockMessage, {}, vi.fn())

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(aiSettingsStorage.get).toHaveBeenCalled()
    })

    it('リクエスト設定が優先される', async () => {
      const { generateText } = await import('ai')
      const mockGenerateText = generateText as ReturnType<typeof vi.fn>

      mockGenerateText.mockResolvedValue({
        text: 'result',
        usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 },
      })

      const addListenerCall = mockChrome.runtime.onMessage.addListener.mock.calls[0]
      const messageListener = addListenerCall[0]

      const mockMessage = {
        type: 'AI_ANALYSIS_REQUEST',
        data: {
          messages: [{ role: 'user', content: 'test' }],
          settings: {
            model: 'gpt-4o',
            temperature: 0.5,
            maxTokens: 500,
          },
        },
      }

      messageListener(mockMessage, {}, vi.fn())

      await new Promise(resolve => setTimeout(resolve, 10))

      expect(mockGenerateText).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'mocked-gpt-4o',
          temperature: 0.5,
          maxTokens: 500,
          messages: expect.arrayContaining([
            expect.objectContaining({
              role: 'system',
              content: expect.stringContaining('あなたは優秀なデータアナリスト'),
            }),
            expect.objectContaining({
              role: 'user',
              content: 'test',
            }),
          ]),
        }),
      )
    })
  })

  describe('ライフサイクル', () => {
    it('シャットダウンが正常に動作する', () => {
      handler.initialize()
      expect(handler.isReady()).toBe(true)

      handler.shutdown()
      expect(handler.isReady()).toBe(false)
    })

    it('未初期化状態でのシャットダウンでエラーが発生しない', () => {
      expect(() => handler.shutdown()).not.toThrow()
    })
  })
})
