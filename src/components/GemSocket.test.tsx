import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { GemSocket } from './GemSocket';
import { MiniStones } from './MiniStones';

describe('GemSocket shapes (spec §6)', () => {
  it('ruby is round, sapphire a rounded square, emerald a rotated diamond', () => {
    const { container } = render(
      <>
        <GemSocket gem="ruby" size={56} />
        <GemSocket gem="sapphire" size={56} active />
        <GemSocket gem="emerald" size={56} />
      </>,
    );
    const wells = container.querySelectorAll<HTMLElement>('[data-shape]');
    expect(wells[0]).toHaveAttribute('data-shape', 'round');
    expect(wells[0]?.style.borderRadius).toBe('var(--radius-full)');
    expect(wells[1]).toHaveAttribute('data-shape', 'rounded-square');
    expect(wells[1]?.style.borderRadius).toBe('var(--radius-lg)');
    expect(wells[1]?.style.boxShadow).toContain('var(--gem-sapphire-fill)');
    expect(wells[1]?.style.boxShadow).toContain('var(--glow-sapphire)');
    expect(wells[2]).toHaveAttribute('data-shape', 'diamond');
    expect(wells[2]?.style.transform).toBe('rotate(45deg)');
    expect(screen.getByRole('img', { name: 'Sapphire gem, active' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Ruby gem' })).toBeInTheDocument();
  });
  it('becomes a pressable button with onClick', async () => {
    const onClick = vi.fn();
    render(<GemSocket gem="emerald" active onClick={onClick} label="Emerald Stirrer" />);
    const btn = screen.getByRole('button', { name: 'Emerald Stirrer' });
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
  it('mini stones light n of three in the gem shape', () => {
    const { container } = render(<MiniStones gem="emerald" stones={2} />);
    expect(screen.getByRole('img', { name: '2 of 3 emeralds' })).toBeInTheDocument();
    const lit = container.querySelectorAll('[style*="background-image"]');
    expect(lit).toHaveLength(2);
  });
});
