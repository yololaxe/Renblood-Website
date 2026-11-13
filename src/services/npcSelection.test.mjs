import test from 'node:test';
import assert from 'node:assert/strict';
import { npcOptions, selectedNpcOption } from './npcSelection.mjs';
test('one Carl Sand option keeps the quest giver and resolves historical selection', () => {
  const raw = [{npc_id:'npc_carl_sand',name:'Carl Sand',type:'DECO',character_id:'P0023',region:'Shaleton'}, {npc_id:'npc_1780815907379',name:'Carl Sand',type:'QUEST',character_id:'P0023',region:'Shaleton'}];
  const before = structuredClone(raw), result = npcOptions(raw);
  assert.equal(result.length,1);assert.equal(result[0].npc_id,'npc_1780815907379');
  assert.equal(selectedNpcOption(result,'npc_carl_sand').name,'Carl Sand');assert.deepEqual(raw,before);
});
test('identical names without an explicit shared identity are never merged', () => {
  assert.equal(npcOptions([{npc_id:'a',name:'Herbert'}, {npc_id:'b',name:'Herbert'}]).length,2);
});
test('different characters and archived profiles stay distinct', () => {
  assert.equal(npcOptions([{npc_id:'a',character_id:'P1'}, {npc_id:'b',character_id:'P2'}, {npc_id:'old',character_id:'P1',archived:true}]).length,2);
});
