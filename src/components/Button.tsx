import type { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  block?: boolean;
  icon?: ReactNode;
}

/** The one action control (OraX Button): primary = brand fill, secondary = raised + border-strong, ghost = brand-text. */
export function Button({
  variant = 'primary',
  block = false,
  icon,
  className,
  children,
  ...rest
}: ButtonProps) {
  const cls = [styles.btn, styles[variant], block ? styles.block : '', className ?? '']
    .filter(Boolean)
    .join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}
