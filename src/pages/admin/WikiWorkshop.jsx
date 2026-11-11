import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../../services/axiosInstance';
import { registry, normalize, subscribeWiki, getWikiRevision } from '../../services/wiki.mjs';
import { useUser } from '../../context/UserContext';
import useReviewBackup from '../../components/wiki/useReviewBackup';
import { ReviewRecovery, ReviewConflict } from '../../components/wiki/ReviewRecovery';
import { sameDecisions, reviewFieldLabel, reviewPreviewPath } from '../../services/wikiReview.mjs';
import { downloadJson as download } from '../../services/downloadJson.mjs';
import { wikiQuality } from '../../services/wikiQuality.mjs';
import { WikiPage, WikiHeader, WikiEmpty } from '../../components/wiki/WikiShell';
import { beginWikiPreview, endWikiPreview } from '../../components/wiki/WikiRuntime';
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
export default function WikiWorkshop() {
  const {
    userId
  } = useUser();
  const scope = String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
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
    [quality, setQuality] = useState(''),
    [collection, setCollection] = useState(''),
    [recovery, setRecovery] = useState(null),
    [conflicts, setConflicts] = useState([]),
    [focusChange, setFocusChange] = useState(null);
  const backup = useReviewBackup({
    draft,
    decisions,
    conflicts,
    owner: userId,
    scope,
    pending: !!recovery
  });
  const conflictsByKey = useMemo(() => new Map(conflicts.map(item => [item.key, item])), [conflicts]);
  useEffect(() => setPublishConfirm(false), [decisions, conflicts, draft?.id]);
  useEffect(() => {
    if (!focusChange) return;
    const element = document.getElementById('review-change-' + focusChange);
    element?.scrollIntoView({
      block: 'center'
    });
    element?.querySelector('select')?.focus({
      preventScroll: true
    });
    setFocusChange(null);
  }, [focusChange]);
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
  const wikiRevision = useSyncExternalStore(subscribeWiki, getWikiRevision, getWikiRevision);
  const issues = useMemo(() => wikiQuality(registry), [wikiRevision]);
  const decisionState = key => conflictsByKey.has(key) ? 'conflict' : decisions[key] || 'pending';
  const changes = (draft?.changes || []).filter(change => (!collection || change.collection === collection) && (!status || decisionState(change.key) === status || status === 'pending' && decisionState(change.key) === 'conflict') && normalize(`${change.label} ${change.id} ${change.field} ${reviewFieldLabel(change.field)} ${labels[change.collection]}`).includes(normalize(query)));
  const reviewed = (draft?.changes || []).filter(change => decisions[change.key] && !conflictsByKey.has(change.key)).length;
  const accepted = (draft?.changes || []).filter(change => decisions[change.key] === 'accept' && !conflictsByKey.has(change.key)).length;
  const dirty = !sameDecisions(decisions, draft?.decisions || {});
  const pendingChange = draft?.changes.find(change => !decisions[change.key] || conflictsByKey.has(change.key));
  const choose = (key, choice) => {
    setDecisions(current => {
      const next = {
        ...current
      };
      choice ? next[key] = choice : delete next[key];
      return next;
    });
    setConflicts(current => current.filter(item => item.key !== key));
  };
  const keepVisible = () => {
    const keys = new Set(changes.slice(0, limit).map(change => change.key));
    setDecisions(current => ({
      ...current,
      ...Object.fromEntries([...keys].map(key => [key, 'keep']))
    }));
    setConflicts(current => current.filter(item => !keys.has(item.key)));
  };
  async function openDraft(id) {
    backup.persist();
    const value = await call(`drafts/${id}/`);
    setDraft(value);
    setDecisions(value.decisions);
    setConflicts([]);
    const local = backup.restore(value);
    if (local && (!sameDecisions(local.decisions, value.decisions) || local.conflicts.length)) setRecovery(local);else {
      setRecovery(null);
      backup.discard(value);
    }
    setQuery('');
    setStatus('');
    setCollection('');
    setPublishConfirm(false);
    setLimit(30);
  }
  async function save() {
    if (!draft) return null;
    if (recovery || conflicts.length) throw Error('Terminez la reprise et les conflits de revue avant d’enregistrer.');
    if (!dirty) return draft;
    const value = await call(`drafts/${draft.id}/save/`, {
      revision: draft.revision,
      decisions
    });
    setDraft(value);
    setDecisions(value.decisions);
    backup.discard(value);
    return value;
  }
  async function create() {
    backup.persist();
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
    setConflicts([]);
    setRecovery(null);
    setPublishConfirm(false);
    setConfirmed(false);
    await load();
    setMessage('Brouillon partagé créé. Aucun changement public.');
  }
  return <WikiPage className="wiki-workshop"><WikiHeader section="Administration" title="L’atelier du wiki." intro="Comparer, arbitrer, prévisualiser et publier les archives publiques du royaume."><Link className="wiki-text-link" to="/admin-dashboard">← Tableau de bord admin</Link></WikiHeader>
    <div className="wiki-content wiki-section">{error && <p className="wiki-error" role="alert">{error}</p>}{message && <p className="wiki-success" role="status">{message}</p>}<div className="wiki-workshop-top">{state?.publication && <p className="wiki-muted" role="status">Une publication est en cours. La version publique reste disponible pendant sa préparation.</p>}<p className="wiki-muted">Version publique : <strong>{state?.current || 'Chargement…'}</strong></p><button disabled={busy} className="wiki-text-link" onClick={() => run(load)}>Actualiser ↻</button></div>
      <section className="wiki-section"><p className="wiki-kicker">01 · Préparer</p><h2>Une version à examiner</h2><p className="wiki-prose">Importez un paquet public compilé contenant « registry » et « books ». Les exports bruts de Sheets et leurs colonnes privées sont refusés. Vous pouvez télécharger la version actuelle comme base de travail.</p>
        <div className="wiki-actions"><button disabled={!state || busy} className="wiki-action" onClick={() => run(async () => download(await call(`versions/${encodeURIComponent(state.current)}/`), 'renblood-wiki-public.json'))}>Télécharger la version publique ↓</button></div>
        <form className="wiki-import-form" onSubmit={event => {
          event.preventDefault();
          run(create);
        }}><label>Paquet public JSON<input ref={file} type="file" accept="application/json,.json" required /></label><label>Objet de la mise à jour<input value={reason} onChange={event => setReason(event.target.value)} minLength={3} maxLength={500} required placeholder="Ex. Corrections des fonctions et des alias validées" /></label><label className="wiki-checkbox"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} required />Je confirme que ce paquet contient uniquement du lore public.</label><button className="wiki-action" disabled={busy || !state}>Créer le brouillon et comparer ↗</button></form>
        {!!state?.drafts.length && <div className="wiki-drafts"><h3>Reprendre un brouillon partagé</h3>{state.drafts.map(item => <button key={item.id} disabled={busy} onClick={() => run(() => openDraft(item.id))}><span>{item.reason}</span><small>{item.status === 'PUBLISHED' ? 'Publié' : item.status === 'PUBLISHING' ? 'Publication en cours' : 'À examiner'} · {item.changeCount} changement{item.changeCount > 1 ? 's' : ''}</small></button>)}</div>}
      </section>
      {draft && <section className="wiki-section" aria-label="Revue des changements"><p className="wiki-kicker">02 · Arbitrer</p><h2>{draft.reason}</h2><p className="wiki-muted">{reviewed} / {draft.changes.length} examinés · {accepted} acceptés · {dirty ? 'Décisions non enregistrées' : 'Décisions enregistrées'}{draft.status === 'PUBLISHED' ? ' · Brouillon déjà publié' : ''}</p>
        <ReviewRecovery recovery={recovery} disabled={busy} onResume={() => {
          setDecisions(recovery.decisions);
          setConflicts(recovery.conflicts);
          setRecovery(null);
          setMessage('Revue locale reprise. Les décisions ne sont pas encore envoyées à l’équipe.');
        }} onDiscard={() => {
          backup.discard();
          setRecovery(null);
          setDecisions(draft.decisions);
          setConflicts([]);
        }} />
        <p className="wiki-muted wiki-review-backup" role="status">{backup.notice || (dirty || conflicts.length ? 'Reprise locale disponible pendant sept jours sur cet appareil. Utilisez « Enregistrer les décisions » pour les partager.' : 'La revue affichée correspond aux décisions partagées.')}{conflicts.length > 0 ? ` ${conflicts.length} conflit(s) à résoudre avant enregistrement.` : ''}</p>
        {draft.status === 'PUBLISHING' && <p className="wiki-muted" role="status">Cette publication est en cours de vérification. <button className="wiki-text-link" disabled={busy} onClick={() => run(async () => {
            await openDraft(draft.id);
            await load();
          })}>Vérifier son état ↻</button></p>}{draft.baseVersion !== state?.current && <p className="wiki-error">Ce brouillon repose sur une autre version. Préparez un nouvel import depuis la version publique actuelle.</p>}
        <form className="wiki-filterbar" onSubmit={event => event.preventDefault()}><label className="wiki-filter-search">Filtrer les changements<input value={query} onChange={event => {
              setQuery(event.target.value);
              setLimit(30);
            }} placeholder="Personnage, identifiant, champ…" /></label><label>Décision<select value={status} onChange={event => {
              setStatus(event.target.value);
              setLimit(30);
            }}><option value="">Toutes</option><option value="pending">À examiner</option><option value="conflict">Conflits de revue</option><option value="accept">Acceptées</option><option value="keep">Valeur actuelle conservée</option></select></label><label>Catégorie<select value={collection} onChange={event => {
              setCollection(event.target.value);
              setLimit(30);
            }}><option value="">Toutes les catégories</option>{[...new Set(draft.changes.map(change => change.collection))].map(key => <option key={key} value={key}>{labels[key] || key}</option>)}</select></label></form>
        <div className="wiki-review-tools"><span role="status">{changes.length} changement(s) dans cette sélection</span><button className="wiki-action" disabled={busy || !dirty || !!recovery || conflicts.length > 0 || draft.status !== 'DRAFT'} onClick={() => run(async () => {
            await save();
            setMessage('Décisions enregistrées et accessibles aux autres administrateurs.');
          })}>Enregistrer la revue</button><button className="wiki-text-link" disabled={busy || !!recovery || !pendingChange || draft.status !== 'DRAFT'} onClick={() => {
            setQuery('');
            setCollection('');
            setStatus('pending');
            setLimit(30);
            setFocusChange(pendingChange.key);
          }}>Suivant à examiner ↓</button><button className="wiki-text-link" disabled={busy || !!recovery || !changes.length || draft.status !== 'DRAFT'} onClick={keepVisible}>{Math.min(changes.length, limit) === 1 ? 'Conserver la valeur actuelle du changement affiché' : `Conserver les valeurs actuelles des ${Math.min(changes.length, limit)} changements affichés`}</button></div>
        <fieldset disabled={busy || !!recovery || draft.status !== 'DRAFT'} className="wiki-review-list">{changes.slice(0, limit).map(change => <article className={`wiki-diff${conflictsByKey.has(change.key) ? ' has-review-conflict' : ''}`} id={'review-change-' + change.key} key={change.key}><header><div><span className="wiki-kicker">{labels[change.collection]} · {change.id}</span><h3>{change.label}</h3><span className="wiki-muted">{change.field === '$record' ? change.before ? 'Suppression proposée' : 'Nouvelle entrée' : reviewFieldLabel(change.field)}</span></div><select aria-label={`Décision pour ${change.label}, ${change.field}`} value={decisions[change.key] || ''} onChange={event => choose(change.key, event.target.value)}><option value="">À examiner</option><option value="keep">Conserver la valeur actuelle</option><option value="accept">Accepter la proposition</option></select></header><ReviewConflict conflict={conflictsByKey.get(change.key)} onResolve={choice => choose(change.key, choice)} /><div className="wiki-diff-values"><DiffValue title="Actuel" value={change.before} /><DiffValue title="Proposition" value={change.after} /></div></article>)}</fieldset>
        {!changes.length && <WikiEmpty title="Aucun changement dans cette sélection">Modifiez les filtres pour continuer la revue.</WikiEmpty>}{changes.length > limit && <button className="wiki-text-link" onClick={() => setLimit(value => value + 30)}>Afficher les changements suivants ↓</button>}
        <div className="wiki-actions"><button className="wiki-action" disabled={busy || !dirty || !!recovery || conflicts.length > 0 || draft.status !== 'DRAFT'} onClick={() => run(async () => {
            await save();
            setMessage('Décisions enregistrées et accessibles aux autres administrateurs.');
          })}>Enregistrer les décisions</button><button className="wiki-action" disabled={busy || !!recovery || conflicts.length > 0 || draft.status !== 'DRAFT' || draft.baseVersion !== state?.current} onClick={() => run(async () => {
            const saved = await save();
            const value = await call(`drafts/${saved.id}/preview/`);
            navigate(reviewPreviewPath(saved, value));
            beginWikiPreview(value, saved.id);
          })}>Prévisualiser les fiches ↗</button><button className="wiki-text-link" disabled={busy} onClick={() => download({
            format: 'renblood-wiki-review-export',
            version: 1,
            draft,
            decisions,
            conflicts,
            recovery
          }, `revue-wiki-${draft.id}.json`)}>Exporter la revue ↓</button></div>
        <p className="wiki-muted">L’aperçu applique les propositions acceptées ; les changements encore à examiner gardent leur valeur actuelle.</p>
        <section className="wiki-publish-box"><p className="wiki-kicker">03 · Publier</p><h3>Rendre la version approuvée accessible</h3><p>La publication concerne tous les lecteurs de cet environnement. Chaque changement doit avoir une décision. Une publication concurrente bloque l’opération et demande une nouvelle revue.</p><label className="wiki-checkbox"><input type="checkbox" checked={publishConfirm} onChange={event => setPublishConfirm(event.target.checked)} />J’ai contrôlé le contenu public et souhaite publier les {accepted} changements acceptés.</label><button className="wiki-action" disabled={busy || !!recovery || conflicts.length > 0 || !!state?.publication || !publishConfirm || reviewed !== draft.changes.length || !accepted || draft.status !== 'DRAFT' || draft.baseVersion !== state?.current} onClick={() => run(async () => {
            const saved = await save();
            const value = await call(`drafts/${saved.id}/publish/`, {
              revision: saved.revision,
              reason: draft.reason
            });
            setMessage(`Version publiée : ${value.version}.`);
            await endWikiPreview().catch(() => setError('La publication est confirmée. Le registre affiché n’a pas pu être resynchronisé ; actualisez la page.'));
            await load();
            await openDraft(saved.id);
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
            setMessage('La version sélectionnée est restaurée.');
            await endWikiPreview().catch(() => setError('La restauration est confirmée. Le registre affiché n’a pas pu être resynchronisé ; actualisez la page.'));
            await load();
            setRestore('');
            setRestoreReason('');
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
