import { test, expect } from "@playwright/test";
import { SEED_SCRIPT, BOARD_ROWS, MINE_MAP } from "./seed.js";

// Visual baseline. Run `npx playwright test` before a refactor phase to record,
// and after it to prove nothing moved. A failure here is a real visual diff —
// open the report's side-by-side before assuming it's flake.

const MOBILE = { width: 402, height: 874 }; // PLAN.md's iPhone 16 target
const DESKTOP = { width: 900, height: 1000 }; // >=480px: the centered card mode

/** Navigate to a hash route with determinism shims in place, then settle. */
async function open(page, hash, { board = false } = {}) {
  await page.addInitScript(SEED_SCRIPT);
  if (board) {
    await page.addInitScript(
      ([rows, mine]) => {
        localStorage.setItem("spacescouts:board", JSON.stringify(rows));
        localStorage.setItem("spacescouts:mine", JSON.stringify(mine));
      },
      [BOARD_ROWS, MINE_MAP],
    );
  }
  await page.goto(`/${hash}`);
  // Webfonts are loaded from Google; without this the first shot can land on
  // fallback metrics and every subsequent run "differs".
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
}

const ROUTES = [
  ["landing", "#/"],
  ["menu", "#/menu"],
  ["grid-standard", "#/c/standard-reward"],
  ["grid-cocktail", "#/c/cocktail-reward"],
  ["grid-earlybird", "#/c/early-bird-reward"],
  ["grid-lucky", "#/c/lucky-draw"],
  ["grid-capsule", "#/c/capsule-draw"],
  // One detail page per theme colour — these are what prove the theme rules
  // still resolve if the .theme-* CSS is ever collapsed.
  ["detail-pink", "#/i/standard-reward/postcard"],
  ["detail-blue", "#/i/cocktail-reward/acrylic-hair-clip"],
  ["detail-yellow", "#/i/early-bird-reward/t-shirt"],
  ["detail-lime", "#/i/lucky-draw/squishy"],
  ["detail-khaki", "#/i/capsule-draw/acrylic-clip"],
  // Carousel items (multi-photo → dots) and a deep-linked option.
  ["detail-carousel", "#/i/standard-reward/id-card/2026"],
  ["detail-option-deeplink", "#/i/lucky-draw/pouch/핑크"],
  // #/soon is the hidden video page and gets its own test below — an autoplaying
  // video cannot be screenshotted deterministically without masking it.
];

for (const [name, hash] of ROUTES) {
  test(`${name} @mobile`, async ({ page }) => {
    await page.setViewportSize(MOBILE);
    await open(page, hash);
    await expect(page).toHaveScreenshot(`${name}-mobile.png`, {
      fullPage: true,
    });
  });
}

// Desktop only needs the states where the card frame itself changes (radius,
// margin, shadow) — re-shooting all 15 routes at 900px buys nothing.
for (const [name, hash] of [ROUTES[0], ROUTES[1], ROUTES[5], ROUTES[7]]) {
  test(`${name} @desktop`, async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await open(page, hash);
    await expect(page).toHaveScreenshot(`${name}-desktop.png`, {
      fullPage: true,
    });
  });
}

test("menu expanded @mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await open(page, "#/menu");
  await page.getByRole("button", { name: "SPACE SUPPLIES" }).click();
  await expect(page.getByRole("button", { name: "LUCKY DRAW" })).toBeVisible();
  await expect(page).toHaveScreenshot("menu-expanded-mobile.png", {
    fullPage: true,
  });
});

test("detail option switch @mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await open(page, "#/i/lucky-draw/squishy");
  await page.getByRole("button", { name: "블루", exact: true }).click();
  await expect(page).toHaveScreenshot("detail-option-switched-mobile.png", {
    fullPage: true,
  });
});

test("game ready overlay @mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await open(page, "#/game");
  await expect(page.getByRole("button", { name: "START" })).toBeVisible();
  // The canvas runs its own rAF loop, so its pixels are timing-dependent even
  // with a seeded PRNG. Mask it and baseline the chrome around it: HUD, back
  // button, overlay, board art, title, hint copy, START button.
  await expect(page).toHaveScreenshot("game-ready-mobile.png", {
    mask: [page.locator(".dg-canvas")],
  });
});

test("board with seeded ufos @mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await open(page, "#/board", { board: true });
  await expect(page.locator(".board__ufo")).toHaveCount(3);
  await expect(page).toHaveScreenshot("board-mobile.png");
});

test("board modal - own message shows DELETE @mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await open(page, "#/board", { board: true });
  await page.locator(".board__ufo").first().click();
  await expect(page.getByRole("button", { name: "DELETE" })).toBeVisible();
  await expect(page).toHaveScreenshot("board-modal-own-mobile.png");
});

test("board modal - other message hides DELETE @mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await open(page, "#/board", { board: true });
  await page.locator(".board__ufo").nth(1).click();
  await expect(page.getByRole("button", { name: "DELETE" })).toHaveCount(0);
  await expect(page).toHaveScreenshot("board-modal-other-mobile.png");
});

test("board composer sheet @mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await open(page, "#/board", { board: true });
  await page.getByRole("button", { name: /HOW WAS YOUR MISSION/ }).click();
  await expect(page.locator(".composer__sheet")).toBeVisible();
  await expect(page).toHaveScreenshot("board-composer-mobile.png");
});

test("hidden video page @mobile", async ({ page }) => {
  await page.setViewportSize(MOBILE);
  await open(page, "#/soon");
  await expect(page.locator(".vp-video")).toBeVisible();
  // The video plays, so its pixels are timing-dependent — mask it and baseline the
  // chrome around it: the back button and the sound toggle.
  await expect(page).toHaveScreenshot("video-page-mobile.png", {
    mask: [page.locator(".vp-video")],
  });
});
