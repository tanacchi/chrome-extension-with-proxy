import { createStorage, StorageEnum } from './base/index.js';
import type { AISettings, BaseStorageType } from './types.js';

/**
 * 開発用設定を読み込む関数
 */
const getDevConfig = (): Partial<AISettings> => {
  try {
    // Content Script環境では process.env が使用できないため、
    // 開発時のデフォルト設定はOptions画面やSidePanelの
    // 「開発用設定をロード」ボタンで設定する
    return {};
  } catch (error) {
    console.warn('Failed to load dev config:', error);
  }
  return {};
};

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  model: 'gpt-4o-mini',
  customPrompt: '',
  useCustomPrompt: false,
  ...getDevConfig(),
};

export const createAISettingsStorage = (): BaseStorageType<AISettings> =>
  createStorage<AISettings>('ai-settings', DEFAULT_AI_SETTINGS, {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
    serialization: {
      serialize: value => {
        try {
          return JSON.stringify(value);
        } catch (error) {
          console.error('AI Settings serialize error:', error);
          return JSON.stringify(DEFAULT_AI_SETTINGS);
        }
      },
      deserialize: text => {
        if (!text || text === 'undefined' || text === 'null') {
          console.log('AI Settings: デフォルト設定を使用します');
          return DEFAULT_AI_SETTINGS;
        }
        try {
          const parsed = JSON.parse(text);
          console.log('AI Settings: 正常に読み込まれました', parsed);
          return parsed;
        } catch (error) {
          console.error('AI Settings deserialize error:', error);
          return DEFAULT_AI_SETTINGS;
        }
      },
    },
  });

export const aiSettingsStorage = createAISettingsStorage();
