import type { City, ClassKey, Figure, Gem } from '../types';

export interface ClassInfo {
  name: string;
  role: string;
  board: string;
}

/** Spec §6 and the OraX design-system bundle. Roles are known for three classes only. */
export const CLASSES: Readonly<Record<ClassKey, ClassInfo>> = {
  provider: { name: 'Provider', role: 'Fighter', board: 'orax/assets/Classes/01-provider-board.png' },
  foodsmith: { name: 'Foodsmith', role: '', board: 'orax/assets/Classes/02-foodsmith-board.png' },
  spark: { name: 'Spark', role: '', board: 'orax/assets/Classes/03-spark-board.png' },
  gastronaut: { name: 'Gastronaut', role: '', board: 'orax/assets/Classes/04-gastronaut-board.png' },
  taster: { name: 'Taster', role: 'Rogue', board: 'orax/assets/Classes/05-taster-board.png' },
  purist: { name: 'Purist', role: '', board: 'orax/assets/Classes/06-purist-board.png' },
  rebel: { name: 'Rebel', role: '', board: 'orax/assets/Classes/07-rebel-board.png' },
  stirrer: { name: 'Stirrer', role: 'Mage', board: 'orax/assets/Classes/08-stirrer-board.png' },
  host: { name: 'Host', role: '', board: 'orax/assets/Classes/09-host-board.png' },
};

export const CLASS_ORDER: readonly ClassKey[] = [
  'provider',
  'foodsmith',
  'spark',
  'gastronaut',
  'taster',
  'purist',
  'rebel',
  'stirrer',
  'host',
];

export interface GemInfo {
  name: string;
  plural: string;
  cut: string;
  file: string;
}

export const GEMS: Readonly<Record<Gem, GemInfo>> = {
  ruby: {
    name: 'Ruby',
    plural: 'rubies',
    cut: 'Round brilliant · round setting',
    file: 'orax/assets/Gems/ruby.svg',
  },
  sapphire: {
    name: 'Sapphire',
    plural: 'sapphires',
    cut: 'Cushion · rounded-square setting',
    file: 'orax/assets/Gems/sapphire.svg',
  },
  emerald: {
    name: 'Emerald',
    plural: 'emeralds',
    cut: 'Lozenge · diamond setting',
    file: 'orax/assets/Gems/emerald.svg',
  },
};

export const GEM_ORDER: readonly Gem[] = ['ruby', 'sapphire', 'emerald'];

/** Figure anchors on the 2×2 class boards (spec §6), as fractions of the board. */
export const FIGURES: Readonly<Record<Figure, { x: number; y: number }>> = {
  t1m: { x: 0.28, y: 0.09 },
  t1f: { x: 0.72, y: 0.09 },
  t2m: { x: 0.28, y: 0.585 },
  t2f: { x: 0.72, y: 0.585 },
};

export const CITY_NAME: Readonly<Record<City, string>> = { SG: 'Singapore', KL: 'Kuala Lumpur' };
export const CITY_TZ: Readonly<Record<City, string>> = { SG: 'Asia/Singapore', KL: 'Asia/Kuala_Lumpur' };
