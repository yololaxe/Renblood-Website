import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RealmHeader from "../../components/RealmHeader";
import { economyApi } from "../../services/economyApi";
import "../../components/economy/economy.css";

const receiptPattern = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const states = {
  RESERVED: "Réservé",
  CONFIRMED: "Confirmé",
  CANCELLED: "Annulé",
  RECONCILIATION_REQUIRED: "À vérifier",
};

export default function SupportReceipt() {
  const [params, setParams] = useSearchParams();
  const reference = params.get("recu") || "";
  const [query, setQuery] = useState(reference);
  const [note, setNote] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const request = useRef(null);
  const noteAttempt = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    request.current = controller;
    noteAttempt.current = null;
    setNote("");
    setQuery(reference);
    setError("");
    setData(null);
    setLoading(false);
    setSaving(false);
    if (!receiptPattern.test(reference)) return () => controller.abort();
    setLoading(true);
    economyApi.get("support/receipts/" + reference, controller.signal)
      .then(result => { if (!controller.signal.aborted) setData(result); })
      .catch(failure => { if (!controller.signal.aborted) setError(failure.message); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [reference]);

  function findReceipt(event) {
    event.preventDefault();
    const value = query.trim();
    if (!receiptPattern.test(value)) {
      setError("Copiez la référence complète du reçu.");
      return;
    }
    setParams({ recu: value });
  }

  async function saveNote(event) {
    event.preventDefault();
    const text = note.trim();
    if (!text || saving) return;
    const controller = request.current;
    if (noteAttempt.current?.text !== text) {
      noteAttempt.current = { text, key: crypto.randomUUID() };
    }
    setSaving(true);
    setError("");
    try {
      const result = await economyApi.post("support/receipts/" + reference, { note: text }, noteAttempt.current.key);
      if (controller.signal.aborted) return;
      setData(result);
      setNote("");
      noteAttempt.current = null;
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure.message);
    } finally {
      if (!controller.signal.aborted) setSaving(false);
    }
  }

  return <main className="realm-page economy-page">
    <RealmHeader eyebrow="Modération / Économie" title="Suivre un reçu"
      description="Retrouvez l’état d’un échange signalé en jeu et laissez une note à l’équipe.">
      <Link to="/histoire#aide-economie" className="realm-action">Guide du voyageur</Link>
    </RealmHeader>
    <div className="realm-content economy-content">
      <form className="economy-filters" onSubmit={findReceipt}>
        <label>Référence du reçu<input value={query} onChange={event => setQuery(event.target.value)} /></label>
        <button className="realm-action">Rechercher</button>
      </form>
      {loading && <p role="status">Recherche du reçu…</p>}
      {error && <p className="economy-error" role="alert">{error}</p>}
      {data && <section className="economy-detail">
        <h2>{states[data.receipt.state] ?? data.receipt.state}</h2>
        <p>{data.receipt.business_id || data.receipt.type}</p>
        <p className="economy-muted">{data.receipt.operation_id}</p>
        <form className="economy-filters" onSubmit={saveNote}>
          <label>Note de suivi<textarea rows={3} maxLength={500} value={note} onChange={event => setNote(event.target.value)} /></label>
          <button className="realm-action" disabled={!note.trim() || saving}>{saving ? "Enregistrement…" : "Ajouter la note"}</button>
        </form>
        <h3>Dernières notes</h3>
        {data.notes.length === 0 && <p className="economy-muted">Aucune note sur ce reçu.</p>}
        {data.notes.map(entry => <article key={entry._id}>
          <p>{entry.note}</p><time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString("fr-FR")}</time>
        </article>)}
      </section>}
    </div>
  </main>;
}
