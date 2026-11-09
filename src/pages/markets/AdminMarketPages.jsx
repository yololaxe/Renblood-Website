import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MoneyDisplay } from "../../components/MoneyDisplay";
import Toast from "../../components/Toast";
import RecalculateMarketPricesButton from "../../components/market/RecalculateMarketPricesButton";
import {
  Bool,
  Cell,
  CounterBalanceSummary,
  MARKET_CATEGORIES,
  MARKET_TYPES,
  MarketAdminNav,
  MarketDashboardCard,
  MarketFilters,
  MarketPage,
  MarketState,
  MarketTransactionsTable,
  MarketTypeBadge,
  MarketWithdrawalsTable,
  MerchantCounterTable,
  OwnerTypeBadge,
  TableShell,
  TransactionSummary,
  dateTime,
  field,
  toList,
} from "../../components/market/MarketComponents";
import { ReferenceItemForm, ReferenceItemsTable } from "../../components/market/ReferenceItems";
import { useUser } from "../../context/UserContext";
import { getPlayers } from "../../services/api";
import * as api from "../../services/marketApi";
import { filterChange, useMarketList } from "./marketPageUtils";

const AdminLayout = ({ title, description, actions, children }) => <MarketPage title={title} description={description} actions={actions}><MarketAdminNav />{children}</MarketPage>;
const getTransactionPlayers = () => getPlayers("Admin");
const cityId = (city) => field(city, "cityId", "city_id", "id");
const cityName = (city) => field(city, "cityName", "city_name", "name");
const counterId = (counter) => field(counter, "counterId", "counter_id", "id");
const moderationStatusValue = (counter) => field(counter, "moderationStatus", "moderation_status") || (field(counter, "active") === false ? "DISABLED" : "ACTIVE");
const riskScoreValue = (counter) => Number(field(counter, "riskScore", "risk_score") || 0);
const itemCountValue = (counter) => Number(field(counter, "itemCount", "item_count") ?? toList(field(counter, "items")).length);
const transactionCountValue = (counter) => Number(field(counter, "transactionCount", "transaction_count") || 0);
const ownerNameValue = (counter) => field(counter, "ownerName", "owner_name") || "Administration";
const statusTone = {
  ACTIVE: "bg-green-900/50 text-green-200",
  DISABLED: "bg-red-900/50 text-red-200",
  PENDING_REVIEW: "bg-amber-900/50 text-amber-200",
  FLAGGED: "bg-fuchsia-900/50 text-fuchsia-200",
};

const CityOptions = ({ cities = [] }) => cities
  .filter((city) => field(city, "enabled", "active") !== false)
  .map((city) => ({
    value: cityId(city) ?? cityName(city),
    label: cityName(city),
  }))
  .filter((city) => city.value !== undefined && city.label);

const PlayerOptions = ({ players = [] }) => players
  .map((player) => ({ value: field(player, "playerUuid", "player_uuid", "id_minecraft", "id"), label: field(player, "pseudo_minecraft", "playerName", "player_name", "name") }))
  .filter((player) => player.value && player.label)
  .sort((a, b) => a.label.localeCompare(b.label, "fr"));

const CounterOptions = ({ counters = [] }) => counters
  .map((counter) => ({ value: counterId(counter), label: counter.name || `Comptoir ${counterId(counter)}` }))
  .filter((counter) => counter.value !== undefined)
  .sort((a, b) => a.label.localeCompare(b.label, "fr"));

const resolveCityName = (item, cities) => {
  const embeddedCity = item?.city;
  if (embeddedCity && typeof embeddedCity === "object") return cityName(embeddedCity);
  const directName = field(item, "cityName", "city_name");
  if (directName) return directName;
  const itemCityId = field(item, "cityId", "city_id", "city");
  return cityName(cities.find((city) => String(cityId(city)) === String(itemCityId))) || itemCityId;
};

const enrichTransactions = (transactions, counters, cities) => transactions.map((tx) => {
  const counterValue = field(tx, "counterId", "counter_id", "counter");
  const cityValue = field(tx, "cityId", "city_id", "city");
  const counter = counters.find((item) => String(counterId(item)) === String(counterValue));
  const city = cities.find((item) => String(cityId(item)) === String(cityValue));
  return {
    ...tx,
    counterName: field(tx, "counterName", "counter_name") || counter?.name || counterValue,
    cityName: field(tx, "cityName", "city_name") || cityName(city) || cityValue,
  };
});

const enrichWithdrawals = (withdrawals, counters, cities) => withdrawals.map((withdrawal) => {
  const counterValue = field(withdrawal, "counterId", "counter_id", "counter");
  const counter = counters.find((item) => String(counterId(item)) === String(counterValue));
  const cityValue = field(withdrawal, "cityId", "city_id", "city") || field(counter, "cityId", "city_id", "city");
  const city = cities.find((item) => String(cityId(item)) === String(cityValue));
  return {
    ...withdrawal,
    counterName: field(withdrawal, "counterName", "counter_name") || counter?.name || counterValue,
    cityName: field(withdrawal, "cityName", "city_name") || field(counter, "cityName", "city_name", "city") || cityName(city) || cityValue,
  };
});

const requestError = (error, fallback) => error?.response?.status === 403
  ? "Acces refuse."
  : error?.response?.status === 404
    ? "Comptoir introuvable."
    : error?.response?.data?.detail || fallback;

const normalizeAuditPayload = (payload) => ({
  counter: field(payload, "counter") || payload,
  items: toList(field(payload, "items", "counterItems", "counter_items")) || toList(field(payload, "counter", "items")),
  transactions: toList(field(payload, "transactions", "recentTransactions", "recent_transactions")),
  withdrawals: toList(field(payload, "withdrawals")),
  logs: toList(field(payload, "logs", "moderationLogs", "moderation_logs", "history", "events")),
  owner: field(payload, "owner"),
});

