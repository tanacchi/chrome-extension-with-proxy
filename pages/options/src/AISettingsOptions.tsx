import { useState } from 'react';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { createAISettingsStorage, type AISettings } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';

const aiSettingsStorage = createAISettingsStorage();

const DEFAULT_PROMPT = 'このテーブルのデータを分析してください。データの傾向、パターン、興味深い点があれば教えてください。';

const AISettingsOptionsComponent = () => {
  const storage = useStorage(aiSettingsStorage);
  const [formData, setFormData] = useState<AISettings>(storage);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const handleInputChange = (field: keyof AISettings) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = event.target.type === 'checkbox' ? 
      (event.target as HTMLInputElement).checked : 
      event.target.value;
    
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          AI Analysis Settings
        </h2>
        
        <div className="space-y-6">
          {/* API Key Input */}
          <div>
            <label 
              htmlFor="api-key" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              OpenAI API Key *
            </label>
            <input
              id="api-key"
              type="password"
              value={formData.apiKey}
              onChange={handleInputChange('apiKey')}
              placeholder="sk-..."
              className={cn(
                "w-full px-3 py-2 border border-gray-300 dark:border-gray-600",
                "rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                "dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400"
              )}
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Your API key is stored locally and never shared.
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label 
              htmlFor="model" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              AI Model
            </label>
            <select
              id="model"
              value={formData.model}
              onChange={handleInputChange('model')}
              className={cn(
                "w-full px-3 py-2 border border-gray-300 dark:border-gray-600",
                "rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                "dark:bg-gray-700 dark:text-gray-100"
              )}
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label 
                htmlFor="use-custom-prompt" 
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Use Custom Prompt
              </label>
            </div>
          </div>

          {/* Default Prompt Display */}
          {!formData.useCustomPrompt && (
            <div>
              <label 
                htmlFor="default-prompt-display"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Default Prompt
              </label>
              <div 
                id="default-prompt-display"
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600",
                  "rounded-md bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                )}
              >
                {DEFAULT_PROMPT}
              </div>
            </div>
          )}

          {/* Custom Prompt Input */}
          {formData.useCustomPrompt && (
            <div>
              <label 
                htmlFor="custom-prompt" 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Custom Prompt
              </label>
              <textarea
                id="custom-prompt"
                value={formData.customPrompt || ''}
                onChange={handleInputChange('customPrompt')}
                placeholder="Enter your custom analysis prompt..."
                rows={4}
                className={cn(
                  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600",
                  "rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                  "dark:bg-gray-700 dark:text-gray-100 placeholder-gray-400"
                )}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                This prompt will be used instead of the default prompt for AI analysis.
              </p>
            </div>
          )}

          {/* Save Message */}
          {saveMessage && (
            <div className={cn(
              "p-3 rounded-md text-sm",
              saveMessage.includes('Error') 
                ? "bg-red-50 text-red-800 border border-red-200" 
                : "bg-green-50 text-green-800 border border-green-200"
            )}>
              {saveMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.apiKey.trim()}
              className={cn(
                "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button
              onClick={handleReset}
              disabled={isSaving}
              className={cn(
                "px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400",
                "focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AISettingsOptions = withErrorBoundary(
  withSuspense(AISettingsOptionsComponent, <LoadingSpinner />), 
  ErrorDisplay
);