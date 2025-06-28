import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@src': resolve(__dirname, 'src'),
      '@extension/shared': resolve(__dirname, '../../packages/shared/lib'),
      '@extension/storage': resolve(__dirname, '../../packages/storage/lib'),
      '@extension/ui': resolve(__dirname, '../../packages/ui/lib'),
      '@extension/i18n': resolve(__dirname, '../../packages/i18n/lib'),
    },
  },
})
