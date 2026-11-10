import { Link, useSearchParams } from 'react-router-dom';
import { registry, familyPeople, familyPath, normalize } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav, WikiEmpty } from '../../components/wiki/WikiShell';
import { PersonRow } from '../../components/wiki/PersonSummary';
export default function Familles() {
  const [params, setParams] = useSearchParams(),
    tab = params.get('categorie') || 'great',
    query = params.get('recherche') || '';
  const families = registry.families.filter(f => f.kind === (tab === 'secondary' ? 'secondary' : 'great') && normalize([f.name, f.location, f.county].join(' ')).includes(normalize(query)));
  const unknown = registry.people.filter(p => p.notable && !p.familyId && normalize(p.name + ' ' + p.location).includes(normalize(query)));
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    setParams(next, {
      replace: true
    });
  };
  return <WikiPage><WikiHeader section="Familles" title="Lignées & alliances." intro="Les grandes maisons, les familles discrètes et les personnes qui donnent un visage au royaume." aside={<><strong className="wiki-number">09</strong><span>grandes maisons</span></>} />
    <div className="wiki-content"><WikiNav /><div className="wiki-filterbar"><div className="wiki-tabs" role="group" aria-label="Catégories de familles">
      {[['great', 'Grandes maisons'], ['secondary', 'Familles secondaires'], ['notables', 'Autres notables']].map(([value, label]) => <button type="button" key={value} aria-pressed={tab === value} onClick={() => update('categorie', value)}>{label}</button>)}</div>
      <label className="wiki-filter-search">Rechercher<input type="search" value={query} onChange={e => update('recherche', e.target.value)} placeholder="Une famille, un lieu…" /></label>
    </div>
    {tab === 'notables' ? <><p className="wiki-muted wiki-section-intro">Ces personnes sont importantes pour le royaume ; aucune famille n’est renseignée dans la sélection documentaire.</p><div className="wiki-people-grid">{unknown.map(p => <PersonRow key={p.id} person={p} />)}</div></> : <>
      {tab === 'secondary' && <p className="wiki-muted wiki-section-intro">Des familles présentes dans les archives et la vie locale. Seuls les liens connus sont présentés.</p>}
      <div className={`wiki-family-grid${tab === 'secondary' ? ' wiki-family-grid--secondary' : ''}`}>{families.map((family, index) => <Link className="wiki-family-entry" key={family.id} to={familyPath(family.id)}>
        <span className="wiki-family-index">{String(index + 1).padStart(2, '0')}</span>
        {family.blazon && <img src={family.blazon} alt="" className="wiki-family-blazon" loading="lazy" />}
        <span className="wiki-family-copy"><h2>{family.name}</h2><small>{family.location ? [family.location, family.county].filter(Boolean).join(' · ') : `${familyPeople(family.id).length} personne${familyPeople(family.id).length > 1 ? 's' : ''} connue${familyPeople(family.id).length > 1 ? 's' : ''}`}</small>{family.motto && <q>{family.motto}</q>}</span><span className="wiki-arrow" aria-hidden="true">↗</span>
      </Link>)}</div>{!families.length && <WikiEmpty title="Aucune famille trouvée">Essayez une autre recherche.</WikiEmpty>}
    </>}
    </div></WikiPage>;
}
