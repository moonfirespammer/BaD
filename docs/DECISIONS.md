# Build-A-Dish — decisions log

Precedence when building: **owner rulings below** › `BUILD-A-DISH.md` (spec) › `CLAUDE_CODE_PROMPT.md` › prototype.
Each later phase adds its rulings here. A bare `Qn` in the Phase 1 sections is an owner ruling; from Phase 2 on,
owner rulings are cited as "ruling Qn" and items of the questions register as "register Qn" (the numberings collide).

## Owner rulings — Phase 1 questions (23 Sep 2026)

| # | Question | Ruling |
| --- | --- | --- |
| Q1 | `{dish}` naming, Sup kambing | Short name, lower-cased mid-sentence. Sup kambing is shown as **Mutton soup**, with the local name "Sup kambing" as a caption and tooltip. |
| Q2 | Tab bar on the Intro | Spec literal: visible. |
| Q3 | Leftovers banner caption | Cap of 3 portions per item until the last hours of the day, then people can go wild. Banner caption uses the prototype text (spec leaves it blank). |
| Q4 | Fresh profile | Spec: zero counters, no seeded cursed plates. |
| Q5 | Board card meta | No counts. One stock word per dish — **plenty · moderate · running low · all out!** — in different colours. A dish's **main ingredient cannot run out**. |
| Q6 | Bin-eaten counter | Derived from city activity, thousands separator, Board and Verdict footers. |
| Q7 | Cooking count | Server side: includes the player once, moves on swap. |
| Q8 | Avatars on a dish card | The player's own avatar appears on their picked dish, for comparison. |
| Q9 | Dev overrides | Implementer's choice: URL parameters `?clock=`, `?leftovers=` (game), `?city=`, `?theme=` (stand-in host only). |
| Q10 | Cuisine tags | In the data but hidden. Categories: western, asian, chinese, italian, malay-indo, indian. |
| Q11 | Day reset | The same for everyone, 00:00 city time. |
| Q12 | Classes and gems | Nine classes, each available in all three gems. |
| Q13 | Card borders | Spec: 1px `--border`, 2px `--brand` when selected. |
| Q14 | Data-model additions | Allowed, reported (below). |

## Owner decisions — Phase 1 review (23 Sep 2026)

