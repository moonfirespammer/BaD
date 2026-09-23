// Check 6 (kickoff prompt): screenshot the same screens in the prototype and the app at the same size, and write
// side-by-side sheets to e2e/__screenshots__/compare/ for review. Deviations are listed in the phase report.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync } from 'node:fs';
import { THEMES, open, skipIntro, type Theme } from './helpers';

const PROTOTYPE = 'http://127.0.0.1:4174/Build-A-Dish.dc.html';
const OUT = 'e2e/__screenshots__/compare';

/** Phase 1 screens: prototype jump-chip label, and how to reach the same screen in the app. */
const SCREENS: { name: string; chip: string; app: (page: Page) => Promise<void> }[] = [
  { name: 'intro', chip: 'Intro', app: () => Promise.resolve() },
  { name: 'board', chip: 'Board', app: skipIntro },
  {
    name: 'cursed-plates',
    chip: 'Cursed Plates',
    app: async (page) => {
      await skipIntro(page);
      await page.getByRole('button', { name: /^Cursed Plates · \d+$/ }).click();
    },
  },
  {
    name: 'station',
    chip: 'Station',
    app: async (page) => {
      await skipIntro(page);
      await page.getByRole('button', { name: /^Hainanese chicken rice/ }).click();
      await page.getByRole('button', { name: 'Pick chicken rice for today' }).click();
      await page.getByRole('button', { name: 'Cook chicken rice' }).click();
      await page.waitForTimeout(3000); // let the pick toast clear, as in the prototype jump
    },
  },
  ...(['Play', 'Classes', 'You'] as const).map((tab) => ({
    name: tab.toLowerCase(),
    chip: tab,
    app: async (page: Page) => {
      await skipIntro(page);
      await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: tab }).click();
    },
  })),
];

test.use({ ignoreHTTPSErrors: true }); // the prototype loads React from a CDN; some proxies re-sign TLS

async function prototypeShots(page: Page, theme: Theme): Promise<Record<string, Buffer>> {
  await page.setViewportSize({ width: 1200, height: 1000 });
  const phone = page.locator('div[data-theme][data-screen-label]:visible').first();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // The prototype pulls React and Babel from a CDN and compiles in the page. A CDN or proxy hiccup can leave it
  // blank, so the load (not the comparison) is retried up to three times; the errors are attached to the report.
  for (let attempt = 1; ; attempt++) {
    await page.goto(PROTOTYPE, { waitUntil: 'networkidle', timeout: 90_000 });
    const ok = await phone
      .getByText('Five dishes a day')
      .waitFor({ timeout: 45_000 })
      .then(() => true)
      .catch(() => false);
    if (ok) break;
    test
      .info()
      .annotations.push({ type: 'prototype load retry', description: `${attempt}: ${errors.join(' | ')}` });
    if (attempt === 3) throw new Error(`Prototype did not render: ${errors.join(' | ')}`);
  }
  await page.evaluate(() => document.fonts.ready);
  const shots: Record<string, Buffer> = {};
  for (const s of SCREENS) {
    await page.getByRole('button', { name: s.chip, exact: true }).last().click();
    await phone.evaluate((el, t) => el.setAttribute('data-theme', t), theme);
    await page.waitForTimeout(400);
    shots[s.name] = await phone.screenshot();
  }
  return shots;
}

for (const theme of THEMES) {
  test(`prototype vs app, Phase 1 screens (${theme})`, async ({ browser }) => {
    test.setTimeout(240_000);
    mkdirSync(OUT, { recursive: true });
    const protoCtx = await browser.newContext({ ignoreHTTPSErrors: true, deviceScaleFactor: 1 });
    const proto = await prototypeShots(await protoCtx.newPage(), theme);
    await protoCtx.close();
    const sheet = await browser.newPage({ viewport: { width: 820, height: 900 }, deviceScaleFactor: 1 });
    for (const s of SCREENS) {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await open(page, { theme, clock: '2026-09-23T10:00' });
      await s.app(page);
      await page.waitForTimeout(300);
      const app = await page.screenshot({ animations: 'disabled' });
      await ctx.close();
      const img = (b: Buffer) => `data:image/png;base64,${b.toString('base64')}`;
      await sheet.setContent(
        `<body style="margin:0;background:#888;font:700 13px sans-serif"><div style="display:flex;gap:16px;padding:8px">` +
          `<figure style="margin:0"><figcaption>Prototype · ${s.name} · ${theme}</figcaption><img src="${img(proto[s.name] ?? Buffer.alloc(0))}" width="392"></figure>` +
          `<figure style="margin:0"><figcaption>App · ${s.name} · ${theme}</figcaption><img src="${img(app)}" width="390"></figure></div></body>`,
      );
      await sheet.screenshot({ path: `${OUT}/${s.name}-${theme}.png`, fullPage: true });
      expect(readFileSync(`${OUT}/${s.name}-${theme}.png`).length).toBeGreaterThan(10_000);
    }
  });
}
