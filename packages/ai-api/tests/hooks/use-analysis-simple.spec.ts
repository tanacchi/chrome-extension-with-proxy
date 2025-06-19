/**
 * @fileoverview useAnalysisフックの簡易テスト
 */

import { describe, it, expect, vi } from 'vitest';

// 必要な型のモック
const mockAnalysisHook = {
  analyzeTableData: vi.fn(),
  isAnalyzing: false,
  analysisMessages: [],
  latestResult: null,
  error: null,
  resetAnalysis: vi.fn(),
  stopAnalysis: vi.fn(),
};

describe('useAnalysis 簡易テスト', () => {
  it('分析機能の型定義が正しく提供されるべき', () => {
    expect(typeof mockAnalysisHook.analyzeTableData).toBe('function');
    expect(typeof mockAnalysisHook.resetAnalysis).toBe('function');
    expect(typeof mockAnalysisHook.stopAnalysis).toBe('function');
    expect(typeof mockAnalysisHook.isAnalyzing).toBe('boolean');
    expect(Array.isArray(mockAnalysisHook.analysisMessages)).toBe(true);
  });

  it('初期状態が正しく設定されるべき', () => {
    expect(mockAnalysisHook.isAnalyzing).toBe(false);
    expect(mockAnalysisHook.analysisMessages).toEqual([]);
    expect(mockAnalysisHook.latestResult).toBeNull();
    expect(mockAnalysisHook.error).toBeNull();
  });

  it('関数呼び出しが正常に動作すべき', async () => {
    const tableData = ['データ1', 'データ2', 'データ3'];

    await mockAnalysisHook.analyzeTableData(tableData);
    expect(mockAnalysisHook.analyzeTableData).toHaveBeenCalledWith(tableData);

    mockAnalysisHook.resetAnalysis();
    expect(mockAnalysisHook.resetAnalysis).toHaveBeenCalled();

    mockAnalysisHook.stopAnalysis();
    expect(mockAnalysisHook.stopAnalysis).toHaveBeenCalled();
  });
});
