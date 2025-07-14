import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Popup from './Popup'
import '../../../test-utils/global-types'

// Chrome API のモック
const mockCreateTab = vi.fn()
const mockQueryTabs = vi.fn()
const mockExecuteScript = vi.fn()
const mockCreateNotification = vi.fn()

// CSS のモック
vi.mock('@src/Popup.css', () => ({}))

// UI コンポーネントのモック
vi.mock('@extension/ui', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  ErrorDisplay: ({ error }: { error?: Error }) => <div>Error: {error?.message}</div>,
  LoadingSpinner: () => <div>Loading...</div>,
  ToggleButton: ({ children, ...props }: { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}))

// HOC のモック
vi.mock('@extension/shared', () => ({
  useStorage: globalThis.mockUseStorage || vi.fn(),
  withErrorBoundary: <T extends React.ComponentType>(Component: T) => Component,
  withSuspense: <T extends React.ComponentType>(Component: T) => Component,
  PROJECT_URL_OBJECT: {
    url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite',
  },
}))

describe('Popup', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Chrome APIのモック設定
    global.chrome = {
      ...global.chrome,
      tabs: {
        ...global.chrome.tabs,
        create: mockCreateTab,
        query: mockQueryTabs,
      },
      scripting: {
        executeScript: mockExecuteScript,
      },
      notifications: {
        create: mockCreateNotification,
      },
      runtime: {
        getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      },
    } satisfies Partial<typeof chrome>
  })

  it('ライトテーマでポップアップが正しく表示される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<Popup />)

    // ロゴ画像が表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'chrome-extension://test/popup/logo_vertical.svg')

    // 編集指示テキストが表示される
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('pages/popup/src/Popup.tsx')).toBeInTheDocument()

    // コンテンツスクリプト注入ボタンが表示される
    const injectButton = screen.getByText('Inject content script')
    expect(injectButton).toBeInTheDocument()
    expect(injectButton).toHaveClass('bg-blue-200', 'text-black')

    // テーマ切り替えボタンが表示される
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()
  })

  it('ダークテーマでポップアップが正しく表示される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: false })

    render(<Popup />)

    // ダークテーマ用のロゴが表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toHaveAttribute('src', 'chrome-extension://test/popup/logo_vertical_dark.svg')

    // ダークテーマ用のスタイルが適用される
    const injectButton = screen.getByText('Inject content script')
    expect(injectButton).toHaveClass('bg-gray-700', 'text-white')

    // メインコンテナにダークテーマが適用される
    const container = screen.getByText('Edit').closest('.App')
    expect(container).toHaveClass('bg-gray-800')

    // ヘッダーにダークテーマが適用される
    const header = screen.getByText('Edit').closest('.App-header')
    expect(header).toHaveClass('text-gray-100')
  })

  it('GitHubサイトへのリンクが正しく動作する', async () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<Popup />)

    const logoButton = screen.getByAltText('logo').closest('button')
    expect(logoButton).toBeInTheDocument()

    await fireEvent.click(logoButton!)

    expect(mockCreateTab).toHaveBeenCalledOnce()
    expect(mockCreateTab).toHaveBeenCalledWith({
      url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite',
    })
  })

  it('コンテンツスクリプトが正常に注入される', async () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })
    mockQueryTabs.mockResolvedValue([{ id: 123, url: 'https://example.com' }])
    mockExecuteScript.mockResolvedValue(undefined)

    render(<Popup />)

    const injectButton = screen.getByText('Inject content script')
    await fireEvent.click(injectButton)

    await waitFor(() => {
      expect(mockQueryTabs).toHaveBeenCalledWith({ currentWindow: true, active: true })
      expect(mockExecuteScript).toHaveBeenCalledWith({
        target: { tabId: 123 },
        files: ['/content-runtime/example.iife.js', '/content-runtime/all.iife.js'],
      })
    })

    expect(mockCreateNotification).not.toHaveBeenCalled()
  })

  it('about:URLに対してエラー通知が表示される', async () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })
    mockQueryTabs.mockResolvedValue([{ id: 123, url: 'about:blank' }])

    render(<Popup />)

    const injectButton = screen.getByText('Inject content script')
    await fireEvent.click(injectButton)

    await waitFor(() => {
      expect(mockCreateNotification).toHaveBeenCalledWith('inject-error', {
        type: 'basic',
        iconUrl: 'chrome-extension://test/icon-34.png',
        title: 'Injecting content script error',
        message: 'You cannot inject script here!',
      })
    })
  })

  it('chrome:URLに対してエラー通知が表示される', async () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })
    mockQueryTabs.mockResolvedValue([{ id: 123, url: 'chrome://settings' }])

    render(<Popup />)

    const injectButton = screen.getByText('Inject content script')
    await fireEvent.click(injectButton)

    await waitFor(() => {
      expect(mockCreateNotification).toHaveBeenCalledWith('inject-error', {
        type: 'basic',
        iconUrl: 'chrome-extension://test/icon-34.png',
        title: 'Injecting content script error',
        message: 'You cannot inject script here!',
      })
    })
  })

  it('スクリプト実行エラーでエラー通知が表示される', async () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })
    mockQueryTabs.mockResolvedValue([{ id: 123, url: 'https://example.com' }])
    mockExecuteScript.mockRejectedValue(new Error('Cannot access a chrome:// URL'))

    render(<Popup />)

    const injectButton = screen.getByText('Inject content script')
    await fireEvent.click(injectButton)

    await waitFor(() => {
      expect(mockCreateNotification).toHaveBeenCalledWith('inject-error', {
        type: 'basic',
        iconUrl: 'chrome-extension://test/icon-34.png',
        title: 'Injecting content script error',
        message: 'You cannot inject script here!',
      })
    })
  })

  it('その他のスクリプト実行エラーでは通知が表示されない', async () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })
    mockQueryTabs.mockResolvedValue([{ id: 123, url: 'https://example.com' }])
    mockExecuteScript.mockRejectedValue(new Error('Other error'))

    render(<Popup />)

    const injectButton = screen.getByText('Inject content script')
    await fireEvent.click(injectButton)

    await waitFor(() => {
      expect(mockExecuteScript).toHaveBeenCalled()
    })

    expect(mockCreateNotification).not.toHaveBeenCalled()
  })

  it('タブIDが存在しない場合はID 0を使用する', async () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })
    mockQueryTabs.mockResolvedValue([{ url: 'https://example.com' }]) // id がない
    mockExecuteScript.mockResolvedValue(undefined)

    render(<Popup />)

    const injectButton = screen.getByText('Inject content script')
    await fireEvent.click(injectButton)

    await waitFor(() => {
      expect(mockExecuteScript).toHaveBeenCalledWith({
        target: { tabId: 0 },
        files: ['/content-runtime/example.iife.js', '/content-runtime/all.iife.js'],
      })
    })
  })

  it('テーマ切り替えボタンが正常に動作する', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<Popup />)

    const toggleButton = screen.getByText('Toggle theme')
    expect(toggleButton).toBeInTheDocument()

    // ToggleButtonコンポーネントが正しく表示されていることを確認
    expect(toggleButton.tagName).toBe('BUTTON')
  })

  it('ボタンのホバー効果が適用される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<Popup />)

    const injectButton = screen.getByText('Inject content script')
    expect(injectButton).toHaveClass('hover:scale-105')
  })

  it('レスポンシブなスタイルが適用される', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: true })

    render(<Popup />)

    const injectButton = screen.getByText('Inject content script')
    expect(injectButton).toHaveClass('mt-4', 'rounded', 'px-4', 'py-1', 'font-bold', 'shadow')
  })

  it('undefinedのテーマ状態でもエラーにならない', () => {
    globalThis.mockUseStorage.mockReturnValue({ isLight: undefined })

    expect(() => {
      render(<Popup />)
    }).not.toThrow()

    // undefinedの場合はダークテーマのロゴが表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toHaveAttribute('src', 'chrome-extension://test/popup/logo_vertical_dark.svg')
  })
})
