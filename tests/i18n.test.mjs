import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const localesDir = path.join(root, 'locales');

const LOCALES = ['ko', 'en', 'ja', 'zh'];

function loadLocale(name) {
  return JSON.parse(readFileSync(path.join(localesDir, `${name}.json`), 'utf8'));
}

const BANNED_KO_ENGLISH_UI = [
  'VIEW EVENT',
  'READ STORY',
  'FULL RANKING',
  'FEATURED EVENTS',
  'ABOUT KSOP',
  'COMING SOON',
  'THE TABLE IS SET',
  'SEE YOU AT THE FELT',
  'View event',
  'Read story',
  'Full ranking',
  'View events',
  'All news',
];

const CANONICAL_EVENT_NAMES = [
  'MAIN EVENT',
  'HIGH ROLLER',
  'SUPER HIGH ROLLER',
  'MYSTERY BOUNTY',
  'KICK-OFF',
  'CLOSING EVENT',
];

function collectKeys(value, prefix = '') {
  const keys = [];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of Object.keys(value)) {
      const full = prefix ? `${prefix}.${key}` : key;
      keys.push(full);
      keys.push(...collectKeys(value[key], full));
    }
  }
  return keys;
}

describe('locale JSON structure', () => {
  it('all four locale files exist', () => {
    const files = readdirSync(localesDir);
    for (const name of LOCALES) {
      assert.ok(files.includes(`${name}.json`), `missing locales/${name}.json`);
    }
  });

  it('EN/JA/ZH expose the same top-level keys as KO (switchable)', () => {
    const koKeys = Object.keys(loadLocale('ko')).sort();
    for (const name of ['en', 'ja', 'zh']) {
      assert.deepEqual(Object.keys(loadLocale(name)).sort(), koKeys, `${name}.json key mismatch`);
    }
  });
});

describe('KO UI is Korean except canonical event names', () => {
  it('contains none of the leftover English UI strings', () => {
    const raw = readFileSync(path.join(localesDir, 'ko.json'), 'utf8');
    for (const banned of BANNED_KO_ENGLISH_UI) {
      assert.ok(!raw.includes(banned), `ko.json contains leftover English UI string: ${banned}`);
    }
  });
});

describe('event names are proper nouns, never translation keys', () => {
  it('canonical names appear as neither keys nor values in any locale', () => {
    for (const name of LOCALES) {
      const data = loadLocale(name);
      const raw = JSON.stringify(data);
      const keys = collectKeys(data);
      for (const eventName of CANONICAL_EVENT_NAMES) {
        assert.ok(
          !keys.some((k) => k.toLowerCase().includes(eventName.toLowerCase().replace(/[\s-]/g, ''))),
          `${name}.json has event-name translation key for ${eventName}`,
        );
        assert.ok(!raw.includes(`"${eventName}"`), `${name}.json contains canonical name ${eventName}`);
      }
      assert.ok(!('events' in data) || typeof data.events !== 'object', `${name}.json must not nest event names`);
    }
  });

  it('constants/events.ts is the single source and matches the expected set', () => {
    const source = readFileSync(path.join(root, 'constants', 'events.ts'), 'utf8');
    for (const eventName of CANONICAL_EVENT_NAMES) {
      assert.ok(source.includes(eventName), `constants/events.ts missing ${eventName}`);
    }
  });
});

describe('language switcher', () => {
  const provider = readFileSync(
    path.join(root, 'components', 'site', 'site-provider.tsx'),
    'utf8',
  );

  it('changes language without reload', () => {
    assert.ok(!provider.includes('location.reload'), 'switcher must not reload the page');
    assert.ok(provider.includes('useState'), 'switcher uses instant state');
  });

  it('persists to localStorage and restores on load', () => {
    assert.ok(provider.includes('ksop-locale'), 'missing ksop-locale storage key');
    assert.ok(provider.includes('localStorage.setItem'), 'missing localStorage write');
    assert.ok(provider.includes('localStorage.getItem'), 'missing localStorage read');
  });

  it('has one central provider', () => {
    assert.ok(provider.includes('SiteProvider'), 'missing central SiteProvider');
    assert.ok(provider.includes('setLanguage'), 'missing setLanguage');
  });
});
