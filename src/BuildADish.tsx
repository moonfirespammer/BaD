import { useEffect } from 'react';
import { MemoryRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { Toast } from '@/components/Toast';
import { Board } from '@/screens/Board';
import { CursedPlates } from '@/screens/CursedPlates';
import { Intro } from '@/screens/Intro';
import { useGame } from '@/store/game';
import type { City } from '@/game/types';
import styles from './BuildADish.module.css';

/** Screens that hide the host's tab bar (spec §5): Station, Verdict, Wall, Thread, Share. Added in Phases 2–4. */
const IMMERSIVE = new Set(['/station', '/verdict', '/wall', '/thread', '/share']);

export interface BuildADishProps {
  city: City;
  /** Called when the current screen should hide the host's tab bar. */
  onImmersiveChange?: (immersive: boolean) => void;
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

function ImmersiveWatcher({ onChange }: { onChange?: ((v: boolean) => void) | undefined }) {
  const { pathname } = useLocation();
  useEffect(() => {
    onChange?.(IMMERSIVE.has(pathname));
  }, [pathname, onChange]);
  return null;
}

/**
 * The whole Dish tab as one component, mounted inside the app shell (and later the real OraX app).
 * The game store must be initialised (useGame.init) by the host before mounting.
 */
export function BuildADish({ city, onImmersiveChange }: BuildADishProps) {
  const ready = useGame((g) => g.ready);
  const introSeen = useGame((g) => g.profile?.introSeen ?? false);
  if (!ready) return <div className={styles.root} />;
  return (
    <div className={styles.root} data-testid="build-a-dish">
      <MemoryRouter initialEntries={[introSeen ? '/board' : '/intro']}>
        <ImmersiveWatcher onChange={onImmersiveChange} />
        <Routes>
          <Route path="/intro" element={<IntroRoute city={city} />} />
          <Route path="/board" element={<Board />} />
          <Route path="/cursed" element={<CursedPlates />} />
          <Route path="*" element={<Navigate to="/board" replace />} />
        </Routes>
      </MemoryRouter>
      <Toast />
    </div>
  );
}
