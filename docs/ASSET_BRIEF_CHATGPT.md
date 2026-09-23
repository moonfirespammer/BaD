# Build-A-Dish — Asset brief for ChatGPT (GPT-6 Luna)

You are producing the illustration set for **Build-A-Dish (BaD)**, a daily cooking minigame inside OraX, a phygital social-discovery PWA for Gen Z in Singapore and Kuala Lumpur. Your job is **images only**: no code, no copy, no UI mockups, no advice on the game. The output is **one zip file** (section 10) that we import into the codebase by hand, so **filenames, sizes and backgrounds below are contracts, not suggestions.** Full game design: `BUILD-A-DISH.md` (same folder). Read section 1 of it for the tone.

Work in this order: 1 the Bin (locks the style) → 2 dish renders → 3 cursed plates → 4 intro illustrations → 5 mess splats → 6 ingredient icons → 7 PWA icon. After each group, show a contact sheet on a `#1f1f22` ground and a `#f7f5fa` ground before moving on.

---

## 1. Art direction

**Match the existing OraX class art.** Reference: `prototype/orax/assets/Classes/01-provider-board.png … 09-host-board.png` — nine character boards, each a 2×2 sheet of chef-warrior figures. Study them first. Their style is the house style:
- Warm, painterly, **saturated-but-muted**: apron mustards, navies, oxbloods, cream linen. Colour is plentiful in the art and nowhere else in the UI.
- Clean dark line work, soft cel shading with a little painted texture, subtle chunky proportions, oversized utensils. Kind faces, no gloss, no airbrush, no 3D render look.
- Lighting from top-left, one soft contact shadow under a grounded object. No rim light, no lens effects, no glow (in OraX only gems glow).
- **Flat, plain grounds only.** Every deliverable here is on a **transparent background**. Never bake in a backdrop, texture, vignette, frame or drop shadow beyond the small contact shadow.
- **No text, letters, numbers or logos in any image.** The UI sets all type. No emoji styling, no stickers, no speech bubbles.
- The UI it sits in is dark grey (`#1f1f22`, cards `#2a2a2f`) with one purple (`#8a4bc2`). Assets must read on both that dark ground and the light peer (`#f7f5fa`). Avoid large areas of pure black or pure white on outer edges; dark greys (`#333`-ish) and creams read on both.
- Purple is the brand's colour: use it **sparingly** inside illustrations (a sigil glow, the Bin's inner rim) — never as a fill for food, never as the dominant colour of an asset.

**Camera per group:** characters and the Bin at a slight three-quarter view, eye level; dishes strictly **top-down** (90°) so they sit inside circles; intro scenes at eye level.

---

## 2. The Bin (character) — do this first

The judge of every plate. **Voice: dry and judgemental** (Oscar the Grouch energy, filed under "bureaucratic disdain"). Never cute-mascot, never gross-out. It is a kitchen bin with a personality, not a monster: a dented steel pedal bin of the type found behind a hawker stall, dark charcoal-grey body with a warm brass rim and a slightly ill-fitting lid that acts as a brow. Face lives on the body: two heavy-lidded eyes and a flat mouth line. A faint **purple** inner glow (`#8a4bc2`, low) is visible only when the lid is open — that is the Wasteways below, nothing else about the design hints at it. Small tell: one slightly warped pedal.

Deliver a locked **character sheet** first (`bin/bin-sheet.png`, 2048×2048, transparent, front + three-quarter + side + lid open), then the six poses. Same proportions, same palette, same line weight throughout.

| File | Pose / expression | Use |
| --- | --- | --- |
| `bin/bin-neutral.png` | lid closed, eyes half-lidded, mouth flat | Verdict default, intro beat 3 |
| `bin/bin-judging.png` | one eyebrow-lid raised, looking down its "nose" | 2-stone verdicts |
| `bin/bin-approving.png` | eyes closed, the faintest nod, mouth still flat — approval is grudging | 3-stone verdicts |
| `bin/bin-disgusted.png` | lid recoiling back, eyes wide, pedal pressed | cursed plates |
| `bin/bin-eating.png` | lid open mid-chomp, a portion falling in, purple glow visible | Fling to the Bin, Bin-eaten counter |
| `bin/bin-full.png` | lid propped up on overflow, weary | Leftovers hour banner (optional) |

Size: **1024×1024 PNG, transparent**, character filling ~80% of the height, centred, feet/base at the same y in every file (they are swapped in place inside a 140px circle at 2× = 280px; keep all critical features inside the central 70% circle).

---

