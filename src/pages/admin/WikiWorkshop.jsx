import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../services/axiosInstance';
import { registry, normalize } from '../../services/wiki.mjs';
import { wikiQuality } from '../../services/wikiQuality.mjs';
import { WikiPage, WikiHeader, WikiEmpty } from '../../components/wiki/WikiShell';
import { beginWikiPreview, endWikiPreview, refreshWiki } from '../../components/wiki/WikiRuntime';
const labels = {
  people: 'Personnages',
  families: 'Familles',
  relations: 'Liens familiaux',
  guilds: 'Guildes',
  roles: 'Fonctions',
  concepts: 'Notions',
  locations: 'Lieux',
  events: 'Événements',
  books: 'Sommaires',
  '$books': 'Textes des livres',
  '$registry': 'Institutions'
};
const call = async (path = '', body) => (await axios[body === undefined ? 'get' : 'post'](`/api/wiki/admin/${path}`, body)).data;
function download(value, name) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json'
  }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function WikiWorkshop() {
  const navigate = useNavigate(),
    file = useRef(null);
  const [state, setState] = useState(null),
    [draft, setDraft] = useState(null),
    [decisions, setDecisions] = useState({}),
    [reason, setReason] = useState(''),
    [confirmed, setConfirmed] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const [query, setQuery] = useState(''),
    [status, setStatus] = useState(''),
    [limit, setLimit] = useState(30),
    [restore, setRestore] = useState(''),
    [restoreReason, setRestoreReason] = useState(''),
    [publishConfirm, setPublishConfirm] = useState(false),
    [quality, setQuality] = useState('');
  const load = async () => setState(await call());
  const run = async operation => {
    if (busy) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await operation();
    } catch (failure) {
      setError(failure.response?.data?.message || failure.message || 'L’action n’a pas abouti. Rechargez l’atelier avant de réessayer.');
    } finally {
      setBusy(false);
    }
  };
  useEffect(() => {
    run(load);
  }, []);
  const issues = useMemo(() => wikiQuality(registry), []);
  const changes = (draft?.changes || []).filter(change => (!status || (decisions[change.key] || 'pending') === status) && normalize(`${change.label} ${change.id} ${change.field} ${labels[change.collection]}`).includes(normalize(query)));
  const reviewed = (draft?.changes || []).filter(change => decisions[change.key]).length;
  const accepted = (draft?.changes || []).filter(change => decisions[change.key] === 'accept').length;
  const dirty = JSON.stringify(decisions) !== JSON.stringify(draft?.decisions || {});
  async function openDraft(id) {
    const value = await call(`drafts/${id}/`);
    setDraft(value);
    setDecisions(value.decisions);
    setPublishConfirm(false);
    setLimit(30);
  }
  async function save() {
    if (!draft) return null;
    if (!dirty) return draft;
    const value = await call(`drafts/${draft.id}/save/`, {
      revision: draft.revision,
      decisions
    });
    setDraft(value);
    setDecisions(value.decisions);
    return value;
  }
  async function create() {
    const selected = file.current?.files[0];
    if (!selected) throw Error('Choisissez le paquet JSON public à comparer.');
    if (selected.size > 2 * 1024 * 1024) throw Error('Le paquet dépasse 2 Mo.');
    let value;
    try {
      value = JSON.parse(await selected.text());
    } catch {
      throw Error('Le fichier n’est pas un JSON valide.');
    }
    const result = await call('drafts/', {
      package: value,
      baseVersion: state.current,
      reason,
      publicConfirmed: confirmed
    });
    setDraft(result);
    setDecisions(result.decisions);
    setPublishConfirm(false);
    setConfirmed(false);
    await load();
    setMessage('Brouillon partagé créé. Aucun changement public.');
  }
  return <WikiPage className="wiki-workshop"><WikiHeader section="Administration" title="L’atelier du wiki." intro="Comparer, arbitrer, prévisualiser et publier les archives publiques du royaume."><Link className="wiki-text-link" to="/admin-dashboard">← Tableau de bord admin</Link></WikiHeader>
    <div className="wiki-content wiki-section">{error && <p className="wiki-error" role="alert">{error}</p>}{message && <p className="wiki-success" role="status">{message}</p>}<div className="wiki-workshop-top"><p className="wiki-muted">Version publique : <strong>{state?.current || 'Chargement…'}</strong></p><button disabled={busy} className="wiki-text-link" onClick={() => run(load)}>Actualiser ↻</button></div>
      <section className="wiki-section"><p className="wiki-kicker">01 · Préparer</p><h2>Une version à examiner</h2><p className="wiki-prose">Importez un paquet public compilé contenant « registry » et « books ». Les exports bruts de Sheets et leurs colonnes privées sont refusés. Vous pouvez télécharger la version actuelle comme base de travail.</p>
        <div className="wiki-actions"><button disabled={!state || busy} className="wiki-action" onClick={() => run(async () => download(await call(`versions/${encodeURIComponent(state.current)}/`), 'renblood-wiki-public.json'))}>Télécharger la version publique ↓</button></div>
        <form className="wiki-import-form" onSubmit={event => {
          event.preventDefault();
          run(create);
        }}><label>Paquet public JSON<input ref={file} type="file" accept="application/json,.json" required /></label><label>Objet de la mise à jour<input value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={500} required placeholder="Ex. Corrections des fonctions et des alias validées" /></label><label className="wiki-checkbox"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} required />Je confirme que ce paquet contient uniquement du lore public.</label><button className="wiki-action" disabled={busy || !state}>Créer le brouillon et comparer ↗</button></form>
        {!!state?.drafts.length && <div className="wiki-drafts"><h3>Reprendre un brouillon partagé</h3>{state.drafts.map(item => <button key={item.id} disabled={busy} onClick={() => run(() => openDraft(item.id))}><span>{item.reason}</span><small>{item.status === 'PUBLISHED' ? 'Publié' : 'À examiner'} · {item.changeCount} changements</small></button>)}</div>}
      </section>
      {draft && <section className="wiki-section" aria-label="Revue des changements"><p className="wiki-kicker">02 · Arbitrer</p><h2>{draft.reason}</h2><p className="wiki-muted">{reviewed} / {draft.changes.length} examinés · {accepted} acceptés · {dirty ? 'Décisions non enregistrées' : 'Décisions enregistrées'}{draft.status === 'PUBLISHED' ? ' · Brouillon déjà publié' : ''}</p>
        {draft.baseVersion !== state?.current && <p className="wiki-error">Ce brouillon repose sur une autre version. Préparez un nouvel import depuis la version publique actuelle.</p>}
        <form className="wiki-filterbar" onSubmit={event => event.preventDefault()}><label className="wiki-filter-search">Filtrer les changements<input value={query} onChange={event => {
              setQuery(event.target.value);
              setLimit(30);
            }} placeholder="Personnage, identifiant, champ…" /></label><label>Décision<select value={status} onChange={event => {
              setStatus(event.target.value);
              setLimit(30);
            }}><option value="">Toutes</option><option value="pending">À examiner</option><option value="accept">Acceptées</option><option value="keep">Valeur actuelle conservée</option></select></label></form>
        <fieldset disabled={busy || draft.status !== 'DRAFT'} className="wiki-review-list">{changes.slice(0, limit).map(change => <article className="wiki-diff" key={change.key}><header><div><span className="wiki-kicker">{labels[change.collection]} · {change.id}</span><h3>{change.label}</h3><span className="wiki-muted">{change.field === '$record' ? change.before ? 'Suppression proposée' : 'Nouvelle entrée' : change.field}</span></div><select aria-label={`Décision pour ${change.label}, ${change.field}`} value={decisions[change.key] || ''} onChange={event => setDecisions(current => {
                const next = {
                  ...current
                };
                event.target.value ? next[change.key] = event.target.value : delete next[change.key];
                return next;
              })}><option value="">À examiner</option><option value="keep">Conserver la valeur actuelle</option><option value="accept">Accepter la proposition</option></select></header><div className="wiki-diff-values"><DiffValue title="Actuel" value={change.before} /><DiffValue title="Proposition" value={change.after} /></div></article>)}</fieldset>
        {!changes.length && <WikiEmpty title="Aucun changement dans cette sélection">Modifiez les filtres pour continuer la revue.</WikiEmpty>}{changes.length > limit && <button className="wiki-text-link" onClick={() => setLimit(value => value + 30)}>Afficher les changements suivants ↓</button>}
        <div className="wiki-actions"><button className="wiki-action" disabled={busy || !dirty || draft.status !== 'DRAFT'} onClick={() => run(async () => {
            await save();
            setMessage('Décisions enregistrées et accessibles aux autres administrateurs.');
          })}>Enregistrer les décisions</button><button className="wiki-action" disabled={busy || draft.status !== 'DRAFT' || draft.baseVersion !== state?.current} onClick={() => run(async () => {
            const saved = await save();
            const value = await call(`drafts/${saved.id}/preview/`);
            navigate(`/histoires/personnages/${value.registry.people[0].id}`);
            beginWikiPreview(value, saved.id);
          })}>Prévisualiser les fiches ↗</button><button className="wiki-text-link" disabled={busy} onClick={() => run(async () => {
            const saved = await save();
            download(saved, `revue-wiki-${saved.id}.json`);
          })}>Exporter la revue ↓</button></div>
        <p className="wiki-muted">L’aperçu applique les propositions acceptées ; les changements encore à examiner gardent leur valeur actuelle.</p>
        <section className="wiki-publish-box"><p className="wiki-kicker">03 · Publier</p><h3>Rendre la version approuvée accessible</h3><p>La publication concerne tous les lecteurs de cet environnement. Chaque changement doit avoir une décision. Une publication concurrente bloque l’opération et demande une nouvelle revue.</p><label className="wiki-checkbox"><input type="checkbox" checked={publishConfirm} onChange={event => setPublishConfirm(event.target.checked)} />J’ai contrôlé le contenu public et souhaite publier les {accepted} changements acceptés.</label><button className="wiki-action" disabled={busy || !publishConfirm || reviewed !== draft.changes.length || !accepted || draft.status !== 'DRAFT' || draft.baseVersion !== state?.current} onClick={() => run(async () => {
            const saved = await save();
            const value = await call(`drafts/${saved.id}/publish/`, {
              revision: saved.revision,
              reason: draft.reason
            });
            await endWikiPreview();
            await refreshWiki();
            await load();
            await openDraft(saved.id);
            setMessage(`Version publiée : ${value.version}.`);
          })}>Publier la version approuvée</button></section>
      </section>}
      <section className="wiki-section"><p className="wiki-kicker">La qualité des archives</p><h2>Les informations à compléter</h2><p className="wiki-muted">Ces manques sont des pistes éditoriales ; aucune donnée n’est inventée pour les combler.</p><div className="wiki-quality-grid">{issues.map(item => <button key={item.id} aria-pressed={quality === item.id} onClick={() => setQuality(quality === item.id ? '' : item.id)}><strong>{item.people.length}</strong><span>{item.label}</span></button>)}</div>{quality && <div className="wiki-quality-people">{issues.find(item => item.id === quality)?.people.slice(0, 40).map(person => <Link key={person.id} to={`/histoires/personnages/${person.id}`}>{person.name} ↗</Link>)}<p className="wiki-muted">40 premières fiches au maximum. Le registre permet de poursuivre les recherches.</p></div>}</section>
      <section className="wiki-section"><p className="wiki-kicker">Historique & restauration</p><h2>Revenir à une version publiée</h2><p className="wiki-prose">Les versions sont conservées. La restauration change le contenu public et inscrit le motif dans l’historique de l’équipe.</p><form className="wiki-import-form" onSubmit={event => {
          event.preventDefault();
          run(async () => {
            await call(`versions/${encodeURIComponent(restore)}/restore/`, {
              revision: state.revision,
              reason: restoreReason
            });
            await endWikiPreview();
            await load();
            setRestore('');
            setRestoreReason('');
            setMessage('La version sélectionnée est restaurée.');
          });
        }}><label>Version<select required value={restore} onChange={event => setRestore(event.target.value)}><option value="">Choisir une version antérieure</option>{state?.versions.filter(item => item.id !== state.current).map(item => <option key={item.id} value={item.id}>{item.id} · {item.reason}</option>)}</select></label><label>Motif de restauration<input required minLength={3} maxLength={500} value={restoreReason} onChange={event => setRestoreReason(event.target.value)} /></label><button className="wiki-action" disabled={!restore || busy}>Restaurer cette version publique</button></form><ol className="wiki-publication-log">{[...(state?.history || [])].reverse().map((event, index) => <li key={`${event.at}-${index}`}><time>{new Date(event.at).toLocaleString('fr-FR')}</time><strong>{event.action === 'restore' ? 'Restauration' : 'Publication'}</strong><span>{event.reason}</span><small>{event.from} → {event.to}</small></li>)}</ol></section>
    </div></WikiPage>;
}
function DiffValue({
  title,
  value
}) {
  const text = value === null || value === undefined ? '—' : typeof value === 'string' ? value || '(vide)' : JSON.stringify(value, null, 2);
  return <div><span className="wiki-kicker">{title}</span>{text.length > 700 ? <details><summary>{text.slice(0, 240)}…</summary><pre>{text}</pre></details> : <pre>{text}</pre>}</div>;
}
