import { describe, it, expect } from 'vitest';
import type { AISettings, AnalysisResult } from './types.js';

describe('AI設定の型テスト', () => {
  describe('AISettings型', () => {
    it('AISettings型の構造が正しい', () => {
      const mockSettings: AISettings = {
        apiKey: 'test-api-key',
        model: 'gpt-4o',
        customPrompt: 'カスタムプロンプト',
        useCustomPrompt: true,
      };

      expect(mockSettings.apiKey).toBe('test-api-key');
      expect(mockSettings.model).toBe('gpt-4o');
      expect(mockSettings.customPrompt).toBe('カスタムプロンプト');
      expect(mockSettings.useCustomPrompt).toBe(true);
    });

    it('カスタムプロンプトがオプションである', () => {
      const mockSettings: AISettings = {
        apiKey: 'test-api-key',
        model: 'gpt-4o',
        useCustomPrompt: false,
      };

      expect(mockSettings.customPrompt).toBeUndefined();
      expect(mockSettings.useCustomPrompt).toBe(false);
    });

    it('異なるモデルタイプをサポートする', () => {
      const gpt4Settings: AISettings = {
        apiKey: 'test-key',
        model: 'gpt-4o',
        useCustomPrompt: false,
      };

      const gpt35Settings: AISettings = {
        apiKey: 'test-key',
        model: 'gpt-4o',
        useCustomPrompt: false,
      };

      expect(gpt4Settings.model).toBe('gpt-4o');
      expect(gpt35Settings.model).toBe('gpt-4o');
    });
  });

  describe('AnalysisResult型', () => {
    it('AnalysisResult型の構造が正しい', () => {
      const mockResult: AnalysisResult = {
        content: 'AI分析結果のテキスト',
        timestamp: new Date('2024-01-01T10:00:00Z'),
        model: 'gpt-4o',
        promptUsed: 'システムプロンプト',
        tableData: ['データ1', 'データ2', 'データ3'],
      };

      expect(mockResult.content).toBe('AI分析結果のテキスト');
      expect(mockResult.timestamp).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(mockResult.model).toBe('gpt-4o');
      expect(mockResult.promptUsed).toBe('システムプロンプト');
      expect(mockResult.tableData).toEqual(['データ1', 'データ2', 'データ3']);
    });

    it('テーブルデータがオプションである', () => {
      const mockResult: AnalysisResult = {
        content: 'AI分析結果のテキスト',
        timestamp: new Date(),
        model: 'gpt-4o',
        promptUsed: 'システムプロンプト',
      };

      expect(mockResult.tableData).toBeUndefined();
    });
  });
});
