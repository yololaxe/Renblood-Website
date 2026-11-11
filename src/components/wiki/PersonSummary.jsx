import { Link } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import { familiesById, relatives, personPath, lifespan, vitalLabel } from '../../services/wiki.mjs';
import { PersonLink, WikiLink, LinkedText } from './WikiLink';
export function PersonPortrait({
  person,
  large = false,
  draggable
}) {
  const house = familiesById.get(person.houseId);
  return <div className={`wiki-portrait${large ? ' wiki-portrait--large' : ''}${person.vital === 'dead' ? ' is-deceased' : ''}`} aria-hidden="true">
    {house?.blazon ? <img src={house.blazon} alt="" loading="lazy" draggable={draggable} /> : <FaUser />}<span>{person.vital === 'dead' ? '†' : person.name.split(' ').map(w => w.charAt(0)).slice(0, 2).join('')}</span>
  </div>;
}
export function PersonRow({
  person,
  description,
  compact = false
}) {
  return <Link to={personPath(person.id)} className={`wiki-person-row${compact ? ' is-compact' : ''}`}>
    <PersonPortrait person={person} /><span className="wiki-person-row-copy"><strong>{person.name}</strong><small>{description || person.publicOffice || person.occupation || person.title || 'Personnage du royaume'}</small></span><span className="wiki-arrow" aria-hidden="true">↗</span>
  </Link>;
}
export default function PersonSummary({
  person,
  onCenter
}) {
  const family = familiesById.get(person.familyId),
    spouses = relatives(person.id, 'spouse');
  return <aside className="wiki-person-summary" aria-label={`Fiche de ${person.name}`}>
    <PersonPortrait person={person} large />
    <p className="wiki-kicker">Le registre / Personnage</p><h2><Link to={personPath(person.id)}>{person.name}</Link></h2>
    {person.lineage === 'sand' && <WikiLink kind="concept" id="sand">Patronyme Sand</WikiLink>}{family && <WikiLink kind="family" id={family.id}>{family.name}</WikiLink>}
    {person.title && <p className="wiki-summary-title">{person.title}</p>}
    <dl className="wiki-facts"><div><dt>Fonction / activité</dt><dd><LinkedText text={person.publicOffice || person.occupation || 'Non renseignée'} /></dd></div>
      <div><dt>Conjoint·e</dt><dd>{spouses.length ? spouses.map(p => <PersonLink key={p.id} id={p.id} />) : person.spouseLabel || 'Non renseigné·e'}</dd></div>
      <div><dt>Repères</dt><dd>{lifespan(person) || vitalLabel(person.vital)}</dd></div>
    </dl>
    <div className="wiki-actions"><Link className="wiki-action" to={personPath(person.id)}>Consulter sa fiche ↗</Link>{onCenter && <button type="button" className="wiki-action" onClick={onCenter}>Centrer son arbre</button>}</div>
  </aside>;
}
