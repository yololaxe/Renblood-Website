import axiosInstance from "./axiosInstance";

const get = async (url, params) => (await axiosInstance.get(url, { params })).data;
const post = async (url, payload) => (await axiosInstance.post(url, payload)).data;
const patch = async (url, payload) => (await axiosInstance.patch(url, payload)).data;
const remove = async (url) => (await axiosInstance.delete(url)).data;

const FILTER_NAMES = {
  city: "city_id",
  type: "market_type",
  item: "item_id",
  owner: "owner_id",
  counter: "counter_id",
  player: "player_uuid",
};

const apiFilters = (filters = {}) =>
  Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== "" && value !== null && value !== undefined)
      .map(([key, value]) => [FILTER_NAMES[key] || key, value])
  );

const referenceItemPayload = (payload) => ({
  item_id: payload.itemId,
  display_name: payload.displayName,
  category: payload.category,
  reference_price: payload.referencePrice,
  reference_xp: payload.referenceXp,
  min_price: payload.minPrice,
  max_price: payload.maxPrice,
  enabled: payload.enabled,
});

export const getMarketDashboard = () => get("/api/markets/dashboard");
export const recalculateMarketPrices = () => post("/api/markets/recalculate");

export const getReferenceItems = () => get("/api/markets/reference-items");
export const createReferenceItem = (payload) => post("/api/markets/reference-items", referenceItemPayload(payload));
export const updateReferenceItem = (id, payload) => patch(`/api/markets/reference-items/${id}`, referenceItemPayload(payload));
export const disableReferenceItem = (id) => remove(`/api/markets/reference-items/${id}`);

export const getCities = () => get("/api/markets/cities");
export const getCityModifiers = (filters) => get("/api/markets/city-modifiers", { ...apiFilters(filters), all: true });
export const updateCityModifier = (id, payload) => patch(`/api/markets/city-modifiers/${id}`, payload);

export const getCalculatedPrices = (filters) => get("/api/markets/calculated-prices", { ...apiFilters(filters), all: true });
export const getMerchantCounters = (filters) => get("/api/markets/counters", apiFilters(filters));
export const getMerchantCounterDetails = (id) => get(`/api/markets/counters/${id}`);
export const updateMerchantCounter = (id, payload) => patch(`/api/markets/counters/${id}`, payload);
export const getMarketCounterModeration = (filters) => get("/api/markets/counters/moderation/", apiFilters(filters));
export const disableMerchantCounter = (id, payload) => post(`/api/markets/counters/${id}/disable/`, payload);
export const enableMerchantCounter = (id) => post(`/api/markets/counters/${id}/enable/`);
export const flagMerchantCounter = (id, payload) => post(`/api/markets/counters/${id}/flag/`, payload);
export const getMerchantCounterAudit = (id) => get(`/api/markets/counters/${id}/audit/`);

export const getMarketTransactions = (filters) => get("/api/markets/transactions", apiFilters(filters));
export const getMerchantCounterTransactions = (counterId) =>
  get("/api/markets/transactions", { counter_id: counterId });
export const getMarketWithdrawals = (filters) => get("/api/markets/withdrawals", apiFilters(filters));
export const getMerchantCounterWithdrawals = (counterId) =>
  get(`/api/markets/counters/${counterId}/withdrawals`);
export const getCalculationRuns = () => get("/api/markets/calculation-runs");

export const getPublicMarketPrices = () => get("/api/public/market-prices");

export const getOwnedCounters = (playerUuid) => get(`/minecraft/markets/player/${playerUuid}/owned-counters/`);
export const getOwnedCounterTransactions = (counterId) => get(`/minecraft/markets/counters/${counterId}/transactions/`);
export const getOwnedCounterWithdrawals = (counterId) => get(`/minecraft/markets/counters/${counterId}/withdrawals/`);
export const getCounterTransactions = getOwnedCounterTransactions;
