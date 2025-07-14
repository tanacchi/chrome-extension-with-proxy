import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['lib/**/*.spec.tsx', 'lib/**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/index.ts',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
      thresholds: {
        global: {
          lines: 90,
          functions: 90,
          branches: 90,
          statements: 90,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@extension/shared': resolve(__dirname, '../../packages/shared/dist'),
      '@extension/storage': resolve(__dirname, '../../packages/storage/lib'),
      '@extension/ui': resolve(__dirname, './lib'),
      '@extension/i18n': resolve(__dirname, '../../packages/i18n/lib'),
    },
  },
})
