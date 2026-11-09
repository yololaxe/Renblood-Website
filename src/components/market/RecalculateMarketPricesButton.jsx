import { useState } from "react";
import { recalculateMarketPrices } from "../../services/marketApi";
import { dateTime, field } from "./MarketComponents";

const consequences = [
  "Les prix publics pain, fer et bois peuvent changer.",
  "Les prix des boutiques et marchés peuvent être modifiés.",
  "Une variation économique contrôlée peut être appliquée.",
  "Les anciens prix calculés peuvent devenir obsolètes.",
  "Les joueurs peuvent constater des changements de prix après mise à jour.",
];

const checklist = [
  "Les prix de référence sont corrects.",
  "Les modificateurs de ville sont corrects.",
  "Les types de comptoirs sont actifs et cohérents.",
  "Aucun événement temporaire incorrect n’est actif.",
  "Le staff est prêt à assumer l’impact RP du recalcul.",
];

const getErrorDetail = (error) => {
  const data = error.response?.data;
  if (!data) return error.message;
  if (typeof data === "string") return data;
  const details = [data.message, data.error, data.detail, ...(Array.isArray(data.non_field_errors) ? data.non_field_errors : [])].filter(Boolean);
  return details.join(" ") || error.message;
};

export default function RecalculateMarketPricesButton({ onSuccess, disabled = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const close = () => {
    if (loading) return;
    setOpen(false);
    setResult(null);
    setError("");
  };

  const confirm = async () => {
    if (loading) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const response = await recalculateMarketPrices();
      setResult(response);
      await onSuccess?.(response);
    } catch (requestError) {
      setError(getErrorDetail(requestError));
    } finally {
      setLoading(false);
    }
  };

  return <>
    <button
      type="button"
      disabled={disabled}
      onClick={() => setOpen(true)}
      className={`rounded-lg bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      Recalculer les prix
    </button>

    {open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={close}>
      <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-sm border border-stone-700 bg-[#1b1b17] p-6 shadow-none" onClick={(event) => event.stopPropagation()}>
        <h2 className="text-2xl font-bold text-white">Confirmer le recalcul des prix</h2>
        <p className="mt-3 text-stone-300">Cette action va recalculer les prix du marché pour toutes les villes, tous les items de référence actifs et tous les types de comptoirs.</p>

        <div className="mt-5 rounded-sm border border-amber-700 bg-amber-950/40 p-4 text-amber-100">
          <strong>Attention :</strong> cette action peut modifier les prix visibles par les joueurs et les prix utilisés par les Comptoirs marchands après synchronisation Minecraft.
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div><h3 className="font-bold text-white">Conséquences possibles</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-stone-300">{consequences.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <div><h3 className="font-bold text-white">À vérifier avant confirmation</h3><ul className="mt-3 space-y-2 text-sm text-stone-300">{checklist.map((item) => <li key={item} className="flex gap-2"><span className="text-amber-400">□</span><span>{item}</span></li>)}</ul></div>
        </div>

        {result && <div className="mt-6 rounded-sm border border-green-800 bg-green-950/40 p-4 text-green-100">
          <p className="font-bold">Les prix du marché ont été recalculés avec succès.</p>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>Statut : <strong>{result.status || "success"}</strong></div>
            <div>Version : <strong>{field(result, "calculationVersion", "calculation_version") || "—"}</strong></div>
            <div>Villes traitées : <strong>{field(result, "citiesProcessed", "cities_processed") ?? 0}</strong></div>
            <div>Items traités : <strong>{field(result, "itemsProcessed", "items_processed") ?? 0}</strong></div>
            <div>Prix générés : <strong>{field(result, "pricesGenerated", "prices_generated") ?? 0}</strong></div>
            <div>Calculé le : <strong>{dateTime(field(result, "calculatedAt", "calculated_at"))}</strong></div>
          </dl>
        </div>}

        {error && <div className="mt-6 rounded-sm border border-red-800 bg-red-950/40 p-4 text-red-100"><p className="font-bold">Le recalcul des prix a échoué.</p><p className="mt-2 text-sm">{error}</p></div>}

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={loading} onClick={close} className="rounded-lg bg-stone-800 px-4 py-2 font-semibold text-white hover:bg-gray-600 disabled:opacity-50">{result ? "Fermer" : "Annuler"}</button>
          {!result && <button type="button" disabled={loading} onClick={confirm} className="rounded-lg bg-amber-600 px-4 py-2 font-bold text-white hover:bg-amber-500 disabled:cursor-wait disabled:opacity-60">{loading ? "Recalcul en cours…" : "Confirmer le recalcul"}</button>}
        </div>
      </section>
    </div>}
  </>;
}
