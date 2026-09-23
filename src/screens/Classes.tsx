import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { GemSocket } from '@/components/GemSocket';
import { COPY, fill } from '@/game/content/copy';
import { CLASSES, CLASS_ORDER, GEMS, GEM_ORDER } from '@/game/content/identity';
import { useGame } from '@/store/game';
import { useShell } from '@/store/shell';
import s from './screens.module.css';
import styles from './Classes.module.css';

/** Classes (existing OraX): 3×3 class tiles, gem picker, `Play as {Class}` (spec §5). Reproduced from the prototype. */
export function Classes() {
  const profile = useGame((g) => g.profile);
  const updateProfile = useGame((g) => g.updateProfile);
  const setTab = useShell((sh) => sh.setTab);
  if (!profile) return null;
  const cls = CLASSES[profile.classKey];
  return (
    <main className={s.screen} aria-label={COPY.app.tabs.classes}>
      <div className={`${s.scroll} ${styles.scroll}`}>
        <h1 className={s.h1}>{COPY.orax.classes.title}</h1>
        <p className={`${s.overline} ${styles.subtitle}`}>{COPY.orax.classes.subtitle}</p>
        <div className={styles.grid}>
          {CLASS_ORDER.map((k) => {
            const selected = k === profile.classKey;
            return (
              <button
                key={k}
                type="button"
                className={`${styles.tile} ${selected ? styles.tileSelected : ''}`}
                aria-pressed={selected}
                onClick={() => void updateProfile({ classKey: k })}
              >
                <Avatar classKey={k} size={56} ring={3} className={styles.tileAvatar} />
                <span className={styles.tileName} style={{ color: `var(--class-${k})` }}>
                  {CLASSES[k].name}
                </span>
                <span className={`${s.overline} ${styles.role}`}>{CLASSES[k].role}</span>
              </button>
            );
          })}
        </div>
        <section className={styles.gemSection}>
          <p className={`${s.overline} ${styles.gemTitle}`}>{COPY.orax.classes.gemTitle}</p>
          <div className={`${s.card} ${styles.gemCard}`}>
            <div className={styles.sockets}>
              {GEM_ORDER.map((g) => (
                <GemSocket
                  key={g}
                  gem={g}
                  size={64}
                  active={g === profile.gem}
                  label={fill(COPY.a11y.gemPick, { Gem: GEMS[g].name, Class: cls.name })}
                  onClick={() => void updateProfile({ gem: g })}
                />
              ))}
            </div>
            <div className={styles.gemText}>
              <Chip variant={profile.gem} />
              <span className={s.caption}>{GEMS[profile.gem].cut}</span>
            </div>
          </div>
        </section>
      </div>
      <div className={s.cta}>
        <Button block onClick={() => setTab('play')}>
          {fill(COPY.orax.classes.cta, { Class: cls.name })}
        </Button>
      </div>
    </main>
  );
}
