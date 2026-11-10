import { useParams, Link } from 'react-router-dom';
import { registry, locationsById, normalize } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiMissing, WikiNav } from '../../components/wiki/WikiShell';
import { PersonLink, WikiLink } from '../../components/wiki/WikiLink';
import { PersonRow } from '../../components/wiki/PersonSummary';
export default function WikiPlace() {
  const {
      placeId
    } = useParams(),
    place = locationsById.get(placeId);
  if (!place) return <WikiMissing kind="Ce lieu" />;
  const people = registry.people.filter(p => normalize(p.location) === normalize(place.name));
  const guilds = registry.guilds.filter(g => normalize(g.location) === normalize(place.name));
  return <WikiPage><WikiHeader section="Lieux" title={place.name} intro={`${place.type} · ${place.county}`} aside={<><strong className="wiki-number">{people.length}</strong><span>personnages liés</span></>} /><div className="wiki-content"><WikiNav />
    <div className="wiki-profile-layout"><div><section className="wiki-section"><h2>Prendre ses repères</h2><p className="wiki-prose">{place.description}</p>{place.environment && <p className="wiki-muted">{place.environment}</p>}
      <Link className="wiki-action" to={`/map?lieu=${encodeURIComponent(place.name)}`}>Situer sur la carte ↗</Link></section>
      <section className="wiki-section"><h2>Les personnes liées au lieu</h2><div className="wiki-people-grid wiki-people-grid--two">{people.map(p => <PersonRow key={p.id} person={p} />)}</div>{!people.length && <p className="wiki-muted">Aucune personne rattachée dans le registre public.</p>}</section>
    </div><aside className="wiki-profile-aside"><section className="wiki-section"><h2>Autorités & vie locale</h2><dl className="wiki-facts"><div><dt>Dirigeant documenté</dt><dd><PersonLink id={place.leaderId} name={place.leaderLabel} /></dd></div><div><dt>Comté</dt><dd>{place.county}</dd></div></dl>
      <Link className="wiki-text-link" to={`/histoires/politique?territoire=${encodeURIComponent(place.type)}`}>Comprendre les fonctions locales ↗</Link>
    </section>{guilds.length > 0 && <section className="wiki-section"><h2>Guildes du lieu</h2>{guilds.map(g => <p className="wiki-related-entry" key={g.id}><WikiLink kind="guild" id={g.id} /></p>)}</section>}</aside></div>
  </div></WikiPage>;
}
