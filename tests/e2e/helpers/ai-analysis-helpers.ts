/**
 * AI分析機能E2Eテスト用ヘルパー関数
 */

/**
 * サンプルHTMLサーバーが起動しているかチェック
 */
export async function checkSampleServerHealth(): Promise<boolean> {
  try {
    await browser.url('http://localhost:3000');
    const title = await browser.getTitle();
    return title.includes('テーブルデータAI分析');
  } catch (error) {
    console.warn('Sample HTML server not accessible:', error);
    return false;
  }
}

/**
 * Chrome拡張機能のページを開く
 */
export async function openExtensionPage(page: 'popup' | 'options'): Promise<void> {
  // 注: 実際のE2E環境では拡張機能IDが動的に変わる可能性があります
  const extensionId = await getExtensionId();
  const pageUrl = `chrome-extension://${extensionId}/pages/${page}/index.html`;
  await browser.url(pageUrl);
}

/**
 * 拡張機能IDを取得（実装は環境に依存）
 */
export async function getExtensionId(): Promise<string> {
  // 本来はWebDriverの機能で拡張機能IDを取得する必要があります
  // テスト環境での固定IDまたは動的取得の実装が必要
  return 'test-extension-id';
}

/**
 * テーブル検出の待機
 */
export async function waitForTableDetection(timeout: number = 10000): Promise<void> {
  await browser.waitUntil(
    async () => {
      const table = await browser.$('.ai-target-table-table');
      return await table.isExisting();
    },
    {
      timeout,
      timeoutMsg: `Table with ai-target-table-table class not found within ${timeout}ms`,
    },
  );
}

/**
 * Content Scriptの注入を待機
 */
export async function waitForContentScriptInjection(timeout: number = 15000): Promise<void> {
  await browser.waitUntil(
    async () => {
      const scriptElements = await browser.$$('script[data-extension-content-script]');
      return scriptElements.length > 0;
    },
    {
      timeout,
      timeoutMsg: `Content script not injected within ${timeout}ms`,
    },
  );
}

/**
 * 分析ボタンの表示を待機
 */
export async function waitForAnalysisButton(timeout: number = 10000): Promise<WebdriverIO.Element | null> {
  try {
    await browser.waitUntil(
      async () => {
        const button = await browser.$('[data-testid="ai-analysis-button"]');
        return await button.isExisting();
      },
      {
        timeout,
        timeoutMsg: `Analysis button not found within ${timeout}ms`,
      },
    );
    return await browser.$('[data-testid="ai-analysis-button"]');
  } catch (error) {
    console.warn('Analysis button not found:', error);
    return null;
  }
}

/**
 * 分析結果またはエラーの表示を待機
 */
export async function waitForAnalysisCompletion(timeout: number = 30000): Promise<{
  success: boolean;
  result?: WebdriverIO.Element;
  error?: WebdriverIO.Element;
}> {
  try {
    await browser.waitUntil(
      async () => {
        const resultDialog = await browser.$('[data-testid="analysis-result"]');
        const errorDialog = await browser.$('[data-testid="analysis-error"]');

        return (await resultDialog.isExisting()) || (await errorDialog.isExisting());
      },
      {
        timeout,
        timeoutMsg: `Analysis did not complete within ${timeout}ms`,
      },
    );

    const resultDialog = await browser.$('[data-testid="analysis-result"]');
    const errorDialog = await browser.$('[data-testid="analysis-error"]');

    if (await resultDialog.isExisting()) {
      return { success: true, result: resultDialog };
    } else if (await errorDialog.isExisting()) {
      return { success: false, error: errorDialog };
    } else {
      throw new Error('Unexpected state: neither result nor error found');
    }
  } catch (error) {
    throw new Error(`Analysis completion timeout: ${error.message}`);
  }
}

/**
 * 拡張機能の設定を行う
 */
