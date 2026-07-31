import { test, expect } from "@playwright/test";
import { SEED_SCRIPT } from "./seed.js";
import { clampY, BOTTOM_RESERVED_PX } from "../src/board/placement.js";

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

// The CTA pill paints above the UFOs, so anything placed under it is unopenable
// forever. Both halves matter: the clamp must produce a reachable spot, and the
// hazard it guards against must be real.
test("placement clamp keeps UFOs clear of the CTA", async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 });

  const seedAt = async (y) => {
    await page.addInitScript((yy) => {
      localStorage.setItem(
        "spacescouts:board",
        JSON.stringify([
          { id: "edge", text: "edge", top: "#80CFFF", middle: "#CBFF88",
            bottom: "#FFFFAB", x: 0.5, y: yy, created_at: 1 },
        ])
      );
    }, y);
    await page.goto("/#/board");
    // Second call navigates to the same hash, which is a no-op — without this the new
    // init script never runs and the previous seed is still on screen.
    await page.reload();
    await page.locator(".board__ufo").waitFor();
    return page.locator(".board__ufo").evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !(hit === el || el.contains(hit));
    });
  };

  const layerH = 768; // .board height at this viewport
  const maxY = clampY(1, layerH);
  expect(maxY).toBeLessThan(0.95);

  expect(await seedAt(maxY), "a UFO at the clamp limit must be tappable").toBe(false);

  // Guard against the clamp being quietly loosened again: the old 0.95 limit put the
  // UFO under the CTA, which is the bug this exists to prevent.
  expect(
    await seedAt(0.95),
    "0.95 should still be covered — the clamp is load-bearing"
  ).toBe(true);
});

test("clampY reserves the CTA strip at any board height", () => {
  // Shorter board → the fixed pill takes a larger fraction, so the limit tightens.
  expect(clampY(1, 768)).toBeCloseTo(1 - BOTTOM_RESERVED_PX / 768, 5);
  expect(clampY(1, 500)).toBeCloseTo(1 - BOTTOM_RESERVED_PX / 500, 5);
  expect(clampY(1, 500)).toBeLessThan(clampY(1, 768));

  // Never squeezes placement into the top half, however cramped the frame.
  expect(clampY(1, 150)).toBe(0.5);
  // Unknown height (layer not measured yet) falls back to a safe value, not 0.95.
  expect(clampY(1, 0)).toBe(0.9);
  // Top edge is untouched.
  expect(clampY(0, 768)).toBe(0.05);
});

test("top-level menu entries reach the game and the board", async ({ page }) => {
  await page.setViewportSize({ width: 402, height: 874 });

  await page.goto("/#/menu");
  await page.reload();
  await page.getByRole("button", { name: "TRAINING CENTER" }).click();
  await expect(page).toHaveURL(/#\/game/);
  await expect(page.locator(".dg-root")).toBeVisible();

  await page.goto("/#/menu");
  await page.reload();
  await page.getByRole("button", { name: "MISSION REPORTS" }).click();
  await expect(page).toHaveURL(/#\/board/);
  await expect(page.locator(".board")).toBeVisible();
});
