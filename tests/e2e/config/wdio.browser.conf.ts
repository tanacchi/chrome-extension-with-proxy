import { config as baseConfig } from './wdio.conf.js'
import { getChromeExtensionPath, getFirefoxExtensionPath } from '../utils/extension-path.js'
import { IS_FIREFOX, E2E_HEADED } from '@extension/env'
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const extName = IS_FIREFOX ? '.xpi' : '.zip'
const extensions = await readdir(join(import.meta.dirname, '../../../dist-zip'))
const latestExtension = extensions.filter(file => extname(file) === extName).at(-1)
const extPath = join(import.meta.dirname, `../../../dist-zip/${latestExtension}`)
const bundledExtension = (await readFile(extPath)).toString('base64')

const chromeCapabilities = {
  browserName: 'chrome',
  acceptInsecureCerts: true,
  'goog:chromeOptions': {
    args: [
      '--disable-web-security',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      ...(!E2E_HEADED ? ['--headless'] : []),
    ],
    prefs: { 'extensions.ui.developer_mode': true },
    extensions: [bundledExtension],
  },
}

const firefoxCapabilities = {
  browserName: 'firefox',
  acceptInsecureCerts: true,
  'moz:firefoxOptions': {
    args: [...(!E2E_HEADED ? ['--headless'] : [])],
  },
}

export const config: WebdriverIO.Config = {
  ...baseConfig,
  capabilities: IS_FIREFOX ? [firefoxCapabilities] : [chromeCapabilities],

  maxInstances: !E2E_HEADED ? 10 : 1,
  logLevel: 'error',
  execArgv: !E2E_HEADED ? [] : ['--inspect'],
  before: async (
    { browserName }: WebdriverIO.Capabilities,
    _specs,
    browser: WebdriverIO.Browser,
  ) => {
    if (browserName === 'firefox') {
      await browser.installAddOn(bundledExtension, true)

      browser.addCommand('getExtensionPath', async () => getFirefoxExtensionPath(browser))
    } else if (browserName === 'chrome') {
      browser.addCommand('getExtensionPath', async () => getChromeExtensionPath(browser))
    }
  },
  afterTest: async () => {
    if (E2E_HEADED) {
      await browser.pause(500)
    }
  },
}
