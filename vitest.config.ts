import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Workspace projectsを使用して各パッケージのテストを統合
    projects: [
      // Node.js環境のプロジェクト
      {
        root: './packages/storage',
        test: {
          environment: 'node',
          globals: true,
        },
      },
      {
        root: './chrome-extension',
        test: {
          environment: 'node',
          globals: true,
        },
      },
      {
        root: './dev-servers/sample-html',
        test: {
          environment: 'node',
          globals: true,
        },
      },

      // jsdom環境のプロジェクト
      {
        root: './packages/ai-api',
        test: {
          environment: 'jsdom',
          globals: true,
        },
        resolve: {
          alias: {
            '@extension/shared': resolve(__dirname, 'packages/shared/index.mts'),
            '@extension/shared/utils': resolve(__dirname, 'packages/shared/lib/utils'),
            '@extension/shared/hooks': resolve(__dirname, 'packages/shared/lib/hooks'),
            '@extension/shared/hoc': resolve(__dirname, 'packages/shared/lib/hoc'),
            '@extension/storage': resolve(__dirname, 'packages/storage/lib'),
          },
        },
      },
      {
        root: './pages/options',
        plugins: [react()],
        test: {
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          globals: true,
        },
        resolve: {
          alias: {
            '@src': resolve(__dirname, 'pages/options/src'),
            '@extension/shared': resolve(__dirname, 'packages/shared/index.mts'),
            '@extension/shared/utils': resolve(__dirname, 'packages/shared/lib/utils'),
            '@extension/shared/hooks': resolve(__dirname, 'packages/shared/lib/hooks'),
            '@extension/shared/hoc': resolve(__dirname, 'packages/shared/lib/hoc'),
            '@extension/storage': resolve(__dirname, 'packages/storage/lib'),
            '@extension/ui': resolve(__dirname, 'packages/ui/lib'),
            '@extension/i18n': resolve(__dirname, 'packages/i18n/lib'),
          },
        },
      },
      {
        root: './pages/content',
        test: {
          environment: 'jsdom',
          globals: true,
        },
      },
      {
        root: './pages/content-runtime',
        test: {
          environment: 'jsdom',
          globals: true,
        },
      },
      {
        root: './pages/content-ui',
        test: {
          environment: 'jsdom',
          globals: true,
        },
      },
      {
        root: './pages/devtools',
        test: {
          environment: 'jsdom',
          globals: true,
        },
      },
      {
        root: './pages/devtools-panel',
        test: {
          environment: 'jsdom',
          globals: true,
        },
      },
      {
        root: './pages/new-tab',
        plugins: [react()],
        test: {
          environment: 'jsdom',
          globals: true,
        },
        resolve: {
          alias: {
            '@src': resolve(__dirname, 'pages/new-tab/src'),
            '@extension/shared': resolve(__dirname, 'packages/shared/index.mts'),
            '@extension/shared/utils': resolve(__dirname, 'packages/shared/lib/utils'),
            '@extension/shared/hooks': resolve(__dirname, 'packages/shared/lib/hooks'),
            '@extension/shared/hoc': resolve(__dirname, 'packages/shared/lib/hoc'),
            '@extension/storage': resolve(__dirname, 'packages/storage/lib'),
            '@extension/ui': resolve(__dirname, 'packages/ui/lib'),
            '@extension/i18n': resolve(__dirname, 'packages/i18n/lib'),
          },
        },
      },
      {
        root: './pages/popup',
        plugins: [react()],
        test: {
          environment: 'jsdom',
          globals: true,
        },
        resolve: {
          alias: {
            '@src': resolve(__dirname, 'pages/popup/src'),
            '@extension/shared': resolve(__dirname, 'packages/shared/index.mts'),
            '@extension/shared/utils': resolve(__dirname, 'packages/shared/lib/utils'),
            '@extension/shared/hooks': resolve(__dirname, 'packages/shared/lib/hooks'),
            '@extension/shared/hoc': resolve(__dirname, 'packages/shared/lib/hoc'),
            '@extension/storage': resolve(__dirname, 'packages/storage/lib'),
            '@extension/ui': resolve(__dirname, 'packages/ui/lib'),
            '@extension/i18n': resolve(__dirname, 'packages/i18n/lib'),
          },
        },
      },
      {
        root: './pages/side-panel',
        plugins: [react()],
        test: {
          environment: 'jsdom',
          globals: true,
        },
        resolve: {
          alias: {
            '@src': resolve(__dirname, 'pages/side-panel/src'),
            '@extension/shared': resolve(__dirname, 'packages/shared/index.mts'),
            '@extension/shared/utils': resolve(__dirname, 'packages/shared/lib/utils'),
            '@extension/shared/hooks': resolve(__dirname, 'packages/shared/lib/hooks'),
            '@extension/shared/hoc': resolve(__dirname, 'packages/shared/lib/hoc'),
            '@extension/storage': resolve(__dirname, 'packages/storage/lib'),
            '@extension/ui': resolve(__dirname, 'packages/ui/lib'),
            '@extension/i18n': resolve(__dirname, 'packages/i18n/lib'),
          },
        },
      },
    ],

    // 統合カバレッジ設定
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true,
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        'scripts/',
        'tests/e2e/',
        'dev-servers/',
        '.turbo/',
        'coverage/',
        'build.mts',
        '**/*.js',
        'public/',
        'src/assets/',
        'manifest.*',
        'vite.config.*',
        'rollup.config.*',
        'tailwind.config.*',
        'tsconfig.json',
        'chrome-extension/src/background/',
        'packages/ui/lib/components/ui/',
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75,
        },
      },
    },
  },
})
