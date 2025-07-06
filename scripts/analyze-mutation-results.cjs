#!/usr/bin/env node

/**
 * @fileoverview Mutation Test結果分析スクリプト
 * 
 * 大容量のMutation TestレポートJSONから、LLMが効率的に分析できる
 * 要約情報を生成します。生存mutantや低スコアファイルを優先度順に抽出し、
 * 具体的な改善アクションを提案します。
 * 
 * @author Chrome Extension Development Team
 * @since 1.0.0
 */

const fs = require('fs');
const path = require('path');

// コマンドライン引数の解析
const args = process.argv.slice(2);
const isHelpRequested = args.includes('--help') || args.includes('-h');
const isSummaryMode = args.includes('--summary');
const isPriorityMode = args.includes('--priority-only');
const fileFilter = args.find(arg => arg.startsWith('--file='))?.split('=')[1];
const mutatorFilter = args.find(arg => arg.startsWith('--mutator='))?.split('=')[1];

// ヘルプメッセージ
if (isHelpRequested) {
  console.log(`
Mutation Test 結果分析ツール

使用方法:
  node scripts/analyze-mutation-results.cjs [オプション]

オプション:
  --help, -h           このヘルプを表示
  --summary            全体要約のみ表示
  --priority-only      優先度の高い問題のみ表示
  --file=<path>        特定ファイルのみ分析
  --mutator=<type>     特定mutatorタイプのみ分析

例:
  node scripts/analyze-mutation-results.cjs --summary
  node scripts/analyze-mutation-results.cjs --file=packages/storage/lib/storage.ts
  node scripts/analyze-mutation-results.cjs --mutator=ConditionalExpression
`);
  process.exit(0);
}

// レポートファイルのパス
const REPORT_PATH = path.join(process.cwd(), 'reports/mutation/mutation.json');

// レポートファイルの存在確認
if (!fs.existsSync(REPORT_PATH)) {
  console.error(`❌ Mutation testレポートが見つかりません: ${REPORT_PATH}`);
  console.error('先にmutation testを実行してください: pnpm mutation-test');
  process.exit(1);
}

/**
 * JSONレポートを読み込み
 */
function loadMutationReport() {
  try {
    const reportData = fs.readFileSync(REPORT_PATH, 'utf8');
    return JSON.parse(reportData);
  } catch (error) {
    console.error(`❌ レポートファイルの読み込みに失敗: ${error.message}`);
    process.exit(1);
  }
}

/**
 * 全体統計を計算
 */
function calculateOverallStats(report) {
  const stats = {
    totalMutants: 0,
    killed: 0,
    survived: 0,
    noCoverage: 0,
    timeout: 0,
    compileError: 0,
    runtimeError: 0,
    mutationScore: report.mutationScore || 0,
    fileCount: Object.keys(report.files || {}).length
  };

  Object.values(report.files || {}).forEach(file => {
    file.mutants?.forEach(mutant => {
      stats.totalMutants++;
      switch (mutant.status) {
        case 'Killed':
          stats.killed++;
          break;
        case 'Survived':
          stats.survived++;
          break;
        case 'NoCoverage':
          stats.noCoverage++;
          break;
        case 'Timeout':
          stats.timeout++;
          break;
        case 'CompileError':
          stats.compileError++;
          break;
        case 'RuntimeError':
          stats.runtimeError++;
          break;
      }
    });
  });

  return stats;
}

/**
 * ファイル別の統計を計算
 */
function calculateFileStats(report) {
  const fileStats = [];

  Object.entries(report.files || {}).forEach(([filePath, fileData]) => {
    const mutants = fileData.mutants || [];
    const survived = mutants.filter(m => m.status === 'Survived');
    const killed = mutants.filter(m => m.status === 'Killed');
    const noCoverage = mutants.filter(m => m.status === 'NoCoverage');

    fileStats.push({
      filePath,
      mutationScore: fileData.mutationScore || 0,
      totalMutants: mutants.length,
      survivedCount: survived.length,
      killedCount: killed.length,
      noCoverageCount: noCoverage.length,
      survivedMutants: survived
    });
  });

  return fileStats.sort((a, b) => a.mutationScore - b.mutationScore);
}

/**
 * 生存mutantをmutatorタイプ別にグループ化
 */
