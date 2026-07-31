import { defineConfig } from "@playwright/test";

// Board failure-path suite. Runs against a PRODUCTION build on purpose: boardApi's
// USE_API flag is `!import.meta.env.DEV`, so under `npm run dev` the network is never
// touched and none of this code executes. `vite preview` serves dist/ with DEV=false;
// the API itself is stubbed per-test with page.route, so no Functions or D1 needed.
export default defineConfig({
  testDir: "./tests",
  testMatch: "board-failure.spec.js",
  fullyParallel: true,
  reporter: [["list"]],
  use: { baseURL: "http://localhost:4173" },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
