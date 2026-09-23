# Claude Code kickoff prompt — Build-A-Dish

Before pasting: commit `BUILD-A-DISH.md` to `docs/BUILD-A-DISH.md` and the `prototype/` folder to `docs/prototype/` in the BaD repo. Then open Claude Code at the repo root and paste everything below the line. A second, shorter prompt for the day the ChatGPT assets arrive is at the end of this file.

---

You are building **Build-A-Dish (BaD)**, a mobile-first PWA minigame that lives inside the OraX app, for the Singapore and Kuala Lumpur market. This repo is empty apart from the design handoff in `docs/`.

## Read first, in this order
1. `docs/BUILD-A-DISH.md` — the locked design spec: rules, scoring, naming, copy, screens, tokens, data model. It is the source of truth. Where this prompt and the spec disagree, the spec wins.
2. `docs/prototype/Build-A-Dish.dc.html` — the clickable HTML prototype. It is a design reference, not code to ship. Its logic script (the `class Component` at the bottom) is the reference implementation of the judge, the procedural namer, the Bin's lines, the habit tagger and the sigil classifier — port those faithfully, including thresholds, constants and rule order. Serve `docs/prototype/` over http and click through every screen before writing code.
3. `docs/prototype/_ds/*/tokens/*.css`, `styles.css` and `readme.md` — the OraX design tokens and component conventions. Copy tokens and fonts into the app. Never invent colours, type, spacing or radii; every visual value is a token.

## Assets — do not create any
Illustrations (the Bin character, dish renders, cursed plates, intro scenes, mess splats, ingredient icons, PWA icons) are being produced separately and will be dropped into `public/assets/bad/` later with a `manifest.json` (the contract is `docs/ASSET_BRIEF_CHATGPT.md`, read it so your slots match).
Until then:
- Render a **neutral placeholder** in every image position: `--surface-sunken` ground, 1px dashed `--border-strong`, the slot's radius, no text inside larger than a caption naming the slot (e.g. `Bin`), no icons, no emoji, no generated or stock art, no SVG drawings of food.
- Build one `<Art slot="bin" pose="neutral" size={140} />` style component that reads `manifest.json` at runtime: if the key resolves, it renders the image; if not, it renders the placeholder. All art goes through it, so wiring later is a manifest drop, not a refactor.
- Do **not** generate, draw, download or commit any image beyond a 1×1 transparent PNG used in tests. Do not touch `public/assets/bad/` at all. The existing OraX assets (class boards, gem SVGs, logo) are copied from `docs/prototype/orax/assets/` as-is and never modified or recoloured.

## Stack
Use this unless you have a strong reason not to — say so in your first message before starting.
- Vite + React 18 + TypeScript (strict). Mobile-first at 390px, fluid above. PWA via `vite-plugin-pwa` (installable, offline app shell).
- State: zustand. Routing: react-router with a memory router inside the Dish tab so the game can be embedded.
- Styling: CSS modules using the OraX custom properties only. Dark theme default, `data-theme="light"` peer. Fonts self-hosted from the handoff woff2 files: Space Grotesk for text, Silkscreen only for pixel labels and taglines. No Tailwind palette, no emoji, no gradients, no icon fonts — Lucide icons at 1.5px stroke.
- Tests: vitest + @testing-library/react for units and components; Playwright for end-to-end on a 390×844 mobile profile; ESLint (typescript-eslint, jsx-a11y) + Prettier; `tsc --noEmit`.
- Backend boundary: define a `PoolService` interface first (`getToday`, `pick`, `swap`, `takePortion`, `returnPortion`, `plate`, `getWall`, `getThread`, `post`, `getGallery`, `setSignature`, `subscribe`). **Phases 1–4 implement it in-browser** as `MockPoolService`: seeded stock per city, simulated cooks who pick and plate over time so counts and the wall move, a city clock in UTC+8 with a dev override for Leftovers hour and for the time of day, persistence in IndexedDB (idb-keyval) with localStorage fallback. A real API comes later — keep everything behind the interface.

