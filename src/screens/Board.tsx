import { useNavigate } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Logo } from '@/components/Logo';
import { COPY, fill } from '@/game/content/copy';
import { dishLower } from '@/game/content/dishes';
import { CITY_NAME } from '@/game/content/identity';
import { boardCta, dishStockState } from '@/game/pool';
import type { DayBoard, Dish, StockState } from '@/game/types';
import { useGame } from '@/store/game';
import s from './screens.module.css';
import styles from './Board.module.css';

const STOCK_COLOR: Record<StockState, string> = {
  plenty: 'var(--success)',
  moderate: 'var(--ink-muted)',
  low: 'var(--warning)',
  gone: 'var(--gem-ruby-fill)',
};

function DishCard({
  d,
  board,
  selected,
  picked,
  onSelect,
}: {
  d: Dish;
  board: DayBoard;
  selected: boolean;
  picked: boolean;
  onSelect: () => void;
}) {
  const st = dishStockState(d.id, board.stock);
  const count = board.counts[d.id] ?? 0;
  const cooks = board.cooks[d.id] ?? [];
  return (
    <button
      type="button"
      className={`${styles.dish} ${selected ? styles.dishSelected : ''} ${selected && !picked ? styles.dishTinted : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
      title={d.local}
    >
      <div className={styles.dishTop}>
        <div className={styles.dishText}>
          <div className={styles.dishName}>{d.name}</div>
          {d.local ? <div className={s.caption}>{d.local}</div> : null}
        </div>
        {picked ? <Chip>{COPY.board.cookingToday}</Chip> : null}
      </div>
      <div className={styles.dishBottom}>
        <div className={styles.stock} data-stock={st}>
          {st === 'gone' ? (
            // --danger text on a raised card is 4.34:1; the ruby fill/on pair is a guaranteed ≥ 4.5:1 token pair.
            <Chip variant="ruby">{COPY.board.stock[st]}</Chip>
          ) : (
            <span style={{ color: STOCK_COLOR[st] }}>{COPY.board.stock[st]}</span>
          )}
        </div>
        <div className={styles.cooks}>
          <div className={styles.avatars}>
            {cooks.slice(0, 3).map((c, i) => (
              <Avatar
                key={i}
                classKey={c.classKey}
                figure={c.figure}
                size={24}
                ring={2}
                surfaceRing={2}
                className={styles.stacked}
              />
            ))}
          </div>
          <span className={styles.count}>{count}</span>
          <span className={s.caption}>{COPY.board.cooking}</span>
        </div>
      </div>
    </button>
  );
}

/** Today's dishes (spec §5 Board, §3.2 picking). */
export function Board() {
  const navigate = useNavigate();
  const board = useGame((g) => g.board);
  const pick = useGame((g) => g.pick);
  const profile = useGame((g) => g.profile);
  const selected = useGame((g) => g.selectedDish);
  const deps = useGame((g) => g.deps);
  useGame((g) => g.now); // re-render every second for the countdown
  const selectDish = useGame((g) => g.selectDish);
  const pickSelected = useGame((g) => g.pickSelected);
  const swapToSelected = useGame((g) => g.swapToSelected);
  const busy = useGame((g) => g.busy);
  if (!board || !deps || !profile) return null;
  const cityName = CITY_NAME[board.city];
  const countdown = deps.clock.resetIn();
  const cta = boardCta(pick?.dishId ?? null, selected, pick?.swapsLeft ?? 1);
  const ctaDish = 'dishId' in cta ? board.dishes.find((d) => d.id === cta.dishId) : undefined;
  const ctaLabel =
    cta.kind === 'pick'
      ? COPY.board.cta.pick
      : cta.kind === 'noSwaps'
        ? COPY.board.cta.noSwaps
        : fill(COPY.board.cta[cta.kind === 'pickDish' ? 'pickDish' : cta.kind], {
            dish: ctaDish ? dishLower(ctaDish) : '',
          });
  const onCta = (): void => {
    if (cta.kind === 'pickDish') void pickSelected();
    else if (cta.kind === 'swap') void swapToSelected();
    else if (cta.kind === 'cook') void navigate('/station');
  };
  const pickedDish = pick ? board.dishes.find((d) => d.id === pick.dishId) : undefined;
  return (
    <main className={s.screen} aria-label={COPY.board.title}>
      <div className={s.scroll}>
        <header className={styles.header}>
          <Logo height={32} />
          <div className={styles.headerRight}>
            <span className={s.pixel}>{fill(COPY.board.resets, { countdown })}</span>
            <span className={`${s.pixel} ${styles.city}`}>{cityName}</span>
          </div>
        </header>
        <div className={styles.titleRow}>
          <h1 className={s.h1}>{COPY.board.title}</h1>
          <button type="button" className={styles.link} onClick={() => void navigate('/cursed')}>
            {fill(COPY.board.cursedLink, { n: profile.cursedPlates.length })}
          </button>
        </div>
        <p className={`${s.caption} ${styles.caption}`}>{fill(COPY.board.caption, { city: cityName })}</p>
        {board.leftoversHour ? (
          <div className={styles.banner}>
            <span className={`${s.pixel} ${styles.bannerLabel}`}>{COPY.board.leftoversLabel}</span>
            <span className={s.caption}>{COPY.board.leftoversCaption}</span>
          </div>
        ) : null}
        {pickedDish ? (
          <p className={styles.youAreIn}>
            {fill(COPY.board.youAreIn, { n: board.counts[pickedDish.id] ?? 0, dish: dishLower(pickedDish) })}
          </p>
        ) : null}
        <div className={styles.list}>
          {board.dishes.map((d) => (
            <DishCard
              key={d.id}
              d={d}
              board={board}
              selected={selected === d.id}
              picked={pick?.dishId === d.id}
              onSelect={() => selectDish(d.id)}
            />
          ))}
        </div>
        <p className={`${s.caption} ${styles.footer}`}>
          {fill(COPY.board.footer, { n: board.binEaten.toLocaleString('en-SG'), city: cityName })}
        </p>
      </div>
      <div className={s.cta}>
        <Button block disabled={cta.disabled || busy} onClick={onCta}>
          {ctaLabel}
        </Button>
      </div>
    </main>
  );
}
