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
const chip = (page: Page, name: RegExp) => page.getByTestId('plate-chips').getByRole('button', { name });

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
const flick: [number, number][] = [
  [0.5, 0.85],
  [0.5, 0.65],
  [0.5, 0.45],
  [0.5, 0.25],
  [0.5, 0.1],
];
const ALL = ['chicken', 'rice', 'ginger', 'chilli-sauce', 'cucumber', 'dark-soy'];

test.describe('Phase 3: Verdict, Share card, Signature Dish, Cursed Plates', () => {
  test('cook → spiral and flick with the mouse → verdict → share (Sent to your party) → Save image → You', async ({
    page,
  }) => {
    await open(page, { clock: '2026-09-23T10:00' });
    await toStation(page);
    for (const id of ALL) await tap(page, id).click();
    await chip(page, /^Poached chicken ×1/).click();
    await draw(page, spiral(), 4);
    await expect(chip(page, /^Poached chicken ×1/)).toContainText('cooked');
    await draw(page, flick, 3);

    // Raw rice, raw cut on chicken and cucumber: 74 → two stones, Comforting, the rice line (spec §3.5–3.9).
    await expect(page.getByRole('heading', { name: "The Bin's verdict" })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toHaveCount(0); // tab bar hidden (spec §5)
    await expect(toast(page)).toHaveCount(0); // plating clears the Bin toast
    await expect(page.getByText('The rice is raw. Rice is the easy part.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Chicken rice');
    await expect(page.getByText('Comforting', { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        'Poached chicken ×1 · Chicken rice ×1 · Ginger sauce ×1 · Chilli sauce ×1 · Cucumber ×1 · Dark soy ×1',
      ),
    ).toBeVisible();
    await expect(page.getByText('2 of 3 rubies')).toBeVisible();
    await expect(page.getByRole('img', { name: 'Ruby gem, active' })).toHaveCount(2);
    await expect(page.getByRole('img', { name: 'Ruby gem', exact: true })).toHaveCount(1);
    await expect(page.getByText('Neat', { exact: true })).toBeVisible();
    await expect(page.getByText('Raw rice. Again.')).toBeVisible();
    await expect(page.getByText(/^Leftovers hour$/)).toHaveCount(0);
    await expect(page.locator('[data-art="bin/judging"]')).toBeVisible();
    await expect(page.getByText(/^RESETS 1[34]:\d\d:\d\d$/)).toBeVisible();
    await expect(page.getByText(/^The Bin has eaten [\d,]+ plates in Singapore today\.$/)).toBeVisible();

    const sig = page.getByRole('button', { name: 'Set as Signature Dish' });
    await sig.click();
    await expect(page.getByRole('button', { name: 'Signature Dish set' })).toBeDisabled();

    await page.getByRole('button', { name: 'Share to your party' }).click();
    await expect(page.getByRole('heading', { name: 'Share card' })).toBeVisible();
    const card = page.getByTestId('share-card');
    await expect(card).toContainText('BUILD-A-DISH');
    await expect(card).toContainText('Singapore · 23 Sep 2026');
    await expect(card.getByRole('heading', { level: 2 })).toHaveText('Chicken rice');
    await expect(card).toContainText('The rice is raw. Rice is the easy part.');
    await expect(card.getByRole('img', { name: 'Ruby gem, active' })).toHaveCount(2);
    await expect(card).toContainText('Ayu');
    await expect(card).toContainText('Stirrer');
    await expect(card).toContainText('Ruby');
    await expect(card).toContainText('THE GAME IS LIFE');
    await expect(card).toContainText('PLAY IT TOGETHER');
    expect((await card.boundingBox())?.width).toBe(326);

    await page.getByRole('button', { name: 'Send to your party' }).click();
    await expect(page.getByRole('button', { name: 'Sent to your party' })).toBeDisabled();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Save image' }).click();
    expect((await download).suggestedFilename()).toBe('build-a-dish-2026-09-23.png');
    await expect(toast(page)).toHaveCount(0); // no Bin toasts for signature, send or save (spec §3.12–3.13)

    await page.getByRole('button', { name: 'Back to the verdict' }).click();
    await expect(page.getByRole('heading', { name: "The Bin's verdict" })).toBeVisible();
    await page.getByRole('button', { name: "Back to today's dishes" }).click();
    await expect(page.getByRole('button', { name: 'Cook chicken rice' })).toBeVisible(); // the plate stays

    await page.getByRole('navigation', { name: 'Main' }).getByRole('button', { name: 'You' }).click();
    await expect(page.getByText('Ruby Stirrer · 1 plates this month')).toBeVisible();
    await expect(page.getByText('Comforting · 23 Sep 2026')).toBeVisible();
    await expect(page.getByRole('img', { name: '2 of 3 rubies' })).toBeVisible();
    await expect(page.getByText('Raw rice ×1')).toBeVisible();
  });

  test('an empty plate is cursed: the air line, the disgusted Bin, and the Cursed Plates gallery', async ({
    page,
  }) => {
    await open(page, { clock: '2026-09-23T10:00' });
    await toStation(page);
    await page.getByRole('button', { name: 'Plate it' }).click();
    await expect(page.getByText('You plated air. Bold. Pointless, but bold.')).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 })).toHaveText('Empty Plate of unknown origin');
    await expect(page.getByText('CURSED PLATE · meant to be chicken rice')).toBeVisible();
    await expect(page.getByText('The Bin has questions')).toBeVisible();
    await expect(page.getByText('1 of 3 rubies')).toBeVisible();
    await expect(page.getByText('Empty', { exact: true })).toBeVisible();
    await expect(page.getByText('Cursed plate', { exact: true })).toBeVisible();
    await expect(page.getByText('A new habit is forming')).toBeVisible();
    await expect(page.locator('[data-art="bin/disgusted"]')).toBeVisible();
    await expect(page.getByText('Something below said thank you.')).toHaveCount(0); // score 50: no Wasteways line
    await page.getByRole('button', { name: "Back to today's dishes" }).click();
    await page.getByRole('button', { name: 'Cursed Plates · 1' }).click();
    await expect(page.getByRole('heading', { name: 'Cursed Plates · 1' })).toBeVisible();
    await expect(page.getByText('Empty Plate of unknown origin')).toBeVisible();
    await expect(page.getByText('meant to be chicken rice · 23 Sep 2026')).toBeVisible();
    await expect(page.getByText('You plated air. Bold. Pointless, but bold.')).toBeVisible();
    await expect(page.getByRole('img', { name: '1 of 3 rubies' })).toBeVisible();
    await expect(page.locator('[data-art="cursed/empty"]')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Cursed Plates · 1' })).toBeVisible();
  });

  test('Leftovers hour: ten portions → the Ten line, Leftovers hour chip, Unhinged; two extras → Wasteways', async ({
    page,
  }) => {
    await open(page, { clock: '2026-09-23T21:30' });
    await toStation(page);
    for (let i = 0; i < 10; i++) await tap(page, 'ginger').click();
    await page.getByRole('button', { name: 'Plate it' }).click();
    await expect(page.getByText('Ten portions of ginger sauce. Ten. I counted.')).toBeVisible();
    await expect(page.getByText('Unhinged', { exact: true })).toBeVisible();
    await expect(page.getByText('Leftovers hour', { exact: true })).toBeVisible();
    await expect(page.getByText('Unhinged plate ×1 this month')).toBeVisible();
    await page.getByRole('button', { name: "Back to today's dishes" }).click();
    await page.getByRole('button', { name: 'Cook chicken rice' }).click();
    await tap(page, 'durian').click();
    await tap(page, 'cheddar').click();
    await page.getByRole('button', { name: 'Plate it' }).click();
    await expect(page.getByText('Durian. In chicken rice. I will be filing a report.')).toBeVisible();
    await expect(page.getByText('Something below said thank you. That is not normal.')).toBeVisible();
    await expect(page.getByText('Cursed plate', { exact: true })).toBeVisible();
    await expect(page.getByText(/^The Bin has eaten [\d,]+ plates in Singapore today\.$/)).toBeVisible();
  });

  test('keyboard only: Plate it → Set as Signature Dish → Share → Send', async ({ page }) => {
    await open(page, { clock: '2026-09-23T10:00' });
    await toStation(page);
    await tap(page, 'chicken').focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Plate it' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: "The Bin's verdict" })).toBeVisible();
    await page.getByRole('button', { name: 'Set as Signature Dish' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Signature Dish set' })).toBeDisabled();
    await page.getByRole('button', { name: 'Share to your party' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Send to your party' }).focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Sent to your party' })).toBeDisabled();
  });
});

for (const theme of THEMES) {
  test(`Verdict, Share card and Cursed Plates: axe, hit targets and screenshots (${theme})`, async ({
    page,
  }) => {
    await open(page, { theme, clock: '2026-09-23T10:00' });
    await toStation(page);
    for (const id of ALL) await tap(page, id).click();
    await page.getByRole('button', { name: 'Plate it' }).click();
    await expect(page.getByRole('heading', { name: "The Bin's verdict" })).toBeVisible();
    await expectNoAxeViolations(page, `verdict ${theme}`);
    await expectHitTargets(page, `verdict ${theme}`);
    await shot(page, `verdict-${theme}`);
    await page.getByRole('button', { name: 'Share to your party' }).click();
    await expect(page.getByRole('heading', { name: 'Share card' })).toBeVisible();
    await expectNoAxeViolations(page, `share ${theme}`);
    await expectHitTargets(page, `share ${theme}`);
    await shot(page, `share-${theme}`);
    await page.getByRole('button', { name: 'Back to the verdict' }).click();
    await page.getByRole('button', { name: "Back to today's dishes" }).click();
    await page.getByRole('button', { name: 'Cook chicken rice' }).click();
    await tap(page, 'durian').click();
    await tap(page, 'cheddar').click();
    await page.getByRole('button', { name: 'Plate it' }).click();
    await expect(page.getByText('Cursed plate', { exact: true })).toBeVisible();
    await expectNoAxeViolations(page, `verdict cursed ${theme}`);
    await shot(page, `verdict-cursed-${theme}`);
    await page.getByRole('button', { name: "Back to today's dishes" }).click();
    await page.getByRole('button', { name: 'Cursed Plates · 1' }).click();
    await expectNoAxeViolations(page, `cursed plates filled ${theme}`);
    await expectHitTargets(page, `cursed plates filled ${theme}`);
    await shot(page, `cursed-plates-filled-${theme}`);
  });
}
