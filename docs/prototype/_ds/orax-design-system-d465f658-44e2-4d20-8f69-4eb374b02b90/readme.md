# OraX Design System

OraX is a phygital social-discovery app — an installable web app (PWA) for Gen Z in Singapore and Kuala Lumpur. Three borrowed ideas make the product: a persistent avatar and wardrobe (World of Warcraft), real-world locations (Pokémon Go), and matching by personality and life habits rather than skill (Tinder). Two taglines carry it — **THE GAME IS LIFE** and **PLAY IT TOGETHER**. This system is the visual language for three surfaces: the app, its in-app games, and its marketing (web + print).

## Sources

- `orax-design-system/` — the attached brand kit (mounted read-only; an expanded copy lives at `uploads/orax-design-system/`). `README.md` and `tokens.json` in that folder are the source of truth; `tokens.css` is its CSS export. It also ships seven static component specimens (`components/<Name>/<Name>.html` + `README.md`), the logo, nine class boards, three gem SVGs, five webfont files and a press-ready invitation card PDF.
- No Figma file, GitHub repository or live product build was provided. No screens of the product exist in the source — the UI kits here are compositions of the defined components (see the UI kits section for what that means).

## Principles (from the source, kept verbatim in spirit)

1. **Modern, clean, dynamic.** Flat surfaces, hairline borders, one purple. The only things that glow are gems.
2. **Dark grey, never black.** `--surface` in dark is `#1f1f22`. Pure black appears nowhere in the UI (print card stock is the one exception).
3. **The logo is never reversed.** Ring and X are `--logo-ring` `#1a1a1a` on light; `--logo-plate` `#333333` on dark grounds (`orax-logo-on-dark.png`). Never white, never recoloured, never rebuilt in type.
4. **Pixel type is a signal, not a voice.** Silkscreen appears only on the two taglines and game micro-labels. Everything a person reads is Space Grotesk.
5. **Matched by who you are.** Class identity comes from the art and the gem, not from stats. Nothing in the UI ranks players by skill.

## Content fundamentals

**Voice.** Direct, warm, second person. Short declaratives that sound like an invitation, not a feature list. "Find your raid party." "Your avatar, your wardrobe, your city." "Start playing." Never "we're excited to…", never hype adjectives.

**Casing.** Sentence case everywhere — headlines, buttons, labels, helper text. Three deliberate exceptions, all uppercase: the two taglines (`tagline-lg` / `tagline`), role eyebrows in `overline` (MAGE, ROGUE, FIGHTER) and game micro-labels in `pixel-label` (LIMIT ×2, GAUGE).

**Punctuation.** No exclamation marks in UI chrome. Full stops on sentences, none on labels or button text. Use the real multiplication sign (×) in modifiers: "Limit ×2", not "x2". Middle dot (·) separates paired game modifiers: "Limit ×1.5 · Shift".

**Pronouns.** "You/your" for the player; OraX rarely says "we". Buttons are verbs the player does: "Start playing", "Choose class", "Not now", "Locked" (state, not verb, when disabled).

**Proper nouns.** Class names are capitalised proper nouns — Provider, Foodsmith, Spark, Gastronaut, Taster, Purist, Rebel, Stirrer, Host — and never pluralised into generic nouns ("a Stirrer", not "stirrers"). Gem variants are Ruby, Sapphire, Emerald — capitalised, never "red / blue / green". Roles are MAGE, ROGUE, FIGHTER only as eyebrows; in running copy they are "Mage", "Rogue", "Fighter".

**Emoji.** None, anywhere in product copy. Gems and class art are the ornament. No unicode glyphs standing in for icons either.

**The taglines.** Always two lines, never joined, never reworded: "THE GAME IS LIFE" over "PLAY IT TOGETHER". The last word of each line (LIFE, TOGETHER) takes `--brand-text`. The only single-line form is the Cover strip: "THE GAME IS LIFE · PLAY IT TOGETHER" in `pixel` 13px, muted, accent words in `--brand-text`.

**Numbers and places.** Cities are written in full — Singapore, Kuala Lumpur. Distances are metric and short: "400 m". Times are 24-hour ("19:30").

## Visual foundations

