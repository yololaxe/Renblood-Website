import { Link } from "react-router-dom";
import { MoneyDisplay } from "../MoneyDisplay";
import LoadingButton from "../LoadingButton";
import RealmHeader from "../RealmHeader";
import {signedMoney,absoluteMoney} from "../../utils/economyUI";
import {parseMoney} from "../../utils/money";

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
  return <div className="rounded-sm border border-stone-700 bg-[#1b1b17] p-5"><p className="text-sm text-stone-400">{label}</p><p className="mt-2 text-3xl font-bold text-white">{value ?? "—"}</p></div>;
}

export function RecalculatePricesButton({ loading, onClick }) {
  return <LoadingButton loading={loading} loadingLabel="Recalcul en cours..." onClick={onClick} className="rounded-lg bg-amber-600 px-5 py-3 font-bold text-white hover:bg-amber-500">Recalculer les prix</LoadingButton>;
}

export function MarketPage({ title, description, actions, children }) {
  return <main className="realm-page commerce-page"><RealmHeader eyebrow="Le registre / Commerce" title={title} description={description}>{actions}</RealmHeader><div className="realm-content py-8">{children}</div></main>;
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
  return <nav className="mb-6 flex flex-wrap gap-2">{links.map(([label, to]) => <Link key={to} to={to} className="rounded-lg border border-stone-700 bg-[#1b1b17] px-3 py-2 text-sm hover:border-amber-500 hover:text-white">{label}</Link>)}</nav>;
}

export function MarketState({ loading, error, empty, emptyMessage = "Aucune donnee disponible.", children }) {
  if (loading) return <div className="rounded-sm border border-stone-700 bg-[#1b1b17] p-8 text-center">Chargement...</div>;
  if (error) return <div className="rounded-sm border border-red-800 bg-red-950/30 p-5 text-red-200">{error}</div>;
  if (empty) return <div className="rounded-sm border border-stone-700 bg-[#1b1b17] p-8 text-center text-stone-400">{emptyMessage}</div>;
  return children;
}

export function MarketFilters({ fields, values, onChange, onSubmit, onReset }) {
  return <form onSubmit={(e) => { e.preventDefault(); onSubmit?.(); }} className="mb-6 grid gap-3 rounded-sm border border-stone-700 bg-[#1b1b17] p-4 md:grid-cols-3 xl:grid-cols-6">
    {fields.map((item) => item.options ? <select key={item.name} value={values[item.name] || ""} onChange={(e) => onChange(item.name, e.target.value)} className="rounded-lg border border-stone-600 bg-[#11110f] px-3 py-2"><option value="">{item.label}</option>{item.options.map((option) => <option key={option.value ?? option.id ?? option} value={option.value ?? option.id ?? option}>{option.label ?? option.name ?? option}</option>)}</select> : <input key={item.name} type={item.type || "text"} value={values[item.name] || ""} onChange={(e) => onChange(item.name, e.target.value)} placeholder={item.label} className="rounded-lg border border-stone-600 bg-[#11110f] px-3 py-2" />)}
    <div className="flex gap-2"><button className="rounded-lg bg-amber-800 px-4 py-2 font-semibold">Filtrer</button><button type="button" onClick={onReset} className="rounded-lg bg-stone-800 px-4 py-2">Effacer</button></div>
  </form>;
}

export function TableShell({ headers, children }) {
  return <div className="overflow-x-auto rounded-sm border border-stone-700 bg-[#1b1b17]"><table className="w-full text-left text-sm"><thead className="bg-[#11110f]/70 text-stone-300"><tr>{headers.map((header) => <th key={header} className="whitespace-nowrap px-4 py-3">{header}</th>)}</tr></thead><tbody className="divide-y divide-gray-700">{children}</tbody></table></div>;
}

export const Cell = ({ children, className = "" }) => <td className={`whitespace-nowrap px-4 py-3 ${className}`}>{children ?? "—"}</td>;
export const Bool = ({ value }) => <span className={value ? "text-green-400" : "text-stone-500"}>{value ? "Oui" : "Non"}</span>;

