import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { familiesById, familyPeople, peopleById } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiMissing } from '../../components/wiki/WikiShell';
import PersonSummary from '../../components/wiki/PersonSummary';
import FamilyGraph from '../../components/wiki/FamilyGraph';
export default function Arbre() {
  const {
      famille
    } = useParams(),
    [params, setParams] = useSearchParams(),
    family = familiesById.get(famille);
  const people = familyPeople(famille),
    requested = params.get('personne');
  const center = peopleById.get(requested) || people.find(p => p.id === 'P0088') || people.find(p => p.vital === 'alive') || people[0];
  const [selected, setSelected] = useState(center?.id);
  useEffect(() => {
    setSelected(center?.id);
  }, [center?.id]);
  if (!family || !center) return <WikiMissing kind="Cette généalogie" />;
  const person = peopleById.get(selected) || center;
  return <WikiPage className="wiki-tree-page"><WikiHeader section="Généalogie" title={`La lignée ${family.name}.`} intro="Suivez un lien de famille, puis recentrez l’arbre sur la personne qui vous intéresse.">
    <Link className="wiki-text-link" to={`/histoires/familles/${family.id}`}>La maison et ses membres ↗</Link>
  </WikiHeader><div className="wiki-content wiki-tree-layout"><FamilyGraph centerId={center.id} selectedId={person.id} onSelect={setSelected} />
    <PersonSummary person={person} onCenter={() => setParams({
        personne: person.id
      })} /></div></WikiPage>;
}