**Colour.** Two themes, dark first; light is a full peer, not a fallback (`data-theme="light"` on `<html>` or any wrapper). Grounds step `--surface` (#1f1f22) → `--surface-raised` (#2a2a2f, cards) → `--surface-sunken` (#161618, wells, sockets, inputs). Ink is three steps: `--ink` copy, `--ink-muted` labels and captions, `--ink-faint` placeholders and disabled only. One brand purple: `--brand` is the fill (primary button, active tab, selected state) — the logo's own #4f1b72 in light, lifted to #8a4bc2 in dark so it stays legible; `--brand-text` (#b98fd9 dark / #4f1b72 light) is purple as text or icon; `--brand-deep` #40145c (the logo's shadow purple) is the pressed state; `--brand-subtle` is a 20%/8% purple tint for selected rows and brand chips (text on it stays `--ink`). Status colours (`--success`, `--warning`, `--danger`, `--info`) are text-and-icon colours only, always beside a word or icon; `--danger` shares the Ruby hue, so colour never says "error" alone near a Ruby socket. No gradients anywhere except inside the shipped gem drawings.

**Gems.** Each class has three variants named for a gem. A gem is a five-step facet ramp (`--gem-<name>-glint / -light / -base / -deep / -shadow`) identical in both themes and used only inside the stone and its glow, plus per-theme `--gem-<name>-text` (on surface), `--gem-<name>-fill` (chips, active ring, glow) and `--gem-<name>-on` (text on the fill). Cut → setting: Ruby round brilliant → round socket (`--radius-full`); Sapphire cushion → rounded square (`--radius-lg`); Emerald lozenge → diamond (rotated square). The socket outline names the gem before its colour does. One stone per socket, never a cluster, sheen top-left, the glint facet is the only place a gem gets brighter than its `-light` step.

**Class accents.** `--class-<name>` is one accent per class taken from its art (Provider mustard, Foodsmith navy, Spark coral, Gastronaut denim, Taster slate, Purist cream/charcoal, Rebel oxblood, Stirrer navy, Host plum). It colours the class name and the avatar ring on a ClassCard — never a socket, never a button.

**Type.** Space Grotesk (400/500/700, real files under `fonts/`) for everything read. Display styles are 700 with negative tracking — `display-xl` 56/58 −0.03em down to `heading-sm` 20/26 −0.01em — which is what makes the face read as bold as a heavier grotesk. Body is 15/22; `body-strong` (500) for button and tab labels; `caption` 13/18 in `--ink-muted`; `overline` 11/14 700 +0.12em uppercase for eyebrows. Silkscreen (400/700) only in `tagline-lg` 28/36, `tagline` 16/22 and `pixel-label` 11/14 — uppercase, never below 11px, never for anything read at length. It is sharp and adult, not a toy font.

**Spacing and layout.** 4-based scale `--space-1` (4) … `--space-8` (64). Cards pad `--space-4` on phones, `--space-5` on desktop; cards sit `--space-6` apart; sections `--space-7`; hero and page-top `--space-8`. Page gutter never below `--space-4`. Mobile first at 390px; the PWA grows from there. No horizontal scroll, ever. Touch targets are 44px minimum (Button has it built in). One primary button per screen.

**Radii.** `--radius-sm` 6px chips, inputs, small tags; `--radius-md` 12px buttons, cards, ClassCard; `--radius-lg` 22px sheets, large panels and the Sapphire socket; `--radius-full` avatars, the Ruby socket, pill toggles. Corners are consistent per element class — never mix radii inside one component.

**Cards and borders.** A card is `--surface-raised` with a 1–2px `--border` edge and `--radius-md` — separated by border, not shadow. `--border` is decorative (dividers, card edges) and never the only signal; `--border-strong` is for edges that carry meaning (inputs, secondary buttons, checkboxes) at ≥3:1 on surface. A ClassCard's 2px edge switches to the active gem's `--gem-*-fill` when it is the current turn — that is the only coloured card border in the system. Game modifier footers use a 1px dashed `--border-strong`.

**Shadow and glow.** Two shadows only: `--shadow-socket` (inset 0 3px 8px) recesses sockets and inputs; `--shadow-raised` (0 8px 24px) is for popovers and floating sheets only — never cards. The only glow is a gem's: `--glow-ruby / -sapphire / -emerald` (0 0 22px at 60% of the fill) on an active socket, always paired with a 3px `--gem-*-fill` ring. `--glow-brand` exists for one selected primary element on game screens only. Nothing else glows, nothing has a drop shadow, no text shadows.

**Backgrounds and imagery.** Flat, solid `--surface`. No photography, no textures, no patterns, no gradients. Imagery is the class art: nine 1254×1254 character boards (2×2: t1 kit top row, t2 kit bottom row; masculine left, feminine right) on a neutral grey ground — place them on `--surface-raised` with a `--border` and a little air; crop to one figure for avatars, keep the whole board on a class page. The art is warm, painterly, saturated-but-muted — apron mustards, navies, oxbloods — and is the only place colour is allowed to be plentiful. Gem SVGs carry their own colours and render identically on both themes. The Cover's block composition (brand slab, brand-deep and logo-plate tiles on a 32px pitch, three gem tiles) is the one approved decorative motif: it echoes the logo's pixel fragments. Do not invent new patterns.

**Transparency and blur.** Only two translucent tokens: `--surface-overlay` (black 70% dark / #1a1a1a 50% light) as the scrim behind modals, and `--brand-subtle` as a tint. No frosted glass, no backdrop blur, no translucent cards. Text is always full-opacity ink.

**Interaction states.** Hover: the source defines none — keep the pointer cursor and no colour shift (secondary and ghost may show `--brand-subtle` underneath on desktop only if a hover affordance is genuinely needed; never invent a lighter purple). Pressed: primary goes `--brand-deep`; nothing shrinks or scales. Selected: `--brand` fill or `--brand-subtle` tint; an active socket gets ring + glow; an active tab is `--brand-text`. Disabled: `--ink-faint` on `--surface-sunken`, no border. Focus: `--focus` 2px solid, 2px offset, on every interactive element, ≥8:1 on surface in both themes.

**Motion.** Quiet. Colour and box-shadow settle over `--motion-base` (200ms, `--ease-standard`); no bounces, no springs, no parallax, nothing animates on load. The socket glow is a state, not an effect — under `prefers-reduced-motion` it appears without any transition. Game screens may animate the gem glow and pixel-label counters; UI chrome does not animate.

**Fixed elements.** A phone screen has a top bar (logo at 32px or a `display-lg`/`heading-md` title) and a bottom tab bar on `--surface-raised` with a `--border` top edge, active tab in `--brand-text`. Primary CTAs on phone are `block` Buttons pinned above the tab bar with a `--space-4` gutter.

**Logo.** Full lock-up only: O-ring, pixel-fragment "RA" block in the two purples, X with the purple check. Minimum height 32px in UI; clear space on all sides equals the O-ring's height (~44% of the mark's height). Light UI uses `orax-logo-transparent.png`; dark UI and dark grounds use `orax-logo-on-dark.png` (ring and X in `--logo-plate` #333333). `orax-logo.png` (on white) is for print and white plates. Rasters at 740×596 — ask for the vector above 740px wide. Never on a busy image, never recoloured.

## Iconography

- **No icon set came with the brand.** The source prescribes an interim: a 1.5px-stroke outline set (Lucide or equivalent) in `--ink` / `--ink-muted`, 20px inside controls, 24px in navigation, until a house set exists. The `Icon` component loads Lucide 0.469 from CDN and renders any icon by kebab-case name at 1.5px stroke in `currentColor` — this is the only intentional addition to the source's component inventory (see below). **Flagged substitution:** no house icons exist; treat every icon as a placeholder to be replaced when a set is drawn.
- **No icon font, no sprite, no PNG icons.** No emoji, no unicode glyphs used as icons. The only ornament is brand-owned: the three gem SVGs (`assets/Gems/`), the nine class boards (`assets/Classes/`) and the logo (`assets/Logos/`) — copied as shipped, never redrawn.
- **Gems are illustrations, not icons.** Use them via `<img>` at 40–64px inside a GemSocket, 100px+ on a class page; the component does this for you. Never recolour one gem into another, never draw a cluster.
- **Class art as avatars.** `avatarCrop()` (shared helper) crops one figure's head from a board for a round avatar; boards default to the t1 masculine figure. Use the whole board on a class page.

## Components

The source defines exactly seven families; they are built one-to-one. Files live in `components/<group>/` as `<Name>.jsx` + `<Name>.d.ts` + `<Name>.prompt.md`, with one card per group.

| Component | Group | What it is |
| --- | --- | --- |
| **Button** | actions | The one action control: `primary` (brand / on-brand, pressed brand-deep), `secondary` (surface-raised + border-strong), `ghost` (brand-text). `radius-md`, `body-strong`, 44px min height, optional 20px leading icon, `block` for phone CTAs. |
| **Chip** | actions | A small label for a gem variant or the brand: filled (`gem-*-fill` / `gem-*-on`, or brand / on-brand), outline (`gem-*-text` border and text), subtle (brand-subtle / ink). Labels, not buttons. |
| **Logo** | brand | The shipped lock-up at a given height (min 32px); `ground="auto"` swaps between the on-dark and transparent files with the theme. |
| **Tagline** | brand | THE GAME IS LIFE / PLAY IT TOGETHER in Silkscreen, two lines, accent words in brand-text; `size="lg"` (hero) or `"md"` (card/footer). |
| **Cover** | brand | The 960×288 brand cover: the block composition, the real logo and the single-line tagline strip. `scale` to fit. |
| **GemSocket** | game | A recessed well (`surface-sunken`, `shadow-socket`) shaped like its gem, holding the shipped SVG; `active` adds the 3px `gem-*-fill` ring and `glow-*`; `onClick` makes it a selectable `aria-pressed` button. |
| **ClassCard** | game | The roster card: avatar with class ring, class name in class accent, role eyebrow, slot, a triplet of GemSockets, a `pixel-label` modifier footer; `current` turns the edge to the active gem's fill. |
| **Icon** | icons | *Intentional addition* — Lucide outline glyph by name at 1.5px stroke, the interim UI icon the source asks for. |

Shared non-visual helpers (not components): `components/shared/orax-shared.js` — `ASSET_BASE`/`asset()` (resolves `assets/…` from wherever the bundle is served), `GEMS`, `CLASSES`, `CLASS_ORDER`, `FIGURES`, `avatarCrop()`, `injectOnce()`.

## UI kits

The source contains no product screens. The kits below are therefore **compositions, not recreations**: every element is one of the seven components or a token-only layout rule from the source README (grounds, borders, type scale, tab bar in brand-text, 390px mobile-first). Nothing in them should be read as a specification of a real OraX screen — replace them with real screens as soon as any exist.

- `ui_kits/app/` — the PWA at 390px: Welcome, Choose class (class boards → gem variant), Party (three ClassCards, live location, tab bar). Theme toggle demonstrates the light peer.
- `ui_kits/marketing/` — a 1280px landing page: Cover hero, taglines, the nine classes, the three gems, print card reference.

## Accessibility

Guaranteed pairs, both themes: `ink` and `ink-muted` on all three grounds; `brand-text`, every `gem-*-text` and every status colour on `surface` and `surface-raised`; `on-brand` on `brand`; `gem-*-on` on `gem-*-fill` — all ≥4.5:1, most ≥6:1. `border-strong` ≥3:1 on surface. A gem variant is never told by colour alone: shape (round / rounded square / diamond) and the word (Ruby / Sapphire / Emerald) carry it too. Respect `prefers-reduced-motion`.

## Index

```
readme.md                 this guide
SKILL.md                  agent skill wrapper — read this first if you are an agent
styles.css                the one file consumers link (@imports below)
tokens/fonts.css          @font-face — Space Grotesk 400/500/700, Silkscreen 400/700
tokens/colors.css         all colour tokens, dark on :root, light under [data-theme="light"]
tokens/typography.css     font families, --text-* / --tracking-* styles and matching utility classes
tokens/spacing.css        --space-1…8, --radius-*, layout constants
tokens/effects.css        shadows, glows, focus ring, motion
tokens/base.css           minimal html/body/a/img resets that make a page take the tokens
tokens/tokens.json        the source token file, copied verbatim
fonts/                    the five webfont files
assets/Logos/             orax-logo.png (on white) · orax-logo-transparent.png (light UI) · orax-logo-on-dark.png (dark UI)
assets/Gems/              ruby.svg · sapphire.svg · emerald.svg
assets/Classes/           01-provider … 09-host boards (1254×1254 PNG)
assets/Print/             orax-invitation-card-press.pdf (90×54 mm, spot-UV mask)
guidelines/               foundation specimen cards (Colors, Type, Spacing, Effects, Brand groups)
components/actions/       Button, Chip
components/brand/         Logo, Tagline, Cover
components/game/          GemSocket, ClassCard
components/icons/         Icon (interim Lucide)
components/shared/        orax-shared.js helpers
ui_kits/app/              PWA screens at 390px
ui_kits/marketing/        landing page at 1280px
thumbnail.html            the system's tile
```
