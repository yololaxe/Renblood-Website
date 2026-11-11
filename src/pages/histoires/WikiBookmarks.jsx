import { useState } from 'react';
import { Link } from 'react-router-dom';
import { normalize } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav, WikiEmpty } from '../../components/wiki/WikiShell';
import BookmarkNote from '../../components/wiki/BookmarkNote';
import BookmarkTransfer from '../../components/wiki/BookmarkTransfer';
import { useBookmarks } from '../../components/wiki/WikiBookmarks';
export default function WikiBookmarks() {
  const {
      items,
      update,
      error
    } = useBookmarks(),
    [query, setQuery] = useState(''),
    [type, setType] = useState('');
  const matches = items.filter(item => (!type || item.type === type) && normalize(`${item.label} ${item.note}`).includes(normalize(query)));
  return <WikiPage><WikiHeader section="Mes repères" title="À garder sous la main." intro="Personnages, familles, événements et passages à retrouver pour votre prochaine session." />
    <div className="wiki-content"><WikiNav /><p className="wiki-muted wiki-timeline-note">Enregistrés sur ce navigateur, sans compte. Vos notes restent sur cet appareil. Jusqu’à 200 repères.</p>
      <BookmarkTransfer items={items} update={update} /><form className="wiki-filterbar" onSubmit={event => event.preventDefault()}><label className="wiki-filter-search">Rechercher dans mes repères<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nom, passage ou note…" /></label><label>Catégorie<select value={type} onChange={event => setType(event.target.value)}><option value="">Toutes les catégories</option>{[...new Set(items.map(item => item.type))].sort().map(value => <option key={value}>{value}</option>)}</select></label><span className="wiki-result-count" role="status">{matches.length} / {items.length} repères</span></form>
      {error && <p className="wiki-error" role="alert">{error}</p>}{!matches.length ? <WikiEmpty title={items.length ? 'Aucun repère dans cette sélection' : 'Votre carnet commence ici'}>Utilisez « Garder ce repère » sur une fiche ou « Garder ce passage » dans un livre. <Link to="/histoires/personnages">Explorer le registre ↗</Link></WikiEmpty> : <div className="wiki-saved-list">{matches.map(item => <article key={item.path} className="wiki-saved-item"><div><p className="wiki-kicker">{item.type}</p><h2><Link to={item.path}>{item.label} ↗</Link></h2><BookmarkNote item={item} /></div><button className="wiki-text-link" aria-label={`Retirer ${item.label} des repères`} onClick={() => update({
            type: 'remove',
            path: item.path
          })}>Retirer ×</button></article>)}</div>}
    </div></WikiPage>;
}
