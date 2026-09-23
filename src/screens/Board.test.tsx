import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Board } from './Board';
import { Toast } from '@/components/Toast';
import { useGame } from '@/store/game';
import { useToast } from '@/store/toast';
import { MockPoolService } from '@/services/MockPoolService';
import { createClock } from '@/services/clock';
import { ProfileStore } from '@/services/profile';
import { createMemoryStorage } from '@/services/storage';

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

async function boot(iso = '2026-09-23T10:00:00', leftovers: 'on' | 'off' | null = null) {
  const clock = createClock({ source: () => sgt(iso), leftoversOverride: leftovers });
  const storage = createMemoryStorage();
  const profileStore = new ProfileStore(storage, { city: 'SG' });
  const service = new MockPoolService({ city: 'SG', clock, storage, profile: profileStore });
  await act(() => useGame.getState().init({ city: 'SG', service, clock, profileStore }));
  return render(
    <MemoryRouter initialEntries={['/board']}>
      <Board />
      <Toast />
    </MemoryRouter>,
  );
}

describe('Board (spec §5, §3.2)', () => {
  beforeEach(() => {
    useToast.getState().clear();
  });
  afterEach(() => {
    useGame.getState().dispose();
  });

  it('walks the CTA through all five states in order, with the Bin remarks and the Cooking today chip', async () => {
    const user = userEvent.setup();
    await boot();
    const cta = () => screen.getByRole('button', { name: /^(Pick|Cook|Swap|No swaps)/ });
    expect(cta()).toHaveTextContent('Pick a dish');
    expect(cta()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /^Hainanese chicken rice/ }));
    expect(cta()).toHaveTextContent('Pick chicken rice for today');
    await user.click(cta());
    expect(cta()).toHaveTextContent('Cook chicken rice');
    expect(screen.getByText('Chicken rice. The whole city can see that now.')).toBeInTheDocument();
    expect(screen.getByText('Cooking today')).toBeInTheDocument();
    expect(screen.getByText(/^You are in\. \d+ cooking chicken rice right now\.$/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Nasi lemak/ }));
    expect(cta()).toHaveTextContent('Swap to nasi lemak · 1 swap left');
    await user.click(cta());
    expect(cta()).toHaveTextContent('Cook nasi lemak');
    expect(screen.getByText('Swapped to nasi lemak. That was your one.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^Hainanese chicken rice/ }));
    expect(cta()).toHaveTextContent('No swaps left today');
    expect(cta()).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /^Nasi lemak/ }));
    expect(cta()).toHaveTextContent('Cook nasi lemak');
  });

  it('shows the header, caption, stock words, footer counter and Cursed Plates link', async () => {
    await boot();
    expect(screen.getByText(/^RESETS 14:00:0\d$/)).toBeInTheDocument();
    expect(screen.getByText('Singapore')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: "Today's dishes" })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cursed Plates · 0' })).toBeInTheDocument();
    expect(
      screen.getByText('One shelf for all of Singapore. One dish a day, swap once.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('LEFTOVERS HOUR · UNTIL 00:00')).not.toBeInTheDocument();
    expect(screen.getByText('Sup kambing')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Mutton soup/ })).toHaveAttribute('title', 'Sup kambing');
    const stockWords = screen.getAllByText(/^(plenty|moderate|running low|all out!)$/);
    expect(stockWords).toHaveLength(5);
    expect(screen.getByText(/^The Bin has eaten [\d,]+ plates in Singapore today\.$/)).toBeInTheDocument();
    expect(screen.getAllByText('cooking')).toHaveLength(5);
  });

  it('shows the Leftovers banner during Leftovers hour', async () => {
    await boot('2026-09-23T21:30:00');
    expect(screen.getByText('LEFTOVERS HOUR · UNTIL 00:00')).toBeInTheDocument();
    expect(
      screen.getByText('Portion caps are off on anything the city still has plenty of.'),
    ).toBeInTheDocument();
    expect(screen.getByText('RESETS 02:30:00')).toBeInTheDocument();
  });
});
