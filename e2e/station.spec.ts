import { expect, test, type Page } from '@playwright/test';
import { THEMES, expectHitTargets, expectNoAxeViolations, open, shot, skipIntro, toast } from './helpers';

/** Board → pick a dish → Cook → Station. */
async function toStation(page: Page, dish = 'Hainanese chicken rice', short = 'chicken rice'): Promise<void> {
  await skipIntro(page);
  await page.getByRole('button', { name: new RegExp(`^${dish}`) }).click();
  await page.getByRole('button', { name: `Pick ${short} for today` }).click();
  await page.getByRole('button', { name: `Cook ${short}` }).click();
  await expect(page.getByRole('heading', { name: dish })).toBeVisible();
}

const tap = (page: Page, id: string) => page.getByTestId(`pantry-${id}`).getByRole('button').first();
const chip = (page: Page, name: RegExp) => page.getByRole('button', { name });

/** Draw on the sigil pad with the real mouse: points are fractions of the pad. */
async function draw(page: Page, pts: [number, number][], msPerStep = 8): Promise<void> {
  const box = await page.getByTestId('sigil-pad').boundingBox();
  if (!box) throw new Error('no pad');
  const at = ([x, y]: [number, number]) => [box.x + x * box.width, box.y + y * box.height] as const;
  const [x0, y0] = at(pts[0] ?? [0.5, 0.5]);
  await page.mouse.move(x0, y0);
  await page.mouse.down();
  for (const p of pts.slice(1)) {
    const [x, y] = at(p);
    await page.mouse.move(x, y, { steps: 2 });
    await page.waitForTimeout(msPerStep);
  }
  await page.mouse.up();
}
const spiral = (): [number, number][] =>
  Array.from({ length: 61 }, (_, i) => {
    const a = (i / 60) * 3 * 2 * Math.PI;
    const r = 0.05 + 0.25 * (i / 60);
    return [0.5 + r * Math.cos(a) * 0.4, 0.5 + r * Math.sin(a)];
  });
const slash: [number, number][] = [
  [0.35, 0.2],
  [0.42, 0.4],
  [0.5, 0.6],
  [0.58, 0.8],
];
const flick: [number, number][] = [
  [0.5, 0.85],
  [0.5, 0.65],
  [0.5, 0.45],
  [0.5, 0.25],
  [0.5, 0.1],
];
const sweep: [number, number][] = [
  [0.08, 0.5],
  [0.3, 0.5],
  [0.5, 0.5],
  [0.7, 0.5],
  [0.92, 0.5],
];
const word = (page: Page) => page.getByTestId('sigil-word');

