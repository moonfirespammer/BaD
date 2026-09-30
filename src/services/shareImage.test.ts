import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const toPng = vi.fn<(node: HTMLElement, opts?: unknown) => Promise<string>>();
vi.mock('html-to-image', () => ({ toPng: (node: HTMLElement, opts?: unknown) => toPng(node, opts) }));

describe('shareImage (Save image)', () => {
  let fontsReady = false;
  beforeEach(() => {
    toPng.mockReset();
    fontsReady = false;
    // jsdom has no document.fonts: stand in for the browser's FontFaceSet.
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: {
        ready: new Promise<void>((r) =>
          setTimeout(() => {
            fontsReady = true;
            r();
          }, 0),
        ),
      },
    });
  });
  afterEach(() => {
    Reflect.deleteProperty(document, 'fonts');
  });

  it('waits for the fonts, renders the node at 2× and offers the PNG as a download', async () => {
    const { renderShareCard, downloadImage } = await import('./shareImage');
    toPng.mockImplementation(() => {
      expect(fontsReady).toBe(true);
      return Promise.resolve('data:image/png;base64,AAAA');
    });
    const node = document.createElement('div');
    const url = await renderShareCard(node);
    expect(url).toBe('data:image/png;base64,AAAA');
    expect(toPng).toHaveBeenCalledWith(node, expect.objectContaining({ pixelRatio: 2, cacheBust: true }));

    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
    downloadImage(url, 'build-a-dish-2026-09-23.png');
    expect(click).toHaveBeenCalledTimes(1);
    const a = click.mock.instances[0] as HTMLAnchorElement | undefined;
    expect(a?.download).toBe('build-a-dish-2026-09-23.png');
    expect(a?.href).toBe(url);
    expect(document.body.querySelector('a[download]')).toBeNull(); // removed after the click
    click.mockRestore();
  });
});