## Project shape
- `src/game/` — pure logic, no React imports: `judge.ts`, `namer.ts`, `sigils.ts`, `pool.ts` (cap, Leftovers rule, stock states), `habits.ts`, `content/` (dishes, ingredients, Bin lines).
- `src/services/` — `PoolService` interface, `MockPoolService`, `clock.ts`.
- `src/screens/` — Intro, Board, Station, Verdict, Wall, Thread, CursedPlates, ShareCard, plus static Play / Classes / You reproductions of the prototype for context.
- `src/components/` — Button, Chip, GemSocket, ClassCard, Avatar, Toast, TabBar, SigilPad, PantryCard, PlateChip, StoneRow, Art.
- Export the whole Dish tab as one `<BuildADish city profile service />` component so it can be mounted inside the real OraX app later.

## Agentic checks — run these yourself, every phase, before you report
You are expected to verify your own work, not describe it. Nothing is "done" until all of the following pass and you have pasted the evidence (command output, test counts, screenshot paths) into your phase report.
1. **Static:** `pnpm typecheck`, `pnpm lint`, `pnpm format:check` — zero errors, zero warnings.
2. **Unit:** `pnpm test` — game logic has ≥ 90% line coverage. Required cases at minimum:
   - judge: clean chicken rice (all six, prepped) → 3 stones, `Clean plate`; same plate with 10 × ginger sauce in Leftovers hour → `Ten portions of ginger sauce. Ten. I counted.` + `Leftovers hour` chip + style `Unhinged`; durian added → the durian line; two extras → cursed, `Wasteways` line present; two burnt items → cursed; empty plate → `You plated air. Bold. Pointless, but bold.`, name `Empty Plate of unknown origin`; raw rice → the rice line and `rawRice` habit; flair caps at +10.
   - namer: same plate → same name (determinism, 100 random plates run twice); prefix and suffix precedence per spec 3.6.
   - sigils: synthesised paths — a 3-turn spiral → HEAT; a straight upward 80px flick → PLATE; a horizontal 70%-width sweep with mess → CLEAN and without mess → CUT; a 20px scribble → ignored; a fast slash → flair +1.
   - pool: 4th tap refused outside Leftovers hour with the rotating remark; 4th tap allowed in Leftovers hour only when stock > 25; Gone at 0; return restores stock; swap returns all portions; one swap only.
   - habits: each of the six habit strings reachable; counters persist across reload.
3. **Component:** Toast auto-dismisses at 2.8s and has `role="status"`; Board CTA goes through all five states in order; PantryCard shows `Running low` ≤ 25 and `Gone` at 0; StoneRow renders the player's gem shape (round / rounded square / rotated diamond).
4. **End-to-end (Playwright, 390×844, dark and light):** first launch shows the intro once and never again after reload; pick → cook → tap portions → draw a spiral and a flick with `page.mouse` → verdict → share (`Sent to your party`) → wall shows your row pinned in its tier → thread → back to board shows `Cooking today`; Leftovers hour override unlocks 10 portions; a second pick offers exactly one swap; offline (`context.setOffline(true)`) still loads the shell and the board from cache.
5. **Accessibility:** axe-core via `@axe-core/playwright` on every screen with zero violations; all interactive elements ≥ 44×44 (write an assertion that walks every `button`/`a`); keyboard-only run of the full flow using the button equivalents (`Cut`, `Heat`, `Plate it`); `prefers-reduced-motion` emulation removes the toast slide and sigil scale-in.
6. **Visual:** Playwright screenshots of all eleven screens in both themes into `e2e/__screenshots__/`, and a side-by-side check against the prototype (serve `docs/prototype/` and screenshot the same screens at the same size). List every deviation; fix any that are not deliberate.
7. **PWA:** Lighthouse (mobile) ≥ 90 on Performance, Accessibility, Best Practices; PWA installable; bundle ≤ 250 KB gzipped excluding fonts and art. Manifest and service worker present, `assets/bad/**` precached only when the folder exists.
8. **Spec conformance sweep:** grep every user-facing string in `src/` against `docs/BUILD-A-DISH.md` — every Bin line, label, CTA and caption must match character for character (full stops, `×`, `·`, no exclamation marks). Report any string that is not in the spec.

