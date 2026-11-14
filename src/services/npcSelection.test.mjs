import test from 'node:test';
import assert from 'node:assert/strict';
import { npcOptions, npcDirectory, selectedNpcOption } from './npcSelection.mjs';
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

test('directory shows one character and combines encounters and quest roles without mutating profiles', () => {
  const raw = [
    {npc_id:'deco', character_id:'P0023', name:'Carl Sand', type:'DECO', met_by:['alice'], quest_links:[{quest_id:'q1',role:'OBJECTIVE'}]},
    {npc_id:'quest', character_id:'P0023', name:'Carl Sand', type:'QUEST', met_by:['bob'], quest_links:[{questId:'q1',roles:['START']},{questId:'q2',roles:['COMPLETION']}]},
  ];
  const before=structuredClone(raw), cards=npcDirectory(raw);
  assert.equal(cards.length,1);assert.equal(cards[0].npc_id,'quest');
  assert.deepEqual(new Set(cards[0].profile_types),new Set(['QUEST','DECO']));
  assert.deepEqual(new Set(cards[0].met_by),new Set(['alice','bob']));
  assert.equal(cards[0].quest_links.length,2);
  assert.deepEqual(new Set(cards[0].quest_links[0].roles),new Set(['START','OBJECTIVE']));
  assert.equal(selectedNpcOption(cards,'deco'),cards[0]);assert.deepEqual(raw,before);
});

test('directory never groups namesakes without an explicit shared character', () => {
  const cards=npcDirectory([{npc_id:'a',name:'Carl Sand'},{npc_id:'b',name:'Carl Sand'},
    {npc_id:'c',name:'Carl Sand',character_id:'different'}]);
  assert.equal(cards.length,3);
});

test('archived technical profiles remain manageable only in the admin directory', () => {
  const raw=[{npc_id:'old',type:'QUEST',character_id:'P1',archived:true,met_by:['staff'],quest_links:[{questId:'secret'}]},
    {npc_id:'active',type:'DECO',character_id:'P1',met_by:['player'],quest_links:[]}];
  const publicCard=npcDirectory(raw)[0],adminCard=npcDirectory(raw,{includeArchived:true})[0];
  assert.equal(publicCard.npc_id,'active');assert.deepEqual(publicCard.profile_ids,['active']);
  assert.deepEqual(publicCard.met_by,['player']);assert.deepEqual(publicCard.quest_links,[]);
  assert.equal(adminCard.npc_id,'active');assert.equal(adminCard.profile_ids.length,2);
});
