import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

/**
 * 共通のカバレッジ設定
 */
export const commonCoverageConfig = {
  provider: 'v8' as const,
  reporter: ['text', 'json', 'html'] as const,
  exclude: [
    'node_modules/',
    'dist/',
    'build/',
    '**/*.d.ts',
    '**/*.config.*',
    '**/index.ts',
    '**/*.spec.ts',
    '**/*.test.ts',
  ],
}

/**
 * 共通のテスト設定
 */
export const commonTestConfig = {
  globals: true,
  coverage: commonCoverageConfig,
}

/**
 * Node環境用の設定
 */
export const nodeTestConfig = {
  ...commonTestConfig,
  environment: 'node' as const,
}

/**
 * jsdom環境用の設定
 */
export const jsdomTestConfig = {
  ...commonTestConfig,
  environment: 'jsdom' as const,
}

/**
 * カバレッジ閾値設定
 */
export const coverageThresholds = {
  storage: {
    lines: 78,
    functions: 78,
    branches: 78,
    statements: 78,
  },
  aiApi: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  options: {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75,
  },
  content: {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75,
  },
  chromeExtension: {
    branches: 75,
    functions: 75,
    lines: 75,
    statements: 75,
  },
}

/**
 * プロジェクト固有の除外設定
 */
export const projectExcludes = {
  storage: ['dist/**', 'index.mts'],
  aiApi: ['tests/', '**/index.ts'],
  options: ['vitest.setup.ts'],
  content: ['build.mts'],
  chromeExtension: ['scripts/', 'utils/', 'pre-build.tsconfig.json'],
}

/**
 * エイリアス設定のヘルパー
 */
export const createAliases = (baseDir: string) => ({
  '@extension/shared': resolve(baseDir, 'packages/shared/lib'),
  '@extension/storage': resolve(baseDir, 'packages/storage/lib'),
  '@extension/ui': resolve(baseDir, 'packages/ui/lib'),
  '@extension/i18n': resolve(baseDir, 'packages/i18n/lib'),
})

/**
 * プロジェクト固有の設定を作成するヘルパー
 */
export const createProjectConfig = (
  name: string,
  environment: 'node' | 'jsdom',
  include: string[],
  options: {
    thresholds?: Record<string, number>
    exclude?: string[]
    setupFiles?: string[]
    plugins?: any[]
    resolve?: any
  } = {},
) => {
  const baseConfig = environment === 'node' ? nodeTestConfig : jsdomTestConfig

  return {
    test: {
      ...baseConfig,
      name,
      include,
      ...(options.setupFiles && { setupFiles: options.setupFiles }),
      coverage: {
        ...baseConfig.coverage,
        ...(options.exclude && {
          exclude: [...baseConfig.coverage.exclude, ...options.exclude],
        }),
        ...(options.thresholds && {
          thresholds: {
            global: options.thresholds,
          },
        }),
      },
    },
    ...(options.plugins && { plugins: options.plugins }),
    ...(options.resolve && { resolve: options.resolve }),
  }
}
