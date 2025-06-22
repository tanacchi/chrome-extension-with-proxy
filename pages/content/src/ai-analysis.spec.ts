/**
 * @fileoverview AI分析機能のテスト
 *
 * Content ScriptでのAI分析処理の
 * 単体テストを提供します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

import { analyzeTableData, checkAISettings, formatAnalysisResult, AnalysisErrorType } from './ai-analysis';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Chrome Message Utils のモック
vi.mock('@extension/ai-api', () => ({
  sendChromeMessage: vi.fn(),
  buildAnalysisPrompt: vi.fn(
    (data, prompt) => `以下のデータを分析してください: ${data.join(', ')}${prompt ? ` 指示: ${prompt}` : ''}`,
  ),
}));

// Storage のモック
vi.mock('@extension/storage', () => ({
  aiSettingsStorage: {
    get: vi.fn(),
  },
}));

describe('AI分析機能', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeTableData', () => {
    it('正常な分析が実行される', async () => {
      const { sendChromeMessage } = await import('@extension/ai-api');
      const { aiSettingsStorage } = await import('@extension/storage');

      const mockSendMessage = sendChromeMessage as ReturnType<typeof vi.fn>;
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      // モックの設定
      mockStorage.mockResolvedValue({
        apiKey: 'sk-test-key',
        model: 'gpt-4o-mini',
        customPrompt: 'テストプロンプト',
        useCustomPrompt: false,
      });

      mockSendMessage.mockResolvedValue({
        success: true,
        data: {
          text: 'AI分析結果のテキスト',
          usage: {
            promptTokens: 100,
            completionTokens: 50,
            totalTokens: 150,
          },
          processingTime: 2500,
        },
      });

      const tableData = ['項目1', '項目2', '項目3'];
      const progressStages: string[] = [];

      const result = await analyzeTableData(tableData, {
        onProgress: stage => progressStages.push(stage),
      });

      // 結果の検証
      expect(result.text).toBe('AI分析結果のテキスト');
      expect(result.usage).toEqual({
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      });
      expect(result.processingTime).toBe(2500);

      // 進捗の検証
      expect(progressStages).toContain('データ検証中...');
      expect(progressStages).toContain('設定確認中...');
      expect(progressStages).toContain('プロンプト構築中...');
      expect(progressStages).toContain('AI分析実行中...');
      expect(progressStages).toContain('分析完了');

      // ストレージとメッセージング の呼び出し検証
      expect(mockStorage).toHaveBeenCalled();
      expect(mockSendMessage).toHaveBeenCalledWith({
        type: 'AI_ANALYSIS_REQUEST',
        data: {
          messages: [
            {
              role: 'user',
              content: expect.stringContaining('項目1, 項目2, 項目3'),
            },
          ],
          settings: {
            apiKey: 'sk-test-key',
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 1000,
          },
        },
      });
    });

    it('カスタムプロンプトが使用される', async () => {
      const { sendChromeMessage } = await import('@extension/ai-api');
      const { aiSettingsStorage } = await import('@extension/storage');

      const mockSendMessage = sendChromeMessage as ReturnType<typeof vi.fn>;
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      mockStorage.mockResolvedValue({
        apiKey: 'sk-test-key',
        model: 'gpt-4o-mini',
        customPrompt: 'デフォルトプロンプト',
        useCustomPrompt: false,
      });

      mockSendMessage.mockResolvedValue({
        success: true,
        data: {
          text: 'カスタム分析結果',
          processingTime: 1500,
        },
      });

      const tableData = ['データA', 'データB'];

      await analyzeTableData(tableData, {
        customPrompt: 'カスタム指示',
        useCustomPrompt: true,
      });

      expect(mockSendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            messages: [
              {
                role: 'user',
                content: expect.stringContaining('カスタム指示'),
              },
            ],
          }),
        }),
      );
    });

    it('空のデータでエラーが発生する', async () => {
      await expect(analyzeTableData([])).rejects.toMatchObject({
        type: AnalysisErrorType.INVALID_SETTINGS,
        message: '分析対象のデータが指定されていません',
      });
    });

    it('APIキー未設定でエラーが発生する', async () => {
      const { aiSettingsStorage } = await import('@extension/storage');
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      mockStorage.mockResolvedValue({
        apiKey: '',
        model: 'gpt-4o-mini',
        customPrompt: '',
        useCustomPrompt: false,
      });

      await expect(analyzeTableData(['データ'])).rejects.toMatchObject({
        type: AnalysisErrorType.NO_API_KEY,
        message: 'OpenAI APIキーが設定されていません。設定ページで設定してください。',
      });
    });

    it('API呼び出しエラーが適切に処理される', async () => {
      const { sendChromeMessage } = await import('@extension/ai-api');
      const { aiSettingsStorage } = await import('@extension/storage');

      const mockSendMessage = sendChromeMessage as ReturnType<typeof vi.fn>;
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      mockStorage.mockResolvedValue({
        apiKey: 'sk-test-key',
        model: 'gpt-4o-mini',
        customPrompt: '',
        useCustomPrompt: false,
      });

      mockSendMessage.mockResolvedValue({
        success: false,
        error: 'Rate limit exceeded',
        errorCode: 'RATE_LIMIT_EXCEEDED',
      });

      const errorCallback = vi.fn();

      await expect(analyzeTableData(['データ'], { onError: errorCallback })).rejects.toMatchObject({
        type: AnalysisErrorType.API_LIMIT_ERROR,
        message: 'Rate limit exceeded',
        code: 'RATE_LIMIT_EXCEEDED',
      });

      expect(errorCallback).toHaveBeenCalled();
    });

    it('ネットワークエラーが適切に処理される', async () => {
      const { sendChromeMessage } = await import('@extension/ai-api');
      const { aiSettingsStorage } = await import('@extension/storage');

      const mockSendMessage = sendChromeMessage as ReturnType<typeof vi.fn>;
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      mockStorage.mockResolvedValue({
        apiKey: 'sk-test-key',
        model: 'gpt-4o-mini',
        customPrompt: '',
        useCustomPrompt: false,
      });

      mockSendMessage.mockRejectedValue(new Error('Network request failed'));

      await expect(analyzeTableData(['データ'])).rejects.toMatchObject({
        type: AnalysisErrorType.UNKNOWN_ERROR,
        message: 'Network request failed',
      });
    });
  });

  describe('checkAISettings', () => {
    it('有効な設定で正常結果を返す', async () => {
      const { aiSettingsStorage } = await import('@extension/storage');
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      mockStorage.mockResolvedValue({
        apiKey: 'sk-valid-key',
        model: 'gpt-4o',
        customPrompt: '',
        useCustomPrompt: false,
      });

      const result = await checkAISettings();

      expect(result).toEqual({
        isValid: true,
        hasApiKey: true,
        model: 'gpt-4o',
        errors: [],
      });
    });

    it('APIキー未設定で無効結果を返す', async () => {
      const { aiSettingsStorage } = await import('@extension/storage');
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      mockStorage.mockResolvedValue({
        apiKey: '',
        model: 'gpt-4o-mini',
        customPrompt: '',
        useCustomPrompt: false,
      });

      const result = await checkAISettings();

      expect(result).toEqual({
        isValid: false,
        hasApiKey: false,
        model: 'gpt-4o-mini',
        errors: ['OpenAI APIキーが設定されていません'],
      });
    });

    it('モデル未設定で無効結果を返す', async () => {
      const { aiSettingsStorage } = await import('@extension/storage');
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      mockStorage.mockResolvedValue({
        apiKey: 'sk-test-key',
        model: '',
        customPrompt: '',
        useCustomPrompt: false,
      });

      const result = await checkAISettings();

      expect(result).toEqual({
        isValid: false,
        hasApiKey: true,
        model: 'gpt-4o-mini', // フォールバック値が設定される
        errors: ['AIモデルが設定されていません'],
      });
    });

    it('設定読み込みエラーで適切なエラーを返す', async () => {
      const { aiSettingsStorage } = await import('@extension/storage');
      const mockStorage = aiSettingsStorage.get as ReturnType<typeof vi.fn>;

      mockStorage.mockRejectedValue(new Error('Storage error'));

      const result = await checkAISettings();

      expect(result).toEqual({
        isValid: false,
        hasApiKey: false,
        model: '',
        errors: ['設定の読み込みに失敗しました'],
      });
    });
  });

  describe('formatAnalysisResult', () => {
    it('完全な分析結果を整形する', () => {
      const result = {
        text: 'AI分析の結果です。',
        usage: {
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
        },
        processingTime: 3500,
      };

      const formatted = formatAnalysisResult(result);

      expect(formatted).toContain('AI分析の結果です。');
      expect(formatted).toContain('--- 使用量情報 ---');
      expect(formatted).toContain('プロンプトトークン: 100');
      expect(formatted).toContain('完了トークン: 50');
      expect(formatted).toContain('総トークン: 150');
      expect(formatted).toContain('処理時間: 3.50秒');
    });

    it('使用量情報なしの結果を整形する', () => {
      const result = {
        text: 'シンプルな結果',
        processingTime: 1200,
      };

      const formatted = formatAnalysisResult(result);

      expect(formatted).toContain('シンプルな結果');
      expect(formatted).not.toContain('--- 使用量情報 ---');
      expect(formatted).toContain('処理時間: 1.20秒');
    });

    it('処理時間なしの結果を整形する', () => {
      const result = {
        text: '結果のテキスト',
        processingTime: 0,
      };

      const formatted = formatAnalysisResult(result);

      expect(formatted).toContain('結果のテキスト');
      expect(formatted).not.toContain('処理時間:');
    });
  });
});
