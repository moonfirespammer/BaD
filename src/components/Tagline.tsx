import { COPY } from '@/game/content/copy';
import styles from './Tagline.module.css';

/** The OraX Tagline (design-system brand component): two Silkscreen lines, the last word of each in brand-text. */
export function Tagline({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <p className={`${styles.tagline} ${styles[size]}`}>
      {COPY.orax.tagline.map((line) => {
        const cut = line.lastIndexOf(' ') + 1;
        return (
          <span key={line} className={styles.line}>
            {line.slice(0, cut)}
            <span className={styles.accent}>{line.slice(cut)}</span>
          </span>
        );
      })}
    </p>
  );
}
