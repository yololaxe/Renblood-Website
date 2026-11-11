import { useMemo, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { registry, books, normalize, peopleById, familiesById, locationsById } from '../../services/wiki.mjs';
import { chronology, enrichChronology } from '../../services/wikiExplore.mjs';
import { WikiPage, WikiHeader, WikiNav, WikiEmpty } from '../../components/wiki/WikiShell';
import { LinkedText, WikiLink } from '../../components/wiki/WikiLink';
import { BookmarkButton } from '../../components/wiki/WikiBookmarks';
export default function WikiChronology() {
  const [params, setParams] = useSearchParams(),
    [limit, setLimit] = useState(30);
  const source = useMemo(() => chronology(), []);
  const dated = useMemo(() => enrichChronology(source.dated, books), [source]);
  const personal = params.get('vue') === 'parcours',
    family = params.get('famille') || '',
    person = params.get('personne') || '',
    place = params.get('lieu') || '',
    query = params.get('recherche') || '',
    era = params.get('age') || '';
  const active = dated.find(item => item.id === params.get('evenement'));
  const bounds = {
    '1': [0, 133],
    '2': [134, 224],
    '3': [225, 10000]
  }[era];
  const items = (personal ? source.personal : dated).filter(item => (!family || item.familyIds.includes(family)) && (!person || item.personIds.includes(person)) && (!place || item.locationIds.includes(place)) && (!bounds || personal || item.end >= bounds[0] && item.start <= bounds[1]) && normalize(`${item.title} ${item.description} ${item.excerpt || ''}`).includes(normalize(query)));
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    value ? next.set(key, value) : next.delete(key);
    next.delete('evenement');
    setParams(next, {
      replace: true
    });
    setLimit(30);
  };
  useEffect(() => {
    const id = params.get('evenement');
    if (id) {
      const index = items.findIndex(item => item.id === id);
      if (index >= 30) setLimit(index + 1);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({
        block: 'center'
      }));
    }
  }, [params.toString(), limit]);
  return <WikiPage className="wiki-chronology"><WikiHeader section="Chronologie" title="Le fil du royaume." intro="Parcourir les âges et retrouver les récits, les lieux et les personnes qui traversent l’histoire." />
    <div className="wiki-content"><WikiNav /><div className="wiki-view-switch" role="group" aria-label="Type de chronologie"><button aria-pressed={!personal} onClick={() => update('vue', '')}>Histoire du royaume <span>{dated.length}</span></button><button aria-pressed={personal} onClick={() => update('vue', 'parcours')}>Parcours personnels <span>{source.personal.length}</span></button></div>
      <p className="wiki-muted wiki-timeline-note">{personal ? 'Ces repères sont des âges ou des périodes individuelles. Ils ne sont pas placés sur le calendrier du royaume ; les valeurs ambiguës restent signalées.' : 'La frise reprend les dates explicites des archives publiques. Les filtres suivent les personnes, maisons et lieux cités dans chaque récit.'}</p>
      <form className="wiki-filterbar" onSubmit={event => event.preventDefault()}><label className="wiki-filter-search">Rechercher<input type="search" value={query} placeholder="Un événement, un récit…" onChange={event => update('recherche', event.target.value)} /></label>
        {!personal && <label>Âge<select value={era} onChange={event => update('age', event.target.value)}><option value="">Tous les âges</option><option value="1">Premier âge · 0–133</option><option value="2">Deuxième âge · 134–224</option><option value="3">Troisième âge · depuis 225</option></select></label>}
        <label>Maison<select value={family} onChange={event => update('famille', event.target.value)}><option value="">Toutes les familles</option>{registry.families.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Personnage<select value={person} onChange={event => update('personne', event.target.value)}><option value="">Tous les personnages</option>{registry.people.filter(p => (personal ? source.personal : dated).some(item => item.personIds.includes(p.id))).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
        <label>Lieu<select value={place} onChange={event => update('lieu', event.target.value)}><option value="">Tous les lieux</option>{registry.locations.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      </form>
      <div className="wiki-chronology-layout">{!personal && <aside className="wiki-era-rail"><p className="wiki-kicker">Les âges</p>{[['1', '0—133', 'Hommes, elfes et nains'], ['2', '134—224', 'Des créatures pour la guerre'], ['3', '225—…', 'Le royaume de Renblood']].map(([id, years, title]) => <button key={id} aria-pressed={era === id} onClick={() => update('age', era === id ? '' : id)}><strong>{years}</strong><span>{title}</span></button>)}<Link to="/histoires/livres">Lire les chroniques ↗</Link></aside>}
        <section className="wiki-chronology-feed" aria-label={personal ? 'Parcours personnels' : 'Frise chronologique'}><p className="wiki-result-count" role="status">{items.length} repère{items.length > 1 ? 's' : ''}</p>{!items.length && <WikiEmpty title="Aucun événement dans cette sélection">Élargissez la période ou <Link to="/histoires/chronologie">effacez les filtres</Link>.</WikiEmpty>}
          {items.slice(0, limit).map(item => <article key={item.id} id={item.id} className={`wiki-history-event${active?.id === item.id ? ' is-active' : ''}`}><div className="wiki-history-date">{personal ? <><span>Période du personnage</span><strong>{/^\d{5}(\.0)?$/.test(item.period) ? 'À préciser' : item.period || 'Non renseignée'}</strong></> : <><span>Année{item.start !== item.end ? 's' : ''}</span><strong>{item.start}{item.end !== item.start ? `—${item.end}` : ''}</strong></>}</div>
            <div className="wiki-history-story"><p className="wiki-kicker">{item.kind === 'chronicle' ? 'Chroniques du royaume' : item.description}</p><h2><LinkedText text={item.title} /></h2>{item.excerpt && <p className="wiki-prose"><LinkedText text={item.excerpt} /></p>}<div className="wiki-history-links">{item.familyIds.slice(0, 5).filter(id => familiesById.has(id)).map(id => <WikiLink key={id} kind="family" id={id} />)}{item.personIds.slice(0, 4).filter(id => peopleById.has(id)).map(id => <WikiLink key={id} kind="person" id={id} />)}{item.locationIds.slice(0, 3).filter(id => locationsById.has(id)).map(id => <WikiLink key={id} kind="place" id={id} />)}</div><div className="wiki-actions"><Link className="wiki-text-link" to={item.path}>{personal ? 'Ouvrir sa fiche' : 'Lire le récit complet'} ↗</Link><BookmarkButton path={`/histoires/chronologie?${personal ? 'vue=parcours&' : ''}evenement=${item.id}#${item.id}`} label={item.title} type="Événement" compact /></div></div>
          </article>)}{items.length > limit && <button className="wiki-action" onClick={() => setLimit(value => value + 30)}>Afficher la suite ({items.length - limit}) ↓</button>}
        </section></div>
    </div></WikiPage>;
}
