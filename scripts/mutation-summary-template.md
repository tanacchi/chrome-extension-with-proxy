# Mutation Test 分析レポート - LLM用テンプレート

## 概要統計
- **Mutation Score**: ${mutationScore}%
- **総Mutant数**: ${totalMutants}
- **生存Mutant**: ${survivedCount} (${survivedPercent}%)
- **対象ファイル数**: ${fileCount}

## 優先改善対象

### 🎯 重要度順ファイル (Top 5)
${priorityFiles}

### 🧬 頻出Mutatorタイプ (Top 5)  
${topMutators}

## 具体的改善提案

### 💡 即座に実装すべきテスト
1. **ConditionalExpression対応**
   - 条件分岐の true/false 両パターンのテスト
   - 境界値での条件評価テスト
   
2. **ArithmeticOperator対応**
   - 数値演算の境界値テスト (0, 1, -1)
   - オーバーフロー/アンダーフローのテスト

3. **EqualityOperator対応**
   - 厳密等価 (===) と緩い等価 (==) の区別テスト
   - null, undefined, falsy値の比較テスト

### 🔧 ファイル別推奨改善

${fileRecommendations}

## LLM分析用データ

### 生存Mutant詳細サンプル
```javascript
${survivedMutantExamples}
```

### Mutatorパターン分析
${mutatorPatterns}

---

**分析日時**: ${analysisDate}
**元レポートサイズ**: ${originalSize}KB → **要約サイズ**: ${summarySize}KB

## 次のステップ
1. 優先度の高いファイルから順次テスト追加
2. 特定のMutatorタイプに集中した改善
3. 再実行してMutation Scoreの改善を確認