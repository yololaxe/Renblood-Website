import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { familyConnection } from '../../services/wikiExplore.mjs';
import { kinshipLayout, peopleById, relatives, findPerson, personPath } from '../../services/wiki.mjs';
import { PersonPortrait, PersonRow } from './PersonSummary';
const MIN = .25,
  MAX = 2;
const clamp = value => Math.max(MIN, Math.min(MAX, value));
export default function FamilyGraph({
  centerId,
  onSelect,
  selectedId
}) {
  const [generations, setGenerations] = useState(2),
    [mode, setMode] = useState(() => window.matchMedia('(max-width:767px)').matches ? 'list' : 'tree'),
    [dragEnabled, setDragEnabled] = useState(false);
  const [fullScreen, setFullScreen] = useState(false),
    [compare, setCompare] = useState(false),
    [from, setFrom] = useState(centerId),
    [to, setTo] = useState('');
  const [fromText, setFromText] = useState(peopleById.get(centerId)?.name || ''),
    [toText, setToText] = useState('');
  const datalistId = useId(),
    graphRoot = useRef(null),
    fullScreenButton = useRef(null),
    previousCamera = useRef(null);
  const connection = useMemo(() => compare && from && to ? familyConnection(from, to) : null, [compare, from, to]);
  const viewport = useRef(null),
    pointer = useRef(null),
    restored = useRef(false),
    timer = useRef(null);
  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    scale: 1
  });
  const displayCenter = compare && from ? from : centerId;
  const layout = useMemo(() => kinshipLayout(displayCenter, generations, 64, connection?.ids || []), [displayCenter, generations, connection]);
  const nodesById = useMemo(() => new Map(layout.nodes.map(n => [n.id, n])), [layout]);
  useEffect(() => {
    setFrom(centerId);
    setFromText(peopleById.get(centerId)?.name || '');
    setTo('');
    setToText('');
  }, [centerId]);
  useEffect(() => {
    if (!fullScreen) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => graphRoot.current?.focus());
    const keyboard = event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setFullScreen(false);
        requestAnimationFrame(() => {
          if (previousCamera.current) setCamera(previousCamera.current);
          fullScreenButton.current?.focus();
        });
      }
      if (event.key === 'Tab') {
        const focusable = [...graphRoot.current.querySelectorAll('button:not(:disabled),a[href],input,select')].filter(item => item.getClientRects().length);
        const first = focusable[0],
          last = focusable.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === graphRoot.current)) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', keyboard);
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keyboard);
    };
  }, [fullScreen]);
  const storageKey = `renblood:tree:${displayCenter}:${generations}`;
  const fit = useCallback(() => {
    if (!viewport.current) return;
    const {
      width,
      height
    } = viewport.current.getBoundingClientRect();
    if (!width || !height) return;
    const node = layout.nodes.find(n => n.id === displayCenter);
    if (!node) return;
    const scale = .95;
    setCamera({
      scale,
      x: width / 2 - (node.x + 160) * scale,
      y: height / 2 - (node.y + 61) * scale
    });
  }, [layout, displayCenter]);
  const fitAll = () => {
    if (!viewport.current) return;
    restored.current = true;
    const {
      width,
      height
    } = viewport.current.getBoundingClientRect();
    const scale = clamp(Math.min((width - 40) / layout.width, (height - 40) / layout.height, 1));
    setCamera({
      scale,
      x: (width - layout.width * scale) / 2,
      y: (height - layout.height * scale) / 2
    });
  };
  useEffect(() => {
    if (!fullScreen) return;
    const frame = requestAnimationFrame(fitAll);
    return () => cancelAnimationFrame(frame);
  }, [fullScreen]);
  useEffect(() => {
    restored.current = false;
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) || 'null');
      if (saved && Number.isFinite(saved.x) && Number.isFinite(saved.y) && saved.scale >= MIN && saved.scale <= MAX) {
        setCamera(saved);
        restored.current = true;
      }
    } catch {}
    if (!restored.current) fit();
    const observer = new ResizeObserver(() => {
      if (!restored.current) fit();
    });
    if (viewport.current) observer.observe(viewport.current);
    return () => observer.disconnect();
  }, [storageKey, fit, mode, fullScreen]);
  useEffect(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(camera));
      } catch {}
    }, 200);
    return () => clearTimeout(timer.current);
  }, [camera, storageKey]);
  const zoom = useCallback(factor => {
    if (!viewport.current) return;
    const width = viewport.current.clientWidth,
      height = viewport.current.clientHeight;
    restored.current = true;
    setCamera(c => {
      const scale = clamp(c.scale * factor),
        ratio = scale / c.scale;
      return {
        scale,
        x: width / 2 - (width / 2 - c.x) * ratio,
        y: height / 2 - (height / 2 - c.y) * ratio
      };
    });
  }, []);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const wheel = event => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      zoom(event.deltaY > 0 ? .9 : 1.1);
    };
    element.addEventListener('wheel', wheel, {
      passive: false
    });
    return () => element.removeEventListener('wheel', wheel);
  }, [zoom, mode, fullScreen]);
  if (!peopleById.has(centerId)) return null;
  const familyList = [['Parents', relatives(centerId, 'parents')], ['Conjoint·e', relatives(centerId, 'spouse')], ['Enfants', relatives(centerId, 'children')], ['Frères et sœurs', relatives(centerId, 'sibling')]];
  const edgeClass = edge => `${edge.type === 'spouse' ? 'is-union' : ''}${connection?.edges.includes(edge.id) ? ' is-route' : connection ? ' is-muted' : ''}`;
  const parsePerson = value => {
    const id = /P\d{4,}$/.exec(value)?.[0];
    return peopleById.has(id) ? id : findPerson(value)?.id || '';
  };
  const graph = <section ref={graphRoot} tabIndex={fullScreen ? -1 : undefined} role={fullScreen ? 'dialog' : undefined} aria-modal={fullScreen ? true : undefined} className={`wiki-graph wiki-graph--${mode}${fullScreen ? ' wiki-graph--fullscreen' : ''}`} aria-label="Généalogie interactive">
    <div className="wiki-graph-toolbar"><div><h2>Les liens de famille</h2><p>Les unions et filiations connues dans les archives.</p></div>
      <div className="wiki-graph-mode" role="group" aria-label="Présentation de la généalogie"><button type="button" aria-pressed={mode === 'tree'} onClick={() => setMode('tree')}>Arbre</button><button type="button" aria-pressed={mode === 'list'} onClick={() => setMode('list')}>Proches</button></div>
      <button type="button" ref={fullScreenButton} className="wiki-text-link" aria-label={fullScreen ? 'Quitter le plein écran' : 'Afficher l’arbre en plein écran'} onClick={() => {
        if (fullScreen) {
          setFullScreen(false);
          requestAnimationFrame(() => {
            if (previousCamera.current) setCamera(previousCamera.current);
            fullScreenButton.current?.focus();
          });
        } else {
          previousCamera.current = camera;
          setMode('tree');
          setFullScreen(true);
        }
      }}>{fullScreen ? 'Fermer ×' : 'Plein écran ↗'}</button>
    </div>
    <div className="wiki-graph-legend" aria-label="Légende des relations"><span><i />Filiation · parent → enfant</span><span><i className="is-union" />Union</span><button type="button" className="wiki-text-link" aria-pressed={compare} onClick={() => setCompare(value => !value)}>{compare ? 'Fermer la comparaison' : 'Relier deux personnes ↗'}</button></div>
    {compare && <><div className="wiki-graph-comparison"><label>Depuis<input list={datalistId} value={fromText} placeholder="Nom ou identifiant…" onChange={event => {
            setFromText(event.target.value);
            setFrom(parsePerson(event.target.value));
          }} /></label><label>Vers<input list={datalistId} value={toText} placeholder="Choisir ou cliquer une personne" onChange={event => {
            setToText(event.target.value);
            setTo(parsePerson(event.target.value));
          }} /></label><button className="wiki-text-link" type="button" onClick={() => {
          setTo('');
          setToText('');
        }}>Effacer ×</button><datalist id={datalistId}>{[...peopleById.values()].map(person => <option value={`${person.name} · ${person.id}`} key={person.id} />)}</datalist></div><div className="wiki-graph-route" role="status">{!from || !to ? 'Choisissez deux personnes du registre, ou cliquez un personnage dans l’arbre pour définir la destination.' : connection ? <><p>{connection.edges.length} lien{connection.edges.length > 1 ? 's' : ''} documenté{connection.edges.length > 1 ? 's' : ''} entre les deux personnes.</p><ol>{connection.ids.map((id, index) => <li key={id}>{index > 0 && <small>→ {connection.steps[index - 1]} →</small>}<Link to={personPath(id)}>{peopleById.get(id)?.name}</Link></li>)}</ol></> : 'Aucun chemin familial documenté trouvé dans les archives (24 liens maximum). Cela ne permet pas de conclure à une absence de parenté.'}</div></>}
    <div className="wiki-graph-controls"><label>Générations<select value={generations} onChange={event => setGenerations(Number(event.target.value))}><option value={1}>1 génération</option><option value={2}>2 générations</option><option value={3}>3 générations</option></select></label>
      <div role="group" aria-label="Cadrage de l’arbre"><button type="button" aria-label="Réduire l’arbre" onClick={() => zoom(.85)}>−</button><button type="button" onClick={() => {
          restored.current = false;
          fit();
        }}>Recentrer</button><button type="button" onClick={fitAll}>Vue d’ensemble</button><button type="button" aria-label="Agrandir l’arbre" onClick={() => zoom(1.15)}>+</button></div>
      <button type="button" className="wiki-graph-touch" aria-pressed={dragEnabled} onClick={() => setDragEnabled(v => !v)}>Déplacer au toucher</button>
    </div>
    <div ref={viewport} className={`wiki-graph-viewport${dragEnabled ? ' can-drag' : ''}`} style={{
      touchAction: dragEnabled ? 'none' : 'pan-y'
    }} onPointerDown={event => {
      if (event.target.closest('button,a') || event.button !== 0 || event.pointerType === 'touch' && !dragEnabled) return;
      restored.current = true;
      pointer.current = {
        x: event.clientX,
        y: event.clientY,
        camera
      };
      event.currentTarget.setPointerCapture(event.pointerId);
    }} onPointerMove={event => {
      if (!pointer.current) return;
      const start = pointer.current;
      setCamera({
        ...start.camera,
        x: start.camera.x + event.clientX - start.x,
        y: start.camera.y + event.clientY - start.y
      });
    }} onPointerUp={() => {
      pointer.current = null;
    }} onPointerCancel={() => {
      pointer.current = null;
    }}>
      <div className="wiki-graph-scene" style={{
        width: layout.width,
        height: layout.height,
        transform: `translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`
      }}>
        <svg width={layout.width} height={layout.height} className="wiki-graph-lines" aria-hidden="true">{layout.edges.map(edge => {
            const a = nodesById.get(edge.a),
              b = nodesById.get(edge.b);
            if (!a || !b) return null;
            if (edge.type === 'spouse') return <line key={edge.id} x1={a.x + 80} y1={a.y + 63} x2={b.x + 80} y2={b.y + 63} className={edgeClass(edge)} />;
            const x1 = a.x + 80,
              y1 = a.y + 122,
              x2 = b.x + 80,
              y2 = b.y;
            return <path key={edge.id} d={`M${x1},${y1} V${(y1 + y2) / 2} H${x2} V${y2}`} fill="none" className={edgeClass(edge)} />;
          })}</svg>
        {layout.nodes.map(node => <button type="button" className={`wiki-graph-node${node.id === centerId ? ' is-center' : ''}${node.id === selectedId ? ' is-selected' : ''}${connection?.ids.includes(node.id) ? ' is-route' : connection ? ' is-muted' : ''}`} key={node.id} style={{
          left: node.x,
          top: node.y
        }} onClick={() => {
          if (compare) {
            setTo(node.id);
            setToText(node.person.name);
          } else onSelect?.(node.id);
        }} aria-label={`Consulter ${node.person.name}${node.id === centerId ? ', personnage central' : ''}`}>
          <PersonPortrait person={node.person} /><strong>{node.person.name}</strong><small>{node.person.vital === 'dead' ? '† ' : ''}{node.person.birth || familiesLabel(node.person)}</small>
        </button>)}
      </div>
    </div>
    <div className="wiki-kinship-list">{familyList.map(([label, people]) => <section key={label}><h3>{label}</h3>{people.length ? people.map(p => <PersonRow key={p.id} person={p} compact />) : <p className="wiki-muted">Aucun lien renseigné.</p>}</section>)}</div>
    <p className="wiki-graph-help">Sélectionnez une personne pour consulter sa fiche. Sur ordinateur, Ctrl + molette permet de zoomer.{layout.truncated ? ' Certaines branches sont repliées pour garder l’arbre lisible.' : ''}</p>
  </section>;
  return fullScreen ? createPortal(graph, document.body) : graph;
}
function familiesLabel(person) {
  return person.houseId ? 'Maison ' + person.houseId.charAt(0).toUpperCase() + person.houseId.slice(1) : 'Identité connue';
}
