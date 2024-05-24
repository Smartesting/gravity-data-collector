import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    restoreMocks: true,
    retry: 3,
    exclude: ['./rrweb/**', 'node_modules/**']
  },
})