## 3. Dish renders (5 dishes)

Top-down plates on their **own dishware**, no table, no cutlery, no napkin. Hawker-honest portions — food looks like it is meant to be eaten, not styled. Chunky brushwork, visible ingredient edges.

| File | Dish | Plating notes |
| --- | --- | --- |
| `dishes/chicken-rice.png` | Hainanese chicken rice | oval melamine plate; sliced poached chicken fanned over rice, cucumber under, three small saucers (ginger, chilli, dark soy) tucked at the edge |
| `dishes/aglio-olio.png` | Spaghetti aglio e olio | wide white bowl; glossy oil, golden garlic slivers, chilli flakes, parsley, a little parmesan |
| `dishes/sup-kambing.png` | Sup kambing | deep bowl of dark spiced mutton soup, coriander and fried shallot on top; **no bread in the render** (bread is optional in-game) |
| `dishes/nasi-lemak.png` | Nasi lemak | banana-leaf-lined plate; coconut rice mound, sambal, ikan bilis, peanuts, boiled egg half, cucumber |
| `dishes/fish-chips.png` | Fish and chips | enamel plate; battered fillet, chips, a pot of mushy peas, tartare, lemon wedge |

Plus one **bread trio** for the optional row: `dishes/bread-trio.png` (baguette slices, roti, sourdough) — same style.

Size: **1024×1024 PNG, transparent**, dishware filling ~85% of the frame, centred (rendered inside a 72px circle on the profile and up to 200px on the verdict). Make the same five at **512×512** too (`dishes/512/…`).

---

## 4. Cursed plates (6 archetypes)

Cursed names are generated in code (`{Tone} {Base} {Detail}` — see BUILD-A-DISH.md 3.6). The render is picked by the **Base** word. Same top-down camera and dishware language as section 3. Funny through restraint: wrongness is in proportion and colour, not in gore or slime. No faces, no eyes, no cartoon stink lines.

| File | Base word | What it looks like |
| --- | --- | --- |
| `cursed/plate.png` | Plate | a plate with a single, tiny, sad portion dead centre and an enormous puddle of one sauce |
| `cursed/bowl.png` | Bowl | a bowl filled to the brim, ingredients floating that should not float (a whole lemon, a slab of cheddar) |
| `cursed/creation.png` | Creation | an over-ambitious tower of unrelated components, leaning |
| `cursed/mess.png` | Mess | everything cut to dust and stirred together, uniform grey-beige |
| `cursed/heap.png` | Heap | a mound of ten portions of the same thing (ginger sauce pooled over rice), spilling off the plate |
| `cursed/accident.png` | Accident | burnt black edges, one item clearly on fire moments ago, a smoke wisp |

Plus `cursed/empty.png` — a spotless empty plate (the "You plated air" verdict).

Size: **1024×1024 PNG, transparent**, plus `cursed/512/…` copies.

---

## 5. Intro illustrations (3)

Shown once, in a 358×220 slot (deliver **1600×984**, 16:9.8 — safe area is the central 90%). Eye-level scenes, same painterly style, **transparent background**; the UI provides the card behind them. May include OraX-style chefs (use the class boards as the model for how people look — any class, any kit) but **no recognisable real places or brands**.

| File | Beat | Scene |
| --- | --- | --- |
| `intro/01-shelf.png` | Five dishes a day. One shelf for the whole city. | a long hawker-centre shelf lit from above with five covered dishes; a crowd of chefs of different classes reaching for the same shelf, small against it; one jar visibly almost empty |
| `intro/02-sigils.png` | Tap to add a portion. Stroke to cook. | a chef's hand over a dark counter drawing three glowing purple strokes in the air — a diagonal slash, a spiral, an upward flick — over a chopping board, a wok and a plate respectively; the glow is the only light effect allowed |
| `intro/03-bin.png` | The Bin judges everything. | the Bin (section 2 design, neutral pose) on a raised step in front of a row of plates, small queue of chefs holding their plates like students at a viva |

---

## 6. Mess splats (4)

Little painted blobs that land on the sigil pad when something burns or is flung. Muted only — sauce browns, oil ambers, soot greys — never red. Irregular, slightly organic, flat with one darker tone. `mess/splat-1.png … splat-4.png`, **256×256 PNG, transparent**, blob filling ~70%.

---

## 7. Ingredient icons (34) — phase 2, after everything above is approved

One icon per Pantry card, top-down or simple three-quarter, on a small round painted saucer so they read as a set. Same palette and line. **256×256 PNG, transparent**, subject filling ~75%. Files under `ingredients/` named exactly:

