import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "./test-results/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "html" : "list",
  use: {
    baseURL: "http://localhost:3001",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "parity",
      use: { ...devices["Desktop Chrome"] },
      testDir: "./e2e/parity",
      snapshotPathTemplate: "{testDir}/__screenshots__/{testFilePath}/{arg}{ext}",
    },
    // Phase 2: uncomment for cross-browser coverage
    // { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    // { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "PORT=3001 npx next dev",
    url: "http://localhost:3001",
    reuseExistingServer: !process.env.CI,
  },
});
