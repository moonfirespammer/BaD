import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FLASH_MS, SigilPad } from './SigilPad';

/** A mouse or first finger: browsers always mark it primary (jsdom's synthetic default is false). */
function drawOn(pad: HTMLElement, pts: [number, number, number][]) {
  const [x0, y0, t0] = pts[0] ?? [0, 0, 0];
  fireEvent.pointerDown(pad, { clientX: x0, clientY: y0, pointerId: 1, isPrimary: true, timeStamp: t0 });
  for (const [x, y, t] of pts.slice(1))
    fireEvent.pointerMove(pad, { clientX: x, clientY: y, pointerId: 1, isPrimary: true, timeStamp: t });
  const last = pts[pts.length - 1] ?? [0, 0, 0];
  fireEvent.pointerUp(pad, {
    clientX: last[0],
    clientY: last[1],
    pointerId: 1,
    isPrimary: true,
    timeStamp: last[2],
  });
}

describe('SigilPad', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      top: 0,
      width: 358,
      height: 150,
      right: 358,
      bottom: 150,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('classifies a flick up as PLATE and a tiny scribble as nothing', () => {
    const onSigil = vi.fn();
    render(<SigilPad mess={0} flash={null} onSigil={onSigil} />);
    const pad = screen.getByTestId('sigil-pad');
    drawOn(
      pad,
      Array.from({ length: 11 }, (_, i) => [180, 130 - i * 8, i * 20] as [number, number, number]),
    );
    // jsdom stamps its own event times, so speed (fast/flair) is covered by the classifier unit tests.
    expect(onSigil).toHaveBeenCalledWith(expect.objectContaining({ kind: 'plate' }));
    drawOn(pad, [
      [10, 10, 0],
      [12, 12, 5],
      [10, 14, 10],
      [12, 16, 15],
    ]);
    expect(onSigil).toHaveBeenCalledTimes(1);
  });

  it('passes the mess to the classifier: a long sweep is CLEAN only with mess', () => {
    const onSigil = vi.fn();
    const sweep = Array.from({ length: 30 }, (_, i) => [20 + i * 10, 80, i * 30] as [number, number, number]);
    const { rerender } = render(<SigilPad mess={0} flash={null} onSigil={onSigil} />);
    drawOn(screen.getByTestId('sigil-pad'), sweep);
    rerender(<SigilPad mess={2} flash={null} onSigil={onSigil} />);
    drawOn(screen.getByTestId('sigil-pad'), sweep);
    expect(onSigil.mock.calls.map((c) => (c[0] as { kind: string }).kind)).toEqual(['cut', 'clean']);
  });

  it('draws a trail while stroking and fades it after release', () => {
    render(<SigilPad mess={0} flash={null} onSigil={vi.fn()} />);
    const pad = screen.getByTestId('sigil-pad');
    fireEvent.pointerDown(pad, { clientX: 10, clientY: 10, pointerId: 1, isPrimary: true });
    fireEvent.pointerMove(pad, { clientX: 50, clientY: 40, pointerId: 1, isPrimary: true });
    const path = pad.querySelector('path');
    expect(path?.getAttribute('d')).toBe('M10.0 10.0 L50.0 40.0');
    fireEvent.pointerUp(pad, { clientX: 50, clientY: 40, pointerId: 1, isPrimary: true });
    expect(path?.getAttribute('class')).toContain('fading');
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(pad.querySelector('path')?.getAttribute('d')).toBe('');
  });

  it('flashes the word for 700ms, restarts on a new seq, and does not replay an old flash on mount', () => {
    const { rerender, unmount } = render(<SigilPad mess={0} flash={null} onSigil={vi.fn()} />);
    rerender(<SigilPad mess={0} flash={{ word: 'HEAT', seq: 1 }} onSigil={vi.fn()} />);
    expect(screen.getByTestId('sigil-word')).toHaveTextContent('HEAT');
    act(() => {
      vi.advanceTimersByTime(FLASH_MS - 1);
    });
    expect(screen.getByTestId('sigil-word')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByTestId('sigil-word')).not.toBeInTheDocument();
    rerender(<SigilPad mess={0} flash={{ word: 'HEAT', seq: 2 }} onSigil={vi.fn()} />);
    expect(screen.getByTestId('sigil-word')).toHaveTextContent('HEAT');
    unmount();
    render(<SigilPad mess={0} flash={{ word: 'CUT', seq: 3 }} onSigil={vi.fn()} />);
    expect(screen.queryByTestId('sigil-word')).not.toBeInTheDocument();
  });

  it('draws with one finger only: a second finger (pinch, resting thumb) is ignored', () => {
    const onSigil = vi.fn();
    render(<SigilPad mess={0} flash={null} onSigil={onSigil} />);
    const pad = screen.getByTestId('sigil-pad');
    const p1 = { pointerId: 1, isPrimary: true };
    const p2 = { pointerId: 2, isPrimary: false };
    fireEvent.pointerDown(pad, { clientX: 170, clientY: 70, ...p1 });
    fireEvent.pointerDown(pad, { clientX: 220, clientY: 80, ...p2 });
    for (let i = 1; i <= 8; i++) {
      fireEvent.pointerMove(pad, { clientX: 170 - i * 8, clientY: 70, ...p1 });
      fireEvent.pointerMove(pad, { clientX: 220 + i * 8, clientY: 80 + i, ...p2 });
    }
    fireEvent.pointerUp(pad, { clientX: 250, clientY: 88, ...p2 });
    expect(onSigil).not.toHaveBeenCalled(); // lifting the second finger ends nothing
    fireEvent.pointerUp(pad, { clientX: 106, clientY: 70, ...p1 });
    expect(onSigil).toHaveBeenCalledTimes(1);
    expect(onSigil).toHaveBeenCalledWith(expect.objectContaining({ kind: 'cut' })); // not a zig-zag HEAT
    expect(pad.querySelector('path')?.getAttribute('d')).not.toContain('228');
  });

  it('announces each flashed word through an always-present polite live region', () => {
    const { rerender } = render(<SigilPad mess={0} flash={null} onSigil={vi.fn()} />);
    const live = screen.getByTestId('sigil-pad').querySelector('[aria-live="polite"]');
    expect(live).toBeInTheDocument();
    expect(live).toHaveTextContent('');
    rerender(<SigilPad mess={0} flash={{ word: 'CUT', seq: 1 }} onSigil={vi.fn()} />);
    expect(live).toHaveTextContent('CUT');
  });

  it('shows the mess label and one splat per mess point through Art', () => {
    const { container, rerender } = render(<SigilPad mess={0} flash={null} onSigil={vi.fn()} />);
    expect(screen.queryByText(/MESS/)).not.toBeInTheDocument();
    rerender(<SigilPad mess={3} flash={null} onSigil={vi.fn()} />);
    expect(screen.getByText('MESS ×3 · SWEEP TO WIPE')).toBeInTheDocument();
    const splats = container.querySelectorAll('[data-art^="mess/splat-"]');
    expect(splats).toHaveLength(3);
    expect(splats[0]?.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByText('SIGIL PAD')).toBeInTheDocument();
    expect(screen.getByText('SLASH TO CUT · SPIRAL TO HEAT · FLICK UP TO PLATE')).toBeInTheDocument();
  });
});
