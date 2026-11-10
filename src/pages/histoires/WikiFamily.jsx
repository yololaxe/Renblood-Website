import { Link, useParams } from 'react-router-dom';
import { familiesById, familyPeople, registry, findLocation } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiMissing, WikiNav } from '../../components/wiki/WikiShell';
import { WikiLink } from '../../components/wiki/WikiLink';
import { PersonRow } from '../../components/wiki/PersonSummary';
export default function WikiFamily() {
  const {
      familyId
    } = useParams(),
    family = familiesById.get(familyId);
  if (!family) return <WikiMissing kind="Cette famille" />;
  const people = familyPeople(familyId),
    place = findLocation(family.location),
    members = new Set(people.map(p => p.id));
  const alliances = registry.relations.filter(r => r.type === 'spouse' && (members.has(r.a) || members.has(r.b)));
  const main = people.find(p => p.id === 'P0088') || people.find(p => p.vital === 'alive') || people[0];
  return <WikiPage><WikiHeader section={family.kind === 'great' ? 'Grandes maisons' : 'Familles secondaires'} title={family.name} intro={family.motto || 'Une famille dans les archives du royaume.'} aside={family.blazon && <img className="wiki-house-crest" src={family.blazon} alt={`Blason de ${family.name}`} />} />
    <div className="wiki-content"><WikiNav /><div className="wiki-profile-layout"><div>
      <section className="wiki-section"><p className="wiki-kicker">La lignée</p><h2>Une histoire, des visages</h2>{family.biography && <p className="wiki-prose">{family.biography}</p>}
      {place && <p className="wiki-location-note">Fief : <WikiLink kind="place" id={place.id} /></p>}
      <div className="wiki-actions">{main && <Link className="wiki-action" to={`/histoires/arbre/${family.id}?personne=${main.id}`}>Explorer la généalogie ↗</Link>}<Link className="wiki-action" to={`/histoires/personnages?famille=${family.id}`}>Tous les personnages</Link></div>
      </section><section className="wiki-section"><h2>Les membres connus</h2><div className="wiki-people-grid wiki-people-grid--two">{people.map(p => <PersonRow key={p.id} person={p} />)}</div></section>
      {alliances.length > 0 && <section className="wiki-section"><h2>Les unions connues</h2><div className="wiki-unions">{alliances.map(edge => <p key={edge.id}><WikiLink kind="person" id={edge.a} /><span aria-label="union">⟷</span><WikiLink kind="person" id={edge.b} /></p>)}</div></section>}
    </div><aside className="wiki-profile-aside"><section className="wiki-section"><h2>Repères</h2><dl className="wiki-facts"><div><dt>Famille</dt><dd>{family.kind === 'great' ? 'Grande maison' : 'Famille secondaire'}</dd></div>{family.county && <div><dt>Comté</dt><dd>{family.county}</dd></div>}<div><dt>Personnages connus</dt><dd>{people.length}</dd></div>{family.symbol && <div><dt>Emblème</dt><dd>{family.symbol}</dd></div>}</dl></section>
      {family.resources && <details className="wiki-details"><summary>Ressources documentées</summary><dl className="wiki-facts">{[['Soldats', 'soldiers'], ['Chevaux', 'horses'], ['Dragons', 'dragons'], ['Bâtiments', 'buildings'], ['Magiciennes', 'mages'], ['Navires', 'ships']].map(([label, key]) => <div key={key}><dt>{label}</dt><dd>{family.resources[key].toLocaleString('fr-FR')}</dd></div>)}</dl><p className="wiki-muted">Chiffres du registre historique ; ils ne représentent pas des stocks ou soldes de joueurs.</p></details>}
      <Link className="wiki-text-link" to={`/histoires/familles${family.kind === 'secondary' ? '?categorie=secondary' : ''}`}>← Toutes les familles</Link>
    </aside></div></div></WikiPage>;
}
