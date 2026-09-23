import {
  ArrowLeft,
  Bell,
  ChevronRight,
  MapPin,
  Minus,
  Send,
  Settings,
  Shirt,
  Sparkles,
  User,
  Utensils,
  X,
  type LucideProps,
} from 'lucide-react';
import type { ComponentType } from 'react';

const ICONS = {
  'arrow-left': ArrowLeft,
  bell: Bell,
  'chevron-right': ChevronRight,
  'map-pin': MapPin,
  minus: Minus,
  send: Send,
  settings: Settings,
  shirt: Shirt,
  sparkles: Sparkles,
  user: User,
  utensils: Utensils,
  x: X,
} satisfies Record<string, ComponentType<LucideProps>>;

export type IconName = keyof typeof ICONS;

/** Lucide outline icon at 1.5px stroke in currentColor (the OraX interim icon set). Decorative unless labelled. */
export function Icon({ name, size = 20, label }: { name: IconName; size?: number; label?: string }) {
  const C = ICONS[name];
  return (
    <C
      size={size}
      strokeWidth={1.5}
      aria-hidden={label ? undefined : true}
      role={label ? 'img' : undefined}
      aria-label={label}
      style={{ flex: 'none', display: 'block' }}
    />
  );
}
