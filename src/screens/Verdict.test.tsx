import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { Verdict, binPose } from './Verdict';
import { useGame } from '@/store/game';
import { MockPoolService } from '@/services/MockPoolService';
import { createClock } from '@/services/clock';
import { ProfileStore } from '@/services/profile';
import { createMemoryStorage } from '@/services/storage';

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

async function boot(items: string[], iso = '2026-09-23T10:00:00') {
  const clock = createClock({ source: () => sgt(iso) });
  const storage = createMemoryStorage();
  const profileStore = new ProfileStore(storage, { city: 'SG' });
  const service = new MockPoolService({ city: 'SG', clock, storage, profile: profileStore });
  await act(() => useGame.getState().init({ city: 'SG', service, clock, profileStore }));
  await act(() => {
    useGame.getState().selectDish('chicken-rice');
    return useGame.getState().pickSelected();
  });
  for (const id of items) await act(() => useGame.getState().tapIngredient(id));
  await act(() => useGame.getState().plateNow());
  return render(
    <MemoryRouter initialEntries={['/verdict']}>
      <Routes>
        <Route path="/verdict" element={<Verdict />} />
        <Route path="/board" element={<div>board here</div>} />
        <Route path="/share" element={<div>share here</div>} />
        <Route path="/wall" element={<div>wall here</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Verdict screen (spec §5 Verdict, §3.13)', () => {
  afterEach(() => {
    useGame.getState().dispose();
  });

  it('shows the line, name, label, summary, stones in the player’s gem, chips and the counter', async () => {
    const { container } = await boot(['chicken']); // one raw chicken: 40, one stone, not cursed
    expect(screen.getByRole('heading', { level: 1, name: "The Bin's verdict" })).toBeInTheDocument();
    const v = useGame.getState().verdict;
    expect(v).toMatchObject({ stones: 1, cursed: false, label: 'The plate lost the argument' });
    expect(screen.getByText(v?.line ?? '')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Chicken rice, missing something');
    expect(screen.getByText('The plate lost the argument')).toBeInTheDocument();
    expect(screen.getByText('Poached chicken ×1')).toBeInTheDocument();
    expect(screen.getAllByRole('img', { name: 'Ruby gem, active' })).toHaveLength(1);
    expect(screen.getAllByRole('img', { name: 'Ruby gem' })).toHaveLength(2);
    expect(screen.getByText('1 of 3 rubies')).toBeInTheDocument();
    expect(screen.getByText('Neat')).toBeInTheDocument();
    expect(screen.getByText('A new habit is forming')).toBeInTheDocument();
    expect(screen.queryByText('Cursed plate')).not.toBeInTheDocument();
    expect(screen.queryByText('Leftovers hour')).not.toBeInTheDocument();
    expect(container.querySelector('[data-art="bin/neutral"]')).toBeInTheDocument();
    expect(screen.getByText(/^RESETS 1[34]:\d\d:\d\d$/)).toBeInTheDocument();
    expect(screen.getByText(/^The Bin has eaten [\d,]+ plates in Singapore today\.$/)).toBeInTheDocument();
  });

  it('Set as Signature Dish stores the verdict and disables itself; Share and the close button navigate', async () => {
    const user = userEvent.setup();
    await boot(['chicken']);
    await user.click(screen.getByRole('button', { name: 'Set as Signature Dish' }));
    expect(await screen.findByRole('button', { name: 'Signature Dish set' })).toBeDisabled();
    expect(useGame.getState().profile?.signature?.key).toBe(useGame.getState().verdict?.key);
    await user.click(screen.getByRole('button', { name: 'See who else made chicken rice' }));
    expect(screen.getByText('wall here')).toBeInTheDocument();
  });

  it('a cursed plate shows the overline, the Cursed plate chip, the Wasteways line and the disgusted Bin', async () => {
    const user = userEvent.setup();
    const { container } = await boot(['durian', 'cheddar']);
    expect(screen.getByText('CURSED PLATE · meant to be chicken rice')).toBeInTheDocument();
    expect(screen.getByText('Cursed plate')).toBeInTheDocument();
    expect(screen.getByText('Durian. In chicken rice. I will be filing a report.')).toBeInTheDocument();
    expect(screen.getByText('Something below said thank you. That is not normal.')).toBeInTheDocument();
    expect(screen.getByText('The Bin has questions')).toBeInTheDocument();
    expect(container.querySelector('[data-art="bin/disgusted"]')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Share to your party' }));
    expect(screen.getByText('share here')).toBeInTheDocument();
  });

  it('an empty plate has no summary caption; without a verdict the screen goes back to the Board', async () => {
    const user = userEvent.setup();
    const { container } = await boot([]);
    expect(screen.getByText('You plated air. Bold. Pointless, but bold.')).toBeInTheDocument();
    expect(screen.getByText('Empty')).toBeInTheDocument();
    expect(container.querySelector('.summary')).toBeNull(); // no summary caption for a plate of air
    await user.click(screen.getByRole('button', { name: "Back to today's dishes" }));
    expect(screen.getByText('board here')).toBeInTheDocument();
    act(() => useGame.setState({ verdict: null }));
    render(
      <MemoryRouter initialEntries={['/verdict']}>
        <Routes>
          <Route path="/verdict" element={<Verdict />} />
          <Route path="/board" element={<div>board again</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('board again')).toBeInTheDocument();
  });

  it('binPose follows the verdict', () => {
    expect(binPose({ cursed: true, stones: 1 })).toBe('disgusted');
    expect(binPose({ cursed: false, stones: 3 })).toBe('approving');
    expect(binPose({ cursed: false, stones: 2 })).toBe('judging');
    expect(binPose({ cursed: false, stones: 1 })).toBe('neutral');
  });
});
