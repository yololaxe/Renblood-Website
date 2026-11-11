import { BOOKMARK_KEY, cleanBookmarks, updateBookmarks } from './wikiBookmarks.mjs';
const EMPTY = [];
export function createBookmarkStore({
  storage,
  events
}) {
  let raw,
    snapshot = EMPTY,
    readFailed = false;
  const listeners = new Set();
  const emit = () => listeners.forEach(listener => listener());
  function read() {
    try {
      const next = storage().getItem(BOOKMARK_KEY);
      if (next !== raw) {
        const parsed = cleanBookmarks(JSON.parse(next || '[]'));
        raw = next;
        snapshot = parsed;
      }
      readFailed = false;
    } catch {
      readFailed = true;
    }
    return snapshot;
  }
  const sync = event => {
    if (event.key === BOOKMARK_KEY || event.key === null) emit();
  };
  return {
    read,
    subscribe(callback) {
      if (!listeners.size) events().addEventListener('storage', sync);
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
        if (!listeners.size) events().removeEventListener('storage', sync);
      };
    },
    update(action) {
      const current = read();
      if (readFailed) throw Error('Le carnet n’a pas pu être lu. Aucun repère n’a été remplacé ; vérifiez le stockage du navigateur.');
      if (action.type === 'note') {
        const item = current.find(item => item.path === action.path);
        if (!item) throw Error('Ce repère a été retiré dans un autre onglet.');
        if (Object.hasOwn(action, 'expectedNote') && item.note !== action.expectedNote) throw Error('Cette note a changé dans un autre onglet. Comparez les versions avant de l’enregistrer.');
      }
      if (action.type === 'add' && current.length >= 200 && !current.some(item => item.path === action.item.path)) throw Error('Votre carnet contient 200 repères. Retirez-en un pour garder cette page.');
      const next = action.type === 'merge' ? mergeBookmarkImport(current, parseBookmarkImport(JSON.stringify({
        format: 'renblood-bookmarks',
        version: 1,
        items: action.items
      }))).items : updateBookmarks(current, action);
      try {
        storage().setItem(BOOKMARK_KEY, JSON.stringify(next));
      } catch {
        throw Error('Le navigateur ne permet pas d’enregistrer ce repère.');
      }
      emit();
      return next;
    }
  };
}
export function exportBookmarks(items, now = Date.now()) {
  return {
    format: 'renblood-bookmarks',
    version: 1,
    exportedAt: new Date(now).toISOString(),
    items: cleanBookmarks(items)
  };
}
export function parseBookmarkImport(text) {
  if (typeof text !== 'string' || text.length > 1024 * 1024) throw Error('Le fichier dépasse 1 Mo.');
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw Error('Ce fichier n’est pas un JSON valide.');
  }
  if (data?.format !== 'renblood-bookmarks' || data.version !== 1 || !Array.isArray(data.items) || data.items.length > 200) throw Error('Ce fichier n’est pas un export de repères Renblood (200 maximum).');
  const clean = cleanBookmarks(data.items);
  if (clean.length !== data.items.length || data.items.some(item => typeof item.note !== 'string' || item.note.length > 1000 || item.label.length > 180 || typeof item.type !== 'string' || item.type.length > 40 || !Number.isFinite(item.addedAt))) throw Error('Le fichier contient des repères invalides, des doublons ou des notes trop longues. Aucun repère n’a été modifié.');
  return clean;
}
export function mergeBookmarkImport(current, incoming) {
  const known = new Map(current.map(item => [item.path, item]));
  const additions = incoming.filter(item => !known.has(item.path));
  const differentNotes = incoming.filter(item => known.has(item.path) && known.get(item.path).note !== item.note).length;
  if (current.length + additions.length > 200) throw Error(`Cet import dépasserait la limite de 200 repères. Libérez ${current.length + additions.length - 200} place(s), puis réessayez.`);
  return {
    items: [...current, ...additions],
    additions: additions.length,
    duplicates: incoming.length - additions.length,
    differentNotes
  };
}
