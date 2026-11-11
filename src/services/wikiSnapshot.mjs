// Derive the supported public JSON shape from the bundled, approved package.
// Validate completely before any live registry or lookup index is replaced.
const schemas = new WeakMap();
const kind = value => value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
function shape(values) {
  const result = {
    types: new Set(values.map(kind))
  };
  const objects = values.filter(value => kind(value) === 'object');
  if (objects.length) {
    const keys = [...new Set(objects.flatMap(Object.keys))];
    result.required = Object.keys(objects[0]).filter(key => objects.every(value => Object.hasOwn(value, key)));
    result.fields = new Map(keys.map(key => [key, shape(objects.filter(value => Object.hasOwn(value, key)).map(value => value[key]))]));
  }
  const children = values.filter(Array.isArray).flat();
  if (children.length) result.items = shape(children);
  return result;
}
function check(value, schema, depth = 0) {
  if (depth > 16) throw Error('Registre wiki trop imbriqué.');
  const type = kind(value);
  if (!schema.types.has(type) && !(schema.types.size === 1 && schema.types.has('null') && ['string', 'number'].includes(type))) throw Error('Le format du registre wiki est invalide.');
  if (type === 'number' && (!Number.isFinite(value) || Math.abs(value) > Number.MAX_SAFE_INTEGER)) throw Error('Le registre wiki contient un nombre invalide.');
  if (type === 'string' && value.length > 30000) throw Error('Le registre wiki contient un texte trop long.');
  if (type === 'object') {
    if (Object.getPrototypeOf(value) !== Object.prototype || schema.required.some(key => !Object.hasOwn(value, key))) throw Error('Le registre wiki est incomplet.');
    for (const key of Object.keys(value)) {
      if (!schema.fields.has(key)) throw Error('Le registre wiki contient un champ non pris en charge.');
      check(value[key], schema.fields.get(key), depth + 1);
    }
  }
  if (type === 'array') {
    if (value.length > 3000 || value.length && !schema.items) throw Error('Le registre wiki contient une liste invalide.');
    value.forEach(item => check(item, schema.items, depth + 1));
  }
}
export function validateWikiSnapshot(value, baseline) {
  if (!schemas.has(baseline)) schemas.set(baseline, shape([baseline]));
  check(value, schemas.get(baseline));
  if (!value.registry.version?.trim() || !value.registry.people.length || !value.books.length) throw Error('Le registre wiki est vide.');
  for (const key of ['people', 'families', 'relations', 'guilds', 'roles', 'concepts', 'locations', 'events', 'books', 'seats']) {
    const ids = value.registry[key].map(item => item.id);
    if (ids.some(id => !id.trim()) || new Set(ids).size !== ids.length) throw Error('Le registre wiki contient des identifiants invalides.');
  }
  const fullIds = value.books.map(book => book.id);
  if (new Set(fullIds).size !== fullIds.length) throw Error('Le registre wiki contient des livres en double.');
  return structuredClone(value);
}
