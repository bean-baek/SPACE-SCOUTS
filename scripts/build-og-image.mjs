// Renders public/og-image.png — the picture KakaoTalk, X, Discord and iMessage show
// when someone pastes the site link.
//
// Deliberately plain: the site's surface colour and the Space Scouts wordmark, nothing
// else. 1200x630 is the accepted Open Graph size and clears KakaoTalk's minimum.
//
// Background is the grey app surface (--grey), not the lime backdrop: title.svg is
// lime-filled with a blue outline, so on lime the letters sink into the background and
// only the outline survives. Swap BG to #CBFF88 if that hollow look is wanted.
//
// Reads title.svg straight off disk and inlines it, so no dev server is needed.
//
// Run: node scripts/build-og-image.mjs

import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";

const title = readFileSync("public/images/title.svg", "utf8");
const titleUri =
  "data:image/svg+xml;base64," + Buffer.from(title, "utf8").toString("base64");

const BG = "#E5E5E5";

const html = `
<body style="margin:0;width:1200px;height:630px;overflow:hidden;background:${BG};
             display:flex;align-items:center;justify-content:center">
  <img src="${titleUri}" style="width:760px;height:auto;display:block">
</body>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.waitForTimeout(600);
const buf = await page.screenshot({ type: "png" });
await browser.close();

writeFileSync("public/og-image.png", buf);
console.log(`wrote public/og-image.png (${(buf.length / 1024).toFixed(0)} KB)`);