function groupSurvivedMutantsByType(fileStats) {
  const mutatorGroups = {};

  fileStats.forEach(file => {
    file.survivedMutants.forEach(mutant => {
      const mutatorName = mutant.mutatorName || 'Unknown';
      if (!mutatorGroups[mutatorName]) {
        mutatorGroups[mutatorName] = {
          count: 0,
          files: new Set(),
          examples: []
        };
      }
      mutatorGroups[mutatorName].count++;
      mutatorGroups[mutatorName].files.add(file.filePath);
      if (mutatorGroups[mutatorName].examples.length < 3) {
        mutatorGroups[mutatorName].examples.push({
          file: file.filePath,
          location: mutant.location,
          original: mutant.originalLines,
          mutated: mutant.mutatedLines
        });
      }
    });
  });

  return Object.entries(mutatorGroups)
    .map(([name, data]) => ({
      mutatorName: name,
      count: data.count,
      fileCount: data.files.size,
      examples: data.examples
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 優先度に基づいてファイルをランク付け
 */
function prioritizeFiles(fileStats) {
  return fileStats
    .filter(file => file.survivedCount > 0)
    .map(file => ({
      ...file,
      priority: calculatePriority(file)
    }))
    .sort((a, b) => b.priority - a.priority);
}

/**
 * ファイルの優先度を計算
 */
function calculatePriority(fileStats) {
  // 生存mutant数、mutation scoreの低さ、総mutant数を考慮
  const survivedWeight = fileStats.survivedCount * 2;
  const scoreWeight = (100 - fileStats.mutationScore) / 10;
  const volumeWeight = Math.log(fileStats.totalMutants + 1);
  
  return survivedWeight + scoreWeight + volumeWeight;
}

/**
 * 改善推奨事項を生成
 */
function generateRecommendations(mutatorGroups, prioritizedFiles) {
  const recommendations = [];

  // 頻出mutatorに対する推奨事項
  mutatorGroups.slice(0, 3).forEach(group => {
    let suggestion = '';
    switch (group.mutatorName) {
      case 'ConditionalExpression':
        suggestion = 'boolean条件の境界値テストを追加。true/falseの両方のケースを網羅';
        break;
      case 'ArithmeticOperator':
        suggestion = '数値演算の境界値テスト（0, 1, -1, 最大値/最小値）を追加';
        break;
      case 'EqualityOperator':
        suggestion = '等価比較の全パターン（==, !=, ===, !==）をテスト';
        break;
      case 'LogicalOperator':
        suggestion = 'AND/OR演算子の短絡評価をテスト。両方の条件の組み合わせを網羅';
        break;
      case 'StringLiteral':
        suggestion = '文字列の境界値（空文字、null、undefined、特殊文字）をテスト';
        break;
      default:
        suggestion = `${group.mutatorName}に対するエッジケースを特定してテストを追加`;
    }

    recommendations.push({
      type: 'mutator',
      mutatorName: group.mutatorName,
      count: group.count,
      fileCount: group.fileCount,
      suggestion
    });
  });

  // 優先度の高いファイルに対する推奨事項
  prioritizedFiles.slice(0, 5).forEach(file => {
    recommendations.push({
      type: 'file',
      filePath: file.filePath,
      survivedCount: file.survivedCount,
      mutationScore: file.mutationScore,
      suggestion: `${file.survivedCount}個の生存mutantを解決。特に条件分岐とエラーハンドリングのテストを強化`
    });
  });

  return recommendations;
}

/**
 * 要約レポートを出力
 */
function printSummaryReport(stats, prioritizedFiles, mutatorGroups, recommendations) {
  console.log('\n🔬 Mutation Test 分析結果要約\n');
  
  // 全体統計
  console.log('📊 全体統計:');
  console.log(`  Mutation Score: ${stats.mutationScore.toFixed(1)}%`);
  console.log(`  総Mutant数: ${stats.totalMutants}`);
  console.log(`  ├─ 除去成功: ${stats.killed} (${(stats.killed/stats.totalMutants*100).toFixed(1)}%)`);
  console.log(`  ├─ 生存: ${stats.survived} (${(stats.survived/stats.totalMutants*100).toFixed(1)}%)`);
  console.log(`  └─ カバレッジなし: ${stats.noCoverage} (${(stats.noCoverage/stats.totalMutants*100).toFixed(1)}%)`);
  console.log(`  対象ファイル数: ${stats.fileCount}`);

  // 優先改善ファイル
  console.log('\n🎯 優先改善ファイル (Top 5):');
  prioritizedFiles.slice(0, 5).forEach((file, index) => {
    console.log(`  ${index + 1}. ${file.filePath}`);
    console.log(`     Score: ${file.mutationScore.toFixed(1)}% | 生存: ${file.survivedCount} | 優先度: ${file.priority.toFixed(1)}`);
  });

  // 頻出mutatorタイプ
  console.log('\n🧬 頻出Mutatorタイプ (Top 5):');
  mutatorGroups.slice(0, 5).forEach((group, index) => {
    console.log(`  ${index + 1}. ${group.mutatorName}: ${group.count}件 (${group.fileCount}ファイル)`);
  });

  // 推奨改善アクション
  console.log('\n💡 推奨改善アクション:');
  recommendations.slice(0, 8).forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec.suggestion}`);
    if (rec.type === 'mutator') {
      console.log(`     → ${rec.mutatorName} (${rec.count}件)`);
    } else if (rec.type === 'file') {
      console.log(`     → ${rec.filePath} (Score: ${rec.mutationScore.toFixed(1)}%)`);
    }
  });
}

/**
 * 詳細レポートを出力
 */
function printDetailedReport(fileStats, mutatorGroups) {
  console.log('\n📋 詳細分析結果\n');

  // 低スコアファイルの詳細
  console.log('🔍 低Mutation Scoreファイル詳細:');
  fileStats
    .filter(file => file.mutationScore < 80 && file.survivedCount > 0)
    .slice(0, 10)
    .forEach(file => {
      console.log(`\n  📁 ${file.filePath}`);
      console.log(`     Score: ${file.mutationScore.toFixed(1)}% | 生存: ${file.survivedCount}/${file.totalMutants}`);
      
      // 生存mutantの詳細（最大3件）
      file.survivedMutants.slice(0, 3).forEach(mutant => {
        console.log(`     🧬 ${mutant.mutatorName} @ line ${mutant.location?.start?.line || '?'}`);
        if (mutant.originalLines && mutant.mutatedLines) {
          console.log(`        Original: ${mutant.originalLines.trim()}`);
          console.log(`        Mutated:  ${mutant.mutatedLines.trim()}`);
        }
      });
      
      if (file.survivedMutants.length > 3) {
        console.log(`     ... 他 ${file.survivedMutants.length - 3}件`);
      }
    });

  // mutatorタイプ別詳細
  console.log('\n\n🧬 Mutatorタイプ別詳細:');
  mutatorGroups.slice(0, 5).forEach(group => {
    console.log(`\n  ${group.mutatorName} (${group.count}件, ${group.fileCount}ファイル):`);
    group.examples.forEach(example => {
      console.log(`    📁 ${example.file} @ line ${example.location?.start?.line || '?'}`);
      if (example.original && example.mutated) {
        console.log(`       Original: ${example.original.trim()}`);
        console.log(`       Mutated:  ${example.mutated.trim()}`);
      }
    });
  });
}

/**
 * メイン処理
 */
function main() {
  console.log('🔬 Mutation Test結果を分析中...');
  
  const report = loadMutationReport();
  const stats = calculateOverallStats(report);
  const fileStats = calculateFileStats(report);
  const mutatorGroups = groupSurvivedMutantsByType(fileStats);
  const prioritizedFiles = prioritizeFiles(fileStats);
  const recommendations = generateRecommendations(mutatorGroups, prioritizedFiles);

  // フィルタリング適用
  let filteredFileStats = fileStats;
  let filteredMutatorGroups = mutatorGroups;

  if (fileFilter) {
    filteredFileStats = fileStats.filter(file => file.filePath.includes(fileFilter));
    console.log(`\n📁 ファイルフィルタ適用: ${fileFilter}`);
  }

  if (mutatorFilter) {
    filteredMutatorGroups = mutatorGroups.filter(group => 
      group.mutatorName.toLowerCase().includes(mutatorFilter.toLowerCase())
    );
    console.log(`\n🧬 Mutatorフィルタ適用: ${mutatorFilter}`);
  }

  // 出力モード別の処理
  if (isSummaryMode || isPriorityMode) {
    printSummaryReport(stats, prioritizedFiles, mutatorGroups, recommendations);
  } else {
    printSummaryReport(stats, prioritizedFiles, mutatorGroups, recommendations);
    printDetailedReport(filteredFileStats, filteredMutatorGroups);
  }

  // 追加の統計情報
  console.log(`\n📈 分析完了: ${stats.totalMutants}個のmutantを分析`);
  console.log(`   生存mutant解決により最大 ${((stats.survived / stats.totalMutants) * 100).toFixed(1)}% の改善が可能`);
}

// スクリプト実行
if (require.main === module) {
  main();
}

module.exports = {
  loadMutationReport,
  calculateOverallStats,
  calculateFileStats,
  groupSurvivedMutantsByType,
  prioritizeFiles,
  generateRecommendations
};