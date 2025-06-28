import { canSwitchTheme } from '../helpers/theme.js'

describe('拡張機能サイドパネル', () => {
  it('サイドパネルにアクセスできる', async () => {
    const extensionPath = await browser.getExtensionPath()
    const sidePanelUrl = `${extensionPath}/side-panel/index.html`

    await browser.url(sidePanelUrl)
    await expect(browser).toHaveTitle('Side Panel')
    await canSwitchTheme()
  })
})
