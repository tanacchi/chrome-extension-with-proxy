import type { ValueOrUpdateType } from './base/index.js'

export type BaseStorageType<D> = {
  get: () => Promise<D>
  set: (value: ValueOrUpdateType<D>) => Promise<void>
  getSnapshot: () => D | null
  subscribe: (listener: () => void) => () => void
}

// AI Analysis Tool Types
export interface AISettings {
  apiKey: string
  model: 'gpt-4o' | 'gpt-4o-mini'
  customPrompt?: string
  useCustomPrompt: boolean
}

export interface AnalysisResult {
  content: string
  timestamp: Date
  model: string
  promptUsed: string
  tableData?: string[]
}
