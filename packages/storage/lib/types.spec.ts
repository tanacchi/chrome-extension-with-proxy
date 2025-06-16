import { describe, it, expect } from 'vitest';
import type { AISettings, AnalysisResult } from './types.js';

describe('AI Settings Types', () => {
  describe('AISettings', () => {
    it('should have correct structure for AISettings type', () => {
      const mockSettings: AISettings = {
        apiKey: 'test-api-key',
        model: 'gpt-3.5-turbo',
        customPrompt: 'カスタムプロンプト',
        useCustomPrompt: true,
      };

      expect(mockSettings.apiKey).toBe('test-api-key');
      expect(mockSettings.model).toBe('gpt-3.5-turbo');
      expect(mockSettings.customPrompt).toBe('カスタムプロンプト');
      expect(mockSettings.useCustomPrompt).toBe(true);
    });

    it('should allow optional customPrompt', () => {
      const mockSettings: AISettings = {
        apiKey: 'test-api-key',
        model: 'gpt-4',
        useCustomPrompt: false,
      };

      expect(mockSettings.customPrompt).toBeUndefined();
      expect(mockSettings.useCustomPrompt).toBe(false);
    });

    it('should support different model types', () => {
      const gpt4Settings: AISettings = {
        apiKey: 'test-key',
        model: 'gpt-4',
        useCustomPrompt: false,
      };

      const gpt35Settings: AISettings = {
        apiKey: 'test-key',
        model: 'gpt-3.5-turbo',
        useCustomPrompt: false,
      };

      expect(gpt4Settings.model).toBe('gpt-4');
      expect(gpt35Settings.model).toBe('gpt-3.5-turbo');
    });
  });

  describe('AnalysisResult', () => {
    it('should have correct structure for AnalysisResult type', () => {
      const mockResult: AnalysisResult = {
        content: 'AI分析結果のテキスト',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        model: 'gpt-3.5-turbo',
        promptUsed: 'システムプロンプト',
        tableData: ['データ1', 'データ2', 'データ3'],
      };

      expect(mockResult.content).toBe('AI分析結果のテキスト');
      expect(mockResult.timestamp).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(mockResult.model).toBe('gpt-3.5-turbo');
      expect(mockResult.promptUsed).toBe('システムプロンプト');
      expect(mockResult.tableData).toEqual(['データ1', 'データ2', 'データ3']);
    });

    it('should allow optional tableData', () => {
      const mockResult: AnalysisResult = {
        content: 'AI分析結果のテキスト',
        timestamp: new Date(),
        model: 'gpt-4',
        promptUsed: 'システムプロンプト',
      };

      expect(mockResult.tableData).toBeUndefined();
    });
  });
});
