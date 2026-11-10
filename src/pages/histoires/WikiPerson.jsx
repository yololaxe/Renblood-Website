import { Link, useParams, useNavigate } from 'react-router-dom';
import { normalize, rolesById, registry, peopleById, familiesById, relatives, personPath, lifespan, vitalLabel, findLocation } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiMissing, WikiNav } from '../../components/wiki/WikiShell';
import { WikiLink, LinkedText } from '../../components/wiki/WikiLink';
import { PersonPortrait, PersonRow } from '../../components/wiki/PersonSummary';
import FamilyGraph from '../../components/wiki/FamilyGraph';
export default function WikiPerson() {
  const {
      personId
    } = useParams(),
    navigate = useNavigate(),
    person = peopleById.get(personId);
  if (!person) return <WikiMissing kind="Ce personnage" />;
  const family = familiesById.get(person.familyId),
    spouses = relatives(personId, 'spouse'),
    parents = relatives(personId, 'parents'),
    children = relatives(personId, 'children');
  const place = findLocation(person.location),
    events = registry.events.filter(e => e.personId === personId);
  return <WikiPage><WikiHeader section="Personnages" title={person.name} intro={person.title} aside={<PersonPortrait person={person} large />}>
    <div className="wiki-person-meta">{person.lineage === 'sand' && <WikiLink kind="concept" id="sand">Patronyme Sand</WikiLink>}{family && <WikiLink kind="family" id={family.id}>{family.name}</WikiLink>}<span>{lifespan(person) || vitalLabel(person.vital)}</span></div>
  </WikiHeader><div className="wiki-content"><WikiNav />
    <div className="wiki-profile-layout"><div className="wiki-profile-main">
      <section className="wiki-section"><p className="wiki-kicker">Le personnage</p><h2>Identité & parcours</h2>
        {person.biography ? <p className="wiki-prose"><LinkedText text={person.biography} /></p> : <p className="wiki-muted">Le registre conserve son nom et ses liens connus. Son histoire détaillée n’est pas encore renseignée.</p>}
        <dl className="wiki-facts wiki-facts--columns"><div><dt>Fonctions et activités</dt><dd>{person.roleIds.map(id => <WikiLink key={id} kind="role" id={id} />)}{person.occupation && !person.roleIds.some(id => normalize(rolesById.get(id)?.name) === normalize(person.occupation)) && <p><LinkedText text={person.occupation} /></p>}{!person.occupation && !person.roleIds.length && 'Non renseignées'}</dd></div>
          <div><dt>Lieu connu</dt><dd>{place ? <WikiLink kind="place" id={place.id} /> : person.location || 'Non renseigné'}</dd></div>
          {person.guildIds.length > 0 && <div><dt>Guilde</dt><dd>{person.guildIds.map(id => <WikiLink key={id} kind="guild" id={id} />)}</dd></div>}
        </dl>
      </section>
      <FamilyGraph centerId={personId} selectedId={personId} onSelect={id => {
            if (id !== personId) navigate(personPath(id));
          }} />
      {events.length > 0 && <section className="wiki-section"><p className="wiki-kicker">Les archives</p><h2>Repères de son histoire</h2><ol className="wiki-timeline">{events.map(e => <li key={e.id}><span>{e.period || 'Période non renseignée'}</span><p><LinkedText text={e.text} /></p></li>)}</ol></section>}
    </div><aside className="wiki-profile-aside">
      <section className="wiki-section"><h2>Les liens proches</h2>{[['Conjoint·e', spouses], ['Parents', parents], ['Enfants', children]].map(([label, items]) => <div className="wiki-relative-group" key={label}><h3>{label}</h3>{items.length ? items.map(p => <PersonRow key={p.id} person={p} compact />) : <p className="wiki-muted">{label === 'Conjoint·e' && person.spouseLabel ? person.spouseLabel : 'Non renseigné'}</p>}</div>)}</section>
      {family && <Link className="wiki-action" to={`/histoires/arbre/${family.id}?personne=${person.id}`}>Explorer la lignée ↗</Link>}
      <Link className="wiki-text-link" to="/histoires/personnages">← Revenir au registre</Link>
    </aside></div>
  </div></WikiPage>;
}
