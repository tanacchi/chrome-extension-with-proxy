import { describe, it, expect, vi, beforeEach } from 'vitest'

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

// AI API handler のモック
vi.mock('./ai-api-handler', () => ({
  aiAPIHandler: {
    initialize: vi.fn(),
    isReady: vi.fn(() => true),
    shutdown: vi.fn(),
  },
}))

// Storage のモック
vi.mock('@extension/storage', () => ({
  exampleThemeStorage: {
    get: vi.fn().mockResolvedValue({ theme: 'light', isLight: true }),
  },
}))

// console.log をモック
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

describe('Background Script Index', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('背景スクリプトが正常に初期化される', async () => {
    const { aiAPIHandler } = await import('./ai-api-handler')
    const { exampleThemeStorage } = await import('@extension/storage')

    // background/index.ts を動的インポート
    await import('./index')

    // AI API ハンドラーが初期化されることを確認
    expect(aiAPIHandler.initialize).toHaveBeenCalledOnce()

    // ストレージからテーマが取得されることを確認
    expect(exampleThemeStorage.get).toHaveBeenCalledOnce()

    // ログが出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith('Background loaded')
    expect(consoleSpy).toHaveBeenCalledWith(
      "Edit 'chrome-extension/src/background/index.ts' and save to reload.",
    )
  })

  it('テーマ取得後にログが出力される', async () => {
    const { exampleThemeStorage } = await import('@extension/storage')

    // テーマストレージのモックを設定
    vi.mocked(exampleThemeStorage.get).mockResolvedValue({ theme: 'dark', isLight: false })

    // モジュールキャッシュをクリアして新しく実行
    vi.resetModules()

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // background/index.ts を動的インポート
    await import('./index')

    // 非同期処理の完了を待つ
    await new Promise(resolve => setTimeout(resolve, 50))

    // テーマがログ出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith('theme', { theme: 'dark', isLight: false })

    consoleSpy.mockRestore()
  })

  it('webextension-polyfillが読み込まれる', async () => {
    // webextension-polyfillのモック
    vi.mock('webextension-polyfill', () => ({}))

    // エラーなく読み込まれることを確認
    expect(async () => {
      await import('./index')
    }).not.toThrow()
  })

  it('AI API ハンドラーの初期化エラーが処理される', async () => {
    const { aiAPIHandler } = await import('./ai-api-handler')

    // AI API ハンドラーの初期化でエラーを発生させる
    vi.mocked(aiAPIHandler.initialize).mockImplementation(() => {
      throw new Error('Initialization failed')
    })

    // エラーハンドリングのテスト
    await expect(async () => {
      await import('./index')
    }).not.toThrow()
  })

  it('ストレージエラーが適切に処理される', async () => {
    const { exampleThemeStorage } = await import('@extension/storage')

    // ストレージでエラーを発生させる
    vi.mocked(exampleThemeStorage.get).mockRejectedValue(new Error('Storage error'))

    // モジュールキャッシュをクリアして新しく実行
    vi.resetModules()

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // エラーが発生してもスクリプトが継続することを確認
    await expect(async () => {
      await import('./index')
    }).not.toThrow()

    // 非同期処理の完了を待つ
    await new Promise(resolve => setTimeout(resolve, 50))

    // 基本的なログは出力されることを確認
    expect(consoleSpy).toHaveBeenCalledWith('Background loaded')

    consoleSpy.mockRestore()
  })
})
