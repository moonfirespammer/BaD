import { Art } from '@/components/Art';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { MiniStones } from '@/components/MiniStones';
import { COPY, fill } from '@/game/content/copy';
import { CITY_NAME, CLASSES, GEMS } from '@/game/content/identity';
import { useGame } from '@/store/game';
import { useShell } from '@/store/shell';
import s from './screens.module.css';
import styles from './You.module.css';

/** You (existing OraX + BaD): profile card, Signature Dish, Your habits, Wardrobe, Change class (spec §5, §3.9, §3.13). */
export function You() {
  const profile = useGame((g) => g.profile);
  const setTab = useShell((sh) => sh.setTab);
  if (!profile) return null;
  const cls = CLASSES[profile.classKey];
  const gem = GEMS[profile.gem];
  const sig = profile.signature;
  return (
    <main className={`${s.screen} ${styles.you}`} aria-label={COPY.orax.you.title}>
      <header className={styles.header}>
        <h1 className={s.h1}>{COPY.orax.you.title}</h1>
        <button
          type="button"
          className={s.iconButton}
          aria-label={COPY.orax.you.settings}
          style={{ marginRight: -10 }}
        >
          <Icon name="settings" size={24} />
        </button>
      </header>
      <section className={`${s.card} ${styles.profile}`}>
        <Avatar
          classKey={profile.classKey}
          figure={profile.figure}
          size={96}
          ring={3}
          className={styles.bigAvatar}
        />
        <div className={styles.center}>
          <div className={styles.name}>{profile.name}</div>
          <div className={styles.classRow}>
            <span className={styles.className} style={{ color: `var(--class-${profile.classKey})` }}>
              {cls.name}
            </span>
            {cls.role ? <span className={s.overline}>{cls.role}</span> : null}
          </div>
        </div>
        <div className={styles.chips}>
          <Chip variant={profile.gem} />
          <Chip appearance="subtle">{CITY_NAME[profile.city]}</Chip>
          <Chip appearance="subtle">{COPY.orax.you.hawker}</Chip>
        </div>
        <p className={`${s.caption} ${styles.profileCaption}`}>
          {fill(COPY.orax.you.caption, { Gem: gem.name, Class: cls.name, n: profile.habits.plates })}
        </p>
      </section>
      <section className={styles.section}>
        <span className={s.overline}>{COPY.orax.you.signature}</span>
        {sig ? (
          <div className={`${s.card} ${styles.sigCard}`}>
            <Art slot="dishes" id={sig.dishId} size={72} radius="full" caption={COPY.art.dish} />
            <div className={styles.sigText}>
              <div className={styles.strong}>{sig.name}</div>
              <div className={s.caption}>
                {sig.label} · {sig.date}
              </div>
              <div className={styles.sigStones}>
                <MiniStones gem={profile.gem} stones={sig.stones} />
              </div>
            </div>
          </div>
        ) : (
          <div className={`${s.card} ${styles.empty}`}>
            <span className={s.caption}>{COPY.orax.you.noSignature}</span>
            <Button variant="ghost" onClick={() => setTab('dish')}>
              {COPY.orax.you.todaysDishes}
            </Button>
          </div>
        )}
      </section>
      <section className={styles.section}>
        <span className={s.overline}>{COPY.orax.you.habits}</span>
        <div className={styles.habitChips}>
          <Chip appearance="subtle">
            {fill(COPY.orax.you.habitChips.chilli, { n: profile.habits.chilli })}
          </Chip>
          <Chip appearance="subtle">
            {fill(COPY.orax.you.habitChips.rawRice, { n: profile.habits.rawRice })}
          </Chip>
          <Chip appearance="subtle">
            {fill(COPY.orax.you.habitChips.unhinged, { n: profile.habits.unhinged })}
          </Chip>
        </div>
      </section>
      <div className={styles.actions}>
        <Button variant="secondary" block>
          {COPY.orax.you.wardrobe}
        </Button>
        <Button variant="ghost" block onClick={() => setTab('classes')}>
          {COPY.orax.you.changeClass}
        </Button>
      </div>
    </main>
  );
}
