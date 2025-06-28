import { canSwitchTheme } from '../helpers/theme.js'

describe('拡張機能オプションページ', () => {
  it('オプションページにアクセスできる', async () => {
    const extensionPath = await browser.getExtensionPath()
    const optionsUrl = `${extensionPath}/options/index.html`

    await browser.url(optionsUrl)

    await expect(browser).toHaveTitle('Options')
    await canSwitchTheme()
  })
})
