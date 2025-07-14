import { vi } from 'vitest'

/**
 * Chrome Extension APIの統一モック
 */
export const createChromeMock = () => {
  const mockStorage = {
    data: new Map<string, any>(),
    listeners: new Set<Function>(),
  }

  const chrome = {
    runtime: {
      getURL: vi.fn((path: string) => `chrome-extension://test/${path}`),
      openOptionsPage: vi.fn(),
      sendMessage: vi.fn(),
      onMessage: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
        hasListener: vi.fn(),
      },
      lastError: null,
    },
    tabs: {
      create: vi.fn(),
      query: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      sendMessage: vi.fn(),
      onUpdated: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    scripting: {
      executeScript: vi.fn(),
      insertCSS: vi.fn(),
      removeCSS: vi.fn(),
    },
    notifications: {
      create: vi.fn(),
      clear: vi.fn(),
      getAll: vi.fn(),
      onClicked: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    storage: {
      local: {
        get: vi.fn(async (keys?: string | string[] | Record<string, any> | null) => {
          if (keys === null || keys === undefined) {
            return Object.fromEntries(mockStorage.data)
          }

          if (typeof keys === 'string') {
            return { [keys]: mockStorage.data.get(keys) }
          }

          if (Array.isArray(keys)) {
            const result: Record<string, any> = {}
            keys.forEach(key => {
              result[key] = mockStorage.data.get(key)
            })
            return result
          }

          if (typeof keys === 'object') {
            const result: Record<string, any> = {}
            Object.keys(keys).forEach(key => {
              result[key] = mockStorage.data.get(key) ?? keys[key]
            })
            return result
          }

          return {}
        }),
        set: vi.fn(async (items: Record<string, any>) => {
          const changes: Record<string, { oldValue?: any; newValue: any }> = {}

          Object.entries(items).forEach(([key, value]) => {
            const oldValue = mockStorage.data.get(key)
            mockStorage.data.set(key, value)
            changes[key] = { oldValue, newValue: value }
          })

          // 変更イベントを発火
          mockStorage.listeners.forEach(listener => {
            listener(changes, 'local')
          })
        }),
        remove: vi.fn(async (keys: string | string[]) => {
          const keysArray = Array.isArray(keys) ? keys : [keys]
          const changes: Record<string, { oldValue: any; newValue?: any }> = {}

          keysArray.forEach(key => {
            const oldValue = mockStorage.data.get(key)
            mockStorage.data.delete(key)
            changes[key] = { oldValue }
          })

          // 変更イベントを発火
          mockStorage.listeners.forEach(listener => {
            listener(changes, 'local')
          })
        }),
        clear: vi.fn(async () => {
          const changes: Record<string, { oldValue: any; newValue?: any }> = {}

          mockStorage.data.forEach((value, key) => {
            changes[key] = { oldValue: value }
          })

          mockStorage.data.clear()

          // 変更イベントを発火
          mockStorage.listeners.forEach(listener => {
            listener(changes, 'local')
          })
        }),
        getBytesInUse: vi.fn(async () => 0),
        onChanged: {
          addListener: vi.fn((listener: Function) => {
            mockStorage.listeners.add(listener)
          }),
          removeListener: vi.fn((listener: Function) => {
            mockStorage.listeners.delete(listener)
          }),
          hasListener: vi.fn((listener: Function) => {
            return mockStorage.listeners.has(listener)
          }),
        },
      },
      sync: {
        get: vi.fn(),
        set: vi.fn(),
        remove: vi.fn(),
        clear: vi.fn(),
        getBytesInUse: vi.fn(),
        onChanged: {
          addListener: vi.fn(),
          removeListener: vi.fn(),
          hasListener: vi.fn(),
        },
      },
      onChanged: {
        addListener: vi.fn(),
        removeListener: vi.fn(),
      },
    },
    sidePanel: {
      open: vi.fn(),
      setOptions: vi.fn(),
      getOptions: vi.fn(),
    },
    devtools: {
      panels: {
        create: vi.fn(),
        setOpenResourceHandler: vi.fn(),
      },
    },
  }

  return { chrome, mockStorage }
}

/**
 * Chrome Extension APIモックをセットアップする関数
 */
export const setupChromeMock = () => {
  const { chrome, mockStorage } = createChromeMock()

  // グローバルに設定
  global.chrome = chrome

  // テスト後のクリーンアップ用の関数も返す
  return {
    chrome,
    mockStorage,
    cleanup: () => {
      mockStorage.data.clear()
      mockStorage.listeners.clear()
      vi.clearAllMocks()
    },
  }
}

/**
 * Chrome Extension APIモックのリセット
 */
export const resetChromeMock = (
  mockStorage: ReturnType<typeof createChromeMock>['mockStorage'],
) => {
  mockStorage.data.clear()
  mockStorage.listeners.clear()
  vi.clearAllMocks()
}
