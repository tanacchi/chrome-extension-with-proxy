#!/usr/bin/env node

/**
 * ドキュメントカバレッジ測定スクリプト
 *
 * JSDocコメントの存在率と品質を測定し、
 * カバレッジレポートを生成します。
 */

import fs from 'fs'
import path from 'path'

class DocumentationCoverageAnalyzer {
  constructor() {
    this.stats = {
      totalFiles: 0,
      totalFunctions: 0,
      totalInterfaces: 0,
      totalClasses: 0,
      documentedFunctions: 0,
      documentedInterfaces: 0,
      documentedClasses: 0,
      filesWithFileOverview: 0,
      functionsWithExamples: 0,
      functionsWithParamDocs: 0,
      functionsWithReturnDocs: 0,
      details: [],
    }
  }

  /**
   * TypeScriptファイルを解析してJSDocカバレッジを測定
   */
  analyzeFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const relativePath = path.relative(process.cwd(), filePath)

    const fileStats = {
      file: relativePath,
      functions: 0,
      interfaces: 0,
      classes: 0,
      documentedFunctions: 0,
      documentedInterfaces: 0,
      documentedClasses: 0,
      hasFileOverview: false,
      functionsWithExamples: 0,
      functionsWithParamDocs: 0,
      functionsWithReturnDocs: 0,
      issues: [],
    }

    // ファイル概要コメントの検出
    const fileOverviewPattern = /@fileoverview|\/\*\*[\s\S]*?\*\/\s*(?:import|export|declare)/
    fileStats.hasFileOverview = fileOverviewPattern.test(content)

    // 関数の検出と分析
    this.analyzeFunctions(content, fileStats)

    // インターフェースの検出と分析
    this.analyzeInterfaces(content, fileStats)

    // クラスの検出と分析
    this.analyzeClasses(content, fileStats)

    this.stats.details.push(fileStats)
    this.updateTotalStats(fileStats)

