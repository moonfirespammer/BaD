import type { ClassKey, Figure } from '@/game/types';
import { CLASSES, FIGURES } from '@/game/content/identity';
import styles from './Avatar.module.css';

export interface AvatarProps {
  classKey: ClassKey;
  figure?: Figure | undefined;
  size: number;
  /** Class ring width; spec §6 says 2–3px. Defaults to 3 at 40px and above, 2 below. */
  ring?: number;
  /** Extra outer ring in the surface colour, for stacked avatars on the Board. */
  surfaceRing?: number;
  className?: string | undefined;
}

/** Background props that crop one figure's head from a 2×2 class board, ported from the OraX shared helper. */
export function avatarCrop(classKey: ClassKey, figure: Figure = 't1m', zoom = 4.5): React.CSSProperties {
  const f = FIGURES[figure];
  const pos = (v: number): string => `${(((0.5 - v * zoom) / (1 - zoom)) * 100).toFixed(2)}%`;
  return {
    backgroundImage: `url("/${CLASSES[classKey].board}")`,
    backgroundSize: `${zoom * 100}%`,
    backgroundPosition: `${pos(f.x)} ${pos(f.y)}`,
    backgroundRepeat: 'no-repeat',
  };
}

/** A round avatar cropped from the class board with a class-coloured ring (spec §6). Decorative: hidden from AT. */
export function Avatar({ classKey, figure = 't1m', size, ring, surfaceRing = 0, className }: AvatarProps) {
  const r = ring ?? (size >= 40 ? 3 : 2);
  const shadow = `0 0 0 ${r}px var(--class-${classKey})${surfaceRing ? `, 0 0 0 ${r + surfaceRing}px var(--surface-raised)` : ''}`;
  return (
    <span
      aria-hidden="true"
      className={[styles.avatar, className ?? ''].join(' ')}
      style={{ width: size, height: size, boxShadow: shadow, ...avatarCrop(classKey, figure) }}
    />
  );
}
