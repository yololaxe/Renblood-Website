import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { economyApi } from "../../services/economyApi";
import "../../components/economy/economy.css";
import "./support-receipt.css";

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
    <header className="realm-content receipt-heading">
      <p className="receipt-eyebrow">Équipe / Économie</p>
      <h1>Suivi des échanges</h1>
      <p>Un joueur signale un échange bloqué ou un paiement inattendu ? Retrouvez son reçu et consignez les vérifications de l’équipe.</p>
    </header>
    <div className="realm-content receipt-workspace">
      <aside className="receipt-help"><h2>Comment l’utiliser</h2>
        <ol>
          <li><strong>Récupérer le reçu</strong>Demandez au joueur la référence affichée après son échange ou dans l’historique de ses finances.</li>
          <li><strong>Vérifier l’échange</strong>Recherchez cette référence pour consulter son état : confirmé, annulé ou à vérifier.</li>
          <li><strong>Partager le suivi</strong>Ajoutez une note pour que les autres membres de l’équipe sachent ce qui a été vérifié.</li>
        </ol>
        <Link to="/histoire#aide-economie">Consulter le guide de l’économie ↗</Link>
      </aside>
      <div className="receipt-main">
      <form className="receipt-lookup" onSubmit={findReceipt}>
        <label>Référence du reçu<input value={query} onChange={event => setQuery(event.target.value)}
          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" autoComplete="off" spellCheck={false} aria-describedby="receipt-reference-help" />
          <small id="receipt-reference-help">Collez la référence complète copiée depuis le jeu ou le site.</small>
        </label>
        <button className="realm-action">Retrouver l’échange ↗</button>
      </form>
      {!data && !loading && !error && <p className="receipt-empty">Commencez par une référence de reçu. Les notes permettent de suivre un incident avec l’équipe ; leur ajout ne modifie pas le paiement.</p>}
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
    </div>
  </main>;
}
