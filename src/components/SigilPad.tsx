import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Art } from './Art';
import { COPY, fill } from '@/game/content/copy';
import { classify, strokePath, type Sigil, type StrokePoint } from '@/game/sigils';
import { splat } from '@/game/station';
import styles from './SigilPad.module.css';

export const FLASH_MS = 700;
export const TRAIL_FADE_MS = 450;

export interface SigilPadProps {
  mess: number;
  /** Word to flash centred on the pad; a new `seq` restarts the flash. */
  flash: { word: string; seq: number } | null;
  onSigil: (sigil: Sigil) => void;
}

/**
 * The sigil pad (spec §3.4, §5): full width, 150px, pointer gestures, never fails. Strokes are classified on release;
 * the trail fades over 450ms and the recognised word shows for 700ms (no fade or scale-in under reduced motion).
 */
export function SigilPad({ mess, flash, onSigil }: SigilPadProps) {
  const pts = useRef<StrokePoint[]>([]);
  const drawing = useRef(false);
  const [trail, setTrail] = useState('');
  const [fading, setFading] = useState(false);
  // A flash already present when the pad mounts is old news (e.g. coming back from the Board): don't replay it.
  const [expired, setExpired] = useState(() => flash?.seq ?? 0);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const word = flash && flash.seq !== expired ? flash : null;

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setExpired(flash.seq), FLASH_MS);
    return () => clearTimeout(t);
  }, [flash]);
  useEffect(
    () => () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
    },
    [],
  );

  const point = (e: PointerEvent<HTMLDivElement>): StrokePoint => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp };
  };
  const down = (e: PointerEvent<HTMLDivElement>): void => {
    drawing.current = true;
    pts.current = [point(e)];
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no capture (synthetic events) */
    }
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setFading(false);
    setTrail(strokePath(pts.current));
  };
  const move = (e: PointerEvent<HTMLDivElement>): void => {
    if (!drawing.current) return;
    pts.current.push(point(e));
    setTrail(strokePath(pts.current));
  };
  const up = (e: PointerEvent<HTMLDivElement>): void => {
    if (!drawing.current) return;
    drawing.current = false;
    const sigil = classify(pts.current, e.currentTarget.getBoundingClientRect().width, mess);
    setFading(true);
    fadeTimer.current = setTimeout(() => setTrail(''), TRAIL_FADE_MS + 50);
    if (sigil) onSigil(sigil);
  };

  return (
    <div
      className={styles.pad}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      data-testid="sigil-pad"
    >
      <span className={`${styles.label} ${styles.topLeft}`}>{COPY.station.pad}</span>
      {mess > 0 ? (
        <span className={`${styles.label} ${styles.topRight}`}>{fill(COPY.station.mess, { n: mess })}</span>
      ) : null}
      {Array.from({ length: mess }, (_, i) => {
        const s = splat(i);
        return (
          <Art
            key={i}
            slot="mess"
            id={`splat-${(i % 4) + 1}`}
            size={s.size}
            placeholder="blob"
            blobRadius={s.radius}
            className={styles.splat}
            style={{ left: `${s.left}%`, top: `${s.top}%` }}
          />
        );
      })}
      {word ? (
        <span key={word.seq} className={styles.word} data-testid="sigil-word">
          {word.word}
        </span>
      ) : null}
      <svg className={styles.trail} aria-hidden="true">
        <path d={trail} className={fading ? styles.fading : undefined} />
      </svg>
      <span className={`${styles.label} ${styles.bottom}`}>{COPY.station.padHint}</span>
    </div>
  );
}
