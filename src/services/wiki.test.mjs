import test from 'node:test';
import assert from 'node:assert/strict';
import { registry, peopleById, relatives, kinshipLayout, findPerson, familyPeople, wikiSearchResults, personPath } from './wiki.mjs';
test('person records have stable unique identities and all published links resolve', () => {
  assert.equal(registry.people.length, 514);
  assert.equal(peopleById.size, 514);
  for (const relation of registry.relations) {
    assert.ok(peopleById.has(relation.a), relation.id);
    assert.ok(peopleById.has(relation.b), relation.id);
    assert.notEqual(relation.a, relation.b);
  }
  for (const person of registry.people) assert.ok(relatives(person.id, 'parents').length <= 2, person.id + ' has conflicting parents');
  assert.ok(registry.families.some(f => f.kind === 'secondary'));
});
test('Herbert and Dolores are navigable in both directions and their children retain both parents', () => {
  assert.ok(relatives('P0088', 'spouse').some(p => p.id === 'P0056'));
  assert.ok(relatives('P0056', 'spouse').some(p => p.id === 'P0088'));
  const children = relatives('P0088', 'children');
  assert.equal(children.length, 2);
  for (const child of children) {
    assert.ok(relatives(child.id, 'parents').some(p => p.id === 'P0056'));
    assert.ok(relatives(child.id, 'parents').some(p => p.id === 'P0088'));
  }
  assert.ok(kinshipLayout('P0056').nodes.some(node => node.person.houseId === 'wyne'));
});
test('homonymous people are not resolved from a name alone', () => {
  assert.equal(findPerson('Da'), null);
  assert.ok(peopleById.has('P0451'));
  assert.ok(peopleById.has('P0452'));
});
test('approved guild leaders, council categories and contested seats are explicit', () => {
  assert.equal(registry.guilds.find(g => g.id === 'guilde-des-artisans').leaderId, 'P0075');
  assert.equal(registry.guilds.find(g => g.id === 'guilde-de-la-lettre').leaderId, 'P0102');
  assert.equal(registry.guilds.find(g => g.id === 'guilde-de-la-table').leaderId, 'P0106');
  assert.equal(registry.seats.length, 13);
  for (const [category, count] of [['marquisates', 6], ['cities', 5], ['peoples', 2]]) assert.equal(registry.seats.filter(s => s.category === category).length, count);
  assert.equal(registry.seats.filter(s => s.state === 'contested').length, 2);
  assert.equal(registry.seats.filter(s => s.state === 'deceased').length, 1);
  assert.equal(peopleById.get('P0514').vital, 'dead');
  assert.equal(registry.locations.find(p => p.name === 'Valentine').type, 'Grande-Ville');
});
test('unapproved family resources stay at the existing public values', () => {
  const chalk = registry.families.find(f => f.id === 'chalk');
  assert.equal(chalk.resources.horses, 150);
  assert.equal(chalk.resources.mages, 110);
  const feran = registry.families.find(f => f.id === 'feran');
  assert.equal(feran.resources.buildings, 40);
  assert.equal(feran.resources.ships, 80);
});
test('unassigned secondary people get no invented family and tree size is bounded', () => {
  assert.equal(peopleById.get('P0159').familyId, null);
  const layout = kinshipLayout('P0088', 3, 12);
  assert.ok(layout.nodes.length <= 12);
  assert.equal(new Set(layout.nodes.map(n => n.id)).size, layout.nodes.length);
  for (const node of layout.nodes) {
    assert.ok(Number.isFinite(node.x));
    assert.ok(Number.isFinite(node.y));
    assert.ok(node.x >= 0);
    assert.ok(node.y >= 0);
  }
  assert.deepEqual(kinshipLayout('absent').nodes, []);
});
test('published books contain source chapter counts and search points to individual passages', () => {
  const chronicle = registry.books.find(b => b.id === '1'),
    knowledge = registry.books.find(b => b.id === '2');
  assert.equal(chronicle.chapters.length, 3);
  assert.equal(chronicle.chapters.flatMap(c => c.sections).length, 15);
  assert.equal(knowledge.chapters.length, 4);
  assert.equal(knowledge.chapters.flatMap(c => c.sections).length, 17);
  assert.ok(wikiSearchResults.some(r => r.path === personPath('P0056')));
  assert.ok(wikiSearchResults.some(r => r.label.includes('Haguersier') && r.path.includes('#section-')));
});
test('Sand is a patronymic rather than a shared family, and confirmed offices remain consistent', () => {
  assert.ok(!registry.families.some(f => f.name.toLowerCase() === 'sand'));
  const carriers = registry.people.filter(p => p.lineage === 'sand');
  assert.ok(carriers.length > 0);
  assert.ok(carriers.every(p => !p.familyId));
  assert.equal(peopleById.get('P0119').occupation.trim(), 'Maréchal des armées');
  assert.equal(registry.government.find(e => e.personId === 'P0119').office, 'Maréchal des armées');
  assert.ok(peopleById.get('P0106').publicOffice.includes('Consul'));
});
