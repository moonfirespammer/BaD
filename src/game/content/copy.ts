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
  },
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
  a11y: {
    back: "Back to today's dishes",
    remove: 'Remove one portion',
    main: 'Main',
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
