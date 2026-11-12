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
import { assessment } from '../src/i18n/dictionaries/modules/assessment.js';
import { studyGroups } from '../src/i18n/dictionaries/modules/studyGroups.js';
import { integrity } from '../src/i18n/dictionaries/modules/integrity.js';
import { intel } from '../src/i18n/dictionaries/modules/intel.js';
import { office } from '../src/i18n/dictionaries/modules/office.js';

const rootPacks = [integrity, intel, office];

const base = { en, ru, fr, 'zh-CN': zhCN, ar };
const packs = [student, assessment, studyGroups];

const flat = (node, prefix = '') =>
  Object.entries(node).flatMap(([key, value]) =>
    value && typeof value === 'object' ? flat(value, `${prefix}${key}.`) : [`${prefix}${key}`]
  );

const merged = Object.fromEntries(
  Object.keys(base).map((language) => {
    // Workspace packs are nested under `student` exactly as the runtime does it,
    // so the reported key paths are the ones the application actually resolves.
    const withPacks = packs.reduce(
      (acc, pack) => ({ ...acc, student: { ...(acc.student || {}), ...(pack[language] || pack.en) } }),
      base[language]
    );
    // Shared packs keep their own root namespace, exactly as modules/index.js does.
    const withRootPacks = rootPacks.reduce(
      (acc, pack) => ({ ...acc, ...(pack[language] || pack.en) }),
      withPacks
    );
    return [language, withRootPacks];
  })
);

const keys = Object.fromEntries(
  Object.entries(merged).map(([language, dictionary]) => [language, new Set(flat(dictionary))])
);

// Values, so placeholders can be compared key by key.
const values = Object.fromEntries(
  Object.entries(merged).map(([language, dictionary]) => {
    const map = new Map();
    const walk = (node, prefix = '') => {
      Object.entries(node).forEach(([key, value]) => {
        if (value && typeof value === 'object') walk(value, `${prefix}${key}.`);
        else map.set(`${prefix}${key}`, String(value));
      });
    };
    walk(dictionary);
    return [language, map];
  })
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

// Interpolation integrity: every translation must carry exactly the
// placeholders its English original has, so no value can silently drop out.
const tokens = (value) => [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(',');
let interpolationIssues = 0;
for (const key of reference) {
  const expected = tokens(values.en.get(key) || '');
  for (const language of Object.keys(keys)) {
    const actual = tokens(values[language].get(key) || '');
    if (actual !== expected) {
      interpolationIssues += 1;
      console.log(`  placeholder mismatch ${language} ${key}: expected {${expected}} got {${actual}}`);
    }
  }
}
console.log(`interpolation: ${interpolationIssues ? `${interpolationIssues} mismatch(es)` : 'all placeholders aligned'}`);

// Coverage per surface, so each workspace can be reported on its own.
const groups = [
  ['shared shell / auth / account', (key) => !/^(student|integrity|intel|office)\./.test(key)],
  ['academic integrity workspace', (key) => key.startsWith('integrity.')],
  ['academic intelligence panels', (key) => key.startsWith('intel.')],
  ['student office screens', (key) => key.startsWith('office.')],
  ['student dashboard & courses', (key) => key.startsWith('student.') && !/^student\.(quizzes|grades|attendance)\./.test(key)],
  ['student quizzes', (key) => key.startsWith('student.quizzes.')],
  ['student grades & transcript', (key) => key.startsWith('student.grades.')],
  ['student attendance', (key) => key.startsWith('student.attendance.')],
];
for (const [label, test] of groups) {
  const inGroup = [...reference].filter(test);
  const translated = inGroup.filter((key) => Object.keys(keys).every((language) => keys[language].has(key)));
  console.log(`  ${label.padEnd(30)} ${String(inGroup.length).padStart(3)} keys  ${((translated.length / inGroup.length) * 100).toFixed(1)}%`);
}

process.exit(incomplete || interpolationIssues ? 1 : 0);