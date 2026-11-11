import { registry, normalize, personPath, findLocation } from './wiki.mjs';
export function yearRange(value) {
  const match = /^\s*(?:Année?s?|An|Vers)\s+(-?\d{1,4})(?:\s*[-–à]\s*(\d{1,4}))?(?:\s*[|:]|\s*$)/i.exec(String(value || ''));
  return match ? {
    start: Number(match[1]),
    end: Number(match[2] || match[1])
  } : null;
}
function mentions(text, items, name = item => item.name) {
  const value = ' ' + normalize(text) + ' ';
  return items.filter(item => (' ' + normalize(name(item)) + ' ').length > 4 && value.includes(' ' + normalize(name(item)) + ' ')).map(item => item.id);
}
export function chronology(data = registry) {
  const dated = [],
    personal = [];
  for (const book of data.books) for (const chapter of book.chapters) for (const section of chapter.sections) {
    const dates = yearRange(section.title);
    if (!dates) continue;
    dated.push({
      id: `book-${book.id}-${chapter.id}-${section.id}`,
      ...dates,
      title: section.title.replace(/^Année?s?\s+-?\d+(?:\s*[-–à]\s*\d+)?\s*[|:]?\s*/i, ''),
      description: `${book.title} · ${chapter.title}`,
      kind: 'chronicle',
      familyIds: [],
      personIds: [],
      locationIds: [],
      path: `/histoires/livres/${book.id}/chapitre/${chapter.id}#section-${section.id}`
    });
  }
  for (const event of data.events) {
    const person = data.people.find(p => p.id === event.personId);
    if (!person) continue;
    const dates = yearRange(event.period);
    const item = {
      id: event.id,
      title: event.text,
      description: person.name,
      kind: 'personal',
      personIds: [person.id],
      familyIds: [person.familyId, person.houseId].filter(Boolean),
      locationIds: [findLocation(person.location)?.id].filter(Boolean),
      path: personPath(person.id),
      period: event.period
    };
    dates ? dated.push({
      ...item,
      ...dates
    }) : personal.push(item);
  }
  return {
    dated: dated.sort((a, b) => a.start - b.start || a.id.localeCompare(b.id)),
    personal
  };
}
export function enrichChronology(items, books, data = registry) {
  return items.map(item => {
    if (item.kind !== 'chronicle') return item;
    const [, bookId, chapterId, sectionId] = item.id.split('-');
    const section = books.find(b => b.id === bookId)?.chapters.find(c => c.id === chapterId)?.sections.find(s => s.id === sectionId);
    const text = [item.title, ...(section?.paragraphs || [])].join(' ');
    return {
      ...item,
      excerpt: section?.paragraphs[0] || '',
      familyIds: mentions(text, data.families),
      personIds: mentions(text, data.people),
      locationIds: mentions(text, data.locations)
    };
  });
}
export function familyConnection(from, to, relations = registry.relations) {
  if (!from || !to) return null;
  if (from === to) return {
    ids: [from],
    edges: [],
    steps: []
  };
  const neighbors = new Map();
  for (const edge of relations) {
    if (!['parent', 'spouse'].includes(edge.type)) continue;
    for (const [a, b, label] of [[edge.a, edge.b, edge.type === 'spouse' ? 'union' : 'enfant'], [edge.b, edge.a, edge.type === 'spouse' ? 'union' : 'parent']]) {
      if (!neighbors.has(a)) neighbors.set(a, []);
      neighbors.get(a).push({
        next: b,
        edge,
        label
      });
    }
  }
  const seen = new Set([from]),
    queue = [{
      id: from,
      ids: [from],
      edges: [],
      steps: []
    }];
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const current = queue[cursor];
    if (current.edges.length >= 24) continue;
    for (const next of neighbors.get(current.id) || []) {
      if (seen.has(next.next)) continue;
      const path = {
        id: next.next,
        ids: [...current.ids, next.next],
        edges: [...current.edges, next.edge.id],
        steps: [...current.steps, next.label]
      };
      if (next.next === to) return path;
      seen.add(next.next);
      queue.push(path);
    }
  }
  return null;
}
