export function createTerrainProjection(map) {
  const { width, height, tileSize, blocksPerPixel, anchor } = map;
  if (![width, height, tileSize].every(n => Number.isInteger(n) && n > 0) || !Number.isFinite(blocksPerPixel) || blocksPerPixel <= 0 || !anchor) throw new Error("Calage de carte invalide");
  const originX = anchor.worldX - anchor.pixelX * blocksPerPixel;
  const originZ = anchor.worldZ - anchor.pixelY * blocksPerPixel;
  const tileBlocks = tileSize * blocksPerPixel, columns = Math.ceil(width / tileSize), rows = Math.ceil(height / tileSize);
  const pixelToWorld = (x, y) => ({ x: originX + x * blocksPerPixel, z: originZ + y * blocksPerPixel });
  const worldToPixel = (x, z) => ({ x: (x - originX) / blocksPerPixel, y: (z - originZ) / blocksPerPixel });
  function visibleTiles(bounds) {
    if (!Array.isArray(bounds) || bounds.length !== 4 || !bounds.every(Number.isFinite) || bounds[2] < bounds[0] || bounds[3] < bounds[1]) return [];
    const [minX, minZ, maxX, maxZ] = [bounds[0] * 16, bounds[1] * 16, (bounds[2] + 1) * 16, (bounds[3] + 1) * 16];
    if (maxX <= originX || maxZ <= originZ || minX >= originX + width * blocksPerPixel || minZ >= originZ + height * blocksPerPixel) return [];
    const startX = Math.max(0, Math.floor((minX - originX) / tileBlocks)), startY = Math.max(0, Math.floor((minZ - originZ) / tileBlocks));
    const endX = Math.min(columns - 1, Math.ceil((maxX - originX) / tileBlocks) - 1), endY = Math.min(rows - 1, Math.ceil((maxZ - originZ) / tileBlocks) - 1);
    const result = [];
    for (let y = startY; y <= endY; y++) for (let x = startX; x <= endX; x++) result.push({ key: `${x}_${y}`, href: `${map.webBase}/${x}_${y}.webp`, x: (originX + x * tileBlocks) / 16, z: (originZ + y * tileBlocks) / 16, size: tileBlocks / 16 });
    return result;
  }
  function knownTiles(bounds, known) {
    return visibleTiles(bounds).filter(tile => (known || []).some(row => row.z < tile.z + tile.size && row.z + 1 > tile.z && row.spans.some(([a, b]) => a < tile.x + tile.size && b + 1 > tile.x)));
  }
  return Object.freeze({ originX, originZ, pixelToWorld, worldToPixel, visibleTiles, knownTiles });
}
