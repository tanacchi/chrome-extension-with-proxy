#!/usr/bin/env node

/**
 * manifest.json生成スクリプト
 *
 * manifest.tsからmanifest.jsonを生成してdistディレクトリに配置します。
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const currentFilename = fileURLToPath(import.meta.url)
const currentDirname = path.dirname(currentFilename)

async function generateManifest() {
  try {
    const projectRoot = path.resolve(currentDirname, '..')
    const manifestPath = path.join(projectRoot, 'src/core', 'manifest.js')
    const distDir = path.join(projectRoot, 'dist')
    const outputPath = path.join(distDir, 'manifest.json')

    console.log('🔄 manifest.json生成開始...')
    console.log(`📂 読み込み: ${manifestPath}`)
    console.log(`📂 出力先: ${outputPath}`)

    // manifest.jsが存在するかチェック
    if (!fs.existsSync(manifestPath)) {
      console.error(`❌ エラー: manifest.jsが見つかりません: ${manifestPath}`)
      console.log('💡 以下のコマンドを実行してmanifest.jsを生成してください:')
      console.log('   cd src/core && pnpm ready')
      process.exit(1)
    }

    // distディレクトリが存在しない場合は作成
    if (!fs.existsSync(distDir)) {
      console.log(`📁 distディレクトリを作成: ${distDir}`)
      fs.mkdirSync(distDir, { recursive: true })
    }

    // manifest.jsをインポート
    const manifestModule = await import(manifestPath)
    const manifest = manifestModule.default

    if (!manifest) {
      console.error('❌ エラー: manifestの取得に失敗しました')
      process.exit(1)
    }

    // 開発環境の場合はHMR用のスクリプトを追加
    const isDev = process.env.CLI_CEB_DEV === 'true' || process.env.NODE_ENV === 'development'

    if (isDev) {
      console.log('🛠️ 開発モード: HMRスクリプトを追加')

      // HMR用のrefreshスクリプトを追加
      manifest.content_scripts = manifest.content_scripts || []

      // 既にrefresh.jsが追加されていない場合のみ追加
      const hasRefreshScript = manifest.content_scripts.some(
        script => script.js?.includes('refresh.js'),
      )

      if (!hasRefreshScript) {
        manifest.content_scripts.push({
          matches: ['http://*/*', 'https://*/*', '<all_urls>'],
          js: ['refresh.js'],
        })
      }
    }

    // manifest.jsonとして保存
    const manifestJson = JSON.stringify(manifest, null, 2)
    fs.writeFileSync(outputPath, manifestJson, 'utf8')

    console.log('✅ manifest.json生成完了!')
    console.log(`📄 ファイルサイズ: ${manifestJson.length} bytes`)

    // 主要な設定を表示
    console.log('\n📋 manifest.json 概要:')
    console.log(`   • 名前: ${manifest.name}`)
    console.log(`   • バージョン: ${manifest.version}`)
    console.log(`   • マニフェストバージョン: ${manifest.manifest_version}`)
    console.log(`   • 権限数: ${manifest.permissions?.length || 0}`)
    console.log(`   • コンテンツスクリプト数: ${manifest.content_scripts?.length || 0}`)

    // 開発環境での使用方法を表示
    if (isDev) {
      console.log('\n🔧 Chrome拡張機能の読み込み方法:')
      console.log('   1. Chromeで chrome://extensions/ を開く')
      console.log('   2. "デベロッパーモード"をオンにする')
      console.log('   3. "パッケージ化されていない拡張機能を読み込む"をクリック')
      console.log(`   4. "${distDir}" フォルダを選択`)
    }
  } catch (error) {
    console.error('❌ manifest.json生成エラー:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// スクリプトが直接実行された場合のみ実行
if (process.argv[1]?.endsWith('generate-manifest.js')) {
  generateManifest()
}

export { generateManifest }
