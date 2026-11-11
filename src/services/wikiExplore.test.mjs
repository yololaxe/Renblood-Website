import test from 'node:test';
import assert from 'node:assert/strict';
import { registry, books, kinshipLayout, applyWikiPackage, peopleById, wikiSearchResults, builtInWikiPackage } from './wiki.mjs';
import { searchWiki, editDistance } from './wikiSearch.mjs';
import { yearRange, chronology, enrichChronology, familyConnection } from './wikiExplore.mjs';
import { cleanBookmarks, updateBookmarks } from './wikiBookmarks.mjs';
test('search tolerates accents and one typo/transposition while exact identities rank first', () => {
  assert.equal(editDistance('roxton', 'roxotn'), 1);
  const rows = [{
    label: 'Herbert Rollingford',
    path: '/herbert',
    aliases: ['Le vieil Herbert']
  }, {
    label: 'Herbert Lynster',
    path: '/other'
  }];
  assert.equal(searchWiki(rows, 'Herbert Rolingford')[0].path, '/herbert');
  assert.equal(searchWiki(rows, 'Le vieil Herbert')[0].path, '/herbert');
  assert.equal(searchWiki(rows, 'Herbert Lynster')[0].path, '/other');
  assert.equal(searchWiki(rows, 'zzz').length, 0);
  assert.equal(searchWiki([{
    label: 'Épée royale',
    path: '/sword'
  }], 'epee')[0].path, '/sword');
  assert.ok(searchWiki(wikiSearchResults, 'Dolroes Wyne').some(row => row.path.endsWith('P0056')));
});
test('chronology separates ages and spreadsheet serials from explicit kingdom years', () => {
  assert.equal(yearRange('45143.0'), null);
  assert.equal(yearRange('8-15'), null);
  assert.deepEqual(yearRange('Année 225-236 | La Conquête'), {
    start: 225,
    end: 236
  });
  assert.deepEqual(yearRange('Année 0 | Début'), {
    start: 0,
    end: 0
  });
  const data = chronology();
  assert.equal(data.dated.filter(item => item.kind === 'chronicle').length, 15);
  assert.equal(data.personal.length, registry.events.length);
  assert.ok(data.dated.every(item => item.start < 10000));
  const enriched = enrichChronology(data.dated, books);
  assert.ok(enriched.some(item => item.familyIds.includes('roxton')));
  assert.ok(enriched.every(item => item.path.includes('#section-')));
});
test('family route follows documented unions and directional parent links without inventing links', () => {
  const route = familyConnection('P0088', 'P0056');
  assert.deepEqual(route.ids, ['P0088', 'P0056']);
  assert.deepEqual(route.steps, ['union']);
  assert.equal(familyConnection('missing', 'P0056'), null);
  const data = [{
    id: 'p',
    a: 'parent',
    b: 'child',
    type: 'parent'
  }, {
    id: 'm',
    a: 'parent',
    b: 'spouse',
    type: 'spouse'
  }];
  assert.deepEqual(familyConnection('child', 'spouse', data).steps, ['parent', 'union']);
  const layout = kinshipLayout('P0088', 1, 64, familyConnection('P0088', 'P0091').ids);
  assert.ok(layout.nodes.some(node => node.id === 'P0091'));
});
test('bookmarks reject external paths, deduplicate, keep notes and remove deterministically', () => {
  const path = '/histoires/personnages/P0088';
  let items = updateBookmarks([], {
    type: 'add',
    item: {
      path,
      label: 'Herbert',
      type: 'Personnage'
    }
  });
  items = updateBookmarks(items, {
    type: 'add',
    item: {
      path,
      label: 'Duplicate'
    }
  });
  assert.equal(items.length, 1);
  items = updateBookmarks(items, {
    type: 'note',
    path,
    note: 'À consulter avant la session'
  });
  assert.match(items[0].note, /session/);
  assert.equal(cleanBookmarks([{
    path: 'javascript:alert(1)',
    label: 'x'
  }, ...items]).length, 1);
  assert.equal(updateBookmarks(items, {
    type: 'remove',
    path
  }).length, 0);
});
test('published package refresh rebuilds entity, alias, family and search indexes together', () => {
  const next = structuredClone(builtInWikiPackage);
  const person = next.registry.people.find(p => p.id === 'P0088');
  person.name = 'Herbert de recette';
  person.aliases.push('Ancien nom de recette');
  next.registry.version += '-recette';
  try {
    applyWikiPackage(next);
    assert.equal(peopleById.get('P0088').name, 'Herbert de recette');
    assert.equal(searchWiki(wikiSearchResults, 'Ancien nom de recette')[0].path, '/histoires/personnages/P0088');
  } finally {
    applyWikiPackage(builtInWikiPackage);
  }
});
