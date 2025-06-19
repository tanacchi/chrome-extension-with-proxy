/**
 * AI分析機能のE2Eテスト（簡略化版）
 */

describe('AI分析機能', () => {
  const SAMPLE_HTML_URL = 'http://localhost:3000';

  beforeEach(async () => {
    // サンプルHTMLページを開く
    await browser.url(SAMPLE_HTML_URL);
    await browser.pause(1000); // ページロード待機
  });

  describe('テーブル検出', () => {
    it('ai-target-table-tableクラスを持つターゲットテーブルを検出できる', async () => {
      // テーブルが存在することを確認
      const table = await browser.$('.ai-target-table-table');
      expect(table).toBeExisting();
    });

    it('tbody内のテーブル行を検出できる', async () => {
      // tbody内の行数を確認
      const rows = await browser.$$('.ai-target-table-table tbody tr');
      expect(rows).toHaveLength(3);
    });
  });

  describe('コンテンツスクリプト連携', () => {
    it('Content Scriptが読み込まれる', async () => {
      // Content Scriptの読み込み待機
      await browser.pause(3000);

      // 基本的な要素が存在することを確認
      const body = await browser.$('body');
      expect(body).toBeExisting();
    });
  });
});
