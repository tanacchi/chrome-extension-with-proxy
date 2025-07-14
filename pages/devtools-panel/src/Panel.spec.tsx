import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '../../../test-utils/global-types'

// Panelコンポーネントをインポート
import Panel from './Panel'

// CSS のモック
vi.mock('@src/Panel.css', () => ({}))

// UI コンポーネントのモック（Panel内でToggleButtonを定義しているため、ErrorDisplayとLoadingSpinnerのみモック）
vi.mock('@extension/ui', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  ErrorDisplay: ({ error }: { error?: Error }) => <div>Error: {error?.message}</div>,
  LoadingSpinner: () => <div>Loading...</div>,
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

describe('Panel (DevTools)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Chrome API モックのリセット
    vi.mocked(chrome.runtime.getURL).mockImplementation(
      (path: string) => `chrome-extension://test-id/${path}`,
    )
    vi.mocked(chrome.tabs.create).mockResolvedValue({ id: 1 } as any)
  })

  it('ライトテーマでDevToolsパネルが正しく表示される', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Panel />)

    // ロゴ画像が表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute(
      'src',
      'chrome-extension://test-id/devtools-panel/logo_horizontal.svg',
    )
    expect(logo).toHaveClass('App-logo')

    // 編集指示テキストが表示される
    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('pages/devtools-panel/src/Panel.tsx')).toBeInTheDocument()

    // テーマ切り替えボタンが表示される
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()

    // ライトテーマのクラスが適用される
    const appDiv = screen.getByText('Edit').closest('.App')
    expect(appDiv).toHaveClass('bg-slate-50')

    const headerDiv = screen.getByText('Edit').closest('.App-header')
    expect(headerDiv).toHaveClass('text-gray-900')

    // ToggleButtonのライトテーマスタイル
    const toggleButton = screen.getByText('Toggle theme')
    expect(toggleButton).toHaveClass('bg-white', 'text-black')
  })

  it('ダークテーマでDevToolsパネルが正しく表示される', () => {
    mockUseStorage.mockReturnValue({ isLight: false })

    render(<Panel />)

    // ダークテーマのロゴが表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toHaveAttribute(
      'src',
      'chrome-extension://test-id/devtools-panel/logo_horizontal_dark.svg',
    )

    // ダークテーマのクラスが適用される
    const appDiv = screen.getByText('Edit').closest('.App')
    expect(appDiv).toHaveClass('bg-gray-800')

    const headerDiv = screen.getByText('Edit').closest('.App-header')
    expect(headerDiv).toHaveClass('text-gray-100')

    // ToggleButtonのダークテーマスタイル
    const toggleButton = screen.getByText('Toggle theme')
    expect(toggleButton).toHaveClass('bg-black', 'text-white')
  })

  it('GitHubサイトへのリンクが正しく動作する', async () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Panel />)

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

    render(<Panel />)

    const toggleButton = screen.getByText('Toggle theme')
    await fireEvent.click(toggleButton)

    expect(mockToggle).toHaveBeenCalledOnce()
  })

  it('ToggleButtonの属性と構造が正しい', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Panel />)

    // ToggleButtonの属性確認
    const toggleButton = screen.getByText('Toggle theme')
    expect(toggleButton).toHaveAttribute('type', 'button')
    expect(toggleButton).toHaveClass(
      'mt-4',
      'rounded',
      'px-4',
      'py-1',
      'font-bold',
      'shadow',
      'hover:scale-105',
    )

    // コードタグの確認
    const codeElement = screen.getByText('pages/devtools-panel/src/Panel.tsx')
    expect(codeElement.tagName).toBe('CODE')
  })

  it('useStorageが適切に呼ばれている', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Panel />)

    // useStorageが少なくとも2回呼ばれる（Panel本体とToggleButton内部で）
    expect(mockUseStorage).toHaveBeenCalledTimes(2)
    expect(mockUseStorage).toHaveBeenCalledWith(exampleThemeStorage)
  })

  it('ボタンのhover効果のクラスが適用される', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Panel />)

    const toggleButton = screen.getByText('Toggle theme')
    expect(toggleButton).toHaveClass('hover:scale-105')
  })
})
