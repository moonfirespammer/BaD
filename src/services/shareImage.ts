// Save image (spec §3.12, kickoff Build order 3): the Share card is rendered from its DOM node to a PNG with
// html-to-image. Fonts are self-hosted, so they must be loaded before the render embeds them (register Q60).
import { toPng } from 'html-to-image';

export async function renderShareCard(node: HTMLElement): Promise<string> {
  await document.fonts.ready;
  return toPng(node, { pixelRatio: 2, cacheBust: true });
}

/** Hand the browser a file to save. */
export function downloadImage(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}
