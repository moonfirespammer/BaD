import { COPY } from '@/game/content/copy';
import { useToast } from '@/store/toast';
import styles from './Toast.module.css';

/**
 * Bin toast (spec §5). The `role="status"` live region is always mounted so screen readers announce the swap of text;
 * the visible card mounts only while a remark is active.
 */
export function Toast() {
  const text = useToast((s) => s.text);
  const seq = useToast((s) => s.seq);
  return (
    <div role="status" aria-live="polite" className={styles.region}>
      {text ? (
        <div key={seq} className={styles.card} data-testid="bin-toast">
          <div className={styles.overline}>{COPY.bin.overline}</div>
          <div className={styles.body}>{text}</div>
        </div>
      ) : null}
    </div>
  );
}
