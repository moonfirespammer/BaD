import { ClassCard, type ClassCardGem } from '@/components/ClassCard';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { COPY, fill } from '@/game/content/copy';
import { CITY_NAME } from '@/game/content/identity';
import type { ClassKey, Figure } from '@/game/types';
import { useGame } from '@/store/game';
import { useShell } from '@/store/shell';
import s from './screens.module.css';
import styles from './Play.module.css';

/** Party members reproduced from the prototype (existing OraX chrome, not Build-A-Dish data). */
const PARTY: Record<
  'taster' | 'provider' | 'stirrer',
  { figure: Figure; gems: ClassCardGem[]; footer: string }
> = {
  taster: {
    figure: 't1f',
    gems: [{ gem: 'emerald' }, { gem: 'emerald' }, { gem: 'sapphire' }],
    footer: COPY.orax.play.footers.taster,
  },
  provider: {
    figure: 't2m',
    gems: [{ gem: 'ruby' }, { gem: 'ruby' }, { gem: 'emerald', active: true }],
    footer: COPY.orax.play.footers.provider,
  },
  stirrer: {
    figure: 't1m',
    gems: [{ gem: 'sapphire' }, { gem: 'sapphire' }, { gem: 'ruby', active: true }],
    footer: 'Limit ×1.5 · Shift',
  },
};

/** Play (existing OraX) — venue card, the Build-A-Dish entry card, party ClassCards (spec §5). Static reproduction. */
export function Play() {
  const board = useGame((g) => g.board);
  const profile = useGame((g) => g.profile);
  const deps = useGame((g) => g.deps);
  useGame((g) => g.now); // re-render every second for the countdown
  const setTab = useShell((sh) => sh.setTab);
  if (!board || !profile || !deps) return null;
  const city = CITY_NAME[board.city];
  const total = Object.values(board.counts).reduce((a, b) => a + b, 0);
  const others = (['taster', 'provider', 'stirrer'] as const)
    .filter((k) => k !== profile.classKey)
    .slice(0, 2);
  return (
    <main className={`${s.screen} ${styles.play}`} aria-label={COPY.app.tabs.play}>
      <header className={styles.header}>
        <Logo height={32} />
        <button
          type="button"
          className={s.iconButton}
          aria-label={COPY.orax.play.notifications}
          style={{ marginRight: -10 }}
        >
          <Icon name="bell" size={24} />
        </button>
      </header>
      <section className={styles.section}>
        <div className={`${s.card} ${styles.row}`}>
          <span className={styles.brandIcon}>
            <Icon name="map-pin" size={24} />
          </span>
          <div className={styles.rowText}>
            <div className={styles.strong}>{COPY.orax.play.venue[board.city]}</div>
            <div className={s.caption}>{fill(COPY.orax.play.venueCaption, { city })}</div>
          </div>
          <span className={styles.mutedIcon}>
            <Icon name="chevron-right" size={20} />
          </span>
        </div>
      </section>
      <section className={styles.section}>
        <button
          type="button"
          className={`${s.card} ${styles.row} ${styles.entry}`}
          onClick={() => setTab('dish')}
        >
          <span className={styles.brandIcon}>
            <Icon name="utensils" size={24} />
          </span>
          <div className={styles.rowText}>
            <div className={styles.strong}>{COPY.orax.play.entry}</div>
            <div className={s.caption}>
              {fill(COPY.orax.play.entryCaption, { n: total, city, countdown: deps.clock.resetIn() })}
            </div>
          </div>
          <span className={styles.mutedIcon}>
            <Icon name="chevron-right" size={20} />
          </span>
        </button>
      </section>
      <div className={styles.partyHead}>
        <h1 className={s.h1}>{COPY.orax.play.party}</h1>
        <span className={`${s.pixel} ${styles.round}`}>{COPY.orax.play.round}</span>
      </div>
      <div className={styles.cards}>
        <ClassCard
          classKey={profile.classKey}
          figure={profile.figure}
          slot={1}
          current
          gems={[{ gem: 'sapphire' }, { gem: 'sapphire' }, { gem: profile.gem, active: true }]}
          footer={COPY.orax.play.footers.stirrer}
        />
        {others.map((k, i) => (
          <ClassCard
            key={k}
            classKey={k as ClassKey}
            figure={PARTY[k].figure}
            slot={i + 2}
            gems={PARTY[k].gems}
            footer={PARTY[k].footer}
          />
        ))}
      </div>
    </main>
  );
}
