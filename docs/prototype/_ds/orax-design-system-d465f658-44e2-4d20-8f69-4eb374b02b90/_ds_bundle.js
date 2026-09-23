/* @ds-bundle: {"format":4,"namespace":"OraXDesignSystem_d465f6","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"Chip","sourcePath":"components/actions/Chip.jsx"},{"name":"Cover","sourcePath":"components/brand/Cover.jsx"},{"name":"Logo","sourcePath":"components/brand/Logo.jsx"},{"name":"Tagline","sourcePath":"components/brand/Tagline.jsx"},{"name":"ClassCard","sourcePath":"components/game/ClassCard.jsx"},{"name":"GemSocket","sourcePath":"components/game/GemSocket.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"},{"name":"ASSET_BASE","sourcePath":"components/shared/orax-shared.js"},{"name":"GEMS","sourcePath":"components/shared/orax-shared.js"},{"name":"CLASSES","sourcePath":"components/shared/orax-shared.js"},{"name":"CLASS_ORDER","sourcePath":"components/shared/orax-shared.js"},{"name":"FIGURES","sourcePath":"components/shared/orax-shared.js"}],"sourceHashes":{"components/actions/Button.jsx":"2787497e58f4","components/actions/Chip.jsx":"3e2e98db4368","components/brand/Cover.jsx":"d36c8136c532","components/brand/Logo.jsx":"bd44425a76f3","components/brand/Tagline.jsx":"c5240122a873","components/game/ClassCard.jsx":"2b786447cbdf","components/game/GemSocket.jsx":"52ad8b71f2e6","components/icons/Icon.jsx":"302ababa8b67","components/shared/orax-shared.js":"0447d1f36112","ui_kits/app/App.jsx":"00c12b9e8af7","ui_kits/app/ChooseClassScreen.jsx":"f4e77052171a","ui_kits/app/PartyScreen.jsx":"300e579ff1da","ui_kits/app/WelcomeScreen.jsx":"34b421fe97e7","ui_kits/app/YouScreen.jsx":"46be0a20d379","ui_kits/app/kit-shared.jsx":"849cf7ced19b","ui_kits/marketing/LandingPage.jsx":"50f35a79010e","ui_kits/marketing/kit-shared.jsx":"849cf7ced19b"},"inlinedExternals":[],"unexposedExports":[{"name":"asset","sourcePath":"components/shared/orax-shared.js"},{"name":"avatarCrop","sourcePath":"components/shared/orax-shared.js"},{"name":"injectOnce","sourcePath":"components/shared/orax-shared.js"}]} */

