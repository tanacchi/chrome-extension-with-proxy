import type { MockedFunction } from 'vitest'

// グローバル拡張のための型定義
declare global {
  interface GlobalThis {
    chrome: typeof chrome
    mockUseStorage: MockedFunction<(...args: any[]) => any>
    mockToggle: MockedFunction<() => void>
  }
}
