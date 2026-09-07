export const IRON_PER_BRONZE = 64;
export const IRON_PER_SILVER = 64 * IRON_PER_BRONZE;
export const IRON_PER_GOLD = 64 * IRON_PER_SILVER;

export function formatMoney(amountInIron) {
  const amount = Math.max(0, Math.floor(Number(amountInIron) || 0));
  const gold = Math.floor(amount / IRON_PER_GOLD);
  const silver = Math.floor((amount % IRON_PER_GOLD) / IRON_PER_SILVER);
  const bronze = Math.floor((amount % IRON_PER_SILVER) / IRON_PER_BRONZE);
  const iron = amount % IRON_PER_BRONZE;
  const parts = [];

  if (gold) parts.push(`${gold} or`);
  if (silver) parts.push(`${silver} argent`);
  if (bronze) parts.push(`${bronze} bronze`);
  if (iron) parts.push(`${iron} fer`);

  return parts.length ? parts.join(" ") : "0 fer";
}
