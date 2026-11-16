import { defineConfig } from 'vitest/config';

export const baseVitestConfig = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/test/**',
        '**/tests/**'
      ]
    },
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts', 'tests/**/*.{test,spec}.ts'],
    testTimeout: 10000
  }
});

export default baseVitestConfig;
