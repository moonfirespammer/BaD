import { useEffect, useRef } from 'react';
import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { Toast } from '@/components/Toast';
import { Board } from '@/screens/Board';
import { CursedPlates } from '@/screens/CursedPlates';
import { Intro } from '@/screens/Intro';
import { Share } from '@/screens/Share';
import { Station } from '@/screens/Station';
import { Verdict } from '@/screens/Verdict';
import { useGame } from '@/store/game';
import type { City } from '@/game/types';
import type { PoolService } from '@/services/PoolService';
import type { ProfileStore } from '@/services/profile';
import { createClock, type Clock } from '@/services/clock';
import styles from './BuildADish.module.css';

/** Screens that hide the host's tab bar (spec §5): Station, Verdict, Wall, Thread, Share. Wall and Thread are Phase 4. */
const IMMERSIVE = new Set(['/station', '/verdict', '/wall', '/thread', '/share']);

const defaultClock = createClock();

export interface BuildADishProps {
  /** The player's city; scopes the pool, the clock labels and every `{city}` string. */
  city: City;
  /** The player's profile: identity from the host, plus the game's slice (intro, signature, cursed plates, habits). */
  profile: ProfileStore;
  /** The pool backend; MockPoolService in Phases 1–4. */
  service: PoolService;
  /** City clock; defaults to real time. */
  clock?: Clock;
  /** Called when the current screen should hide the host's tab bar. */
  onImmersiveChange?: (immersive: boolean) => void;
  /** Bumped by the host each time the Dish tab is selected: the game goes back to the Board (prototype tabTo). */
  home?: number;
}

function IntroRoute({ city }: { city: City }) {
  const navigate = useNavigate();
  const markIntroSeen = useGame((g) => g.markIntroSeen);
  return (
    <Intro
      city={city}
      onDone={() => {
        void markIntroSeen().then(() => navigate('/board', { replace: true }));
      }}
    />
  );
}

function HomeWatcher({ home }: { home: number }) {
  const navigate = useNavigate();
  const seen = useRef(home);
  useEffect(() => {
    if (home === seen.current) return;
    seen.current = home;
    void navigate('/board');
  }, [home, navigate]);
  return null;
}

function ImmersiveWatcher({ onChange }: { onChange?: ((v: boolean) => void) | undefined }) {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    onChange?.(IMMERSIVE.has(pathname));
    // After a route change the new screen's title takes focus, so keyboard and screen-reader users land on it
    // (the first screen is left alone: nothing should grab focus on load).
    if (first.current) {
      first.current = false;
      return;
    }
    const title = document.querySelector<HTMLElement>('[data-testid="build-a-dish"] main h1');
    if (title) {
      title.tabIndex = -1;
      title.focus({ preventScroll: true });
    }
  }, [pathname, onChange]);
  return null;
}

/**
 * The whole Dish tab as one component (kickoff prompt: `<BuildADish city profile service />`). It initialises the
 * game store from its props, so it can be mounted on its own inside the real OraX app.
 */
export function BuildADish({
  city,
  profile,
  service,
  clock = defaultClock,
  onImmersiveChange,
  home = 0,
}: BuildADishProps) {
  const ready = useGame((g) => g.ready);
  const introSeen = useGame((g) => g.profile?.introSeen ?? false);
  useEffect(() => {
    void useGame.getState().init({ city, service, clock, profileStore: profile });
    return () => useGame.getState().dispose();
  }, [city, service, clock, profile]);
  if (!ready) return <div className={styles.root} />;
  return (
    <div className={styles.root} data-testid="build-a-dish">
      <MemoryRouter initialEntries={[introSeen ? '/board' : '/intro']}>
        <ImmersiveWatcher onChange={onImmersiveChange} />
        <HomeWatcher home={home} />
        <Routes>
          <Route path="/intro" element={<IntroRoute city={city} />} />
          <Route path="/board" element={<Board />} />
          <Route path="/cursed" element={<CursedPlates />} />
          <Route path="/station" element={<Station />} />
          <Route path="/verdict" element={<Verdict />} />
          <Route path="/share" element={<Share />} />
          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </MemoryRouter>
      <Toast />
    </div>
  );
}
