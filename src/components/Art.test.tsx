import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Art } from './Art';
import { resetManifestCache } from './art/manifest';

const jsonResponse = (body: unknown, ok = true): Response =>
  ({
    ok,
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(body),
  }) as unknown as Response;

describe('Art component (kickoff prompt, Assets)', () => {
  afterEach(() => {
    resetManifestCache();
    vi.unstubAllGlobals();
  });

  it('renders the neutral placeholder when the manifest is missing (index.html with 200)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          headers: new Headers({ 'content-type': 'text/html' }),
          json: () => Promise.reject(new Error('not json')),
        } as unknown as Response),
      ),
    );
    render(<Art slot="bin" id="neutral" size={140} radius="full" caption="Bin" />);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const ph = screen.getByText('Bin').parentElement;
    expect(ph).toHaveAttribute('data-placeholder');
    expect(ph).toHaveAttribute('data-art', 'bin/neutral');
    expect(ph?.style.width).toBe('140px');
    expect(ph?.className).toContain('placeholder');
    expect(ph?.className).toContain('full');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('renders the image when the manifest resolves the key, and the placeholder for unknown keys', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse([
            { path: 'bin/bin-neutral.png', w: 1024, h: 1024, alpha: true, group: 'bin', key: 'neutral' },
          ]),
        ),
      ),
    );
    render(
      <>
        <Art slot="bin" id="neutral" size={140} radius="full" caption="Bin" alt="The Bin" />
        <Art slot="dishes" id="chicken-rice" size={72} radius="full" caption="Dish render" />
      </>,
    );
    const img = await waitFor(() => {
      const el = screen.getByRole('img', { name: 'The Bin' });
      expect(el.tagName).toBe('IMG');
      return el;
    });
    expect(img).toHaveAttribute('src', '/assets/bad/bin/bin-neutral.png');
    expect(screen.getByText('Dish render').parentElement).toHaveAttribute('data-placeholder');
    expect(fetch).toHaveBeenCalledTimes(1); // manifest fetched once, cached
  });

  it('treats a network failure as no manifest', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new Error('offline'))),
    );
    render(
      <Art
        slot="intro"
        id="01-shelf"
        size={{ width: '100%', height: 220 }}
        caption="Illustration: the city shelf"
      />,
    );
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByText('Illustration: the city shelf').parentElement).toHaveAttribute(
      'data-placeholder',
    );
  });
});