export async function configureExtensionSettings(settings: {
  apiKey?: string;
  model?: 'gpt-4o' | 'gpt-4o-mini';
  customPrompt?: string;
  useCustomPrompt?: boolean;
}): Promise<void> {
  await openExtensionPage('options');

  // APIキーの設定
  if (settings.apiKey !== undefined) {
    const apiKeyInput = await browser.$('input[type="password"]');
    await apiKeyInput.clearValue();
    if (settings.apiKey) {
      await apiKeyInput.setValue(settings.apiKey);
    }
  }

  // モデルの選択
  if (settings.model) {
    const modelSelect = await browser.$('select[name="model"]');
    await modelSelect.selectByValue(settings.model);
  }

  // カスタムプロンプトの設定
  if (settings.customPrompt !== undefined) {
    const customPromptTextarea = await browser.$('textarea[name="customPrompt"]');
    await customPromptTextarea.clearValue();
    if (settings.customPrompt) {
      await customPromptTextarea.setValue(settings.customPrompt);
    }
  }

  // カスタムプロンプト使用フラグの設定
  if (settings.useCustomPrompt !== undefined) {
    const useCustomPromptCheckbox = await browser.$('input[name="useCustomPrompt"]');
    const isChecked = await useCustomPromptCheckbox.isSelected();

    if (isChecked !== settings.useCustomPrompt) {
      await useCustomPromptCheckbox.click();
    }
  }

  // 設定を保存
  const saveButton = await browser.$('button[type="submit"]');
  await saveButton.click();

  // 保存完了を待機
  await browser.waitUntil(
    async () => {
      const successMessage = await browser.$('[data-testid="save-success"]');
      return await successMessage.isExisting();
    },
    {
      timeout: 5000,
      timeoutMsg: 'Settings save confirmation not received',
    },
  );
}

/**
 * ページのパフォーマンス測定
 */
export async function measurePagePerformance(): Promise<{
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
}> {
  const navigationTiming = await browser.execute(() => {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      loadTime: timing.loadEventEnd - timing.loadEventStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
      responseStart: timing.responseStart,
      responseEnd: timing.responseEnd,
    };
  });

  // First Contentful Paint の取得を試行
  let firstContentfulPaint: number | undefined;
  try {
    const paintTiming = await browser.execute(() => {
      const paints = performance.getEntriesByType('paint');
      const fcp = paints.find(paint => paint.name === 'first-contentful-paint');
      return fcp ? fcp.startTime : undefined;
    });
    firstContentfulPaint = paintTiming;
  } catch (error) {
    console.warn('Could not measure First Contentful Paint:', error);
  }

  return {
    loadTime: navigationTiming.loadTime,
    domContentLoaded: navigationTiming.domContentLoaded,
    firstContentfulPaint,
  };
}

/**
 * コンソールログの収集
 */
export async function collectConsoleLogs(): Promise<string[]> {
  const logs: string[] = [];

  try {
    await browser.sessionSubscribe({ events: ['log.entryAdded'] });

    browser.on('log.entryAdded', logEntry => {
      logs.push(`[${logEntry.level}] ${logEntry.text}`);
    });

    // 既存のログも収集
    const existingLogs = await browser.getLogs('browser');
    existingLogs.forEach(log => {
      logs.push(`[${log.level}] ${log.message}`);
    });
  } catch (error) {
    console.warn('Could not collect console logs:', error);
  }

  return logs;
}

/**
 * メモリ使用量の測定
 */
export async function measureMemoryUsage(): Promise<{
  usedJSHeapSize?: number;
  totalJSHeapSize?: number;
  jsHeapSizeLimit?: number;
}> {
  try {
    const memoryInfo = await browser.execute(() => {
      // @ts-ignore - performance.memory is not in standard types
      const memory = (performance as any).memory;
      return memory
        ? {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
          }
        : {};
    });

    return memoryInfo;
  } catch (error) {
    console.warn('Could not measure memory usage:', error);
    return {};
  }
}

/**
 * テストデータのクリーンアップ
 */
export async function cleanupTestData(): Promise<void> {
  try {
    // Chrome storage をクリア
    await browser.execute(() => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.clear();
        chrome.storage.sync.clear();
      }
    });

    // セッションストレージとローカルストレージをクリア
    await browser.execute(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  } catch (error) {
    console.warn('Could not cleanup test data:', error);
  }
}
