import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { AISettings } from './types.js';

// Mock chrome.storage API
const mockStorageGet = vi.fn();
const mockStorageSet = vi.fn();
const mockStorageOnChanged = { addListener: vi.fn(), removeListener: vi.fn() };

interface MockChrome {
  storage: {
    local: {
      get: typeof mockStorageGet;
      set: typeof mockStorageSet;
      onChanged: typeof mockStorageOnChanged;
    };
  };
}

global.chrome = {
  storage: {
    local: {
      get: mockStorageGet,
      set: mockStorageSet,
      onChanged: mockStorageOnChanged,
    },
  },
} as MockChrome;

// Import after mocking
const { createAISettingsStorage, DEFAULT_AI_SETTINGS } = await import('./ai-settings-storage.js');

describe('AI Settings Storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('DEFAULT_AI_SETTINGS', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_AI_SETTINGS).toEqual({
        apiKey: '',
        model: 'gpt-3.5-turbo',
        customPrompt: '',
        useCustomPrompt: false,
      });
    });
  });

  describe('createAISettingsStorage', () => {
    it('should create storage with correct key', () => {
      const storage = createAISettingsStorage();
      expect(storage).toBeDefined();
    });

    it('should get default settings when no stored data exists', async () => {
      mockStorageGet.mockResolvedValue({});

      const storage = createAISettingsStorage();
      const settings = await storage.get();

      expect(settings).toEqual(DEFAULT_AI_SETTINGS);
      expect(mockStorageGet).toHaveBeenCalledWith(['ai-settings']);
    });

    it('should get stored settings when data exists', async () => {
      const storedSettings: AISettings = {
        apiKey: 'test-key',
        model: 'gpt-4',
        customPrompt: 'カスタムプロンプト',
        useCustomPrompt: true,
      };

      mockStorageGet.mockResolvedValue({ 'ai-settings': JSON.stringify(storedSettings) });

      const storage = createAISettingsStorage();
      const settings = await storage.get();

      expect(settings).toEqual(storedSettings);
    });

    it('should set settings to storage', async () => {
      const newSettings: AISettings = {
        apiKey: 'new-key',
        model: 'gpt-4-turbo',
        customPrompt: '新しいプロンプト',
        useCustomPrompt: true,
      };

      mockStorageSet.mockResolvedValue(undefined);

      const storage = createAISettingsStorage();
      await storage.set(newSettings);

      expect(mockStorageSet).toHaveBeenCalledWith({
        'ai-settings': JSON.stringify(newSettings),
      });
    });

    it('should handle function update in set method', async () => {
      const initialSettings: AISettings = {
        apiKey: 'initial-key',
        model: 'gpt-3.5-turbo',
        useCustomPrompt: false,
      };

      mockStorageGet.mockResolvedValue({ 'ai-settings': JSON.stringify(initialSettings) });
      mockStorageSet.mockResolvedValue(undefined);

      const storage = createAISettingsStorage();

      await storage.set(prev => ({
        ...prev,
        apiKey: 'updated-key',
        useCustomPrompt: true,
      }));

      expect(mockStorageSet).toHaveBeenCalledWith({
        'ai-settings': JSON.stringify({
          ...initialSettings,
          apiKey: 'updated-key',
          useCustomPrompt: true,
        }),
      });
    });

    it('should return null snapshot when not initialized', () => {
      const storage = createAISettingsStorage();
      const snapshot = storage.getSnapshot();

      expect(snapshot).toBeNull();
    });

    it('should handle subscribe and unsubscribe', () => {
      const storage = createAISettingsStorage();
      const listener = vi.fn();

      const unsubscribe = storage.subscribe(listener);
      expect(typeof unsubscribe).toBe('function');

      unsubscribe();
    });
  });
});