Put all of this behind `pnpm check` (static + unit + component) and `pnpm check:full` (adds e2e, axe, Lighthouse). CI: a GitHub Actions workflow that runs `check:full` on every push.

## Build order — stop for my review after each phase with the dev server running and the phase report pasted
1. **Skeleton.** Tokens, fonts, app shell with the four-tab bar (Play · Classes · You · Dish), `Art` component + placeholder rendering, Intro shown once and persisted, Today's dishes board with live countdown, counts + avatars, pick and one swap with the exact CTA states, Leftovers hour banner, Cursed Plates link, Bin-eaten footer, Bin toast, MockPoolService with simulated cooks. `pnpm check` green.
2. **Station.** Pantry grid with plenty / Running low / Gone states, tap-to-add with the soft cap and rotating refusals, minus, Pantry extras, optional bread for sup kambing, plate chips with prep state, selection, the Sigil pad with stroke trail, sigil word flash, the four gestures, flair, mess + splats (placeholder blobs, not art) + wipe, Fling to the Bin, `Plate it`, `Cut` / `Heat` button equivalents behind a "Prefer buttons" setting. `pnpm check` green, sigil and pool tests complete.
3. **Verdict.** Judge, namer, label, Bin line priority, stones as GemSockets in the player's gem, chips, Wasteways line and counter, Set as Signature Dish, Share card (Send to party marks sent; Save image renders the card to PNG with html-to-image), Cursed Plates gallery. Judge and namer tests complete; determinism test passes.
4. **Social + PWA.** Same-dish wall sorted by stones with the player pinned in their tier, same-dish thread against the mock service (report and mute stubs), You-tab habits and Signature Dish, web manifest, service worker, offline shell. `pnpm check:full` green, Lighthouse and axe reports attached, visual comparison attached.

## Rules of engagement
- Copy, thresholds and rule order in the spec are fixed. If something is ambiguous or looks wrong, list it under **Questions** in your first message and take the spec's literal reading meanwhile. Do not "improve" the Bin's lines.
- Keep components small and the game logic pure. Type everything from the spec's data model. No `any`.
- Do not add features, screens, settings or copy that are not in the spec. If you think something is missing, ask.
- Commit after each phase with a conventional-commit message and a one-paragraph summary of what to test on a phone. Never force-push.
- Phase report format: what shipped · check output (paste) · screenshots (paths) · deviations from spec (with reason) · questions · next.

First message back to me: your Phase 1 plan, your Questions, and any deviations from the stack. Then build Phase 1.

---

## Follow-up prompt — paste once the ChatGPT assets are unzipped into `public/assets/bad/`

> The illustration set has landed in `public/assets/bad/` with a `manifest.json`, per `docs/ASSET_BRIEF_CHATGPT.md`. First, verify the drop: a script that checks every manifest entry exists, has the stated pixel size, has true alpha (except `icon/*`), and lists anything in the brief that is missing. Report before wiring. Then wire per `docs/BUILD-A-DISH.md` through the existing `Art` component only: Bin pose by verdict (3 stones → approving, 2 → judging, 1 → neutral, cursed → disgusted, fling → eating for 700ms, Leftovers banner → full); dish render by dish id on Verdict, Signature Dish and Share card; cursed render by the Base word of the generated name, `empty.png` for an empty plate; intro illustrations in the three intro slots; random splat 1–4 for mess; ingredient icons on Pantry cards when present in the manifest, else the current text-only card; PWA icons in the web manifest. Missing keys keep the placeholder. Lazy-load 1024px files, use the 512px copies under 200px display size, alt text from the spec. Do not edit, crop, recolour or re-export any image — if a file is wrong, report it for the illustrator. Extend the e2e visual run and the PWA precache to include the assets, re-run `pnpm check:full`, and paste the results.
