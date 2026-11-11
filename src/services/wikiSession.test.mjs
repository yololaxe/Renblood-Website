import test from 'node:test';
import assert from 'node:assert/strict';
import { createWikiSession } from './wikiSession.mjs';
import { registry, peopleById, applyWikiPackage, builtInWikiPackage, getWikiRevision, subscribeWiki } from './wiki.mjs';
const packet = version => ({
  registry: {
    version
  }
});
function fixture(options = {}) {
  let version = 'public-1';
  const applied = [],
    saved = new Map();
  const session = createWikiSession({
    initial: packet(version),
    apply: value => {
      version = value.registry.version;
      applied.push(version);
    },
    getVersion: () => version,
    validate: value => {
      if (value.bad) throw Error('Invalid response');
      return structuredClone(value);
    },
    loadPublic: async () => packet('public-2'),
    loadPreview: async () => packet('private'),
    storage: () => ({
      getItem: key => saved.get(key),
      setItem: (key, value) => saved.set(key, value),
      removeItem: key => saved.delete(key)
    }),
    ...options
  });
  return {
    session,
    applied,
    saved,
    version: () => version
  };
}
test('blocked session storage cannot strand or prevent a working private preview', async () => {
  const f = fixture({
    storage: () => {
      throw Error('Storage denied');
    },
    loadPublic: async () => {
      throw Error('Offline');
    }
  });
  f.session.begin(packet('private'), 'draft');
  assert.equal(f.version(), 'private');
  assert.equal(f.session.snapshot().previewId, 'draft');
  assert.ok(f.session.snapshot().warning);
  await assert.rejects(f.session.end(), /Offline/);
  assert.equal(f.version(), 'public-1');
  assert.equal(f.session.snapshot().previewId, null);
});
test('an invalid public response never poisons the package restored on preview exit', async () => {
  const f = fixture({
    loadPublic: async () => ({
      bad: true
    })
  });
  await assert.rejects(f.session.refresh());
  f.session.begin(packet('private'), 'draft');
  await f.session.end({
    reload: false
  });
  assert.equal(f.version(), 'public-1');
});
test('a slow preview response cannot reopen a preview after exit or logout', async () => {
  let finish;
  const f = fixture({
    loadPreview: () => new Promise(resolve => {
      finish = resolve;
    })
  });
  f.saved.set('renblood:wiki:preview', 'draft');
  const restoring = f.session.resume();
  f.session.cancelResume();
  await f.session.end({
    reload: false
  });
  finish(packet('private'));
  await restoring;
  assert.equal(f.version(), 'public-1');
  assert.equal(f.session.snapshot().previewId, null);
});
test('public fetches are deduplicated and do not clobber a preview; exit requests a fresh version', async () => {
  let finish,
    requests = 0;
  const f = fixture({
    loadPublic: () => ++requests === 1 ? new Promise(resolve => {
      finish = resolve;
    }) : Promise.resolve(packet('public-3'))
  });
  const a = f.session.refresh(),
    b = f.session.refresh();
  await Promise.resolve();
  f.session.begin(packet('private'), 'draft');
  finish(packet('public-2'));
  await Promise.all([a, b]);
  assert.equal(requests, 1);
  assert.equal(f.version(), 'private');
  await f.session.end();
  assert.equal(requests, 2);
  assert.equal(f.version(), 'public-3');
});
test('corrupt snapshots leave the previous registry, indexes and subscribers untouched', () => {
  const previous = registry,
    name = peopleById.get('P0088').name,
    revision = getWikiRevision();
  let notified = 0;
  const unsubscribe = subscribeWiki(() => notified++);
  try {
    for (const mutate of [value => {
      value.registry.people[0].aliases = null;
    }, value => {
      value.books[0].chapters = null;
    }, value => {
      value.registry.people.push(value.registry.people[0]);
    }]) {
      const corrupt = structuredClone(builtInWikiPackage);
      corrupt.registry.version += '-corrupt';
      mutate(corrupt);
      assert.throws(() => applyWikiPackage(corrupt));
      assert.equal(registry, previous);
      assert.equal(peopleById.get('P0088').name, name);
      assert.equal(getWikiRevision(), revision);
    }
    assert.equal(notified, 0);
  } finally {
    unsubscribe();
  }
});
