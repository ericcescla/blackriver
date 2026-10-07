import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  globalSetup: process.env.PLAYWRIGHT_BASE_URL ? undefined : './tests/setup.mjs',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:5188',
    headless: true,
    launchOptions: { channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' },
    trace: 'retain-on-failure',
  },
})
