import { Link } from 'react-router-dom';
import titles from '../../data/titre';
import { slug } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav } from '../../components/wiki/WikiShell';
import { LinkedText } from '../../components/wiki/WikiLink';
export default function Titres() {
  return <WikiPage><WikiHeader section="Titres" title="Les rangs & distinctions." intro="Les statuts du royaume et leurs conditions documentées. Une charge politique se consulte séparément." /><div className="wiki-content"><WikiNav /><div className="wiki-titles-list">{titles.map((title, index) => <section className="wiki-title-entry" id={slug(title.titre)} key={title.titre}><span>{String(index + 1).padStart(2, '0')}</span><h2>{title.titre}</h2><div><p className="wiki-prose"><LinkedText text={title.description} /></p><p className="wiki-muted"><strong>Conditions documentées</strong><br /><LinkedText text={title.requis} /></p></div></section>)}</div><Link className="wiki-text-link" to="/histoires/politique">Comprendre les fonctions et les institutions ↗</Link></div></WikiPage>;
}
