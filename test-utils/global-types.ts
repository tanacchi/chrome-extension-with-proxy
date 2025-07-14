import type { MockedFunction } from 'vitest'

// Chrome Extension API の型定義
interface ChromeRuntime {
  id: string
  getURL: MockedFunction<(path: string) => string>
}

interface ChromeTabs {
  create: MockedFunction<(createProperties: any) => Promise<any>>
}

interface ChromeScripting {
  executeScript: MockedFunction<(injection: any) => Promise<any>>
}

interface ChromeStorage {
  sync: {
    get: MockedFunction<(keys?: any) => Promise<any>>
    set: MockedFunction<(items: any) => Promise<void>>
    onChanged: {
      addListener: MockedFunction<(callback: (...args: any[]) => void) => void>
      removeListener: MockedFunction<(callback: (...args: any[]) => void) => void>
      hasListener: MockedFunction<(callback: (...args: any[]) => void) => boolean>
    }
  }
  local: {
    get: MockedFunction<(keys?: any) => Promise<any>>
    set: MockedFunction<(items: any) => Promise<void>>
    onChanged: {
      addListener: MockedFunction<(callback: (...args: any[]) => void) => void>
      removeListener: MockedFunction<(callback: (...args: any[]) => void) => void>
      hasListener: MockedFunction<(callback: (...args: any[]) => void) => boolean>
    }
  }
}

interface ChromeNotifications {
  create: MockedFunction<(notificationId: string, options: any) => Promise<string>>
}

interface ChromeI18n {
  getMessage: MockedFunction<(key: string, substitutions?: string | string[]) => string>
}

export interface MockChrome {
  runtime: ChromeRuntime
  tabs: ChromeTabs
  scripting: ChromeScripting
  storage: ChromeStorage
  notifications: ChromeNotifications
  i18n: ChromeI18n
}

// グローバル拡張のための型定義
declare global {
  interface GlobalThis {
    chrome: MockChrome
    mockUseStorage: MockedFunction<(...args: any[]) => any>
    mockToggle: MockedFunction<() => void>
  }
}