(() => {

const __ds_ns = (window.OraXDesignSystem_d465f6 = window.OraXDesignSystem_d465f6 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/actions/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const GEM_VARIANTS = {
  ruby: true,
  sapphire: true,
  emerald: true
};

/** A small label for a gem variant or the brand. Chips are labels, not buttons — for a selectable variant use a GemSocket. */
function Chip({
  variant = 'brand',
  appearance = 'filled',
  children,
  style,
  ...rest
}) {
  const base = {
    display: 'inline-block',
    padding: 'var(--space-1) var(--space-2)',
    borderRadius: 'var(--radius-sm)',
    font: 'var(--text-caption, 400 13px/18px "Space Grotesk", system-ui, sans-serif)',
    fontWeight: 700,
    letterSpacing: 0,
    whiteSpace: 'nowrap',
    boxSizing: 'border-box'
  };
  let look;
  if (GEM_VARIANTS[variant]) {
    look = appearance === 'outline' ? {
      border: `2px solid var(--gem-${variant}-text)`,
      color: `var(--gem-${variant}-text)`,
      background: 'transparent'
    } : {
      background: `var(--gem-${variant}-fill)`,
      color: `var(--gem-${variant}-on)`
    };
  } else if (appearance === 'subtle') {
    look = {
      background: 'var(--brand-subtle)',
      color: 'var(--ink)'
    };
  } else if (appearance === 'outline') {
    look = {
      border: '2px solid var(--brand-text)',
      color: 'var(--brand-text)',
      background: 'transparent'
    };
  } else {
    look = {
      background: 'var(--brand)',
      color: 'var(--on-brand)'
    };
  }
  const label = children ?? (GEM_VARIANTS[variant] ? variant.charAt(0).toUpperCase() + variant.slice(1) : null);
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      ...base,
      ...look,
      ...style
    }
  }, rest), label);
}
Object.assign(__ds_scope, { Chip, __ds_default_components_actions_Chip_1lxfuse: Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Chip.jsx", error: String((e && e.message) || e) }); }

// components/brand/Tagline.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** The two-line brand lock-up in Silkscreen: THE GAME IS LIFE / PLAY IT TOGETHER. Text is fixed; the last word of each line is brand-text. */
function Tagline({
  size = 'lg',
  align = 'left',
  style,
  ...rest
}) {
  const font = size === 'lg' ? 'var(--text-tagline-lg, 400 28px/36px Silkscreen, monospace)' : 'var(--text-tagline, 400 16px/22px Silkscreen, monospace)';
  const tracking = size === 'lg' ? '0.02em' : '0.04em';
  const accent = {
    color: 'var(--brand-text)'
  };
  return /*#__PURE__*/React.createElement("p", _extends({
    style: {
      margin: 0,
      font,
      letterSpacing: tracking,
      textTransform: 'uppercase',
      color: 'var(--ink)',
      textAlign: align,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), "The game is ", /*#__PURE__*/React.createElement("span", {
    style: accent
  }, "Life"), /*#__PURE__*/React.createElement("br", null), "Play it ", /*#__PURE__*/React.createElement("span", {
    style: accent
  }, "Together"));
}
Object.assign(__ds_scope, { Tagline, __ds_default_components_brand_Tagline_j5dyac: Tagline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Tagline.jsx", error: String((e && e.message) || e) }); }

// components/icons/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useEffect,
  useRef
} = React; // No icon set came with the brand. Until a house set exists, UI icons are Lucide (1.5px-stroke outline) in ink / ink-muted:
// 20px in controls, 24px in navigation. Loaded lazily from CDN the first time an Icon mounts.
const CDN = 'https://unpkg.com/lucide@0.469.0/dist/umd/lucide.min.js';
let pending;
function ensureLucide() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.lucide) return Promise.resolve(window.lucide);
  if (!pending) pending = new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = CDN;
    s.async = true;
    s.onload = () => res(window.lucide);
    s.onerror = rej;
    document.head.appendChild(s);
  });
  return pending;
}
const pascal = n => n.split(/[-_ ]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');

/** A Lucide outline icon by kebab-case name, drawn in currentColor at 1.5px stroke. */
function Icon({
  name,
  size = 20,
  strokeWidth = 1.5,
  label,
  style,
  ...rest
}) {
  const ref = useRef(null);
  useEffect(() => {
    let alive = true;
    ensureLucide().then(l => {
      if (!alive || !ref.current) return;
      const p = pascal(name);
      const node = l.icons && (l.icons[p] || l.icons[name]) || l[p];
      if (!node || !l.createElement) return;
      const attrs = {
        width: size,
        height: size,
        'stroke-width': strokeWidth,
        stroke: 'currentColor',
        fill: 'none'
      };
      const svg = l.createElement.length >= 2 ? l.createElement(p, node, attrs) : l.createElement(node, attrs);
      if (svg) ref.current.replaceChildren(svg);
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, [name, size, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", _extends({
    ref: ref,
    role: label ? 'img' : undefined,
    "aria-label": label,
    "aria-hidden": label ? undefined : 'true',
    style: {
      display: 'inline-flex',
      width: size,
      height: size,
      flex: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'currentColor',
      verticalAlign: 'middle',
      ...style
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon, __ds_default_components_icons_Icon_fio49a: Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Icon.jsx", error: String((e && e.message) || e) }); }

// components/shared/orax-shared.js
try { (() => {
// Shared, non-visual helpers for OraX components. Not a component (lowercase file, no .d.ts).

// Base URL of the design-system tree, derived from the bundle <script> so <img> assets resolve from any page.
const ASSET_BASE = (() => {
  if (typeof window !== 'undefined' && window.ORAX_ASSET_BASE) return window.ORAX_ASSET_BASE;
  try {
    const cur = document.currentScript;
    if (cur && cur.src) return new URL('./', cur.src).href;
    const s = Array.from(document.scripts).find(x => /_ds_bundle\.js(\?|$)/.test(x.src || ''));
    if (s) return new URL('./', s.src).href;
  } catch (e) {/* SSR or opaque origin */}
  return '';
})();
const asset = p => (typeof window !== 'undefined' && window.ORAX_ASSET_BASE ? window.ORAX_ASSET_BASE : ASSET_BASE) + p;

// Inject a <style> once per id (pseudo-states can't be inline styles).
const injected = new Set();
function injectOnce(id, css) {
  if (typeof document === 'undefined' || injected.has(id)) return;
  if (document.getElementById(id)) {
    injected.add(id);
    return;
  }
  const el = document.createElement('style');
  el.id = id;
  el.textContent = css;
  document.head.appendChild(el);
  injected.add(id);
}

// The three gem variants: cut → setting. The socket outline tells you the gem before the colour does.
const GEMS = {
  ruby: {
    name: 'Ruby',
    cut: 'round brilliant',
    setting: 'round',
    file: 'assets/Gems/ruby.svg'
  },
  sapphire: {
    name: 'Sapphire',
    cut: 'rounded square',
    setting: 'rounded square',
    file: 'assets/Gems/sapphire.svg'
  },
  emerald: {
    name: 'Emerald',
    cut: 'wide lozenge',
    setting: 'diamond',
    file: 'assets/Gems/emerald.svg'
  }
};

// The nine classes in roster order. Role pairings known so far: Stirrer = Mage, Taster = Rogue, Provider = Fighter.
const CLASSES = {
  provider: {
    name: 'Provider',
    role: 'Fighter',
    board: 'assets/Classes/01-provider-board.png',
    tools: 'tongs + pan shield, rolling pin'
  },
  foodsmith: {
    name: 'Foodsmith',
    role: null,
    board: 'assets/Classes/02-foodsmith-board.png',
    tools: "chef's knife, mezzaluna"
  },
  spark: {
    name: 'Spark',
    role: null,
    board: 'assets/Classes/03-spark-board.png',
    tools: 'whisk, piping bag'
  },
  gastronaut: {
    name: 'Gastronaut',
    role: null,
    board: 'assets/Classes/04-gastronaut-board.png',
    tools: 'bamboo staff, strainer net'
  },
  taster: {
    name: 'Taster',
    role: 'Rogue',
    board: 'assets/Classes/05-taster-board.png',
    tools: 'spoon fan, grater'
  },
  purist: {
    name: 'Purist',
    role: null,
    board: 'assets/Classes/06-purist-board.png',
    tools: 'long chopsticks, shears'
  },
  rebel: {
    name: 'Rebel',
    role: null,
    board: 'assets/Classes/07-rebel-board.png',
    tools: 'tenderiser mallet, mortar and pestle'
  },
  stirrer: {
    name: 'Stirrer',
    role: 'Mage',
    board: 'assets/Classes/08-stirrer-board.png',
    tools: 'ladle, wok spatula'
  },
  host: {
    name: 'Host',
    role: null,
    board: 'assets/Classes/09-host-board.png',
    tools: 'skimmer, pizza peel'
  }
};
const CLASS_ORDER = Object.keys(CLASSES);

// Each board is a 2×2: top row t1 kit, bottom row t2 kit; left masculine, right feminine.
// Focal points (fraction of the board) on the figure's head, for cropping a single figure to an avatar.
const FIGURES = {
  t1m: {
    x: 0.28,
    y: 0.09
  },
  t1f: {
    x: 0.72,
    y: 0.09
  },
  t2m: {
    x: 0.28,
    y: 0.585
  },
  t2f: {
    x: 0.72,
    y: 0.585
  }
};
// CSS background props that crop `board` to one figure's head and shoulders at `zoom`× (default 450%).
function avatarCrop(board, figure = 't1m', zoom = 4.5) {
  const f = FIGURES[figure] || FIGURES.t1m;
  const pos = v => ((0.5 - v * zoom) / (1 - zoom) * 100).toFixed(2) + '%';
  return {
    backgroundImage: `url("${asset(board)}")`,
    backgroundSize: `${zoom * 100}%`,
    backgroundPosition: `${pos(f.x)} ${pos(f.y)}`,
    backgroundRepeat: 'no-repeat'
  };
}
Object.assign(__ds_scope, { ASSET_BASE, asset, injectOnce, GEMS, CLASSES, CLASS_ORDER, FIGURES, avatarCrop });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/shared/orax-shared.js", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `.orax-btn{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-2);min-height:44px;padding:var(--space-3) var(--space-4);border-radius:var(--radius-md);font:var(--text-body-strong, 500 15px/22px "Space Grotesk", system-ui, sans-serif);letter-spacing:0;border:2px solid transparent;cursor:pointer;text-decoration:none;box-sizing:border-box;white-space:nowrap;-webkit-tap-highlight-color:transparent}
.orax-btn:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.orax-btn--primary{background:var(--brand);color:var(--on-brand)}
.orax-btn--primary:active{background:var(--brand-deep)}
.orax-btn--secondary{background:var(--surface-raised);color:var(--ink);border-color:var(--border-strong)}
.orax-btn--ghost{background:transparent;color:var(--brand-text)}
.orax-btn[disabled]{background:var(--surface-sunken);color:var(--ink-faint);border-color:transparent;cursor:default}
.orax-btn--block{display:flex;width:100%}
.orax-btn__icon{display:inline-flex;width:20px;height:20px;flex:none;align-items:center;justify-content:center}
.orax-btn__icon>*{width:20px;height:20px}`;

/** The one action control. primary = brand fill, secondary = raised + border-strong, ghost = no fill. Never pixel type on a button. */
function Button({
  variant = 'primary',
  icon,
  block = false,
  href,
  className = '',
  children,
  ...rest
}) {
  __ds_scope.injectOnce('orax-btn', CSS);
  const cls = ['orax-btn', `orax-btn--${variant}`, block ? 'orax-btn--block' : '', className].filter(Boolean).join(' ');
  const inner = /*#__PURE__*/React.createElement(React.Fragment, null, icon ? /*#__PURE__*/React.createElement("span", {
    className: "orax-btn__icon",
    "aria-hidden": "true"
  }, icon) : null, /*#__PURE__*/React.createElement("span", null, children));
  if (href && !rest.disabled) return /*#__PURE__*/React.createElement("a", _extends({
    className: cls,
    href: href
  }, rest), inner);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    className: cls
  }, rest), inner);
}
Object.assign(__ds_scope, { Button, __ds_default_components_actions_Button_8qpwqe: Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/brand/Cover.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// Block composition from the shipped Cover: one tall brand slab right, satellites stacking down its left edge — the logo's own
// composition (a heavy X with pixel fragments breaking off it). 14 tiles on a 32px pitch (space-6), tile corners radius-sm.
const RECTS = [['brand', 752, 0, 208, 288, 0], ['deep', 624, 128, 128, 160, 0], ['ring', 656, 32, 96, 96, 0], ['sunken', 480, 224, 160, 64, 0], ['deep', 592, 32, 32, 32, 1], ['deep', 560, 64, 64, 32, 1], ['ring', 528, 96, 32, 32, 1], ['deep', 592, 96, 32, 32, 1], ['ring', 560, 128, 32, 32, 1], ['deep', 496, 160, 64, 32, 1], ['ring', 592, 160, 32, 32, 1], ['deep', 528, 192, 32, 32, 1], ['ring', 496, 64, 32, 32, 1], ['ruby', 784, 224, 32, 32, 1], ['sapph', 832, 224, 32, 32, 1], ['emer', 880, 224, 32, 32, 1], ['deep', 816, 96, 32, 32, 1], ['deep', 848, 128, 64, 32, 1]];
const FILL = {
  brand: 'var(--brand)',
  deep: 'var(--brand-deep)',
  ring: 'var(--logo-plate)',
  sunken: 'var(--surface-sunken)',
  ruby: 'var(--gem-ruby-base)',
  sapph: 'var(--gem-sapphire-base)',
  emer: 'var(--gem-emerald-base)'
};

/** The 960 × 288 brand cover: block composition, the real logo, and the tagline strip. */
function Cover({
  theme = 'dark',
  scale = 1,
  style,
  ...rest
}) {
  const logo = theme === 'light' ? 'assets/Logos/orax-logo-transparent.png' : 'assets/Logos/orax-logo-on-dark.png';
  const b = {
    color: 'var(--brand-text)',
    fontWeight: 400
  };
  return /*#__PURE__*/React.createElement("div", _extends({
    "data-theme": theme,
    style: {
      position: 'relative',
      width: 960,
      height: 288,
      overflow: 'hidden',
      background: 'var(--surface)',
      color: 'var(--ink)',
      fontFamily: 'var(--font-sans)',
      transform: scale === 1 ? undefined : `scale(${scale})`,
      transformOrigin: 'top left',
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("svg", {
    width: "960",
    height: "288",
    viewBox: "0 0 960 288",
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      inset: 0
    }
  }, RECTS.map(([k, x, y, w, h, tile], i) => /*#__PURE__*/React.createElement("rect", {
    key: i,
    x: x,
    y: y,
    width: w,
    height: h,
    rx: tile ? 6 : 0,
    fill: FILL[k]
  }))), /*#__PURE__*/React.createElement("img", {
    src: __ds_scope.asset(logo),
    alt: "OraX",
    style: {
      position: 'absolute',
      left: 36,
      bottom: 60,
      height: 150,
      width: 'auto'
    }
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      position: 'absolute',
      left: 48,
      bottom: 28,
      margin: 0,
      fontFamily: 'var(--font-pixel)',
      fontSize: 13,
      lineHeight: '18px',
      letterSpacing: '.04em',
      textTransform: 'uppercase',
      color: 'var(--ink-muted)',
      whiteSpace: 'nowrap'
    }
  }, "The game is ", /*#__PURE__*/React.createElement("b", {
    style: b
  }, "life"), " \xB7 Play it ", /*#__PURE__*/React.createElement("b", {
    style: b
  }, "together")));
}
Object.assign(__ds_scope, { Cover, __ds_default_components_brand_Cover_1t6gl2n: Cover });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Cover.jsx", error: String((e && e.message) || e) }); }

// components/brand/Logo.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const FILES = {
  dark: 'assets/Logos/orax-logo-on-dark.png',
  light: 'assets/Logos/orax-logo-transparent.png',
  white: 'assets/Logos/orax-logo.png'
};
const CSS = `.orax-logo{display:block}.orax-logo--auto-light{display:none}[data-theme="light"] .orax-logo--auto-light{display:block}[data-theme="light"] .orax-logo--auto-dark{display:none}`;

/** The OraX lock-up, as shipped. Never reversed to white: on a dark ground the ring and X are logo-plate grey. */
function Logo({
  height = 32,
  ground = 'auto',
  alt = 'OraX',
  style,
  ...rest
}) {
  const h = typeof height === 'number' ? `${height}px` : height;
  __ds_scope.injectOnce('orax-logo', CSS);
  const img = (file, cls) => /*#__PURE__*/React.createElement("img", _extends({
    className: cls,
    src: __ds_scope.asset(file),
    alt: alt,
    style: {
      height: h,
      width: 'auto',
      ...style
    }
  }, rest));
  if (ground === 'auto') {
    return /*#__PURE__*/React.createElement(React.Fragment, null, img(FILES.dark, 'orax-logo orax-logo--auto-dark'), img(FILES.light, 'orax-logo orax-logo--auto-light'));
  }
  return img(FILES[ground] || FILES.dark, 'orax-logo');
}
Object.assign(__ds_scope, { Logo, __ds_default_components_brand_Logo_1q8yv4x: Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/Logo.jsx", error: String((e && e.message) || e) }); }

// components/game/GemSocket.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CSS = `.orax-socket{appearance:none;border:0;padding:0;margin:0;background:transparent;display:inline-flex;align-items:center;justify-content:center;flex:none;box-sizing:border-box;-webkit-tap-highlight-color:transparent}
.orax-socket[data-interactive]{cursor:pointer;border-radius:var(--radius-md)}
.orax-socket:focus-visible{outline:2px solid var(--focus);outline-offset:2px}
.orax-socket__well{transition:box-shadow var(--motion-base,200ms) var(--ease-standard,ease)}
@media (prefers-reduced-motion:reduce){.orax-socket__well{transition:none}}`;

/** A recessed well holding one gem. The setting follows the cut: Ruby round, Sapphire rounded square, Emerald 45° diamond. */
function GemSocket({
  gem = 'ruby',
  active = false,
  size = 72,
  onClick,
  label,
  style,
  ...rest
}) {
  __ds_scope.injectOnce('orax-socket', CSS);
  const g = __ds_scope.GEMS[gem] || __ds_scope.GEMS.ruby;
  const stone = Math.round(size * 0.57);
  const diamond = gem === 'emerald';
  const wellSize = diamond ? Math.round(size * 0.79) : size;
  const radius = gem === 'ruby' ? 'var(--radius-full)' : gem === 'sapphire' ? 'var(--radius-lg)' : Math.round(size * 0.14);
  const ring = active ? `0 0 0 3px var(--gem-${gem}-fill), var(--glow-${gem})` : '0 0 0 3px var(--border)';
  const well = {
    width: wellSize,
    height: wellSize,
    borderRadius: radius,
    background: 'var(--surface-sunken)',
    boxShadow: `var(--shadow-socket), ${ring}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transform: diamond ? 'rotate(45deg)' : undefined,
    boxSizing: 'border-box'
  };
  const Tag = onClick ? 'button' : 'div';
  const a11y = onClick ? {
    type: 'button',
    'aria-pressed': active,
    'aria-label': label || `${g.name} gem`,
    'data-interactive': ''
  } : {
    role: 'img',
    'aria-label': label || `${g.name} gem${active ? ', active' : ''}`
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    className: "orax-socket",
    onClick: onClick,
    style: {
      width: size,
      height: size,
      ...style
    }
  }, a11y, rest), /*#__PURE__*/React.createElement("div", {
    className: "orax-socket__well",
    style: well
  }, /*#__PURE__*/React.createElement("img", {
    src: __ds_scope.asset(g.file),
    alt: "",
    draggable: "false",
    style: {
      width: stone,
      height: stone,
      display: 'block',
      transform: diamond ? 'rotate(-45deg)' : undefined
    }
  })));
}
Object.assign(__ds_scope, { GemSocket, __ds_default_components_game_GemSocket_15tygg5: GemSocket });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/GemSocket.jsx", error: String((e && e.message) || e) }); }

// components/game/ClassCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const DEFAULT_GEMS = [{
  gem: 'ruby'
}, {
  gem: 'sapphire'
}, {
  gem: 'emerald'
}];

/** The roster card for one player: avatar with a class ring, class name, role eyebrow, slot number, a triplet of GemSockets and a pixel-label footer. */
function ClassCard({
  classKey = 'stirrer',
  name,
  role,
  slot,
  gems = DEFAULT_GEMS,
  footer,
  current = false,
  avatar,
  figure = 't1m',
  width = 300,
  style,
  ...rest
}) {
  const c = __ds_scope.CLASSES[classKey] || __ds_scope.CLASSES.stirrer;
  const accent = `var(--class-${classKey in __ds_scope.CLASSES ? classKey : 'stirrer'})`;
  const activeGem = (gems.find(g => g && g.active) || {}).gem;
  const edge = current && activeGem ? `var(--gem-${activeGem}-fill)` : 'var(--border)';
  const avatarStyle = avatar ? {
    backgroundImage: `url("${avatar}")`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : __ds_scope.avatarCrop(c.board, figure);
  const roleText = role === undefined ? c.role : role;
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      width,
      boxSizing: 'border-box',
      background: 'var(--surface-raised)',
      border: `2px solid ${edge}`,
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)',
      color: 'var(--ink)',
      fontFamily: 'var(--font-sans)',
      ...style
    },
    "aria-current": current ? 'true' : undefined
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      width: 44,
      height: 44,
      flex: 'none',
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-sunken)',
      boxShadow: `0 0 0 3px ${accent}`,
      ...avatarStyle
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-heading-sm, 700 20px/26px "Space Grotesk", sans-serif)',
      letterSpacing: '-0.01em',
      color: accent
    }
  }, name || c.name), roleText ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-overline, 700 11px/14px "Space Grotesk", sans-serif)',
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--ink-muted)'
    }
  }, roleText) : null), slot !== undefined && slot !== null ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-caption, 400 13px/18px "Space Grotesk", sans-serif)',
      fontWeight: 700,
      color: 'var(--ink-muted)'
    }
  }, slot) : null), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 'var(--space-2)',
      margin: 'var(--space-4) 0'
    }
  }, gems.slice(0, 3).map((g, i) => /*#__PURE__*/React.createElement(__ds_scope.GemSocket, {
    key: i,
    gem: g.gem,
    active: !!g.active,
    size: 64,
    onClick: g.onClick
  }))), footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-pixel-label, 700 11px/14px Silkscreen, monospace)',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      textAlign: 'center',
      color: 'var(--ink-muted)',
      border: '1px dashed var(--border-strong)',
      borderRadius: 'var(--radius-sm)',
      padding: 'var(--space-2)'
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { ClassCard, __ds_default_components_game_ClassCard_1suv303: ClassCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/game/ClassCard.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/App.jsx
try { (() => {
const {
  Icon
} = window.OraXDesignSystem_d465f6;
const {
  WelcomeScreen,
  ChooseClassScreen,
  PartyScreen,
  YouScreen
} = window;
const TABS = [['play', 'Play', 'sparkles'], ['classes', 'Classes', 'shirt'], ['you', 'You', 'user']];
function TabBar({
  tab,
  onTab
}) {
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Main",
    style: {
      display: 'flex',
      flex: 'none',
      borderTop: '1px solid var(--border)',
      background: 'var(--surface-raised)'
    }
  }, TABS.map(([k, label, icon]) => {
    const active = tab === k;
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      type: "button",
      onClick: () => onTab(k),
      "aria-current": active ? 'page' : undefined,
      style: {
        flex: 1,
        minHeight: 56,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        padding: '6px 0',
        color: active ? 'var(--brand-text)' : 'var(--ink-muted)',
        font: 'var(--text-caption)',
        fontWeight: active ? 500 : 400
      }
    }, /*#__PURE__*/React.createElement(Icon, {
      name: icon,
      size: 24
    }), /*#__PURE__*/React.createElement("span", null, label));
  }));
}
function Controls({
  screen,
  setScreen,
  theme,
  setTheme
}) {
  const btn = active => ({
    minHeight: 32,
    padding: '0 12px',
    borderRadius: 'var(--radius-sm)',
    border: `1px solid ${active ? 'var(--brand)' : 'var(--border-strong)'}`,
    background: active ? 'var(--brand-subtle)' : 'transparent',
    color: 'var(--ink)',
    font: 'var(--text-caption)',
    cursor: 'pointer'
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      padding: '0 16px',
      color: 'var(--ink-muted)',
      font: 'var(--text-caption)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Screen"), [['welcome', 'Welcome'], ['classes', 'Choose class'], ['play', 'Party'], ['you', 'You']].map(([k, l]) => /*#__PURE__*/React.createElement("button", {
    key: k,
    type: "button",
    style: btn(screen === k),
    onClick: () => setScreen(k)
  }, l)), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8
    }
  }, "Theme"), ['dark', 'light'].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    type: "button",
    style: btn(theme === t),
    onClick: () => setTheme(t)
  }, t[0].toUpperCase() + t.slice(1))));
}
function App() {
  const [screen, setScreen] = React.useState('welcome');
  const [theme, setTheme] = React.useState('dark');
  const [klass, setKlass] = React.useState('stirrer');
  const [gem, setGem] = React.useState('ruby');
  const screens = {
    welcome: /*#__PURE__*/React.createElement(WelcomeScreen, {
      onStart: () => setScreen('classes')
    }),
    classes: /*#__PURE__*/React.createElement(ChooseClassScreen, {
      value: klass,
      gem: gem,
      onChange: setKlass,
      onGem: setGem,
      onPlay: () => setScreen('play'),
      onBack: () => setScreen('welcome')
    }),
    play: /*#__PURE__*/React.createElement(PartyScreen, {
      klass: klass,
      gem: gem
    }),
    you: /*#__PURE__*/React.createElement(YouScreen, {
      klass: klass,
      gem: gem,
      onClasses: () => setScreen('classes')
    })
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "stage"
  }, /*#__PURE__*/React.createElement("div", {
    className: "phone",
    "data-theme": theme,
    "data-screen-label": screen
  }, /*#__PURE__*/React.createElement("div", {
    className: "scroll",
    style: {
      flex: 1,
      minHeight: 0,
      overflow: 'auto'
    }
  }, screens[screen]), screen !== 'welcome' ? /*#__PURE__*/React.createElement(TabBar, {
    tab: screen,
    onTab: setScreen
  }) : null), /*#__PURE__*/React.createElement(Controls, {
    screen: screen,
    setScreen: setScreen,
    theme: theme,
    setTheme: setTheme
  }));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/ChooseClassScreen.jsx
