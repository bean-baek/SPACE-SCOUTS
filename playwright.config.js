import { defineConfig } from "@playwright/test";

// Visual-regression baseline for the refactor. The whole point of this suite is to
// prove a refactor changed zero pixels, so determinism matters more than coverage:
// see tests/seed.js for the Math.random stub that makes the shuffled grids and the
// game's starfield reproducible.
export default defineConfig({
  testDir: "./tests",
  // The board failure suite needs a production build (see playwright.failure.config.js);
  // it would fail against the dev server, where boardApi never touches the network.
  testIgnore: "board-failure.spec.js",
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
      // MUST stay low for this palette. Playwright's default (0.2) compares in YIQ and
      // weights luminance heaviest, and every colour here is a high-luminance pastel:
      // lime #CBFF88 (Y=226) against the grey surface #E5E5E5 (Y=229) scores as "same
      // pixel" at the default, so a whole character being filled lime went undetected.
      // Pink vs yellow only just cleared it. At 0.02 any real colour change counts and
      // AA jitter is still absorbed by maxDiffPixelRatio.
      threshold: 0.02,
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
