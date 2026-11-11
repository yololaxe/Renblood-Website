const CHOICES = new Set(['accept', 'keep']);
export const REVIEW_FIELD_LABELS = {
  name: 'Nom',
  aliases: 'Autres noms',
  biography: 'Biographie',
  title: 'Titre',
  occupation: 'Métier et activité',
  publicOffice: 'Fonction publique',
  familyId: 'Famille',
  houseId: 'Grande maison',
  roleIds: 'Fonctions',
  guildIds: 'Guildes',
  leaderId: 'Dirigeant',
  leaderLabel: 'Nom du dirigeant',
  personId: 'Personnage',
  personLabel: 'Nom du personnage',
  location: 'Lieu',
  county: 'Comté',
  birth: 'Naissance',
  death: 'Décès',
  vital: 'Statut de vie',
  spouseLabel: 'Conjoint',
  fortune: 'Fortune',
  reputation: 'Réputation',
  members: 'Membres',
  benefits: 'Avantages',
  image: 'Illustration',
  description: 'Description',
  summary: 'Présentation',
  period: 'Période',
  text: 'Texte',
  chapters: 'Chapitres et sections',
  wordCount: 'Longueur du texte',
  coords: 'Coordonnées',
  state: 'Situation',
  note: 'Précisions',
  label: 'Libellé',
  category: 'Catégorie',
  a: 'Premier personnage du lien',
  b: 'Second personnage du lien',
  type: 'Type',
  resources: 'Ressources',
  blazon: 'Blason',
  motto: 'Devise'
};
export const reviewFieldLabel = key => REVIEW_FIELD_LABELS[key] || key;
export function reviewPreviewPath(draft, packageValue) {
  const data = packageValue.registry;
  for (const change of draft.changes) {
    if (draft.decisions[change.key] !== 'accept') continue;
    const routes = {
      people: ['people', '/histoires/personnages/'],
      families: ['families', '/histoires/familles/'],
      guilds: ['guilds', '/histoires/guildes/'],
      locations: ['locations', '/histoires/lieux/'],
      concepts: ['concepts', '/histoires/notions/']
    };
    const route = routes[change.collection];
    if (route && data[route[0]].some(item => item.id === change.id)) return route[1] + encodeURIComponent(change.id);
    if (change.collection === 'roles') return '/histoires/politique?fonction=' + encodeURIComponent(change.id);
    if (change.collection === 'seats' || change.collection === '$registry') return '/histoires/politique';
    if (change.collection === 'books' || change.collection === '$books') return '/histoires/livres';
    if (change.collection === 'events') return '/histoires/chronologie?vue=parcours';
    if (change.collection === 'relations') {
      const edge = data.relations.find(edge => edge.id === change.id);
      if (edge) return '/histoires/personnages/' + encodeURIComponent(edge.a);
    }
  }
  return '/histoires/personnages';
}
export const REVIEW_TTL = 7 * 24 * 60 * 60 * 1000;
export const reviewKey = (owner, scope, id) => `renblood:wiki:review:v1:${encodeURIComponent(scope)}:${encodeURIComponent(owner)}:${id}`;
const value = (choices, key) => choices[key] || '';
export function sameDecisions(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  return [...keys].every(key => value(a, key) === value(b, key));
}
export function makeReviewBackup(draft, decisions, conflicts, owner, scope, now = Date.now()) {
  return {
    format: 'renblood-wiki-review',
    version: 1,
    owner,
    scope,
    draftId: draft.id,
    baseVersion: draft.baseVersion,
    revision: draft.revision,
    baseDecisions: draft.decisions,
    decisions,
    conflicts,
    updatedAt: now
  };
}
export function readReviewBackup(raw, draft, owner, scope, now = Date.now()) {
  let saved;
  try {
    saved = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!saved || saved.format !== 'renblood-wiki-review' || saved.version !== 1 || saved.owner !== owner || saved.scope !== scope || saved.draftId !== draft.id || saved.baseVersion !== draft.baseVersion || !Number.isInteger(saved.revision) || !Number.isFinite(saved.updatedAt) || saved.updatedAt > now + 60000 || now - saved.updatedAt > REVIEW_TTL) return null;
  const keys = new Set(draft.changes.map(change => change.key));
  function validChoices(choices) {
    return choices && typeof choices === 'object' && !Array.isArray(choices) && Object.entries(choices).every(([key, choice]) => keys.has(key) && CHOICES.has(choice));
  }
  if (!validChoices(saved.decisions) || !validChoices(saved.baseDecisions) || !Array.isArray(saved.conflicts) || saved.conflicts.length > keys.size || saved.conflicts.some(item => !keys.has(item.key) || !['', 'accept', 'keep'].includes(item.local) || !['', 'accept', 'keep'].includes(item.shared))) return null;
  return saved;
}
export function recoverReview(saved, draft) {
  const decisions = {
      ...draft.decisions
    },
    conflicts = [];
  const prior = new Map(saved.conflicts.map(item => [item.key, item]));
  for (const change of draft.changes) {
    const key = change.key,
      base = value(saved.baseDecisions, key),
      local = prior.get(key)?.local ?? value(saved.decisions, key),
      shared = value(draft.decisions, key);
    const conflict = local !== shared && (prior.has(key) || local !== base && shared !== base);
    if (conflict) conflicts.push({
      key,
      local,
      shared
    });else if (local !== base || local === shared) {
      if (local) decisions[key] = local;else delete decisions[key];
    }
  }
  return {
    decisions,
    conflicts,
    changedRevision: saved.revision !== draft.revision
  };
}
export function resolveReviewConflict(state, key, choice) {
  if (!['', 'accept', 'keep'].includes(choice)) throw Error('Décision inconnue.');
  const decisions = {
    ...state.decisions
  };
  choice ? decisions[key] = choice : delete decisions[key];
  return {
    decisions,
    conflicts: state.conflicts.filter(item => item.key !== key)
  };
}
export function createReviewBackupStore(storage) {
  return {
    read(draft, owner, scope) {
      return readReviewBackup(storage().getItem(reviewKey(owner, scope, draft.id)), draft, owner, scope);
    },
    write(draft, decisions, conflicts, owner, scope) {
      storage().setItem(reviewKey(owner, scope, draft.id), JSON.stringify(makeReviewBackup(draft, decisions, conflicts, owner, scope)));
    },
    remove(draft, owner, scope) {
      storage().removeItem(reviewKey(owner, scope, draft.id));
    }
  };
}
