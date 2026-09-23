// Every user-facing string of the game lives here so scripts/check-strings.mjs can sweep it against the spec.
// Spec section numbers refer to docs/BUILD-A-DISH.md. Strings marked RULING come from the owner's Phase 1 answers
// or are prototype-only strings the spec is silent on; the sweep reports them under a separate heading.

export const COPY = {
  app: {
    pixelLabel: 'BUILD-A-DISH',
    tabs: { play: 'Play', classes: 'Classes', you: 'You', dish: 'Dish' },
  },
  intro: {
    beats: [
      {
        headline: 'Five dishes a day. One shelf for the whole city.',
        body: 'Everyone in {city} cooks from the same Pantry. When the ginger sauce runs out, it is out.',
      },
      {
        headline: 'Tap to add a portion. Stroke to cook.',
        body: 'Slash to cut. Spiral to heat. Flick up to plate. Nothing you draw can fail.',
      },
      {
        headline: 'The Bin judges everything.',
        body: 'Dry, hungry, never wrong. Even a disaster gets a name, a rating in your gem and a place on the wall.',
      },
    ],
    next: 'Next',
    start: 'Start cooking',
    skip: 'Skip',
  },
  board: {
    resets: 'RESETS {countdown}',
    title: "Today's dishes",
    cursedLink: 'Cursed Plates · {n}',
    caption: 'One shelf for all of {city}. One dish a day, swap once.',
    leftoversLabel: 'LEFTOVERS HOUR · UNTIL 00:00',
    leftoversCaption: 'Portion caps are off on anything the city still has plenty of.', // RULING (prototype)
    youAreIn: 'You are in. {n} cooking {dish} right now.',
    cookingToday: 'Cooking today',
    cooking: 'cooking',
    /** RULING (Q5): one stock word per dish instead of counts. */
    stock: { plenty: 'plenty', moderate: 'moderate', low: 'running low', gone: 'all out!' },
    cta: {
      pick: 'Pick a dish',
      pickDish: 'Pick {dish} for today',
      cook: 'Cook {dish}',
      swap: 'Swap to {dish} · 1 swap left',
      noSwaps: 'No swaps left today',
    },
    footer: 'The Bin has eaten {n} plates in {city} today.',
  },
  bin: {
    overline: 'THE BIN',
    picked: '{Dish}. The whole city can see that now.',
    swapped: 'Swapped to {dish}. That was your one.',
    cap: [
      'Three is plenty. Come back at leftovers hour.',
      'The whole city eats from this shelf. Three.',
      'No. Leftovers hour starts at 21:00.',
    ],
    leftovers4: 'Leftovers hour. Go on, then. I am watching.',
    leftovers10: 'Ten portions of {ingredient}. Ten. I am counting.',
    gone: 'Gone. {City} ate it all before you.',
    // Spec §3.4 building remarks.
    noTarget: 'Strokes need a target. Tap something first.',
    dustAlready: 'The {x} is dust. It cannot get smaller.',
    dustNow: 'That is dust now. Congratulations.',
    burntAlready: 'It cannot get more burnt. It is trying.',
    burntNow: 'You burnt the {x}. It did nothing to you.',
    clean: 'Cleaner. Not clean. Cleaner.',
    fling: ['Rude. Delicious, but rude.', 'I was going to eat that anyway.', 'Noted. Everything is noted.'],
  },
  /** Spec §5 Station. */
  station: {
    resets: 'RESETS {countdown}',
    leftoversCaption: 'No cap on anything the city still has plenty of.', // RULING (prototype Station caption)
    plate: 'YOUR PLATE',
    plateLabel: '{STYLE} · FLAIR ×{n}',
    empty: 'Nothing yet. Tap the Pantry to add a portion.',
    chip: '{Ingredient} ×{n}',
    strokesApply: 'Strokes apply to {item}',
    fling: 'Fling to the Bin',
    pad: 'SIGIL PAD',
    mess: 'MESS ×{n} · SWEEP TO WIPE',
    padHint: 'SLASH TO CUT · SPIRAL TO HEAT · FLICK UP TO PLATE',
    cut: 'Cut',
    heat: 'Heat',
    preferButtons: 'Prefer buttons',
    pantry: 'PANTRY · {CITY}',
    cap: 'Cap 3 portions · leftovers hour 21:00',
    capOff: 'Leftovers hour · no cap on plentiful stock',
    runningLow: 'Running low',
    gone: 'Gone',
    badge: '×{n}',
    bread: 'BREAD · OPTIONAL',
    extras: 'PANTRY EXTRAS',
    extrasCaption: 'Shared across all five dishes. Use responsibly, or do not.',
    plateIt: 'Plate it',
    plateHint: 'or flick up on the sigil pad',
  },
  /** Spec §3.4 portion style (live label), prep words and sigil words. */
  style: { empty: 'Empty', neat: 'Neat', generous: 'Generous', unhinged: 'Unhinged' },
  prep: {
    raw: 'raw',
    cut: ['', 'cut', 'diced', 'dust'],
    heat: ['', 'cooked', 'seared', 'burnt'],
  },
  sigils: { cut: 'CUT', heat: 'HEAT', plate: 'PLATE', clean: 'CLEAN' },
  cursed: {
    title: 'Cursed Plates · {n}',
    caption: 'Everything the Bin refused to forget.',
  },
  /** Art placeholder captions naming each slot (kickoff prompt, Assets). RULING (prototype text) */
  art: {
    intro: ['Illustration: the city shelf', 'Illustration: three sigils', 'Illustration: the Bin'],
    bin: 'The Bin, character art',
    dish: 'Dish render',
    render: 'Render',
  },
  /** Spec §3.6 namer parts and §3.8 tier lines (used by the Phase 3 namer, and by the simulated wall today). */
  namer: {
    tones: ['Strange', 'Suspicious', 'Chaotic', 'Questionable', 'Cursed', 'Experimental', 'Unfortunate'],
    bases: ['Plate', 'Bowl', 'Creation', 'Mess', 'Heap', 'Accident'],
    details: [
      'of unknown origin',
      'with too much confidence',
      'gone slightly wrong',
      'that should not exist',
    ],
    prefix: { burnt: 'Burnt ', seared: 'Seared ', generous: 'Generous ' },
    suffix: { drowning: ', drowning in {sauce}', extra: ' with {extra}', missing: ', missing something' },
  },
  lines: {
    3: [
      'Fine. I have eaten worse on purpose.',
      'Acceptable. Do not let it go to your head.',
      'Clean plate. I have nothing to add, which annoys me.',
    ],
    2: [
      'Edible. That is the whole review.',
      'You were close. Closeness is not a flavour.',
      'The rice is doing all the work here.',
    ],
    1: [
      'I am a bin and even I have standards.',
      'This plate lost an argument with itself.',
      'I will eat it. I will not enjoy it. I never do.',
    ],
  },
  /** Screen-reader labels (prototype aria-labels; the spec names none). RULING */
  a11y: {
    back: "Back to today's dishes",
    remove: 'Remove one portion',
    main: 'Main',
    intro: 'Intro',
    cursed: 'Cursed Plates',
    gem: '{Gem} gem',
    gemActive: '{Gem} gem, active',
    gemPick: '{Gem} {Class}',
    stones: '{n} of 3 {gems}',
  },
  /** Existing OraX chrome reproduced from the prototype (not Build-A-Dish copy). RULING */
  orax: {
    play: {
      notifications: 'Notifications',
      venue: { SG: 'Tiong Bahru Market', KL: 'Jalan Alor' },
      venueCaption: '{city} · 400 m · tonight 19:30',
      entry: 'Build-A-Dish',
      entryCaption: '{n} cooking in {city} · resets {countdown}',
      party: 'Your party',
      round: 'ROUND 1 · LIMIT ×2',
      footers: { taster: 'Limit ×1.5 · Break', provider: 'Limit ×2', stirrer: 'Limit ×1.5 · Shift' },
    },
    classes: {
      title: 'Choose your class',
      subtitle: 'Matched by who you are, not by skill',
      gemTitle: 'Choose your gem',
      cta: 'Play as {Class}',
    },
    you: {
      title: 'You',
      settings: 'Settings',
      hawker: 'Hawker regular',
      caption: '{Gem} {Class} · {n} plates this month',
      signature: 'Signature Dish',
      noSignature: 'No Signature Dish yet. Cook one and keep it.',
      todaysDishes: "Today's dishes",
      habits: 'Your habits',
      habitChips: {
        chilli: 'Doubles the chilli ×{n}',
        rawRice: 'Raw rice ×{n}',
        unhinged: 'Unhinged plates ×{n}',
      },
      wardrobe: 'Wardrobe',
      changeClass: 'Change class',
    },
  },
} as const;

/** Fill `{name}` placeholders. `{Dish}`/`{City}` are filled as given; callers pass the right case. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => {
    const v = values[k];
    return v === undefined ? m : String(v);
  });
}
