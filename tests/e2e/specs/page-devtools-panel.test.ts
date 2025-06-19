import { canSwitchTheme } from '../helpers/theme.js';

describe('拡張機能開発者ツールパネル', () => {
  it('開発者ツールパネルが利用できる', async () => {
    const extensionPath = await browser.getExtensionPath();
    const devtoolsPanelUrl = `${extensionPath}/devtools-panel/index.html`;

    await browser.url(devtoolsPanelUrl);
    await expect(browser).toHaveTitle('Devtools Panel');
    await canSwitchTheme();
  });
});
