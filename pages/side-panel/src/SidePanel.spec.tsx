import '@testing-library/jest-dom/vitest'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '../../../test-utils/global-types'

// SidePanelコンポーネントをインポート
import SidePanel from './SidePanel'

// CSS のモック
vi.mock('@src/SidePanel.css', () => ({}))

// UI コンポーネントのモック
vi.mock('@extension/ui', () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(' '),
  ErrorDisplay: ({ error }: { error?: Error }) => <div>Error: {error?.message}</div>,
  LoadingSpinner: () => <div>Loading...</div>,
  ToggleButton: ({
    children,
    onClick,
    className,
    ...props
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <button onClick={onClick} className={className} {...props}>
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
const mockAISettingsStorage = {
  set: vi.fn(),
  get: vi.fn(),
  subscribe: vi.fn(),
}

vi.mock('@extension/storage', () => ({
  exampleThemeStorage: {
    toggle: vi.fn(),
  },
  createAISettingsStorage: () => mockAISettingsStorage,
}))

// モックしたuseStorageへの参照を取得
import { useStorage } from '@extension/shared'
import { exampleThemeStorage } from '@extension/storage'
const mockUseStorage = vi.mocked(useStorage)
const mockToggle = vi.mocked(exampleThemeStorage.toggle)

describe('SidePanel', () => {
  const defaultAISettings = {
    apiKey: 'sk-test-key',
    model: 'gpt-4o-mini',
    customPrompt: '',
    useCustomPrompt: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    // Chrome API モックのリセット
    vi.mocked(chrome.runtime.getURL).mockImplementation(
      (path: string) => `chrome-extension://test-id/${path}`,
    )
    vi.mocked(chrome.tabs.create).mockResolvedValue({ id: 1 } as any)
    vi.mocked(chrome.runtime.openOptionsPage).mockResolvedValue()

    // console.errorのモック
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // setTimeoutのモック
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('ライトテーマでホームタブが正しく表示される', () => {
    mockUseStorage
      .mockReturnValueOnce({ isLight: true }) // exampleThemeStorage
      .mockReturnValueOnce(defaultAISettings) // aiSettingsStorage

    render(<SidePanel />)

    // ロゴ画像が表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toBeInTheDocument()
    expect(logo).toHaveAttribute('src', 'chrome-extension://test-id/side-panel/logo_vertical.svg')

    // タイトルテキストが表示される
    expect(screen.getByText('Chrome Extension')).toBeInTheDocument()
    expect(screen.getByText('テーブルデータAI分析ツール')).toBeInTheDocument()

    // ナビゲーションタブが表示される
    expect(screen.getByText('ホーム')).toBeInTheDocument()
    expect(screen.getByText('AI設定')).toBeInTheDocument()

    // ホームタブのボタンが表示される
    expect(screen.getByText('AI設定')).toBeInTheDocument() // ボタンのテキスト
    expect(screen.getByText('設定ページを開く')).toBeInTheDocument()
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()

    // ライトテーマのクラスが適用される
    const appDiv = screen.getByText('Chrome Extension').closest('.App')
    expect(appDiv).toHaveClass('bg-slate-50')
  })

  it('ダークテーマで正しく表示される', () => {
    mockUseStorage.mockReturnValueOnce({ isLight: false }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // ダークテーマのロゴが表示される
    const logo = screen.getByAltText('logo')
    expect(logo).toHaveAttribute(
      'src',
      'chrome-extension://test-id/side-panel/logo_vertical_dark.svg',
    )

    // ダークテーマのクラスが適用される
    const appDiv = screen.getByText('Chrome Extension').closest('.App')
    expect(appDiv).toHaveClass('bg-gray-800')
  })

  it('AI設定タブに切り替えられる', async () => {
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // AI設定タブをクリック
    const settingsTab = screen.getAllByText('AI設定')[0] // タブのテキスト
    await fireEvent.click(settingsTab)

    // AI設定フォームが表示される
    expect(screen.getByText('OpenAI API Key')).toBeInTheDocument()
    expect(screen.getByText('モデル')).toBeInTheDocument()
    expect(screen.getByDisplayValue('sk-test-key')).toBeInTheDocument()
    expect(screen.getByDisplayValue('gpt-4o-mini')).toBeInTheDocument()
  })

  it('AI設定フォームの入力値が変更される', async () => {
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // AI設定タブに移動
    const settingsTab = screen.getAllByText('AI設定')[0]
    await fireEvent.click(settingsTab)

    // API Key を変更
    const apiKeyInput = screen.getByDisplayValue('sk-test-key')
    await fireEvent.change(apiKeyInput, { target: { value: 'sk-new-key' } })
    expect(apiKeyInput).toHaveValue('sk-new-key')

    // モデルを変更
    const modelSelect = screen.getByDisplayValue('gpt-4o-mini')
    await fireEvent.change(modelSelect, { target: { value: 'gpt-4o' } })
    expect(modelSelect).toHaveValue('gpt-4o')
  })

  it('カスタムプロンプトの使用が切り替えられる', async () => {
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // AI設定タブに移動
    const settingsTab = screen.getAllByText('AI設定')[0]
    await fireEvent.click(settingsTab)

    // カスタムプロンプトチェックボックスをクリック
    const checkbox = screen.getByLabelText('カスタムプロンプト使用')
    await fireEvent.click(checkbox)

    // カスタムプロンプトテキストエリアが表示される
    expect(screen.getByLabelText('カスタムプロンプト')).toBeInTheDocument()
  })

  it('設定の保存が正しく動作する', async () => {
    mockAISettingsStorage.set.mockResolvedValue(undefined)
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // AI設定タブに移動
    const settingsTab = screen.getAllByText('AI設定')[0]
    await fireEvent.click(settingsTab)

    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存')
    await fireEvent.click(saveButton)

    // 保存処理が呼ばれることを確認
    expect(mockAISettingsStorage.set).toHaveBeenCalledWith(defaultAISettings)

    // 保存中のテキスト表示
    expect(screen.getByText('保存中...')).toBeInTheDocument()

    // 保存完了後
    await waitFor(() => {
      expect(screen.getByText('保存完了')).toBeInTheDocument()
    })

    // 3秒後にメッセージが消える
    vi.advanceTimersByTime(3000)
    await waitFor(() => {
      expect(screen.queryByText('保存完了')).not.toBeInTheDocument()
    })
  })

  it('設定保存時のエラーハンドリング', async () => {
    const error = new Error('Save failed')
    mockAISettingsStorage.set.mockRejectedValue(error)
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // AI設定タブに移動
    const settingsTab = screen.getAllByText('AI設定')[0]
    await fireEvent.click(settingsTab)

    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存')
    await fireEvent.click(saveButton)

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('保存エラー')).toBeInTheDocument()
    })

    // コンソールエラーが出力される
    expect(console.error).toHaveBeenCalledWith('Failed to save AI settings:', error)
  })

  it('開発用設定の読み込みが正しく動作する', async () => {
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // AI設定タブに移動
    const settingsTab = screen.getAllByText('AI設定')[0]
    await fireEvent.click(settingsTab)

    // 開発用設定ボタンをクリック
    const devConfigButton = screen.getByText('開発用設定')
    await fireEvent.click(devConfigButton)

    // 開発用設定が読み込まれる
    expect(screen.getByDisplayValue('sk-test-development-api-key-placeholder')).toBeInTheDocument()
    expect(screen.getByText('開発用設定をロードしました')).toBeInTheDocument()

    // 3秒後にメッセージが消える
    vi.advanceTimersByTime(3000)
    await waitFor(() => {
      expect(screen.queryByText('開発用設定をロードしました')).not.toBeInTheDocument()
    })
  })

  it('GitHubサイトへのリンクが正しく動作する', async () => {
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

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

  it('オプションページを開く機能が正しく動作する', async () => {
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // ホームタブの設定ページボタンをクリック
    const optionsButton = screen.getByText('設定ページを開く')
    await fireEvent.click(optionsButton)

    expect(chrome.runtime.openOptionsPage).toHaveBeenCalledOnce()
  })

  it('テーマ切り替えボタンが正しく動作する', async () => {
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    const toggleButton = screen.getByText('Toggle theme')
    await fireEvent.click(toggleButton)

    expect(mockToggle).toHaveBeenCalledOnce()
  })

  it('APIキーが空の場合は保存ボタンが無効になる', async () => {
    const emptyApiKeySettings = { ...defaultAISettings, apiKey: '' }
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(emptyApiKeySettings)

    render(<SidePanel />)

    // AI設定タブに移動
    const settingsTab = screen.getAllByText('AI設定')[0]
    await fireEvent.click(settingsTab)

    // 保存ボタンが無効になっている
    const saveButton = screen.getByText('保存')
    expect(saveButton).toBeDisabled()
  })

  it('保存中は開発用設定ボタンが無効になる', async () => {
    mockAISettingsStorage.set.mockImplementation(() => new Promise(() => {})) // 永続的にpending
    mockUseStorage.mockReturnValueOnce({ isLight: true }).mockReturnValueOnce(defaultAISettings)

    render(<SidePanel />)

    // AI設定タブに移動
    const settingsTab = screen.getAllByText('AI設定')[0]
    await fireEvent.click(settingsTab)

    // 保存ボタンをクリック
    const saveButton = screen.getByText('保存')
    await fireEvent.click(saveButton)

    // 開発用設定ボタンが無効になる
    const devConfigButton = screen.getByText('開発用設定')
    expect(devConfigButton).toBeDisabled()
  })
})
