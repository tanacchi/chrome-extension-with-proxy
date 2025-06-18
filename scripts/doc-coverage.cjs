#!/usr/bin/env node

/**
 * ドキュメントカバレッジ測定スクリプト
 *
 * このスクリプトは、プロジェクト内のJSDocコメントの網羅率を測定し、
 * 不足しているドキュメントを特定してレポートを生成します。
 *
 * 使用例:
 * - カバレッジ測定: node scripts/doc-coverage.js
 * - 詳細レポート: node scripts/doc-coverage.js --detailed
 * - 閾値チェック: node scripts/doc-coverage.js --check
 *
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

/**
 * ドキュメントカバレッジ測定クラス
 *
 * JSDocコメントの解析とカバレッジ計算を行います。
 */
class DocumentationCoverage {
  constructor() {
    this.config = this.loadConfig();
    this.results = {
      totalFiles: 0,
      documentedFiles: 0,
      totalFunctions: 0,
      documentedFunctions: 0,
      totalClasses: 0,
      documentedClasses: 0,
      files: [],
    };
  }

  /**
   * 設定ファイルを読み込む
   *
   * @returns {Object} 設定オブジェクト
   */
  loadConfig() {
    const configPath = path.join(process.cwd(), 'doc-coverage.config.cjs');
    if (!fs.existsSync(configPath)) {
      console.warn('設定ファイルが見つかりません。デフォルト設定を使用します。');
      return this.getDefaultConfig();
    }
    return require(configPath);
  }

  /**
   * デフォルト設定を取得する
   *
   * @returns {Object} デフォルト設定オブジェクト
   */
  getDefaultConfig() {
    return {
      input: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      exclude: ['**/*.spec.ts', '**/*.test.ts', '**/node_modules/**'],
      thresholds: { global: 80, perFile: 70, functions: 90, classes: 95 },
      requiredTags: ['description', 'param', 'returns', 'since'],
      reporting: { detailed: true, includeMissing: true, verbosity: 'normal' },
    };
  }

  /**
   * 対象ファイルを収集する
   *
   * @returns {string[]} ファイルパスの配列
   */
  collectFiles() {
    const files = [];

    for (const pattern of this.config.input) {
      const matchedFiles = glob.sync(pattern, {
        ignore: this.config.exclude,
        absolute: true,
      });
      files.push(...matchedFiles);
    }

    // 重複を除去
    return [...new Set(files)];
  }

  /**
   * ファイルのJSDocデータを解析する
   *
   * @param {string} filePath - 解析対象ファイルのパス
   * @returns {Object} 解析結果
   */
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');

      const analysis = {
        path: filePath,
        functions: [],
        classes: [],
        exports: [],
        totalItems: 0,
        documentedItems: 0,
        coverage: 0,
        missingDocs: [],
      };