function ModerationStatusBadge({ status }) {
  return <span className={`rounded-full px-2 py-1 text-xs ${statusTone[status] || "bg-[#1b1b17] text-stone-200"}`}>{status || "—"}</span>;
}

function RiskScoreBadge({ value }) {
  const score = Number(value || 0);
  const tone = score >= 80 ? "bg-red-900/50 text-red-200" : score >= 50 ? "bg-amber-900/50 text-amber-200" : "bg-green-900/50 text-green-200";
  return <span className={`rounded-full px-2 py-1 text-xs ${tone}`}>{score}</span>;
}

function ActionDialog({ open, title, description, reasonRequired = false, reason, setReason, confirmLabel, confirmTone = "bg-red-600 hover:bg-red-500", loading, onCancel, onConfirm }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
    <div className="w-full max-w-xl rounded-sm border border-stone-700 bg-[#11110f] p-6 shadow-none">
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-3 text-sm text-stone-300">{description}</p>
      {reasonRequired && <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Raison obligatoire" className="mt-4 min-h-28 w-full rounded-lg border border-stone-600 bg-gray-950 px-3 py-2 text-sm text-gray-100 outline-none focus:border-amber-500" />}
      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white">Annuler</button>
        <button type="button" disabled={loading || (reasonRequired && !reason.trim())} onClick={onConfirm} className={`rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 ${confirmTone}`}>{loading ? "Traitement..." : confirmLabel}</button>
      </div>
    </div>
  </div>;
}

function ModerationActions({ counter, onDisable, onEnable, onFlag, detailBase = "/admin/markets/moderation" }) {
  const counterStatus = moderationStatusValue(counter);
  const isDisabled = counterStatus === "DISABLED" || field(counter, "active") === false;
  return <div className="flex flex-wrap gap-2">
    <Link className="text-amber-300 hover:text-amber-200" to={`${detailBase}/${counterId(counter)}`}>Voir detail</Link>
    <Link className="text-stone-300 hover:text-white" to={`/admin/markets/counters/${counterId(counter)}`}>Voir historique</Link>
    {!isDisabled && <button type="button" onClick={() => onDisable(counter)} className="text-red-400 hover:text-red-300">Desactiver</button>}
    {isDisabled && <button type="button" onClick={() => onEnable(counter)} className="text-green-400 hover:text-green-300">Reactiver</button>}
    <button type="button" onClick={() => onFlag(counter)} className="text-amber-400 hover:text-amber-300">Marquer a verifier</button>
  </div>;
}

function MarketModerationTable({ counters = [], onDisable, onEnable, onFlag }) {
  return <TableShell headers={["Nom", "Type", "Proprietaire", "Ville", "Statut", "Actif", "Items", "Transactions", "Derniere transaction", "Gains / solde", "Risque", "Actions"]}>{counters.map((counter) => <tr key={counterId(counter)}>
    <Cell>{counter.name}</Cell>
    <Cell><MarketTypeBadge type={counter.type} /></Cell>
    <Cell>{ownerNameValue(counter)}</Cell>
    <Cell>{field(counter, "cityName", "city_name", "city") || "Sans ville"}</Cell>
    <Cell><ModerationStatusBadge status={moderationStatusValue(counter)} /></Cell>
    <Cell><Bool value={field(counter, "active")} /></Cell>
    <Cell>{itemCountValue(counter)}</Cell>
    <Cell>{transactionCountValue(counter)}</Cell>
    <Cell>{dateTime(field(counter, "lastTransactionAt", "last_transaction_at"))}</Cell>
    <Cell>{field(counter, "estimatedBalance", "estimated_balance", "estimatedEarnings", "estimated_earnings", "netBalance", "net_balance") != null ? <MoneyDisplay amount={field(counter, "estimatedBalance", "estimated_balance", "estimatedEarnings", "estimated_earnings", "netBalance", "net_balance")} /> : "—"}</Cell>
    <Cell><RiskScoreBadge value={riskScoreValue(counter)} /></Cell>
    <Cell><ModerationActions counter={counter} onDisable={onDisable} onEnable={onEnable} onFlag={onFlag} /></Cell>
  </tr>)}</TableShell>;
}

function evaluateCounterRisks(counter, transactions = [], items = []) {
  const risks = [];
  const maxPrice = Math.max(0, ...toList(items).map((item) => Number(field(item, "manualBuyPrice", "manual_buy_price", "manualSellPrice", "manual_sell_price", "playerSellPrice", "player_sell_price", "playerBuyPrice", "player_buy_price") || 0)));
  const bigOwnerGain = Math.max(0, ...toList(transactions).map((tx) => Math.abs(Number(field(tx, "ownerGain", "owner_gain") || 0))));
  const now = Date.now();
  const lastTransactionAt = field(counter, "lastTransactionAt", "last_transaction_at");
  const lastTxAgeDays = lastTransactionAt ? (now - new Date(lastTransactionAt).getTime()) / 86400000 : null;
  const last24hTransactions = toList(transactions).filter((tx) => {
    const createdAt = field(tx, "createdAt", "created_at", "date");
    return createdAt && now - new Date(createdAt).getTime() <= 86400000;
  }).length;

  if (maxPrice >= 50000) risks.push(`Prix tres eleves detectes (${maxPrice}).`);
  if (last24hTransactions >= 25) risks.push(`${last24hTransactions} transactions sur les dernieres 24h.`);
  if (bigOwnerGain >= 25000) risks.push(`Owner gain anormal detecte (${bigOwnerGain}).`);
  if (toList(items).some((item) => !field(item, "itemId", "item_id"))) risks.push("Item inconnu ou incomplet detecte.");
  if (!field(counter, "cityName", "city_name", "city")) risks.push("Comptoir sans ville.");
  if (lastTxAgeDays != null && lastTxAgeDays >= 45) risks.push(`Comptoir inactif depuis ${Math.floor(lastTxAgeDays)} jours.`);
  if (toList(items).length >= 60) risks.push(`Beaucoup d'items en vente (${toList(items).length}).`);
  if (!risks.length && riskScoreValue(counter) >= 50) risks.push(`Risk score eleve (${riskScoreValue(counter)}).`);
  return risks;
}

export function AdminMarketDashboard() {
  const { loading: userLoading } = useUser();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (userLoading) return;
    setLoading(true);
    try {
      setDashboard(await api.getMarketDashboard());
    } finally {
      setLoading(false);
    }
  }, [userLoading]);
  useEffect(() => { load(); }, [load]);
  return <AdminLayout title="Gestion des comptoirs marchands" actions={<RecalculateMarketPricesButton onSuccess={load} />}><MarketState loading={loading || userLoading} error={!loading && !dashboard ? "Impossible de charger le tableau de bord." : ""}>
    <div className="mb-8 grid gap-4 md:grid-cols-4"><MarketDashboardCard label="Villes" value={field(dashboard, "cityCount", "city_count", "citiesCount", "cities_count")} /><MarketDashboardCard label="Items references" value={field(dashboard, "referenceItemCount", "reference_item_count", "itemsCount", "items_count")} /><MarketDashboardCard label="Comptoirs actifs" value={field(dashboard, "activeCounterCount", "active_counter_count", "activeCounters", "active_counters")} /><MarketDashboardCard label="Dernier recalcul" value={dateTime(field(dashboard, "lastCalculationAt", "last_calculation_at") || field(dashboard?.lastCalculation, "calculatedAt", "calculated_at"))} /></div>
    <h2 className="mb-3 text-xl font-bold">Derniers recalculs</h2><CalculationRunsTable runs={toList(field(dashboard, "calculationRuns", "calculation_runs"))} />
    <h2 className="mb-3 mt-8 text-xl font-bold">Dernieres transactions</h2><MarketTransactionsTable transactions={toList(field(dashboard, "transactions", "recent_transactions"))} />
  </MarketState></AdminLayout>;
}

