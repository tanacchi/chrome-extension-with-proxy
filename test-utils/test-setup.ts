import { afterEach, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import { setupChromeMock } from './chrome-mock'

/**
 * 各テストファイルで使用するためのグローバル設定
 */
let chromeMock: ReturnType<typeof setupChromeMock>

beforeEach(() => {
  // Chrome Extension APIのモックをセットアップ
  chromeMock = setupChromeMock()

  // console.error を一時的に無効化（予期されるエラーをログに出力しないため）
  vi.spyOn(console, 'error').mockImplementation(() => {})

  // console.warn を一時的に無効化
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

afterEach(() => {
  // React Testing Libraryのクリーンアップ
  cleanup()

  // Chrome APIモックのクリーンアップ
  chromeMock?.cleanup()

  // すべてのモックをリセット
  vi.clearAllMocks()

  // console.error と console.warn を復元
  vi.restoreAllMocks()
})

/**
 * カスタムマッチャーの設定
 */
import '@testing-library/jest-dom'

// CSSモジュールのモック
vi.mock('*.module.css', () => ({
  default: new Proxy(
    {},
    {
      get: (_, prop) => `mock-${String(prop)}`,
    },
  ),
}))

// 画像ファイルのモック
vi.mock('*.svg', () => ({
  default: 'mock-svg',
}))

vi.mock('*.png', () => ({
  default: 'mock-png',
}))

vi.mock('*.jpg', () => ({
  default: 'mock-jpg',
}))

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

// Chrome Extension API のタイプ定義
declare global {
  namespace chrome {
    namespace runtime {
      const getURL: (path: string) => string
      const openOptionsPage: () => void
      const sendMessage: (message: any) => void
      const onMessage: {
        addListener: (listener: Function) => void
        removeListener: (listener: Function) => void
        hasListener: (listener: Function) => boolean
      }
      const lastError: null
    }
    namespace tabs {
      const create: (createProperties: any) => void
      const query: (queryInfo: any) => void
      const update: (tabId: number, updateProperties: any) => void
      const remove: (tabId: number) => void
      const sendMessage: (tabId: number, message: any) => void
      const onUpdated: {
        addListener: (listener: Function) => void
        removeListener: (listener: Function) => void
      }
    }
    namespace scripting {
      const executeScript: (injection: any) => void
      const insertCSS: (injection: any) => void
      const removeCSS: (injection: any) => void
    }
    namespace notifications {
      const create: (notificationId: string, options: any) => void
      const clear: (notificationId: string) => void
      const getAll: () => void
      const onClicked: {
        addListener: (listener: Function) => void
        removeListener: (listener: Function) => void
      }
    }
    namespace storage {
      namespace local {
        const get: (
          keys?: string | string[] | Record<string, any> | null,
        ) => Promise<Record<string, any>>
        const set: (items: Record<string, any>) => Promise<void>
        const remove: (keys: string | string[]) => Promise<void>
        const clear: () => Promise<void>
        const getBytesInUse: (keys?: string | string[]) => Promise<number>
        const onChanged: {
          addListener: (listener: Function) => void
          removeListener: (listener: Function) => void
          hasListener: (listener: Function) => boolean
        }
      }
      namespace sync {
        const get: (
          keys?: string | string[] | Record<string, any> | null,
        ) => Promise<Record<string, any>>
        const set: (items: Record<string, any>) => Promise<void>
        const remove: (keys: string | string[]) => Promise<void>
        const clear: () => Promise<void>
        const getBytesInUse: (keys?: string | string[]) => Promise<number>
        const onChanged: {
          addListener: (listener: Function) => void
          removeListener: (listener: Function) => void
          hasListener: (listener: Function) => boolean
        }
      }
      const onChanged: {
        addListener: (listener: Function) => void
        removeListener: (listener: Function) => void
      }
    }
    namespace sidePanel {
      const open: (options: any) => void
      const setOptions: (options: any) => void
      const getOptions: (options: any) => void
    }
    namespace devtools {
      namespace panels {
        const create: (title: string, iconPath: string, pagePath: string) => void
        const setOpenResourceHandler: (handler: Function) => void
      }
    }
  }
}
