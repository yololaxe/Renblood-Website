import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import './wiki.css';
import useWikiPosition from './useWikiPosition';
export function WikiPage({
  children,
  className = ''
}) {
  useWikiPosition();
  return <main className={`wiki-page ${className}`}>{children}</main>;
}
export function WikiHeader({
  section,
  title,
  intro,
  children,
  aside
}) {
  const reduced = useReducedMotion(),
    navigate = useNavigate();
  return <header className="wiki-header"><div className="wiki-content">
    <nav className="wiki-breadcrumb" aria-label="Fil de navigation"><button type="button" onClick={() => navigate(window.history.state?.idx > 0 ? -1 : "/histoire")} aria-label="Revenir à la page précédente">← Retour</button><span aria-hidden="true">/</span><Link to="/histoire">Guide</Link><span aria-hidden="true">/</span><span>{section}</span></nav>
    <motion.div className="wiki-heading" initial={reduced ? false : {
        opacity: 0,
        y: 12
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: .25
      }}>
      <div><h1>{title}</h1>{intro && <p className="wiki-intro">{intro}</p>}{children}</div>{aside && <div className="wiki-heading-aside">{aside}</div>}
    </motion.div>
  </div></header>;
}
export function WikiEmpty({
  title = 'Les archives restent ouvertes',
  children
}) {
  return <div className="wiki-empty"><h2>{title}</h2><p>{children}</p></div>;
}
export function WikiMissing({
  kind = 'Cette fiche'
}) {
  return <WikiPage><WikiHeader section="Archives" title="Fiche introuvable" intro={`${kind} n’est pas dans le registre public.`} /><div className="wiki-content wiki-section"><Link className="wiki-action" to="/histoires/personnages">Consulter le registre ↗</Link></div></WikiPage>;
}
export function WikiNav() {
  return <nav className="wiki-subnav" aria-label="Registres du royaume"><Link to="/histoires/personnages">Personnages</Link><Link to="/histoires/familles">Familles</Link><Link to="/histoires/politique">Politique</Link><Link to="/histoires/guildes">Guildes</Link><Link to="/histoires/livres">Bibliothèque</Link></nav>;
}
