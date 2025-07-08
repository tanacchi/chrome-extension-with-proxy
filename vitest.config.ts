import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  test: {
    projects: [
      // src配下すべてを統合プロジェクト
      {
        root: './src',
        plugins: [react()],
        test: {
          environment: 'jsdom',
          globals: true,
        },
        resolve: {
          alias: {
            '@extension/shared': resolve(__dirname, 'src/lib/shared/lib'),
            '@extension/storage': resolve(__dirname, 'src/lib/storage/lib'),
            '@extension/ui': resolve(__dirname, 'src/lib/ui/lib'),
            '@extension/i18n': resolve(__dirname, 'src/lib/i18n/lib'),
            '@extension/ai-api': resolve(__dirname, 'src/lib/ai-api/lib'),
          },
        },
      },
      // dev-serversプロジェクト
      {
        root: './dev-servers',
        test: {
          environment: 'node',
          globals: true,
        },
      },
    ],

    // 統合カバレッジ設定（ルートレベルのみ）
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.{ts,tsx,js,jsx}', 'dev-servers/**/*.js'],
      exclude: [
        'node_modules/',
        'dist/',
        'build/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/*.spec.ts',
        '**/*.test.ts',
        'coverage/',
      ],
    },
  },
})
