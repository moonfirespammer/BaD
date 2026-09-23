import { expect, test } from '@playwright/test';
import { THEMES, expectHitTargets, expectNoAxeViolations, open, shot, skipIntro, toast } from './helpers';

test.describe('Phase 1: intro, board, tabs', () => {
  test('first launch shows the intro once and never again after reload', async ({ page }) => {
    await open(page);
    await expect(
      page.getByRole('heading', { name: 'Five dishes a day. One shelf for the whole city.' }),
    ).toBeVisible();
    await expect(
      page.getByText(
        'Everyone in Singapore cooks from the same Pantry. When the ginger sauce runs out, it is out.',
      ),
    ).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Main' })).toBeVisible(); // spec §5: tab bar hidden only on Station, Verdict, Wall, Thread, Share
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Tap to add a portion. Stroke to cook.' })).toBeVisible();
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'The Bin judges everything.' })).toBeVisible();
    await page.getByRole('button', { name: 'Start cooking', exact: true }).click();
    await expect(page.getByRole('heading', { name: "Today's dishes" })).toBeVisible();
    await page.reload();
    await page.locator('[data-testid="build-a-dish"]').waitFor();
    await expect(page.getByRole('heading', { name: "Today's dishes" })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Skip', exact: true })).toHaveCount(0);
  });

  test('pick, cook CTA, Cooking today, and exactly one swap', async ({ page }) => {
    await open(page, { clock: '2026-09-23T10:00' });
    await skipIntro(page);
    const cta = page.getByRole('button', { name: /^(Pick|Cook|Swap|No swaps)/ });
    await expect(cta).toHaveText('Pick a dish');
    await expect(cta).toBeDisabled();
    await expect(page.getByText(/^RESETS 1[34]:\d\d:\d\d$/)).toBeVisible();
    await page.getByRole('button', { name: /^Hainanese chicken rice/ }).click();
    await expect(cta).toHaveText('Pick chicken rice for today');
    await cta.click();
    await expect(toast(page)).toContainText('Chicken rice. The whole city can see that now.');
    await expect(cta).toHaveText('Cook chicken rice');
    await expect(page.getByText('Cooking today')).toBeVisible();
    await expect(page.getByText(/^You are in\. \d+ cooking chicken rice right now\.$/)).toBeVisible();
    await expect(toast(page)).toBeHidden({ timeout: 4000 }); // auto-dismiss 2.8s
    await page.getByRole('button', { name: /^Spaghetti aglio e olio/ }).click();
    await expect(cta).toHaveText('Swap to aglio e olio · 1 swap left');
    await cta.click();
    await expect(toast(page)).toContainText('Swapped to aglio e olio. That was your one.');
    await expect(cta).toHaveText('Cook aglio e olio');
    await page.getByRole('button', { name: /^Nasi lemak/ }).click();
    await expect(cta).toHaveText('No swaps left today');
    await expect(cta).toBeDisabled();
    await page.reload();
    await page.locator('[data-testid="build-a-dish"]').waitFor();
    await expect(page.getByText('Cooking today')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Spaghetti aglio e olio/ })).toContainText(
      'Cooking today',
    );
  });

  test('Leftovers hour override shows the banner on the board', async ({ page }) => {
    await open(page, { clock: '2026-09-23T21:30' });
    await skipIntro(page);
    await expect(page.getByText('LEFTOVERS HOUR · UNTIL 00:00')).toBeVisible();
    await expect(
      page.getByText('Portion caps are off on anything the city still has plenty of.'),
    ).toBeVisible();
    await expect(page.getByText(/^RESETS 02:29:5\d$/)).toBeVisible();
    await shot(page, 'board-leftovers-dark');
    const before = await open(page, { clock: '2026-09-23T20:59' }).then(() =>
      page.getByText('LEFTOVERS HOUR · UNTIL 00:00').count(),
    );
    expect(before).toBe(0);
  });

  test('Cursed Plates link opens the empty gallery and back returns', async ({ page }) => {
    await open(page);
    await skipIntro(page);
    await page.getByRole('button', { name: 'Cursed Plates · 0' }).click();
    await expect(page.getByRole('heading', { name: 'Cursed Plates · 0' })).toBeVisible();
    await expect(page.getByText('Everything the Bin refused to forget.')).toBeVisible();
    await page.getByRole('button', { name: "Back to today's dishes" }).click();
    await expect(page.getByRole('heading', { name: "Today's dishes" })).toBeVisible();
  });

  test('the four tabs and the static Play, Classes and You screens', async ({ page }) => {
    await open(page);
    await skipIntro(page);
    const nav = page.getByRole('navigation', { name: 'Main' });
    await nav.getByRole('button', { name: 'Play' }).click();
    await expect(page.getByRole('heading', { name: 'Your party' })).toBeVisible();
    await expect(page.getByText(/^\d+ cooking in Singapore · resets \d\d:\d\d:\d\d$/)).toBeVisible();
    await nav.getByRole('button', { name: 'Classes' }).click();
    await expect(page.getByRole('heading', { name: 'Choose your class' })).toBeVisible();
    await page.getByRole('button', { name: 'Emerald Stirrer' }).click();
    await nav.getByRole('button', { name: 'You' }).click();
    await expect(page.getByRole('heading', { name: 'You' })).toBeVisible();
    await expect(page.getByText('No Signature Dish yet. Cook one and keep it.')).toBeVisible();
    await expect(page.getByText('Doubles the chilli ×0')).toBeVisible();
    await expect(page.getByText('Emerald Stirrer · 0 plates this month')).toBeVisible();
    await page.getByRole('button', { name: "Today's dishes" }).click();
    await expect(page.getByRole('heading', { name: "Today's dishes" })).toBeVisible();
    await nav.getByRole('button', { name: 'Play' }).click();
    await page.getByRole('button', { name: /^Build-A-Dish/ }).click();
    await expect(page.getByRole('heading', { name: "Today's dishes" })).toBeVisible();
  });

  test('keyboard-only: pick a dish with Tab and Enter', async ({ page }) => {
    await open(page);
    await page.keyboard.press('Tab'); // Next
    await page.keyboard.press('Tab'); // Skip
    await page.keyboard.press('Enter');
    await expect(page.getByRole('heading', { name: "Today's dishes" })).toBeVisible();
    const card = page.getByRole('button', { name: /^Hainanese chicken rice/ });
    await card.focus();
    await page.keyboard.press('Enter');
    const cta = page.getByRole('button', { name: 'Pick chicken rice for today' });
    await cta.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Cook chicken rice' })).toBeVisible();
  });

  test('prefers-reduced-motion removes the toast animation', async ({ page }) => {
    await open(page, { reducedMotion: true });
    await skipIntro(page);
    await page.getByRole('button', { name: /^Nasi lemak/ }).click();
    await page.getByRole('button', { name: 'Pick nasi lemak for today' }).click();
    const card = toast(page);
    await expect(card).toBeVisible();
    const anim = await card.evaluate((el) => getComputedStyle(el).animationName);
    expect(anim).toBe('none');
  });

  test('offline: the shell still loads from cache', async ({ page, context }) => {
    test.skip(true, 'Service worker and offline shell arrive in Phase 4');
    await context.setOffline(true);
    await page.goto('/');
  });
});

