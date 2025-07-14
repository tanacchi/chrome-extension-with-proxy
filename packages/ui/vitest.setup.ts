import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import '../../test-utils/global-types'

beforeEach(() => {
  // console.error を一時的に無効化
  vi.spyOn(console, 'error').mockImplementation(() => {})

  // console.warn を一時的に無効化
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  // React Testing Libraryのクリーンアップ
  cleanup()

  // すべてのモックをリセット
  vi.clearAllMocks()

  // console.error と console.warn を復元
  vi.restoreAllMocks()
})

// react-spinners のモック
vi.mock('react-spinners', () => ({
  RingLoader: vi.fn(({ size, color }: { size: number; color: string }) => {
    const React = require('react')
    return React.createElement(
      'div',
      {
        'data-testid': 'ring-loader',
        'data-size': size,
        'data-color': color,
      },
      'Loading...',
    )
  }),
}))

// i18n のモック
vi.mock('@extension/i18n', () => ({
  t: (key: string) => {
    const translations: Record<string, string> = {
      displayErrorInfo: 'Something went wrong',
      displayErrorDescription: 'Please try again later',
      displayErrorReset: 'Try again',
      displayErrorDetailsInfo: 'Error details',
      displayErrorUnknownErrorInfo: 'Unknown error occurred',
      injectButton: 'Inject content script',
      toggleTheme: 'Toggle theme',
    }
    return translations[key] || key
  },
}))

// @extension/shared のモック
const mockUseStorage = vi.fn().mockReturnValue({ isLight: true })
vi.mock('@extension/shared', () => ({
  useStorage: mockUseStorage,
}))

// グローバルに mockUseStorage を使用可能にする
globalThis.mockUseStorage = mockUseStorage

// @extension/storage のモック
const mockToggle = vi.fn()
vi.mock('@extension/storage', () => ({
  exampleThemeStorage: {
    toggle: mockToggle,
  },
}))

// グローバルに mockToggle を使用可能にする
globalThis.mockToggle = mockToggle

// ResizeObserver のモック
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// matchMedia のモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// scrollIntoView のモック
Element.prototype.scrollIntoView = vi.fn()
