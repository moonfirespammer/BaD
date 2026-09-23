import { useEffect, useMemo } from 'react';
import { BuildADish } from './BuildADish';
import { Classes } from './screens/Classes';
import { Play } from './screens/Play';
import { You } from './screens/You';
import { TabBar } from './components/TabBar';
import { useGame } from './store/game';
import { useShell } from './store/shell';
import type { City } from './game/types';
import { createClock, clockFromSearch } from './services/clock';
import { createStorage } from './services/storage';
import { ProfileStore } from './services/profile';
import { MockPoolService } from './services/MockPoolService';
import styles from './App.module.css';

/**
 * Stand-in for the OraX host app: four tabs, theme attribute, the services the Dish tab needs.
 * Dev-only URL parameters: ?city=SG|KL and ?theme=light (things the real host supplies), ?clock= and ?leftovers= (clock.ts).
 */
export function App() {
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const city: City = params.get('city') === 'KL' ? 'KL' : 'SG';
  const tab = useShell((s) => s.tab);
  const setTab = useShell((s) => s.setTab);
  const immersive = useShell((s) => s.immersive);
  const setImmersive = useShell((s) => s.setImmersive);
  const ready = useGame((g) => g.ready);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', params.get('theme') === 'light' ? 'light' : 'dark');
  }, [params]);

  // The host owns the services; the Dish tab initialises the game store from them.
  const deps = useMemo(() => {
    const clock = createClock(clockFromSearch(window.location.search));
    const storage = createStorage();
    const profile = new ProfileStore(storage, { city });
    const service = new MockPoolService({ city, clock, storage, profile });
    return { clock, profile, service };
  }, [city]);

  return (
    <div className={styles.app}>
      <div className={styles.content}>
        {ready ? (
          <>
            <div className={styles.panel} hidden={tab !== 'play'}>
              <Play />
            </div>
            <div className={styles.panel} hidden={tab !== 'classes'}>
              <Classes />
            </div>
            <div className={styles.panel} hidden={tab !== 'you'}>
              <You />
            </div>
          </>
        ) : null}
        <div className={styles.panel} hidden={tab !== 'dish'}>
          <BuildADish
            city={city}
            profile={deps.profile}
            service={deps.service}
            clock={deps.clock}
            onImmersiveChange={setImmersive}
          />
        </div>
      </div>
      {immersive && tab === 'dish' ? null : <TabBar tab={tab} onTab={setTab} />}
    </div>
  );
}
