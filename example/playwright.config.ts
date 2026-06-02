import { defineConfig, devices } from '@playwright/test'

const FRONTEND_URL = 'http://localhost:5173'
const BACKEND_HEALTH_URL = 'http://localhost:3000/health'
const WEB_SERVER_TIMEOUT = 120_000
const isCI = Boolean(process.env.CI)

// E2E roda o fluxo completo: UI (Vite, :5173) chamando o BFF (Express, :3000).
// O `webServer` sobe os dois antes dos testes e os reaproveita em dev.
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: FRONTEND_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: './backend',
      url: BACKEND_HEALTH_URL,
      reuseExistingServer: !isCI,
      timeout: WEB_SERVER_TIMEOUT,
      stdout: 'pipe',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev -- --port 5173 --strictPort',
      cwd: './frontend',
      url: FRONTEND_URL,
      reuseExistingServer: !isCI,
      timeout: WEB_SERVER_TIMEOUT,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  ],
})
