/**
 * Translation coverage report.
 *
 * Run with: node scripts/i18n-coverage.mjs
 *
 * Loads the base dictionaries and every workspace module directly (explicit .js
 * specifiers, because this script runs outside the bundler) and reports, per
 * language, how many keys exist and which English keys have no translation.
 * Exit code is 1 when a language is incomplete, so it can gate a build.
 */
import en from '../src/i18n/dictionaries/en.js';
import ru from '../src/i18n/dictionaries/ru.js';
import fr from '../src/i18n/dictionaries/fr.js';
import zhCN from '../src/i18n/dictionaries/zh-CN.js';
import ar from '../src/i18n/dictionaries/ar.js';
import { student } from '../src/i18n/dictionaries/modules/student.js';

const base = { en, ru, fr, 'zh-CN': zhCN, ar };
const packs = [student];

const flat = (node, prefix = '') =>
  Object.entries(node).flatMap(([key, value]) =>
    value && typeof value === 'object' ? flat(value, `${prefix}${key}.`) : [`${prefix}${key}`]
  );

const merged = Object.fromEntries(
  Object.keys(base).map((language) => [
    language,
    packs.reduce((acc, pack) => ({ ...acc, ...(pack[language] || pack.en) }), base[language]),
  ])
);

const keys = Object.fromEntries(
  Object.entries(merged).map(([language, dictionary]) => [language, new Set(flat(dictionary))])
);

const reference = keys.en;
let incomplete = 0;

for (const [language, set] of Object.entries(keys)) {
  const missing = [...reference].filter((key) => !set.has(key));
  const extra = [...set].filter((key) => !reference.has(key));
  const coverage = (((reference.size - missing.length) / reference.size) * 100).toFixed(1);
  if (missing.length || extra.length) incomplete += 1;
  console.log(
    `${language.padEnd(6)} keys ${String(set.size).padStart(4)}  coverage ${coverage.padStart(6)}%  missing ${String(
      missing.length
    ).padStart(3)}  extra ${extra.length}`
  );
  if (missing.length) console.log(`       missing: ${missing.slice(0, 12).join(', ')}${missing.length > 12 ? ' …' : ''}`);
}

process.exit(incomplete ? 1 : 0);