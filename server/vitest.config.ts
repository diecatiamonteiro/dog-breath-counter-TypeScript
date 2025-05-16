import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
      globals: true,
      environment: 'node',
      setupFiles: ['./src/config/tests/setup.ts'],
      include: ['**/*.test.ts'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  });