`poached-chicken` · `chicken-rice` · `ginger-sauce` · `chilli-sauce` · `cucumber` · `dark-soy` · `spaghetti` · `garlic` · `olive-oil` · `chilli-flakes` · `parsley` · `parmesan` · `mutton` · `soup-spices` · `onion` · `coriander` · `baguette` · `roti` · `sourdough` · `coconut-rice` · `sambal` · `fried-anchovies` · `peanuts` · `egg` · `fish-fillet` · `batter` · `potato` · `mushy-peas` · `tartare` · `lemon` · `chilli-padi` · `durian` · `cheddar` · `ice-cream`

Each also in **three prep states** later if approved: `-cut`, `-cooked`, `-burnt` suffixes (e.g. `garlic-cut.png`). Not needed for the first build.

---

## 8. PWA icon and tab mark

- `icon/bad-icon-512.png` and `icon/bad-icon-512-maskable.png` — the Bin's face (lid + eyes) as a simple mark on a **flat `#1f1f22` square** (this is the one asset with an opaque background); maskable version keeps the mark inside the central 80%. No text. Do **not** use or redraw the OraX logo — it is never modified.
- `icon/bad-icon-192.png` — same, 192×192.

---

## 9. Palette (from the OraX tokens — use as the tonal anchor, not as flat fills)

UI grounds you will sit on: `#1f1f22` · `#2a2a2f` · `#161618` (dark) / `#f7f5fa` · `#ffffff` (light). Brand purple `#8a4bc2`, deep `#40145c`. Class accents to borrow for aprons and cloth: mustard `#c8923a`, navy `#7f95c4`, coral `#e88a72`, denim `#6f9dbd`, slate `#9aa4b8`, cream `#d6d0c4`, oxblood `#c46a6a`, stirrer blue `#8fa0d0`, plum `#b48aa8`. Gems (do not draw gems; they exist as SVG): ruby `#c22a4c`, sapphire `#3a6fd0`, emerald `#27a06b`.

Food should look like food — use natural food colour, kept a notch muted to match the boards.

---

## 10. Delivery — one zip, nothing else

Everything ships in a single download named `bad-assets-v1.zip`. Do not paste images inline as the deliverable, do not split into several zips, do not rename or flatten folders. Exactly this tree (the codebase depends on these paths):

```
assets/bad/
  bin/            bin-sheet.png · bin-neutral.png · bin-judging.png · bin-approving.png · bin-disgusted.png · bin-eating.png · bin-full.png
  dishes/         chicken-rice.png · aglio-olio.png · sup-kambing.png · nasi-lemak.png · fish-chips.png · bread-trio.png · 512/(same names)
  cursed/         plate.png · bowl.png · creation.png · mess.png · heap.png · accident.png · empty.png · 512/(same names)
  intro/          01-shelf.png · 02-sigils.png · 03-bin.png
  mess/           splat-1.png … splat-4.png
  ingredients/    34 files (phase 2)
  icon/           bad-icon-512.png · bad-icon-512-maskable.png · bad-icon-192.png
  manifest.json
```

`manifest.json` — one entry per file: `{ "path": "dishes/chicken-rice.png", "w": 1024, "h": 1024, "alpha": true, "group": "dishes", "key": "chicken-rice" }`. Keys must match the game ids: dishes `chicken-rice · aglio-olio · mutton-soup (file sup-kambing) · nasi-lemak · fish-chips`; cursed by Base word lower-cased; Bin by expression.

**QA before you hand over — check every file:**
- PNG, sRGB, true alpha, no matte fringe (view on both `#1f1f22` and `#f7f5fa`).
- Exact pixel sizes above; subject centred; consistent baseline across the Bin poses.
- No text, no logo, no watermark, no backdrop, no frame.
- Style consistent with `bin-sheet.png` and the class boards: same line weight, same light direction.
- Each file under 600 KB (1024 px) / 200 KB (512 px) / 60 KB (256 px). Use lossless PNG then optimise (oxipng/pngquant with alpha preserved).

---

If a group is not finished, ship what is done with the manifest listing only the files present — never placeholder or blank files. Partial zips are versioned `bad-assets-v1-partial-N.zip`; the final one is `bad-assets-v1.zip`.

## 11. What happens next (for context — not your task)

We unzip `assets/bad/` into `public/assets/bad/` in the game repo by hand. The game is being built in parallel with neutral placeholders in every slot; once your files land, the developer swaps them in using `manifest.json`. That is why keys, paths and sizes must match exactly.
