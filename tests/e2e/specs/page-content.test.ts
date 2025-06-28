describe('拡張機能コンテンツスクリプト', () => {
  it('example.comでコンソールに"example content script loaded"がログ出力される', async () => {
    await browser.sessionSubscribe({ events: ['log.entryAdded'] })
    const logs: (string | null)[] = []

    browser.on('log.entryAdded', logEntry => {
      logs.push(logEntry.text)
    })

    await browser.url('https://example.com')

    const EXPECTED_LOG_MESSAGE = '[CEB] Example content script loaded'
    await browser.waitUntil(() => logs.includes(EXPECTED_LOG_MESSAGE))

    expect(logs).toContain(EXPECTED_LOG_MESSAGE)
  })

  it('任意のページでコンソールに"all content script loaded"がログ出力される', async () => {
    await browser.sessionSubscribe({ events: ['log.entryAdded'] })
    const logs: (string | null)[] = []

    browser.on('log.entryAdded', logEntry => {
      logs.push(logEntry.text)
    })

    await browser.url('https://www.google.com')

    const EXPECTED_LOG_MESSAGE = '[CEB] All content script loaded'
    await browser.waitUntil(() => logs.includes(EXPECTED_LOG_MESSAGE))

    expect(logs).toContain(EXPECTED_LOG_MESSAGE)
  })
})
