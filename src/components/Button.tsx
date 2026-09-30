import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  block?: boolean;
  icon?: ReactNode;
}

/**
 * The one action control (OraX Button): primary = brand fill, secondary = raised + border-strong, ghost = brand-text.
 * `done` is the spec's "→ {label}, disabled" state for a button that just did its thing: it looks disabled and
 * ignores presses, but keeps keyboard focus and announces its new label instead of dropping focus to the page.
 */
export function Button({
  variant = 'primary',
  block = false,
  icon,
  className,
  children,
  done = false,
  onClick,
  ...rest
}: ButtonProps & { done?: boolean }) {
  const cls = [styles.btn, styles[variant], block ? styles.block : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type="button"
      className={cls}
      aria-disabled={done || undefined}
      aria-live={done ? 'polite' : undefined}
      onClick={done ? undefined : onClick}
      {...rest}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
