import type { HTMLAttributes } from 'react';
import type { Gem } from '@/game/types';
import { GEMS } from '@/game/content/identity';
import styles from './Chip.module.css';

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Gem | 'brand';
  appearance?: 'filled' | 'outline' | 'subtle';
}

/** A small label for a gem variant or the brand (OraX Chip). Labels, not buttons. */
export function Chip({
  variant = 'brand',
  appearance = 'filled',
  children,
  className,
  style,
  ...rest
}: ChipProps) {
  const gem = variant !== 'brand';
  const cls = [
    styles.chip,
    gem ? (appearance === 'outline' ? styles.gemOutline : styles.gemFilled) : styles[appearance],
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');
  const gemStyle = gem
    ? ({
        '--chip-fill': `var(--gem-${variant}-fill)`,
        '--chip-on': `var(--gem-${variant}-on)`,
        '--chip-text': `var(--gem-${variant}-text)`,
      } as React.CSSProperties)
    : {};
  return (
    <span className={cls} style={{ ...gemStyle, ...style }} {...rest}>
      {children ?? (gem ? GEMS[variant].name : null)}
    </span>
  );
}
