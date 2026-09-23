// Spec conformance sweep (kickoff prompt, check 8): every user-facing string in src/ must match
// docs/BUILD-A-DISH.md character for character. What counts as user-facing:
//   · every string in the copy table (src/game/content/copy.ts)
//   · the content tables players read: dish names, ingredient names, class names and roles, gems, cities
//   · in every .tsx file: JSX text, user-facing attributes (aria-label, title, alt, caption, label, placeholder),
//     including template literals, and any other prose-like string literal (hard-coded copy is flagged).
// A string passes when it equals a whole `quoted` span of the spec (placeholders like {dish} match one
// placeholder or value), or, for multi-word strings and content names, appears verbatim as whole words.
// Strings the owner ruled on, or that the spec is silent about, live in scripts/strings-rulings.json.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const root = new URL('..', import.meta.url).pathname;
const spec = readFileSync(join(root, 'docs/BUILD-A-DISH.md'), 'utf8');
const spans = [...spec.matchAll(/`([^`\n]+)`/g)].map((m) => m[1]);
const rulings = new Map(
  Object.entries(JSON.parse(readFileSync(join(root, 'scripts/strings-rulings.json'), 'utf8'))),
);

async function load(file) {
  const js = ts.transpileModule(readFileSync(join(root, file), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
}

const found = new Map(); // string → { where, kind: 'copy' | 'content' | 'ui' | 'hardcoded' }
const note = (s, where, kind) => {
  const t = kind === 'ui' ? s.replace(/\s+/g, ' ').trim() : s; // copy strings keep their exact spacing
  if (t && /[A-Za-z]/.test(t) && !found.has(t)) found.set(t, { where, kind });
};

// 1. Copy table.
const { COPY } = await load('src/game/content/copy.ts');
// The namer's word lists and the tab names are listed in the spec's prose (§3.6, §1), not as quoted spans.
const CONTENT_PATHS = ['namer.tones', 'namer.bases', 'namer.details', 'app.tabs', 'prep.', 'sigils.'];
const walkValues = (v, path) =>
  typeof v === 'string'
    ? note(v, 'src/game/content/copy.ts', CONTENT_PATHS.some((p) => path.startsWith(p)) ? 'content' : 'copy')
    : v &&
      typeof v === 'object' &&
      Object.entries(v).forEach(([k, x]) => walkValues(x, path ? `${path}.${k}` : k));
walkValues(COPY, '');

// 2. Content tables.
const { DISHES } = await load('src/game/content/dishes.ts');
const { INGREDIENTS } = await load('src/game/content/ingredients.ts');
const { CLASSES, GEMS, CITY_NAME } = await load('src/game/content/identity.ts');
for (const d of DISHES)
  for (const k of ['name', 'short', 'local']) if (d[k]) note(d[k], 'dishes.ts', 'content');
for (const i of INGREDIENTS) note(i.name, 'ingredients.ts', 'content');
for (const c of Object.values(CLASSES))
  [c.name, c.role].forEach((s) => s && note(s, 'identity.ts', 'content'));
for (const g of Object.values(GEMS))
  [g.name, g.plural, g.cut].forEach((s) => note(s, 'identity.ts', 'content'));
Object.values(CITY_NAME).forEach((s) => note(s, 'identity.ts', 'content'));

// 3. Every .tsx file, via the TypeScript AST.
const UI_ATTRS = new Set(['aria-label', 'title', 'alt', 'caption', 'label', 'placeholder']);
const templateText = (n) =>
  ts.isNoSubstitutionTemplateLiteral(n) || ts.isStringLiteral(n)
    ? n.text
    : n.head.text + n.templateSpans.map((sp) => `{x}${sp.literal.text}`).join('');
function walkTsx(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkTsx(p, out);
    else if (/\.tsx$/.test(name) && !/\.test\.tsx$/.test(name)) out.push(p);
  }
  return out;
}
for (const file of walkTsx(join(root, 'src'))) {
  const where = relative(root, file);
  const sf = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.ES2022,
    true,
    ts.ScriptKind.TSX,
  );
  // `placeholder` is user-facing only on native elements; on components (Art) it is a setting.
  const isUiAttr = (attr) => {
    const name = attr.name.getText(sf);
    if (!UI_ATTRS.has(name)) return false;
    if (name !== 'placeholder') return true;
    const tag = attr.parent.parent.tagName.getText(sf);
    return /^[a-z]/.test(tag);
  };
  const visit = (n) => {
    if (ts.isJsxText(n)) note(n.text, where, 'ui');
    else if (ts.isJsxAttribute(n) && isUiAttr(n) && n.initializer) {
      const init = ts.isJsxExpression(n.initializer) ? n.initializer.expression : n.initializer;
      if (init && (ts.isStringLiteral(init) || ts.isTemplateLiteral(init)))
        note(templateText(init), where, 'ui');
    } else if (
      (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) &&
      !ts.isImportDeclaration(n.parent) &&
      !(ts.isJsxAttribute(n.parent) && !isUiAttr(n.parent)) &&
      /^[A-Z][a-z]+ [^{}]*[a-z]/.test(n.text) &&
      !/var\(|--|\bpx\b|rgba?\(/.test(n.text)
    ) {
      note(n.text, `${where} (hard-coded)`, 'hardcoded');
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

// Matching.
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRegex = (s) =>
  new RegExp(`^${escape(s).replace(/\\\{\w+\\\}/g, '(?:\\{\\w+\\}|[^\\s·]+(?: [^\\s·]+)*?)')}$`);
const wholeWords = (s) => new RegExp(`(^|[^A-Za-z])${escape(s)}($|[^A-Za-z])`).test(spec);
function inSpec(s, kind) {
  const re = toRegex(s);
  if (spans.some((sp) => sp === s || re.test(sp))) return true;
  if ((kind === 'content' || s.trim().split(/\s+/).length >= 2) && !/\{\w+\}/.test(s) && wholeWords(s))
    return true;
  return false;
}

const ok = [];
const ruled = [];
const missing = [];
for (const [s, { where, kind }] of found) {
  if (kind !== 'hardcoded' && inSpec(s, kind)) ok.push(s);
  else if (kind !== 'hardcoded' && rulings.has(s)) ruled.push([s, rulings.get(s)]);
  else missing.push([s, where]);
}
const unused = [...rulings.keys()].filter((k) => !found.has(k));

console.log(`check:strings — ${found.size} user-facing strings, ${ok.length} match docs/BUILD-A-DISH.md`);
if (ruled.length) {
  console.log(`\n${ruled.length} not in the spec, covered by scripts/strings-rulings.json:`);
  for (const [s, why] of ruled) console.log(`  · "${s}"  — ${why}`);
}
if (unused.length) {
  console.log(`\n${unused.length} rulings no longer used (remove them):`);
  for (const s of unused) console.log(`  - "${s}"`);
}
if (missing.length) {
  console.log(`\n${missing.length} NOT in the spec and not ruled on (or hard-coded outside the copy table):`);
  for (const [s, where] of missing) console.log(`  ✗ "${s}"  (${where})`);
}
if (missing.length || unused.length) process.exit(1);
console.log('\nNo unruled strings. OK.');
