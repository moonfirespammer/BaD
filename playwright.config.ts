import { defineConfig } from '@playwright/test';

const port = 4173;

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium' }],
  webServer: [
    {
      command: 'pnpm preview',
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      // The design prototype, for the side-by-side visual check (kickoff prompt, check 6).
      command: 'node scripts/serve-static.mjs docs/prototype 4174',
      url: 'http://127.0.0.1:4174/Build-A-Dish.dc.html',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
});
