import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CounterBalanceSummary, MarketPage, MarketState, MarketTransactionsTable, MarketTypeBadge, MarketWithdrawalsTable, PublicMarketPriceTable, Cell, TableShell, Bool, field, toList } from "../../components/market/MarketComponents";
import { MoneyDisplay } from "../../components/MoneyDisplay";
import { averageMoney } from "../../utils/economyUI";
import { useUser } from "../../context/UserContext";
import * as api from "../../services/marketApi";
import { useMarketList } from "./marketPageUtils";

const MAIN_PUBLIC_ITEMS = [
  { key: "bread", label: "Pain", aliases: ["bread", "pain"] },
  { key: "iron", label: "Fer", aliases: ["iron", "fer"] },
  { key: "wood", label: "Bois", aliases: ["wood", "bois", "log", "plank"] },
  { key: "stone", label: "Pierre", aliases: ["stone", "pierre", "cobble"] },
];

const normalizeText = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase();

const priceValue = (item) => field(
  item,
  "buyPriceIron",
  "buy_price_iron",
  "buyPrice",
  "buy_price",
  "calculatedPrice",
  "calculated_price",
  "publicPrice",
  "public_price",
  "price",
  "playerBuyPrice",
  "player_buy_price",
  "referencePrice",
  "reference_price",
);

const referenceValue = (item) => field(item, "referencePrice", "reference_price");

const itemTimestamp = (item) => {
  const rawDate = field(item, "calculatedAt", "calculated_at", "updatedAt", "updated_at", "createdAt", "created_at");
  const dateValue = rawDate ? new Date(rawDate).getTime() : 0;
  if (Number.isFinite(dateValue) && dateValue > 0) return dateValue;
  return Number(field(item, "calculationVersion", "calculation_version", "version") || 0);
};

const itemKey = (item) => {
  const haystack = normalizeText([
    field(item, "itemId", "item_id"),
    field(item, "displayName", "display_name", "itemName", "item_name"),
    field(item, "category"),
  ].filter(Boolean).join(" "));
  return MAIN_PUBLIC_ITEMS.find((candidate) => candidate.aliases.some((alias) => haystack.includes(alias)))?.key;
};

const marketPriority = (item) => {
  const type = field(item, "marketType", "market_type", "type");
  if (type === "CITY_MARKET") return 0;
  if (type === "SHOP") return 1;
  return 2;
};

const normalizeCalculatedPricesForPublic = (prices) => {
  const rowsByCity = new Map();

  toList(prices).forEach((price) => {
    const key = itemKey(price);
    if (!key) return;

    const city = field(price, "cityName", "city_name", "city") || "Royaume";
    const cityId = field(price, "cityId", "city_id") || city;
    const rowKey = String(cityId);
    const currentRow = rowsByCity.get(rowKey) || { cityId, cityName: city, _meta: {} };
    const candidateMeta = {
      priority: marketPriority(price),
      timestamp: itemTimestamp(price),
    };
    const currentMeta = currentRow._meta[key];

    if (
      !currentMeta ||
      candidateMeta.timestamp > currentMeta.timestamp ||
      (candidateMeta.timestamp === currentMeta.timestamp && candidateMeta.priority < currentMeta.priority)
    ) {
      currentRow[key] = priceValue(price);
      currentRow[`${key}Sell`] = field(price,"sellPriceIron","sell_price_iron","sellPrice","sell_price");
      currentRow._meta[key] = candidateMeta;
    }

    rowsByCity.set(rowKey, currentRow);
  });

  return Array.from(rowsByCity.values())
    .map(({ _meta, ...row }) => row)
    .sort((a, b) => String(a.cityName || "").localeCompare(String(b.cityName || ""), "fr"));
};

const normalizeReferencesForPublic = (items) => Object.fromEntries(
  MAIN_PUBLIC_ITEMS.map((candidate) => {
    const referenceItem = toList(items).find((item) => itemKey(item) === candidate.key);
    return [candidate.key, referenceValue(referenceItem)];
  })
);

const average = averageMoney;

const buildPublicMarketPayload = async () => {
  let rawPrices = [];
  try {
    const payload=await api.getPublicMarketPrices();
    rawPrices=Array.isArray(payload?.cities)?payload.cities.flatMap(city=>(city.prices||[]).map(price=>({...price,cityId:city.cityId,cityName:city.cityName}))):toList(payload);
  } catch (err) {
    if (![404, 204].includes(err?.response?.status)) {
      console.warn("Prix publics indisponibles, fallback sur les prix calculés.", err);
    }
  }

  if (!rawPrices.length) {
    rawPrices = toList(await api.getCalculatedPrices({ type: "CITY_MARKET" }));
  }

  const alreadyGrouped = rawPrices.some((row) =>
    MAIN_PUBLIC_ITEMS.some((item) => field(row, item.key, `${item.key}Price`, `${item.key}_price`) !== undefined)
  );
  const prices = alreadyGrouped ? rawPrices : normalizeCalculatedPricesForPublic(rawPrices);

  let references = {};
  try {
    references = normalizeReferencesForPublic(await api.getReferenceItems());
  } catch {
    references = {};
  }

  const summary = MAIN_PUBLIC_ITEMS.map((item) => ({
    ...item,
    referencePrice: references[item.key],
    averagePrice: average(prices.map((row) => field(row, item.key, `${item.key}Price`, `${item.key}_price`))),
    averageSellPrice: average(prices.map(row=>row[`${item.key}Sell`])),
  }));

  return { prices, summary };
};

