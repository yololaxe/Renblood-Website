import { validateWikiSnapshot } from './wikiSnapshot.mjs';
import initialRegistry from '../data/wiki/registry.json' with { type: 'json' };
import initialBooks from '../data/wiki/books.json' with { type: 'json' };
export let registry = initialRegistry,
  books = initialBooks;
export const builtInWikiPackage = {
  registry: initialRegistry,
  books: initialBooks
};
const wikiListeners = new Set();
let wikiRevision = 0;
export const subscribeWiki = callback => {
  wikiListeners.add(callback);
  return () => wikiListeners.delete(callback);
};
export const getWikiRevision = () => wikiRevision;
export const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('fr').replace(/[^a-z0-9]+/g, ' ').trim();
export const slug = value => normalize(value).replace(/ /g, '-');
export const peopleById = new Map(registry.people.map(person => [person.id, person]));
export const familiesById = new Map(registry.families.map(family => [family.id, family]));
export const guildsById = new Map(registry.guilds.map(guild => [guild.id, guild]));
export const rolesById = new Map(registry.roles.map(role => [role.id, role]));
export const conceptsById = new Map((registry.concepts || []).map(concept => [concept.id, concept]));
export const conceptPath = id => `/histoires/notions/${id}`;
export const locationsById = new Map(registry.locations.map(place => [place.id, place]));
const names = new Map();
for (const person of registry.people) {
  for (const name of [person.name, ...person.aliases]) {
    const key = normalize(name),
      items = names.get(key) || [];
    if (!items.some(p => p.id === person.id)) names.set(key, [...items, person]);
  }
}
export const findPerson = name => {
  const items = names.get(normalize(name)) || [];
  return items.length === 1 ? items[0] : null;
};
export const findLocation = name => locationsById.get(slug(name)) || registry.locations.find(place => normalize(place.name) === normalize(name)) || null;
export const personPath = id => `/histoires/personnages/${id}`;
export const familyPath = id => `/histoires/familles/${id}`;
export const guildPath = id => `/histoires/guildes/${id}`;
export const rolePath = id => `/histoires/politique?fonction=${encodeURIComponent(id)}#fonction`;
export const placePath = id => `/histoires/lieux/${id}`;
const edgesByPerson = new Map(registry.people.map(person => [person.id, []]));
registry.relations.forEach(edge => {
  edgesByPerson.get(edge.a)?.push(edge);
  edgesByPerson.get(edge.b)?.push(edge);
});
export function relatives(id, type) {
  const edges = edgesByPerson.get(id) || [];
  return [...new Set(edges.filter(edge => type === 'parents' ? edge.type === 'parent' && edge.b === id : type === 'children' ? edge.type === 'parent' && edge.a === id : edge.type === type).map(edge => edge.a === id ? edge.b : edge.a))].map(key => peopleById.get(key)).filter(Boolean);
}
export const familyPeople = id => registry.people.filter(p => p.familyId === id || p.houseId === id);
export function biographyFor(person) {
  return person.biography || 'Les archives publiques ne contiennent pas encore de récit détaillé sur ce personnage.';
}
export function lifespan(person) {
  if (person.birth && person.death) return `${person.birth}–${person.death}`;
  if (person.birth) return `Né·e en ${person.birth}`;
  return person.vital === 'dead' ? 'Décédé·e · date non renseignée' : '';
}
export const vitalLabel = state => ({
  alive: 'Vivant·e',
  dead: 'Décédé·e',
  unknown: 'Statut non renseigné'
})[state] || 'Statut non renseigné';
export function kinshipLayout(id, generations = 2, maximum = 64, extraIds = []) {
  if (!peopleById.has(id)) return {
    nodes: [],
    edges: [],
    width: 0,
    height: 0
  };
  const levels = new Map([[id, 0]]);
  const branchLimit = Math.max(1, maximum - new Set(extraIds).size);
  let queue = [[id, 0]];
  while (queue.length) {
    const [current, level] = queue.shift();
    const candidates = [...(level <= 0 && level > -generations ? relatives(current, 'parents').map(p => [p.id, level - 1]) : []), ...(level >= 0 && level < generations ? relatives(current, 'children').map(p => [p.id, level + 1]) : [])];
    for (const [candidate, next] of candidates) if (!levels.has(candidate) && levels.size < branchLimit) {
      levels.set(candidate, next);
      queue.push([candidate, next]);
    }
  }
  for (const [current, level] of [...levels]) for (const spouse of relatives(current, 'spouse')) if (!levels.has(spouse.id) && levels.size < branchLimit) levels.set(spouse.id, level);
  for (const extra of extraIds) {
    if (levels.has(extra) || !peopleById.has(extra) || levels.size >= maximum) continue;
    const edge = registry.relations.find(e => e.a === extra && levels.has(e.b) || e.b === extra && levels.has(e.a));
    const other = edge && (edge.a === extra ? edge.b : edge.a);
    levels.set(extra, edge ? levels.get(other) + (edge.type === 'parent' ? edge.a === extra ? -1 : 1 : 0) : 0);
  }
  const bands = [...new Set(levels.values())].sort((a, b) => a - b);
  const rows = bands.map(level => [...levels].filter(([, l]) => l === level).map(([personId]) => personId));
  const width = Math.max(...rows.map(row => row.length)) * 192 + 48;
  const nodes = rows.flatMap((row, rowIndex) => row.map((personId, index) => ({
    id: personId,
    person: peopleById.get(personId),
    level: bands[rowIndex],
    x: (width - row.length * 192) / 2 + index * 192,
    y: rowIndex * 178 + 30
  })));
  const present = new Set(nodes.map(node => node.id));
  return {
    nodes,
    edges: registry.relations.filter(edge => present.has(edge.a) && present.has(edge.b) && ['parent', 'spouse'].includes(edge.type)),
    width,
    height: rows.length * 178 + 20,
    truncated: levels.size >= maximum
  };
}
function buildWikiSearchResults() {
  return [...(registry.concepts || []).map(c => ({
    label: c.name,
    description: c.description,
    path: conceptPath(c.id),
    type: "Notion"
  })), ...registry.people.map(p => ({
    label: p.name,
    aliases: p.aliases,
    description: [familiesById.get(p.familyId)?.name, p.publicOffice || p.occupation, p.location].filter(Boolean).join(' · '),
    path: personPath(p.id),
    type: 'Personnage',
    keywords: [...p.aliases, 'lore personnage famille', p.title].join(' ')
  })), ...registry.families.map(f => ({
    label: `Famille ${f.name}`,
    description: f.kind === 'great' ? 'Grande maison · ' + f.location : 'Famille secondaire',
    path: familyPath(f.id),
    type: 'Famille'
  })), ...registry.guilds.map(g => ({
    label: g.name,
    description: `${g.leaderLabel} · ${g.location}`,
    path: guildPath(g.id),
    type: 'Guilde'
  })), ...registry.roles.map(r => ({
    label: r.name,
    description: r.description,
    path: rolePath(r.id),
    type: 'Fonction'
  })), ...registry.locations.map(l => ({
    label: l.name,
    description: `${l.type} · ${l.county}`,
    path: placePath(l.id),
    type: 'Lieu'
  })), ...registry.books.flatMap(b => [{
    label: b.title,
    description: b.subtitle,
    path: `/histoires/livres/${b.id}/chapitre/1`,
    type: 'Livre'
  }, ...b.chapters.flatMap(c => c.sections.map(s => ({
    label: s.title,
    description: `${b.title} · ${c.title}`,
    path: `/histoires/livres/${b.id}/chapitre/${c.id}#section-${s.id}`,
    type: 'Livre'
  })))])];
}
export let wikiSearchResults = buildWikiSearchResults();
export function applyWikiPackage(candidate) {
  const value = validateWikiSnapshot(candidate, builtInWikiPackage);
  if (!value?.registry?.version || !Array.isArray(value.books) || !Array.isArray(value.registry.people) || !value.registry.people.length) throw Error('Registre wiki invalide');
  for (const key of ['families', 'guilds', 'roles', 'concepts', 'locations', 'relations', 'events', 'books', 'seats']) if (!Array.isArray(value.registry[key])) throw Error('Registre wiki incomplet');
  registry = value.registry;
  books = value.books;
  for (const [map, rows] of [[peopleById, registry.people], [familiesById, registry.families], [guildsById, registry.guilds], [rolesById, registry.roles], [conceptsById, registry.concepts], [locationsById, registry.locations]]) {
    map.clear();
    rows.forEach(row => map.set(row.id, row));
  }
  names.clear();
  edgesByPerson.clear();
  registry.people.forEach(person => {
    edgesByPerson.set(person.id, []);
    for (const name of [person.name, ...person.aliases]) {
      const key = normalize(name),
        rows = names.get(key) || [];
      if (!rows.some(p => p.id === person.id)) names.set(key, [...rows, person]);
    }
  });
  registry.relations.forEach(edge => {
    edgesByPerson.get(edge.a)?.push(edge);
    edgesByPerson.get(edge.b)?.push(edge);
  });
  wikiSearchResults = buildWikiSearchResults();
  wikiRevision++;
  wikiListeners.forEach(listener => listener());
}
