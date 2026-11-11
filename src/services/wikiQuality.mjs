export function wikiQuality(data) {
  const checks = [['biography', 'Biographie à compléter', person => !person.biography?.trim()], ['location', 'Lieu à préciser', person => !person.location?.trim()], ['vital', 'Statut à préciser', person => person.vital === 'unknown'], ['dates', 'Date de décès à préciser', person => person.vital === 'dead' && !person.death]];
  return checks.map(([id, label, test]) => ({
    id,
    label,
    people: data.people.filter(test)
  }));
}
