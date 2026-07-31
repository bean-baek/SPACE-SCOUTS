import { defineConfig } from "@playwright/test";

// Visual-regression baseline for the refactor. The whole point of this suite is to
// prove a refactor changed zero pixels, so determinism matters more than coverage:
// see tests/seed.js for the Math.random stub that makes the shuffled grids and the
// game's starfield reproducible.
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    // Screenshot diffing is the entire deliverable — keep traces off, they're noise here.
    trace: "off",
  },
  expect: {
    toHaveScreenshot: {
      // Anti-aliasing on text/SVG edges varies by a hair between runs on Windows.
      // 0.2% of pixels is well under any real visual change but above AA jitter.
      maxDiffPixelRatio: 0.002,
      animations: "disabled",
      caret: "hide",
    },
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
