import { COPY, fill } from '@/game/content/copy';
import styles from './PlateChip.module.css';

export interface PlateChipProps {
  name: string;
  n: number;
  prep: string;
  selected: boolean;
  onSelect: () => void;
}

/** A plate item (spec §5 Station): `{Ingredient} ×n` over the prep caption; tapping selects it for strokes. */
export function PlateChip({ name, n, prep, selected, onSelect }: PlateChipProps) {
  return (
    <button
      type="button"
      className={`${styles.chip} ${selected ? styles.selected : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={styles.label}>{fill(COPY.station.chip, { Ingredient: name, n })}</span>
      <span className={styles.prep}>{prep}</span>
    </button>
  );
}
