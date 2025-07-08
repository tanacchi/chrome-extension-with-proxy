import 'webextension-polyfill'
import { aiAPIHandler } from './ai-api-handler'
import { exampleThemeStorage } from '@extension/storage'

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme)
})

// AI API ハンドラーを初期化
aiAPIHandler.initialize()

console.log('Background loaded')
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.")
