import { useEffect, useState, type CSSProperties } from 'react';
import { ASSET_BASE, resolveArt, type ManifestEntry } from './art/manifest';
import styles from './Art.module.css';

export interface ArtProps {
  /** Manifest group: bin · dishes · cursed · intro · mess · ingredients · icon. */
  slot: string;
  /** Manifest key inside the group, e.g. `neutral`, `chicken-rice`, `01-shelf`, `splat-2`. */
  id: string;
  /** Square size, or a width/height pair. */
  size?: number | { width: number | string; height: number };
  radius?: 'sm' | 'md' | 'lg' | 'full';
  /** Caption naming the slot, shown only in the box placeholder (never larger than a caption). */
  caption?: string;
  /**
   * `box` (default): dashed neutral box with the caption. `blob`: the spec's mess splat stand-in (spec §5: blobs in
   * `--ink-faint` at 70 %), for slots too small for a caption.
   */
  placeholder?: 'box' | 'blob';
  /** Organic border-radius for the blob placeholder. */
  blobRadius?: string;
  alt?: string;
  className?: string | undefined;
  style?: CSSProperties;
}

/**
 * Every image position goes through Art. If the manifest resolves the key, the image renders; otherwise a neutral
 * placeholder: `--surface-sunken` ground, 1px dashed `--border-strong`, the slot's radius, the caption, nothing else.
 */
export function Art({
  slot,
  id,
  size = 96,
  radius = 'md',
  caption = '',
  placeholder = 'box',
  blobRadius,
  alt = '',
  className,
  style,
}: ArtProps) {
  const [entry, setEntry] = useState<ManifestEntry | null>(null);
  useEffect(() => {
    let alive = true;
    void resolveArt(slot, id).then((e) => {
      if (alive) setEntry(e);
    });
    return () => {
      alive = false;
    };
  }, [slot, id]);
  const dims = typeof size === 'number' ? { width: size, height: size } : size;
  const cls = [styles.art, styles[radius], className ?? ''].filter(Boolean).join(' ');
  if (entry) {
    return (
      <img
        className={cls}
        style={{ ...dims, ...style }}
        src={`${ASSET_BASE}${entry.path}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        data-art={`${slot}/${id}`}
      />
    );
  }
  if (placeholder === 'blob') {
    return (
      <span
        aria-hidden="true"
        className={`${cls} ${styles.blob}`}
        style={{ ...dims, ...(blobRadius ? { borderRadius: blobRadius } : {}), ...style }}
        data-art={`${slot}/${id}`}
        data-placeholder=""
      />
    );
  }
  return (
    <div
      className={`${cls} ${styles.placeholder}`}
      style={{ ...dims, ...style }}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
      data-art={`${slot}/${id}`}
      data-placeholder=""
    >
      <span className={styles.caption} aria-hidden={alt ? true : undefined}>
        {caption}
      </span>
    </div>
  );
}
