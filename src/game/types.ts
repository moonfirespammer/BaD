// Data model from BUILD-A-DISH.md §7, plus the additions reported in the Phase 1 report:
// Profile.id, Profile.figure, WallEntry.figure, ThreadMessage.figure, Verdict.dishId/key/flags, Dish.local/cuisines/main.

export type City = 'SG' | 'KL';
export type Gem = 'ruby' | 'sapphire' | 'emerald';
export type ClassKey =
  'provider' | 'foodsmith' | 'spark' | 'gastronaut' | 'taster' | 'purist' | 'rebel' | 'stirrer' | 'host';
export type Figure = 't1m' | 't1f' | 't2m' | 't2f';
export type Tag = 'protein' | 'rice' | 'carb' | 'sauce' | 'chilli';
/** Owner ruling (Q10): cuisine categories exist in the data but are never rendered. */
export type Cuisine = 'western' | 'asian' | 'chinese' | 'italian' | 'malay-indo' | 'indian';

export interface Ingredient {
  id: string;
  name: string;
  needsCut: boolean;
  needsHeat: boolean;
  tags: Tag[];
  extra?: boolean;
  /** Key in public/assets/bad/manifest.json (ASSET_BRIEF_CHATGPT.md §7). */
  assetKey: string;
}

export interface Dish {
  id: string;
  name: string;
  short: string;
  /** Local-language name shown as a caption and tooltip (owner ruling, Q1). */
  local?: string;
  cuisine: string;
  cuisines: Cuisine[];
  ingredients: string[];
  optional?: string[];
  /** The main ingredient never runs out (owner ruling, Q5). */
  main: string;
}

export type StockState = 'plenty' | 'moderate' | 'low' | 'gone';

export interface Cook {
  classKey: ClassKey;
  figure: Figure;
}

export interface DayBoard {
  city: City;
  date: string;
  resetAt: string;
  leftoversHour: boolean;
  binEaten: number;
  dishes: Dish[];
  counts: Record<string, number>;
  cooks: Record<string, Cook[]>;
  stock: Record<string, number>;
}

export interface Pick {
  playerId: string;
  date: string;
  dishId: string;
  swapsLeft: 0 | 1;
}

export type Level = 0 | 1 | 2 | 3;

export interface PlateItem {
  ingredientId: string;
  n: number;
  cut: Level;
  heat: Level;
}

export interface Plate {
  items: PlateItem[];
  flair: number;
  mess: number;
}

export type Style = 'Empty' | 'Neat' | 'Generous' | 'Unhinged';

export interface Verdict {
  name: string;
  hint?: string;
  label: string;
  line: string;
  wasteLine?: string;
  stones: 1 | 2 | 3;
  score: number;
  style: Style;
  cursed: boolean;
  habit: string;
  leftoversUsed: boolean;
  summary: string;
  dishId: string;
  key: number;
  flags: { chilli: boolean; rawRice: boolean };
}

export interface WallEntry {
  playerId: string;
  name: string;
  classKey: ClassKey;
  figure: Figure;
  gem: Gem;
  stones: 1 | 2 | 3;
  variant: string;
  style: string;
  line: string;
  platedAt: string;
}

export interface ThreadMessage {
  id: string;
  dishId: string;
  date: string;
  playerId: string;
  name: string;
  classKey: ClassKey;
  figure: Figure;
  text: string;
  at: string;
}

export interface Habits {
  chilli: number;
  rawRice: number;
  unhinged: number;
  plates: number;
  /** City-local `YYYY-MM` the counters belong to. */
  month: string;
}

export type SavedVerdict = Verdict & { date: string };

export interface Profile {
  id: string;
  name: string;
  city: City;
  classKey: ClassKey;
  gem: Gem;
  figure: Figure;
  introSeen: boolean;
  signature?: SavedVerdict;
  cursedPlates: SavedVerdict[];
  habits: Habits;
}
