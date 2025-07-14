import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ManifestType } from '@extension/shared'

// package.jsonのモック
vi.mock('node:fs', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, any>
  return {
    ...actual,
    readFileSync: vi.fn(() => JSON.stringify({ version: '1.0.0' })),
  }
})

describe('Chrome Extension Manifest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('マニフェストの基本構造が正しい', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    expect(manifestData).toBeDefined()
    expect(manifestData.manifest_version).toBe(3)
    expect(manifestData.name).toBe('__MSG_extensionName__')
    expect(manifestData.description).toBe('__MSG_extensionDescription__')
    expect(manifestData.version).toBe('0.5.0')
  })

  it('必要な権限が定義されている', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    expect(manifestData.permissions).toContain('storage')
    expect(manifestData.permissions).toContain('scripting')
    expect(manifestData.permissions).toContain('tabs')
    expect(manifestData.permissions).toContain('notifications')
    expect(manifestData.host_permissions).toContain('<all_urls>')
  })

  it('コンテンツスクリプトが正しく設定されている', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    expect(manifestData.content_scripts).toHaveLength(4)

    // 全URLマッチのスクリプト
    const allUrlsScripts = manifestData.content_scripts.filter(script =>
      script.matches.includes('<all_urls>'),
    )
    expect(allUrlsScripts).toHaveLength(3)

    // example.comマッチのスクリプト
    const exampleScript = manifestData.content_scripts.find(script =>
      script.matches.includes('*://example.com/*'),
    )
    expect(exampleScript).toBeDefined()
    expect(exampleScript?.js).toContain('content-ui/example.iife.js')

    // CSSファイルの設定
    const cssScript = manifestData.content_scripts.find(script =>
      script.css?.includes('content.css'),
    )
    expect(cssScript).toBeDefined()
  })

  it('アイコンとリソースが正しく設定されている', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    expect(manifestData.icons).toEqual({
      '128': 'icon-128.png',
    })

    expect(manifestData.web_accessible_resources).toHaveLength(1)
    const resources = manifestData.web_accessible_resources[0]
    expect(resources.resources).toContain('*.js')
    expect(resources.resources).toContain('*.css')
    expect(resources.resources).toContain('*.svg')
    expect(resources.resources).toContain('icon-128.png')
    expect(resources.resources).toContain('icon-34.png')
    expect(resources.matches).toContain('*://*/*')
  })

  it('ブラウザ固有の設定が含まれている', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    expect(manifestData.browser_specific_settings).toBeDefined()
    expect(manifestData.browser_specific_settings.gecko).toBeDefined()
    expect(manifestData.browser_specific_settings.gecko.id).toBe('example@example.com')
    expect(manifestData.browser_specific_settings.gecko.strict_min_version).toBe('109.0')
  })

  it('新しいタブページのオーバーライドが設定されている', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    expect(manifestData.chrome_url_overrides).toBeDefined()
    expect(manifestData.chrome_url_overrides.newtab).toBe('new-tab/index.html')
  })

  it('国際化の設定が含まれている', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    expect(manifestData.default_locale).toBe('en')
  })

  it('ManifestType型に準拠している', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    // TypeScriptの型チェックが通ることを確認
    const typedManifest: ManifestType = manifestData
    expect(typedManifest).toBeDefined()
  })

  it('package.jsonからバージョンが正しく読み込まれる', async () => {
    // readFileSyncのモックをリセット
    vi.resetModules()

    const { readFileSync } = (await vi.importActual('node:fs')).default as any
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ version: '0.5.0' }))

    const manifest = await import('./manifest')

    expect(manifest.default.version).toBe('0.5.0')
  })

  it('HTTPSとHTTPの両方のサイトにマッチする', async () => {
    const manifest = await import('./manifest')
    const manifestData = manifest.default

    const httpHttpsScripts = manifestData.content_scripts.filter(
      script => script.matches.includes('http://*/*') && script.matches.includes('https://*/*'),
    )
    expect(httpHttpsScripts.length).toBeGreaterThan(0)
  })
})
