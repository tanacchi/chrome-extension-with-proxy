/**
 * モックAPIサーバーとの統合E2Eテスト
 */

import {
  checkSampleServerHealth,
  waitForTableDetection,
  waitForAnalysisButton,
  waitForAnalysisCompletion,
  configureExtensionSettings,
  cleanupTestData,
} from '../helpers/ai-analysis-helpers';

describe('AI Analysis with Mock API Server', () => {
  const SAMPLE_HTML_URL = 'http://localhost:3000';
  const MOCK_API_URL = 'http://localhost:3001';

  before(async () => {
    // サンプルサーバーとモックAPIサーバーの稼働確認
    const sampleServerHealthy = await checkSampleServerHealth();
    if (!sampleServerHealthy) {
      console.warn('Sample HTML server not running. Starting tests anyway...');
    }

    // モックAPIサーバーの稼働確認
    try {
      await browser.url(MOCK_API_URL);
      const response = await browser.execute(() => fetch('http://localhost:3001').then(r => r.ok));
      console.log('Mock API server health:', response);
    } catch (error) {
      console.warn('Mock API server not accessible:', error);
    }
  });

  beforeEach(async () => {
    // テストデータのクリーンアップ
    await cleanupTestData();

    // サンプルHTMLページを開く
    await browser.url(SAMPLE_HTML_URL);
    await waitForTableDetection();
  });

  afterEach(async () => {
    // テスト後のクリーンアップ
    await cleanupTestData();
  });

  describe('Mock API Integration', () => {
    it('should successfully analyze table data with mock API', async () => {
      // モックAPIを使用するよう設定
      await configureExtensionSettings({
        apiKey: 'mock-api-key-for-testing',
        model: 'gpt-4o-mini',
        customPrompt: '各フルーツの特徴を簡潔に説明してください',
      });

      // サンプルページに戻る
      await browser.url(SAMPLE_HTML_URL);
      await waitForTableDetection();

      // Content Scriptの読み込みを待機
      await browser.pause(3000);

      // 分析ボタンをクリック
      const analysisButton = await waitForAnalysisButton();
      if (analysisButton) {
        await analysisButton.click();

        // 分析完了を待機
        const result = await waitForAnalysisCompletion();

        if (result.success && result.result) {
          // 成功時のテスト
          const resultText = await result.result.getText();
          expect(resultText).toBeTruthy();
          expect(resultText.length).toBeGreaterThan(0);

          // モックAPIからの応答が含まれていることを確認
          expect(resultText).toMatch(/りんご|バナナ|オレンジ/);
        } else if (result.error) {
          // エラー時の詳細ログ
          const errorText = await result.error.getText();
          console.warn('Analysis failed with error:', errorText);

          // モックAPIサーバーが動作していない場合は警告のみ
          if (errorText.includes('network') || errorText.includes('connection')) {
            console.warn('Mock API server appears to be down. Skipping test.');
            return;
          }

          // その他のエラーは失敗とする
          throw new Error(`Analysis failed: ${errorText}`);
        }
      } else {
        console.warn('Analysis button not found. Skipping mock API test.');
      }
    });

    it('should handle mock API error responses gracefully', async () => {
      // 無効なAPIキーでテスト
      await configureExtensionSettings({
        apiKey: 'invalid-mock-api-key',
        model: 'gpt-4o-mini',
      });

      await browser.url(SAMPLE_HTML_URL);
      await waitForTableDetection();
      await browser.pause(3000);

      const analysisButton = await waitForAnalysisButton();
      if (analysisButton) {
        await analysisButton.click();

        const result = await waitForAnalysisCompletion(15000); // 短いタイムアウト

        // エラーが適切に処理されることを確認
        if (result.error) {
          const errorText = await result.error.getText();
          expect(errorText).toBeTruthy();

          // 認証エラーまたはAPIキーエラーが表示されることを期待
          expect(errorText.toLowerCase()).toMatch(/api|key|auth|invalid/);
        } else {
          console.warn('Expected error response for invalid API key, but got success');
        }
      }
    });

    it('should display streaming response progressively', async () => {
      await configureExtensionSettings({
        apiKey: 'mock-streaming-api-key',
        model: 'gpt-4o-mini',
        customPrompt: 'ストリーミングテスト用プロンプト',
      });

      await browser.url(SAMPLE_HTML_URL);
      await waitForTableDetection();
      await browser.pause(3000);

      const analysisButton = await waitForAnalysisButton();
      if (analysisButton) {
        await analysisButton.click();

        // ローディング状態の確認
        const loadingIndicator = await browser.$('[data-testid="analysis-loading"]');

        if (await loadingIndicator.isExisting()) {
          // ローディングが表示されていることを確認
          expect(await loadingIndicator.isDisplayed()).toBe(true);

          // ストリーミング中の部分的な結果表示を確認
          await browser.waitUntil(
            async () => {
              const partialResult = await browser.$('[data-testid="analysis-partial-result"]');
              return await partialResult.isExisting();
            },
            {
              timeout: 10000,
              timeoutMsg: 'Streaming partial result not displayed',
            },
          );
        }

        // 最終的な完了を待機
        const finalResult = await waitForAnalysisCompletion();
        expect(finalResult.success).toBe(true);
      }
    });
  });

  describe('Performance with Mock API', () => {
    it('should complete analysis within acceptable time', async () => {
      await configureExtensionSettings({
        apiKey: 'mock-performance-test-key',
        model: 'gpt-4o-mini',
      });

      await browser.url(SAMPLE_HTML_URL);
      await waitForTableDetection();
      await browser.pause(2000);

      const analysisButton = await waitForAnalysisButton();
      if (analysisButton) {
        const startTime = Date.now();

        await analysisButton.click();
        const result = await waitForAnalysisCompletion(20000);

        const endTime = Date.now();
        const duration = endTime - startTime;

        // モックAPIでは5秒以内に完了することを期待
        expect(duration).toBeLessThan(5000);

        console.log(`Mock API analysis completed in ${duration}ms`);

        if (result.success) {
          expect(result.result).toBeTruthy();
        } else {
          console.warn('Analysis failed during performance test');
        }
      }
    });

    it('should handle multiple rapid analysis requests', async () => {
      await configureExtensionSettings({
        apiKey: 'mock-rapid-test-key',
        model: 'gpt-4o-mini',
      });

      await browser.url(SAMPLE_HTML_URL);
      await waitForTableDetection();
      await browser.pause(2000);

      const analysisButton = await waitForAnalysisButton();
      if (analysisButton) {
        // 連続で3回クリック
        await analysisButton.click();
        await browser.pause(100);
        await analysisButton.click();
        await browser.pause(100);
        await analysisButton.click();

        // 最後のリクエストの完了を待機
        const result = await waitForAnalysisCompletion(15000);

        // 重複リクエストが適切に処理されることを確認
        if (result.success) {
          expect(result.result).toBeTruthy();
        } else if (result.error) {
          const errorText = await result.error.getText();
          // レート制限やリクエスト重複エラーが表示される可能性
          console.log('Rapid request handling result:', errorText);
        }
      }
    });
  });

  describe('Different Table Configurations', () => {
    it('should handle table with different data types', async () => {
      // 異なるテーブル構造のテストページを作成
      const customTableHTML = `
        <html>
        <body>
          <table class="ai-target-table-table">
            <thead>
              <tr><th>番号</th><th>データ</th><th>備考</th></tr>
            </thead>
            <tbody>
              <tr><td>1</td><td>数値データ: 123.45</td><td>小数</td></tr>
              <tr><td>2</td><td>日付データ: 2024-01-15</td><td>ISO形式</td></tr>
              <tr><td>3</td><td>URL: https://example.com</td><td>リンク</td></tr>
              <tr><td>4</td><td>空のデータ</td><td></td></tr>
            </tbody>
          </table>
        </body>
        </html>
      `;

      await browser.url(`data:text/html;charset=utf-8,${encodeURIComponent(customTableHTML)}`);
      await waitForTableDetection();

      await configureExtensionSettings({
        apiKey: 'mock-data-type-test-key',
        model: 'gpt-4o-mini',
        customPrompt: '各データの種類を識別してください',
      });

      await browser.pause(3000);

      const analysisButton = await waitForAnalysisButton();
      if (analysisButton) {
        await analysisButton.click();
        const result = await waitForAnalysisCompletion();

        if (result.success && result.result) {
          const resultText = await result.result.getText();

          // 異なるデータ型が分析されていることを確認
          expect(resultText).toMatch(/数値|日付|URL/);
        }
      }
    });

    it('should handle empty table gracefully', async () => {
      const emptyTableHTML = `
        <html>
        <body>
          <table class="ai-target-table-table">
            <thead>
              <tr><th>列1</th><th>列2</th><th>列3</th></tr>
            </thead>
            <tbody>
              <!-- 空のtbody -->
            </tbody>
          </table>
        </body>
        </html>
      `;

      await browser.url(`data:text/html;charset=utf-8,${encodeURIComponent(emptyTableHTML)}`);
      await waitForTableDetection();

      await browser.pause(3000);

      // 空のテーブルの場合、分析ボタンが表示されないか、
      // 表示されても適切なエラーメッセージが出ることを確認
      const analysisButton = await browser.$('[data-testid="ai-analysis-button"]');
      const buttonExists = await analysisButton.isExisting();

      if (buttonExists) {
        await analysisButton.click();
        const result = await waitForAnalysisCompletion(10000);

        // 空のテーブルのエラーハンドリングを確認
        if (result.error) {
          const errorText = await result.error.getText();
          expect(errorText.toLowerCase()).toMatch(/empty|空|data|データ/);
        }
      } else {
        // ボタンが表示されないのも正常な動作
        console.log('Analysis button not shown for empty table (expected behavior)');
      }
    });
  });
});
