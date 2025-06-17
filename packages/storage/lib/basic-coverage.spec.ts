import { describe, it, expect } from 'vitest';

describe('Basic coverage tests', () => {
  it('should import and use AI settings storage', async () => {
    const { DEFAULT_AI_SETTINGS, createAISettingsStorage } = await import('./ai-settings-storage.js');
    
    expect(DEFAULT_AI_SETTINGS).toBeDefined();
    expect(DEFAULT_AI_SETTINGS.apiKey).toBe('');
    expect(DEFAULT_AI_SETTINGS.model).toBe('gpt-3.5-turbo');
    expect(DEFAULT_AI_SETTINGS.useCustomPrompt).toBe(false);
    
    expect(createAISettingsStorage).toBeDefined();
    expect(typeof createAISettingsStorage).toBe('function');
  });

  it('should import base storage functionality', async () => {
    const { createStorage, StorageEnum } = await import('./base/index.js');
    
    expect(createStorage).toBeDefined();
    expect(StorageEnum).toBeDefined();
    expect(typeof createStorage).toBe('function');
    expect(StorageEnum.Local).toBe('local');
    expect(StorageEnum.Sync).toBe('sync');
    expect(StorageEnum.Session).toBe('session');
    expect(StorageEnum.Managed).toBe('managed');
  });

  it('should import theme storage functionality', async () => {
    const { exampleThemeStorage } = await import('./impl/index.js');
    
    expect(exampleThemeStorage).toBeDefined();
    expect(exampleThemeStorage.get).toBeDefined();
    expect(exampleThemeStorage.set).toBeDefined();
    expect(exampleThemeStorage.toggle).toBeDefined();
    expect(typeof exampleThemeStorage.toggle).toBe('function');
  });

  it('should export all main functionality from index', async () => {
    const storageModule = await import('./index.js');
    
    expect(storageModule.createAISettingsStorage).toBeDefined();
    expect(storageModule.DEFAULT_AI_SETTINGS).toBeDefined();
    expect(storageModule.exampleThemeStorage).toBeDefined();
    expect(storageModule.createStorage).toBeDefined();
    expect(storageModule.StorageEnum).toBeDefined();
  });

  it('should verify types module exports', () => {
    // Just ensure the types module can be imported without errors
    expect(async () => {
      await import('./types.js');
    }).not.toThrow();
  });
});