export const IRON_PER_BRONZE = 64;
export const IRON_PER_SILVER = 4096;
export const IRON_PER_GOLD = 262144;
export const MAX_MONEY = 9223372036854775807n;

export function parseMoney(value) {
  if (typeof value === "bigint") return value >= 0n && value <= MAX_MONEY ? value : null;
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value) || value < 0) return null;
    value = String(value);
  }
  if (typeof value !== "string" || !/^(0|[1-9][0-9]{0,18})$/.test(value)) return null;
  const amount = BigInt(value);
  return amount <= MAX_MONEY ? amount : null;
}
export function moneyParts(value) {
  const amount = parseMoney(value);
  if (amount === null) return null;
  return {gold:amount/262144n,silver:amount%262144n/4096n,bronze:amount%4096n/64n,iron:amount%64n};
}
export function formatMoney(value) {
  const parts = moneyParts(value);
  if (!parts) return "Montant indisponible";
  return [[parts.gold,"or"],[parts.silver,"argent"],[parts.bronze,"bronze"],[parts.iron,"fer"]].filter(([n])=>n>0n).map(([n,label])=>`${n} ${label}`).join(" ") || "0 fer";
}
export function compactMoney(value) {
  const parts = moneyParts(value);
  if (!parts) return "—";
  return [[parts.gold,"O"],[parts.silver,"A"],[parts.bronze,"B"],[parts.iron,"F"]].filter(([n])=>n>0n).map(([n,label])=>`${n}${label}`).join(" ") || "0F";
}