export function PublicMarketPricesPage() {
  const [data, setData] = useState({ prices: [], summary: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const payload = await buildPublicMarketPayload();
        if (!cancelled) setData(payload);
      } catch (err) {
        if (!cancelled) {
          setData({ prices: [], summary: [] });
          setError(err?.response?.data?.detail || "Les prix publics des marchés ne sont pas encore disponibles.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  return <MarketPage title="Prix des marchés" description="Achat : ce que vous payez. Revente : ce que le marchand vous verse. Le prix et le stock sont confirmés au comptoir lors de votre échange."><MarketState loading={loading} error={error} empty={!data.prices.length}><PublicMarketPriceTable prices={data.prices} summary={data.summary} /></MarketState></MarketPage>;
}

export function PlayerOwnedCountersPage() {
  const { userId } = useUser();
  const loader = useCallback(() => api.getOwnedCounters(userId), [userId]);
  const list = useMarketList(loader);
  return <MarketPage title="Mes comptoirs marchands" description="Les montants de cette liste sont des estimations historiques. Retrouvez le disponible confirmé et les reçus de vos caisses dans Mes finances." actions={<Link className="realm-action" to="/finances">Mes finances</Link>}><MarketState loading={list.loading} error={list.error} empty={!list.data.length}><TableShell headers={["Nom", "Type", "Ville", "Actif", "Gains totaux", "Retraits", "Solde net estime", "Actions"]}>{list.data.map((counter) => <tr key={counter.id}><Cell>{counter.name}</Cell><Cell><MarketTypeBadge type={counter.type} /></Cell><Cell>{field(counter, "cityName", "city_name", "city")}</Cell><Cell><Bool value={counter.active} /></Cell><Cell><MoneyDisplay amount={field(counter, "estimatedEarnings", "estimated_earnings", "totalGains", "total_gains")} /></Cell><Cell><MoneyDisplay amount={field(counter, "totalWithdrawn", "total_withdrawn")} /></Cell><Cell><MoneyDisplay amount={field(counter, "estimatedBalance", "estimated_balance")} /></Cell><Cell><Link className="text-amber-300" to={`/account/merchant-counters/${field(counter, "counterId", "counter_id", "id")}`}>Historique</Link></Cell></tr>)}</TableShell></MarketState></MarketPage>;
}

export function PlayerCounterHistoryPage() {
  const { id } = useParams();
  const { userId } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const owned = toList(await api.getOwnedCounters(userId));
        const counter = owned.find((item) => String(field(item, "counterId", "counter_id", "id")) === String(id));
        if (!counter) {
          throw new Error("Acces refuse.");
        }
        const counterId = field(counter, "counterId", "counter_id", "id");
        const [transactionData, withdrawalData] = await Promise.all([
          api.getOwnedCounterTransactions(counterId),
          api.getOwnedCounterWithdrawals(counterId).catch((err) => {
            if (err?.response?.status === 404) return [];
            throw err;
          }),
        ]);
        if (cancelled) return;
        setTransactions(toList(transactionData));
        setWithdrawals(toList(withdrawalData));
      } catch (err) {
        if (cancelled) return;
        setTransactions([]);
        setWithdrawals([]);
        setError(err.message === "Acces refuse." ? "Acces refuse." : err.response?.data?.detail || "Impossible de charger l'historique du comptoir.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [id, userId]);

  return <MarketPage title="Historique du comptoir" description="Les règlements confirmés conservent le prix accepté au moment de l’échange. Les estimations de cette page ne permettent aucun retrait." actions={<Link className="realm-action" to="/finances">Caisse confirmée</Link>}><MarketState loading={loading} error={error} empty={!transactions.length && !withdrawals.length} emptyMessage="Aucune transaction enregistree."><CounterBalanceSummary transactions={transactions} withdrawals={withdrawals} labels={{ net: "Gains totaux", withdrawn: "Retraits", estimatedBalance: "Solde net estime" }} />
    <h2 className="mb-3 text-xl font-bold">Historique des retraits</h2><MarketState empty={!withdrawals.length} emptyMessage="Aucun retrait enregistre."><MarketWithdrawalsTable withdrawals={withdrawals} compact /></MarketState>
    <h2 className="mb-3 mt-8 text-xl font-bold">Historique des transactions</h2><MarketState empty={!transactions.length} emptyMessage="Aucune transaction enregistree."><MarketTransactionsTable transactions={transactions} compact /></MarketState></MarketState></MarketPage>;
}
