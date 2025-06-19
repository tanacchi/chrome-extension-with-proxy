/**
 * @fileoverview AI設定管理フック
 *
 * Chrome拡張機能のAI設定（APIキー、モデル、プロンプトなど）を
 * Reactコンポーネントから簡単に使用できるフックを提供します。
 * Chrome Storage APIとの連携を内部で処理します。
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

import { aiSettingsStorage } from '@extension/storage';
import { useState, useEffect, useCallback } from 'react';
import type { AISettings } from '@extension/storage';

/**
 * AI設定フックの戻り値
 *
 * @interface UseAISettingsReturn
 */
export interface UseAISettingsReturn {
  /** 現在のAI設定 */
  settings: AISettings | null;
  /** 設定の読み込み中かどうか */
  isLoading: boolean;
  /** エラー情報 */
  error: Error | null;
  /** 設定を更新する関数 */
  updateSettings: (newSettings: Partial<AISettings>) => Promise<void>;
  /** 設定をリロードする関数 */
  reloadSettings: () => Promise<void>;
  /** 設定をリセットする関数 */
  resetSettings: () => Promise<void>;
  /** APIキーが設定されているかどうか */
  hasApiKey: boolean;
  /** 設定が有効かどうか */
  isValid: boolean;
}

/**
 * AI設定管理カスタムフック
 *
 * Chrome Storage APIと連携してAI設定を管理します。
 * 設定の読み込み、更新、バリデーションを提供し、
 * リアクティブに設定変更を反映します。
 *
 * @example
 * ```typescript
 * const SettingsComponent: React.FC = () => {
 *   const {
 *     settings,
 *     isLoading,
 *     error,
 *     updateSettings,
 *     hasApiKey,
 *     isValid
 *   } = useAISettings();
 *
 *   const handleUpdateApiKey = async (apiKey: string) => {
 *     await updateSettings({ apiKey });
 *   };
 *
 *   const handleUpdateModel = async (model: 'gpt-4o' | 'gpt-4o-mini') => {
 *     await updateSettings({ model });
 *   };
 *
 *   if (isLoading) return <div>設定を読み込み中...</div>;
 *   if (error) return <div>エラー: {error.message}</div>;
 *   if (!isValid) return <div>AI設定が無効です</div>;
 *
 *   return (
 *     <div>
 *       <div>モデル: {settings?.model}</div>
 *       <div>APIキー設定済み: {hasApiKey ? 'はい' : 'いいえ'}</div>
 *       <button onClick={() => handleUpdateModel('gpt-4o')}>
 *         GPT-4oに変更
 *       </button>
 *     </div>
 *   );
 * };
 * ```
 *
 * @returns AI設定管理機能を提供するオブジェクト
 *
 * @since 1.0.0
 */
export const useAISettings = (): UseAISettingsReturn => {
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * 設定をストレージから読み込む
   */
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const loadedSettings = await aiSettingsStorage.get();
      setSettings(loadedSettings);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load AI settings');
      setError(error);
      console.error('AI Settings load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 設定を更新する
   */
  const updateSettings = useCallback(
    async (newSettings: Partial<AISettings>) => {
      try {
        setError(null);

        if (!settings) {
          throw new Error('Settings not loaded yet');
        }

        // バリデーション
        const updatedSettings = { ...settings, ...newSettings };
        validateSettings(updatedSettings);

        // ストレージに保存
        await aiSettingsStorage.set(updatedSettings);

        // ローカル状態を更新
        setSettings(updatedSettings);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to update AI settings');
        setError(error);
        console.error('AI Settings update error:', error);
        throw error; // 呼び出し元でエラーハンドリングできるように再throw
      }
    },
    [settings],
  );

  /**
   * 設定をリロードする
   */
  const reloadSettings = useCallback(async () => {
    await loadSettings();
  }, [loadSettings]);

  /**
   * 設定をリセットする（デフォルト値に戻す）
   */
  const resetSettings = useCallback(async () => {
    try {
      setError(null);

      // デフォルト設定を取得
      const defaultSettings: AISettings = {
        apiKey: '',
        model: 'gpt-4o-mini',
        customPrompt: '',
        useCustomPrompt: false,
      };

      await aiSettingsStorage.set(defaultSettings);
      setSettings(defaultSettings);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to reset AI settings');
      setError(error);
      console.error('AI Settings reset error:', error);
      throw error;
    }
  }, []);

  /**
   * APIキーが設定されているかどうか
   */
  const hasApiKey = Boolean(settings?.apiKey && settings.apiKey.trim().length > 0);

  /**
   * 設定が有効かどうか
   */
  const isValid = Boolean(
    settings && hasApiKey && settings.model && ['gpt-4o', 'gpt-4o-mini'].includes(settings.model),
  );

  /**
   * 初期読み込み
   */
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * ストレージ変更の監視
   * 他のタブやコンテキストでの設定変更を検知
   */
  useEffect(() => {
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      // aiSettingsStorageのキーに変更があった場合
      const aiSettingsKey = 'aiSettings'; // 実際のキー名に合わせて調整
      if (changes[aiSettingsKey]) {
        const newValue = changes[aiSettingsKey].newValue;
        if (newValue) {
          setSettings(newValue);
        }
      }
    };

    // Chrome Storage APIの変更リスナーを追加
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSettings,
    reloadSettings,
    resetSettings,
    hasApiKey,
    isValid,
  };
};

/**
 * AI設定をバリデーションする
 *
 * @param settings - バリデーション対象の設定
 * @throws {Error} バリデーション失敗時
 *
 * @private
 */
const validateSettings = (settings: AISettings): void => {
  // APIキーの検証
  if (!settings.apiKey || settings.apiKey.trim().length === 0) {
    throw new Error('APIキーは必須です');
  }

  if (!settings.apiKey.startsWith('sk-')) {
    throw new Error('OpenAI APIキーは"sk-"で始まる必要があります');
  }

  if (settings.apiKey.length < 20) {
    throw new Error('APIキーの形式が正しくありません');
  }

  // モデルの検証
  const validModels = ['gpt-4o', 'gpt-4o-mini'];
  if (!validModels.includes(settings.model)) {
    throw new Error(`無効なモデルです。有効なモデル: ${validModels.join(', ')}`);
  }

  // カスタムプロンプトの検証
  if (settings.useCustomPrompt && settings.customPrompt) {
    if (settings.customPrompt.length > 2000) {
      throw new Error('カスタムプロンプトは2000文字以内で入力してください');
    }
  }
};

/**
 * AI設定が利用可能かどうかをチェックするヘルパー関数
 *
 * @param settings - チェック対象の設定
 * @returns 設定が利用可能な場合 true
 *
 * @since 1.0.0
 */
export const isAISettingsAvailable = (settings: AISettings | null): boolean => {
  if (!settings) return false;

  try {
    validateSettings(settings);
    return true;
  } catch {
    return false;
  }
};

/**
 * APIキーをマスクして表示用文字列を生成するヘルパー関数
 *
 * @param apiKey - APIキー
 * @returns マスク済みAPIキー
 *
 * @since 1.0.0
 */
export const maskApiKey = (apiKey: string): string => {
  if (!apiKey || apiKey.length < 8) {
    return '••••••••';
  }

  const start = apiKey.substring(0, 4);
  const end = apiKey.substring(apiKey.length - 4);
  const middle = '•'.repeat(Math.max(8, apiKey.length - 8));

  return `${start}${middle}${end}`;
};
