describe('サンプルページの読み込みテスト', () => {
  it('サンプルページにアクセスできる', async () => {
    await browser.url('https://www.example.com');

    await expect(browser).toHaveTitle('Example Domain');
  });
});
