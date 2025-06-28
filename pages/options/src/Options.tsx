import '@src/Options.css'
import { AISettingsOptions } from './AISettingsOptions'
import { t } from '@extension/i18n'
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared'
import { exampleThemeStorage } from '@extension/storage'
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui'

const Options = () => {
  const { isLight } = useStorage(exampleThemeStorage)
  const logo = isLight ? 'options/logo_horizontal.svg' : 'options/logo_horizontal_dark.svg'

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT)

  return (
    <div className={cn('App', isLight ? 'bg-slate-50 text-gray-900' : 'bg-gray-800 text-gray-100')}>
      <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
        <button type="button" onClick={goGithubSite} className="flex items-center space-x-2">
          <img src={chrome.runtime.getURL(logo)} className="h-8 w-auto" alt="logo" />
          <span className="text-lg font-semibold">Table Data AI Analysis Tool</span>
        </button>
        <ToggleButton onClick={exampleThemeStorage.toggle}>{t('toggleTheme')}</ToggleButton>
      </header>

      <main className="container mx-auto py-8">
        <AISettingsOptions />
      </main>
    </div>
  )
}

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay)
