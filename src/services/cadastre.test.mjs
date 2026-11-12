import test from "node:test";
import assert from "node:assert/strict";
import { SHALETON, blockToChunk, boundsFor, isKnown, rectangle, safeColor, plotAt, sameBounds } from "./cadastre.mjs";
test("Shaleton and negative block coordinates use Minecraft floor division", () => {
  assert.equal(blockToChunk(SHALETON.x), -45);assert.equal(blockToChunk(SHALETON.z), -82);
  assert.equal(blockToChunk(-1), -1);assert.equal(blockToChunk(-16), -1);assert.equal(blockToChunk(-17), -2);
});
test("viewport stays within world and API bounds at extreme zoom or narrow screens", () => {
  for (const aspect of [.3, .6, 1.5, 4]) for (const x of [-1875000, -45, 1875000]) {
    const box = boundsFor({ x, z: x, size: 96 }, aspect);
    assert.ok(box[2] - box[0] < 96 && box[3] - box[1] < 96);assert.ok(box.every(c => Math.abs(c) <= 1875000));
  }
});
test("known cells never infer visibility from an adjacent parcel", () => {
  const data = { known: [{ z: -82, spans: [[-45, -44]] }], plots: [{ id: "a", chunks: [{ x: -45, z: -82 }] }] };
  assert.ok(isKnown(data, -45, -82));assert.ok(!isKnown(data, -43, -82));assert.ok(!isKnown(data, -45, -83));
  assert.equal(plotAt(data, -45, -82).id, "a");assert.equal(plotAt(data, -44, -82), undefined);
});
test("rectangle selection is inclusive and capped before allocating", () => {
  assert.equal(rectangle({ x: -45, z: -82 }, { x: -44, z: -81 }).length, 4);
  assert.equal(rectangle({ x: 0, z: 0 }, { x: 15, z: 15 }).length, 256);
  assert.equal(rectangle({ x: 0, z: 0 }, { x: 16, z: 15 }), null);
});
test("untrusted colors cannot escape SVG values; loaded viewport identity is exact", () => {
  assert.equal(safeColor("url(https://example.org)"), "#b79c65");assert.equal(safeColor("AABBCC"), "#AABBCC");
  assert.ok(sameBounds([-45, -82, -40, -77], [-45, -82, -40, -77]));assert.ok(!sameBounds([-45, -82, -40, -77], [-44, -82, -40, -77]));
});
