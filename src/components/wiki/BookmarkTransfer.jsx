import { useRef, useState } from 'react';
import { downloadJson } from '../../services/downloadJson.mjs';
import { exportBookmarks, parseBookmarkImport, mergeBookmarkImport } from '../../services/wikiBookmarkStore.mjs';
export default function BookmarkTransfer({
  items,
  update
}) {
  const file = useRef(null);
  const [incoming, setIncoming] = useState(null),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  let preview,
    capacityError = '';
  if (incoming) try {
    preview = mergeBookmarkImport(items, incoming);
  } catch (failure) {
    capacityError = failure.message;
  }
  function download() {
    downloadJson(exportBookmarks(items), 'renblood-mes-reperes.json');
    setMessage('Le fichier contient vos repères et leurs notes enregistrées.');
  }
  async function load(event) {
    setError('');
    setMessage('');
    setIncoming(null);
    const selected = event.target.files[0];
    if (!selected) return;
    try {
      if (selected.size > 1024 * 1024) throw Error('Le fichier dépasse 1 Mo.');
      setIncoming(parseBookmarkImport(await selected.text()));
    } catch (failure) {
      setError(failure.message);
    }
    event.target.value = '';
  }
  return <section className="wiki-bookmark-transfer" aria-label="Sauvegarder ou importer mes repères"><div className="wiki-actions"><button className="wiki-text-link" disabled={!items.length} onClick={download}>Exporter mes repères et notes ↓</button><button className="wiki-text-link" onClick={() => file.current.click()}>Importer un carnet ↑</button><input ref={file} type="file" hidden accept="application/json,.json" onChange={load} /></div>
    {error && <p className="wiki-error" role="alert">{error}</p>}{message && <p className="wiki-muted" role="status">{message}</p>}
    {incoming && <div className="wiki-import-preview"><h2>Ajouter les repères du fichier</h2>{capacityError ? <p className="wiki-error" role="alert">{capacityError}</p> : <><p>{preview.additions} nouveau{preview.additions > 1 ? 'x' : ''} repère{preview.additions > 1 ? 's' : ''} · {preview.duplicates} déjà présent{preview.duplicates > 1 ? 's' : ''}.</p><p className="wiki-muted">Les repères et notes déjà enregistrés sont conservés.{preview.differentNotes > 0 ? ` ${preview.differentNotes} note(s) différente(s) du fichier ne remplaceront pas vos notes actuelles.` : ''}</p>{preview.additions > 0 && <ul>{incoming.filter(item => !items.some(current => current.path === item.path)).slice(0, 5).map(item => <li key={item.path}>{item.label}</li>)}</ul>}</>}
      <div className="wiki-actions"><button className="wiki-action" disabled={!preview?.additions || !!capacityError} onClick={() => {
          if (update({
            type: 'merge',
            items: incoming
          })) {
            setMessage('Les nouveaux repères sont ajoutés. Vos notes existantes sont conservées.');
            setIncoming(null);
          }
        }}>Ajouter les nouveaux repères</button><button className="wiki-text-link" onClick={() => setIncoming(null)}>Annuler</button></div>
    </div>}
  </section>;
}
