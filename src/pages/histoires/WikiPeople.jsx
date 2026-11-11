import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { registry, peopleById } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav, WikiEmpty } from '../../components/wiki/WikiShell';
import { searchWiki } from '../../services/wikiSearch.mjs';
import { PersonRow } from '../../components/wiki/PersonSummary';
export default function WikiPeople() {
  const [params, setParams] = useSearchParams();
  const query = params.get('recherche') || '',
    family = params.get('famille') || '',
    notable = params.get('notables') === '1';
  const requestedPage = Math.max(1, Math.floor(Number(params.get('page')) || 1));
  const catalog = useMemo(() => registry.people.map(p => ({
    id: p.id,
    label: p.name,
    aliases: p.aliases,
    description: [p.title, p.publicOffice, p.occupation, p.location].filter(Boolean).join(' · '),
    path: '/histoires/personnages/' + p.id
  })), []);
  const matches = useMemo(() => searchWiki(catalog.filter(item => {
    const p = peopleById.get(item.id);
    return (!family || p.familyId === family || p.houseId === family) && (!notable || p.notable || p.houseId);
  }), query, registry.people.length).map(item => peopleById.get(item.id)), [query, family, notable, catalog]);
  const page = Math.min(requestedPage, Math.max(1, Math.ceil(matches.length / 36)));
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete('page');
    setParams(next, {
      replace: true
    });
  };
  return <WikiPage><WikiHeader section="Personnages" title="Visages du royaume." intro="Retrouver un nom, comprendre ses liens et suivre son histoire." aside={<><strong className="wiki-number">{registry.people.length}</strong><span>identités dans le registre</span></>} />
    <div className="wiki-content"><WikiNav /><form className="wiki-filterbar" onSubmit={event => event.preventDefault()}>
      <label className="wiki-filter-search">Rechercher un personnage<input type="search" value={query} onChange={e => update('recherche', e.target.value)} placeholder="Nom, fonction, métier, lieu…" /></label>
      <label>Famille<select value={family} onChange={e => update('famille', e.target.value)}><option value="">Toutes les familles</option>{registry.families.map(f => <option value={f.id} key={f.id}>{f.name}</option>)}</select></label>
      <label className="wiki-checkbox"><input type="checkbox" checked={notable} onChange={e => update('notables', e.target.checked ? '1' : '')} />Maisons et personnages notables</label>
    </form><p className="wiki-result-count" role="status">{matches.length} personnage{matches.length > 1 ? 's' : ''}</p>
    {matches.length ? <><div className="wiki-people-grid">{matches.slice((page - 1) * 36, page * 36).map(person => <PersonRow key={person.id} person={person} />)}</div>
      {matches.length > 36 && <nav className="wiki-pagination" aria-label="Pages du registre"><button disabled={page === 1} onClick={() => {
            const next = new URLSearchParams(params);
            next.set('page', String(page - 1));
            setParams(next);
          }}>← Précédente</button><span>Page {page} / {Math.ceil(matches.length / 36)}</span><button disabled={page * 36 >= matches.length} onClick={() => {
            const next = new URLSearchParams(params);
            next.set('page', String(page + 1));
            setParams(next);
          }}>Suivante →</button></nav>}</> : <WikiEmpty title="Aucun nom ne correspond">Essayez une autre graphie, un lieu ou un métier. <Link to="/histoires/personnages">Effacer les filtres</Link></WikiEmpty>}
    </div></WikiPage>;
}
