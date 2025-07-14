import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '../../../test-utils/global-types'

// Popupコンポーネントをインポート
import Popup from './Popup'

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
  useStorage: vi.fn(),
  withErrorBoundary: <T extends React.ComponentType>(Component: T) => Component,
  withSuspense: <T extends React.ComponentType>(Component: T) => Component,
  PROJECT_URL_OBJECT: {
    url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite',
  },
}))

// モックしたuseStorageへの参照を取得
import { useStorage } from '@extension/shared'
const mockUseStorage = vi.mocked(useStorage)

describe('Popup', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Chrome API モックのリセット
    vi.mocked(chrome.runtime.getURL).mockImplementation(
      (path: string) => `chrome-extension://test-id/${path}`,
    )
    vi.mocked(chrome.tabs.create).mockResolvedValue({ id: 1 } as any)
    vi.mocked(chrome.scripting.executeScript).mockResolvedValue([{ result: true }] as any)
  })

  it('ライトテーマでポップアップが正しく表示される', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Popup />)

    // ロゴ画像が表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'chrome-extension://test-id/popup/logo_vertical.svg')

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

  it('GitHubサイトへのリンクが正しく動作する', async () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Popup />)

    const logoButton = screen.getByAltText('logo').closest('button')
    expect(logoButton).toBeInTheDocument()

    if (logoButton) {
      await fireEvent.click(logoButton)
    }

    expect(chrome.tabs.create).toHaveBeenCalledOnce()
    expect(chrome.tabs.create).toHaveBeenCalledWith({
      url: 'https://github.com/Jonghakseo/chrome-extension-boilerplate-react-vite',
    })
  })
})
