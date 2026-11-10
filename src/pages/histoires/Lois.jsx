import { Link, useLocation } from 'react-router-dom';
import laws from '../../data/lois';
import { slug } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav } from '../../components/wiki/WikiShell';
import { LinkedText } from '../../components/wiki/WikiLink';
export default function Lois() {
  const location = useLocation(),
    hash = decodeURIComponent(location.hash.slice(1));
  const selected = laws.find(l => hash === slug(l.titre) || hash.startsWith(slug(l.titre) + '-article-')) || laws[0];
  return <WikiPage><WikiHeader section="Lois" title="Les règles du royaume." intro="Retrouver un texte, comprendre ses notions et consulter les autorités qui l’appliquent." /><div className="wiki-content"><WikiNav />
    <div className="wiki-function-workspace"><aside><nav aria-label="Textes du royaume">{laws.map(law => <Link key={law.titre} to={`#${slug(law.titre)}`} aria-current={law === selected ? 'page' : undefined}>{law.titre}<span aria-hidden="true">↗</span></Link>)}</nav></aside>
    <article className="wiki-function-detail" id={slug(selected.titre)}><p className="wiki-kicker">Le texte</p><h2>{selected.titre}</h2>{selected.articles.map((article, index) => <section className="wiki-law-article" id={`${slug(selected.titre)}-article-${index + 1}`} key={`${article.titre}-${index}`}><h3>{article.titre}</h3>{article.contenu.map((paragraph, i) => <p className="wiki-prose" key={i}><LinkedText text={paragraph} /></p>)}<Link className="wiki-section-permalink" to={`#${slug(selected.titre)}-article-${index + 1}`}>Lien vers cet article ↗</Link></section>)}</article>
    </div></div></WikiPage>;
}
