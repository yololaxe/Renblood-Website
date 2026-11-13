import { memo, useMemo } from "react";
import calibration from "../data/cadastre-terrain.json";
import { createTerrainProjection } from "../services/landTerrain.mjs";
const projection = createTerrainProjection(calibration);

export default memo(function LandTerrain({ bounds, clipId, enabled, dimension, known }) {
  const [x1, z1, x2, z2] = bounds;
  const tiles = useMemo(() => projection.knownTiles([x1, z1, x2, z2], known), [x1, z1, x2, z2, known]);
  if (!enabled || !known?.length || dimension !== calibration.dimension) return null;
  return <g className="cadastre-terrain" clipPath={`url(#${clipId})`}>
    {tiles.map(tile => <image key={tile.key} href={tile.href} x={tile.x} y={tile.z} width={tile.size} height={tile.size} preserveAspectRatio="none" decoding="async" />)}
  </g>;
});
