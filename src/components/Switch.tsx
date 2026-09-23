import styles from './Switch.module.css';

/** A labelled on/off switch (44px target), used for the spec's "Prefer buttons" setting (§10). */
export function Switch({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (on: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={styles.switch}
      onClick={() => onChange(!on)}
    >
      <span className={styles.label}>{label}</span>
      <span className={`${styles.track} ${on ? styles.on : ''}`} aria-hidden="true">
        <span className={styles.knob} />
      </span>
    </button>
  );
}
