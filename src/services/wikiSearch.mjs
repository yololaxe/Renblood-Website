const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').replace(/[^a-z0-9]+/g, ' ').trim();
// Bounded Damerau-Levenshtein: a transposition counts as one typo.
export function editDistance(a, b, limit = 2) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let older,
    previous = Array.from({
      length: b.length + 1
    }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (older && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) row[j] = Math.min(row[j], older[j - 2] + 1);
    }
    older = previous;
    previous = row;
  }
  return previous[b.length];
}
const index = new WeakMap();
function entry(result) {
  if (index.has(result)) return index.get(result);
  const label = normalize(result.label),
    aliases = (Array.isArray(result.aliases) ? result.aliases : []).map(normalize);
  const names = [label, ...aliases],
    detail = normalize(`${result.description || ''} ${result.keywords || ''} ${result.type || ''}`);
  const value = {
    label,
    names,
    detail,
    words: [...new Set(names.join(' ').split(' '))].filter(Boolean)
  };
  index.set(result, value);
  return value;
}
export function searchWiki(catalog, query, limit = 20) {
  const needle = normalize(query).slice(0, 120);
  if (!needle) return catalog.slice(0, limit);
  const tokens = needle.split(' ').slice(0, 8),
    ranked = [];
  for (const result of catalog) {
    const item = entry(result);
    let score = item.label === needle ? 1000 : item.names.includes(needle) ? 950 : item.label.startsWith(needle) ? 850 : item.label.includes(needle) ? 800 : item.names.some(n => n.includes(needle)) ? 750 : 0;
    let approximate = false;
    if (!score) {
      let matched = 0,
        penalty = 0;
      for (const token of tokens) {
        if (item.words.includes(token)) {
          matched++;
          continue;
        }
        if (item.words.some(word => word.startsWith(token))) {
          matched++;
          penalty += 3;
          continue;
        }
        if (token.length >= 4) {
          const tolerance = token.length >= 8 ? 2 : 1;
          const distance = Math.min(...item.words.map(word => editDistance(token, word, tolerance)));
          if (distance <= tolerance) {
            matched++;
            penalty += 10 * distance;
            approximate = true;
            continue;
          }
        }
        if (item.detail.includes(token)) {
          matched++;
          penalty += 35;
        }
      }
      if (matched === tokens.length) score = 600 - penalty;
    }
    if (score) ranked.push({
      ...result,
      approximate,
      score
    });
  }
  const seen = new Set();
  return ranked.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label, 'fr')).filter(result => {
    if (seen.has(result.path)) return false;
    seen.add(result.path);
    return true;
  }).slice(0, limit);
}
