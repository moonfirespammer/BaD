import { COPY, fill } from '@/game/content/copy';
import type { Gem } from '@/game/types';
import { GEMS } from '@/game/content/identity';
import styles from './GemSocket.module.css';

export interface GemSocketProps {
  gem: Gem;
  active?: boolean;
  size?: number;
  onClick?: () => void;
  label?: string;
}

/** A recessed well holding one gem. Ruby round, Sapphire rounded square, Emerald 45° diamond (OraX GemSocket). */
export function GemSocket({ gem, active = false, size = 72, onClick, label }: GemSocketProps) {
  const g = GEMS[gem];
  const stone = Math.round(size * 0.57);
  const diamond = gem === 'emerald';
  const wellSize = diamond ? Math.round(size * 0.79) : size;
  const radius =
    gem === 'ruby'
      ? 'var(--radius-full)'
      : gem === 'sapphire'
        ? 'var(--radius-lg)'
        : `${Math.round(size * 0.14)}px`;
  const wellStyle: React.CSSProperties = {
    width: wellSize,
    height: wellSize,
    borderRadius: radius,
    boxShadow: active
      ? `var(--shadow-socket), 0 0 0 3px var(--gem-${gem}-fill), var(--glow-${gem})`
      : 'var(--shadow-socket), 0 0 0 3px var(--border)',
    transform: diamond ? 'rotate(45deg)' : undefined,
  };
  const img = (
    <div
      className={styles.well}
      style={wellStyle}
      data-shape={gem === 'ruby' ? 'round' : gem === 'sapphire' ? 'rounded-square' : 'diamond'}
    >
      <img
        src={`/${g.file}`}
        alt=""
        draggable={false}
        style={{ width: stone, height: stone, transform: diamond ? 'rotate(-45deg)' : undefined }}
      />
    </div>
  );
  if (onClick) {
    return (
      <button
        type="button"
        className={`${styles.socket} ${styles.interactive}`}
        style={{ width: size, height: size }}
        aria-pressed={active}
        aria-label={label ?? fill(COPY.a11y.gem, { Gem: g.name })}
        onClick={onClick}
      >
        {img}
      </button>
    );
  }
  return (
    <div
      className={styles.socket}
      style={{ width: size, height: size }}
      role="img"
      aria-label={label ?? fill(active ? COPY.a11y.gemActive : COPY.a11y.gem, { Gem: g.name })}
    >
      {img}
    </div>
  );
}
