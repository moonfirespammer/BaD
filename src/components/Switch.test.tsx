import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Switch } from './Switch';
import { PlateChip } from './PlateChip';

describe('Switch and PlateChip', () => {
  it('Switch is a role=switch with aria-checked that toggles', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Switch label="Prefer buttons" on={false} onChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Prefer buttons' });
    expect(sw).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(sw);
    expect(onChange).toHaveBeenCalledWith(true);
    rerender(<Switch label="Prefer buttons" on onChange={onChange} />);
    expect(sw).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(sw);
    expect(onChange).toHaveBeenLastCalledWith(false);
  });
  it('PlateChip shows {Ingredient} ×n over the prep and is pressable', async () => {
    const onSelect = vi.fn();
    render(<PlateChip name="Ginger sauce" n={10} prep="raw" selected onSelect={onSelect} />);
    const chip = screen.getByRole('button', { name: /Ginger sauce ×10/ });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('raw')).toBeInTheDocument();
    await userEvent.click(chip);
    expect(onSelect).toHaveBeenCalled();
  });
});
