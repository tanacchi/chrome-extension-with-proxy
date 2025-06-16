import { createStorage, StorageEnum } from './base/index.js';
import type { AISettings, BaseStorageType } from './types.js';

export const DEFAULT_AI_SETTINGS: AISettings = {
  apiKey: '',
  model: 'gpt-3.5-turbo',
  customPrompt: '',
  useCustomPrompt: false,
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
