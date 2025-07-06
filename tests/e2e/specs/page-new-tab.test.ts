describe('拡張機能新しいタブ', () => {
  it('新しいタブを開いたときに拡張機能ページが開く', async () => {
    const extensionPath = await browser.getExtensionPath()
    const newTabUrl =
      process.env.CLI_CEB_FIREFOX === 'true'
        ? `${extensionPath}/new-tab/index.html`
        : 'chrome://newtab'

    await browser.url(newTabUrl)

    const appDiv = await $('.App').getElement()
    await expect(appDiv).toBeExisting()
  })
})
