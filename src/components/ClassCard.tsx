import type { ClassKey, Figure, Gem } from '@/game/types';
import { CLASSES } from '@/game/content/identity';
import { Avatar } from './Avatar';
import { GemSocket } from './GemSocket';
import styles from './ClassCard.module.css';

export interface ClassCardGem {
  gem: Gem;
  active?: boolean;
}

export interface ClassCardProps {
  classKey: ClassKey;
  figure?: Figure;
  slot?: number;
  gems: ClassCardGem[];
  footer?: string;
  current?: boolean;
}

/** The roster card (OraX ClassCard): avatar with class ring, name in class accent, role eyebrow, slot, three sockets, pixel footer. */
export function ClassCard({ classKey, figure = 't1m', slot, gems, footer, current = false }: ClassCardProps) {
  const c = CLASSES[classKey];
  const activeGem = gems.find((g) => g.active)?.gem;
  const edge = current && activeGem ? `var(--gem-${activeGem}-fill)` : 'var(--border)';
  return (
    <div className={styles.card} style={{ borderColor: edge }} aria-current={current ? 'true' : undefined}>
      <div className={styles.head}>
        <Avatar classKey={classKey} figure={figure} size={44} ring={3} />
        <div className={styles.text}>
          <div className={styles.name} style={{ color: `var(--class-${classKey})` }}>
            {c.name}
          </div>
          {c.role ? <div className={styles.role}>{c.role}</div> : null}
        </div>
        {slot !== undefined ? <div className={styles.slot}>{slot}</div> : null}
      </div>
      <div className={styles.gems}>
        {gems.slice(0, 3).map((g, i) => (
          <GemSocket key={i} gem={g.gem} active={g.active ?? false} size={64} />
        ))}
      </div>
      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </div>
  );
}
