import { useSyncExternalStore, useState } from 'react';
import { createBookmarkStore } from '../../services/wikiBookmarkStore.mjs';
const empty = [];
const store = createBookmarkStore({
  storage: () => localStorage,
  events: () => window
});
export function useBookmarks() {
  const items = useSyncExternalStore(store.subscribe, store.read, () => empty);
  const [error, setError] = useState('');
  function update(action) {
    try {
      store.update(action);
      setError('');
      return true;
    } catch (failure) {
      setError(failure.message || 'Le navigateur ne permet pas d’enregistrer ce repère.');
      return false;
    }
  }
  return {
    items,
    update,
    error,
    clearError: () => setError('')
  };
}
export function BookmarkButton({
  path,
  label,
  type = 'Page',
  compact = false
}) {
  const {
    items,
    update,
    error
  } = useBookmarks();
  const saved = items.some(item => item.path === path);
  return <span className="wiki-bookmark-control"><button type="button" className="wiki-save" aria-label={`${saved ? 'Retirer des' : 'Ajouter aux'} repères : ${label}`} aria-pressed={saved} onClick={() => update(saved ? {
      type: 'remove',
      path
    } : {
      type: 'add',
      item: {
        path,
        label,
        type
      }
    })}><span aria-hidden="true">{saved ? '◆' : '◇'}</span>{compact ? saved ? 'Enregistré' : 'Garder ce passage' : saved ? 'Dans mes repères' : 'Garder ce repère'}</button>{error && <small role="status">{error}</small>}</span>;
}
