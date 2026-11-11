import { useEffect, useRef, useState } from 'react';
import { useBookmarks } from './WikiBookmarks';
export default function BookmarkNote({
  item
}) {
  const {
    update,
    error,
    clearError
  } = useBookmarks();
  const [note, setNote] = useState(item.note),
    [saved, setSaved] = useState(false),
    [conflict, setConflict] = useState(false);
  const base = useRef(item.note),
    edited = useRef(item.note);
  useEffect(() => {
    if (edited.current === base.current || edited.current === item.note) {
      setNote(item.note);
      edited.current = item.note;
      base.current = item.note;
      setConflict(false);
    } else setConflict(true);
  }, [item.note]);
  function save(expectedNote = base.current) {
    const success = update({
      type: 'note',
      path: item.path,
      note,
      expectedNote
    });
    setSaved(success);
    if (success) {
      base.current = note;
      setConflict(false);
    }
  }
  return <details className="wiki-saved-note"><summary>{item.note ? 'Ma note personnelle' : 'Ajouter une note'}</summary><label>Note pour votre prochaine session<textarea value={note} maxLength={1000} rows={3} onChange={event => {
        edited.current = event.target.value;
        setNote(event.target.value);
        setSaved(false);
      }} /></label>
    {conflict && <div className="wiki-review-conflict"><p>La note enregistrée a changé dans un autre onglet. Votre texte est conservé.</p><p className="wiki-muted">Version enregistrée : {item.note || '(vide)'}</p><div className="wiki-actions"><button onClick={() => {
          edited.current = item.note;
          base.current = item.note;
          setNote(item.note);
          setConflict(false);
          setSaved(false);
          clearError();
        }}>Utiliser la note enregistrée</button><button onClick={() => save(item.note)}>Remplacer par ma note</button></div></div>}
    <button className="wiki-text-link" disabled={conflict} onClick={() => save()}>Enregistrer la note</button>{error && <p className="wiki-error" role="alert">{error}</p>}<span role="status">{saved ? 'Note enregistrée sur cet appareil.' : note !== item.note ? 'Note non enregistrée.' : ''}</span>
  </details>;
}
