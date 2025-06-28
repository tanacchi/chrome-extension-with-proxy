import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 78,
        functions: 78,
        branches: 78,
        statements: 78,
      },
      exclude: ['dist/**', '**/*.spec.ts', '**/*.test.ts', 'vitest.config.ts', 'index.mts'],
    },
  },
})
