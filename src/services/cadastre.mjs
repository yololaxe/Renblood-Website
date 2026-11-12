export const SHALETON = Object.freeze({ x: -716, z: -1300, chunkX: -45, chunkZ: -82 });
export const OWNER_TYPES = { PLAYER: "Joueur", FAMILY: "Famille", CITY: "Ville", GUILD: "Guilde", RELIGIOUS: "Institution religieuse", KINGDOM: "Royaume", PUBLIC: "Domaine public", SERVER: "Administration", UNKNOWN: "Non renseigné" };
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const blockToChunk = value => Math.floor(Number(value) / 16);
export const safeColor = color => /^#?[\da-f]{6}$/i.test(color || "") ? `#${color.replace("#", "")}` : "#b79c65";
export function boundsFor(view, aspect = 1.5) {
  const width = clamp(Math.round(view.size), 8, 96), height = clamp(Math.round(width / clamp(aspect, .5, 3)), 8, 96);
  const x = clamp(Math.floor(view.x) - Math.floor(width / 2), -1875000, 1875001 - width);
  const z = clamp(Math.floor(view.z) - Math.floor(height / 2), -1875000, 1875001 - height);
  return [x, z, x + width - 1, z + height - 1];
}
export const sameBounds = (a, b) => a?.length === 4 && b?.length === 4 && a.every((value, index) => value === b[index]);
export const isKnown = (data, x, z) => !!data?.known?.some(row => row.z === z && row.spans.some(([a, b]) => a <= x && x <= b));
export function rectangle(a, b) {
  if (!a || !b) return [];
  const minX = Math.min(a.x, b.x), maxX = Math.max(a.x, b.x), minZ = Math.min(a.z, b.z), maxZ = Math.max(a.z, b.z);
  if ((maxX - minX + 1) * (maxZ - minZ + 1) > 256) return null;
  const result = [];
  for (let z = minZ; z <= maxZ; z++) for (let x = minX; x <= maxX; x++) result.push({ x, z });
  return result;
}
export const cellPath = cells => cells.map(({ x, z }) => `M${x},${z}h1v1h-1Z`).join("");
export const knownPath = rows => (rows || []).flatMap(row => row.spans.map(([a, b]) => `M${a},${row.z}h${b - a + 1}v1h-${b - a + 1}Z`)).join("");
export const plotAt = (data, x, z) => data?.plots?.find(plot => plot.chunks.some(chunk => chunk.x === x && chunk.z === z));
