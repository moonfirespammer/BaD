import { useId, useRef, type MouseEvent } from 'react';
import { COPY, fill } from '@/game/content/copy';
import { stockState } from '@/game/pool';
import { Icon } from './Icon';
import styles from './PantryCard.module.css';

export interface PantryCardProps {
  ingredientId: string;
  name: string;
  /** Units left on the city shelf. */
  units: number;
  /** Portions of this ingredient on the player's plate. */
  n: number;
  /** Prep caption for this ingredient on the plate (empty when raw). */
  prep: string;
  selected: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

/**
 * One Pantry card (spec §5 Station): name, prep caption, state caption (`Running low` in `--warning`, `Gone`),
 * a 28px minus button when the player holds portions, and a `×n` badge. Only Running low and Gone show (spec §2).
 * A Gone card stays tappable so the Bin can say so, and is marked aria-disabled.
 */
export function PantryCard({
  ingredientId,
  name,
  units,
  n,
  prep,
  selected,
  onAdd,
  onRemove,
}: PantryCardProps) {
  const st = stockState(units, ingredientId);
  const gone = st === 'gone';
  const cls = [styles.card, gone ? styles.gone : '', selected ? styles.selected : '']
    .filter(Boolean)
    .join(' ');
  const state = st === 'low' ? COPY.station.runningLow : gone ? COPY.station.gone : '';
  const add = useRef<HTMLButtonElement>(null);
  const nameId = useId();
  const minusId = useId();
  const remove = (e: MouseEvent<HTMLButtonElement>): void => {
    // The last portion unmounts the minus button: keep a keyboard user's place on this card (detail 0 = key press).
    if (n === 1 && e.detail === 0) add.current?.focus();
    onRemove();
  };
  return (
    <div className={cls} data-testid={`pantry-${ingredientId}`} data-state={st}>
      {/* One control carries name, count, prep and state, so a Gone card reads "Cucumber, Gone" and, being an
          inactive control (aria-disabled), is exempt from text contrast (WCAG 1.4.3) while keeping the spec's faint
          ink. The ×n badge sits inside it (absolutely placed on the card) so the held count is in its name. */}
      <button
        ref={add}
        type="button"
        className={styles.add}
        onClick={onAdd}
        aria-disabled={gone || undefined}
      >
        <span className={styles.name} id={nameId}>
          {name}
        </span>
        {/* Spaces between the parts keep the accessible name readable ("Ginger sauce ×2 cut"); flex ignores them. */}{' '}
        {n > 0 ? <span className={styles.badge}>{fill(COPY.station.badge, { n })}</span> : null}{' '}
        {prep ? <span className={styles.prep}>{prep}</span> : null}{' '}
        <span
          className={`${styles.state} ${st === 'low' ? styles.low : ''} ${n > 0 ? styles.roomForMinus : ''}`}
        >
          {state}
        </span>
      </button>
      {n > 0 ? (
        <button
          type="button"
          id={minusId}
          className={styles.minus}
          aria-label={COPY.a11y.remove}
          aria-labelledby={`${minusId} ${nameId}`}
          onClick={remove}
        >
          <span className={styles.minusBox}>
            <Icon name="minus" size={16} />
          </span>
        </button>
      ) : null}
    </div>
  );
}