export function AdminReferenceItemsPage() {
  const { loading: userLoading } = useUser();
  const list = useMarketList(api.getReferenceItems, {}, !userLoading);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({});
  const save = async (payload) => {
    setSaving(true);
    try {
      editing ? await api.updateReferenceItem(editing.id, payload) : await api.createReferenceItem(payload);
      setFormOpen(false);
      setEditing(null);
      await list.load();
      setToast({ status: "success", message: "Item enregistre." });
    } catch {
      setToast({ status: "error", message: "L'item n'a pas pu etre enregistre." });
    } finally {
      setSaving(false);
    }
  };
  const disable = async (item) => { await api.disableReferenceItem(item.id); list.load(); };
  return <AdminLayout title="Items de reference" actions={<button onClick={() => { setEditing(null); setFormOpen(true); }} className="rounded-lg bg-amber-800 px-4 py-2 font-bold">Ajouter un item</button>}>{formOpen && <ReferenceItemForm item={editing} existingItems={list.data} onSave={save} saving={saving} onCancel={() => setFormOpen(false)} />}<MarketState loading={list.loading || userLoading} error={list.error} empty={!list.data.length}><ReferenceItemsTable items={list.data} onEdit={(item) => { setEditing(item); setFormOpen(true); }} onDisable={disable} /></MarketState><Toast {...toast} onClose={() => setToast({})} /></AdminLayout>;
}

