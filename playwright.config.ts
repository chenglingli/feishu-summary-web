import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    browserName: "chromium",
    ignoreHTTPSErrors: process.env.E2E_SELF_SIGNED === "true",
  },
  workers: 1,
});
