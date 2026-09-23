# Build-A-Dish — decisions log

Precedence when building: **owner rulings below** › `BUILD-A-DISH.md` (spec) › `CLAUDE_CODE_PROMPT.md` › prototype.
Each later phase adds its rulings here.

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

## Stack deviations

- **React 19 / react-router 7** instead of React 18: the OraX host app runs React 19.1 with react-router-dom 7.9, and one app cannot mix React majors.
- Version pins for compatibility: Vite 7, ESLint 9, TypeScript 5.9, Playwright 1.56.1.

## Deliberate visual deviations from the prototype

- Dish cards: stock word instead of ingredient counts, no cuisine caption (Q5, Q10); "all out!" is a ruby chip because `--danger` text is 4.34:1 on a raised card.
- Class tiles sit on the sunken ground in dark and the raised ground in light, so every class colour reaches 4.5:1.
- Card borders 1px (prototype 2px), per Q13.
- Picked dish no longer outlined while another dish is selected (spec: 2px only when selected).
