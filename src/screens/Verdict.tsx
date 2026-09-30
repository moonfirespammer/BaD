import { Navigate, useNavigate } from 'react-router';
import { Art } from '@/components/Art';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { GemSocket } from '@/components/GemSocket';
import { Icon } from '@/components/Icon';
import { COPY, fill } from '@/game/content/copy';
import { dish, dishLower } from '@/game/content/dishes';
import { CITY_NAME, GEMS } from '@/game/content/identity';
import { styleWord } from '@/game/station';
import type { Verdict as VerdictModel } from '@/game/types';
import { formatDate } from '@/services/clock';
import { useGame } from '@/store/game';
import s from './screens.module.css';
import styles from './Verdict.module.css';

/** The Bin's pose for a verdict (asset brief: approving · judging · neutral · disgusted). */
export const binPose = (v: Pick<VerdictModel, 'cursed' | 'stones'>): string =>
  v.cursed ? 'disgusted' : v.stones === 3 ? 'approving' : v.stones === 2 ? 'judging' : 'neutral';

/** The Bin's verdict (spec §3.5–3.9, §3.13, §5 Verdict): line, name, label, stones in the player's gem, chips. */
export function Verdict() {
  const navigate = useNavigate();
  const verdict = useGame((g) => g.verdict);
  const pick = useGame((g) => g.pick);
  const board = useGame((g) => g.board);
  const profile = useGame((g) => g.profile);
  const deps = useGame((g) => g.deps);
  const setSignature = useGame((g) => g.setSignature);
  useGame((g) => g.now); // re-render every second for the countdown
  if (!board || !deps || !profile) return null;
  if (!verdict || pick?.dishId !== verdict.dishId) return <Navigate to="/board" replace />;
  const d = dish(verdict.dishId);
  const lower = dishLower(d);
  // "Signature Dish set" means this very verdict: the same plate on the same dish today, judged the same way (flair
  // can lift the same plate to more stones, and that plate may replace the earlier one).
  const sig = profile.signature;
  const isSignature =
    sig?.key === verdict.key &&
    sig.dishId === verdict.dishId &&
    sig.stones === verdict.stones &&
    sig.label === verdict.label &&
    sig.date === formatDate(deps.clock.now());
  const gem = GEMS[profile.gem];

  return (
    <main className={s.screen} aria-label={COPY.verdict.title}>
      <div className={s.header}>
        <button
          type="button"
          className={s.iconButton}
          aria-label={COPY.a11y.back}
          onClick={() => void navigate('/board')}
        >
          <Icon name="x" size={24} />
        </button>
        <h1 className={`${s.headerTitle} ${styles.title}`}>{COPY.verdict.title}</h1>
        <span className={`${s.pixel} ${styles.countdown}`}>
          {fill(COPY.station.resets, { countdown: deps.clock.resetIn() })}
        </span>
      </div>

      <div className={`${s.scroll} ${styles.scroll}`}>
        <Art slot="bin" id={binPose(verdict)} size={140} radius="full" caption={COPY.art.bin} />

        <section className={`${s.card} ${styles.binCard}`} aria-label={COPY.bin.overline}>
          <span className={s.overline}>{COPY.bin.overline}</span>
          <p className={styles.line}>{verdict.line}</p>
          {verdict.wasteLine ? <p className={`${s.caption} ${styles.waste}`}>{verdict.wasteLine}</p> : null}
        </section>

        <div className={styles.centre}>
          {verdict.cursed ? (
            <div className={`${s.overline} ${styles.cursedOverline}`}>
              {fill(COPY.verdict.cursedOverline, { dish: lower })}
            </div>
          ) : null}
          <h2 className={styles.name}>{verdict.name}</h2>
          <p className={styles.label}>{verdict.label}</p>
          {verdict.summary ? <p className={`${s.caption} ${styles.summary}`}>{verdict.summary}</p> : null}
        </div>

        <div className={styles.stones}>
          <div className={styles.sockets} data-testid="verdict-stones" aria-hidden="true">
            {[1, 2, 3].map((k) => (
              <GemSocket key={k} gem={profile.gem} active={k <= verdict.stones} size={56} decorative />
            ))}
          </div>
          <span className={s.caption}>
            {fill(COPY.verdict.stones, { n: verdict.stones, gems: gem.plural })}
          </span>
        </div>

        <ul className={styles.chips}>
          <li>
            <Chip appearance="subtle">{styleWord(verdict.style)}</Chip>
          </li>
          <li>
            <Chip appearance="subtle">{verdict.habit}</Chip>
          </li>
          {verdict.leftoversUsed ? (
            <li>
              <Chip appearance="subtle">{COPY.verdict.leftoversChip}</Chip>
            </li>
          ) : null}
          {verdict.cursed ? (
            <li>
              <Chip variant="ruby" appearance="outline">
                {COPY.verdict.cursedChip}
              </Chip>
            </li>
          ) : null}
        </ul>

        <div className={styles.actions}>
          <Button block onClick={() => void navigate('/share')}>
            {COPY.verdict.share}
          </Button>
          <Button variant="secondary" block done={isSignature} onClick={() => void setSignature()}>
            {isSignature ? COPY.verdict.signatureSet : COPY.verdict.setSignature}
          </Button>
          <Button variant="ghost" block onClick={() => void navigate('/wall')}>
            {fill(COPY.verdict.seeOthers, { dish: lower })}
          </Button>
        </div>

        <p className={`${s.caption} ${styles.footer}`}>
          {fill(COPY.board.footer, {
            n: board.binEaten.toLocaleString('en-SG'),
            city: CITY_NAME[board.city],
          })}
        </p>
      </div>
    </main>
  );
}
