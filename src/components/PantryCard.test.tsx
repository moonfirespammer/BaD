import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PantryCard, type PantryCardProps } from './PantryCard';

const props = (p: Partial<PantryCardProps> = {}): PantryCardProps => ({
  ingredientId: 'ginger',
  name: 'Ginger sauce',
  units: 88,
  n: 0,
  prep: '',
  selected: false,
  onAdd: vi.fn(),
  onRemove: vi.fn(),
  ...p,
});

describe('PantryCard (check 3)', () => {
  it('shows no state caption while plentiful (only Running low and Gone show)', () => {
    render(<PantryCard {...props({ units: 26 })} />);
    expect(screen.queryByText('Running low')).not.toBeInTheDocument();
    expect(screen.queryByText('Gone')).not.toBeInTheDocument();
    expect(screen.getByTestId('pantry-ginger')).toHaveAttribute('data-state', 'moderate');
  });
  it('shows Running low at 25 and at 1, in the warning colour', () => {
    const { rerender } = render(<PantryCard {...props({ units: 25 })} />);
    expect(screen.getByText('Running low').className).toContain('low');
    rerender(<PantryCard {...props({ units: 1 })} />);
    expect(screen.getByText('Running low')).toBeInTheDocument();
  });
  it('shows Gone at 0, stays tappable (for the Bin) and is aria-disabled', async () => {
    const onAdd = vi.fn();
    render(<PantryCard {...props({ units: 0, onAdd })} />);
    expect(screen.getByText('Gone')).toBeInTheDocument();
    const add = screen.getByRole('button', { name: /Ginger sauce/ });
    expect(add).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(add);
    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('pantry-ginger').className).toContain('gone');
  });
  it('a main ingredient never shows Gone', () => {
    render(<PantryCard {...props({ ingredientId: 'chicken', name: 'Poached chicken', units: 0 })} />);
    expect(screen.queryByText('Gone')).not.toBeInTheDocument();
  });
  it('shows the ×n badge, the prep caption and a minus button only when holding portions', async () => {
    const onRemove = vi.fn();
    const { rerender } = render(<PantryCard {...props()} />);
    expect(screen.queryByRole('button', { name: 'Remove one portion' })).not.toBeInTheDocument();
    rerender(<PantryCard {...props({ n: 3, prep: 'cooked', onRemove, selected: true })} />);
    expect(screen.getByText('×3')).toBeInTheDocument();
    expect(screen.getByText('cooked')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Remove one portion' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('pantry-ginger').className).toContain('selected');
  });
});