1. **Morning stock**: every shelf starts the day above 25, so shelves run out only through play (the prototype's table was a mid-day snapshot with cucumber and roti at 0).
2. **All out but still pickable**: follows from 1; only happens late in the day.
3. **Bin toast position**: kept where the spec puts it (bottom 112px), even though it briefly covers the lower cards.
4. **Empty Cursed Plates**: stays blank — the spec gives no empty-state line and no copy is invented.

Implementation choices under those rulings: stock bands are plenty > 50, moderate 26–50, running low 1–25, all out 0.
Leftovers hour lifts the cap above 25 (plenty and moderate), per spec §3.3.

## Data-model additions to spec §7

| Where | Addition | Why |
| --- | --- | --- |
| `Profile` | `id: string` | `Pick`, `WallEntry` and `ThreadMessage` carry a `playerId`; the profile had none. |
| `Profile`, `WallEntry`, `ThreadMessage` | `figure: Figure` | Avatars are cropped per figure (spec §6). |
| `Figure` | `'t1m' \| 't1f' \| 't2m' \| 't2f'` | Narrows `DayBoard.cooks[].figure` from `string`. |
| `Cook` | `{ classKey, figure }` | Names the `DayBoard.cooks` element type. |
| `Habits` | `month: 'YYYY-MM'` | Counters are "this month" (spec §3.9); they reset when the month changes. |
| `SavedVerdict` | `Verdict & { date }` | Names the type used by `signature` and `cursedPlates`. |
| `Verdict` | `dishId`, `key`, `flags { chilli, rawRice }` | Signature and render lookups, the namer seed, habit counters. |
| `Dish` | `local?`, `cuisines`, `main` | Q1, Q10, Q5. |
| `Ingredient` | `assetKey` | Maps prototype ids to the asset brief's file keys. |
| `StockState` | `'plenty' \| 'moderate' \| 'low' \| 'gone'` | Q5 (spec had three states). |
| `PoolService` | `getPick`, `getPlate`, `fling`, `report`, `mute` | Restore state on reload; fling bumps the Bin-eaten counter (spec §3.4); moderation stubs (Phase 4). |
| `<BuildADish>` | `clock?`, `onImmersiveChange?` props | Time source for tests and dev; lets the host hide its tab bar (spec §5). |
| `PoolService` | `saveDraft(plate)` (Phase 2) | The in-progress plate's prep, flair and mess survive a reload; portions stay server-owned. |
| `Profile` | `preferButtons?: boolean` (Phase 2) | Spec §10 "Prefer buttons" setting (Cut and Heat buttons under the pad). |
| `<Art>` | `placeholder: 'box' \| 'blob'` (Phase 2) | Mess splats go through Art (slot `mess`, `splat-1…4`) with the spec's blob as the stand-in. |
| `PoolError` | code `'not-on-plate'` (Phase 2 review) | A fling of an ingredient no longer on the plate (double tap) is refused instead of adding mess. |

## Stack deviations

- **React 19 / react-router 7** instead of React 18: the OraX host app runs React 19.1 with react-router-dom 7.9, and one app cannot mix React majors.
- Version pins for compatibility: Vite 7, ESLint 9, TypeScript 5.9, Playwright 1.56.1.

## Deliberate visual deviations from the prototype

- Dish cards: stock word instead of ingredient counts, no cuisine caption (Q5, Q10); "all out!" is a ruby chip because `--danger` text is 4.34:1 on a raised card.
- Class tiles sit on the sunken ground in dark and the raised ground in light, so every class colour reaches 4.5:1.
- Card borders 1px (prototype 2px), per Q13.
- Picked dish no longer outlined while another dish is selected (spec: 2px only when selected).

## Phase 2 (Station) — defaults taken where the spec is silent or ambiguous

These follow the questions register's literal readings; each is listed in the Phase 2 report for the owner.

- **Header**: dish name with ellipsis; caption is the local name (Mutton soup → "Sup kambing", ruling Q1) since cuisine tags are hidden (ruling Q10); countdown reads `RESETS hh:mm:ss` (spec §3.1).
- **Pantry state words**: spec §2/§5 — only `Running low` and `Gone` show on Pantry cards (the Board's four stock words, ruling Q5, apply to the Board only). `Running low` is never shortened to the prototype's "Low".
- **Cap refusal**: the three lines rotate per session (1st, 2nd, 3rd refusal …); the prototype indexed by portion count and never rotated.
- **Fling remark**: rotates per fling; flung portions are eaten (Phase 1 fix). Fling adds mess (spec) and therefore a splat (one splat per mess point).
- **Taps**: every Pantry tap selects the ingredient, including refused and Gone taps (prototype).
- **Strokes**: flair counts on every fast stroke; PLATE and CLEAN need no target; CUT/HEAT without a target flash the word and say `Strokes need a target. Tap something first.` (prototype order).
- **Wipe threshold**: length ≥ 55 % of the pad width (spec ≥; prototype used >).
- **Plate it / flick up**: flashes PLATE and calls `PoolService.plate`; the judge and the Verdict arrive in Phase 3.
- **Prefer buttons**: a switch directly under the sigil pad reveals `Cut` and `Heat`; persisted on the profile. No wipe button (mess is an optional toy, spec §2).
- **Accessibility**: a Gone card's state caption sits inside its `aria-disabled` add button (an inactive control, exempt from the 4.5:1 text rule), keeping the spec's `--ink-faint`. The empty-plate caption uses `--ink-muted` (the spec gives no colour). `Fling to the Bin` has a 44px hit target (prototype 36px).
- **Pad hint**: the spec's `SLASH TO CUT · SPIRAL TO HEAT · FLICK UP TO PLATE` wraps to two centred lines (the prototype shortened it to one).

## Phase 2 review fixes (23 Sep 2026)

- **Midnight**: plate writes (take, return, fling, draft) need today's pick, so a tap, stroke or fling in the moment after 00:00 is refused and the Station goes straight back to the Board with a clean day (spec §3.1). A result that lands after the rollover is dropped.
- **Double taps**: a second `Fling to the Bin` while the first is in flight does nothing; the service refuses a fling of an item no longer on the plate.
- **One finger draws**: the sigil pad follows the primary pointer only, so a pinch or a second finger never cooks anything. The classifier is unchanged.
- **Screen readers**: the flashed sigil word sits in a polite live region; each minus button is named after its ingredient ("Remove one portion Ginger sauce"); a Pantry add button includes the held count (the `×n` badge moved inside it, same place on screen); keyboard focus stays on the plate card after a fling and on the card after minus removes the last portion.
- **Narrow phones**: `MESS ×n · SWEEP TO WIPE` wraps to two right-aligned lines instead of overprinting `SIGIL PAD` below about 360px (visual deviation; the spec's target is 390px).
- **Kept as the prototype has it** (reviewed, not changed): the shared header measures 61px (the prototype's 56px is a min-height); Pantry names use the prototype's 20px leading; below 360px some names break mid-word and `Running low` touches the minus button.