for (const theme of THEMES) {
  test.describe(`${theme} theme: axe, hit targets and screenshots`, () => {
    test(`intro, board, cursed plates, play, classes, you (${theme})`, async ({ page }) => {
      await open(page, { theme, clock: '2026-09-23T10:00' });
      await expectNoAxeViolations(page, `intro ${theme}`);
      await expectHitTargets(page, `intro ${theme}`);
      await shot(page, `intro-${theme}`);
      await skipIntro(page);
      await expectNoAxeViolations(page, `board ${theme}`);
      await expectHitTargets(page, `board ${theme}`);
      await shot(page, `board-${theme}`);
      await page.getByRole('button', { name: /^Hainanese chicken rice/ }).click();
      await page.getByRole('button', { name: 'Pick chicken rice for today' }).click();
      await expect(toast(page)).toBeVisible();
      await expectNoAxeViolations(page, `board picked ${theme}`);
      await shot(page, `board-picked-${theme}`);
      await page.getByRole('button', { name: 'Cursed Plates · 0' }).click();
      await expectNoAxeViolations(page, `cursed ${theme}`);
      await expectHitTargets(page, `cursed ${theme}`);
      await shot(page, `cursed-plates-${theme}`);
      const nav = page.getByRole('navigation', { name: 'Main' });
      for (const [tab, name] of [
        ['Play', 'play'],
        ['Classes', 'classes'],
        ['You', 'you'],
      ] as const) {
        await nav.getByRole('button', { name: tab }).click();
        await expectNoAxeViolations(page, `${name} ${theme}`);
        await expectHitTargets(page, `${name} ${theme}`);
        await shot(page, `${name}-${theme}`);
      }
    });
  });
}
