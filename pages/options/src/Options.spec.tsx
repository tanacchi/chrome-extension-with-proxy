import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '../../../test-utils/global-types'

// Optionsコンポーネントをインポート
import Options from './Options'

// CSS のモック
vi.mock('@src/Options.css', () => ({}))

// AISettingsOptionsコンポーネントのモック
vi.mock('./AISettingsOptions', () => ({
  AISettingsOptions: () => <div data-testid="ai-settings-options">AI Settings Options</div>,
}))

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

describe('Options', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Chrome API モックのリセット
    vi.mocked(chrome.runtime.getURL).mockImplementation(
      (path: string) => `chrome-extension://test-id/${path}`,
    )
    vi.mocked(chrome.tabs.create).mockResolvedValue({ id: 1 } as any)
  })

  it('ライトテーマで正しく表示される', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Options />)

    // ロゴ画像が表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'chrome-extension://test-id/options/logo_horizontal.svg')

    // タイトルテキストが表示される
    expect(screen.getByText('Table Data AI Analysis Tool')).toBeInTheDocument()

    // テーマ切り替えボタンが表示される
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()

    // AISettingsOptionsコンポーネントが表示される
    expect(screen.getByTestId('ai-settings-options')).toBeInTheDocument()

    // ライトテーマのクラスが適用される
    const appDiv = screen.getByText('Table Data AI Analysis Tool').closest('.App')
    expect(appDiv).toHaveClass('bg-slate-50', 'text-gray-900')
  })

  it('ダークテーマで正しく表示される', () => {
    mockUseStorage.mockReturnValue({ isLight: false })

    render(<Options />)

    // ダークテーマのロゴが表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toHaveAttribute(
      'src',
      'chrome-extension://test-id/options/logo_horizontal_dark.svg',
    )

    // ダークテーマのクラスが適用される
    const appDiv = screen.getByText('Table Data AI Analysis Tool').closest('.App')
    expect(appDiv).toHaveClass('bg-gray-800', 'text-gray-100')
  })

  it('GitHubサイトへのリンクが正しく動作する', async () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Options />)

    const logoButton = screen.getByText('Table Data AI Analysis Tool').closest('button')
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

    render(<Options />)

    const toggleButton = screen.getByText('Toggle theme')
    await fireEvent.click(toggleButton)

    expect(mockToggle).toHaveBeenCalledOnce()
  })

  it('レスポンシブレイアウトが適用される', () => {
    mockUseStorage.mockReturnValue({ isLight: true })

    render(<Options />)

    // ヘッダーのレイアウトクラス確認
    const header = screen.getByText('Table Data AI Analysis Tool').closest('header')
    expect(header).toHaveClass('flex', 'items-center', 'justify-between')

    // メインエリアのレイアウトクラス確認
    const main = screen.getByTestId('ai-settings-options').closest('main')
    expect(main).toHaveClass('container', 'mx-auto', 'py-8')
  })
})
