import { useParams } from 'react-router-dom';
import { registry, conceptsById } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav, WikiMissing } from '../../components/wiki/WikiShell';
import { PersonRow } from '../../components/wiki/PersonSummary';
export default function WikiConcept() {
  const {
      conceptId
    } = useParams(),
    concept = conceptsById.get(conceptId);
  if (!concept) return <WikiMissing kind="Cette notion" />;
  const people = conceptId === 'sand' ? registry.people.filter(p => p.lineage === 'sand') : conceptId === 'marechal-des-armees' ? registry.people.filter(p => p.id === 'P0119') : [];
  return <WikiPage><WikiHeader section="Notions du royaume" title={concept.name} intro={concept.description} /><div className="wiki-content"><WikiNav />
    <section className="wiki-section"><h2>{conceptId === 'sand' ? 'Personnes portant ce patronyme' : 'Personnage lié à cette fonction'}</h2>{conceptId === 'sand' && <p className="wiki-muted">Cette liste n’établit aucun lien de parenté entre les personnes présentées.</p>}<div className="wiki-people-grid">{people.map(p => <PersonRow key={p.id} person={p} />)}</div></section>
  </div></WikiPage>;
}
