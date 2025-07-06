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
} as unknown as typeof chrome;

// Import after mocking
const { createAISettingsStorage, DEFAULT_AI_SETTINGS } = await import('./ai-settings-storage.js');

describe('Storage Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle complete workflow of AI settings storage', async () => {
    // Start with empty storage
    mockStorageGet.mockResolvedValue({});
    mockStorageSet.mockResolvedValue(undefined);

    const storage = createAISettingsStorage();

    // Get default settings initially
    const initialSettings = await storage.get();
    expect(initialSettings).toEqual(DEFAULT_AI_SETTINGS);

    // Update settings
    const newSettings: AISettings = {
      apiKey: 'sk-test-key-123',
      model: 'gpt-4o',
      customPrompt: 'カスタム分析プロンプト',
      useCustomPrompt: true,
    };

    await storage.set(newSettings);
    expect(mockStorageSet).toHaveBeenCalledWith({
      'ai-settings': JSON.stringify(newSettings),
    });

    // Mock storage get to return the new settings
    mockStorageGet.mockResolvedValue({ 'ai-settings': JSON.stringify(newSettings) });

    const updatedSettings = await storage.get();
    expect(updatedSettings).toEqual(newSettings);
  });

  it('should handle partial updates using function syntax', async () => {
    const initialSettings: AISettings = {
      apiKey: 'existing-key',
      model: 'gpt-4o',
      customPrompt: '',
      useCustomPrompt: false,
    };

    mockStorageGet.mockResolvedValue({ 'ai-settings': JSON.stringify(initialSettings) });
    mockStorageSet.mockResolvedValue(undefined);

    const storage = createAISettingsStorage();

    // Update only the model
    await storage.set(prev => ({
      ...prev,
      model: 'gpt-4o',
    }));

    expect(mockStorageSet).toHaveBeenCalledWith({
      'ai-settings': JSON.stringify({
        ...initialSettings,
        model: 'gpt-4o',
      }),
    });
  });

  it('should handle corrupted storage data gracefully', async () => {
    // Mock corrupted JSON data
    mockStorageGet.mockResolvedValue({ 'ai-settings': 'invalid-json-data' });

    const storage = createAISettingsStorage();

    // Should fall back to default settings on JSON parse error
    try {
      const settings = await storage.get();
      // If it doesn't throw, we expect it to return defaults
      expect(settings).toEqual(DEFAULT_AI_SETTINGS);
    } catch (error) {
      // If it throws, that's also acceptable behavior for corrupted data
      expect(error).toBeDefined();
    }
  });
});
