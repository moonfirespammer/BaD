# Build-A-Dish (BaD) — Design Spec v1

Status: design locked for the v1 build · 23 Sep 2026
Prototype: `docs/prototype/Build-A-Dish.dc.html` (clickable, OraX design system, 390×844)
Markets: Singapore, Kuala Lumpur

> The prototype and this document are **design references**. The build recreates them in the app's own stack (see `CLAUDE_CODE_PROMPT.md`), not by shipping the HTML. Fidelity: **high** — colours, type, spacing and copy are final; illustration and character art are placeholders.

---

## 1. What it is

Build-A-Dish is a daily, city-shared cooking minigame inside the OraX PWA. It lives in a fourth tab, **Dish** (Play · Classes · You · Dish). Every day each city gets five dishes and one shared Pantry. You commit to one dish, build it by tapping portions and stroking three loose sigils, and **the Bin** — the game's judge — names the plate, rates it in your own gem, and puts it on a wall next to everyone else who cooked the same thing.

It is a personality machine for OraX: portions, prep and ingredient choices leave a visible fingerprint (portion style, habit tags, Signature Dish), and the identity the player already picked (class + gem) frames every plate.

---

## 2. Decisions — kept, cut, new

### Kept from the earlier docs
- **The Bin as judge, centre stage** (Boss summary's Trash Entity). Dry and judgemental. The payoff beat of every plate.
- **Always produce something.** No fail state. Procedural cursed names. A Cursed Plates gallery (Gameplay Loop v2's "always a dish").
- **Roles, states and dish families** drive recognition and naming (Gameplay Loop v2).
- **The ingredient book** becomes the shared city Pantry.
- **Sigils** (Magical Cooking), reduced to three gesture families: slash = cut, spiral = heat, flick up = plate. A horizontal sweep wipes mess.
- **Signature Dish** on the profile. **Mess and wiping** survive as an optional toy.
- **OraX classes and gems** are the identity layer. Food-Lore's Culinary Archetypes are parked (could return as hidden flavour in verdicts).

### Cut or parked
- Unity 2.5D room, physics, soft landing, slingshot disposal → web-native 2D. Disposal is "Fling to the Bin" + a remark.
- Wand and Culinary Focus → flavour text only.
- QTE timing bars, drag-and-drop plating, class origin stories.
- Per-ingredient stock bars → only **Running low** and **Gone** states show.

### New in this pass
- Today's dishes: five per day, Asian and Western, with live cooking counts and avatars.
- City Pantry with Running low / Gone states; soft cap of 3 portions per ingredient.
- **Leftovers hour** (21:00–00:00 city time): caps lift on anything still plentiful.
- Same-dish **wall** sorted by the Bin's rating (most cursed at the bottom) + a same-dish **thread**.
- **Share card**: dish name, verdict, class avatar, gem, stones, city, date.
- **Habit tags** accumulated over time.

### How the six original asks are met
1. Creative with quantity and assortment → tap-to-add portions (badge ×n), Pantry extras shared across all dishes, free build order, plate whenever.
2. Pick a daily dish to see who else → board shows live count + three avatars per dish; picking is a commitment with one swap; wall + thread after plating.
3. Scarcity → one pool per city per ingredient. A tap takes one unit. Running low ≤ 25, Gone = 0.
4. Royally mess it up → no fail; cursed names; Bin disgust lines; Cursed Plates gallery; Wasteways hint.
5. Bypass quantity when plenty is left → Leftovers hour lifts the cap on "plenty" ingredients only (ten portions of ginger sauce, legally).
6. Asian + Western → seed set: Hainanese chicken rice, spaghetti aglio e olio, sup kambing (bread optional), nasi lemak, fish and chips.

---

## 3. Rules

### 3.1 Day, city, reset
- The day resets at **00:00 city time** (Asia/Singapore, Asia/Kuala_Lumpur, both UTC+8). Pool, picks, wall and thread reset together.
- Pool scope = **city**. A player belongs to one city.
- Countdown `Resets hh:mm:ss` is visible on Board, Station and Verdict.
- **Leftovers hour** = 21:00–00:00 city time. Banner on Board and Station.

### 3.2 Picking
- Five dishes per day. Tap a card to select; the sticky CTA commits: `Pick {dish} for today`.
- **One dish per day, one swap.** CTA states: `Pick a dish` (disabled) → `Pick {dish} for today` → `Cook {dish}` (picked & selected) → `Swap to {dish} · 1 swap left` → `No swaps left today` (disabled).
- Swapping clears the plate; taken portions go back to the pool.
- Cooking count = players who have committed to the dish today (not only finished plates). The wall header shows `{dish} · {n} plates today`.
- Picked card shows a `Cooking today` chip. Board shows `You are in. {n} cooking {dish} right now.`
- Bin remark on pick: `{Dish}. The whole city can see that now.` On swap: `Swapped to {dish}. That was your one.`

### 3.3 Pantry
- Each dish has 4–6 **required** ingredients. Sup kambing has an **optional** bread row (baguette, roti, sourdough); the dish counts without bread.
- **Pantry extras** (chilli padi, durian, cheddar, ice cream) are shared across all five dishes, always visible, always off-recipe.
- Ingredient attributes: `needsCut`, `needsHeat`, `tags` ⊂ {protein, rice, carb, sauce, chilli}, `extra`.
- Stock states (units = portions): **plenty** (> 25) · **Running low** (1–25) · **Gone** (0).
- Tap = add one portion (stock −1). Minus button = remove one (stock +1).
- **Soft cap: 3 portions per ingredient.** The 4th tap is refused with a rotating Bin remark:
  - `Three is plenty. Come back at leftovers hour.`
  - `The whole city eats from this shelf. Three.`
  - `No. Leftovers hour starts at 21:00.`
- **Leftovers hour:** the cap is off for ingredients in *plenty* state only. Remarks: 4th portion `Leftovers hour. Go on, then. I am watching.` · 10th portion `Ten portions of {ingredient}. Ten. I am counting.`
- Gone: tapping says `Gone. {City} ate it all before you.`
- Pool sizing (tunable, server-side): `stock₀ = round(expectedPickers × 3 × 0.8)` per required ingredient, so roughly the last fifth of pickers feel the squeeze; extras at 2× so they never run dry before Leftovers hour. The prototype uses fixed seed values.

### 3.4 Building (Station)
- **Free order.** The plate lists items as chips `{Ingredient} ×n` with their prep state. Tapping a chip selects it; strokes apply to the selected item. Adding a portion also selects that ingredient.
- Prep levels: `cut` 0–3 (—, cut, diced, dust) · `heat` 0–3 (—, cooked, seared, burnt). Reaching **burnt** adds +1 mess and a splat on the pad.
- **Sigil pad** (full width, 150px). Pointer gestures. Never fails. Classification on release:
  - Ignore strokes shorter than 24px or fewer than 4 points.
  - Total turning angle > 4.2 rad → **HEAT** (spiral)
  - Straightness (displacement ÷ length) > 0.7 and upward component > 60% of displacement → **PLATE** (flick up)
  - Straightness > 0.85, horizontal, length ≥ 55% of pad width, and mess > 0 → **CLEAN** (wipe). With no mess this is a CUT.
  - Straightness > 0.55 → **CUT** (slash)
  - Otherwise: turning > 2.4 → HEAT, else CUT
  - Fast stroke (> 0.9 px/ms and > 60px) → **+1 Flair**.
- The recognised word (CUT / HEAT / PLATE / CLEAN) flashes centred on the pad for 700ms; the stroke trail fades over 450ms.
- Stroke with nothing selected: `Strokes need a target. Tap something first.`
- Cut past dust: `The {x} is dust. It cannot get smaller.` Reaching dust: `That is dust now. Congratulations.`
- Heat past burnt: `It cannot get more burnt. It is trying.` Reaching burnt: `You burnt the {x}. It did nothing to you.`
- Wipe: mess → 0, splats cleared, `Cleaner. Not clean. Cleaner.`
- **Fling to the Bin** (selected item): removes the item, mess +1, city Bin-eaten counter +1. Rotating remark: `Rude. Delicious, but rude.` · `I was going to eat that anyway.` · `Noted. Everything is noted.`
- **Portion style** (live label): `Empty` (0 portions) · `Unhinged` (any item ≥ 5, or total > 2 × required count) · `Generous` (total > required count + 1) · `Neat`.
- Plate = flick up on the pad, or the `Plate it` button.

### 3.5 Judging (hidden score 0–100)
```
required = dish.ingredients          (optional bread is judged for prep but not coverage)
items    = plate items with n > 0
total    = Σ n
coverage = |required present| ÷ |required|

score = 100 − round((1 − coverage) × 50)
for each item on the recipe (required or optional):
    needsCut  && cut  == 0  → −8
    needsHeat && heat == 0  → −10   (rawRice = true if tag rice)
    !needsHeat && heat ≥ 1  → −4
    cut == 3                → −6
for each item (any):  heat == 3 → −15, burnt += 1
extras (items flagged extra)       → −20 each
excess = max(0, total − |required|) → −min(30, excess × 3)
max single-item portions ≥ 5        → −10
+ min(5, flair) × 2
clamp 0..100

cursed = total == 0 || score < 35 || extras ≥ 2 || burnt ≥ 2
stones = cursed ? 1 : score ≥ 75 ? 3 : score ≥ 45 ? 2 : 1
```
Stones render as 1–3 of **the player's own gem** (a Ruby player gets rubies).

### 3.6 Naming (deterministic)
Seed = FNV-1a 32-bit hash of `"{id}{n}{cut}{heat}|…" + dishId`, so the same plate always gets the same name.
- Cursed, empty → `Empty Plate of unknown origin`
- Cursed → `{Tone} {Base} {Detail}` + hint `meant to be {dish}`
  - Tones: Strange · Suspicious · Chaotic · Questionable · Cursed · Experimental · Unfortunate
  - Bases: Plate · Bowl · Creation · Mess · Heap · Accident
  - Details: of unknown origin · with too much confidence · gone slightly wrong · that should not exist
- Not cursed → `{prefix}{dish}{suffix}`
  - prefix (first match): any burnt → `Burnt ` · any protein at heat 2 → `Seared ` · style Generous → `Generous ` (dish lower-cased when prefixed)
  - suffix (first match): a sauce with n ≥ 4 → `, drowning in {sauce}` · exactly one extra → ` with {extra}` · coverage < 1 → `, missing something`

### 3.7 Label
- 3 stones: Neat → `Clean plate` · else `Academy acceptable`
- 2 stones: any sauce n ≥ 3 → `Saucy but controlled` · Generous → `Bold but messy` · else `Comforting`
- 1 stone: cursed → `The Bin has questions` · else `The plate lost the argument`

### 3.8 The Bin's line (first match wins)
1. Empty plate → `You plated air. Bold. Pointless, but bold.`
2. Durian present → `Durian. In {dish}. I will be filing a report.`
3. Any item ≥ 8 portions → `{Eight} portions of {item}. {Eight}. I counted.` (number words to twelve, numerals beyond)
4. Any burnt item → `You burnt the {item}. It did nothing to you.`
5. Raw rice → `The rice is raw. Rice is the easy part.`
6. Otherwise by stones, picked by hash:
   - 3 · `Fine. I have eaten worse on purpose.` · `Acceptable. Do not let it go to your head.` · `Clean plate. I have nothing to add, which annoys me.`
   - 2 · `Edible. That is the whole review.` · `You were close. Closeness is not a flavour.` · `The rice is doing all the work here.`
   - 1 · `I am a bin and even I have standards.` · `This plate lost an argument with itself.` · `I will eat it. I will not enjoy it. I never do.`

**Wasteways hints** (both chosen): when cursed and (extras ≥ 2 or score < 15) add `Something below said thank you. That is not normal.` And everywhere the footer counter reads `The Bin has eaten {n} plates in {city} today.` (city-wide plates + flings).

Voice rules: short declaratives, full stops, no exclamation marks, never cruel about the person, always about the plate. Oscar-the-Grouch dry.

### 3.9 Habits (one per plate, persisted counters)
First match: chilli-tagged portions ≥ 2 → `You doubled the chilli again · ×{n}` · rawRice → `Raw rice. Again.` · Unhinged → `Unhinged plate ×{n} this month` · 3 stones & Neat → `Neat plater, apparently` · sauce portions > protein portions → `Sauce first, as usual` · else `A new habit is forming`.
Profile counters: `chilli`, `rawRice`, `unhinged`, `plates` (this month). You tab shows them as chips: `Doubles the chilli ×n`, `Raw rice ×n`, `Unhinged plates ×n`.

### 3.10 Wall + thread
- Wall = every plate of that dish, that day, that city. Sorted by stones desc; **your row pinned first within its tier** and highlighted. Most cursed at the bottom.
- Row: avatar (class ring) · name · class name in class colour · variant name · `{style} · {Bin line}` · three mini stones in *that player's* gem.
- CTA: `Open the {dish} thread · {n}`.
- Thread: `Today only. Resets with the Pantry.` Message = avatar, name, time, text. Composer placeholder `Say something to the {dish} table`. Needs moderation (report + mute) before launch.

### 3.11 Cursed Plates
Player's own cursed plates, newest first. Reached from the Board link `Cursed Plates · {n}`. Card: render slot, name, `{hint} · {date}`, Bin line, one mini stone.

### 3.12 Share card
326px card: Logo + `BUILD-A-DISH` pixel label · overline `{CITY} · {date}` · dish name · Bin line · three GemSockets (44px) in the player's gem · divider · avatar 44 + name + class (class colour) + gem chip · OraX Tagline. Actions: `Send to your party` (→ `Sent to your party`, disabled) · `Save image`.

### 3.13 Signature Dish
From Verdict: `Set as Signature Dish` (→ `Signature Dish set`, disabled). Stored on the profile: render slot 72px, name, `{label} · {date}`, mini stones. Empty state on You: `No Signature Dish yet. Cook one and keep it.` + ghost `Today's dishes`.

### 3.14 First-time intro (shown once, persisted)
1. `Five dishes a day. One shelf for the whole city.` — `Everyone in {city} cooks from the same Pantry. When the ginger sauce runs out, it is out.`
2. `Tap to add a portion. Stroke to cook.` — `Slash to cut. Spiral to heat. Flick up to plate. Nothing you draw can fail.`
3. `The Bin judges everything.` — `Dry, hungry, never wrong. Even a disaster gets a name, a rating in your gem and a place on the wall.`
Buttons: `Next` / `Start cooking`, ghost `Skip`. Three 8px dots.

---

## 4. Seed content

| Dish | Cuisine tag | Required | Optional |
| --- | --- | --- | --- |
| Hainanese chicken rice | Hainanese · Singapore | Poached chicken (cut, heat, protein) · Chicken rice (heat, rice) · Ginger sauce (sauce) · Chilli sauce (sauce, chilli) · Cucumber (cut) · Dark soy (sauce) | — |
| Spaghetti aglio e olio | Italian | Spaghetti (heat, carb) · Garlic (cut, heat) · Olive oil (heat, sauce) · Chilli flakes (chilli) · Parsley (cut) · Parmesan | — |
| Sup kambing | Malay · Indian-Muslim | Mutton (cut, heat, protein) · Soup spices (heat) · Onion (cut, heat) · Coriander (cut) | Baguette (cut) · Roti (heat) · Sourdough (cut, heat) |
| Nasi lemak | Malay · Kuala Lumpur | Coconut rice (heat, rice) · Sambal (heat, sauce, chilli) · Fried anchovies (heat) · Peanuts (heat) · Egg (heat) · Cucumber (cut) | — |
| Fish and chips | British | Fish fillet (cut, heat, protein) · Batter (heat) · Potato (cut, heat) · Mushy peas (heat) · Tartare (sauce) · Lemon (cut) | — |

Pantry extras (all dishes): Chilli padi (cut, chilli) · Durian · Cheddar · Ice cream.
Cuisine tags can be hidden by a setting (prototype tweak `cuisineTag`).

---

## 5. Screens (390 × 844 · OraX dark default, `data-theme="light"` peer)

Shared: page gutter 16px · cards use 1px `--border` (2px `--brand` when selected), radius 12, `--surface-raised` · headers 56px with a 44px back button · sticky bottom CTA above a 1px `--border` · 44px minimum hit targets · Bin remarks appear as a toast (below).

**Tab bar** — 4 tabs, min-height 56, icon 24 + caption. Active `--brand-text`, inactive `--ink-muted`. Icons (Lucide via OraX `Icon`): Play `sparkles` · Classes `shirt` · You `user` · Dish `utensils`. Hidden on Station, Verdict, Wall, Thread, Share.

**Intro** — logo + `BUILD-A-DISH` pixel label · 220px illustration slot (radius 12) · headline `display-lg` · body-lg muted · dots · primary + ghost buttons.

**Today's dishes (Board)** — header: logo left; right column `RESETS hh:mm:ss` / `SINGAPORE` pixel labels · `Today's dishes` heading-md + `Cursed Plates · n` text link (`--brand-text`) · caption `One shelf for all of {city}. One dish a day, swap once.` · Leftovers banner (dashed 1px `--border-strong`, radius 6: pixel label `LEFTOVERS HOUR · UNTIL 00:00` in `--brand-text` + caption) · picked line body-strong `--brand-text` · five dish cards, gap 12: padding 16; name heading-sm; cuisine caption muted; `Cooking today` chip on the picked card; meta caption `{n} ingredients · {k} running low · {m} gone`; three stacked 24px avatars (−6px overlap, 2px class ring + 4px surface ring) + `{count}` body-strong + `cooking` caption · footer caption Bin counter · sticky CTA.

**Station** — header: back, dish name heading-sm (ellipsis) + cuisine caption, countdown pixel label · Leftovers banner · **Your plate** card: overline `YOUR PLATE` + pixel label `{STYLE} · FLAIR ×n`; empty caption `Nothing yet. Tap the Pantry to add a portion.`; item chips (min-height 44, radius 6, `--surface-sunken`, selected `--brand-subtle` + 2px `--brand`): body-strong `{Ingredient} ×n` over caption prep (`raw`, `cut · cooked`, `diced · seared`, `dust · burnt`); row `Strokes apply to {item}` + text button `Fling to the Bin` · **Sigil pad**: 150px, radius 22, `--surface-sunken`, `--shadow-socket` + 1px ring, `touch-action: none`; pixel labels `SIGIL PAD` (top-left), `MESS ×n · SWEEP TO WIPE` in `--warning` (top-right), `SLASH TO CUT · SPIRAL TO HEAT · FLICK UP TO PLATE` (bottom); stroke trail 4px `--brand-text`, round caps; sigil word in `--text-tagline` uppercase `--brand-text`, 120ms scale-in; splats 10–22px blobs `--ink-faint` at 70% · **Pantry** overline `PANTRY · {CITY}` + caption `Cap 3 portions · leftovers hour 21:00` (or `Leftovers hour · no cap on plentiful stock`); 3-column grid, gap 8; card min-height 100, padding 10 10 6, radius 12; name body-strong, prep caption, state caption (`Running low` in `--warning`, `Gone`), 28px minus button when n > 0, badge `×n` top-right (−8px, 24px, `--brand`/`--on-brand`); Gone cards: `--surface-sunken`, `--ink-faint`, no border · `BREAD · OPTIONAL` row (sup kambing) · `PANTRY EXTRAS` + caption `Shared across all five dishes. Use responsibly, or do not.` · footer: primary `Plate it` + caption `or flick up on the sigil pad`.

**Verdict** — header: close (×), `The Bin's verdict`, countdown · Bin character slot 140px circle · card (radius 22): overline `THE BIN` + body-lg line (+ caption Wasteways line) · centred: overline `CURSED PLATE · meant to be {dish}` in `--gem-ruby-text` when cursed; name heading-md; label body-strong; summary caption `Poached chicken ×1 · Ginger sauce ×10 · …` · three GemSockets 56px, n active; caption `{n} of 3 rubies` · chips (subtle): portion style, habit, `Leftovers hour` if any item > 3, `Cursed plate` (ruby outline) · buttons: primary `Share to your party`, secondary `Set as Signature Dish`, ghost `See who else made {dish}` · footer Bin counter.

**Same-dish wall** — header: back, `{Dish} · {n} plates today`, caption `Sorted by the Bin's rating. Most cursed at the bottom.` · rows padding 12, gap 12, radius 12; your row `--brand-subtle` + 2px `--brand` · CTA secondary `Open the {dish} thread · {n}`.

**Thread** — header: back, `{Dish} thread`, caption `Today only. Resets with the Pantry.` · messages gap 16 · composer: sunken field (44px, `--shadow-socket`) + 44px `--brand` send button.

**Cursed Plates** — header: back, `Cursed Plates · {n}`, caption `Everything the Bin refused to forget.` · 2-column grid, gap 12; card padding 12, 96px render slot (dashed).

**Share card** — see 3.12; primary `Send to your party`, secondary `Save image`.

**Play** (existing OraX) — venue card, then the **Build-A-Dish entry card**: utensils icon in `--brand-text`, `Build-A-Dish` body-strong, caption `{n} cooking in {city} · resets hh:mm:ss`, chevron. Party ClassCards below.

**Classes** (existing OraX) — 3×3 class tiles (56px avatar, name in class colour, role overline), gem picker (three 64px GemSockets + chip + cut caption), CTA `Play as {Class}`.

**You** (existing OraX + BaD) — profile card (96px avatar, name, class + role, chips: gem · city · `Hawker regular`, caption `{Gem} {Class} · {n} plates this month`) · **Signature Dish** · **Your habits** chips · `Wardrobe`, `Change class`.

**Bin toast** — absolute, 16px side insets, bottom 112px (clear of CTA/tab bar), `--surface-raised`, 1px `--border-strong`, radius 12, padding 12 16; overline `THE BIN` + body; 200ms fade/slide-in (`--ease-standard`); auto-dismiss 2.8s; `role="status"`.

---

## 6. Identity layer

- Classes (name, colour token): Provider `--class-provider` · Foodsmith `--class-foodsmith` · Spark `--class-spark` · Gastronaut `--class-gastronaut` · Taster `--class-taster` · Purist `--class-purist` · Rebel `--class-rebel` · Stirrer `--class-stirrer` · Host `--class-host`. Class colour is used only for the class name and the avatar ring, never a socket.
- Gems: ruby (round socket), sapphire (cushion / rounded square), emerald (lozenge, rotated 45°). Ratings use the OraX **GemSocket** in the player's gem; mini stones are 20px with a 2px `--gem-{gem}-fill` ring when lit.
- Avatars: until the OraX avatar system ships, crop the class board PNGs (figure anchors t1m 0.28/0.09, t1f 0.72/0.09, t2m 0.28/0.585, t2f 0.72/0.585 at 4.5× zoom) inside a circle with a 2–3px class ring.

---

## 7. Data model (TypeScript sketch)

```ts
type City = 'SG' | 'KL';
type Gem = 'ruby' | 'sapphire' | 'emerald';
type ClassKey = 'provider'|'foodsmith'|'spark'|'gastronaut'|'taster'|'purist'|'rebel'|'stirrer'|'host';
type Tag = 'protein'|'rice'|'carb'|'sauce'|'chilli';

interface Ingredient { id: string; name: string; needsCut: boolean; needsHeat: boolean; tags: Tag[]; extra?: boolean }
interface Dish { id: string; name: string; short: string; cuisine: string; ingredients: string[]; optional?: string[] }

interface DayBoard {
  city: City; date: string; resetAt: string; leftoversHour: boolean; binEaten: number;
  dishes: Dish[]; counts: Record<string, number>; cooks: Record<string, { classKey: ClassKey; figure: string }[]>;
  stock: Record<string, number>;                     // ingredientId → units left
}
interface Pick { playerId: string; date: string; dishId: string; swapsLeft: 0 | 1 }
interface PlateItem { ingredientId: string; n: number; cut: 0|1|2|3; heat: 0|1|2|3 }
interface Plate { items: PlateItem[]; flair: number; mess: number }
interface Verdict {
  name: string; hint?: string; label: string; line: string; wasteLine?: string;
  stones: 1|2|3; score: number; style: 'Empty'|'Neat'|'Generous'|'Unhinged'; cursed: boolean;
  habit: string; leftoversUsed: boolean; summary: string;
}
interface WallEntry { playerId: string; name: string; classKey: ClassKey; gem: Gem; stones: 1|2|3; variant: string; style: string; line: string; platedAt: string }
interface ThreadMessage { id: string; dishId: string; date: string; playerId: string; name: string; classKey: ClassKey; text: string; at: string }
interface Profile {
  name: string; city: City; classKey: ClassKey; gem: Gem; introSeen: boolean;
  signature?: Verdict & { date: string }; cursedPlates: (Verdict & { date: string })[];
  habits: { chilli: number; rawRice: number; unhinged: number; plates: number };
}
```

### Service boundary (`PoolService`)
`getToday(city)` · `pick(dishId)` · `swap(dishId)` · `takePortion(ingredientId)` / `returnPortion(ingredientId)` (server enforces stock + cap + Leftovers rule atomically) · `plate(plate)` → server-side judge, writes WallEntry · `getWall(dishId)` · `getThread(dishId)` / `post(dishId, text)` · `getGallery()` · `setSignature(verdict)` · `subscribe(city)` for live counts, stock and binEaten (SSE or WebSocket).
Offline: cache the app shell; building a plate works offline with optimistic stock; plating queues until online and re-validates.

---

## 8. Design tokens (OraX, dark default → light)

Grounds: `--surface` #1f1f22 → #f7f5fa · `--surface-raised` #2a2a2f → #ffffff · `--surface-sunken` #161618 → #e9e6ef
Ink: `--ink` #f2f0f5 → #1a1a1a · `--ink-muted` #a8a4b3 → #5c5866 · `--ink-faint` #6e6a7a → #8f8a9c · `--border` #3a3a41 → #cfcbd8 · `--border-strong` #6e6e7a → #7d788c
Brand: `--brand` #8a4bc2 → #4f1b72 · `--brand-text` #b98fd9 → #4f1b72 · `--brand-subtle` #4f1b7233 → #4f1b7214 · `--on-brand` #ffffff · `--focus` #d1b3ee → #6a2a99
Status: `--success` #6fd0a0 · `--warning` #f0b84a → #8a5a00 · `--danger` #e8607a · `--info` #7ea3ea
Gems (text / fill): ruby #e8607a / #c22a4c · sapphire #7ea3ea / #3a6fd0 · emerald #6fd0a0 / #27a06b (light: #8e0f2c · #153d8f · #0d6b45)
Classes (dark): provider #c8923a · foodsmith #7f95c4 · spark #e88a72 · gastronaut #6f9dbd · taster #9aa4b8 · purist #d6d0c4 · rebel #c46a6a · stirrer #8fa0d0 · host #b48aa8

Type — Space Grotesk for everything read; Silkscreen only for tagline and pixel labels, always uppercase, never below 11px:
`display-lg` 700 40/44 −0.025em · `heading-md` 700 28/32 −0.02em · `heading-sm` 700 20/26 −0.01em · `body-lg` 400 17/26 · `body` 400 15/22 · `body-strong` 500 15/22 · `caption` 400 13/18 · `overline` 700 11/14 +0.12em uppercase · `tagline` Silkscreen 400 16/22 +0.04em · `pixel-label` Silkscreen 700 11/14 +0.06em

Spacing 4-based: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. Radius: sm 6 · md 12 · lg 22 · full 999. Touch target 44.
Effects: `--shadow-socket` inset 0 3px 8px rgba(0,0,0,.6) · cards use border, not shadow · only gems glow (`--glow-{gem}` 0 0 22px) · motion `--motion-fast` 120ms, `--motion-base` 200ms, `--ease-standard` cubic-bezier(.2,0,0,1); nothing bounces; honour `prefers-reduced-motion`.
Exact files: `docs/prototype/_ds/orax-design-system-…/tokens/*.css` and `styles.css`; components (Button, Chip, GemSocket, ClassCard, Icon, Logo, Tagline) in `_ds_bundle.js` with usage in `readme.md`.

---

## 9. Assets

Included in `docs/prototype/orax/assets/`: class boards `Classes/01-provider-board.png … 09-host-board.png` · gems `Gems/ruby.svg, sapphire.svg, emerald.svg` · logos `Logos/orax-logo-on-dark.png, orax-logo-transparent.png`. Fonts (woff2): Space Grotesk 400/500/700, Silkscreen 400/700 in `_ds/…/fonts/`.
**Still to be made** (placeholders in the prototype): the Bin character (140px circle, plus a small disgusted variant for cursed verdicts), dish renders per dish and per cursed plate, three intro illustrations (220px, 16:9-ish). No clip art or emoji in the meantime — neutral slots.

---

## 10. Accessibility and quality bar
- 44px hit targets; visible `--focus-ring`; toasts use `role="status"`.
- Every gesture has a button path: `Plate it` exists; add `Cut` and `Heat` buttons under the pad behind a "Prefer buttons" setting.
- `prefers-reduced-motion`: no stroke fade or sigil scale-in; state changes are instant.
- Text contrast ≥ 4.5:1 on all grounds (tokens already comply).
- Judge, namer and sigil classifier are pure, deterministic and unit-tested.

## 11. Open questions for the build
- Pool sizing constants per city (expected pickers per dish).
- Anti-abuse: rate-limit portion take/return; one pick per account per day server-side.
- Thread moderation (report, mute, profanity list) before launch.
- Whether Leftovers hour should also lift the cap in the last hour for *Running low* ingredients (spec says no).
- Culinary Archetypes as hidden flavour in verdicts (parked).

## 12. Files in this handoff
- `BUILD-A-DISH.md` — this spec.
- `CLAUDE_CODE_PROMPT.md` — the kickoff prompt for the build.
- `prototype/Build-A-Dish.dc.html` — clickable prototype (serve over http; the reference judge, namer and gesture classifier are in its logic script). The screen-jump chips under the phone are prototype-only.
- `prototype/support.js`, `prototype/image-slot.js` — prototype runtime.
- `prototype/_ds/…` — OraX tokens, fonts, component bundle, readme.
- `prototype/orax/assets/…` — class boards, gems, logos.
