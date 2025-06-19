import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { createAISettingsStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';
import type { AISettings } from '@extension/storage';

const aiSettingsStorage = createAISettingsStorage();

const DEFAULT_PROMPT =
  'このテーブルのデータを分析してください。データの傾向、パターン、興味深い点があれば教えてください。';

const AISettingsOptionsComponent = () => {
  const storage = useStorage(aiSettingsStorage);
  const [formData, setFormData] = useState<AISettings>(storage);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleInputChange =
    (field: keyof AISettings) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.type === 'checkbox' ? (event.target as HTMLInputElement).checked : event.target.value;

      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      await aiSettingsStorage.set(formData);
      setSaveMessage('Settings saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('Error saving settings. Please try again.');
      console.error('Failed to save AI settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(storage);
    setSaveMessage('');
  };

  const handleLoadDevConfig = () => {
    // 開発用のデフォルト設定をロード
    const devConfig: AISettings = {
      apiKey: 'sk-test-development-api-key-placeholder',
      model: 'gpt-4o-mini',
      customPrompt: '以下のテーブルデータを分析して、パターンや傾向を教えてください：',
      useCustomPrompt: false,
    };

    setFormData(devConfig);
    setSaveMessage('開発用設定をロードしました。APIキーを実際の値に変更してください。');
    setTimeout(() => setSaveMessage(''), 5000);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">AI Analysis Settings</h2>

        {/* Development Info */}
        <div className="mb-6 rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>開発時のヒント:</strong> 「開発用設定をロード」ボタンで仮の設定値を簡単にロードできます。
                APIキーのみ実際の値に変更してご利用ください。
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* API Key Input */}
          <div>
            <label htmlFor="api-key" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              OpenAI API Key *
            </label>
            <input
              id="api-key"
              type="password"
              value={formData.apiKey}
              onChange={handleInputChange('apiKey')}
              placeholder="sk-..."
              className={cn(
                'w-full border border-gray-300 px-3 py-2 dark:border-gray-600',
                'rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                'placeholder-gray-400 dark:bg-gray-700 dark:text-gray-100',
              )}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your API key is stored locally and never shared.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="model" className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
              AI Model
            </label>
            <select
              id="model"
              value={formData.model}
              onChange={handleInputChange('model')}
              className={cn(
                'w-full border border-gray-300 px-3 py-2 dark:border-gray-600',
                'rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                'dark:bg-gray-700 dark:text-gray-100',
              )}>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
              <option value="gpt-4o">GPT-4o</option>
            </select>
          </div>

          {/* Custom Prompt Toggle */}
          <div>
            <div className="flex items-center">
              <input
                id="use-custom-prompt"
                type="checkbox"
                checked={formData.useCustomPrompt}
                onChange={handleInputChange('useCustomPrompt')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="use-custom-prompt" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Use Custom Prompt
              </label>
            </div>
          </div>

          {/* Default Prompt Display */}
          {!formData.useCustomPrompt && (
            <div>
              <label
                htmlFor="default-prompt-display"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Default Prompt
              </label>
              <div
                id="default-prompt-display"
                className={cn(
                  'w-full border border-gray-300 px-3 py-2 dark:border-gray-600',
                  'rounded-md bg-gray-50 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
                )}>
                {DEFAULT_PROMPT}
              </div>
            </div>
          )}

          {/* Custom Prompt Input */}
          {formData.useCustomPrompt && (
            <div>
              <label
                htmlFor="custom-prompt"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Prompt
              </label>
              <textarea
                id="custom-prompt"
                value={formData.customPrompt || ''}
                onChange={handleInputChange('customPrompt')}
                placeholder="Enter your custom analysis prompt..."
                rows={4}
                className={cn(
                  'w-full border border-gray-300 px-3 py-2 dark:border-gray-600',
                  'rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
                  'placeholder-gray-400 dark:bg-gray-700 dark:text-gray-100',
                )}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This prompt will be used instead of the default prompt for AI analysis.
              </p>
            </div>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div
              className={cn(
                'rounded-md p-3 text-sm',
                saveMessage.includes('Error')
                  ? 'border border-red-200 bg-red-50 text-red-800'
                  : 'border border-green-200 bg-green-50 text-green-800',
              )}>
              {saveMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.apiKey.trim()}
              className={cn(
                'rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}>
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>

            <button
              onClick={handleReset}
              disabled={isSaving}
              className={cn(
                'rounded-md bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400',
                'focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}>
              Reset
            </button>

            <button
              onClick={handleLoadDevConfig}
              disabled={isSaving}
              className={cn(
                'rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700',
                'focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}>
              開発用設定をロード
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AISettingsOptions = withErrorBoundary(
  withSuspense(AISettingsOptionsComponent, <LoadingSpinner />),
  ErrorDisplay,
);