test.describe('Phase 2: Station', () => {
  test('pick → cook → portions, cap, minus, the four gestures, burn, wipe, fling, plate', async ({
    page,
  }) => {
    await open(page, { clock: '2026-09-23T10:00' });
    await toStation(page);
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0); // tab bar hidden (spec §5)
    await expect(page.getByText('Nothing yet. Tap the Pantry to add a portion.')).toBeVisible();
    await expect(page.getByText('EMPTY · FLAIR ×0')).toBeVisible();
    await expect(page.getByText(/^RESETS 1[34]:\d\d:\d\d$/)).toBeVisible();

    for (let i = 0; i < 3; i++) await tap(page, 'ginger').click();
    await expect(chip(page, /^Ginger sauce ×3/)).toBeVisible();
    await tap(page, 'ginger').click();
    await expect(toast(page)).toContainText('Three is plenty. Come back at leftovers hour.');
    await page.getByTestId('pantry-ginger').getByRole('button', { name: 'Remove one portion' }).click();
    await expect(chip(page, /^Ginger sauce ×2/)).toBeVisible();

    await draw(page, slash); // nothing selected yet? ginger is selected by the taps: cut applies to ginger
    await expect(word(page)).toHaveText('CUT');
    await expect(chip(page, /^Ginger sauce ×2/)).toContainText('cut');

    await tap(page, 'chicken').click();
    await expect(page.getByText(/^Strokes apply to Poached chicken$/)).toBeVisible();
    await draw(page, spiral(), 4);
    await expect(word(page)).toHaveText('HEAT');
    await expect(chip(page, /^Poached chicken ×1/)).toContainText('cooked');
    await draw(page, spiral(), 4);
    await draw(page, spiral(), 4);
    await expect(chip(page, /^Poached chicken ×1/)).toContainText('burnt');
    await expect(toast(page)).toContainText('You burnt the poached chicken. It did nothing to you.');
    await expect(page.getByText('MESS ×1 · SWEEP TO WIPE')).toBeVisible();
    await expect(page.locator('[data-art^="mess/splat-"]')).toHaveCount(1);
    await draw(page, sweep);
    await expect(word(page)).toHaveText('CLEAN');
    await expect(toast(page)).toContainText('Cleaner. Not clean. Cleaner.');
    await expect(page.getByText(/MESS ×/)).toHaveCount(0);

    await chip(page, /^Ginger sauce ×2/).click();
    await page.getByRole('button', { name: 'Fling to the Bin' }).click();
    await expect(toast(page)).toContainText('Rude. Delicious, but rude.');
    await expect(chip(page, /^Ginger sauce ×/)).toHaveCount(0);
    await expect(page.getByText('MESS ×1 · SWEEP TO WIPE')).toBeVisible();

    await draw(page, flick, 3);
    await expect(word(page)).toHaveText('PLATE');
    await page.getByRole('button', { name: 'Plate it' }).click();
    await expect(word(page)).toHaveText('PLATE');

    // The plate survives leaving, and a reload.
    await page.getByRole('button', { name: "Back to today's dishes" }).click();
    await expect(page.getByRole('button', { name: 'Cook chicken rice' })).toBeVisible();
    await page.reload();
    await page.getByRole('button', { name: 'Cook chicken rice' }).click();
    await expect(chip(page, /^Poached chicken ×1/)).toContainText('burnt');
    await expect(page.getByText('MESS ×1 · SWEEP TO WIPE')).toBeVisible();
  });

  test('Leftovers hour: ten portions of plentiful stock, running-low stock stays capped', async ({
    page,
  }) => {
    await open(page, { clock: '2026-09-23T21:30' });
    await toStation(page);
    await expect(page.getByText('LEFTOVERS HOUR · UNTIL 00:00')).toBeVisible();
    await expect(page.getByText('No cap on anything the city still has plenty of.')).toBeVisible();
    await expect(page.getByText('Leftovers hour · no cap on plentiful stock')).toBeVisible();
    for (let i = 1; i <= 10; i++) {
      await tap(page, 'ginger').click();
      if (i === 4) await expect(toast(page)).toContainText('Leftovers hour. Go on, then. I am watching.');
    }
    await expect(toast(page)).toContainText('Ten portions of ginger sauce. Ten. I am counting.');
    await expect(chip(page, /^Ginger sauce ×10/)).toBeVisible();
    await expect(page.getByTestId('pantry-ginger').getByText('×10')).toBeVisible();
    await expect(page.getByText('UNHINGED · FLAIR ×0')).toBeVisible();
    await expect(page.getByTestId('pantry-cucumber').getByText('Running low')).toBeVisible();
    for (let i = 0; i < 4; i++) await tap(page, 'cucumber').click();
    await expect(chip(page, /^Cucumber ×3/)).toBeVisible();
    await expect(toast(page)).toContainText('Three is plenty. Come back at leftovers hour.');
    await shot(page, 'station-leftovers-dark');
  });

  test('keyboard only: Prefer buttons, Cut, Heat and Plate it', async ({ page }) => {
    await open(page, { clock: '2026-09-23T10:00' });
    await toStation(page);
    await page.getByRole('switch', { name: 'Prefer buttons' }).focus();
    await page.keyboard.press('Space');
    await expect(page.getByRole('switch', { name: 'Prefer buttons' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await tap(page, 'chicken').focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Heat', exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Cut', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(chip(page, /^Poached chicken ×1/)).toContainText('cut · cooked');
    await page.getByRole('button', { name: 'Plate it' }).focus();
    await page.keyboard.press('Enter');
    await expect(word(page)).toHaveText('PLATE');
    await page.reload();
    await page.getByRole('button', { name: 'Cook chicken rice' }).click();
    await expect(page.getByRole('button', { name: 'Heat', exact: true })).toBeVisible(); // the setting persists
  });

  test('reduced motion: no sigil scale-in and no stroke fade', async ({ page }) => {
    await open(page, { clock: '2026-09-23T10:00', reducedMotion: true });
    await toStation(page);
    await tap(page, 'chicken').click();
    await draw(page, spiral(), 4);
    await expect(word(page)).toHaveText('HEAT');
    expect(await word(page).evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    const path = page.getByTestId('sigil-pad').locator('path');
    expect(await path.evaluate((el) => getComputedStyle(el).opacity)).toBe('0');
    expect(await path.evaluate((el) => getComputedStyle(el).transitionDuration)).toBe('0s');
  });

  test('a Gone shelf: card, Bin remark, still selectable', async ({ page }) => {
    await open(page, { clock: '2026-09-23T10:00' });
    await toStation(page);
    // Seed the saved city day with an eaten-out cucumber shelf (as flings would), then reload.
    await page.evaluate(async () => {
      const req = indexedDB.open('keyval-store');
      const db: IDBDatabase = await new Promise((res, rej) => {
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(new Error('idb'));
      });
      const store = db.transaction('keyval', 'readwrite').objectStore('keyval');
      const key = 'bad:day:SG:2026-09-23';
      const day = await new Promise<Record<string, unknown>>((res) => {
        const g = store.get(key);
        g.onsuccess = () => res(g.result as Record<string, unknown>);
      });
      await new Promise((res) => {
        const p = store.put({ ...day, flung: { cucumber: 100 } }, key);
        p.onsuccess = res;
      });
    });
    await page.reload();
    await page.getByRole('button', { name: 'Cook chicken rice' }).click();
    const card = page.getByTestId('pantry-cucumber');
    await expect(card.getByText('Gone')).toBeVisible();
    // aria-disabled: Playwright will not click it, browsers do (the Bin answers a tap on a Gone shelf).
    await tap(page, 'cucumber').click({ force: true });
    await expect(toast(page)).toContainText('Gone. Singapore ate it all before you.');
    await expect(card).toHaveClass(/selected/);
    await expectNoAxeViolations(page, 'station with a Gone card');
  });
});

for (const theme of THEMES) {
  test(`Station: axe, hit targets and screenshots (${theme})`, async ({ page }) => {
    await open(page, { theme, clock: '2026-09-23T10:00' });
    await toStation(page);
    await expectNoAxeViolations(page, `station empty ${theme}`);
    await expectHitTargets(page, `station empty ${theme}`);
    await shot(page, `station-${theme}`);
    for (const id of ['chicken', 'rice', 'ginger', 'ginger', 'cucumber', 'durian'])
      await tap(page, id).click();
    await chip(page, /^Poached chicken ×1/).click();
    for (let i = 0; i < 3; i++) await draw(page, spiral(), 4);
    await page.getByRole('switch', { name: 'Prefer buttons' }).click();
    await expect(page.getByRole('button', { name: 'Heat', exact: true })).toBeVisible();
    await expectNoAxeViolations(page, `station built ${theme}`);
    await expectHitTargets(page, `station built ${theme}`);
    await shot(page, `station-built-${theme}`);
  });
}
