import { Link } from "react-router-dom";
import { MoneyDisplay } from "../MoneyDisplay";
import LoadingButton from "../LoadingButton";

export const MARKET_TYPES = ["SHOP", "CITY_MARKET", "TEMPORARY_MARKET", "GUILD_COUNTER", "PLAYER_MARKET"];
export const MARKET_CATEGORIES = [
  "FOOD", "WOOD", "STONE", "IRON", "TOOLS", "WEAPONS", "ARMOR",
  "FARMING", "ALCHEMY", "LUXURY", "CONSTRUCTION", "RARE", "GUILD", "OTHER",
];

const typeLabels = {
  SHOP: "Boutique",
  CITY_MARKET: "Marche de ville",
  TEMPORARY_MARKET: "Marche temporaire",
  GUILD_COUNTER: "Comptoir de guilde",
  PLAYER_MARKET: "Comptoir joueur",
};

export const toList = (data) => Array.isArray(data) ? data : data?.results || data?.items || [];
export const field = (item, ...keys) => keys.map((key) => item?.[key]).find((value) => value !== undefined && value !== null);
export const dateTime = (value) => value ? new Date(value).toLocaleString("fr-FR") : "—";

export function MarketTypeBadge({ type }) {
  return <span className="rounded-full bg-amber-900/50 px-2 py-1 text-xs text-amber-200">{typeLabels[type] || type || "—"}</span>;
}

export function OwnerTypeBadge({ type }) {
  return <span className={`rounded-full px-2 py-1 text-xs ${type === "ADMIN" ? "bg-red-900/50 text-red-200" : "bg-blue-900/50 text-blue-200"}`}>{type || "—"}</span>;
}

export function MarketDashboardCard({ label, value }) {
  return <div className="rounded-xl border border-gray-700 bg-gray-800 p-5"><p className="text-sm text-gray-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value ?? "—"}</p></div>;
}

export function RecalculatePricesButton({ loading, onClick }) {
  return <LoadingButton loading={loading} loadingLabel="Recalcul en cours..." onClick={onClick} className="rounded-lg bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-500">Recalculer les prix</LoadingButton>;
}

export function MarketPage({ title, description, actions, children }) {
  return <main className="min-h-screen bg-gray-900 px-4 py-10 text-gray-200"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-col gap-4 border-b border-gray-700 pb-6 md:flex-row md:items-end md:justify-between"><div><h1 className="text-3xl font-extrabold text-white">{title}</h1>{description && <p className="mt-2 text-gray-400">{description}</p>}</div>{actions}</header>{children}</div></main>;
}

