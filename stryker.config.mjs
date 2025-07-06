// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  _comment:
    "Chrome Extension project mutation testing configuration",
  packageManager: "pnpm",
  reporters: ["html", "clear-text", "progress", "json"],
  testRunner: "vitest",
  testRunner_comment:
    "Using vitest workspace configuration for unified testing",
  coverageAnalysis: "perTest",
  plugins: ["@stryker-mutator/vitest-runner"],
  
  // Biome設定ファイルを一時ディレクトリから除外
  ignorePatterns: [
    "biome.json",
    "**/.biomejs.json",
    "**/biome.json"
  ],
  
  
  // プロジェクト全体のmutation対象を指定
  mutate: [
    "packages/storage/lib/**/*.ts",
    "packages/ai-api/lib/**/*.ts", 
    "pages/options/src/**/*.{ts,tsx}",
    "pages/content/src/**/*.ts",
    "chrome-extension/src/**/*.ts",
    "dev-servers/sample-html/**/*.js",
    // 除外パターン
    "!**/*.spec.ts",
    "!**/*.test.ts",
    "!**/*.d.ts",
    "!**/index.ts",
    "!**/*.config.*"
  ],
  
  // テスト実行設定
  vitest: {
    configFile: "vitest.config.ts"
  },
  
  // しきい値設定
  thresholds: {
    high: 80,
    low: 60, 
    break: 50
  },
  
  // パフォーマンス最適化
  concurrency: 4,
  timeoutMS: 60000,
  
  // レポート出力先
  htmlReporter: {
    fileName: "reports/stryker.html"
  },
  
  // ログレベル
  logLevel: "info",
  
  // 一時ディレクトリ
  tempDirName: ".stryker-tmp"
};
export default config;