      // 関数（アロー関数とexport const）を検出
      const functionRegex =
        /export\s+const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:\([^)]*\)\s*=>\s*\{|async\s*\([^)]*\)\s*=>\s*\{)/g;
      let match;

      while ((match = functionRegex.exec(content)) !== null) {
        const functionName = match[1];
        const beforeFunction = content.substring(0, match.index);
        const hasJSDoc = this.hasJSDocComment(beforeFunction, functionName);

        analysis.functions.push({
          name: functionName,
          documented: hasJSDoc,
          missing: hasJSDoc ? [] : ['JSDoc comment'],
        });
      }

      // クラスを検出
      const classRegex = /export\s+class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((match = classRegex.exec(content)) !== null) {
        const className = match[1];
        const beforeClass = content.substring(0, match.index);
        const hasJSDoc = this.hasJSDocComment(beforeClass, className);

        analysis.classes.push({
          name: className,
          documented: hasJSDoc,
          missing: hasJSDoc ? [] : ['JSDoc comment'],
        });
      }

      // カバレッジを計算
      analysis.totalItems = analysis.functions.length + analysis.classes.length;
      analysis.documentedItems =
        analysis.functions.filter(f => f.documented).length + analysis.classes.filter(c => c.documented).length;
      analysis.coverage = analysis.totalItems > 0 ? (analysis.documentedItems / analysis.totalItems) * 100 : 100;

      // 不足項目を集計
      analysis.missingDocs = [
        ...analysis.functions.filter(f => !f.documented).map(f => `関数: ${f.name}`),
        ...analysis.classes.filter(c => !c.documented).map(c => `クラス: ${c.name}`),
      ];

      return analysis;
    } catch (error) {
      console.warn(`ファイル解析エラー: ${filePath}`, error.message);
      return null;
    }
  }

  /**
   * 指定された要素の前にJSDocコメントが存在するかチェック
   *
   * @param {string} beforeContent - 要素より前のコンテンツ
   * @param {string} elementName - 要素名
   * @returns {boolean} JSDocコメントが存在するかどうか
   */
  hasJSDocComment(beforeContent) {
    // 最後のJSDocコメントを探す
    const jsdocRegex = /\/\*\*([\s\S]*?)\*\//g;
    const matches = [...beforeContent.matchAll(jsdocRegex)];

    if (matches.length === 0) return false;

    // 最後のJSDocコメントを取得
    const lastMatch = matches[matches.length - 1];
    const lastJSDocEnd = lastMatch.index + lastMatch[0].length;

    // JSDocコメントの後に空白文字以外があるかチェック
    const afterJSDoc = beforeContent.substring(lastJSDocEnd);
    const hasCodeBetween = /[^\s]/.test(afterJSDoc);

    return !hasCodeBetween;
  }

  /**
   * JSDocアイテムが十分にドキュメント化されているかチェック
   *
   * @param {Object} item - JSDocアイテム
   * @returns {boolean} ドキュメント化されているかどうか
   */
  isWellDocumented(item) {
    // 基本的な説明があるかチェック
    if (!item.description) return false;

    // パラメータがある場合、パラメータの説明があるかチェック
    if (item.params && item.params.length > 0) {
      const documentedParams = item.params.filter(p => p.description);
      if (documentedParams.length !== item.params.length) return false;
    }

    // 戻り値がある場合、戻り値の説明があるかチェック
    if (item.returns && item.returns.length > 0) {
      const documentedReturns = item.returns.filter(r => r.description);
      if (documentedReturns.length === 0) return false;
    }

    return true;
  }

  /**
   * 不足しているJSDocタグを取得
   *
   * @param {Object} item - JSDocアイテム
   * @returns {string[]} 不足しているタグの配列
   */
  getMissingTags(item) {
    const missing = [];

    if (!item.description) missing.push('description');
    if (item.params && item.params.length > 0) {
      const undocumentedParams = item.params.filter(p => !p.description);
      if (undocumentedParams.length > 0) {
        missing.push(`param (${undocumentedParams.map(p => p.name).join(', ')})`);
      }
    }
    if (item.returns && item.returns.length > 0 && !item.returns[0].description) {
      missing.push('returns');
    }

    return missing;
  }

  /**
   * カバレッジ測定を実行する
   *
   * @returns {Object} 測定結果
   */
  run() {
    console.log('📊 ドキュメントカバレッジ測定を開始します...\n');

    const files = this.collectFiles();
    console.log(`対象ファイル数: ${files.length}`);

    for (const file of files) {
      const analysis = this.analyzeFile(file);
      if (analysis) {
        this.results.files.push(analysis);
        this.results.totalFiles++;

        if (analysis.coverage >= this.config.thresholds.perFile) {
          this.results.documentedFiles++;
        }

        this.results.totalFunctions += analysis.functions.length;
        this.results.documentedFunctions += analysis.functions.filter(f => f.documented).length;

        this.results.totalClasses += analysis.classes.length;
        this.results.documentedClasses += analysis.classes.filter(c => c.documented).length;
      }
    }

    // 全体のカバレッジを計算
    this.results.globalCoverage =
      this.results.totalFiles > 0 ? (this.results.documentedFiles / this.results.totalFiles) * 100 : 100;

    this.results.functionCoverage =
      this.results.totalFunctions > 0 ? (this.results.documentedFunctions / this.results.totalFunctions) * 100 : 100;

    this.results.classCoverage =
      this.results.totalClasses > 0 ? (this.results.documentedClasses / this.results.totalClasses) * 100 : 100;

    return this.results;
  }

  /**
   * レポートを生成・出力する
   *
   * @param {Object} results - 測定結果
   */
  generateReport(results) {
    console.log('\n📋 ドキュメントカバレッジレポート');
    console.log('='.repeat(50));

    console.log(`\n📊 全体統計:`);
    console.log(`  総ファイル数: ${results.totalFiles}`);
    console.log(`  ドキュメント化済みファイル数: ${results.documentedFiles}`);
    console.log(`  全体カバレッジ: ${results.globalCoverage.toFixed(1)}%`);

    console.log(`\n🔧 関数統計:`);
    console.log(`  総関数数: ${results.totalFunctions}`);
    console.log(`  ドキュメント化済み関数数: ${results.documentedFunctions}`);
    console.log(`  関数カバレッジ: ${results.functionCoverage.toFixed(1)}%`);

    console.log(`\n🏗️  クラス統計:`);
    console.log(`  総クラス数: ${results.totalClasses}`);
    console.log(`  ドキュメント化済みクラス数: ${results.documentedClasses}`);
    console.log(`  クラスカバレッジ: ${results.classCoverage.toFixed(1)}%`);

    // 閾値チェック
    console.log(`\n🎯 閾値チェック:`);
    this.checkThresholds(results);

    // 詳細レポート
    if (this.config.reporting.detailed) {
      this.generateDetailedReport(results);
    }
  }

  /**
   * 閾値をチェックし、結果を表示する
   *
   * @param {Object} results - 測定結果
   */
  checkThresholds(results) {
    const checks = [
      {
        name: '全体カバレッジ',
        value: results.globalCoverage,
        threshold: this.config.thresholds.global,
      },
      {
        name: '関数カバレッジ',
        value: results.functionCoverage,
        threshold: this.config.thresholds.functions,
      },
      {
        name: 'クラスカバレッジ',
        value: results.classCoverage,
        threshold: this.config.thresholds.classes,
      },
    ];

    let allPassed = true;

    checks.forEach(check => {
      const passed = check.value >= check.threshold;
      const status = passed ? '✅' : '❌';
      console.log(`  ${status} ${check.name}: ${check.value.toFixed(1)}% (閾値: ${check.threshold}%)`);
      if (!passed) allPassed = false;
    });

    if (allPassed) {
      console.log('\n🎉 すべての閾値をクリアしています！');
    } else {
      console.log('\n⚠️  一部の閾値を下回っています。ドキュメントの追加を検討してください。');
    }
  }

  /**
   * 詳細レポートを生成する
   *
   * @param {Object} results - 測定結果
   */
  generateDetailedReport(results) {
    console.log('\n📄 ファイル別詳細:');

    const lowCoverageFiles = results.files
      .filter(file => file.coverage < this.config.thresholds.perFile)
      .sort((a, b) => a.coverage - b.coverage);

    if (lowCoverageFiles.length > 0) {
      console.log('\n⚠️  カバレッジが低いファイル:');
      lowCoverageFiles.forEach(file => {
        const relativePath = path.relative(process.cwd(), file.path);
        console.log(`  📁 ${relativePath} (${file.coverage.toFixed(1)}%)`);

        if (this.config.reporting.includeMissing && file.missingDocs.length > 0) {
          console.log(`     不足項目: ${file.missingDocs.join(', ')}`);
        }
      });
    } else {
      console.log('\n✅ すべてのファイルが閾値をクリアしています！');
    }
  }
}

/**
 * メイン実行関数
 */
function main() {
  try {
    const coverage = new DocumentationCoverage();
    const results = coverage.run();
    coverage.generateReport(results);

    // 閾値チェックが有効な場合、失敗時に終了コード1で終了
    const args = process.argv.slice(2);
    if (args.includes('--check')) {
      const globalPassed = results.globalCoverage >= coverage.config.thresholds.global;
      const functionPassed = results.functionCoverage >= coverage.config.thresholds.functions;
      const classPassed = results.classCoverage >= coverage.config.thresholds.classes;

      if (!globalPassed || !functionPassed || !classPassed) {
        process.exit(1);
      }
    }
  } catch (error) {
    console.error('❌ ドキュメントカバレッジ測定中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = DocumentationCoverage;
