import styles from './Logo.module.css';

/** The OraX lock-up as shipped, never reversed: on-dark file in dark, transparent file in light (auto by theme). */
export function Logo({ height = 32 }: { height?: number }) {
  return (
    <>
      <img
        className={`${styles.logo} ${styles.dark}`}
        src="/orax/assets/Logos/orax-logo-on-dark.png"
        alt="OraX"
        style={{ height }}
      />
      <img
        className={`${styles.logo} ${styles.light}`}
        src="/orax/assets/Logos/orax-logo-transparent.png"
        alt="OraX"
        style={{ height }}
      />
    </>
  );
}
