import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FaCompass, FaSyncAlt, FaPlus, FaMinus, FaSearch, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import RealmHeader from "../components/RealmHeader";
import { useUser } from "../context/UserContext";
import { fetchCadastre, sendLandChange, cadastreError } from "../services/cadastreApi";
import { SHALETON, OWNER_TYPES, boundsFor, sameBounds, safeColor, isKnown, rectangle, cellPath, knownPath, plotAt, blockToChunk } from "../services/cadastre.mjs";
import "./cadastre.css";

const initialView = { x: SHALETON.chunkX, z: SHALETON.chunkZ, size: 40 };
const blank = { name: "", owner: "", ownerType: "PLAYER", city: "Shaleton", color: "#b79c65", description: "" };
const timeLabel = date => date ? new Date(date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "Aucune synchronisation reçue";
const states = { PENDING: "En attente du serveur", APPLIED: "Appliqué", CONFLICT: "Conflit · à reprendre", REJECTED: "Refusé" };

export default function Cadastre() {
  const { userId, userRank } = useUser(), location = useLocation(), reduced = useReducedMotion();
  const [manage, setManage] = useState(location.pathname.startsWith("/admin/"));
  const admin = userRank === "Admin" && manage;
  const [view, setView] = useState(initialView), [aspect, setAspect] = useState(1.5);
  const [snapshot, setSnapshot] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [selection, setSelection] = useState([]), [cell, setCell] = useState(null), [query, setQuery] = useState("");
  const [tool, setTool] = useState("move"), [touchMove, setTouchMove] = useState(false), [hover, setHover] = useState(null);
  const [target, setTarget] = useState(""), [creating, setCreating] = useState(false), [ident, setIdent] = useState("");
  const [metadata, setMetadata] = useState(blank), [reason, setReason] = useState(""), [confirmation, setConfirmation] = useState(null);
  const [sending, setSending] = useState(false), [notice, setNotice] = useState("");
  const [coords, setCoords] = useState({ x: "-716", z: "-1300" });
  const stage = useRef(null), gesture = useRef(null), abort = useRef(null), serial = useRef(0), cooldown = useRef(0), pendingRequest = useRef(null);
  const gridId = useId().replace(/:/g, ""), fogId = `${gridId}fog`;
  const data = snapshot?.user === userId && snapshot.admin === admin ? snapshot.value : null;
  const bounds = useMemo(() => boundsFor(view, aspect), [view, aspect]);
  const boundsRef = useRef(bounds); boundsRef.current = bounds;
  const viewRef = useRef(view); viewRef.current = view;
  const plots = data?.plots || [], directory = data?.directory || [];
  const changed = !!data && !sameBounds(data.bounds, bounds);
  const selectedKnown = cell && isKnown(data, cell.x, cell.z), selectedPlot = cell && plotAt(data, cell.x, cell.z);
  const visibleList = plots.filter(plot => `${plot.name} ${plot.owner} ${plot.city}`.toLocaleLowerCase("fr").includes(query.toLocaleLowerCase("fr")));
  const loadedCount = useMemo(() => (data?.known || []).reduce((sum, row) => sum + row.spans.reduce((n, [a, b]) => n + b - a + 1, 0), 0), [data]);
  const refresh = useCallback(async (force = false) => {
    if (!force && Date.now() < cooldown.current) return;
    cooldown.current = Date.now() + 5000; abort.current?.abort();const controller = new AbortController();abort.current = controller;
    const generation = ++serial.current;setBusy(true);setError("");
    try {
      const box = stage.current?.getBoundingClientRect();
      const requested = box?.height ? boundsFor(viewRef.current, box.width / box.height) : boundsRef.current;
      const result = await fetchCadastre(requested, admin, controller.signal);
      if (generation === serial.current) setSnapshot({ user: userId, admin, value: result });
    } catch (failure) { if (!controller.signal.aborted && generation === serial.current) setError(cadastreError(failure)); }
    finally { if (generation === serial.current) setBusy(false); }
  }, [userId, admin]);
  useEffect(() => { setSnapshot(null);setSelection([]);setCell(null);setConfirmation(null);setNotice("");pendingRequest.current = null;refresh(true);return () => {serial.current++;abort.current?.abort();}; }, [refresh]);
  useEffect(() => {
    if (!stage.current) return;
    const observer = new ResizeObserver(([entry]) => { const { width, height } = entry.contentRect;if (height > 0) setAspect(width / height); });
    observer.observe(stage.current);return () => observer.disconnect();
  }, []);
  useEffect(() => { setConfirmation(null);pendingRequest.current = null; }, [target, creating, metadata, reason, selection, ident]);
  const move = (x, z) => { setView(v => ({ ...v, x: Math.max(-1874900, Math.min(1874900, v.x + x)), z: Math.max(-1874900, Math.min(1874900, v.z + z)) })); };
  const zoom = factor => setView(v => ({ ...v, size: Math.max(8, Math.min(96, Math.round(v.size * factor))) }));
  const point = event => {
    const box = stage.current.getBoundingClientRect();
    return { x: Math.floor(bounds[0] + (event.clientX - box.left) / box.width * (bounds[2] - bounds[0] + 1)), z: Math.floor(bounds[1] + (event.clientY - box.top) / box.height * (bounds[3] - bounds[1] + 1)) };
  };
  const down = event => {
    if (event.button !== 0) return;
    const passive = event.pointerType === "touch" && !touchMove;
    const at = point(event);if (!passive) event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { id: event.pointerId, at, x: event.clientX, y: event.clientY, view, bounds, box: stage.current.getBoundingClientRect(), moved: false, passive };
    if (!passive && admin && tool === "select") setSelection([at]);
  };
  const drag = event => {
    const at = point(event);setHover(at);const start = gesture.current;if (!start || start.id !== event.pointerId) return;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;start.moved ||= Math.abs(dx) + Math.abs(dy) > 5;if (start.passive) return;
    if (admin && tool === "select") { const cells = rectangle(start.at, at);setSelection(cells || []);if (!cells) setNotice("Sélection limitée à 256 chunks. Réduisez le rectangle."); }
    else setView({ ...start.view, x: Math.max(-1874900, Math.min(1874900, start.view.x - Math.round(dx / start.box.width * (start.bounds[2] - start.bounds[0] + 1)))), z: Math.max(-1874900, Math.min(1874900, start.view.z - Math.round(dy / start.box.height * (start.bounds[3] - start.bounds[1] + 1)))) });
  };
  const up = event => {
    const start = gesture.current;if (!start || start.id !== event.pointerId) return;
    if (!start.moved) { setCell(start.at);if (admin) setSelection([start.at]); }
    gesture.current = null;
  };
  const openPlot = plot => {
    setTarget(plot.id);setCreating(false);setMetadata({ ...blank, ...plot, color: safeColor(plot.color) });
    if (plot.chunks?.length) { const at = plot.chunks[0];setCell(at);setView(v => ({ ...v, x: at.x, z: at.z })); }
  };
  const prepare = action => {
    if (!data || changed) { setNotice("Actualisez la zone avant de préparer une modification.");return; }
    const plotId = creating ? ident.trim() : target;
    if (!/^[A-Za-z0-9_.+-]{1,128}$/.test(plotId)) { setNotice("Choisissez une parcelle ou indiquez un identifiant simple.");return; }
    if (!reason.trim()) { setNotice("Indiquez un motif pour l’historique administratif.");return; }
    if (action === "unclaim" && selection.some(at => plotAt(data, at.x, at.z)?.id !== plotId)) { setNotice("Pour retirer des chunks, sélectionnez uniquement ceux de la parcelle cible.");return; }
    if (action !== "unclaim" && action !== "update" && selection.some(at => { const old = plotAt(data, at.x, at.z);return old && old.id !== plotId; })) { setNotice("Une partie de la sélection appartient déjà à une autre parcelle. Retirez d’abord cette attribution.");return; }
    const edit = { action, plotId, dimension: "minecraft:overworld", chunks: action === "update" ? [] : selection };
    if (action === "create" || action === "update") edit.metadata = Object.fromEntries(Object.keys(blank).map(key => [key, metadata[key]]));
    const request = { id: crypto.randomUUID(), baseHash: data.hash, world: "renblood", change: edit, reason: reason.trim() };
    pendingRequest.current = request;setConfirmation(request);setNotice("");
  };
  const confirm = async () => {
    const request = pendingRequest.current;if (!request || sending) return;setSending(true);setError("");
    try { const result = await sendLandChange(request);setNotice(`${states[result.state] || result.state}. Utilisez Actualiser pour suivre la validation par Minecraft.`);setConfirmation(null);pendingRequest.current = null;refresh(true); }
    catch (failure) { setError(cadastreError(failure)); }
    finally { setSending(false); }
  };
  const keys = event => {
    if (event.target.closest("input,select,textarea,button,a")) return;
    const delta = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }[event.key];
    if (delta) { event.preventDefault();move(...delta); }
    if (["+", "=", "-", "0"].includes(event.key)) { event.preventDefault();event.key === "0" ? setView(initialView) : zoom(event.key === "-" ? 1.25 : .8); }
    if (event.key === "Escape") { setConfirmation(null);setSelection([]); }
  };
  const metadataField = (key, value) => setMetadata(m => ({ ...m, [key]: value }));
  return <main className="realm-page cadastre-page">
    <RealmHeader eyebrow="Territoires / Cadastre" title="Les terres que vous connaissez" description="Chaque voyage révèle un peu plus le royaume et ceux qui le possèdent." />
    <motion.section className="cadastre-workspace" initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }} onKeyDown={keys}>
      <div className="cadastre-topline"><div><span className="cadastre-kicker">REGISTRE DES TERRES</span><h2>{admin ? "Intendance du royaume" : "Votre carte personnelle"}</h2></div><div className="cadastre-actions"><Link to="/map">Atlas du royaume ↗</Link>{userRank === "Admin" && <button aria-pressed={admin} onClick={() => setManage(v => !v)}>{admin ? "Vue joueur" : "Mode gestion"}</button>}<button className="cadastre-primary" disabled={busy} onClick={() => refresh()}><FaSyncAlt aria-hidden="true" /> {busy ? "Chargement…" : "Actualiser"}</button></div></div>
      <div className="cadastre-sync"><p>Copie du serveur : <time>{timeLabel(data?.syncedAt)}</time></p><p>{admin ? "Les modifications sont validées par Minecraft, au prochain passage de synchronisation." : "Découverte à 8 chunks de distance · envois groupés toutes les 2 minutes"}</p></div>
      {error && <p className="cadastre-message is-error" role="alert">{error}</p>}{notice && <p className="cadastre-message" role="status">{notice}</p>}
      {changed && <p className="cadastre-message">Vue déplacée : cliquez sur <strong>Actualiser</strong> pour charger cette zone.</p>}
      {!busy && data && !data.syncedAt && <p className="cadastre-message">Le cadastre attend son premier envoi depuis le serveur Minecraft. Les terrains apparaîtront après synchronisation.</p>}
      <div className="cadastre-layout">
        <div className="cadastre-map-column">
          <div className="cadastre-map-toolbar"><button onClick={() => setView(initialView)}><FaCompass aria-hidden="true" /> Shaleton</button><span>{view.size} chunks de large</span>{admin && <div className="cadastre-tools"><button aria-pressed={tool === "move"} onClick={() => setTool("move")}>Déplacer</button><button aria-pressed={tool === "select"} onClick={() => setTool("select")}>Sélectionner</button></div>}</div>
          <div ref={stage} className={`cadastre-stage ${admin && tool === "select" ? "is-selecting" : ""}`} style={{ touchAction: touchMove ? "none" : "pan-y" }} tabIndex={0} role="region" aria-label="Carte des parcelles. Flèches pour déplacer, plus et moins pour zoomer." onPointerDown={down} onPointerMove={drag} onPointerUp={up} onPointerCancel={() => { gesture.current = null; }} onLostPointerCapture={() => { gesture.current = null; }} onPointerLeave={() => setHover(null)}>
            <svg viewBox={`${bounds[0]} ${bounds[1]} ${bounds[2] - bounds[0] + 1} ${bounds[3] - bounds[1] + 1}`} preserveAspectRatio="none" aria-hidden="true">
              <defs><pattern id={fogId} width="2" height="2" patternUnits="userSpaceOnUse"><path d="M0,2L2,0M-1,1L1,-1M1,3L3,1" stroke="#999183" strokeOpacity=".08" strokeWidth=".025" /></pattern><pattern id={gridId} width="1" height="1" patternUnits="userSpaceOnUse"><path d="M1,0H0V1" fill="none" stroke="#dbd5c2" strokeOpacity=".16" strokeWidth=".018" /></pattern></defs>
              <rect x={bounds[0]} y={bounds[1]} width="96" height="96" fill="#121512" /><rect x={bounds[0]} y={bounds[1]} width="96" height="96" fill={`url(#${fogId})`} />
              <path d={knownPath(data?.known)} fill="#29342c" />
              {plots.map(plot => <path key={plot.id} d={cellPath(plot.chunks)} fill={safeColor(plot.color)} fillOpacity={query && !visibleList.includes(plot) ? .12 : .6} stroke={safeColor(plot.color)} strokeWidth=".035" />)}
              <rect x={bounds[0]} y={bounds[1]} width="96" height="96" fill={`url(#${gridId})`} />
              <path d={cellPath(selection)} fill="#f1d490" fillOpacity=".28" stroke="#ffe1a0" strokeWidth=".06" />
              {cell && <rect x={cell.x} y={cell.z} width="1" height="1" fill="none" stroke="#fff4d3" strokeWidth=".09" />}
              <path d={`M${SHALETON.x / 16},${SHALETON.z / 16 - .25}l.25,.25l-.25,.25l-.25,-.25Z`} fill="#f0d38e" stroke="#111" strokeWidth=".05" />
            </svg>
            <span className="cadastre-north" aria-hidden="true">N ↑</span><span className="cadastre-map-caption">SHALETON / DOMAINE CONNU</span>
            {!data && !error && <span className="cadastre-map-loading" role="status">Ouverture du registre…</span>}
            {data && !admin && !loadedCount && <span className="cadastre-map-loading">Terres inexplorées<span>Visitez le royaume en jeu pour révéler votre cadastre.</span></span>}
            <output className="cadastre-coords">{hover ? `Chunk ${hover.x}, ${hover.z} · X ${hover.x * 16} / Z ${hover.z * 16}` : "1 case = 16 × 16 blocs"}</output>
          </div>
          <div className="cadastre-navigation"><div><button aria-label="Zoomer" onClick={() => zoom(.8)} disabled={view.size <= 8}><FaPlus /></button><button aria-label="Dézoomer" onClick={() => zoom(1.25)} disabled={view.size >= 96}><FaMinus /></button></div><div>{[[FaArrowLeft, -8, 0, "Ouest"], [FaArrowUp, 0, -8, "Nord"], [FaArrowDown, 0, 8, "Sud"], [FaArrowRight, 8, 0, "Est"]].map(([Icon, x, z, label]) => <button key={label} aria-label={label} onClick={() => move(x, z)}><Icon /></button>)}</div><button className="cadastre-touch" aria-pressed={touchMove} onClick={() => setTouchMove(v => !v)}>{touchMove ? "Terminer le déplacement" : "Déplacer au toucher"}</button></div>
          <div className="cadastre-legend"><span><i className="known" /> Connu</span><span><i className="claimed" /> Attribué</span><span><i className="fog" /> Inexploré</span><p>Glisser pour explorer · boutons pour zoomer</p></div>
          <form className="cadastre-coordinate-form" onSubmit={e => { e.preventDefault();const x = blockToChunk(coords.x), z = blockToChunk(coords.z);if (Number.isFinite(x) && Number.isFinite(z) && Math.abs(x) <= 1874900 && Math.abs(z) <= 1874900) { setView(v => ({ ...v, x, z }));setCell({ x, z });if (admin) setSelection([{ x, z }]); } }}><span>Aller aux coordonnées</span><label>X <input type="number" required value={coords.x} onChange={e => setCoords(c => ({ ...c, x: e.target.value }))} /></label><label>Z <input type="number" required value={coords.z} onChange={e => setCoords(c => ({ ...c, z: e.target.value }))} /></label><button>Localiser</button></form>
        </div>
        <aside className="cadastre-sidebar" aria-label="Fiche de la parcelle">
          <p className="cadastre-kicker">{admin ? "GESTION DES TERRAINS" : "LE CARNET DES TERRES"}</p>
          <h3>{cell ? selectedKnown ? selectedPlot?.name || "Terre non attribuée" : "Territoire inexploré" : "Sélectionnez une parcelle"}</h3>
          {cell && <><p className="cadastre-cell">Chunk {cell.x}, {cell.z}</p>{selectedKnown ? <dl><div><dt>Propriétaire</dt><dd>{selectedPlot?.owner || "Aucun propriétaire renseigné"}</dd></div>{selectedPlot && <><div><dt>Nature</dt><dd>{OWNER_TYPES[selectedPlot.ownerType] || "Non renseignée"}</dd></div><div><dt>Ville</dt><dd>{selectedPlot.city || "Aucune"}</dd></div></>}</dl> : <p className="cadastre-muted">Approchez-vous de ce secteur en jeu. Sa propriété se révélera dans un rayon de 8 chunks.</p>}{selectedKnown && selectedPlot?.description && <p className="cadastre-description">{selectedPlot.description}</p>}</>}
          {!admin && <><label className="cadastre-search"><FaSearch aria-hidden="true" /><span className="sr-only">Rechercher parmi les parcelles chargées</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Terrain, propriétaire, ville…" /></label><p className="cadastre-muted">{visibleList.length} parcelle(s) connue(s) dans la zone chargée</p><div className="cadastre-directory">{visibleList.map(plot => <button key={plot.id} onClick={() => openPlot(plot)}><i style={{ background: safeColor(plot.color) }} /><span><strong>{plot.name || plot.id}</strong><small>{plot.owner || "Propriétaire non renseigné"}</small></span><span aria-hidden="true">↗</span></button>)}</div></>}
          {admin && <div className="cadastre-editor">
            <p className="cadastre-selection">{selection.length} chunk(s) sélectionné(s){selection.length > 0 && <button onClick={() => setSelection([])}>Effacer</button>}</p>
            <label>Parcelle cible<select value={creating ? "__new" : target} onChange={e => { const id = e.target.value;setCreating(id === "__new");if (id === "__new") { setTarget("");setMetadata(blank); } else { setTarget(id);const plot = directory.find(p => p.id === id);setMetadata(plot ? { ...blank, ...plot, color: safeColor(plot.color) } : blank); } }}><option value="">Choisir…</option><option value="__new">+ Nouvelle parcelle</option>{directory.map(plot => <option key={plot.id} value={plot.id}>{plot.name || plot.id}</option>)}</select></label>
            {creating && <label>Identifiant<input value={ident} maxLength={128} onChange={e => setIdent(e.target.value)} placeholder="ex. shaleton-place" /></label>}
            {(creating || target) && <><label>Nom<input required value={metadata.name} maxLength={128} onChange={e => metadataField("name", e.target.value)} /></label><div className="cadastre-field-pair"><label>Propriétaire<input value={metadata.owner} maxLength={128} onChange={e => metadataField("owner", e.target.value)} /></label><label>Nature<select value={metadata.ownerType} onChange={e => metadataField("ownerType", e.target.value)}>{Object.entries(OWNER_TYPES).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div><div className="cadastre-field-pair"><label>Ville<input value={metadata.city} maxLength={128} onChange={e => metadataField("city", e.target.value)} /></label><label>Couleur<input type="color" value={metadata.color} onChange={e => metadataField("color", e.target.value)} /></label></div><label>Description<textarea value={metadata.description} maxLength={500} rows={2} onChange={e => metadataField("description", e.target.value)} /></label><label>Motif administratif<input value={reason} maxLength={500} onChange={e => setReason(e.target.value)} placeholder="Pourquoi cette modification ?" /></label><div className="cadastre-edit-actions">{creating ? <button disabled={sending || !metadata.name.trim()} onClick={() => prepare("create")}>Créer la parcelle{selection.length ? " et attribuer" : ""}</button> : <><button disabled={sending || !metadata.name.trim()} onClick={() => prepare("update")}>Enregistrer la fiche</button><button disabled={sending || !selection.length} onClick={() => prepare("assign")}>Attribuer la sélection</button><button disabled={sending || !selection.length} onClick={() => prepare("unclaim")}>Retirer l’attribution</button></>}</div></>}
            {confirmation && <div className="cadastre-confirmation" role="group" aria-label="Confirmer la modification"><strong>{confirmation.change.action === "unclaim" ? "Retirer l’attribution" : confirmation.change.action === "update" ? "Modifier la fiche" : confirmation.change.action === "create" ? "Créer la parcelle" : "Attribuer les chunks"} ?</strong><p>{confirmation.change.plotId} · {confirmation.change.chunks.length} chunk(s). Minecraft vérifiera que le cadastre n’a pas changé.</p><button className="cadastre-primary" disabled={sending} onClick={confirm}>{sending ? "Envoi…" : "Confirmer l’envoi"}</button><button disabled={sending} onClick={() => { pendingRequest.current = null;setConfirmation(null); }}>Annuler</button></div>}
          </div>}
          <details className="cadastre-help"><summary>Comment lire le cadastre ?</summary><p>Les terres découvertes restent mémorisées après déconnexion. Une case représente un chunk. Les propriétaires affichés correspondent à la dernière copie synchronisée du serveur.</p><p>Le site se met à jour à l’ouverture et avec Actualiser. En jeu, /mc land sync demande un envoi anticipé. Le fond représente les parcelles, pas le relief du monde.</p></details>
        </aside>
      </div>
      {admin && <div className="cadastre-history"><p className="cadastre-kicker">DERNIÈRES MODIFICATIONS</p>{!(data?.history || []).length && <p className="cadastre-muted">Aucune modification envoyée depuis le site.</p>}{(data?.history || []).map(row => <article key={row.id}><span className={`cadastre-state state-${row.state.toLowerCase()}`}>{states[row.state] || row.state}</span><div><strong>{row.change.plotId}</strong><p>{row.message || row.reason}</p><small>{timeLabel(row.createdAt)} · {row.actor}</small></div></article>)}</div>}
    </motion.section>
  </main>;
}
