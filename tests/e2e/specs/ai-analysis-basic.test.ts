/**
 * AI分析機能の基本E2Eテスト
 */

describe('AI分析機能の基本テスト', () => {
  const SAMPLE_HTML_URL = 'http://localhost:3000'

  before(async () => {
    // サンプルサーバーの稼働確認
    try {
      await browser.url(SAMPLE_HTML_URL)
      console.log('Sample HTML server is running')
    } catch (_error) {
      console.warn('Sample HTML server not running. Tests may fail.')
    }
  })

  beforeEach(async () => {
    // サンプルHTMLページを開く
    await browser.url(SAMPLE_HTML_URL)
    await browser.pause(1000)
  })

  describe('基本機能', () => {
    it('サンプルHTMLページが正常に読み込まれる', async () => {
      // ページが正常に読み込まれることを確認
      const title = await browser.getTitle()
      expect(title).toBeTruthy()
    })

    it('テーブルが存在する', async () => {
      // テーブルが存在することを確認
      const table = await browser.$('.ai-target-table-table')
      expect(table).toBeExisting()
    })
  })

  describe('基本的な動作確認', () => {
    it('ページ上でJavaScriptが実行される', async () => {
      // 基本的なJavaScript実行を確認
      const result = await browser.execute(() => document.readyState)
      expect(result).toBe('complete')
    })
  })
})
