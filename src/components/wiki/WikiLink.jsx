import { memo, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { conceptsById, conceptPath, familiesById, peopleById, guildsById, rolesById, locationsById, findPerson, personPath, familyPath, guildPath, rolePath, placePath, normalize } from '../../services/wiki.mjs';
function entity(kind, id) {
  const item = {
    person: peopleById,
    family: familiesById,
    guild: guildsById,
    role: rolesById,
    place: locationsById,
    concept: conceptsById
  }[kind]?.get(id);
  if (!item) return null;
  return {
    name: item.name,
    path: {
      person: personPath,
      family: familyPath,
      guild: guildPath,
      role: rolePath,
      place: placePath,
      concept: conceptPath
    }[kind](id),
    description: kind === 'person' ? [item.title, item.publicOffice || item.occupation, item.location].filter(Boolean).join(' · ') : item.description || item.biography || item.summary || (kind === 'guild' ? `Direction : ${item.leaderLabel} · ${item.location}` : kind === 'place' ? `${item.type} · ${item.county}` : item.kind === 'secondary' ? 'Famille secondaire du royaume' : item.motto),
    kind
  };
}
export function WikiLink({
  kind,
  id,
  children,
  preview = true,
  className = ''
}) {
  const info = entity(kind, id),
    uid = useId(),
    trigger = useRef(null),
    panel = useRef(null),
    timer = useRef(null),
    suppressFocus = useRef(false);
  const [open, setOpen] = useState(false),
    [pinned, setPinned] = useState(false),
    [position, setPosition] = useState({
      left: 12,
      top: 12
    });
  const returnFocus = () => {
    suppressFocus.current = true;
    trigger.current?.focus({
      preventScroll: true
    });
    requestAnimationFrame(() => {
      suppressFocus.current = false;
    });
  };
  const cancel = () => {
    clearTimeout(timer.current);
  };
  const show = () => {
    cancel();
    timer.current = setTimeout(() => setOpen(true), 320);
  };
  const ownsFocus = () => trigger.current?.contains(document.activeElement) || panel.current?.contains(document.activeElement);
  const hide = () => {
    if (pinned || ownsFocus()) return;
    cancel();
    timer.current = setTimeout(() => {
      if (!ownsFocus()) setOpen(false);
    }, 150);
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!open) return;
    const place = () => {
      if (!trigger.current) return;
      const rect = trigger.current.getBoundingClientRect(),
        height = panel.current?.offsetHeight || 220,
        width = Math.min(340, window.innerWidth - 24);
      setPosition({
        left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)),
        top: Math.max(12, Math.min(window.innerHeight - height - 12, rect.bottom + height + 12 < window.innerHeight ? rect.bottom + 8 : rect.top - height - 8))
      });
    };
    const frame = requestAnimationFrame(place);
    const close = event => {
      if (event.key === 'Escape') {
        setOpen(false);
        setPinned(false);
        returnFocus();
      } else if (event.type === 'pointerdown' && !trigger.current?.contains(event.target) && !panel.current?.contains(event.target)) {
        setOpen(false);
        setPinned(false);
      }
    };
    const scroll = () => {
      if (!pinned && !ownsFocus()) setOpen(false);else place();
    };
    window.addEventListener('keydown', close);
    document.addEventListener('pointerdown', close);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', scroll, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', close);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', scroll, true);
    };
  }, [open, pinned]);
  if (!info) return <span>{children}</span>;
  return <span className={`wiki-reference ${className}`} onMouseEnter={preview ? show : undefined} onMouseLeave={preview ? hide : undefined}>
    <Link ref={trigger} className="wiki-link" to={info.path} aria-describedby={open ? uid : undefined} aria-haspopup={preview ? 'dialog' : undefined} onClick={event => {
      if (preview && ['role', 'concept'].includes(kind) && window.matchMedia('(pointer:coarse)').matches && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        cancel();
        setPinned(true);
        setOpen(true);
      }
    }} onFocus={preview ? () => {
      if (!suppressFocus.current) {
        cancel();
        setOpen(true);
      }
    } : undefined} onBlur={event => {
      if (!panel.current?.contains(event.relatedTarget)) hide();
    }}>{children || info.name}</Link>
    {preview && <button type="button" className="wiki-reference-more" aria-label={`Aperçu : ${info.name}`} aria-expanded={open} onClick={() => {
      cancel();
      setPinned(!open);
      setOpen(!open);
    }}>ⓘ</button>}
    {open && preview && createPortal(<aside ref={panel} id={uid} className="wiki-popover" role="dialog" aria-modal="false" aria-label={`Aperçu de ${info.name}`} style={position} onMouseEnter={cancel} onMouseLeave={hide} onFocus={cancel} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget) && !trigger.current?.contains(event.relatedTarget)) hide();
    }}>
      <div className="wiki-popover-top"><span>{{
            person: 'Personnage',
            family: 'Famille',
            guild: 'Guilde',
            role: 'Fonction',
            place: 'Lieu',
            concept: 'Notion'
          }[kind]}</span><button type="button" aria-label="Fermer l’aperçu" onClick={() => {
          setOpen(false);
          setPinned(false);
          returnFocus();
        }}>×</button></div>
      <strong>{info.name}</strong><p>{info.description || 'Consulter la fiche du registre.'}</p>
      <div className="wiki-popover-actions"><Link to={info.path} onClick={() => {
          setOpen(false);
          setPinned(false);
        }}>Ouvrir la fiche ↗</Link>{!pinned && <button type="button" onClick={() => setPinned(true)}>Épingler</button>}</div>
    </aside>, document.body)}
  </span>;
}
export function PersonLink({
  id,
  name,
  ...props
}) {
  const person = id ? peopleById.get(id) : findPerson(name);
  return person ? <WikiLink kind="person" id={person.id} {...props}>{props.children || person.name}</WikiLink> : <span>{name || 'Non renseigné'}</span>;
}
// Explicit tokens only: a rendered reference cannot execute HTML or match a substring of a name.
const references = [...[...conceptsById.values()].map(c => ({
  kind: 'concept',
  id: c.id,
  label: c.name
})), ...[...rolesById.values()].map(r => ({
  kind: 'role',
  id: r.id,
  label: r.name.replace(/ x2$/, '')
})), ...[...familiesById.values()].filter(f => f.kind === 'great').map(f => ({
  kind: 'family',
  id: f.id,
  label: f.name
})), ...[...guildsById.values()].map(g => ({
  kind: 'guild',
  id: g.id,
  label: g.name.replace(/^La /, '')
})), ...[...locationsById.values()].map(p => ({
  kind: 'place',
  id: p.id,
  label: p.name
})), ...[...peopleById.values()].filter(p => p.name.includes(' ') && findPerson(p.name)?.id === p.id).map(p => ({
  kind: 'person',
  id: p.id,
  label: p.name
}))].sort((a, b) => b.label.length - a.label.length);
const byLabel = new Map();
for (const ref of references) if (!byLabel.has(normalize(ref.label))) byLabel.set(normalize(ref.label), ref);
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const pattern = new RegExp(`(?<![\\p{L}])(?:${references.map(ref => escapeRegex(ref.label)).join('|')})(?![\\p{L}])`, 'giu');
export const LinkedText = memo(function LinkedText({
  text = ''
}) {
  if (!text) return null;
  const matches = [...text.matchAll(pattern)].slice(0, 18);
  let cursor = 0;
  const parts = [];
  for (const match of matches) {
    const ref = byLabel.get(normalize(match[0]));
    if (!ref) continue;
    parts.push(text.slice(cursor, match.index));
    parts.push(<WikiLink key={`${ref.kind}-${ref.id}-${match.index}`} kind={ref.kind} id={ref.id}>{match[0]}</WikiLink>);
    cursor = match.index + match[0].length;
  }
  parts.push(text.slice(cursor));
  return <>{parts}</>;
});