const totalForSale=tx=>parseMoney(field(tx,"totalPriceIron","totalPrice","total_price","total"));
export const transactionSummary = (transactions=[]) => {
  const result={gains:0n,costs:0n,net:0n,buyAmount:0n,sellAmount:0n,transactions:transactions.length,buys:0,sells:0};
  let invalid=false;
  for(const tx of transactions){
    const ownerGain=tx.action==="SELL"?(totalForSale(tx)===null?null:-totalForSale(tx)):signedMoney(field(tx,"ownerDeltaIron","ownerGain","owner_gain"));
    const total=parseMoney(field(tx,"totalPriceIron","totalPrice","total_price","total"));
    result.buys+=tx.action==="BUY"?1:0;result.sells+=tx.action==="SELL"?1:0;
    if(ownerGain===null||total===null){invalid=true;continue;}
    result.gains+=ownerGain>0n?ownerGain:0n;result.costs+=ownerGain<0n?-ownerGain:0n;result.net+=ownerGain;
    if(tx.action==="BUY")result.buyAmount+=total;if(tx.action==="SELL")result.sellAmount+=total;
  }
  if(invalid)for(const key of ["gains","costs","net","buyAmount","sellAmount"])result[key]=null;
  return result;
};
export const withdrawalSummary = (withdrawals=[]) => {
  const result={total:0n,count:withdrawals.length,lastWithdrawalAt:null,lastWithdrawal:null};let invalid=false;
  for(const withdrawal of withdrawals){
    const amount=parseMoney(field(withdrawal,"amount","withdrawnAmount","withdrawn_amount"));
    if(amount===null)invalid=true;else result.total+=amount;
    const date=field(withdrawal,"withdrawnAt","withdrawn_at","createdAt","created_at");
    if(date&&(!result.lastWithdrawalAt||new Date(date)>new Date(result.lastWithdrawalAt))){result.lastWithdrawalAt=date;result.lastWithdrawal=withdrawal;}
  }
  if(invalid)result.total=null;return result;
};

export const counterBalanceSummary = (transactions = [], withdrawals = []) => {
  const txSummary = transactionSummary(transactions);
  const wdSummary = withdrawalSummary(withdrawals);
  return {
    ...txSummary,
    totalWithdrawn: wdSummary.total,
    withdrawals: wdSummary.count,
    lastWithdrawalAt: wdSummary.lastWithdrawalAt,
    lastWithdrawal: wdSummary.lastWithdrawal,
    estimatedBalance: txSummary.net===null||wdSummary.total===null?null:txSummary.net-wdSummary.total,
  };
};

export function TransactionSummary({ transactions = [] }) {
  const summary = transactionSummary(transactions);
  const cards = [
    ["Total des gains", <MoneyDisplay amount={summary.gains} />],
    ["Total des couts", <MoneyDisplay amount={summary.costs} />],
    ["Solde net", <span className={summary.net < 0 ? "text-red-300" : "text-green-300"}>{summary.net < 0 ? "−" : ""}<MoneyDisplay amount={absoluteMoney(summary.net)} /></span>],
    ["Transactions", summary.transactions],
    ["Achats", summary.buys],
    ["Ventes", summary.sells],
  ];
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{cards.map(([label, value]) => <div key={label} className="rounded-sm border border-stone-700 bg-[#1b1b17] p-4"><p className="text-xs uppercase tracking-wide text-stone-400">{label}</p><div className="mt-2 text-lg font-bold text-white">{value}</div></div>)}</div>;
}