export function MarketAdminNav() {
  const links = [
    ["Tableau de bord", "/admin/markets"],
    ["Items", "/admin/markets/reference-items"],
    ["Modificateurs", "/admin/markets/city-modifiers"],
    ["Prix calcules", "/admin/markets/calculated-prices"],
    ["Comptoirs", "/admin/markets/counters"],
    ["Moderation", "/admin/markets/moderation"],
    ["Transactions", "/admin/markets/transactions"],
    ["Retraits", "/admin/markets/withdrawals"],
    ["Recalculs", "/admin/markets/calculation-runs"],
  ];
  return <nav className="mb-6 flex flex-wrap gap-2">{links.map(([label, to]) => <Link key={to} to={to} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm hover:border-amber-500 hover:text-white">{label}</Link>)}</nav>;
}

export function MarketState({ loading, error, empty, emptyMessage = "Aucune donnee disponible.", children }) {
  if (loading) return <div className="rounded-xl border border-gray-700 bg-gray-800 p-8 text-center">Chargement...</div>;
  if (error) return <div className="rounded-xl border border-red-800 bg-red-950/30 p-5 text-red-200">{error}</div>;
  if (empty) return <div className="rounded-xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-400">{emptyMessage}</div>;
  return children;
}

export function MarketFilters({ fields, values, onChange, onSubmit, onReset }) {
  return <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} className="mb-6 grid gap-3 rounded-xl border border-gray-700 bg-gray-800 p-4 md:grid-cols-3 xl:grid-cols-6">
    {fields.map((item) => item.options ? <select key={item.name} value={values[item.name] || ""} onChange={(e) => onChange(item.name, e.target.value)} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2"><option value="">{item.label}</option>{item.options.map((option) => <option key={option.value ?? option.id ?? option} value={option.value ?? option.id ?? option}>{option.label ?? option.name ?? option}</option>)}</select> : <input key={item.name} type={item.type || "text"} value={values[item.name] || ""} onChange={(e) => onChange(item.name, e.target.value)} placeholder={item.label} className="rounded-lg border border-gray-600 bg-gray-900 px-3 py-2" />)}
    <div className="flex gap-2"><button className="rounded-lg bg-blue-600 px-4 py-2 font-semibold">Filtrer</button><button type="button" onClick={onReset} className="rounded-lg bg-gray-700 px-4 py-2">Effacer</button></div>
  </form>;
}

export function TableShell({ headers, children }) {
  return <div className="overflow-x-auto rounded-xl border border-gray-700 bg-gray-800"><table className="w-full text-left text-sm"><thead className="bg-gray-900/70 text-gray-300"><tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-gray-700">{children}</tbody></table></div>;
}

export const Cell = ({ children, className = "" }) => <td className={`whitespace-nowrap px-4 py-3 ${className}`}>{children ?? "—"}</td>;
export const Bool = ({ value }) => <span className={value ? "text-green-400" : "text-gray-500"}>{value ? "Oui" : "Non"}</span>;

export const transactionSummary = (transactions = []) => transactions.reduce((summary, tx) => {
  const ownerGain = Number(field(tx, "ownerGain", "owner_gain") || 0);
  const totalPrice = Number(field(tx, "totalPrice", "total_price", "total") || 0);
  summary.gains += Math.max(0, ownerGain);
  summary.costs += Math.abs(Math.min(0, ownerGain));
  summary.net += ownerGain;
  summary.transactions += 1;
  summary.buys += tx.action === "BUY" ? 1 : 0;
  summary.sells += tx.action === "SELL" ? 1 : 0;
  summary.buyAmount += tx.action === "BUY" ? totalPrice : 0;
  summary.sellAmount += tx.action === "SELL" ? totalPrice : 0;
  return summary;
}, { gains: 0, costs: 0, net: 0, transactions: 0, buys: 0, sells: 0, buyAmount: 0, sellAmount: 0 });

export const withdrawalSummary = (withdrawals = []) => withdrawals.reduce((summary, withdrawal) => {
  const amount = Number(field(withdrawal, "amount", "withdrawnAmount", "withdrawn_amount") || 0);
  const withdrawnAt = field(withdrawal, "withdrawnAt", "withdrawn_at", "createdAt", "created_at");
  summary.total += amount;
  summary.count += 1;
  if (!summary.lastWithdrawalAt || (withdrawnAt && new Date(withdrawnAt) > new Date(summary.lastWithdrawalAt))) {
    summary.lastWithdrawalAt = withdrawnAt || summary.lastWithdrawalAt;
    summary.lastWithdrawal = withdrawal;
  }
  return summary;
}, { total: 0, count: 0, lastWithdrawalAt: null, lastWithdrawal: null });

export const counterBalanceSummary = (transactions = [], withdrawals = []) => {
  const txSummary = transactionSummary(transactions);
  const wdSummary = withdrawalSummary(withdrawals);
  return {
    ...txSummary,
    totalWithdrawn: wdSummary.total,
    withdrawals: wdSummary.count,
    lastWithdrawalAt: wdSummary.lastWithdrawalAt,
    lastWithdrawal: wdSummary.lastWithdrawal,
    estimatedBalance: txSummary.net - wdSummary.total,
  };
};

export function TransactionSummary({ transactions = [] }) {
  const summary = transactionSummary(transactions);
  const cards = [
    ["Total des gains", <MoneyDisplay amount={summary.gains} />],
    ["Total des couts", <MoneyDisplay amount={summary.costs} />],
    ["Solde net", <span className={summary.net < 0 ? "text-red-300" : "text-green-300"}>{summary.net < 0 ? "−" : ""}<MoneyDisplay amount={Math.abs(summary.net)} /></span>],
    ["Transactions", summary.transactions],
    ["Achats", summary.buys],
    ["Ventes", summary.sells],
  ];
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{cards.map(([label, value]) => <div key={label} className="rounded-xl border border-gray-700 bg-gray-800 p-4"><p className="text-xs uppercase tracking-wide text-gray-400">{label}</p><div className="mt-2 text-lg font-bold text-white">{value}</div></div>)}</div>;
}

export function CounterBalanceSummary({ transactions = [], withdrawals = [], labels = {} }) {
  const summary = counterBalanceSummary(transactions, withdrawals);
  const cards = [
    [labels.buyAmount || "Total des transactions BUY", <MoneyDisplay amount={summary.buyAmount} />],
    [labels.sellAmount || "Total des transactions SELL", <MoneyDisplay amount={summary.sellAmount} />],
    [labels.net || "Solde net theorique", <span className={summary.net < 0 ? "text-red-300" : "text-green-300"}>{summary.net < 0 ? "−" : ""}<MoneyDisplay amount={Math.abs(summary.net)} /></span>],
    [labels.withdrawn || "Total retire", <MoneyDisplay amount={summary.totalWithdrawn} />],
    [labels.estimatedBalance || "Solde net estime", <span className={summary.estimatedBalance < 0 ? "text-red-300" : "text-green-300"}>{summary.estimatedBalance < 0 ? "−" : ""}<MoneyDisplay amount={Math.abs(summary.estimatedBalance)} /></span>],
    [labels.lastWithdrawal || "Dernier retrait", summary.lastWithdrawalAt ? dateTime(summary.lastWithdrawalAt) : "—"],
  ];
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{cards.map(([label, value]) => <div key={label} className="rounded-xl border border-gray-700 bg-gray-800 p-4"><p className="text-xs uppercase tracking-wide text-gray-400">{label}</p><div className="mt-2 text-lg font-bold text-white">{value}</div></div>)}</div>;
}

export function MarketTransactionsTable({ transactions = [], compact = false }) {
  const headers = compact
    ? ["Date", "Joueur", "Action", "Item", "Quantite", "Total", "Gain / cout proprietaire"]
    : ["Date", "Joueur", "Comptoir", "Ville", "Action", "Item", "Quantite", "Prix unitaire", "Total", "Gain / cout proprietaire"];
  return <TableShell headers={headers}>{transactions.map((tx) => {
    const ownerGain = Number(field(tx, "ownerGain", "owner_gain") || 0);
    const actionLabel = tx.action === "BUY" ? "Achat joueur" : tx.action === "SELL" ? "Vente joueur" : tx.action;
    return <tr key={tx.id || `${field(tx, "createdAt", "created_at")}-${field(tx, "itemId", "item_id")}`}>
      <Cell>{dateTime(field(tx, "date", "createdAt", "created_at"))}</Cell><Cell>{field(tx, "playerName", "player_name", "player")}</Cell>
      {!compact && <Cell>{field(tx, "counterName", "counter_name", "counter")}</Cell>}{!compact && <Cell>{field(tx, "cityName", "city_name", "city")}</Cell>}
      <Cell><span className={tx.action === "BUY" ? "text-blue-300" : "text-amber-300"}>{actionLabel}</span></Cell>
      <Cell>{field(tx, "itemDisplayName", "item_display_name", "displayName", "itemName", "item_id", "itemId")}</Cell><Cell>{tx.quantity}</Cell>
      {!compact && <Cell><MoneyDisplay amount={field(tx, "unitPrice", "unit_price")} /></Cell>}
      <Cell><MoneyDisplay amount={field(tx, "totalPrice", "total_price", "total")} /></Cell>
      <Cell><span className={ownerGain < 0 ? "text-red-300" : "text-green-300"}>{ownerGain < 0 ? "Cout" : "Gain"} : </span><MoneyDisplay amount={Math.abs(ownerGain)} /></Cell>
    </tr>;
  })}</TableShell>;
}

export function MerchantCounterTable({ counters = [] }) {
  return <TableShell headers={["Nom", "Type", "Ville", "Proprietaire", "Coordonnees", "Achat", "Vente", "Actif", "Actions"]}>{counters.map((counter) => <tr key={counter.id}><Cell>{counter.name}</Cell><Cell><MarketTypeBadge type={counter.type} /></Cell><Cell>{field(counter, "cityName", "city_name", "city")}</Cell><Cell>{field(counter, "ownerName", "owner_name") || "Administration"}</Cell><Cell>{[counter.world, counter.x, counter.y, counter.z].filter((v) => v !== undefined).join(" / ")}</Cell><Cell><Bool value={field(counter, "buyModeEnabled", "buy_mode_enabled")} /></Cell><Cell><Bool value={field(counter, "sellModeEnabled", "sell_mode_enabled")} /></Cell><Cell><Bool value={counter.active} /></Cell><Cell><Link className="text-blue-400 hover:text-blue-300" to={`/admin/markets/counters/${counter.id}`}>Details</Link></Cell></tr>)}</TableShell>;
}

export function MarketWithdrawalsTable({ withdrawals = [], compact = false }) {
  const headers = compact
    ? ["Date", "Proprietaire", "Montant"]
    : ["Date", "Comptoir", "Ville", "Proprietaire", "Source", "Montant"];
  return <TableShell headers={headers}>{withdrawals.map((withdrawal) => <tr key={withdrawal.id || `${field(withdrawal, "counterId", "counter_id")}-${field(withdrawal, "withdrawnAt", "withdrawn_at", "createdAt", "created_at")}-${field(withdrawal, "amount")}`}>
    <Cell>{dateTime(field(withdrawal, "withdrawnAt", "withdrawn_at", "createdAt", "created_at"))}</Cell>
    {!compact && <Cell>{field(withdrawal, "counterName", "counter_name", "counter")}</Cell>}
    {!compact && <Cell>{field(withdrawal, "cityName", "city_name", "city")}</Cell>}
    <Cell>{field(withdrawal, "ownerName", "owner_name")}</Cell>
    {!compact && <Cell>{field(withdrawal, "source") || "MINECRAFT"}</Cell>}
    <Cell><MoneyDisplay amount={field(withdrawal, "amount", "withdrawnAmount", "withdrawn_amount")} /></Cell>
  </tr>)}</TableShell>;
}

const PriceCell = ({ amount }) => (
  amount === undefined || amount === null ? <Cell>—</Cell> : <Cell><MoneyDisplay amount={amount} /></Cell>
);

export function PublicMarketPriceTable({ prices = [], summary = [] }) {
  return <div className="space-y-8">
    {!!summary.length && <section>
      <h2 className="mb-3 text-xl font-bold text-white">Prix de référence et moyenne actuelle</h2>
      <TableShell headers={["Élément", "Prix référence", "Prix moyen"]}>{summary.map((item) => <tr key={item.key}><Cell>{item.label}</Cell><PriceCell amount={item.referencePrice} /><PriceCell amount={item.averagePrice} /></tr>)}</TableShell>
    </section>}

    <section>
      <h2 className="mb-3 text-xl font-bold text-white">Prix actuels par ville</h2>
      <TableShell headers={["Ville", "Pain", "Fer", "Bois", "Pierre"]}>{prices.map((row) => <tr key={field(row, "cityId", "city_id", "cityName", "city_name", "city")}><Cell>{field(row, "cityName", "city_name", "city")}</Cell><PriceCell amount={field(row, "bread", "breadPrice", "bread_price")} /><PriceCell amount={field(row, "iron", "ironPrice", "iron_price")} /><PriceCell amount={field(row, "wood", "woodPrice", "wood_price")} /><PriceCell amount={field(row, "stone", "stonePrice", "stone_price")} /></tr>)}</TableShell>
    </section>
  </div>;
}
