// Renders public/og-image.png — the picture KakaoTalk, X, Discord and iMessage show
// when someone pastes the site link.
//
// 1200x630 is the widely-accepted Open Graph size and satisfies KakaoTalk's own
// guidance (min 200x200, prefers a wide crop). Built from assets already in the repo
// — the landing photo and the site palette — so it stays consistent with the page it
// links to.
//
// Run: node scripts/build-og-image.mjs   (needs the dev server, or pass a base URL)

import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:5173";

const html = `
<body style="margin:0;width:1200px;height:630px;overflow:hidden;
             background:#CBFF88;display:flex;align-items:center;
             font-family:'Albert Sans',sans-serif;color:#3a39ff">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Albert+Sans:wght@500;900&display=swap" rel="stylesheet">

  <div style="flex:1;padding:0 0 0 72px">
    <div style="font-size:96px;font-weight:900;letter-spacing:.02em;line-height:.98">
      SPACE<br>SCOUTS
    </div>
    <div style="margin-top:26px;font-size:31px;font-weight:500;letter-spacing:.04em">
      RYO BIRTHDAY CAFE
    </div>
    <div style="margin-top:38px;display:flex;gap:12px">
      ${["보급품", "미션 리포트", "탐사 미션"]
        .map(
          (t) =>
            `<span style="border:3px solid #3a39ff;border-radius:999px;
                          padding:9px 22px;font-size:22px;font-weight:700">${t}</span>`
        )
        .join("")}
    </div>
  </div>

  <!-- The landing photo, framed like the phone card on desktop. -->
  <div style="width:430px;height:630px;position:relative;overflow:hidden;
              border-left:5px solid #3a39ff;background:#e5e5e5">
    <img src="${BASE}/images/landing.png"
         style="width:100%;height:100%;object-fit:cover;object-position:center top;display:block">
    <img src="${BASE}/images/character.png"
         style="position:absolute;right:22px;bottom:26px;width:104px">
  </div>
</body>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(`${BASE}/`); // same origin, so the asset URLs resolve
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);
const buf = await page.screenshot({ type: "png" });
await browser.close();

writeFileSync("public/og-image.png", buf);
console.log(`wrote public/og-image.png (${(buf.length / 1024).toFixed(0)} KB)`);
