import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registry } from '../../services/wiki.mjs';
import { WikiPage, WikiHeader, WikiNav } from '../../components/wiki/WikiShell';
export function BookCover({
  book,
  small = false
}) {
  return <div className={`wiki-book-cover wiki-book-cover--${book.theme}${small ? ' is-small' : ''}`} aria-hidden="true"><span className="wiki-book-imprint">Les archives de Renblood</span><div className="wiki-book-ornament">{book.id === '1' ? 'R' : '✦'}</div><strong>{book.title}</strong><span className="wiki-book-volume">Volume {book.id === '1' ? 'I' : 'II'}</span></div>;
}
export default function Livre() {
  return <WikiPage><WikiHeader section="Bibliothèque" title="Les textes du royaume." intro="Lire les chroniques, comprendre les traditions et retrouver les personnes qui traversent l’histoire." />
  <div className="wiki-content"><WikiNav /><div className="wiki-library">{registry.books.map(book => <article className="wiki-library-book" key={book.id}>
    <Link className="wiki-book-cover-link" to={`/histoires/livres/${book.id}/chapitre/1`} aria-label={`Lire ${book.title}`}><BookCover book={book} /></Link>
    <div className="wiki-book-description"><p className="wiki-kicker">Ouvrage {String(book.id).padStart(2, '0')}</p><h2><Link to={`/histoires/livres/${book.id}/chapitre/1`}>{book.title}</Link></h2><p>{book.description}</p>
      <div className="wiki-book-meta"><span>{book.chapters.length} chapitres</span><span>{book.chapters.reduce((n, c) => n + c.sections.length, 0)} sections</span><span>Environ {Math.ceil(book.wordCount / 200)} min de lecture</span></div>
      <ol className="wiki-book-contents">{book.chapters.map(c => <li key={c.id}><Link to={`/histoires/livres/${book.id}/chapitre/${c.id}`}><span>{c.id.padStart(2, '0')}</span>{c.title}<span aria-hidden="true">↗</span></Link></li>)}</ol>
      <div className="wiki-actions"><Link className="wiki-action" to={`/histoires/livres/${book.id}/chapitre/1`}>Ouvrir le livre ↗</Link><ReadingBookmark book={book} /></div>
    </div>
  </article>)}</div></div></WikiPage>;
}
function ReadingBookmark({
  book
}) {
  const [saved] = useState(() => {
    try {
      const value = JSON.parse(localStorage.getItem(`renblood:reader:${book.id}`) || 'null');
      const chapter = book.chapters.find(c => c.id === value?.chapter);
      return chapter && chapter.sections.some(s => `section-${s.id}` === value?.section) ? value : null;
    } catch {
      return null;
    }
  });
  return saved ? <Link className="wiki-text-link" to={`/histoires/livres/${book.id}/chapitre/${saved.chapter}#${saved.section}`}>Reprendre au chapitre {saved.chapter} ↗</Link> : null;
}
