import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { books } from '../../../services/wiki.mjs';
import { BookmarkButton } from '../../../components/wiki/WikiBookmarks';
import { WikiPage, WikiMissing } from '../../../components/wiki/WikiShell';
import { LinkedText } from '../../../components/wiki/WikiLink';
export default function Chapitres() {
  const {
      livreId,
      chapitreId
    } = useParams(),
    location = useLocation(),
    book = books.find(b => b.id === livreId),
    chapter = book?.chapters.find(c => c.id === chapitreId);
  const [size, setSize] = useState(() => {
    try {
      return Math.max(0, Math.min(2, Number(localStorage.getItem('renblood:reader:size')) || 0));
    } catch {
      return 0;
    }
  });
  const [active, setActive] = useState(''),
    [progress, setProgress] = useState(0),
    body = useRef(null),
    lastSection = useRef('');
  useEffect(() => {
    try {
      localStorage.setItem('renblood:reader:size', String(size));
    } catch {}
  }, [size]);
  useEffect(() => {
    if (!chapter) return;
    const sections = [...(body.current?.querySelectorAll('section[id]') || [])];
    let frame = null;
    const measure = () => {
      if (!body.current) return;
      const rect = body.current.getBoundingClientRect();
      setProgress(Math.max(0, Math.min(100, (-rect.top + 150) / Math.max(1, rect.height - window.innerHeight + 150) * 100)));
      const anchor = Math.min(220, window.innerHeight * .3);
      const section = sections.findLast(element => element.getBoundingClientRect().top <= anchor) || sections[0];
      if (section && lastSection.current !== section.id) {
        setActive(section.id);
        lastSection.current = section.id;
        try {
          localStorage.setItem(`renblood:reader:${livreId}`, JSON.stringify({
            chapter: chapitreId,
            section: section.id
          }));
        } catch {}
      }
    };
    lastSection.current = '';
    const scroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };
    measure();
    window.addEventListener('scroll', scroll, {
      passive: true
    });
    return () => {
      if (frame !== null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scroll);
    };
  }, [livreId, chapitreId, location.hash, chapter]);
  if (!book || !chapter) return <WikiMissing kind="Ce chapitre" />;
  const index = book.chapters.indexOf(chapter),
    next = book.chapters[index + 1],
    previous = book.chapters[index - 1];
  return <WikiPage className={`wiki-reader wiki-reader-size-${size}`}><div className="wiki-content">
    <nav className="wiki-reader-nav" aria-label="Bibliothèque"><Link to="/histoires/livres">← La bibliothèque</Link><span>{book.title}</span><div role="group" aria-label="Taille du texte"><button type="button" disabled={size === 0} onClick={() => setSize(v => v - 1)} aria-label="Réduire le texte">A−</button><button type="button" disabled={size === 2} onClick={() => setSize(v => v + 1)} aria-label="Agrandir le texte">A+</button></div></nav>
    <div className="wiki-reading-progress" role="progressbar" aria-label="Avancement dans le chapitre" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><span style={{
          width: `${progress}%`
        }} /></div>
    <div className="wiki-reader-layout"><aside className="wiki-reader-toc"><h2>Dans ce livre</h2><Contents book={book} chapter={chapter} active={active} /></aside>
      <article className="wiki-reading-body" ref={body}><header className="wiki-reading-heading"><p className="wiki-kicker">Chapitre {chapter.id} / {book.chapters.length}</p><h1>{chapter.title}</h1></header>
        <details className="wiki-reader-mobile-toc"><summary>Sommaire du livre et du chapitre</summary><Contents book={book} chapter={chapter} active={active} /></details>
        {chapter.sections.map(section => <section className="wiki-reading-section" key={section.id} id={`section-${section.id}`}><h2><span>{section.id.padStart(2, '0')}</span>{section.title}</h2>{section.paragraphs.map((text, i) => <p key={i}><LinkedText text={text} /></p>)}<BookmarkButton compact type="Passage" path={`${location.pathname}#section-${section.id}`} label={`${book.title} · ${section.title}`} /><Link className="wiki-section-permalink" to={`${location.pathname}#section-${section.id}`} aria-label={`Lien vers ${section.title}`}>Lien vers ce passage ↗</Link></section>)}
        <nav className="wiki-reader-paging" aria-label="Chapitres">{previous ? <Link to={`/histoires/livres/${livreId}/chapitre/${previous.id}`}>← {previous.title}</Link> : <span />}{next ? <Link to={`/histoires/livres/${livreId}/chapitre/${next.id}`}>{next.title} →</Link> : <Link to="/histoires/livres">Retour à la bibliothèque ↗</Link>}</nav>
      </article><aside className="wiki-reader-side"><p className="wiki-kicker">Pour explorer</p><h2>Les repères du royaume</h2><Link to="/histoires/personnages">Le registre des personnages ↗</Link><Link to="/histoires/familles">Les maisons et leurs liens ↗</Link><Link to="/histoires/politique">Les institutions ↗</Link><Link to="/histoires/guildes">Les guildes ↗</Link></aside>
    </div>
  </div></WikiPage>;
}
function Contents({
  book,
  chapter,
  active
}) {
  return <nav aria-label="Sommaire"><ol>{book.chapters.map(c => <li key={c.id}><Link to={`/histoires/livres/${book.id}/chapitre/${c.id}`} aria-current={c.id === chapter.id ? 'page' : undefined}><span>{c.id.padStart(2, '0')}</span>{c.title}</Link>{c.id === chapter.id && <ul>{c.sections.map(s => <li key={s.id}><Link to={`/histoires/livres/${book.id}/chapitre/${c.id}#section-${s.id}`} aria-current={active === `section-${s.id}` ? 'location' : undefined}>{s.title}</Link></li>)}</ul>}</li>)}</ol></nav>;
}
