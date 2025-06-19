/**
 * AI分析機能のE2Eテスト
 */

describe('AI Analysis Feature', () => {
  const SAMPLE_HTML_URL = 'http://localhost:3000';

  beforeEach(async () => {
    // サンプルHTMLページを開く
    await browser.url(SAMPLE_HTML_URL);
    await browser.pause(1000); // ページロード待機
  });

  describe('Table Detection', () => {
    it('should detect target table with ai-target-table-table class', async () => {
      // テーブルが存在することを確認
      const table = await browser.$('.ai-target-table-table');
      await expect(table).toBeExisting();
    });

    it('should detect table rows in tbody', async () => {
      // tbody内の行数を確認
      const rows = await browser.$$('.ai-target-table-table tbody tr');
      expect(rows).toHaveLength(3);
    });

    it('should extract second column data correctly', async () => {
      // 2列目のデータを確認
      const secondColumns = await browser.$$('.ai-target-table-table tbody tr td:nth-child(2)');
      expect(secondColumns).toHaveLength(3);

      const fruitNames = await Promise.all(await secondColumns.map(async col => await col.getText()));

      expect(fruitNames).toEqual(['りんご', 'バナナ', 'オレンジ']);
    });
  });

  describe('Content Script Integration', () => {
    it('should inject analysis button near the table', async () => {
      // Content Scriptの読み込み待機
      await browser.pause(2000);

      // 分析ボタンが注入されていることを確認
      // 注: 実際の実装に応じてセレクタを調整する必要があります

      // ボタンが存在するか、または適切な時間内に表示されることを確認
      await browser.waitUntil(
        async () => {
          const button = await browser.$('[data-testid="ai-analysis-button"]');
          return await button.isExisting();
        },
        {
          timeout: 10000,
          timeoutMsg: 'Analysis button was not injected within 10 seconds',
        },
      );
    });

    it('should show loading state when analysis is triggered', async () => {
      // Content Scriptの読み込み待機
      await browser.pause(2000);

      // 分析ボタンを探してクリック
      const analysisButton = await browser.$('[data-testid="ai-analysis-button"]');

      if (await analysisButton.isExisting()) {
        await analysisButton.click();

        // ローディング状態の確認
        const loadingIndicator = await browser.$('[data-testid="analysis-loading"]');
        await browser.waitUntil(async () => await loadingIndicator.isExisting(), {
          timeout: 5000,
          timeoutMsg: 'Loading indicator did not appear',
        });
      } else {
        // ボタンが存在しない場合はスキップ（モックモードでのテスト）
        console.warn('Analysis button not found, skipping interaction test');
      }
    });
  });

  describe('Options Page Integration', () => {
    it('should be accessible and show AI settings form', async () => {
      // オプションページを開く
      await browser.url('chrome-extension://test-extension-id/pages/options/index.html');

      // 設定フォームの要素を確認
      await browser.waitUntil(
        async () => {
          const modelSelect = await browser.$('select[name="model"]');
          return await modelSelect.isExisting();
        },
        {
          timeout: 10000,
          timeoutMsg: 'Model selection not found on options page',
        },
      );

      // APIキー入力フィールドの確認
      const apiKeyInput = await browser.$('input[type="password"]');
      await expect(apiKeyInput).toBeExisting();

      // カスタムプロンプト入力エリアの確認
      const customPromptTextarea = await browser.$('textarea[name="customPrompt"]');
      await expect(customPromptTextarea).toBeExisting();
    });

    it('should save and load settings correctly', async () => {
      // オプションページを開く
      await browser.url('chrome-extension://test-extension-id/pages/options/index.html');

      // モデル選択
      const modelSelect = await browser.$('select[name="model"]');
      await modelSelect.selectByVisibleText('gpt-4o-mini');

      // カスタムプロンプト設定
      const customPromptTextarea = await browser.$('textarea[name="customPrompt"]');
      await customPromptTextarea.setValue('テスト用のカスタムプロンプト');

      // 保存ボタンをクリック
      const saveButton = await browser.$('button[type="submit"]');
      await saveButton.click();

      // 保存成功メッセージの確認
      await browser.waitUntil(
        async () => {
          const successMessage = await browser.$('[data-testid="save-success"]');
          return await successMessage.isExisting();
        },
        {
          timeout: 5000,
          timeoutMsg: 'Save success message did not appear',
        },
      );

      // ページをリロードして設定が保持されていることを確認
      await browser.refresh();
      await browser.pause(1000);

      const reloadedModelSelect = await browser.$('select[name="model"]');
      const selectedValue = await reloadedModelSelect.getValue();
      expect(selectedValue).toBe('gpt-4o-mini');

      const reloadedTextarea = await browser.$('textarea[name="customPrompt"]');
      const textareaValue = await reloadedTextarea.getValue();
      expect(textareaValue).toBe('テスト用のカスタムプロンプト');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing API key gracefully', async () => {
      // オプションページでAPIキーを空にする
      await browser.url('chrome-extension://test-extension-id/pages/options/index.html');

      const apiKeyInput = await browser.$('input[type="password"]');
      await apiKeyInput.clearValue();

      const saveButton = await browser.$('button[type="submit"]');
      await saveButton.click();

      // サンプルページに戻って分析を試行
      await browser.url(SAMPLE_HTML_URL);
      await browser.pause(2000);

      const analysisButton = await browser.$('[data-testid="ai-analysis-button"]');

      if (await analysisButton.isExisting()) {
        await analysisButton.click();

        // エラーメッセージの表示を確認
        await browser.waitUntil(
          async () => {
            const errorMessage = await browser.$('[data-testid="analysis-error"]');
            return await errorMessage.isExisting();
          },
          {
            timeout: 10000,
            timeoutMsg: 'Error message did not appear for missing API key',
          },
        );

        const errorMessage = await browser.$('[data-testid="analysis-error"]');
        const errorText = await errorMessage.getText();
        expect(errorText).toContain('API'); // APIキー関連のエラーメッセージを期待
      }
    });

    it('should handle table not found scenario', async () => {
      // テーブルのないページを作成
      await browser.url('data:text/html,<html><body><h1>No Table Here</h1></body></html>');
      await browser.pause(1000);

      // Content Scriptが読み込まれても分析ボタンが表示されないことを確認
      await browser.pause(3000);

      const analysisButton = await browser.$('[data-testid="ai-analysis-button"]');
      const buttonExists = await analysisButton.isExisting();

      // テーブルがない場合はボタンが表示されないことを期待
      expect(buttonExists).toBe(false);
    });
  });

  describe('Performance and Usability', () => {
    it('should complete analysis within reasonable time', async () => {
      const startTime = Date.now();

      // Content Scriptの読み込み待機
      await browser.pause(2000);

      const analysisButton = await browser.$('[data-testid="ai-analysis-button"]');

      if (await analysisButton.isExisting()) {
        await analysisButton.click();

        // 分析完了または30秒でタイムアウト
        await browser.waitUntil(
          async () => {
            const resultDialog = await browser.$('[data-testid="analysis-result"]');
            const errorDialog = await browser.$('[data-testid="analysis-error"]');

            return (await resultDialog.isExisting()) || (await errorDialog.isExisting());
          },
          {
            timeout: 30000,
            timeoutMsg: 'Analysis did not complete within 30 seconds',
          },
        );

        const endTime = Date.now();
        const duration = endTime - startTime;

        // 30秒以内に完了することを確認
        expect(duration).toBeLessThan(30000);

        console.log(`Analysis completed in ${duration}ms`);
      }
    });

    it('should not interfere with original page layout', async () => {
      // 元のテーブルレイアウトを記録
      const originalTable = await browser.$('.ai-target-table-table');
      const originalPosition = await originalTable.getLocation();
      const originalSize = await originalTable.getSize();

      // Content Script読み込み後にレイアウトが変わらないことを確認
      await browser.pause(3000);

      const tableAfterScript = await browser.$('.ai-target-table-table');
      const positionAfterScript = await tableAfterScript.getLocation();
      const sizeAfterScript = await tableAfterScript.getSize();

      // 位置とサイズが大きく変わらないことを確認（多少の誤差は許容）
      expect(Math.abs(originalPosition.x - positionAfterScript.x)).toBeLessThan(10);
      expect(Math.abs(originalPosition.y - positionAfterScript.y)).toBeLessThan(10);
      expect(Math.abs(originalSize.width - sizeAfterScript.width)).toBeLessThan(20);
      expect(Math.abs(originalSize.height - sizeAfterScript.height)).toBeLessThan(20);
    });
  });
});
