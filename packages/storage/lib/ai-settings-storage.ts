import { createStorage, StorageEnum } from './base/index.js';
import type { AISettings, BaseStorageType } from './types.js';

/**
 * 開発用設定を読み込む関数
 */
const getDevConfig = (): Partial<AISettings> => {
  try {
    // 開発時のみdev-config.jsonを読み込み
    if (typeof process !== 'undefined' && process.env?.CLI_CEB_DEV === 'true') {
      // 動的インポートは使用できないため、デフォルト値を返す
      return {
        apiKey: 'sk-test-development-api-key-placeholder',
        model: 'gpt-4o-mini',
        customPrompt: '',
        useCustomPrompt: false,
      };
    }
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
      serialize: value => JSON.stringify(value),
      deserialize: text => {
        if (!text || text === 'undefined') {
          return DEFAULT_AI_SETTINGS;
        }
        try {
          return JSON.parse(text);
        } catch {
          return DEFAULT_AI_SETTINGS;
        }
      },
    },
  });

export const aiSettingsStorage = createAISettingsStorage();
