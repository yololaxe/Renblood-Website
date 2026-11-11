import test from 'node:test';
import assert from 'node:assert/strict';
import { makeReviewBackup, readReviewBackup, recoverReview, resolveReviewConflict, reviewPreviewPath, REVIEW_TTL } from './wikiReview.mjs';
import { createBookmarkStore, exportBookmarks, parseBookmarkImport, mergeBookmarkImport } from './wikiBookmarkStore.mjs';
import { BOOKMARK_KEY } from './wikiBookmarks.mjs';
const draft = (decisions = {}, revision = 0) => ({
  id: 'draft-1',
  baseVersion: 'public-1',
  revision,
  decisions,
  changes: ['a', 'b', 'c'].map(key => ({
    key
  }))
});
test('local reviews are bound to owner, environment, immutable base and expiry', () => {
  const current = draft(),
    now = Date.now();
  const text = JSON.stringify(makeReviewBackup(current, {
    a: 'accept'
  }, [], 'owner', 'staging', now));
  assert.ok(readReviewBackup(text, current, 'owner', 'staging', now));
  assert.equal(readReviewBackup(text, current, 'other', 'staging', now), null);
  assert.equal(readReviewBackup(text, current, 'owner', 'production', now), null);
  assert.equal(readReviewBackup(text, {
    ...current,
    baseVersion: 'other'
  }, 'owner', 'staging', now), null);
  assert.equal(readReviewBackup(text, current, 'owner', 'staging', now + REVIEW_TTL + 1), null);
  assert.equal(readReviewBackup('{bad', current, 'owner', 'staging', now), null);
});
test('same revision restores both selected and deliberately cleared choices without mutating shared state', () => {
  const current = draft({
    a: 'accept',
    b: 'keep'
  });
  const saved = makeReviewBackup(current, {
    b: 'keep',
    c: 'accept'
  }, [], 'owner', 'staging');
  const result = recoverReview(saved, current);
  assert.deepEqual(result.decisions, {
    b: 'keep',
    c: 'accept'
  });
  assert.deepEqual(result.conflicts, []);
  assert.deepEqual(current.decisions, {
    a: 'accept',
    b: 'keep'
  });
});
test('independent colleague choices and local choices can be recovered together', () => {
  const saved = makeReviewBackup(draft(), {
    a: 'accept'
  }, [], 'owner', 'staging');
  const result = recoverReview(saved, draft({
    b: 'keep'
  }, 1));
  assert.deepEqual(result.decisions, {
    a: 'accept',
    b: 'keep'
  });
  assert.deepEqual(result.conflicts, []);
  assert.ok(result.changedRevision);
});
test('opposing review choices remain conflicts until explicitly resolved', () => {
  const saved = makeReviewBackup(draft(), {
    a: 'accept'
  }, [], 'owner', 'staging');
  const result = recoverReview(saved, draft({
    a: 'keep'
  }, 1));
  assert.deepEqual(result.conflicts, [{
    key: 'a',
    local: 'accept',
    shared: 'keep'
  }]);
  assert.equal(result.decisions.a, 'keep');
  const resolved = resolveReviewConflict(result, 'a', 'accept');
  assert.equal(resolved.decisions.a, 'accept');
  assert.deepEqual(resolved.conflicts, []);
});
test('unresolved review conflicts survive saving a local copy and another shared revision', () => {
  const current = draft({
    a: 'keep'
  }, 1);
  const saved = makeReviewBackup(current, {
    a: 'keep'
  }, [{
    key: 'a',
    local: 'accept',
    shared: 'keep'
  }], 'owner', 'staging');
  assert.equal(recoverReview(saved, current).conflicts.length, 1);
  assert.equal(recoverReview(saved, draft({
    a: 'keep',
    b: 'accept'
  }, 2)).conflicts.length, 1);
  assert.equal(recoverReview(saved, draft({
    a: 'accept'
  }, 2)).conflicts.length, 0);
});
const item = (id, note = '') => ({
  path: `/histoires/personnages/P${String(id).padStart(4, '0')}`,
  label: `Personnage ${id}`,
  note,
  type: 'Personnage',
  addedAt: 1
});
test('preview starts at an accepted, existing changed file rather than the first registry person', () => {
  const review = {
    decisions: {
      a: 'keep',
      b: 'accept'
    },
    changes: [{
      key: 'a',
      collection: 'people',
      id: 'P0001'
    }, {
      key: 'b',
      collection: 'people',
      id: 'P0088'
    }]
  };
  const data = {
    registry: {
      people: [{
        id: 'P0001'
      }, {
        id: 'P0088'
      }]
    }
  };
  assert.equal(reviewPreviewPath(review, data), '/histoires/personnages/P0088');
  data.registry.people.pop();
  assert.equal(reviewPreviewPath(review, data), '/histoires/personnages');
});
test('bookmark export/import preserves accents and notes while retaining existing notes on duplicates', () => {
  const current = [item(1, 'À garder, même avec un époux différent.')];
  const imported = parseBookmarkImport(JSON.stringify(exportBookmarks([item(1, 'Autre note'), item(2, 'Préparer ma session')])));
  const result = mergeBookmarkImport(current, imported);
  assert.equal(result.additions, 1);
  assert.equal(result.duplicates, 1);
  assert.equal(result.differentNotes, 1);
  assert.equal(result.items[0].note, current[0].note);
  assert.equal(result.items[1].note, 'Préparer ma session');
});
test('invalid bookmark files and capacity overflow are rejected without dropping existing notes', () => {
  for (const data of [{
    format: 'other',
    version: 1,
    items: []
  }, {
    format: 'renblood-bookmarks',
    version: 1,
    items: [item(1), item(1)]
  }, {
    format: 'renblood-bookmarks',
    version: 1,
    items: [{
      ...item(1),
      path: 'https://example.com'
    }]
  }]) assert.throws(() => parseBookmarkImport(JSON.stringify(data)));
  const full = Array.from({
    length: 200
  }, (_, i) => item(i));
  assert.throws(() => mergeBookmarkImport(full, [item(999)]), /200/);
  assert.equal(full.length, 200);
});
function bookmarkFixture() {
  const values = new Map(),
    handlers = new Set();
  let fail = false,
    writes = 0;
  const store = createBookmarkStore({
    storage: () => ({
      getItem: key => {
        if (fail) throw Error('denied');
        return values.get(key) || null;
      },
      setItem: (key, value) => {
        if (fail) throw Error('denied');
        writes++;
        values.set(key, value);
      }
    }),
    events: () => ({
      addEventListener: (_name, fn) => handlers.add(fn),
      removeEventListener: (_name, fn) => handlers.delete(fn)
    })
  });
  return {
    store,
    values,
    handlers,
    fail: () => {
      fail = true;
    },
    writes: () => writes
  };
}
test('multiple bookmark subscribers share one storage listener and each receive a single notification', () => {
  const f = bookmarkFixture();
  const calls = [0, 0, 0];
  const unsubscribe = calls.map((_value, index) => f.store.subscribe(() => calls[index]++));
  assert.equal(f.handlers.size, 1);
  for (const handler of f.handlers) handler({
    key: BOOKMARK_KEY
  });
  assert.deepEqual(calls, [1, 1, 1]);
  unsubscribe[0]();
  assert.equal(f.handlers.size, 1);
  unsubscribe[1]();
  unsubscribe[2]();
  assert.equal(f.handlers.size, 0);
});
test('a storage read failure preserves the last valid bookmark view and prevents blind overwrite', () => {
  const f = bookmarkFixture();
  f.values.set(BOOKMARK_KEY, JSON.stringify([item(1, 'Ma note')]));
  assert.equal(f.store.read()[0].note, 'Ma note');
  f.fail();
  assert.equal(f.store.read()[0].note, 'Ma note');
  assert.throws(() => f.store.update({
    type: 'add',
    item: item(2)
  }), /lu/);
  assert.equal(f.writes(), 0);
});
test('an outdated note editor cannot overwrite a note saved in another tab', () => {
  const f = bookmarkFixture();
  f.values.set(BOOKMARK_KEY, JSON.stringify([item(1, 'Note du collègue')]));
  assert.throws(() => f.store.update({
    type: 'note',
    path: item(1).path,
    note: 'Mon brouillon',
    expectedNote: 'Ancienne note'
  }), /changé/);
  assert.equal(f.writes(), 0);
  assert.equal(f.store.read()[0].note, 'Note du collègue');
  f.store.update({
    type: 'note',
    path: item(1).path,
    note: 'Mon choix explicite',
    expectedNote: 'Note du collègue'
  });
  assert.equal(f.store.read()[0].note, 'Mon choix explicite');
});
