import '@src/SidePanel.css';
import { t } from '@extension/i18n';
import { PROJECT_URL_OBJECT, useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage, createAISettingsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, ToggleButton } from '@extension/ui';
import { useState } from 'react';
import type { AISettings } from '@extension/storage';

const aiSettingsStorage = createAISettingsStorage();

const SidePanel = () => {
  const { isLight } = useStorage(exampleThemeStorage);
  const storage = useStorage(aiSettingsStorage);
  const [activeTab, setActiveTab] = useState<'home' | 'settings'>('home');
  const [formData, setFormData] = useState<AISettings>(storage);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const logo = isLight ? 'side-panel/logo_vertical.svg' : 'side-panel/logo_vertical_dark.svg';

  const goGithubSite = () => chrome.tabs.create(PROJECT_URL_OBJECT);
  const openOptionsPage = () => chrome.runtime.openOptionsPage();

  const handleInputChange =
    (field: keyof AISettings) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;
      setFormData(prev => ({ ...prev, [field]: value }));
    };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    try {
      await aiSettingsStorage.set(formData);
      setSaveMessage('保存完了');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('保存エラー');
      console.error('Failed to save AI settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadDevConfig = () => {
    const devConfig: AISettings = {
      apiKey: 'sk-test-development-api-key-placeholder',
      model: 'gpt-4o-mini',
      customPrompt: '以下のテーブルデータを分析して、パターンや傾向を教えてください：',
      useCustomPrompt: false,
    };
    setFormData(devConfig);
    setSaveMessage('開発用設定をロードしました');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const renderSettings = () => (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">AI設定</h3>

      <div>
        <label htmlFor="side-api-key" className="mb-1 block text-sm font-medium">
          OpenAI API Key
        </label>
        <input
          id="side-api-key"
          type="password"
          value={formData.apiKey}
          onChange={handleInputChange('apiKey')}
          placeholder="sk-..."
          className="w-full rounded border px-2 py-1 text-sm"
        />
      </div>

      <div>
        <label htmlFor="side-model" className="mb-1 block text-sm font-medium">
          モデル
        </label>
        <select
          id="side-model"
          value={formData.model}
          onChange={handleInputChange('model')}
          className="w-full rounded border px-2 py-1 text-sm">
          <option value="gpt-4o-mini">GPT-4o Mini</option>
          <option value="gpt-4o">GPT-4o</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="use-custom-prompt"
          type="checkbox"
          checked={formData.useCustomPrompt}
          onChange={handleInputChange('useCustomPrompt')}
          className="mr-2"
        />
        <label htmlFor="use-custom-prompt" className="text-sm">
          カスタムプロンプト使用
        </label>
      </div>

      {formData.useCustomPrompt && (
        <div>
          <label htmlFor="side-custom-prompt" className="mb-1 block text-sm font-medium">
            カスタムプロンプト
          </label>
          <textarea
            id="side-custom-prompt"
            value={formData.customPrompt || ''}
            onChange={handleInputChange('customPrompt')}
            placeholder="プロンプトを入力..."
            rows={3}
            className="w-full rounded border px-2 py-1 text-sm"
          />
        </div>
      )}

      {saveMessage && <div className="rounded bg-green-100 p-2 text-sm text-green-800">{saveMessage}</div>}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isSaving || !formData.apiKey.trim()}
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-50">
          {isSaving ? '保存中...' : '保存'}
        </button>

        <button
          onClick={handleLoadDevConfig}
          disabled={isSaving}
          className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700 disabled:opacity-50">
          開発用設定
        </button>

        <button
          onClick={openOptionsPage}
          className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700">
          詳細設定
        </button>
      </div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-4 p-4">
      <button onClick={goGithubSite} className="block">
        <img src={chrome.runtime.getURL(logo)} className="App-logo mx-auto" alt="logo" />
      </button>

      <div className="text-center">
        <h2 className="text-lg font-semibold">Chrome Extension</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">テーブルデータAI分析ツール</p>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setActiveTab('settings')}
          className="w-full rounded bg-blue-600 p-2 text-white hover:bg-blue-700">
          AI設定
        </button>

        <button onClick={openOptionsPage} className="w-full rounded bg-gray-600 p-2 text-white hover:bg-gray-700">
          設定ページを開く
        </button>

        <ToggleButton onClick={exampleThemeStorage.toggle} className="w-full">
          {t('toggleTheme')}
        </ToggleButton>
      </div>
    </div>
  );

  return (
    <div className={cn('App min-h-screen', isLight ? 'bg-slate-50' : 'bg-gray-800')}>
      <div className={cn('text-gray-900 dark:text-gray-100', isLight ? 'text-gray-900' : 'text-gray-100')}>
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('home')}
            className={cn(
              'flex-1 p-3 text-sm font-medium',
              activeTab === 'home'
                ? 'border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700',
            )}>
            ホーム
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={cn(
              'flex-1 p-3 text-sm font-medium',
              activeTab === 'settings'
                ? 'border-b-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700',
            )}>
            AI設定
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'home' ? renderHome() : renderSettings()}
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
