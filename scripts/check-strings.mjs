// Spec conformance sweep (kickoff prompt, check 8): every user-facing string in src/ must appear in
// docs/BUILD-A-DISH.md character for character. Placeholders like {dish} match any text. Strings the owner ruled on,
// or that the spec is silent about, are listed in scripts/strings-rulings.json and reported under their own heading.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import ts from 'typescript';

const root = new URL('..', import.meta.url).pathname;
const spec = readFileSync(join(root, 'docs/BUILD-A-DISH.md'), 'utf8');
const rulings = new Map(
  Object.entries(JSON.parse(readFileSync(join(root, 'scripts/strings-rulings.json'), 'utf8'))),
);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx$/.test(name) && !/\.test\.tsx$/.test(name)) out.push(p);
  }
  return out;
}

// 1. The copy table: transpile copy.ts and import it as a module, then collect every string in it.
const copyFile = join(root, 'src/game/content/copy.ts');
const js = ts.transpileModule(readFileSync(copyFile, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { COPY } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const copyStrings = new Set();
const collect = (v) => {
  if (typeof v === 'string') copyStrings.add(v);
  else if (Array.isArray(v)) v.forEach(collect);
  else if (v && typeof v === 'object') Object.values(v).forEach(collect);
};
collect(COPY);

// 2. JSX text and user-facing attributes in .tsx files outside copy.ts.
const jsxStrings = new Map();
for (const file of walk(join(root, 'src'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(/>\s*([^<>{}\n]*[A-Za-z][^<>{}\n]*?)\s*</g)) {
    const s = m[1].trim();
    if (s && !/[=;(]/.test(s)) jsxStrings.set(s, relative(root, file));
  }
  for (const m of src.matchAll(/\b(?:caption|alt|title|placeholder|aria-label|label)=["']([^"']+)["']/g))
    jsxStrings.set(m[1], relative(root, file));
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRegex = (s) => new RegExp(escape(s).replace(/\\\{\w+\\\}/g, '.+?'));
const inSpec = (s) => spec.includes(s) || toRegex(s).test(spec);

const ok = [];
const ruled = [];
const missing = [];
for (const s of [...copyStrings, ...jsxStrings.keys()]) {
  if (inSpec(s)) ok.push(s);
  else if (rulings.has(s)) ruled.push([s, rulings.get(s)]);
  else missing.push([s, jsxStrings.get(s) ?? 'src/game/content/copy.ts']);
}

console.log(`check:strings — ${ok.length} strings match docs/BUILD-A-DISH.md`);
if (ruled.length) {
  console.log(
    `\n${ruled.length} strings not in the spec, covered by owner rulings or prototype-only (scripts/strings-rulings.json):`,
  );
  for (const [s, why] of ruled) console.log(`  · "${s}"  — ${why}`);
}
if (missing.length) {
  console.log(`\n${missing.length} strings NOT in the spec and not ruled on:`);
  for (const [s, where] of missing) console.log(`  ✗ "${s}"  (${where})`);
  process.exit(1);
}
console.log('\nNo unruled strings. OK.');