export function CounterBalanceSummary({ transactions = [], withdrawals = [], labels = {} }) {
  const summary = counterBalanceSummary(transactions, withdrawals);
  const cards = [
    [labels.buyAmount || "Total des transactions BUY", <MoneyDisplay amount={summary.buyAmount} />],
    [labels.sellAmount || "Total des transactions SELL", <MoneyDisplay amount={summary.sellAmount} />],
    [labels.net || "Solde net theorique", <span className={summary.net < 0 ? "text-red-300" : "text-green-300"}>{summary.net < 0 ? "−" : ""}<MoneyDisplay amount={absoluteMoney(summary.net)} /></span>],
    [labels.withdrawn || "Total retire", <MoneyDisplay amount={summary.totalWithdrawn} />],
    [labels.estimatedBalance || "Solde net estime", <span className={summary.estimatedBalance < 0 ? "text-red-300" : "text-green-300"}>{summary.estimatedBalance < 0 ? "−" : ""}<MoneyDisplay amount={absoluteMoney(summary.estimatedBalance)} /></span>],
    [labels.lastWithdrawal || "Dernier retrait", summary.lastWithdrawalAt ? dateTime(summary.lastWithdrawalAt) : "—"],
  ];
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">{cards.map(([label, value]) => <div key={label} className="rounded-sm border border-stone-700 bg-[#1b1b17] p-4"><p className="text-xs uppercase tracking-wide text-stone-400">{label}</p><div className="mt-2 text-lg font-bold text-white">{value}</div></div>)}</div>;
}

export function MarketTransactionsTable({ transactions = [], compact = false }) {
  const headers = compact
    ? ["Date", "Joueur", "Action", "Item", "Quantite", "Total", "Gain / cout proprietaire"]
    : ["Date", "Joueur", "Comptoir", "Ville", "Action", "Item", "Quantite", "Prix unitaire", "Total", "Gain / cout proprietaire"];
  return <TableShell headers={headers}>{transactions.map((tx) => {
    const ownerGain = tx.action==="SELL"?(totalForSale(tx)===null?null:-totalForSale(tx)):signedMoney(field(tx,"ownerDeltaIron","ownerGain","owner_gain"));
    const actionLabel = tx.action === "BUY" ? "Achat joueur" : tx.action === "SELL" ? "Vente joueur" : tx.action;
    return <tr key={tx.id || `${field(tx, "createdAt", "created_at")}-${field(tx, "itemId", "item_id")}`}>
      <Cell>{dateTime(field(tx, "date", "createdAt", "created_at"))}</Cell><Cell>{field(tx, "playerName", "player_name", "player")}</Cell>
      {!compact && <Cell>{field(tx, "counterName", "counter_name", "counter")}</Cell>}{!compact && <Cell>{field(tx, "cityName", "city_name", "city")}</Cell>}
      <Cell><span className={tx.action === "BUY" ? "text-amber-200" : "text-amber-300"}>{actionLabel}</span></Cell>
      <Cell>{field(tx, "itemDisplayName", "item_display_name", "displayName", "itemName", "item_id", "itemId")}</Cell><Cell>{tx.quantity}</Cell>
      {!compact && <Cell><MoneyDisplay amount={field(tx, "unitPriceIron", "unitPrice", "unit_price")} /></Cell>}
      <Cell><MoneyDisplay amount={field(tx, "totalPriceIron", "totalPrice", "total_price", "total")} /></Cell>
      <Cell><span className={ownerGain < 0 ? "text-red-300" : "text-green-300"}>{ownerGain < 0 ? "Cout" : "Gain"} : </span><MoneyDisplay amount={absoluteMoney(ownerGain)} /></Cell>
    </tr>;
  })}</TableShell>;
}

export function MerchantCounterTable({ counters = [] }) {
  return <TableShell headers={["Nom", "Type", "Ville", "Proprietaire", "Coordonnees", "Achat", "Vente", "Actif", "Actions"]}>{counters.map((counter) => <tr key={counter.id}><Cell>{counter.name}</Cell><Cell><MarketTypeBadge type={counter.type} /></Cell><Cell>{field(counter, "cityName", "city_name", "city")}</Cell><Cell>{field(counter, "ownerName", "owner_name") || "Administration"}</Cell><Cell>{[counter.world, counter.x, counter.y, counter.z].filter((v) => v !== undefined).join(" / ")}</Cell><Cell><Bool value={field(counter, "buyModeEnabled", "buy_mode_enabled")} /></Cell><Cell><Bool value={field(counter, "sellModeEnabled", "sell_mode_enabled")} /></Cell><Cell><Bool value={counter.active} /></Cell><Cell><Link className="text-amber-300 hover:text-amber-200" to={`/admin/markets/counters/${counter.id}`}>Details</Link></Cell></tr>)}</TableShell>;
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
  const items=[["bread","Pain"],["iron","Fer"],["wood","Bois"],["stone","Pierre"]];
  return <div className="space-y-8">
    <p className="border-l-2 border-amber-300/50 pl-4 text-sm text-stone-400">Les prix sont indicatifs. Un tiret signifie que le tarif est inconnu ; le budget de rachat et la disponibilité se vérifient au comptoir.</p>
    {!!summary.length&&<section><h2 className="mb-3 text-xl font-bold text-white">Le cours des ressources</h2>
      <TableShell headers={["Ressource","Référence","Achat moyen","Revente moyenne"]}>{summary.map(item=><tr key={item.key}><Cell>{item.label}</Cell><PriceCell amount={item.referencePrice}/><PriceCell amount={item.averagePrice}/><PriceCell amount={item.averageSellPrice}/></tr>)}</TableShell>
    </section>}
    <section><h2 className="mb-3 text-xl font-bold text-white">Comparer les villes</h2>
      <TableShell headers={["Ville",...items.flatMap(([,label])=>[`${label} · achat`,`${label} · revente`])]}>{prices.map(row=><tr key={field(row,"cityId","city_id","cityName","city_name","city")}><Cell>{field(row,"cityName","city_name","city")}</Cell>{items.map(([key])=><PricePair key={key} buy={field(row,key,`${key}Price`,`${key}_price`)} sell={row[`${key}Sell`]}/>)}</tr>)}</TableShell>
    </section>
  </div>;
}
function PricePair({buy,sell}){return <><PriceCell amount={buy}/><PriceCell amount={sell}/></>;}
