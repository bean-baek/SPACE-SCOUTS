import { test, expect } from "@playwright/test";
import { SEED_SCRIPT } from "./seed.js";

// Hit-testing regressions. A tile can be laid out perfectly, look perfect in a
// screenshot, and still be untappable because something invisible sits on top of it —
// which is exactly what the .grid-view::after spacer was doing to the bottom rows.
// Screenshots cannot catch that, so these click for real.

test("every grid tile navigates to its item", async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 });
  await page.addInitScript(SEED_SCRIPT);
  // LUCKY DRAW is the longest grid (22 tiles), so it is where the overflow bit.
  await page.goto("/#/c/lucky-draw");
  await page.waitForSelector(".grid__tile");

  const count = await page.locator(".grid__tile").count();
  expect(count).toBe(22);

  for (let i = 0; i < count; i++) {
    await page.goto("/#/c/lucky-draw");
    await page.waitForSelector(".grid__tile");
    const tile = page.locator(".grid__tile").nth(i);
    await tile.scrollIntoViewIfNeeded();
    await tile.click({ timeout: 3000 });
    await expect(
      page,
      `tile ${i} did not navigate — something is covering it`
    ).toHaveURL(/#\/i\//);
  }
});

test("the last tile of every grid is clickable", async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 });
  await page.addInitScript(SEED_SCRIPT);
  const subs = [
    "standard-reward",
    "cocktail-reward",
    "early-bird-reward",
    "lucky-draw",
    "capsule-draw",
  ];

  for (const sub of subs) {
    await page.goto(`/#/c/${sub}`);
    await page.waitForSelector(".grid__tile");
    const last = page.locator(".grid__tile").last();
    await last.scrollIntoViewIfNeeded();
    await last.click({ timeout: 3000 });
    await expect(page, `last tile of ${sub} is not clickable`).toHaveURL(/#\/i\//);
  }
});

test("menu items are all clickable", async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 });

  for (const label of [
    "STANDARD REWARD",
    "COCKTAIL REWARD",
    "EARLY-BIRD REWARD",
    "LUCKY DRAW",
    "CAPSULE DRAW",
  ]) {
    // Navigating away and back remounts Menu, so the accordion starts closed. Going
    // to #/menu while already there would be a no-op and the click below would toggle
    // the open accordion shut instead.
    await page.goto("/#/menu");
    await page.reload();
    await page.getByRole("button", { name: "SPACE SUPPLIES" }).click();
    await page.getByRole("button", { name: label, exact: true }).click();
    await expect(page, `${label} is not clickable`).toHaveURL(/#\/c\//);
  }
});