    return fileStats
  }

  /**
   * 関数のJSDocカバレッジを分析
   */
  analyzeFunctions(content, fileStats) {
    // 関数定義パターン（より厳密に）
    const patterns = [
      // export function
      {
        pattern: /export\s+(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g,
        description: 'exported function',
      },
      // export const arrow function
      {
        pattern: /export\s+const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
        description: 'exported arrow function',
      },
      // const arrow function (non-exported)
      {
        pattern: /(?:^|\n)\s*const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
        description: 'const arrow function',
      },
      // regular function
      {
        pattern: /(?:^|\n)\s*(?:async\s+)?function\s+(\w+)\s*\([^)]*\)/g,
        description: 'function declaration',
      },
    ]

    patterns.forEach(({ pattern, description }) => {
      let match
      while ((match = pattern.exec(content)) !== null) {
        const functionName = match[1]

        // 特定の関数名はスキップ（小さなヘルパー関数など）
        if (this.shouldSkipFunction(functionName)) {
          continue
        }

        fileStats.functions++

        // 関数の直前のJSDocコメントを検索
        const beforeFunction = content.substring(0, match.index)
        const lines = beforeFunction.split('\n')

        // 関数の直前数行でJSDocを探す
        let jsDocFound = false
        let jsDoc = ''

        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim()

          // 空行はスキップ
          if (line === '') continue

          // JSDocの終了を検出
          if (line.endsWith('*/')) {
            jsDocFound = true
            jsDoc = `${line}\n${jsDoc}`

            // JSDocの開始を探す
            for (let j = i - 1; j >= 0; j--) {
              const prevLine = lines[j].trim()
              jsDoc = `${prevLine}\n${jsDoc}`

              if (prevLine.startsWith('/**')) {
                break
              }
            }
            break
          }

          // JSDocではない他のコメントやコードが見つかったら終了
          if (!line.startsWith('*') && !line.startsWith('/**') && !line.startsWith('*/')) {
            break
          }
        }

        if (jsDocFound && jsDoc.includes('/**')) {
          fileStats.documentedFunctions++

          // @paramの存在確認
          if (/@param/.test(jsDoc)) {
            fileStats.functionsWithParamDocs++
          }

          // @returnsの存在確認
          if (/@returns?/.test(jsDoc)) {
            fileStats.functionsWithReturnDocs++
          }

          // @exampleの存在確認
          if (/@example/.test(jsDoc)) {
            fileStats.functionsWithExamples++
          }
        } else {
          fileStats.issues.push(`関数 ${functionName} (${description}) にJSDocコメントがありません`)
        }
      }
    })
  }

  /**
   * スキップすべき関数かどうかを判定
   */
  shouldSkipFunction(functionName) {
    // 3文字以下の短い関数名はスキップしない（重要な可能性）
    if (functionName.length <= 3) {
      return false
    }

    return false // 現時点では全ての関数をチェック対象とする
  }

  /**
   * インターフェースのJSDocカバレッジを分析
   */
  analyzeInterfaces(content, fileStats) {
    const interfacePattern = /(?:export\s+)?interface\s+(\w+)/g
    let match

    while ((match = interfacePattern.exec(content)) !== null) {
      const interfaceName = match[1]
      fileStats.interfaces++

      // インターフェースの直前のJSDocコメントを検索
      const beforeInterface = content.substring(0, match.index)
      const lines = beforeInterface.split('\n')

      // インターフェースの直前数行でJSDocを探す
      let jsDocFound = false

      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim()

        // 空行はスキップ
        if (line === '') continue

        // JSDocの終了を検出
        if (line.endsWith('*/')) {
          // JSDocの開始を探す
          for (let j = i - 1; j >= 0; j--) {
            const prevLine = lines[j].trim()

            if (prevLine.startsWith('/**')) {
              jsDocFound = true
              break
            }

            // JSDocではない行が見つかったら終了
            if (!prevLine.startsWith('*')) {
              break
            }
          }
          break
        }

        // JSDocではない他のコメントやコードが見つかったら終了
        if (!line.startsWith('*') && !line.startsWith('/**') && !line.startsWith('*/')) {
          break
        }
      }

      if (jsDocFound) {
        fileStats.documentedInterfaces++
      } else {
        fileStats.issues.push(`インターフェース ${interfaceName} にJSDocコメントがありません`)
      }
    }
  }

  /**
   * クラスのJSDocカバレッジを分析
   */
  analyzeClasses(content, fileStats) {
    const classPattern = /(?:export\s+)?class\s+(\w+)/g
    let match

    while ((match = classPattern.exec(content)) !== null) {
      const className = match[1]
      fileStats.classes++

      // クラスの直前のJSDocコメントを検索
      const beforeClass = content.substring(0, match.index)
      const jsDocPattern = /\/\*\*[\s\S]*?\*\/\s*$/
      const jsDocMatch = beforeClass.match(jsDocPattern)

      if (jsDocMatch) {
        fileStats.documentedClasses++
      } else {
        fileStats.issues.push(`クラス ${className} にJSDocコメントがありません`)
      }
    }
  }

  /**
   * ファイル統計を全体統計に反映
   */
  updateTotalStats(fileStats) {
    this.stats.totalFiles++
    this.stats.totalFunctions += fileStats.functions
    this.stats.totalInterfaces += fileStats.interfaces
    this.stats.totalClasses += fileStats.classes
    this.stats.documentedFunctions += fileStats.documentedFunctions
    this.stats.documentedInterfaces += fileStats.documentedInterfaces
    this.stats.documentedClasses += fileStats.documentedClasses

    if (fileStats.hasFileOverview) {
      this.stats.filesWithFileOverview++
    }

    this.stats.functionsWithExamples += fileStats.functionsWithExamples
    this.stats.functionsWithParamDocs += fileStats.functionsWithParamDocs
    this.stats.functionsWithReturnDocs += fileStats.functionsWithReturnDocs
  }

  /**
   * カバレッジ率を計算
   */
  calculateCoverage() {
    const functionCoverage =
      this.stats.totalFunctions > 0
        ? ((this.stats.documentedFunctions / this.stats.totalFunctions) * 100).toFixed(1)
        : '100.0'

    const interfaceCoverage =
      this.stats.totalInterfaces > 0
        ? ((this.stats.documentedInterfaces / this.stats.totalInterfaces) * 100).toFixed(1)
        : '100.0'

    const classCoverage =
      this.stats.totalClasses > 0
        ? ((this.stats.documentedClasses / this.stats.totalClasses) * 100).toFixed(1)
        : '100.0'

    const fileOverviewCoverage =
      this.stats.totalFiles > 0
        ? ((this.stats.filesWithFileOverview / this.stats.totalFiles) * 100).toFixed(1)
        : '0.0'

    const paramDocCoverage =
      this.stats.totalFunctions > 0
        ? ((this.stats.functionsWithParamDocs / this.stats.totalFunctions) * 100).toFixed(1)
        : '0.0'

    const returnDocCoverage =
      this.stats.totalFunctions > 0
        ? ((this.stats.functionsWithReturnDocs / this.stats.totalFunctions) * 100).toFixed(1)
        : '0.0'

    const exampleCoverage =
      this.stats.totalFunctions > 0
        ? ((this.stats.functionsWithExamples / this.stats.totalFunctions) * 100).toFixed(1)
        : '0.0'

    return {
      functionCoverage: Number.parseFloat(functionCoverage),
      interfaceCoverage: Number.parseFloat(interfaceCoverage),
      classCoverage: Number.parseFloat(classCoverage),
      fileOverviewCoverage: Number.parseFloat(fileOverviewCoverage),
      paramDocCoverage: Number.parseFloat(paramDocCoverage),
      returnDocCoverage: Number.parseFloat(returnDocCoverage),
      exampleCoverage: Number.parseFloat(exampleCoverage),
    }
  }

  /**
   * レポートを生成
   */
  generateReport() {
    const coverage = this.calculateCoverage()

    console.log('\n📊 ドキュメントカバレッジレポート')
    console.log('=====================================\n')

    console.log('📁 ファイル統計:')
    console.log(`   総ファイル数: ${this.stats.totalFiles}`)
    console.log(
      `   ファイル概要あり: ${this.stats.filesWithFileOverview} (${coverage.fileOverviewCoverage}%)`,
    )
    console.log('')

    console.log('🔧 関数統計:')
    console.log(`   総関数数: ${this.stats.totalFunctions}`)
    console.log(
      `   ドキュメント化済み: ${this.stats.documentedFunctions} (${coverage.functionCoverage}%)`,
    )
    console.log(
      `   @param付き: ${this.stats.functionsWithParamDocs} (${coverage.paramDocCoverage}%)`,
    )
    console.log(
      `   @returns付き: ${this.stats.functionsWithReturnDocs} (${coverage.returnDocCoverage}%)`,
    )
    console.log(
      `   @example付き: ${this.stats.functionsWithExamples} (${coverage.exampleCoverage}%)`,
    )
    console.log('')

    if (this.stats.totalInterfaces > 0) {
      console.log('🏗️ インターフェース統計:')
      console.log(`   総インターフェース数: ${this.stats.totalInterfaces}`)
      console.log(
        `   ドキュメント化済み: ${this.stats.documentedInterfaces} (${coverage.interfaceCoverage}%)`,
      )
      console.log('')
    }

    if (this.stats.totalClasses > 0) {
      console.log('🏛️ クラス統計:')
      console.log(`   総クラス数: ${this.stats.totalClasses}`)
      console.log(
        `   ドキュメント化済み: ${this.stats.documentedClasses} (${coverage.classCoverage}%)`,
      )
      console.log('')
    }

    // 品質評価
    const overallScore = this.calculateOverallScore(coverage)
    console.log('🎯 総合品質スコア:')
    console.log(`   ${overallScore.score}/100 (${overallScore.grade})`)
    console.log('')

    // 問題のあるファイル
    const problemFiles = this.stats.details.filter(file => file.issues.length > 0)
    if (problemFiles.length > 0) {
      console.log('⚠️ 改善が必要なファイル:')
      problemFiles.forEach(file => {
        console.log(`   ${file.file}:`)
        file.issues.forEach(issue => {
          console.log(`     - ${issue}`)
        })
      })
      console.log('')
    }

    // 推奨事項
    this.generateRecommendations(coverage)

    return {
      stats: this.stats,
      coverage,
      overallScore,
    }
  }

  /**
   * 総合品質スコアを計算
   */
  calculateOverallScore(coverage) {
    const weights = {
      function: 0.3,
      interface: 0.2,
      class: 0.2,
      fileOverview: 0.1,
      paramDoc: 0.1,
      returnDoc: 0.1,
    }

    let score = 0
    score += coverage.functionCoverage * weights.function
    score += coverage.interfaceCoverage * weights.interface
    score += coverage.classCoverage * weights.class
    score += coverage.fileOverviewCoverage * weights.fileOverview
    score += coverage.paramDocCoverage * weights.paramDoc
    score += coverage.returnDocCoverage * weights.returnDoc

    const finalScore = Math.round(score)

    let grade
    if (finalScore >= 90) grade = 'A'
    else if (finalScore >= 80) grade = 'B'
    else if (finalScore >= 70) grade = 'C'
    else if (finalScore >= 60) grade = 'D'
    else grade = 'F'

    return { score: finalScore, grade }
  }

  /**
   * 推奨事項を生成
   */
  generateRecommendations(coverage) {
    console.log('💡 推奨事項:')

    const recommendations = []

    if (coverage.functionCoverage < 80) {
      recommendations.push('関数のJSDocコメント率を80%以上に向上させる')
    }

    if (coverage.fileOverviewCoverage < 100) {
      recommendations.push('全ファイルに@fileoverviewコメントを追加する')
    }

    if (coverage.paramDocCoverage < 70) {
      recommendations.push('関数パラメータの@paramドキュメントを充実させる')
    }

    if (coverage.returnDocCoverage < 70) {
      recommendations.push('関数戻り値の@returnsドキュメントを充実させる')
    }

    if (coverage.exampleCoverage < 30) {
      recommendations.push('複雑な関数に@exampleを追加して使用例を提供する')
    }

    if (recommendations.length === 0) {
      console.log('   🎉 ドキュメントの品質は優秀です！')
    } else {
      recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`)
      })
    }
  }

  /**
   * JSON形式でレポートを保存
   */
  saveReport(outputPath) {
    const coverage = this.calculateCoverage()
    const overallScore = this.calculateOverallScore(coverage)

    const report = {
      timestamp: new Date().toISOString(),
      stats: this.stats,
      coverage,
      overallScore,
      summary: {
        totalFiles: this.stats.totalFiles,
        functionCoverage: coverage.functionCoverage,
        overallGrade: overallScore.grade,
      },
    }

    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2))
    console.log(`\n📄 詳細レポートを保存しました: ${outputPath}`)
  }
}

/**
 * 指定ディレクトリのTypeScriptファイルを再帰的に取得
 */
function getTypeScriptFiles(directory, excludePatterns = []) {
  const files = []

  function walkDir(dir) {
    const entries = fs.readdirSync(dir)

    for (const entry of entries) {
      const fullPath = path.join(dir, entry)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        // node_modules, dist, .git などを除外
        if (!['node_modules', 'dist', '.git', 'coverage'].includes(entry)) {
          walkDir(fullPath)
        }
      } else if (fullPath.endsWith('.ts') && !fullPath.endsWith('.d.ts')) {
        // 除外パターンをチェック
        const shouldExclude = excludePatterns.some(pattern => fullPath.includes(pattern))

        if (!shouldExclude) {
          files.push(fullPath)
        }
      }
    }
  }

  walkDir(directory)
  return files
}

/**
 * メイン実行関数
 */
function main() {
  const args = process.argv.slice(2)
  const targetDir = args[0] || 'packages/ai-api'
  const outputPath = args[1] || 'documentation-coverage-report.json'

  console.log(`🔍 ドキュメントカバレッジ測定開始: ${targetDir}`)

  if (!fs.existsSync(targetDir)) {
    console.error(`❌ ディレクトリが見つかりません: ${targetDir}`)
    process.exit(1)
  }

  const analyzer = new DocumentationCoverageAnalyzer()

  // テストファイルを除外してTypeScriptファイルを取得
  const excludePatterns = ['.spec.', '.test.', '__tests__']
  const files = getTypeScriptFiles(targetDir, excludePatterns)

  console.log(`📄 分析対象ファイル数: ${files.length}\n`)

  // 各ファイルを分析
  for (const file of files) {
    try {
      analyzer.analyzeFile(file)
    } catch (error) {
      console.error(`❌ ファイル分析エラー: ${file} - ${error.message}`)
    }
  }

  // レポート生成・表示
  const report = analyzer.generateReport()

  // JSON形式で保存
  analyzer.saveReport(outputPath)

  // 終了コードを設定（カバレッジが低い場合は警告）
  const exitCode = report.overallScore.score >= 70 ? 0 : 1
  process.exit(exitCode)
}

// スクリプトが直接実行された場合のみ実行
if (process.argv[1]?.endsWith('measure-documentation-coverage.js')) {
  main()
}

export { DocumentationCoverageAnalyzer, getTypeScriptFiles }
