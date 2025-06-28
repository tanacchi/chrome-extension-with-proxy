import { config as browserConfig } from './wdio.browser.conf.js'

export const config = {
  ...browserConfig,

  // レポート生成専用設定
  reporters: [
    'spec',
    [
      'allure',
      {
        outputDir: 'reports/allure-results',
        disableWebdriverStepsReporting: false,
        disableWebdriverScreenshotsReporting: false,
        useCucumberStepReporter: false,
      },
    ],
    [
      'junit',
      {
        outputDir: 'reports/junit',
        outputFileFormat: (options) => `junit-${options.cid}.xml`,
      },
    ],
  ],

  // スクリーンショット設定
  afterTest: async (test, _context, { error, result, duration, passed, retries }) => {
    // テスト失敗時のスクリーンショット
    if (!passed) {
      await browser.takeScreenshot()
    }

    // 元の設定も実行
    if (browserConfig.afterTest) {
      await browserConfig.afterTest(test, _context, { error, result, duration, passed, retries })
    }
  },

  // テスト完了後の処理
  onComplete: async () => {
    console.log('🎯 Test execution completed!')
    console.log('📊 Reports generated:')
    console.log('  - Allure results: tests/e2e/reports/allure-results/')
    console.log('  - JUnit reports: tests/e2e/reports/junit/')
    console.log('')
    console.log('📖 To view HTML report, run: pnpm e2e:report:open')
  },
}
