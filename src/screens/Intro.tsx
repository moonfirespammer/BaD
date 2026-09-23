import { useState } from 'react';
import { Art } from '@/components/Art';
import { Button } from '@/components/Button';
import { Logo } from '@/components/Logo';
import { COPY, fill } from '@/game/content/copy';
import { CITY_NAME } from '@/game/content/identity';
import type { City } from '@/game/types';
import s from './screens.module.css';
import styles from './Intro.module.css';

const ART: [{ id: string; caption: string }, ...{ id: string; caption: string }[]] = [
  { id: '01-shelf', caption: COPY.art.intro[0] },
  { id: '02-sigils', caption: COPY.art.intro[1] },
  { id: '03-bin', caption: COPY.art.intro[2] },
];

/** First-time intro (spec §3.14, §5): three beats, dots, Next / Start cooking, ghost Skip. Shown once, persisted. */
export function Intro({ city, onDone }: { city: City; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const beat = COPY.intro.beats[step] ?? COPY.intro.beats[0];
  const art = ART[step] ?? ART[0];
  const last = step === COPY.intro.beats.length - 1;
  return (
    <main className={`${s.screen} ${styles.intro}`} aria-label="Intro">
      <div className={styles.top}>
        <Logo height={32} />
        <span className={`${s.pixel} ${styles.label}`}>{COPY.app.pixelLabel}</span>
      </div>
      <div className={styles.beat}>
        <Art
          slot="intro"
          id={art.id}
          size={{ width: '100%', height: 220 }}
          radius="md"
          caption={art.caption}
        />
        <h1 className={styles.headline}>{beat.headline}</h1>
        <p className={styles.body}>{fill(beat.body, { city: CITY_NAME[city] })}</p>
      </div>
      <div className={styles.dots} aria-hidden="true">
        {COPY.intro.beats.map((_, i) => (
          <span key={i} className={`${styles.dot} ${i === step ? styles.dotOn : ''}`} />
        ))}
      </div>
      <div className={styles.actions}>
        <Button block onClick={() => (last ? onDone() : setStep(step + 1))}>
          {last ? COPY.intro.start : COPY.intro.next}
        </Button>
        <Button variant="ghost" block onClick={onDone}>
          {COPY.intro.skip}
        </Button>
      </div>
    </main>
  );
}
