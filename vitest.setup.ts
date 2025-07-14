import { vi } from 'vitest'
import '@testing-library/jest-dom'

// Chrome Extension のモック設定 (flytaly氏のアプローチを参考)
const chromeObject = {
  runtime: {
    id: 'test-extension-id',
    getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
  },
  tabs: {
    create: vi.fn(() => Promise.resolve({ id: 1 })),
  },
  scripting: {
    executeScript: vi.fn(() => Promise.resolve([{ result: true }])),
  },
  storage: {
    sync: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(() => false),
      },
    },
    local: {
      get: vi.fn(() => Promise.resolve({})),
      set: vi.fn(() => Promise.resolve()),
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(() => false),
      },
    },
  },
  notifications: {
    create: vi.fn(() => Promise.resolve('notification-id')),
  },
  i18n: {
    getMessage: vi.fn().mockImplementation(key => {
      const messages: Record<string, string> = {
        injectButton: 'Inject content script',
        toggleTheme: 'Toggle theme',
      }
      return messages[key] || key
    }),
  },
}

// グローバルにChromeオブジェクトを設定
;(globalThis as any).chrome = chromeObject
