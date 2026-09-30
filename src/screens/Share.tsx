import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { GemSocket } from '@/components/GemSocket';
import { Icon } from '@/components/Icon';
import { Logo } from '@/components/Logo';
import { Tagline } from '@/components/Tagline';
import { COPY, fill } from '@/game/content/copy';
import { CITY_NAME, CLASSES } from '@/game/content/identity';
import { formatDate } from '@/services/clock';
import { downloadImage, renderShareCard } from '@/services/shareImage';
import { useGame } from '@/store/game';
import s from './screens.module.css';
import styles from './Share.module.css';

/** Share card (spec §3.12, §5): the 326px card, `Send to your party` (→ sent, disabled) and `Save image` (PNG). */
export function Share() {
  const navigate = useNavigate();
  const verdict = useGame((g) => g.verdict);
  const pick = useGame((g) => g.pick);
  const profile = useGame((g) => g.profile);
  const deps = useGame((g) => g.deps);
  const sent = useGame((g) => g.sent);
  const sendToParty = useGame((g) => g.sendToParty);
  const card = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  if (!deps || !profile) return null;
  if (!verdict || pick?.dishId !== verdict.dishId) return <Navigate to="/board" replace />;
  const cls = CLASSES[profile.classKey];
  const date = formatDate(deps.clock.now());

  const save = async (): Promise<void> => {
    const node = card.current;
    if (!node || saving) return;
    setSaving(true);
    try {
      downloadImage(await renderShareCard(node), `build-a-dish-${deps.clock.city().date}.png`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className={s.screen} aria-label={COPY.share.title}>
      <div className={s.header}>
        <button
          type="button"
          className={s.iconButton}
          aria-label={COPY.a11y.backToVerdict}
          onClick={() => void navigate('/verdict')}
        >
          <Icon name="arrow-left" size={24} />
        </button>
        <h1 className={`${s.headerTitle} ${styles.title}`}>{COPY.share.title}</h1>
      </div>

      <div className={`${s.scroll} ${styles.scroll}`}>
        <div ref={card} className={`${s.card} ${styles.card}`} data-testid="share-card">
          <div className={styles.top}>
            <Logo height={32} />
            <span className={`${s.pixel} ${styles.pixel}`}>{COPY.app.pixelLabel}</span>
          </div>
          <span className={s.overline}>
            {fill(COPY.share.overline, { CITY: CITY_NAME[profile.city], date })}
          </span>
          <h2 className={styles.name}>{verdict.name}</h2>
          <p className={styles.line}>{verdict.line}</p>
          <div className={styles.stones}>
            {[1, 2, 3].map((k) => (
              <GemSocket key={k} gem={profile.gem} active={k <= verdict.stones} size={44} />
            ))}
          </div>
          <div className={styles.me}>
            <Avatar classKey={profile.classKey} figure={profile.figure} size={44} />
            <div className={styles.meText}>
              <div className={styles.meName}>{profile.name}</div>
              <div className={styles.meClass} style={{ color: `var(--class-${profile.classKey})` }}>
                {cls.name}
              </div>
            </div>
            <Chip variant={profile.gem} />
          </div>
          <Tagline size="md" />
        </div>
      </div>

      <div className={`${s.cta} ${styles.actions}`}>
        <Button block disabled={sent} onClick={sendToParty}>
          {sent ? COPY.share.sent : COPY.share.send}
        </Button>
        <Button variant="secondary" block disabled={saving} onClick={() => void save()}>
          {COPY.share.save}
        </Button>
      </div>
    </main>
  );
}
