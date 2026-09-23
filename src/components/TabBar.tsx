import { COPY } from '@/game/content/copy';
import { Icon, type IconName } from '@/components/Icon';
import styles from './TabBar.module.css';

export type Tab = 'play' | 'classes' | 'you' | 'dish';

const TABS: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'play', label: COPY.app.tabs.play, icon: 'sparkles' },
  { key: 'classes', label: COPY.app.tabs.classes, icon: 'shirt' },
  { key: 'you', label: COPY.app.tabs.you, icon: 'user' },
  { key: 'dish', label: COPY.app.tabs.dish, icon: 'utensils' },
];

/** Four tabs, min-height 56, icon 24 + caption; active in brand-text (spec §5). */
export function TabBar({ tab, onTab }: { tab: Tab; onTab: (t: Tab) => void }) {
  return (
    <nav aria-label={COPY.a11y.main} className={styles.nav}>
      {TABS.map((t) => {
        const active = t.key === tab;
        return (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${active ? styles.active : ''}`}
            aria-current={active ? 'page' : undefined}
            onClick={() => onTab(t.key)}
          >
            <Icon name={t.icon} size={24} />
            <span>{t.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
