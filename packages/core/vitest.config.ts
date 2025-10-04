import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8', // ✅ use 'v8' instead of 'c8'
      reporter: ['text', 'lcov'],
    },
  },
});
