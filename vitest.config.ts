import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  test: {
    // Workspace projectsを使用して各パッケージのテストを統合
    projects: [
      // Node.js環境のプロジェクト
      {
        name: 'storage',
        root: './packages/storage',
        test: {
          environment: 'node',
          globals: true,
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            thresholds: {
              lines: 78,
              functions: 78,
              branches: 78,
              statements: 78,
            },
            exclude: ['dist/**', '**/*.spec.ts', '**/*.test.ts', 'vitest.config.ts', 'index.mts'],
          },
        },
      },
      {
        name: 'chrome-extension',
        root: './chrome-extension',
        test: {
          environment: 'node',
          globals: true,
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
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
              'utils/',
              'pre-build.tsconfig.json',
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
      },
      {
        name: 'sample-html',
        root: './dev-servers/sample-html',
        test: {
          environment: 'node',
          globals: true,
        },
      },

      // jsdom環境のプロジェクト
      {
        name: 'ai-api',
        root: './packages/ai-api',
        test: {
          environment: 'jsdom',
          globals: true,
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            exclude: [
              'node_modules/',
              'tests/',
              '**/*.d.ts',
              '**/*.config.*',
              '**/index.ts', // エクスポート専用ファイル
            ],
            thresholds: {
              global: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
              },
            },
          },
        },
        resolve: {
          alias: {
            '@extension/shared': resolve(__dirname, 'packages/shared/lib'),
            '@extension/storage': resolve(__dirname, 'packages/storage/lib'),
          },
        },
      },
      {
        name: 'options',
        root: './pages/options',
        plugins: [react()],
        test: {
          environment: 'jsdom',
          setupFiles: ['./vitest.setup.ts'],
          globals: true,
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            exclude: [
              'node_modules/',
              'dist/',
              'build/',
              '**/*.d.ts',
              '**/*.config.*',
              '**/index.ts',
              '**/*.spec.ts',
              '**/*.test.ts',
              'vitest.setup.ts',
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
        resolve: {
          alias: {
            '@src': resolve(__dirname, 'pages/options/src'),
            '@extension/shared': resolve(__dirname, 'packages/shared/lib'),
            '@extension/storage': resolve(__dirname, 'packages/storage/lib'),
            '@extension/ui': resolve(__dirname, 'packages/ui/lib'),
            '@extension/i18n': resolve(__dirname, 'packages/i18n/lib'),
          },
        },
      },
      {
        name: 'content',
        root: './pages/content',
        test: {
          environment: 'jsdom',
          globals: true,
          coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            reportsDirectory: './coverage',
            exclude: [
              'node_modules/',
              'dist/',
              'build/',
              '**/*.d.ts',
              '**/*.config.*',
              '**/index.ts',
              '**/*.spec.ts',
              '**/*.test.ts',
              'build.mts',
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
      ],
    },
  },
})
