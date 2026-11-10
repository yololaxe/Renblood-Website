const clean = value => String(value ?? '').replace(/\r/g, '').trim();
export const normalize = value => clean(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export const slug = value => normalize(value).replace(/ /g, '-');
const has = value => value !== undefined && value !== null && clean(value) !== '';
const unknown = value => !has(value) || /^(aucun|aucune|inconnu|inconnue|\?+|-1|-2)$/i.test(clean(value));
const publicVisibility = value => !clean(value) || ['public', 'publique', 'publics', 'publiques'].includes(clean(value).toLowerCase());
const titleCase = name => clean(name).split(/\s+/).map(word => /^[A-ZÀ-Ÿ][A-ZÀ-Ÿ'-]+$/.test(word) ? word[0] + word.slice(1).toLocaleLowerCase('fr') : word).join(' ');
const positiveYear = value => Number.isInteger(Number(value)) && Number(value) > 0 ? Number(value) : null;
export function compileWiki(snapshot, baseline, decisions = {}) {
  const review = [];
  const read = (sheet, range) => {
    const matches = snapshot.reads.filter(r => r.sheet === sheet && (!range || r.requestedRange === range));
    if (!matches.length) throw new Error(`Source manquante : ${sheet}`);
    return matches[0].values || [];
  };
  const raw = snapshot.reads.filter(r => r.sheet === 'PERSONNAGES').flatMap(r => r.values || []).filter(r => /^P\d+$/.test(clean(r[0])));
  if (new Set(raw.map(r => r[0])).size !== raw.length) throw new Error('Identifiants de personnages en double');
  if (!raw.length) throw new Error('Registre de personnages vide');
  const rawById = new Map(raw.map(r => [r[0], r]));
  const rawByName = new Map();
  for (const row of raw) {
    const key = normalize(row[2]);
    rawByName.set(key, [...(rawByName.get(key) || []), row[0]]);
  }
  const resolveName = value => {
    const matches = rawByName.get(normalize(clean(value).replace(/[✞†]/g, ''))) || [];
    return matches.length === 1 ? matches[0] : null;
  };
  const oldById = new Map();
  for (const [name, value] of Object.entries(baseline.people)) {
    const id = resolveName(name);
    if (id) oldById.set(id, value);
  }
  const people = raw.map(row => {
    const old = oldById.get(row[0]);
    const name = titleCase(row[2]);
    let houseId = clean(row[7]) ? slug(row[7]) : null;
    if (['P0141', 'P0143'].includes(row[0])) houseId = null;
    const birth = old ? positiveYear(old.born) : positiveYear(row[16]);
    const death = old ? positiveYear(old.death) : null;
    let vital = death ? 'dead' : old?.death === -1 ? 'alive' : clean(row[21]) === 'Décédé' ? 'dead' : 'unknown';
    if (row[0] === 'P0514' && decisions.additional_facts?.the_verdict?.magistrate_status === 'Titulaire décédé') vital = 'dead';
    const person = {
      id: clean(row[0]),
      name,
      houseId,
      familyId: houseId,
      category: clean(row[6]),
      title: old ? clean(old.titre) : clean(row[11]),
      occupation: old ? clean(old.metier) : clean(row[13]),
      publicOffice: old ? clean(old.metier) : clean(row[12]),
      location: clean(row[19]),
      county: clean(row[20]),
      biography: old ? clean(old.description) : clean(row[48]),
      birth,
      death,
      vital,
      reportedAge: old ? '' : clean(row[17]),
      spouseLabel: old ? clean(old.conjoint) : clean(row[23]),
      reputation: old && Number(old.reputation) >= 0 ? Number(old.reputation) : null,
      fortune: old && Number(old.argent) >= 0 ? Number(old.argent) : null,
      notable: false,
      guildIds: [],
      roleIds: [],
      aliases: [clean(row[2])].filter(v => v !== name)
    };
    if (unknown(person.occupation)) person.occupation = '';
    if (unknown(person.publicOffice)) person.publicOffice = '';
    if (unknown(person.title)) person.title = '';
    person.lineage = /\bsand$/i.test(clean(row[2])) ? 'sand' : null;
    if (person.id === 'P0106' && decisions.decisions?.ESPERO_CONSUL) {
      person.publicOffice = 'Consul du Royaume';
      if (!/consul/i.test(person.title)) person.title += ', Consul du Royaume';
    }
    if (unknown(person.spouseLabel)) person.spouseLabel = '';
    if (['P0141', 'P0143'].includes(person.id)) review.push({
      kind: 'house',
      id: person.id,
      reason: 'Maison et arbre d’appartenance à arbitrer'
    });
    return person;
  });
  const byId = new Map(people.map(p => [p.id, p]));
  const houses = baseline.families.map(f => {
    const source = read('MAISONS NOBLES').slice(4).find(r => normalize(r[0]) === normalize(f.nom));
    return {
      id: slug(f.nom),
      name: f.nom,
      kind: 'great',
      motto: clean(source?.[1]),
      county: f['comté'],
      location: f.ville,
      symbol: f.symbole,
      blazon: f.blason,
      biography: f.description,
      resources: {
        fortune: f.argent,
        soldiers: f.armee,
        horses: f.chevaux,
        dragons: f.dragons,
        buildings: f.batiments,
        mages: f.magiciens,
        ships: f.navires,
        royalRelation: f.relationRoyale,
        power: f.puissance
      }
    };
  });
  const familyIds = new Map(houses.map(f => [f.name, f.id]));
  const secondary = read('Personnages secondaires importants').slice(4).filter(r => r[0]);
  for (const row of secondary) {
    const person = byId.get(row[0]);
    if (!person) throw new Error(`Personnage secondaire absent : ${row[0]}`);
    person.notable = true;
    const label = clean(row[2]);
    if (!label || person.houseId) continue;
    if (normalize(label) === 'sand' && decisions.decisions?.SAND) {
      person.lineage = 'sand';
      person.familyId = null;
      continue;
    }
    if (!familyIds.has(label)) {
      let id = `famille-${slug(label)}`;
      if (houses.some(f => f.id === id)) id += `-${person.id.toLowerCase()}`;
      familyIds.set(label, id);
      houses.push({
        id,
        name: titleCase(label),
        kind: 'secondary',
        motto: '',
        county: '',
        location: '',
        symbol: '',
        blazon: null,
        biography: '',
        resources: null
      });
    }
    person.familyId = familyIds.get(label);
  }
  const edges = new Map();
  const addEdge = (type, a, b, origin) => {
    if (!a || !b || a === b) return;
    if (!byId.has(a) || !byId.has(b)) throw new Error(`Lien orphelin : ${a} → ${b}`);
    const ends = type === 'parent' ? [a, b] : [a, b].sort();
    const key = [type, ...ends].join(':');
    if (!edges.has(key)) edges.set(key, {
      id: key,
      type,
      a: ends[0],
      b: ends[1]
    });
  };
  for (const row of read('RELATIONS').slice(4).filter(r => r[0])) {
    if (!publicVisibility(row[7])) continue;
    const nature = clean(row[4]);
    const type = /Époux|Mariage|Union/i.test(nature) ? 'spouse' : /Parent|Père/i.test(nature) ? 'parent' : /Fratrie|Frère/i.test(nature) ? 'sibling' : null;
    if (type) addEdge(type, row[0], row[2], 'source');
  }
  // Legacy child links were already public; preserve them while moving to explicit identities.
  const walk = (node, parentIds) => {
    const id = resolveName(node.keyName);
    for (const parentId of parentIds) if (id && parentId) addEdge('parent', parentId, id, 'legacy');
    const unionLabel = clean(node.name.split('♥')[1]).replace(/[✞†]/g, '').trim();
    const spouseId = unionLabel ? resolveName(unionLabel) : null;
    for (const child of node.children || []) walk(child, [id, spouseId].filter(Boolean));
  };
  Object.values(baseline.trees).forEach(tree => walk(tree.data, []));
  for (const person of people) {
    const spouseId = resolveName(person.spouseLabel);
    if (spouseId) addEdge('spouse', person.id, spouseId, 'legacy');
  }
  const confirmedParents = decisions.parentage || {};
  const relations = [...edges.values()].filter(edge => {
    if (edge.type !== 'parent' || !confirmedParents[edge.b]) return true;
    const accepted = confirmedParents[edge.b].includes(edge.a);
    if (!accepted) review.push({
      kind: 'parentage',
      id: edge.b,
      rejectedParent: edge.a,
      reason: 'Filiation écartée par arbitrage explicite'
    });
    return accepted;
  });
  for (const [child, parentIds] of Object.entries(confirmedParents)) {
    if (parentIds.length > 2) throw new Error('Arbitrage de filiation invalide : plus de deux parents');
    for (const parent of parentIds) {
      if (!byId.has(child) || !byId.has(parent) || child === parent) throw new Error('Arbitrage de filiation vers une identité absente ou identique');
      if (!relations.some(edge => edge.type === 'parent' && edge.a === parent && edge.b === child)) relations.push({
        id: `parent:${parent}:${child}`,
        type: 'parent',
        a: parent,
        b: child
      });
    }
  }
  for (const person of people) if (relations.filter(edge => edge.type === 'parent' && edge.b === person.id).length > 2) throw new Error(`Filiation contradictoire à arbitrer : ${person.id}`);
  const parents = new Map(people.map(p => [p.id, []]));
  for (const edge of relations.filter(e => e.type === 'parent')) parents.get(edge.b).push(edge.a);
  const visiting = new Set(),
    visited = new Set();
  function checkCycle(id) {
    if (visiting.has(id)) throw new Error(`Boucle d’ascendance : ${id}`);
    if (visited.has(id)) return;
    visiting.add(id);
    for (const parent of parents.get(id)) checkCycle(parent);
    visiting.delete(id);
    visited.add(id);
  }
  people.forEach(p => checkCycle(p.id));
  const locations = Object.entries(baseline.locations).flatMap(([county, cities]) => cities.map(c => ({
    id: slug(c.ville),
    name: c.ville,
    county,
    type: c.ville === 'Valentine' && decisions.additional_facts?.valentine?.confirmed ? 'Grande-Ville' : c.type,
    leaderId: resolveName(c.chef),
    leaderLabel: clean(c.chef),
    description: clean(c.caracteristique),
    environment: clean(c.environnement),
    population: c.habitant,
    soldiers: c.soldat,
    coords: c.Coords,
    guildLabel: clean(c.guilde),
    council: c.conseil
  })));
  const approvedLeaders = {
    1: 'P0075',
    5: decisions.decisions?.GUILDE_LETTRE ? 'P0102' : 'P0156',
    9: 'P0106'
  };
  const guildSource = read('GUILDES').slice(4);
  const guilds = baseline.guilds.map(g => {
    const source = guildSource.find(r => normalize(r[0]) === normalize(g.name));
    const leaderId = approvedLeaders[g.id] || (byId.has(source?.[2]) ? source[2] : resolveName(g.leader));
    const guild = {
      id: slug(g.name.replace(/^La /i, '')),
      name: g.name,
      leaderId,
      leaderLabel: byId.get(leaderId)?.name || g.leader,
      location: g.location.split(' (')[0],
      image: `/guildes/${g.image}`,
      fortune: g.fortune,
      reputation: g.reputation,
      members: g.members,
      buildings: g.buildings,
      benefits: g.description.split('\n').map(clean).filter(Boolean),
      summary: '',
      jobIds: []
    };
    if (leaderId) byId.get(leaderId).guildIds.push(guild.id);
    return guild;
  });
  const letter = guilds.find(g => g.id === 'guilde-de-la-lettre');
  if (letter?.leaderId === 'P0102') {
    const michelle = byId.get('P0156');
    if (michelle) michelle.publicOffice = '';
  }
  const roles = baseline.roles.map(r => ({
    id: slug(r.titre),
    name: r.titre,
    description: r.role,
    privileges: r.privileges || [],
    requirements: r.requis || [],
    access: r.arrivee || '',
    duration: r.temps || '',
    income: r.revenu || '',
    territories: r.lieu || []
  }));
  const magistrate = roles.find(r => normalize(r.name) === 'magistrat');
  if (magistrate) magistrate.description = 'Représente les habitants au Conseil du Peuple et participe aux lois civiles. Le Conseil compte treize sièges : six pour les marquisats, cinq pour les grandes villes et deux pour les peuples non humains.';
  const roleFor = label => {
    const text = normalize(label);
    return roles.filter(r => text.includes(normalize(r.name).replace(/ x2$/, ''))).sort((a, b) => b.name.length - a.name.length)[0]?.id || null;
  };
  for (const p of people) p.roleIds = [...new Set([p.publicOffice, p.occupation].map(roleFor).filter(Boolean))];
  const masterRole = roles.find(r => normalize(r.name) === 'maitre de guilde');
  if (masterRole) for (const guild of guilds) {
    const leader = byId.get(guild.leaderId);
    if (leader && !leader.roleIds.includes(masterRole.id)) leader.roleIds.push(masterRole.id);
  }
  if (decisions.decisions?.SERGIO) byId.get('P0119') && (byId.get('P0119').roleIds = []);
  const seats = read('Conseil Royale').slice(20, 33).filter(r => /^Magistrat/.test(clean(r[10]))).map((r, index) => {
    const personId = resolveName(r[12]);
    const label = clean(r[10]).replace(/^Magistrat\s*-\s*/, '');
    const nonHuman = /Moria|Sylinore/.test(label);
    return {
      id: `siege-${index + 1}`,
      label,
      category: nonHuman ? 'peoples' : /Circos|Fyvelune|Freezing/.test(label) ? 'marquisates' : 'cities',
      personId,
      personLabel: byId.get(personId)?.name || titleCase(r[12]),
      state: /The Verdict/.test(label) ? 'deceased' : nonHuman ? 'contested' : 'documented',
      note: /The Verdict/.test(label) ? 'Titulaire décédé. Remplacement non renseigné.' : nonHuman ? 'Le représentant n’est pas reconnu par tous les acteurs du royaume.' : ''
    };
  });
  if (seats.length !== 13) throw new Error(`Répartition du Conseil inattendue : ${seats.length}`);
  for (const seat of seats) if (seat.personId) {
    const p = byId.get(seat.personId);
    if (seat.state !== 'deceased' && !p.roleIds.includes('magistrat')) p.roleIds.push('magistrat');
  }
  const government = read('Conseil Royale').slice(7, 17).flatMap(row => [row[10], row[12]]).filter(v => clean(v).includes(':')).map(text => {
    const [office, ...name] = clean(text).split(':');
    return {
      office: clean(office),
      personId: resolveName(name.join(':')),
      personLabel: titleCase(name.join(':'))
    };
  });
  if (decisions.decisions?.SERGIO) for (const entry of government) if (entry.personId === 'P0119') entry.office = 'Maréchal des armées';
  const concepts = [{
    id: 'sand',
    name: 'Sand',
    description: 'Patronyme porté dans le royaume par les personnes nées hors mariage. Il ne désigne pas une famille commune et ne suffit pas à établir un lien de parenté.'
  }, {
    id: 'marechal-des-armees',
    name: 'Maréchal des armées',
    description: 'Fonction de commandement militaire exercée par Sergio Lynster. Les archives publiques ne détaillent pas ici de pouvoirs supplémentaires.'
  }];
  const secondBail = read('Conseil Royale')[14]?.[12];
  if (secondBail) government.push({
    office: 'Maître de bail',
    personId: resolveName(secondBail),
    personLabel: titleCase(secondBail)
  });
  const events = read('CHRONOLOGIE').slice(4).filter(r => byId.has(r[0]) && publicVisibility(r[7])).map((r, i) => ({
    id: `evt-${i + 1}`,
    personId: r[0],
    period: clean(r[2]),
    text: clean(r[3]),
    type: clean(r[4])
  }));
  const sourceBooks = read('Livres');
  const books = [{
    id: '1',
    title: 'Chroniques de Renblood',
    subtitle: 'Histoire du Royaume de Renblood',
    range: [92, 128],
    description: 'Les âges du royaume, de la Grande Conquête aux chroniques de l’an 321.',
    theme: 'chronicles'
  }, {
    id: '2',
    title: 'Les voies de la Connaissance et de l’Éveil',
    subtitle: 'Foi, armées, éducation et peuples elfes',
    range: [1, 91],
    description: 'Les traditions, les savoirs et les institutions qui façonnent Renblood.',
    theme: 'knowledge'
  }].map(book => {
    const chapters = [];
    for (let index = book.range[0] - 1; index < book.range[1]; index++) {
      const row = sourceBooks[index] || [];
      for (const col of [1, 8, 15]) {
        const match = /^Chapitre\s+(\d+)/i.exec(clean(row[col]));
        if (!match || !clean(row[col + 2])) continue;
        const sections = [];
        for (let next = index + 1; next < book.range[1]; next++) {
          const cells = sourceBooks[next] || [];
          if (/^Chapitre\s+/i.test(clean(cells[col]))) break;
          const sectionMatch = /^Section\s+(\d+)/i.exec(clean(cells[col]));
          if (!sectionMatch || !clean(cells[col + 2])) continue;
          const content = clean(sourceBooks[next + 1]?.[col]);
          if (!content) continue;
          const paragraphs = content.split('\n').map(clean).filter(Boolean).filter(line => !/^Image\s*:/i.test(line)).map(line => line.replace(/^Texte\s*:\s*/i, '')).filter(Boolean);
          sections.push({
            id: sectionMatch[1],
            title: clean(cells[col + 2]),
            paragraphs
          });
        }
        chapters.push({
          id: match[1],
          title: clean(row[col + 2]).replace(/Foi Tripatrie/i, 'Foi Tripartite'),
          sections
        });
      }
    }
    chapters.sort((a, b) => Number(a.id) - Number(b.id));
    return {
      ...book,
      range: undefined,
      chapters,
      wordCount: chapters.flatMap(c => c.sections).flatMap(s => s.paragraphs).join(' ').split(/\s+/).length
    };
  });
  const bookIndex = books.map(({
    chapters,
    ...book
  }) => ({
    ...book,
    chapters: chapters.map(({
      sections,
      ...chapter
    }) => ({
      ...chapter,
      sections: sections.map(({
        id,
        title
      }) => ({
        id,
        title
      }))
    }))
  }));
  // This object is a strict public allowlist. Authoring notes, source URLs and secrets are never spread into it.
  const registry = {
    version: `wiki-${snapshot.asOf || '2026-11-10'}-1`,
    publishedOn: snapshot.asOf || '2026-11-10',
    people,
    families: houses,
    relations,
    guilds,
    roles,
    concepts,
    locations,
    government,
    seats,
    events,
    books: bookIndex
  };
  return {
    registry,
    books,
    review
  };
}
