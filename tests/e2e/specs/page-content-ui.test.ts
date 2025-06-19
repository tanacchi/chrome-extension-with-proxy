describe('コンテンツUIの注入', () => {
  it('example.comで注入されたコンテンツUI(allとexample)のdivが見つかる', async () => {
    await browser.url('https://example.com');

    const contentAllDiv = await $('#CEB-extension-all').getElement();
    await expect(contentAllDiv).toBeDisplayed();

    const contentExampleDiv = await $('#CEB-extension-example').getElement();
    await expect(contentExampleDiv).toBeDisplayed();
  });

  it('google.comで注入されたコンテンツUI all divが見つかり、example divが見つからない', async () => {
    await browser.url('https://www.google.com');

    const contentAllDiv = await $('#CEB-extension-all').getElement();
    await expect(contentAllDiv).toBeDisplayed();

    const contentExampleDiv = await $('#CEB-extension-example').getElement();
    await expect(contentExampleDiv).not.toBeDisplayed();
  });
});
