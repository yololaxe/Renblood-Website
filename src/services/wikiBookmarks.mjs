export const BOOKMARK_KEY = 'renblood:wiki:bookmarks:v1';
export function cleanBookmarks(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value.slice(0, 200).filter(item => {
    if (!item || typeof item.path !== 'string' || !/^\/histoires\/[a-z][a-z0-9/-]*(?:\?[^#]*)?(?:#[a-z0-9-]+)?$/i.test(item.path) || item.path.length > 500 || typeof item.label !== 'string' || !item.label.trim() || seen.has(item.path)) return false;
    seen.add(item.path);
    return true;
  }).map(item => ({
    path: item.path,
    label: item.label.slice(0, 180),
    type: String(item.type || 'Page').slice(0, 40),
    note: String(item.note || '').slice(0, 1000),
    addedAt: Number.isFinite(item.addedAt) ? item.addedAt : 0
  }));
}
export function updateBookmarks(items, action) {
  if (action.type === 'remove') return items.filter(item => item.path !== action.path);
  if (action.type === 'note') return items.map(item => item.path === action.path ? {
    ...item,
    note: String(action.note).slice(0, 1000)
  } : item);
  if (action.type === 'add' && !items.some(item => item.path === action.item.path)) return cleanBookmarks([{
    ...action.item,
    addedAt: Date.now(),
    note: ''
  }, ...items]);
  return items;
}
