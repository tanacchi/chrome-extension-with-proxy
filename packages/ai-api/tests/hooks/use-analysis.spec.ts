/**
 * @fileoverview useAnalysisフックのテスト
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAnalysis } from '../../lib/hooks/use-analysis';

// useChatのモック
const mockAppend = vi.fn();
const mockStop = vi.fn();
const mockSetMessages = vi.fn();

vi.mock('@ai-sdk/react', () => ({
  useChat: vi.fn(() => ({
    messages: [],
    append: mockAppend,
    isLoading: false,
    error: null,
    stop: mockStop,
    reload: vi.fn(),
    setMessages: mockSetMessages
  }))
}));

// useAISettingsのモック
vi.mock('../../lib/hooks/use-ai-settings', () => ({
  useAISettings: vi.fn(() => ({
    settings: {
      apiKey: 'test-api-key',
      model: 'gpt-4o-mini',
      customPrompt: 'テスト用プロンプト',
      useCustomPrompt: true
    },
    isLoading: false
  }))
}));

// Chrome メッセージングのモック
vi.mock('../../lib/utils/message-utils', () => ({
  sendChromeMessage: vi.fn(() => Promise.resolve({
    success: true,
    data: { content: 'テスト分析結果' }
  }))
}));

describe('useAnalysis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('初期化', () => {
    it('正しい初期状態を返すべき', () => {
      const { result } = renderHook(() => useAnalysis());

      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.analysisMessages).toEqual([]);
      expect(result.current.latestResult).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('関数が適切に提供されるべき', () => {
      const { result } = renderHook(() => useAnalysis());

      expect(typeof result.current.analyzeTableData).toBe('function');
      expect(typeof result.current.resetAnalysis).toBe('function');
      expect(typeof result.current.stopAnalysis).toBe('function');
    });
  });

  describe('analyzeTableData', () => {
    it('有効なテーブルデータで分析を開始すべき', async () => {
      const onAnalysisStart = vi.fn();
      const { result } = renderHook(() => useAnalysis({ onAnalysisStart }));

      const tableData = ['データ1', 'データ2', 'データ3'];

      await act(async () => {
        await result.current.analyzeTableData(tableData);
      });

      expect(onAnalysisStart).toHaveBeenCalled();
      expect(mockAppend).toHaveBeenCalledWith({
        role: 'user',
        content: expect.stringContaining('データ1')
      });
    });

    it('空のテーブルデータでエラーを投げるべき', async () => {
      const { result } = renderHook(() => useAnalysis());

      await expect(
        result.current.analyzeTableData([])
      ).rejects.toThrow('Table data is empty');
    });

    it('nullまたはundefinedのテーブルデータでエラーを投げるべき', async () => {
      const { result } = renderHook(() => useAnalysis());

      await expect(
        result.current.analyzeTableData(null as any)
      ).rejects.toThrow('Table data is empty');
    });
  });

  describe('resetAnalysis', () => {
    it('メッセージをクリアすべき', () => {
      const { result } = renderHook(() => useAnalysis());

      act(() => {
        result.current.resetAnalysis();
      });

      expect(mockSetMessages).toHaveBeenCalledWith([]);
    });
  });

  describe('stopAnalysis', () => {
    it('分析を停止すべき', () => {
      const { result } = renderHook(() => useAnalysis());

      act(() => {
        result.current.stopAnalysis();
      });

      expect(mockStop).toHaveBeenCalled();
    });
  });

  describe('コールバック', () => {
    it('エラー時にonErrorコールバックを呼ぶべき', async () => {
      const onError = vi.fn();
      
      // appendでエラーを投げるようにモック
      mockAppend.mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => useAnalysis({ onError }));

      await expect(
        result.current.analyzeTableData(['test'])
      ).rejects.toThrow('API Error');

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});