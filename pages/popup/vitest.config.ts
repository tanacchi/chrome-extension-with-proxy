/// <reference types="@testing-library/jest-dom" />
import { defineConfig } from 'vitest/config'
import { createProjectConfig, createAliases } from '../../vitest.shared'
import { resolve } from 'path'

export default defineConfig(
  createProjectConfig('popup', 'jsdom', ['src/**/*.spec.tsx', 'src/**/*.spec.ts'], {
    setupFiles: ['./vitest.setup.ts'],
    thresholds: {
      lines: 90,
      functions: 90,
      branches: 90,
      statements: 90,
    },
    resolve: {
      alias: {
        ...createAliases('../../'),
        '@src': resolve(__dirname, './src'),
      },
    },
  }),
)
