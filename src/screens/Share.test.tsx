import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Share } from './Share';
import { useGame } from '@/store/game';
import { MockPoolService } from '@/services/MockPoolService';
import { createClock } from '@/services/clock';
import { ProfileStore } from '@/services/profile';
import { createMemoryStorage } from '@/services/storage';

const renderShareCard = vi.fn<(node: HTMLElement) => Promise<string>>();
const downloadImage = vi.fn<(url: string, name: string) => void>();
vi.mock('@/services/shareImage', () => ({
  renderShareCard: (node: HTMLElement) => renderShareCard(node),
  downloadImage: (url: string, name: string) => downloadImage(url, name),
}));

const sgt = (iso: string): number => Date.parse(`${iso}+08:00`);

async function boot() {
  const clock = createClock({ source: () => sgt('2026-09-23T10:00:00') });
  const storage = createMemoryStorage();
  const profileStore = new ProfileStore(storage, { city: 'SG' });
  const service = new MockPoolService({ city: 'SG', clock, storage, profile: profileStore });
  await act(() => useGame.getState().init({ city: 'SG', service, clock, profileStore }));
  await act(() => {
    useGame.getState().selectDish('chicken-rice');
    return useGame.getState().pickSelected();
  });
  await act(() => useGame.getState().plateNow());
  return render(
    <MemoryRouter initialEntries={['/share']}>
      <Routes>
        <Route path="/share" element={<Share />} />
        <Route path="/verdict" element={<div>verdict here</div>} />
        <Route path="/board" element={<div>board here</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Share card (spec §3.12, §5)', () => {
  afterEach(() => {
    useGame.getState().dispose();
    renderShareCard.mockReset();
    downloadImage.mockReset();
  });

  it('renders the card, marks it sent once, saves a PNG named by the city date, and goes back to the verdict', async () => {
    const user = userEvent.setup();
    await boot();
    const v = useGame.getState().verdict;
    expect(screen.getByRole('heading', { level: 1, name: 'Share card' })).toBeInTheDocument();
    const card = screen.getByTestId('share-card');
    expect(card).toHaveTextContent('BUILD-A-DISH');
    expect(card).toHaveTextContent('Singapore · 23 Sep 2026');
    expect(card).toHaveTextContent(v?.name ?? '?');
    expect(card).toHaveTextContent(v?.line ?? '?');
    expect(card.querySelector('[role="img"][aria-label="1 of 3 rubies"]')).toBeInTheDocument();
    expect(card.querySelectorAll('[data-active="true"]')).toHaveLength(1);
    expect(card).toHaveTextContent('Ayu');
    expect(card).toHaveTextContent('Stirrer');
    expect(card).toHaveTextContent('Ruby');
    expect(card).toHaveTextContent('THE GAME IS LIFE');
    expect(card).toHaveTextContent('PLAY IT TOGETHER');

    await user.click(screen.getByRole('button', { name: 'Send to your party' }));
    expect(screen.getByRole('button', { name: 'Sent to your party' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await user.click(screen.getByRole('button', { name: 'Sent to your party' })); // a second press does nothing
    expect(useGame.getState().sent).toBe(true);

    renderShareCard.mockResolvedValue('data:image/png;base64,AAAA');
    await user.click(screen.getByRole('button', { name: 'Save image' }));
    expect(renderShareCard).toHaveBeenCalledWith(card);
    expect(downloadImage).toHaveBeenCalledWith('data:image/png;base64,AAAA', 'build-a-dish-2026-09-23.png');

    await user.click(screen.getByRole('button', { name: 'Back to the verdict' }));
    expect(screen.getByText('verdict here')).toBeInTheDocument();
  });

  it('without a verdict it goes back to the Board', async () => {
    await boot();
    act(() => useGame.setState({ verdict: null }));
    expect(screen.getByText('board here')).toBeInTheDocument();
  });
});