try { (() => {
const {
  Button,
  GemSocket,
  Chip,
  Icon
} = window.OraXDesignSystem_d465f6;
const {
  CLASS_LIST,
  CLASS_MAP,
  cropStyle,
  GEM_INFO,
  iconButtonStyle,
  overlineStyle,
  captionStyle
} = window.OraxKit;
function ClassTile({
  c,
  selected,
  onSelect
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onSelect,
    "aria-pressed": selected,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: 'var(--space-3) var(--space-2)',
      background: selected ? 'var(--brand-subtle)' : 'var(--surface-raised)',
      border: `2px solid ${selected ? 'var(--brand)' : 'var(--border)'}`,
      borderRadius: 'var(--radius-md)',
      cursor: 'pointer',
      color: 'var(--ink)',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'block',
      width: 56,
      height: 56,
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-sunken)',
      boxShadow: `0 0 0 3px var(--class-${c.key})`,
      margin: 3,
      ...cropStyle(c.key, 't1m')
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-strong)',
      color: `var(--class-${c.key})`,
      whiteSpace: 'nowrap'
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      ...overlineStyle,
      minHeight: 14
    }
  }, c.role));
}
function ChooseClassScreen({
  value,
  gem,
  onChange,
  onGem,
  onPlay,
  onBack
}) {
  const c = CLASS_MAP[value];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      boxSizing: 'border-box',
      paddingBottom: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      padding: 'var(--space-3) var(--space-4) 0',
      marginLeft: -12
    }
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Back",
    onClick: onBack,
    style: iconButtonStyle
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "arrow-left",
    size: 24
  })), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--text-heading-md)',
      letterSpacing: 'var(--tracking-heading-md)'
    }
  }, "Choose your class")), /*#__PURE__*/React.createElement("p", {
    style: {
      ...overlineStyle,
      padding: 'var(--space-2) var(--space-4) var(--space-4)'
    }
  }, "Matched by who you are, not by skill"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: 'var(--space-2)',
      padding: '0 var(--space-4)'
    }
  }, CLASS_LIST.map(k => /*#__PURE__*/React.createElement(ClassTile, {
    key: k.key,
    c: k,
    selected: value === k.key,
    onSelect: () => onChange(k.key)
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: 'var(--space-5) var(--space-4) 0'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...overlineStyle,
      marginBottom: 'var(--space-2)'
    }
  }, "Choose your gem"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-4)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-2)',
      flex: 'none'
    }
  }, ['ruby', 'sapphire', 'emerald'].map(g => /*#__PURE__*/React.createElement(GemSocket, {
    key: g,
    gem: g,
    size: 64,
    active: gem === g,
    onClick: () => onGem(g),
    label: `${GEM_INFO[g].name} ${c.name}`
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 'var(--space-1)'
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    variant: gem
  }), /*#__PURE__*/React.createElement("span", {
    style: captionStyle
  }, GEM_INFO[gem].cut)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 'var(--space-5) var(--space-4) 0',
      marginTop: 'auto'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    block: true,
    onClick: onPlay
  }, "Play as ", c.name)));
}
window.ChooseClassScreen = ChooseClassScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/ChooseClassScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/PartyScreen.jsx
try { (() => {
const {
  Logo,
  ClassCard,
  Icon
} = window.OraXDesignSystem_d465f6;
const {
  CLASS_MAP,
  iconButtonStyle,
  captionStyle
} = window.OraxKit;
const PARTY_POOL = [{
  key: 'taster',
  figure: 't1f',
  gems: [{
    gem: 'emerald'
  }, {
    gem: 'emerald'
  }, {
    gem: 'sapphire'
  }],
  footer: 'Limit ×1.5 · Break'
}, {
  key: 'provider',
  figure: 't2m',
  gems: [{
    gem: 'ruby'
  }, {
    gem: 'ruby'
  }, {
    gem: 'emerald',
    active: true
  }],
  footer: 'Limit ×2'
}, {
  key: 'stirrer',
  figure: 't1m',
  gems: [{
    gem: 'sapphire'
  }, {
    gem: 'sapphire'
  }, {
    gem: 'ruby',
    active: true
  }],
  footer: 'Limit ×1.5 · Shift'
}];
function PartyScreen({
  klass,
  gem
}) {
  const others = PARTY_POOL.filter(p => p.key !== klass).slice(0, 2);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      paddingBottom: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-3) var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 32
  }), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Notifications",
    style: {
      ...iconButtonStyle,
      marginRight: -10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "bell",
    size: 24
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      padding: '0 var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-3) var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 24,
    style: {
      color: 'var(--brand-text)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-body-strong)'
    }
  }, "Tiong Bahru Market"), /*#__PURE__*/React.createElement("div", {
    style: captionStyle
  }, "Singapore \xB7 400 m \xB7 tonight 19:30")), /*#__PURE__*/React.createElement(Icon, {
    name: "chevron-right",
    size: 20,
    style: {
      color: 'var(--ink-muted)'
    }
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 'var(--space-3)',
      padding: 'var(--space-5) var(--space-4) var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--text-heading-md)',
      letterSpacing: 'var(--tracking-heading-md)',
      whiteSpace: 'nowrap'
    }
  }, "Your party"), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-pixel-label)',
      letterSpacing: 'var(--tracking-pixel-label)',
      textTransform: 'uppercase',
      color: 'var(--ink-muted)',
      whiteSpace: 'nowrap'
    }
  }, "Round 1 \xB7 Limit \xD72")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      padding: '0 var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement(ClassCard, {
    classKey: klass,
    slot: 1,
    current: true,
    width: "100%",
    gems: [{
      gem: 'sapphire'
    }, {
      gem: 'sapphire'
    }, {
      gem,
      active: true
    }],
    footer: "Limit \xD71.5 \xB7 Shift"
  }), others.map((p, i) => /*#__PURE__*/React.createElement(ClassCard, {
    key: p.key,
    classKey: p.key,
    slot: i + 2,
    figure: p.figure,
    width: "100%",
    gems: p.gems,
    footer: p.footer
  }))));
}
window.PartyScreen = PartyScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/PartyScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/WelcomeScreen.jsx
try { (() => {
const {
  Logo,
  Tagline,
  Button
} = window.OraXDesignSystem_d465f6;
const {
  cropStyle,
  captionStyle
} = window.OraxKit;
function WelcomeScreen({
  onStart
}) {
  const strip = ['provider', 'taster', 'stirrer', 'spark', 'host'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      boxSizing: 'border-box',
      padding: 'var(--space-8) var(--space-4) var(--space-4)',
      gap: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 40,
    style: {
      alignSelf: 'center'
    }
  }), /*#__PURE__*/React.createElement(Tagline, {
    size: "lg",
    align: "center"
  }), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--text-body-lg)',
      color: 'var(--ink)',
      textAlign: 'center',
      textWrap: 'pretty'
    }
  }, "Your avatar, your wardrobe, your city. Matched by who you are, not how well you play."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 'var(--space-3)',
      padding: 'var(--space-1) 0'
    },
    "aria-hidden": "true"
  }, strip.map(k => /*#__PURE__*/React.createElement("div", {
    key: k,
    style: {
      width: 52,
      height: 52,
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-sunken)',
      boxShadow: `0 0 0 3px var(--class-${k})`,
      ...cropStyle(k, 't1m')
    }
  }))), /*#__PURE__*/React.createElement("p", {
    style: {
      ...captionStyle,
      textAlign: 'center'
    }
  }, "Singapore \xB7 Kuala Lumpur"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    block: true,
    onClick: onStart
  }, "Start playing"), /*#__PURE__*/React.createElement(Button, {
    block: true,
    variant: "ghost"
  }, "I already have an account")));
}
window.WelcomeScreen = WelcomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/WelcomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/YouScreen.jsx
try { (() => {
const {
  Button,
  Chip,
  Tagline,
  Icon
} = window.OraXDesignSystem_d465f6;
const {
  CLASS_MAP,
  cropStyle,
  GEM_INFO,
  iconButtonStyle,
  overlineStyle,
  captionStyle
} = window.OraxKit;
function YouScreen({
  klass,
  gem,
  onClasses
}) {
  const c = CLASS_MAP[klass];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      boxSizing: 'border-box',
      padding: '0 var(--space-4) var(--space-4)',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-3) 0 0'
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--text-heading-md)',
      letterSpacing: 'var(--tracking-heading-md)'
    }
  }, "You"), /*#__PURE__*/React.createElement("button", {
    type: "button",
    "aria-label": "Settings",
    style: {
      ...iconButtonStyle,
      marginRight: -10
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "settings",
    size: 24
  }))), /*#__PURE__*/React.createElement("section", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-3)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-5) var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      width: 96,
      height: 96,
      borderRadius: 'var(--radius-full)',
      background: 'var(--surface-sunken)',
      boxShadow: `0 0 0 3px var(--class-${klass})`,
      margin: 3,
      ...cropStyle(klass, 't1m')
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-heading-sm)',
      letterSpacing: 'var(--tracking-heading-sm)'
    }
  }, "Ayu"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'center',
      gap: 'var(--space-2)',
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-strong)',
      color: `var(--class-${klass})`
    }
  }, c.name), c.role ? /*#__PURE__*/React.createElement("span", {
    style: overlineStyle
  }, c.role) : null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    variant: gem
  }), /*#__PURE__*/React.createElement(Chip, {
    appearance: "subtle"
  }, "Night owl"), /*#__PURE__*/React.createElement(Chip, {
    appearance: "subtle"
  }, "Hawker regular"), /*#__PURE__*/React.createElement(Chip, {
    appearance: "subtle"
  }, "Kuala Lumpur")), /*#__PURE__*/React.createElement("p", {
    style: {
      ...captionStyle,
      textAlign: 'center',
      width: '100%'
    }
  }, GEM_INFO[gem].name, " ", c.name, " \xB7 playing since May")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)'
    }
  }, /*#__PURE__*/React.createElement(Button, {
    block: true,
    variant: "secondary",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "shirt"
    })
  }, "Wardrobe"), /*#__PURE__*/React.createElement(Button, {
    block: true,
    variant: "ghost",
    onClick: onClasses
  }, "Change class")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      paddingTop: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement(Tagline, {
    size: "md",
    align: "center",
    style: {
      color: 'var(--ink-muted)'
    }
  })));
}
window.YouScreen = YouScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/YouScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/kit-shared.jsx
try { (() => {
// Shared data + helpers for the OraX UI kits (not a design-system component). Paths are relative to the kit's index.html.
const KIT_ASSETS = '../../assets/';
const CLASS_LIST = [{
  key: 'provider',
  name: 'Provider',
  role: 'Fighter',
  board: '01-provider-board.png'
}, {
  key: 'foodsmith',
  name: 'Foodsmith',
  role: '',
  board: '02-foodsmith-board.png'
}, {
  key: 'spark',
  name: 'Spark',
  role: '',
  board: '03-spark-board.png'
}, {
  key: 'gastronaut',
  name: 'Gastronaut',
  role: '',
  board: '04-gastronaut-board.png'
}, {
  key: 'taster',
  name: 'Taster',
  role: 'Rogue',
  board: '05-taster-board.png'
}, {
  key: 'purist',
  name: 'Purist',
  role: '',
  board: '06-purist-board.png'
}, {
  key: 'rebel',
  name: 'Rebel',
  role: '',
  board: '07-rebel-board.png'
}, {
  key: 'stirrer',
  name: 'Stirrer',
  role: 'Mage',
  board: '08-stirrer-board.png'
}, {
  key: 'host',
  name: 'Host',
  role: '',
  board: '09-host-board.png'
}];
const CLASS_MAP = Object.fromEntries(CLASS_LIST.map(c => [c.key, c]));
// Each board is a 2×2 (t1 top / t2 bottom, masculine left / feminine right); focal points sit on the figure's head.
const FIG = {
  t1m: {
    x: 0.28,
    y: 0.09
  },
  t1f: {
    x: 0.72,
    y: 0.09
  },
  t2m: {
    x: 0.28,
    y: 0.585
  },
  t2f: {
    x: 0.72,
    y: 0.585
  }
};
function cropStyle(key, figure = 't1m', zoom = 4.5, dy = 0) {
  const f = FIG[figure] || FIG.t1m;
  const pos = v => ((0.5 - v * zoom) / (1 - zoom) * 100).toFixed(2) + '%';
  return {
    backgroundImage: `url("${KIT_ASSETS}Classes/${CLASS_MAP[key].board}")`,
    backgroundSize: `${zoom * 100}%`,
    backgroundPosition: `${pos(f.x)} ${pos(f.y + dy)}`,
    backgroundRepeat: 'no-repeat'
  };
}
const GEM_INFO = {
  ruby: {
    name: 'Ruby',
    cut: 'Round brilliant · round setting'
  },
  sapphire: {
    name: 'Sapphire',
    cut: 'Cushion · rounded-square setting'
  },
  emerald: {
    name: 'Emerald',
    cut: 'Lozenge · diamond setting'
  }
};
const iconButtonStyle = {
  width: 44,
  height: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 0,
  borderRadius: 'var(--radius-md)',
  color: 'var(--ink)',
  cursor: 'pointer',
  padding: 0
};
const overlineStyle = {
  margin: 0,
  font: 'var(--text-overline)',
  letterSpacing: 'var(--tracking-overline)',
  textTransform: 'uppercase',
  color: 'var(--ink-muted)'
};
const captionStyle = {
  margin: 0,
  font: 'var(--text-caption)',
  color: 'var(--ink-muted)'
};
window.OraxKit = {
  KIT_ASSETS,
  CLASS_LIST,
  CLASS_MAP,
  cropStyle,
  GEM_INFO,
  iconButtonStyle,
  overlineStyle,
  captionStyle
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/kit-shared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/LandingPage.jsx
try { (() => {
const {
  Logo,
  Tagline,
  Button,
  Chip,
  GemSocket,
  Cover,
  Icon
} = window.OraXDesignSystem_d465f6;
const {
  KIT_ASSETS,
  CLASS_LIST,
  cropStyle,
  GEM_INFO,
  overlineStyle,
  captionStyle
} = window.OraxKit;
const wrap = {
  width: '100%',
  maxWidth: 1280,
  margin: '0 auto',
  padding: '0 var(--space-7)',
  boxSizing: 'border-box'
};
const h2 = {
  margin: 0,
  font: 'var(--text-heading-md)',
  letterSpacing: 'var(--tracking-heading-md)'
};
function Nav() {
  const link = {
    font: 'var(--text-body-strong)',
    color: 'var(--ink-muted)',
    textDecoration: 'none'
  };
  return /*#__PURE__*/React.createElement("header", {
    style: {
      ...wrap,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      minHeight: 80
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#top",
    "aria-label": "OraX home",
    style: {
      display: 'block'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 40
  })), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Site",
    style: {
      display: 'flex',
      gap: 'var(--space-5)',
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#classes",
    style: link
  }, "Classes"), /*#__PURE__*/React.createElement("a", {
    href: "#gems",
    style: link
  }, "Gems"), /*#__PURE__*/React.createElement("a", {
    href: "#cities",
    style: link
  }, "Cities")), /*#__PURE__*/React.createElement(Button, null, "Start playing"));
}
function Hero() {
  return /*#__PURE__*/React.createElement("section", {
    id: "top",
    style: {
      ...wrap,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
      gap: 'var(--space-7)',
      alignItems: 'center',
      padding: 'var(--space-8) var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-5)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Tagline, {
    size: "md"
  }), /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      font: 'var(--text-display-xl)',
      letterSpacing: 'var(--tracking-display-xl)',
      textWrap: 'pretty'
    }
  }, "Your avatar, your wardrobe, your city."), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--text-body-lg)',
      color: 'var(--ink-muted)',
      maxWidth: 520,
      textWrap: 'pretty'
    }
  }, "OraX matches you by personality and life habits, not skill. Pick a class, pick a gem, and meet your party at real places across Singapore and Kuala Lumpur."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-3)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Button, null, "Start playing"), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    href: "#classes",
    icon: /*#__PURE__*/React.createElement(Icon, {
      name: "users"
    })
  }, "See the classes")), /*#__PURE__*/React.createElement("p", {
    style: captionStyle
  }, "Installable web app \xB7 no download \xB7 free to play")), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: 'var(--space-5)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-4)'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: `${KIT_ASSETS}Classes/08-stirrer-board.png`,
    alt: "Stirrer class board: t1 and t2 kit, masculine and feminine builds",
    style: {
      width: '100%',
      height: 'auto',
      borderRadius: 'var(--radius-sm)',
      display: 'block'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 0,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--text-heading-sm)',
      letterSpacing: 'var(--tracking-heading-sm)',
      color: 'var(--class-stirrer)'
    }
  }, "Stirrer"), /*#__PURE__*/React.createElement("div", {
    style: overlineStyle
  }, "Mage \xB7 ladle, wok spatula")), /*#__PURE__*/React.createElement(Chip, {
    variant: "ruby"
  }), /*#__PURE__*/React.createElement(Chip, {
    variant: "sapphire"
  }), /*#__PURE__*/React.createElement(Chip, {
    variant: "emerald"
  }))));
}
function Classes() {
  return /*#__PURE__*/React.createElement("section", {
    id: "classes",
    style: {
      ...wrap,
      padding: 'var(--space-7) var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...overlineStyle,
      marginBottom: 'var(--space-2)'
    }
  }, "Nine classes"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: 'var(--space-5)',
      flexWrap: 'wrap',
      marginBottom: 'var(--space-5)'
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "Matched by who you are"), /*#__PURE__*/React.createElement("p", {
    style: {
      ...captionStyle,
      maxWidth: 420
    }
  }, "Class identity comes from the art and the gem, never from stats. Nothing ranks players by skill.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))',
      gap: 'var(--space-3)'
    }
  }, CLASS_LIST.map(c => /*#__PURE__*/React.createElement("a", {
    key: c.key,
    href: "#classes",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      padding: 'var(--space-3)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      textDecoration: 'none',
      color: 'var(--ink)',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'block',
      aspectRatio: '1 / 1',
      borderRadius: 'var(--radius-sm)',
      background: 'var(--surface-sunken)',
      ...cropStyle(c.key, 't1m', 2.4, 0.16)
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-strong)',
      color: `var(--class-${c.key})`,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }
  }, c.name), /*#__PURE__*/React.createElement("span", {
    style: {
      ...overlineStyle,
      minHeight: 14
    }
  }, c.role)))));
}
function Gems() {
  const [pick, setPick] = React.useState('sapphire');
  return /*#__PURE__*/React.createElement("section", {
    id: "gems",
    style: {
      ...wrap,
      padding: 'var(--space-7) var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      gap: 'var(--space-7)',
      alignItems: 'center',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-3)',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: overlineStyle
  }, "Three gems"), /*#__PURE__*/React.createElement("h2", {
    style: h2
  }, "Every class, three ways"), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--text-body)',
      color: 'var(--ink-muted)',
      maxWidth: 460,
      textWrap: 'pretty'
    }
  }, "Ruby, Sapphire or Emerald sets your variant. The socket's shape tells you the stone before its colour does: round, rounded square, diamond."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(Chip, {
    variant: pick
  }), /*#__PURE__*/React.createElement("span", {
    style: captionStyle
  }, GEM_INFO[pick].cut))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'center',
      gap: 'var(--space-6)',
      flexWrap: 'wrap'
    }
  }, ['ruby', 'sapphire', 'emerald'].map(g => /*#__PURE__*/React.createElement("div", {
    key: g,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 'var(--space-3)'
    }
  }, /*#__PURE__*/React.createElement(GemSocket, {
    gem: g,
    size: 96,
    active: pick === g,
    onClick: () => setPick(g),
    label: GEM_INFO[g].name
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-body-strong)',
      color: `var(--gem-${g}-text)`
    }
  }, GEM_INFO[g].name))))));
}
function Cities() {
  const city = (name, places) => /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 320px',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--space-2)',
      padding: 'var(--space-5)',
      background: 'var(--surface-raised)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      color: 'var(--brand-text)'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: "map-pin",
    size: 20
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--text-heading-sm)',
      letterSpacing: 'var(--tracking-heading-sm)',
      color: 'var(--ink)',
      whiteSpace: 'nowrap'
    }
  }, name)), /*#__PURE__*/React.createElement("p", {
    style: {
      ...captionStyle,
      textWrap: 'pretty'
    }
  }, places));
  return /*#__PURE__*/React.createElement("section", {
    id: "cities",
    style: {
      ...wrap,
      padding: 'var(--space-7) var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      ...overlineStyle,
      marginBottom: 'var(--space-2)'
    }
  }, "Two cities"), /*#__PURE__*/React.createElement("h2", {
    style: {
      ...h2,
      marginBottom: 'var(--space-5)'
    }
  }, "Play it at real places"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      flexWrap: 'wrap'
    }
  }, city('Singapore', 'Tiong Bahru Market · Lau Pa Sat · Haji Lane — parties form around hawker centres and late-night kopitiams.'), city('Kuala Lumpur', 'Jalan Alor · Petaling Street · Bangsar — meet at the stall, not on a screen.')));
}
function CoverBand() {
  const ref = React.useRef(null);
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    const fit = () => {
      if (ref.current) setScale(Math.min(1.3334, ref.current.clientWidth / 960));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, []);
  return /*#__PURE__*/React.createElement("section", {
    style: {
      ...wrap,
      padding: 'var(--space-7) var(--space-7) 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      width: '100%',
      height: 288 * scale,
      overflow: 'hidden',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(Cover, {
    scale: scale
  })));
}
function Footer() {
  const link = {
    font: 'var(--text-caption)',
    color: 'var(--ink-muted)',
    textDecoration: 'none'
  };
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      ...wrap,
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-5)',
      flexWrap: 'wrap',
      padding: 'var(--space-7) var(--space-7) var(--space-8)',
      borderTop: '1px solid var(--border)',
      marginTop: 'var(--space-7)'
    }
  }, /*#__PURE__*/React.createElement(Logo, {
    height: 32
  }), /*#__PURE__*/React.createElement(Tagline, {
    size: "md",
    style: {
      color: 'var(--ink-muted)'
    }
  }), /*#__PURE__*/React.createElement("nav", {
    "aria-label": "Footer",
    style: {
      display: 'flex',
      gap: 'var(--space-4)',
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#classes",
    style: link
  }, "Classes"), /*#__PURE__*/React.createElement("a", {
    href: "#gems",
    style: link
  }, "Gems"), /*#__PURE__*/React.createElement("a", {
    href: "#cities",
    style: link
  }, "Cities"), /*#__PURE__*/React.createElement("a", {
    href: "#top",
    style: link
  }, "Privacy")), /*#__PURE__*/React.createElement("span", {
    style: captionStyle
  }, "Singapore \xB7 Kuala Lumpur"));
}
function LandingPage() {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Nav, null), /*#__PURE__*/React.createElement(Hero, null), /*#__PURE__*/React.createElement(Classes, null), /*#__PURE__*/React.createElement(Gems, null), /*#__PURE__*/React.createElement(Cities, null), /*#__PURE__*/React.createElement(CoverBand, null), /*#__PURE__*/React.createElement(Footer, null));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(LandingPage, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/LandingPage.jsx", error: String((e && e.message) || e) }); }

// ui_kits/marketing/kit-shared.jsx
try { (() => {
// Shared data + helpers for the OraX UI kits (not a design-system component). Paths are relative to the kit's index.html.
const KIT_ASSETS = '../../assets/';
const CLASS_LIST = [{
  key: 'provider',
  name: 'Provider',
  role: 'Fighter',
  board: '01-provider-board.png'
}, {
  key: 'foodsmith',
  name: 'Foodsmith',
  role: '',
  board: '02-foodsmith-board.png'
}, {
  key: 'spark',
  name: 'Spark',
  role: '',
  board: '03-spark-board.png'
}, {
  key: 'gastronaut',
  name: 'Gastronaut',
  role: '',
  board: '04-gastronaut-board.png'
}, {
  key: 'taster',
  name: 'Taster',
  role: 'Rogue',
  board: '05-taster-board.png'
}, {
  key: 'purist',
  name: 'Purist',
  role: '',
  board: '06-purist-board.png'
}, {
  key: 'rebel',
  name: 'Rebel',
  role: '',
  board: '07-rebel-board.png'
}, {
  key: 'stirrer',
  name: 'Stirrer',
  role: 'Mage',
  board: '08-stirrer-board.png'
}, {
  key: 'host',
  name: 'Host',
  role: '',
  board: '09-host-board.png'
}];
const CLASS_MAP = Object.fromEntries(CLASS_LIST.map(c => [c.key, c]));
// Each board is a 2×2 (t1 top / t2 bottom, masculine left / feminine right); focal points sit on the figure's head.
const FIG = {
  t1m: {
    x: 0.28,
    y: 0.09
  },
  t1f: {
    x: 0.72,
    y: 0.09
  },
  t2m: {
    x: 0.28,
    y: 0.585
  },
  t2f: {
    x: 0.72,
    y: 0.585
  }
};
function cropStyle(key, figure = 't1m', zoom = 4.5, dy = 0) {
  const f = FIG[figure] || FIG.t1m;
  const pos = v => ((0.5 - v * zoom) / (1 - zoom) * 100).toFixed(2) + '%';
  return {
    backgroundImage: `url("${KIT_ASSETS}Classes/${CLASS_MAP[key].board}")`,
    backgroundSize: `${zoom * 100}%`,
    backgroundPosition: `${pos(f.x)} ${pos(f.y + dy)}`,
    backgroundRepeat: 'no-repeat'
  };
}
const GEM_INFO = {
  ruby: {
    name: 'Ruby',
    cut: 'Round brilliant · round setting'
  },
  sapphire: {
    name: 'Sapphire',
    cut: 'Cushion · rounded-square setting'
  },
  emerald: {
    name: 'Emerald',
    cut: 'Lozenge · diamond setting'
  }
};
const iconButtonStyle = {
  width: 44,
  height: 44,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'transparent',
  border: 0,
  borderRadius: 'var(--radius-md)',
  color: 'var(--ink)',
  cursor: 'pointer',
  padding: 0
};
const overlineStyle = {
  margin: 0,
  font: 'var(--text-overline)',
  letterSpacing: 'var(--tracking-overline)',
  textTransform: 'uppercase',
  color: 'var(--ink-muted)'
};
const captionStyle = {
  margin: 0,
  font: 'var(--text-caption)',
  color: 'var(--ink-muted)'
};
window.OraxKit = {
  KIT_ASSETS,
  CLASS_LIST,
  CLASS_MAP,
  cropStyle,
  GEM_INFO,
  iconButtonStyle,
  overlineStyle,
  captionStyle
};
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/marketing/kit-shared.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Cover = __ds_scope.Cover;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Tagline = __ds_scope.Tagline;

__ds_ns.ClassCard = __ds_scope.ClassCard;

__ds_ns.GemSocket = __ds_scope.GemSocket;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.ASSET_BASE = __ds_scope.ASSET_BASE;

__ds_ns.GEMS = __ds_scope.GEMS;

__ds_ns.CLASSES = __ds_scope.CLASSES;

__ds_ns.CLASS_ORDER = __ds_scope.CLASS_ORDER;

__ds_ns.FIGURES = __ds_scope.FIGURES;

})();