export function AdminCityModifiersPage() {
  const { loading: userLoading } = useUser();
  const list = useMarketList(api.getCityModifiers, {}, !userLoading);
  const cities = useMarketList(api.getCities, {}, !userLoading);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const edit = (item) => { setEditing(item); setForm({ modifier: item.modifier, reason: item.reason || "", active: item.active }); };
  const save = async (e) => { e.preventDefault(); await api.updateCityModifier(editing.id, { ...form, modifier: Number(form.modifier) }); setEditing(null); list.load(); };
  return <AdminLayout title="Modificateurs economiques" description="Un modificateur de 1.10 augmente les prix de 10 %. Un modificateur de 0.90 les reduit de 10 %."><MarketFilters fields={[{ name: "city", label: cities.loading ? "Chargement des villes..." : "Ville", options: CityOptions({ cities: cities.data }) }, { name: "category", label: "Categorie", options: MARKET_CATEGORIES }]} values={list.filters} onChange={filterChange(list.setFilters)} onReset={() => list.setFilters({})} />
    {editing && <form onSubmit={save} className="mb-6 flex flex-wrap gap-3 rounded-sm border border-stone-700 bg-[#1b1b17] p-4"><input type="number" step="0.01" min="0" value={form.modifier} onChange={(e) => setForm({ ...form, modifier: e.target.value })} className="rounded bg-[#11110f] px-3 py-2" /><input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Raison" className="min-w-64 rounded bg-[#11110f] px-3 py-2" /><label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Actif</label><button className="rounded bg-amber-800 px-4">Enregistrer</button><button type="button" onClick={() => setEditing(null)} className="rounded bg-stone-800 px-4">Annuler</button></form>}
    <MarketState loading={list.loading || cities.loading || userLoading} error={list.error || cities.error} empty={!list.data.length}><TableShell headers={["Ville", "Categorie", "Modificateur", "Raison", "Actif", "Actions"]}>{list.data.map((item) => <tr key={item.id}><Cell>{resolveCityName(item, cities.data)}</Cell><Cell>{item.category}</Cell><Cell>{Number(item.modifier).toFixed(2)}</Cell><Cell>{item.reason}</Cell><Cell><Bool value={item.active} /></Cell><Cell><button onClick={() => edit(item)} className="text-amber-300">Modifier</button></Cell></tr>)}</TableShell></MarketState></AdminLayout>;
}

export function AdminCalculatedPricesPage() {
  const { loading: userLoading } = useUser();
  const list = useMarketList(api.getCalculatedPrices, {}, !userLoading);
  const cities = useMarketList(api.getCities, {}, !userLoading);
  const cityMarkets = useMemo(() => new Map(list.data.filter((p) => field(p, "marketType", "market_type", "type") === "CITY_MARKET").map((p) => [`${field(p, "cityId", "city_id", "city")}:${field(p, "itemId", "item_id")}`, field(p, "calculatedPrice", "calculated_price")])), [list.data]);
  const incoherent = (price) => Number(field(price, "calculatedPrice", "calculated_price")) < 1 || (field(price, "marketType", "market_type", "type") === "SHOP" && Number(cityMarkets.get(`${field(price, "cityId", "city_id", "city")}:${field(price, "itemId", "item_id")}`)) < Number(field(price, "calculatedPrice", "calculated_price")));
  return <AdminLayout title="Prix calcules"><MarketFilters fields={[{ name: "city", label: cities.loading ? "Chargement des villes..." : "Ville", options: CityOptions({ cities: cities.data }) }, { name: "category", label: "Categorie", options: MARKET_CATEGORIES }, { name: "type", label: "Type de comptoir", options: MARKET_TYPES }, { name: "item", label: "Item" }]} values={list.filters} onChange={filterChange(list.setFilters)} onReset={() => list.setFilters({})} /><MarketState loading={list.loading || userLoading} error={list.error} empty={!list.data.length}><TableShell headers={["Ville", "Item", "Categorie", "Type", "Prix calcule", "Achat joueur", "Prix vente joueur", "Version", "Date", "Controle"]}>{list.data.map((item) => <tr key={item.id}><Cell>{field(item, "cityName", "city_name", "city")}</Cell><Cell>{field(item, "displayName", "itemName", "item_id", "itemId")}</Cell><Cell>{item.category}</Cell><Cell><MarketTypeBadge type={field(item, "marketType", "market_type", "type")} /></Cell><Cell><MoneyDisplay amount={field(item, "calculatedPrice", "calculated_price")} /></Cell><Cell><MoneyDisplay amount={field(item, "playerBuyPrice", "player_buy_price")} /></Cell><Cell><MoneyDisplay amount={field(item, "playerSellPrice", "player_sell_price")} /></Cell><Cell>{field(item, "calculationVersion", "calculation_version")}</Cell><Cell>{dateTime(field(item, "calculatedAt", "calculated_at"))}</Cell><Cell>{incoherent(item) && <span title="Prix potentiellement incoherent" className="text-amber-400">A verifier</span>}</Cell></tr>)}</TableShell></MarketState></AdminLayout>;
}

export function AdminMerchantCountersPage() {
  const { loading: userLoading } = useUser();
  const list = useMarketList(api.getMerchantCounters, {}, !userLoading);
  const cities = useMarketList(api.getCities, {}, !userLoading);
  return <AdminLayout title="Comptoirs marchands"><MarketFilters fields={[{ name: "type", label: "Type", options: MARKET_TYPES }, { name: "city", label: cities.loading ? "Chargement des villes..." : "Ville", options: CityOptions({ cities: cities.data }) }, { name: "owner", label: "Proprietaire" }, { name: "active", label: "Etat", options: [{ value: "true", label: "Actif" }, { value: "false", label: "Inactif" }] }]} values={list.filters} onChange={filterChange(list.setFilters)} onReset={() => list.setFilters({})} /><MarketState loading={list.loading || userLoading} error={list.error} empty={!list.data.length}><MerchantCounterTable counters={list.data} /></MarketState></AdminLayout>;
}

export function AdminMerchantCounterDetailsPage() {
  const { id } = useParams();
  const { loading: userLoading } = useUser();
  const [counter, setCounter] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    if (userLoading) return;
    setLoading(true);
    setError("");
    try {
      const [counterData, transactionData, withdrawalData] = await Promise.all([
        api.getMerchantCounterDetails(id),
        api.getMerchantCounterTransactions(id),
        api.getMerchantCounterWithdrawals(id).catch((err) => {
          if (err?.response?.status === 404) return [];
          throw err;
        }),
      ]);
      setCounter(counterData);
      setTransactions(toList(transactionData));
      setWithdrawals(toList(withdrawalData));
    } catch (err) {
      setCounter(null);
      setTransactions([]);
      setWithdrawals([]);
      setError(requestError(err, "Impossible de charger le comptoir."));
    } finally {
      setLoading(false);
    }
  }, [id, userLoading]);
  useEffect(() => { load(); }, [load]);
  const toggle = async (key, value) => { await api.updateMerchantCounter(id, { [key]: value }); load(); };
  return <AdminLayout title={counter?.name || "Detail du comptoir"}><MarketState loading={loading || userLoading} error={error}><div className="mb-8 grid gap-4 rounded-sm border border-stone-700 bg-[#1b1b17] p-5 md:grid-cols-3"><p>Type: <MarketTypeBadge type={counter?.type} /></p><p>Ville: {field(counter, "cityName", "city_name", "city")}</p><p>Proprietaire: <OwnerTypeBadge type={field(counter, "ownerType", "owner_type")} /> {ownerNameValue(counter)}</p><p>Coordonnees: {[counter?.world, counter?.x, counter?.y, counter?.z].filter((v) => v !== undefined).join(" / ")}</p>{[["active", "Comptoir actif"], ["buyModeEnabled", "Mode achat"], ["sellModeEnabled", "Mode vente"]].map(([key, label]) => <label key={key} className="flex items-center gap-2"><input type="checkbox" checked={Boolean(field(counter, key, key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`)))} onChange={(e) => toggle(key, e.target.checked)} /> {label}</label>)}</div>
    <h2 className="mb-3 text-xl font-bold">Items du comptoir</h2><TableShell headers={["Item", "Nom", "Achat", "Vente", "Prix auto", "Achat manuel", "Vente manuelle", "Stock", "Quantite", "Modificateur"]}>{toList(counter?.items).map((item) => <tr key={item.id || field(item, "itemId", "item_id")}><Cell>{field(item, "itemId", "item_id")}</Cell><Cell>{field(item, "displayName", "display_name")}</Cell><Cell><Bool value={field(item, "buyEnabled", "buy_enabled")} /></Cell><Cell><Bool value={field(item, "sellEnabled", "sell_enabled")} /></Cell><Cell><Bool value={field(item, "autoPrice", "auto_price")} /></Cell><Cell><MoneyDisplay amount={field(item, "manualBuyPrice", "manual_buy_price")} /></Cell><Cell><MoneyDisplay amount={field(item, "manualSellPrice", "manual_sell_price")} /></Cell><Cell>{field(item, "stockMode", "stock_mode")}</Cell><Cell>{field(item, "stockQuantity", "stock_quantity")}</Cell><Cell>{field(item, "localModifier", "local_modifier")}</Cell></tr>)}</TableShell>
    <h2 className="mb-3 mt-8 text-xl font-bold">Gains et retraits</h2><CounterBalanceSummary transactions={transactions} withdrawals={withdrawals} />
    <h3 className="mb-3 text-lg font-bold">Historique des retraits</h3><MarketState empty={!withdrawals.length} emptyMessage="Aucun retrait enregistre."><MarketWithdrawalsTable withdrawals={withdrawals} compact /></MarketState>
    <h2 className="mb-3 mt-8 text-xl font-bold">Historique des transactions</h2><TransactionSummary transactions={transactions} /><MarketState empty={!transactions.length} emptyMessage="Aucune transaction enregistree."><MarketTransactionsTable transactions={transactions} compact /></MarketState></MarketState></AdminLayout>;
}

export function AdminMarketModerationPage() {
  const { loading: userLoading } = useUser();
  const list = useMarketList(api.getMarketCounterModeration, {}, !userLoading);
  const cities = useMarketList(api.getCities, {}, !userLoading);
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({});

  const counters = useMemo(() => list.data.filter((counter) => {
    if (list.filters.playerOnly === "true") {
      return field(counter, "type") === "PLAYER_MARKET" || field(counter, "ownerType", "owner_type") === "PLAYER";
    }
    return true;
  }), [list.data, list.filters.playerOnly]);

  const openAction = (type, counter) => {
    setDialog({ type, counter });
    setReason(type === "flag" ? "A verifier" : "");
  };

  const closeAction = () => {
    setDialog(null);
    setReason("");
    setSaving(false);
  };

  const submitAction = async () => {
    if (!dialog?.counter) return;
    setSaving(true);
    try {
      if (dialog.type === "disable") await api.disableMerchantCounter(counterId(dialog.counter), { reason: reason.trim() });
      if (dialog.type === "enable") await api.enableMerchantCounter(counterId(dialog.counter));
      if (dialog.type === "flag") await api.flagMerchantCounter(counterId(dialog.counter), { reason: reason.trim() });
      await list.load();
      setToast({ status: "success", message: dialog.type === "disable" ? "Comptoir desactive." : dialog.type === "enable" ? "Comptoir reactive." : "Comptoir marque a verifier." });
      closeAction();
    } catch (err) {
      setToast({ status: "error", message: err?.response?.data?.detail || "Action impossible." });
      setSaving(false);
    }
  };

  return <AdminLayout title="Moderation des Comptoirs marchands" description="Surveillez les comptoirs joueurs, marquez les cas douteux et desactivez les comptoirs abusifs sans les supprimer.">
    <MarketFilters fields={[
      { name: "type", label: "Type", options: MARKET_TYPES },
      { name: "ownerName", label: "Proprietaire" },
      { name: "city", label: cities.loading ? "Chargement des villes..." : "Ville", options: CityOptions({ cities: cities.data }) },
      { name: "moderationStatus", label: "Statut", options: ["ACTIVE", "DISABLED", "PENDING_REVIEW", "FLAGGED"] },
      { name: "active", label: "Etat", options: [{ value: "true", label: "Actif" }, { value: "false", label: "Inactif" }] },
      { name: "playerOnly", label: "Comptoirs joueurs", options: [{ value: "true", label: "Oui" }, { value: "false", label: "Tous" }] },
    ]} values={list.filters} onChange={filterChange(list.setFilters)} onReset={() => list.setFilters({})} />
    <MarketState loading={list.loading || cities.loading || userLoading} error={list.error || cities.error} empty={!counters.length}><MarketModerationTable counters={counters} onDisable={(counter) => openAction("disable", counter)} onEnable={(counter) => openAction("enable", counter)} onFlag={(counter) => openAction("flag", counter)} /></MarketState>
    <ActionDialog open={dialog?.type === "disable"} title="Desactiver le comptoir" description="Cette action desactivera le comptoir. Les joueurs ne pourront plus acheter ou vendre via ce comptoir apres synchronisation Minecraft." reasonRequired reason={reason} setReason={setReason} confirmLabel="Desactiver" loading={saving} onCancel={closeAction} onConfirm={submitAction} />
    <ActionDialog open={dialog?.type === "enable"} title="Reactiver le comptoir" description="Cette action reactivera le comptoir si sa configuration est valide." confirmLabel="Reactiver" confirmTone="bg-green-600 hover:bg-green-500" loading={saving} onCancel={closeAction} onConfirm={submitAction} />
    <ActionDialog open={dialog?.type === "flag"} title="Marquer a verifier" description="Ajoutez une raison pour signaler ce comptoir a la moderation." reasonRequired reason={reason} setReason={setReason} confirmLabel="Marquer" confirmTone="bg-amber-600 hover:bg-amber-500" loading={saving} onCancel={closeAction} onConfirm={submitAction} />
    <Toast {...toast} onClose={() => setToast({})} />
  </AdminLayout>;
}

export function AdminMarketModerationDetailsPage() {
  const { id } = useParams();
  const { loading: userLoading, user } = useUser();
  const [audit, setAudit] = useState({ counter: null, items: [], transactions: [], withdrawals: [], logs: [], owner: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({});

  const load = useCallback(async () => {
    if (userLoading) return;
    setLoading(true);
    setError("");
    try {
      const payload = await api.getMerchantCounterAudit(id).catch(async (err) => {
        if (err?.response?.status !== 404) throw err;
        const [counterData, transactionData, withdrawalData] = await Promise.all([
          api.getMerchantCounterDetails(id),
          api.getMerchantCounterTransactions(id),
          api.getMerchantCounterWithdrawals(id).catch((withdrawErr) => {
            if (withdrawErr?.response?.status === 404) return [];
            throw withdrawErr;
          }),
        ]);
        return { counter: counterData, transactions: transactionData, withdrawals: withdrawalData, items: field(counterData, "items") || [] };
      });
      setAudit(normalizeAuditPayload(payload));
    } catch (err) {
      setAudit({ counter: null, items: [], transactions: [], withdrawals: [], logs: [], owner: null });
      setError(requestError(err, "Impossible de charger l'audit du comptoir."));
    } finally {
      setLoading(false);
    }
  }, [id, userLoading]);

  useEffect(() => { load(); }, [load]);

  const currentCounter = audit.counter;
  const currentItems = toList(audit.items);
  const currentTransactions = toList(audit.transactions);
  const currentWithdrawals = toList(audit.withdrawals);
  const currentLogs = toList(audit.logs);
  const risks = useMemo(() => evaluateCounterRisks(currentCounter || {}, currentTransactions, currentItems), [currentCounter, currentTransactions, currentItems]);

  const openAction = (type) => {
    setDialog(type);
    setReason(type === "flag" ? "A verifier" : "");
  };

  const closeAction = () => {
    setDialog(null);
    setReason("");
    setSaving(false);
  };

  const submitAction = async () => {
    if (!currentCounter) return;
    setSaving(true);
    try {
      if (dialog === "disable") await api.disableMerchantCounter(counterId(currentCounter), { reason: reason.trim() });
      if (dialog === "enable") await api.enableMerchantCounter(counterId(currentCounter));
      if (dialog === "flag") await api.flagMerchantCounter(counterId(currentCounter), { reason: reason.trim() });
      await load();
      setToast({ status: "success", message: dialog === "disable" ? "Comptoir desactive." : dialog === "enable" ? "Comptoir reactive." : "Comptoir marque a verifier." });
      closeAction();
    } catch (err) {
      setToast({ status: "error", message: err?.response?.data?.detail || "Action impossible." });
      setSaving(false);
    }
  };

  return <AdminLayout title={currentCounter?.name || "Moderation du comptoir"} description="Audit detaille du comptoir, moderation et indicateurs de risque."><MarketState loading={loading || userLoading} error={error}>
    <div className="mb-6 flex flex-wrap gap-3">
      <button type="button" onClick={() => openAction("disable")} className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-500">Desactiver</button>
      <button type="button" onClick={() => openAction("enable")} className="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-500">Reactiver</button>
      <button type="button" onClick={() => openAction("flag")} className="rounded-lg bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-500">Marquer a verifier</button>
      <Link to={`/admin/markets/counters/${counterId(currentCounter)}`} className="rounded-lg bg-stone-800 px-4 py-2 font-semibold text-white hover:bg-gray-600">Voir la fiche standard</Link>
    </div>

    <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MarketDashboardCard label="Statut de moderation" value={<ModerationStatusBadge status={moderationStatusValue(currentCounter)} />} />
      <MarketDashboardCard label="Actif" value={<Bool value={field(currentCounter, "active")} />} />
      <MarketDashboardCard label="Source de creation" value={field(currentCounter, "createdSource", "created_source") || "—"} />
      <MarketDashboardCard label="Risk score" value={<RiskScoreBadge value={riskScoreValue(currentCounter)} />} />
    </div>

    <div className="mb-8 grid gap-4 rounded-sm border border-stone-700 bg-[#1b1b17] p-5 lg:grid-cols-2">
      <div className="space-y-2">
        <p className="text-sm text-stone-300">Nom : <span className="font-semibold text-white">{currentCounter?.name || "—"}</span></p>
        <p className="text-sm text-stone-300">Type : <MarketTypeBadge type={currentCounter?.type} /></p>
        <p className="text-sm text-stone-300">Proprietaire : <OwnerTypeBadge type={field(currentCounter, "ownerType", "owner_type")} /> {ownerNameValue(currentCounter)}</p>
        <p className="text-sm text-stone-300">Ville : {field(currentCounter, "cityName", "city_name", "city") || "Sans ville"}</p>
        <p className="text-sm text-stone-300">Position Minecraft : {[field(currentCounter, "world"), field(currentCounter, "x"), field(currentCounter, "y"), field(currentCounter, "z")].filter((value) => value !== undefined && value !== null).join(" / ") || "—"}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-stone-300">Derniere transaction : <span className="text-white">{dateTime(field(currentCounter, "lastTransactionAt", "last_transaction_at"))}</span></p>
        <p className="text-sm text-stone-300">Derniere interaction proprio : <span className="text-white">{dateTime(field(currentCounter, "lastOwnerInteractionAt", "last_owner_interaction_at"))}</span></p>
        <p className="text-sm text-stone-300">Raison de desactivation : <span className="text-white">{field(currentCounter, "moderationReason", "moderation_reason") || "—"}</span></p>
        <p className="text-sm text-stone-300">Raison de flag : <span className="text-white">{field(currentCounter, "flaggedReason", "flagged_reason") || "—"}</span></p>
        <p className="text-sm text-stone-300">Desactive par : <span className="text-white">{field(currentCounter, "disabledBy", "disabled_by") || field(user, "pseudo_minecraft", "username", "email") || "—"}</span></p>
      </div>
    </div>

    <CounterBalanceSummary transactions={currentTransactions} withdrawals={currentWithdrawals} />

    <div className="mb-8 rounded-sm border border-stone-700 bg-[#1b1b17] p-5">
      <h2 className="mb-3 text-xl font-bold">Risques detectes</h2>
      {risks.length ? <ul className="space-y-2 text-sm text-amber-200">{risks.map((risk) => <li key={risk} className="rounded-lg border border-amber-800/60 bg-amber-950/20 px-3 py-2">{risk}</li>)}</ul> : <p className="text-sm text-stone-400">Aucun signal fort detecte pour le moment.</p>}
    </div>

    <h2 className="mb-3 text-xl font-bold">Items en vente</h2>
    <MarketState empty={!currentItems.length} emptyMessage="Aucun item configure."><TableShell headers={["Item", "Nom", "Achat", "Vente", "Prix achat", "Prix vente", "Stock", "Quantite"]}>{currentItems.map((item) => <tr key={item.id || field(item, "itemId", "item_id")}><Cell>{field(item, "itemId", "item_id") || "Item inconnu"}</Cell><Cell>{field(item, "displayName", "display_name") || "—"}</Cell><Cell><Bool value={field(item, "buyEnabled", "buy_enabled")} /></Cell><Cell><Bool value={field(item, "sellEnabled", "sell_enabled")} /></Cell><Cell><MoneyDisplay amount={field(item, "manualBuyPrice", "manual_buy_price", "playerBuyPrice", "player_buy_price")} /></Cell><Cell><MoneyDisplay amount={field(item, "manualSellPrice", "manual_sell_price", "playerSellPrice", "player_sell_price")} /></Cell><Cell>{field(item, "stockMode", "stock_mode") || "—"}</Cell><Cell>{field(item, "stockQuantity", "stock_quantity") ?? "—"}</Cell></tr>)}</TableShell></MarketState>

    <h2 className="mb-3 mt-8 text-xl font-bold">Transactions recentes</h2>
    <MarketState empty={!currentTransactions.length} emptyMessage="Aucune transaction enregistree."><MarketTransactionsTable transactions={currentTransactions} compact /></MarketState>

    <h2 className="mb-3 mt-8 text-xl font-bold">Retraits</h2>
    <MarketState empty={!currentWithdrawals.length} emptyMessage="Aucun retrait enregistre."><MarketWithdrawalsTable withdrawals={currentWithdrawals} compact /></MarketState>

    <h2 className="mb-3 mt-8 text-xl font-bold">Historique de moderation</h2>
    <MarketState empty={!currentLogs.length} emptyMessage="Aucun historique de moderation disponible."><TableShell headers={["Date", "Action", "Auteur", "Raison", "Details"]}>{currentLogs.map((log, index) => <tr key={log.id || `${field(log, "createdAt", "created_at", "date")}-${index}`}><Cell>{dateTime(field(log, "createdAt", "created_at", "date"))}</Cell><Cell>{field(log, "action", "status", "event") || "—"}</Cell><Cell>{field(log, "adminName", "admin_name", "author", "user") || "—"}</Cell><Cell>{field(log, "reason", "message") || "—"}</Cell><Cell>{field(log, "details", "metadata") ? JSON.stringify(field(log, "details", "metadata")) : "—"}</Cell></tr>)}</TableShell></MarketState>

    <ActionDialog open={dialog === "disable"} title="Desactiver le comptoir" description="Cette action desactivera le comptoir. Les joueurs ne pourront plus acheter ou vendre via ce comptoir apres synchronisation Minecraft." reasonRequired reason={reason} setReason={setReason} confirmLabel="Desactiver" loading={saving} onCancel={closeAction} onConfirm={submitAction} />
    <ActionDialog open={dialog === "enable"} title="Reactiver le comptoir" description="Cette action reactivera le comptoir si sa configuration est valide." confirmLabel="Reactiver" confirmTone="bg-green-600 hover:bg-green-500" loading={saving} onCancel={closeAction} onConfirm={submitAction} />
    <ActionDialog open={dialog === "flag"} title="Marquer a verifier" description="Ajoutez une raison pour signaler ce comptoir a la moderation." reasonRequired reason={reason} setReason={setReason} confirmLabel="Marquer" confirmTone="bg-amber-600 hover:bg-amber-500" loading={saving} onCancel={closeAction} onConfirm={submitAction} />
    <Toast {...toast} onClose={() => setToast({})} />
  </MarketState></AdminLayout>;
}

export function AdminMarketTransactionsPage() {
  const { loading: userLoading } = useUser();
  const list = useMarketList(api.getMarketTransactions, {}, !userLoading);
  const cities = useMarketList(api.getCities, {}, !userLoading);
  const counters = useMarketList(api.getMerchantCounters, {}, !userLoading);
  const players = useMarketList(getTransactionPlayers, {}, !userLoading);
  const transactions = useMemo(() => {
    const from = list.filters.from ? new Date(`${list.filters.from}T00:00:00`) : null;
    const to = list.filters.to ? new Date(`${list.filters.to}T23:59:59.999`) : null;
    return enrichTransactions(list.data, counters.data, cities.data).filter((tx) => {
      const createdAt = new Date(field(tx, "createdAt", "created_at", "date"));
      return (!from || createdAt >= from) && (!to || createdAt <= to);
    });
  }, [list.data, list.filters.from, list.filters.to, counters.data, cities.data]);
  const error = list.errorStatus === 403 ? "Acces refuse." : list.errorStatus === 404 ? "Aucune transaction enregistree." : list.error;
  return <AdminLayout title="Transactions des marches"><MarketFilters fields={[
    { name: "player", label: players.loading ? "Chargement des joueurs..." : "Joueur", options: PlayerOptions({ players: players.data }) },
    { name: "city", label: cities.loading ? "Chargement des villes..." : "Ville", options: CityOptions({ cities: cities.data }) },
    { name: "counter", label: counters.loading ? "Chargement des comptoirs..." : "Comptoir", options: CounterOptions({ counters: counters.data }) },
    { name: "item", label: "Item" },
    { name: "action", label: "Action", options: ["BUY", "SELL"] },
    { name: "from", label: "Date de debut", type: "date" },
    { name: "to", label: "Date de fin", type: "date" },
  ]} values={list.filters} onChange={filterChange(list.setFilters)} onReset={() => list.setFilters({})} /><MarketState loading={list.loading || cities.loading || counters.loading || userLoading} error={error || cities.error || counters.error} empty={!transactions.length} emptyMessage="Aucune transaction enregistree."><MarketTransactionsTable transactions={transactions} /></MarketState></AdminLayout>;
}

export function AdminMarketWithdrawalsPage() {
  const { loading: userLoading } = useUser();
  const list = useMarketList(api.getMarketWithdrawals, {}, !userLoading);
  const cities = useMarketList(api.getCities, {}, !userLoading);
  const counters = useMarketList(api.getMerchantCounters, {}, !userLoading);
  const withdrawals = useMemo(() => {
    const from = list.filters.from ? new Date(`${list.filters.from}T00:00:00`) : null;
    const to = list.filters.to ? new Date(`${list.filters.to}T23:59:59.999`) : null;
    return enrichWithdrawals(list.data, counters.data, cities.data).filter((withdrawal) => {
      const withdrawnAt = new Date(field(withdrawal, "withdrawnAt", "withdrawn_at", "createdAt", "created_at"));
      return (!from || withdrawnAt >= from) && (!to || withdrawnAt <= to);
    });
  }, [list.data, list.filters.from, list.filters.to, counters.data, cities.data]);
  const error = list.errorStatus === 403 ? "Acces refuse." : list.errorStatus === 404 ? "" : list.error;
  return <AdminLayout title="Retraits des comptoirs"><MarketFilters fields={[
    { name: "city", label: cities.loading ? "Chargement des villes..." : "Ville", options: CityOptions({ cities: cities.data }) },
    { name: "counter", label: counters.loading ? "Chargement des comptoirs..." : "Comptoir", options: CounterOptions({ counters: counters.data }) },
    { name: "from", label: "Date de debut", type: "date" },
    { name: "to", label: "Date de fin", type: "date" },
  ]} values={list.filters} onChange={filterChange(list.setFilters)} onReset={() => list.setFilters({})} /><MarketState loading={list.loading || cities.loading || counters.loading || userLoading} error={error || cities.error || counters.error} empty={!withdrawals.length} emptyMessage="Aucun retrait enregistre."><MarketWithdrawalsTable withdrawals={withdrawals} /></MarketState></AdminLayout>;
}

function CalculationRunsTable({ runs }) {
  return <TableShell headers={["Debut", "Fin", "Lance par", "Source", "Statut", "Version", "Details"]}>{runs.map((run) => <tr key={run.id}><Cell>{dateTime(field(run, "startedAt", "started_at"))}</Cell><Cell>{dateTime(field(run, "finishedAt", "finished_at"))}</Cell><Cell>{field(run, "launchedBy", "launched_by")}</Cell><Cell>{run.source}</Cell><Cell>{run.status}</Cell><Cell>{field(run, "calculationVersion", "calculation_version")}</Cell><Cell>{run.details}</Cell></tr>)}</TableShell>;
}

export function AdminCalculationRunsPage() {
  const { loading: userLoading } = useUser();
  const list = useMarketList(api.getCalculationRuns, {}, !userLoading);
  return <AdminLayout title="Historique des recalculs"><MarketState loading={list.loading || userLoading} error={list.error} empty={!list.data.length}><CalculationRunsTable runs={list.data} /></MarketState></AdminLayout>;
}
