import { useRef } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Button } from '@/components/Button';
import { Icon } from '@/components/Icon';
import { PantryCard } from '@/components/PantryCard';
import { PlateChip } from '@/components/PlateChip';
import { SigilPad } from '@/components/SigilPad';
import { Switch } from '@/components/Switch';
import { COPY, fill } from '@/game/content/copy';
import { EXTRAS, ingredient } from '@/game/content/ingredients';
import { CITY_NAME } from '@/game/content/identity';
import { portionStyle, prepText, styleWord } from '@/game/station';
import { useGame } from '@/store/game';
import s from './screens.module.css';
import styles from './Station.module.css';

/** Station (spec §3.3–3.4, §5): the plate, the sigil pad, the city Pantry, Plate it. */
export function Station() {
  const navigate = useNavigate();
  const board = useGame((g) => g.board);
  const pick = useGame((g) => g.pick);
  const deps = useGame((g) => g.deps);
  const plate = useGame((g) => g.plate);
  const selectedIng = useGame((g) => g.selectedIng);
  const flash = useGame((g) => g.flash);
  const preferButtons = useGame((g) => g.profile?.preferButtons ?? false);
  useGame((g) => g.now); // re-render every second for the countdown
  const plateCard = useRef<HTMLElement>(null);
  const g = useGame.getState();
  if (!board || !deps) return null;
  if (!pick) return <Navigate to="/board" replace />;
  const d = board.dishes.find((x) => x.id === pick.dishId);
  if (!d) return <Navigate to="/board" replace />;

  const held = (id: string): number => plate.items.find((i) => i.ingredientId === id)?.n ?? 0;
  const prepOf = (id: string): string => {
    const it = plate.items.find((i) => i.ingredientId === id);
    return it ? prepText(it, false) : '';
  };
  const card = (id: string) => (
    <PantryCard
      key={id}
      ingredientId={id}
      name={ingredient(id).name}
      units={board.stock[id] ?? 0}
      n={held(id)}
      prep={prepOf(id)}
      selected={selectedIng === id}
      onAdd={() => void g.tapIngredient(id)}
      onRemove={() => void g.removeIngredient(id)}
    />
  );
  const items = plate.items.filter((i) => i.n > 0);
  const selectedItem = items.find((i) => i.ingredientId === selectedIng);
  const [applyPre, applyPost] = COPY.station.strokesApply.split('{item}');

  return (
    <main className={s.screen} aria-label={d.name}>
      <div className={s.header}>
        <button
          type="button"
          className={s.iconButton}
          aria-label={COPY.a11y.back}
          onClick={() => void navigate('/board')}
        >
          <Icon name="arrow-left" size={24} />
        </button>
        <div className={s.headerText} title={d.local}>
          <h1 className={s.headerTitle}>{d.name}</h1>
          {d.local ? <p className={s.caption}>{d.local}</p> : null}
        </div>
        <span className={`${s.pixel} ${styles.countdown}`}>
          {fill(COPY.station.resets, { countdown: deps.clock.resetIn() })}
        </span>
      </div>

      <div className={`${s.scroll} ${styles.scroll}`}>
        {board.leftoversHour ? (
          <div className={styles.banner}>
            <span className={`${s.pixel} ${styles.bannerLabel}`}>{COPY.board.leftoversLabel}</span>
            <span className={s.caption}>{COPY.station.leftoversCaption}</span>
          </div>
        ) : null}

        <section
          ref={plateCard}
          tabIndex={-1}
          className={`${s.card} ${styles.plate}`}
          aria-label={COPY.station.plate}
        >
          <div className={styles.plateHead}>
            <span className={s.overline}>{COPY.station.plate}</span>
            <span className={`${s.pixel} ${styles.plateLabel}`}>
              {fill(COPY.station.plateLabel, { STYLE: styleWord(portionStyle(items, d)), n: plate.flair })}
            </span>
          </div>
          {items.length === 0 ? <p className={`${s.caption} ${styles.empty}`}>{COPY.station.empty}</p> : null}
          {items.length ? (
            <div className={styles.chips}>
              {items.map((i) => (
                <PlateChip
                  key={i.ingredientId}
                  name={ingredient(i.ingredientId).name}
                  n={i.n}
                  prep={prepText(i, true)}
                  selected={selectedIng === i.ingredientId}
                  onSelect={() => g.selectItem(i.ingredientId)}
                />
              ))}
            </div>
          ) : null}
          {selectedItem ? (
            <div className={styles.applyRow}>
              <span className={s.caption}>
                {applyPre}
                <strong className={styles.applyName}>{ingredient(selectedItem.ingredientId).name}</strong>
                {applyPost}
              </span>
              <button
                type="button"
                className={styles.fling}
                onClick={(e) => {
                  // Flinging unmounts this button: keep a keyboard user's place on the plate (detail 0 = key press).
                  if (e.detail === 0) plateCard.current?.focus();
                  void g.fling();
                }}
              >
                {COPY.station.fling}
              </button>
            </div>
          ) : null}
        </section>

        <SigilPad mess={plate.mess} flash={flash} onSigil={(sig) => void g.stroke(sig.kind, sig.fast)} />
        <div className={styles.buttonsRow}>
          {preferButtons ? (
            <div className={styles.prepButtons}>
              <Button variant="secondary" onClick={() => void g.stroke('cut', false)}>
                {COPY.station.cut}
              </Button>
              <Button variant="secondary" onClick={() => void g.stroke('heat', false)}>
                {COPY.station.heat}
              </Button>
            </div>
          ) : (
            <span />
          )}
          <Switch
            label={COPY.station.preferButtons}
            on={preferButtons}
            onChange={(on) => void g.setPreferButtons(on)}
          />
        </div>

        <section aria-label={fill(COPY.station.pantry, { CITY: CITY_NAME[board.city] })}>
          <div className={styles.pantryHead}>
            <span className={s.overline}>{fill(COPY.station.pantry, { CITY: CITY_NAME[board.city] })}</span>
            <span className={`${s.caption} ${styles.capText}`}>
              {board.leftoversHour ? COPY.station.capOff : COPY.station.cap}
            </span>
          </div>
          <div className={styles.grid}>{d.ingredients.map(card)}</div>
          {d.optional?.length ? (
            <>
              <div className={`${s.overline} ${styles.subhead}`}>{COPY.station.bread}</div>
              <div className={styles.grid}>{d.optional.map(card)}</div>
            </>
          ) : null}
          <div className={`${s.overline} ${styles.subhead}`}>{COPY.station.extras}</div>
          <p className={`${s.caption} ${styles.extrasCaption}`}>{COPY.station.extrasCaption}</p>
          <div className={styles.grid}>{EXTRAS.map(card)}</div>
        </section>
      </div>

      <div className={`${s.cta} ${styles.footer}`}>
        <Button block onClick={() => void g.stroke('plate', false)}>
          {COPY.station.plateIt}
        </Button>
        <p className={`${s.caption} ${styles.plateHint}`}>{COPY.station.plateHint}</p>
      </div>
    </main>
  );
}
