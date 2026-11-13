import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createTerrainProjection } from "./landTerrain.mjs";
const map = JSON.parse(readFileSync(new URL("../data/cadastre-terrain.json", import.meta.url)));
const projection = createTerrainProjection(map);
test("original Shaleton pixel is exactly the supplied Minecraft point", () => {
  assert.deepEqual(projection.pixelToWorld(2868, 3691), { x: -716, z: -1300 });
  assert.deepEqual(projection.worldToPixel(-716, -1300), { x: 2868, y: 3691 });
  assert.equal(projection.originX, -3584);assert.equal(projection.originZ, -4991);
});
test("one pixel advances one block and chunks retain their true negative boundaries", () => {
  assert.deepEqual(projection.pixelToWorld(2869, 3692), { x: -715, z: -1299 });
  const corner = projection.worldToPixel(-45 * 16, -82 * 16);
  assert.deepEqual(corner, { x: 2864, y: 3679 });
  assert.deepEqual(projection.pixelToWorld(corner.x + 16, corner.y + 16), { x: -704, z: -1296 });
});
test("only intersecting tiles are requested, including exact seams and exterior views", () => {
  const tiles = projection.visibleTiles([-45, -82, -45, -82]);
  assert.equal(tiles.length, 1);assert.equal(tiles[0].key, "5_7");
  assert.equal(projection.visibleTiles([10000, 10000, 10005, 10005]).length, 0);
  assert.equal(projection.visibleTiles([-10000, -10000, -9990, -9990]).length, 0);
  assert.equal(projection.visibleTiles([1, 1, 0, 0]).length, 0);
  const exact = createTerrainProjection({ ...map, anchor: { worldX: 0, worldZ: 0, pixelX: 0, pixelY: 0 } });
  assert.deepEqual(exact.visibleTiles([0, 0, 31, 31]).map(t => t.key), ["0_0"]);
  assert.deepEqual(exact.visibleTiles([31, 31, 32, 32]).map(t => t.key), ["0_0", "1_0", "0_1", "1_1"]);
});
test("largest website view is bounded to sixteen native-resolution tiles", () => {
  for (const x of [-223, -45, 0, 200]) for (const z of [-311, -82, 0, 200]) assert.ok(projection.visibleTiles([x, z, x + 95, z + 95]).length <= 16);
});
test("tiles entirely under fog are not fetched", () => {
  const bounds = [-65, -95, -26, -69];
  assert.equal(projection.knownTiles(bounds, []).length, 0);
  const knowledge = Array.from({ length: 17 }, (_, i) => ({ z: -90 + i, spans: [[-53, -37]] }));
  assert.deepEqual(projection.knownTiles(bounds, knowledge).map(t => t.key), ["5_6", "5_7"]);
});
