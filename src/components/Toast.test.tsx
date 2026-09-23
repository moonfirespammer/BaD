import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Toast } from './Toast';
import { TOAST_MS, remark, useToast } from '@/store/toast';

describe('Bin toast (spec §5)', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    act(() => {
      useToast.getState().clear();
    });
    vi.useRealTimers();
  });

  it('is an always-mounted status region that shows THE BIN + the remark and auto-dismisses at 2.8s', () => {
    render(<Toast />);
    const region = screen.getByRole('status');
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(region).toBeEmptyDOMElement();
    act(() => {
      remark('Chicken rice. The whole city can see that now.');
    });
    expect(screen.getByText('THE BIN')).toBeInTheDocument();
    expect(screen.getByText('Chicken rice. The whole city can see that now.')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(TOAST_MS - 1);
    });
    expect(screen.getByText('THE BIN')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText('THE BIN')).not.toBeInTheDocument();
    expect(region).toBeEmptyDOMElement();
  });

  it('a new remark replaces the current one and restarts the timer', () => {
    render(<Toast />);
    act(() => {
      remark('First.');
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      remark('Second.');
    });
    expect(screen.queryByText('First.')).not.toBeInTheDocument();
    expect(screen.getByText('Second.')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Second.')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(screen.queryByText('Second.')).not.toBeInTheDocument();
  });
});
