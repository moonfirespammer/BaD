import { useNavigate } from 'react-router';
import { Art } from '@/components/Art';
import { Icon } from '@/components/Icon';
import { MiniStones } from '@/components/MiniStones';
import { COPY, fill } from '@/game/content/copy';
import { useGame } from '@/store/game';
import s from './screens.module.css';
import styles from './CursedPlates.module.css';

const baseWord = (name: string): string => name.split(' ')[1]?.toLowerCase() ?? 'plate';

/** Cursed Plates (spec §3.11, §5): the player's own cursed plates, newest first. Empty on a fresh profile. */
export function CursedPlates() {
  const navigate = useNavigate();
  const profile = useGame((g) => g.profile);
  if (!profile) return null;
  const plates = profile.cursedPlates;
  return (
    <main className={s.screen} aria-label={COPY.a11y.cursed}>
      <div className={s.header}>
        <button
          type="button"
          className={s.iconButton}
          aria-label={COPY.a11y.back}
          onClick={() => void navigate('/board')}
        >
          <Icon name="arrow-left" size={24} />
        </button>
        <div className={s.headerText}>
          <h1 className={s.headerTitle}>{fill(COPY.cursed.title, { n: plates.length })}</h1>
          <p className={s.caption}>{COPY.cursed.caption}</p>
        </div>
      </div>
      <div className={s.scroll}>
        <div className={styles.grid}>
          {plates.map((v, i) => (
            <div key={`${v.key}-${i}`} className={`${s.card} ${styles.card}`}>
              <Art
                slot="cursed"
                id={baseWord(v.name)}
                size={{ width: '100%', height: 96 }}
                radius="sm"
                caption={COPY.art.render}
              />
              <div className={styles.name}>{v.name}</div>
              <div className={s.caption}>
                {v.hint} · {v.date}
              </div>
              <div className={s.caption}>{v.line}</div>
              <MiniStones gem={profile.gem} stones={1} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
