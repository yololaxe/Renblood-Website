import test from 'node:test';
import assert from 'node:assert/strict';
import { compileWiki } from './compile.mjs';
function fixture() {
  const person = (id, name) => {
    const row = [];
    row[0] = id;
    row[2] = name;
    row[40] = 'SECRET_SENTINEL';
    row[68] = 'AUTHOR_NOTE_SENTINEL';
    row[48] = 'Biographie publique';
    return row;
  };
  const a = person('P9001', 'Alice Exemple'),
    b = person('P9002', 'Basile Exemple');
  const sheet = (name, values) => ({
    sheet: name,
    values
  });
  const council = Array.from({
    length: 33
  }, () => []);
  for (let i = 20; i < 33; i++) {
    council[i][10] = 'Magistrat - Exemple ' + i;
    council[i][12] = 'Alice Exemple';
  }
  const snapshot = {
    asOf: '2026-11-10',
    reads: [sheet('PERSONNAGES', [a, b]), sheet('RELATIONS', [[], [], [], [], ['P9001', 'Alice', 'P9002', 'Basile', 'Époux/épouse', '', '', 'Public'], ['P9001', 'Alice', 'P9002', 'Basile', 'Parent / enfant', '', '', 'Staff']]), sheet('Personnages secondaires importants', [[], [], [], []]), sheet('GUILDES', [[], [], [], []]), sheet('CHRONOLOGIE', [[], [], [], [], ['P9001', 'Alice', '334', 'Événement public', 'RP', '', '', 'Public'], ['P9001', 'Alice', '335', 'EVENT_SECRET_SENTINEL', 'RP', '', '', 'MJ']]), sheet('Conseil Royale', council), sheet('Livres', [])]
  };
  const baseline = {
    people: {},
    families: [],
    trees: {},
    locations: {},
    guilds: [],
    roles: []
  };
  return {
    snapshot,
    baseline
  };
}
test('compiler uses a strict public whitelist and excludes private relations and events', () => {
  const {
    snapshot,
    baseline
  } = fixture();
  const {
    registry
  } = compileWiki(snapshot, baseline);
  assert.equal(registry.events.length, 1);
  assert.equal(registry.relations.length, 1);
  assert.equal(registry.people[0].vital, 'unknown');
  assert.equal(registry.people[0].birth, null);
  assert.ok(!JSON.stringify(registry).includes('SENTINEL'));
});
test('compiler refuses duplicate identities, dangling relations and ancestry cycles', () => {
  const {
    snapshot,
    baseline
  } = fixture();
  snapshot.reads[0].values.push(snapshot.reads[0].values[0]);
  assert.throws(() => compileWiki(snapshot, baseline), /double/);
  snapshot.reads[0].values.pop();
  snapshot.reads[1].values[4][2] = 'P9999';
  assert.throws(() => compileWiki(snapshot, baseline), /orphelin/);
  snapshot.reads[1].values.splice(4, 2, ['P9001', '', 'P9002', '', 'Parent / enfant'], ['P9002', '', 'P9001', '', 'Parent / enfant']);
  assert.throws(() => compileWiki(snapshot, baseline), /Boucle/);
});
