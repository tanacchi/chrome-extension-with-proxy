import { canSwitchTheme } from '../helpers/theme.js'

describe('拡張機能ポップアップ', () => {
  it('ポップアップが正常に開く', async () => {
    const extensionPath = await browser.getExtensionPath()
    const popupUrl = `${extensionPath}/popup/index.html`
    await browser.url(popupUrl)

    await expect(browser).toHaveTitle('Popup')
    await canSwitchTheme()
  })
})
