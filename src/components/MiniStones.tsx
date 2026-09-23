import { COPY, fill } from '@/game/content/copy';
import type { Gem } from '@/game/types';
import { GEMS } from '@/game/content/identity';
import styles from './MiniStones.module.css';

/** Three 20px mini stones in a player's gem shape; lit ones get a 2px gem-fill ring and the gem SVG (spec §6). */
export function MiniStones({ gem, stones }: { gem: Gem; stones: 0 | 1 | 2 | 3 }) {
  const shape = gem === 'ruby' ? styles.round : gem === 'sapphire' ? styles.square : styles.diamond;
  return (
    <span
      className={styles.row}
      role="img"
      aria-label={fill(COPY.a11y.stones, { n: stones, gems: GEMS[gem].plural })}
    >
      {[1, 2, 3].map((k) => {
        const on = k <= stones;
        return (
          <span
            key={k}
            className={`${styles.mini} ${shape}`}
            style={{
              boxShadow: `var(--shadow-socket), 0 0 0 2px ${on ? `var(--gem-${gem}-fill)` : 'var(--border)'}`,
            }}
          >
            {on ? (
              <span
                className={`${styles.img} ${gem === 'emerald' ? styles.unrotate : ''}`}
                style={{ backgroundImage: `url("/${GEMS[gem].file}")` }}
              />
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
