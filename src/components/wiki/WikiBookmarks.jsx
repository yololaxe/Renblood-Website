import { useSyncExternalStore, useState } from 'react';
import { BOOKMARK_KEY, cleanBookmarks, updateBookmarks } from '../../services/wikiBookmarks.mjs';
const empty = [];
let cachedRaw,
  snapshot = empty;
const listeners = new Set();
function read() {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      snapshot = cleanBookmarks(JSON.parse(raw || '[]'));
    }
  } catch {
    snapshot = empty;
  }
  return snapshot;
}
const emit = () => listeners.forEach(listener => listener());
const subscribe = callback => {
  listeners.add(callback);
  const sync = event => {
    if (event.key === BOOKMARK_KEY || event.key === null) emit();
  };
  window.addEventListener('storage', sync);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', sync);
  };
};
export function useBookmarks() {
  const items = useSyncExternalStore(subscribe, read, () => empty);
  const [error, setError] = useState('');
  function update(action) {
    if (action.type === 'add' && read().length >= 200 && !read().some(item => item.path === action.item.path)) {
      setError('Votre carnet contient 200 repères. Retirez-en un pour garder cette page.');
      return false;
    }
    try {
      localStorage.setItem(BOOKMARK_KEY, JSON.stringify(updateBookmarks(read(), action)));
      setError('');
      emit();
      return true;
    } catch {
      setError('Le navigateur ne permet pas d’enregistrer ce repère.');
      return false;
    }
  }
  return {
    items,
    update,
    error
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
