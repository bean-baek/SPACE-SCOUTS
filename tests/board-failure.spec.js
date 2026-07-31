import { test, expect } from "@playwright/test";
import { BOARD_ROWS, MINE_MAP } from "./seed.js";

// What this suite is for: every one of these cases used to end with the UI reporting
// success. A delete that never reached the server removed the UFO from the screen; a
// post that was rejected got mirrored into localStorage and looked placed. Both come
// back on reload. These tests pin the honest behaviour.
//
// Run with: npx playwright test --config playwright.failure.config.js

/** Serve the board list from a stub, then let each test override specific verbs. */
async function stubBoard(page, { listStatus = 200 } = {}) {
  await page.addInitScript(
    (mine) => localStorage.setItem("spacescouts:mine", JSON.stringify(mine)),
    MINE_MAP
  );
  await page.route("**/api/messages**", async (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    if (listStatus !== 200) return route.fulfill({ status: listStatus, body: "{}" });
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(BOARD_ROWS),
    });
  });
}

test("delete that fails on the server keeps the UFO on screen", async ({ page }) => {
  await stubBoard(page);
  await page.route("**/api/messages**", async (route) => {
    if (route.request().method() !== "DELETE") return route.fallback();
    return route.fulfill({ status: 500, body: '{"error":"db"}' });
  });

  await page.goto("/#/board");
  await expect(page.locator(".board__ufo")).toHaveCount(3);

  await page.locator(".board__ufo").first().click();
  await page.getByRole("button", { name: "DELETE" }).click();

  await expect(page.getByText("Couldn't delete")).toBeVisible();
  await page.getByRole("button", { name: "CLOSE" }).click();
  // The row is still in the database, so it must still be on the board.
  await expect(page.locator(".board__ufo")).toHaveCount(3);
});

test("delete that fails offline keeps the UFO on screen", async ({ page }) => {
  await stubBoard(page);
  await page.route("**/api/messages**", async (route) => {
    if (route.request().method() !== "DELETE") return route.fallback();
    return route.abort("failed");
  });

  await page.goto("/#/board");
  await page.locator(".board__ufo").first().click();
  await page.getByRole("button", { name: "DELETE" }).click();

  await expect(page.getByText("Couldn't delete")).toBeVisible();
  await page.getByRole("button", { name: "CLOSE" }).click();
  await expect(page.locator(".board__ufo")).toHaveCount(3);
});

test("delete the server confirms removes the UFO", async ({ page }) => {
  await stubBoard(page);
  await page.route("**/api/messages**", async (route) => {
    if (route.request().method() !== "DELETE") return route.fallback();
    return route.fulfill({ status: 200, body: '{"ok":true}' });
  });

  await page.goto("/#/board");
  await expect(page.locator(".board__ufo")).toHaveCount(3);

  await page.locator(".board__ufo").first().click();
  await page.getByRole("button", { name: "DELETE" }).click();
  await expect(page.locator(".board__ufo")).toHaveCount(2);
});

test("rate-limited post reports it and keeps the composer open", async ({ page }) => {
  await stubBoard(page);
  await page.route("**/api/messages**", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    return route.fulfill({ status: 429, body: '{"error":"rate limit"}' });
  });

  await page.goto("/#/board");
  await page.getByRole("button", { name: /HOW WAS YOUR MISSION/ }).click();
  await page.locator(".composer__text").fill("탐사 완료!");
  await page.getByRole("button", { name: "LAUNCH" }).click();

  const place = page.getByRole("button", { name: "PLACE HERE" });
  await place.click();

  await expect(page.getByText("Too many reports just now")).toBeVisible();
  // Still in the placing step, and the button is usable again rather than stuck on "…".
  await expect(place).toBeEnabled();
  // Nothing was added to the board.
  await expect(page.locator(".board__ufo")).toHaveCount(3);
});

test("failed post is not mirrored into localStorage", async ({ page }) => {
  await stubBoard(page);
  await page.route("**/api/messages**", async (route) => {
    if (route.request().method() !== "POST") return route.fallback();
    return route.abort("failed");
  });

  await page.goto("/#/board");
  await page.getByRole("button", { name: /HOW WAS YOUR MISSION/ }).click();
  await page.locator(".composer__text").fill("이건 저장되면 안 됩니다");
  await page.getByRole("button", { name: "LAUNCH" }).click();
  await page.getByRole("button", { name: "PLACE HERE" }).click();

  await expect(page.getByText("You seem to be offline")).toBeVisible();
  // The old code wrote the row here, so it survived a reload looking posted.
  const stored = await page.evaluate(() =>
    localStorage.getItem("spacescouts:board")
  );
  expect(stored ?? "[]").not.toContain("이건 저장되면 안 됩니다");
});

test("board that fails to load says so instead of looking empty", async ({ page }) => {
  await stubBoard(page, { listStatus: 500 });

  await page.goto("/#/board");
  await expect(page.getByText("Couldn't load the board")).toBeVisible();
});
