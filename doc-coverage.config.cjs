/**
 * ドキュメントカバレッジ測定設定
 *
 * JSDocコメントの網羅率を測定し、不足しているドキュメントを特定します。
 * jsdoc-to-markdownを使用してJSDocコメントを解析し、カバレッジレポートを生成します。
 */

module.exports = {
  // 対象ファイルのパターン
  input: [
    'pages/content/src/**/*.ts',
    'pages/options/src/**/*.tsx',
    'pages/popup/src/**/*.tsx',
    'packages/storage/lib/**/*.ts',
    'chrome-extension/src/**/*.ts',
  ],

  // 除外するファイル
  exclude: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '**/*.d.ts',
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
  ],

  // 出力設定
  output: {
    directory: 'docs/coverage',
    format: 'markdown',
    filename: 'documentation-coverage.md',
  },

  // カバレッジの閾値設定
  thresholds: {
    // 全体のドキュメントカバレッジ最小値（パーセント）
    global: 80,

    // ファイル単位のドキュメントカバレッジ最小値
    perFile: 70,

    // 関数のドキュメントカバレッジ最小値
    functions: 90,

    // クラスのドキュメントカバレッジ最小値
    classes: 95,
  },

  // 必須とするJSDocタグ
  requiredTags: [
    'description', // 関数・クラスの説明
    'param', // パラメータの説明（パラメータがある場合）
    'returns', // 戻り値の説明（戻り値がある場合）
    'since', // バージョン情報
    'example', // 使用例（パブリック関数の場合）
  ],

  // レポート生成設定
  reporting: {
    // 詳細レポートを生成するか
    detailed: true,

    // 不足しているドキュメントの一覧を含むか
    includeMissing: true,

    // コンソール出力の詳細レベル
    verbosity: 'normal', // 'silent', 'normal', 'verbose'
  },
}
