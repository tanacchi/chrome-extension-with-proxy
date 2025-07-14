import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '../../../test-utils/global-types'

// NewTabコンポーネントをインポート
import NewTab from './NewTab'

// CSS のモック
vi.mock('@src/NewTab.css', () => ({}))
vi.mock('@src/NewTab.scss', () => ({}))

// UI コンポーネントのモック
vi.mock('@extension/ui', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  ErrorDisplay: ({ error }: { error?: Error }) => <div>Error: {error?.message}</div>,
  LoadingSpinner: () => <div>Loading...</div>,
  ToggleButton: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
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

// Storage のモック
vi.mock('@extension/storage', () => ({
  exampleThemeStorage: {
    toggle: vi.fn(),
  },
}))

// モックしたuseStorageへの参照を取得
import { useStorage } from '@extension/shared'
import { exampleThemeStorage } from '@extension/storage'
const mockUseStorage = vi.mocked(useStorage)
const mockToggle = vi.mocked(exampleThemeStorage.toggle)

describe('NewTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Chrome API モックのリセット
    vi.mocked(chrome.runtime.getURL).mockImplementation(
      (path: string) => `chrome-extension://test-id/${path}`,
    )
    vi.mocked(chrome.tabs.create).mockResolvedValue({ id: 1 } as any)

    // console.logのモック
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('ライトテーマで新しいタブページが正しく表示される', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<NewTab />)

    // ロゴ画像が表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'chrome-extension://test-id/new-tab/logo_horizontal.svg')
    expect(logo).toHaveClass('App-logo')

    // 編集指示テキストが表示される
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('pages/new-tab/src/NewTab.tsx')).toBeInTheDocument()

    // SASS関連のテキストが表示される
    expect(
      screen.getByText('The color of this paragraph is defined using SASS.'),
    ).toBeInTheDocument()

    // テーマ切り替えボタンが表示される
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()

    // ライトテーマのクラスが適用される
    const appDiv = screen.getByText('Edit').closest('.App')
    expect(appDiv).toHaveClass('bg-slate-50')

    const headerDiv = screen.getByText('Edit').closest('.App-header')
    expect(headerDiv).toHaveClass('text-gray-900')
  })

  it('ダークテーマで新しいタブページが正しく表示される', () => {
    mockUseStorage.mockReturnValue({ isLight: false })

    render(<NewTab />)

    // ダークテーマのロゴが表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toHaveAttribute(
      'src',
      'chrome-extension://test-id/new-tab/logo_horizontal_dark.svg',
    )

    // ダークテーマのクラスが適用される
    const appDiv = screen.getByText('Edit').closest('.App')
    expect(appDiv).toHaveClass('bg-gray-800')

    const headerDiv = screen.getByText('Edit').closest('.App-header')
    expect(headerDiv).toHaveClass('text-gray-100')
  })

  it('GitHubサイトへのリンクが正しく動作する', async () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<NewTab />)

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

  it('テーマ切り替えボタンが正しく動作する', async () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<NewTab />)

    const toggleButton = screen.getByText('Toggle theme')
    await fireEvent.click(toggleButton)

    expect(mockToggle).toHaveBeenCalledOnce()
  })

  it('i18n関数が正しく呼ばれる', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<NewTab />)

    // console.logでi18nの結果が出力されることを確認
    expect(console.log).toHaveBeenCalledWith('hello')
  })

  it('適切な構造でレンダリングされる', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<NewTab />)

    // ボタンタイプの確認
    const logoButton = screen.getByAltText('logo').closest('button')
    expect(logoButton).toHaveAttribute('type', 'button')

    // コードタグの確認
    const codeElement = screen.getByText('pages/new-tab/src/NewTab.tsx')
    expect(codeElement.tagName).toBe('CODE')

    // h6要素の確認
    const h6Element = screen.getByText('The color of this paragraph is defined using SASS.')
    expect(h6Element.tagName).toBe('H6')
  })
})
