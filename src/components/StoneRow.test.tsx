// Kickoff prompt, check 3: StoneRow renders the player's gem shape (round / rounded square / rotated diamond).
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StoneRow } from './StoneRow';

describe('StoneRow (spec §6)', () => {
  it('lights n of three in the gem shape: ruby round, sapphire rounded square, emerald rotated diamond', () => {
    const { container } = render(
      <>
        <StoneRow gem="ruby" stones={1} />
        <StoneRow gem="sapphire" stones={2} />
        <StoneRow gem="emerald" stones={3} />
      </>,
    );
    const rows = container.querySelectorAll('[role="img"]');
    expect(rows).toHaveLength(3);
    expect(screen.getByRole('img', { name: '1 of 3 rubies' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '2 of 3 sapphires' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: '3 of 3 emeralds' })).toBeInTheDocument();
    expect(rows[0]?.querySelectorAll('.mini.round')).toHaveLength(3);
    expect(rows[1]?.querySelectorAll('.mini.square')).toHaveLength(3);
    expect(rows[2]?.querySelectorAll('.mini.diamond')).toHaveLength(3);
    // Lit stones carry the gem SVG (and the emerald's un-rotates inside the diamond).
    expect(rows[0]?.querySelectorAll('[style*="background-image"]')).toHaveLength(1);
    expect(rows[1]?.querySelectorAll('[style*="background-image"]')).toHaveLength(2);
    expect(rows[2]?.querySelectorAll('.unrotate')).toHaveLength(3);
    expect(rows[0]?.querySelector('.mini')?.getAttribute('style')).toContain('var(--gem-ruby-fill)');
    expect(rows[0]?.querySelectorAll('.mini')[2]?.getAttribute('style')).toContain('var(--border)');
  });
});
