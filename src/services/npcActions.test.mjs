import test from 'node:test';
import assert from 'node:assert/strict';
import {deletionTarget,npcError} from './npcActions.mjs';
test('deletion targets the explicit row, independent of an older selection',()=>{
  const previous={npc_id:'a',name:'Premier'},clicked={npc_id:'b',name:'Second',quest_links:[{}]};
  assert.equal(deletionTarget(clicked).id,'b');assert.equal(previous.npc_id,'a');assert.equal(deletionTarget(clicked).linkedQuests,1);
});
test('an empty or event-shaped target never becomes a DELETE request',()=>{
  for(const value of [null,{}, {npc_id:' '},{target:{}}])assert.throws(()=>deletionTarget(value));
});
test('server rejection and network failure remain distinguishable',()=>{
  assert.equal(npcError({response:{data:{error:'PNJ lié à une quête'}}},'Erreur'),'PNJ lié à une quête');
  assert.equal(npcError(new Error('Network Error'),'Erreur'),'Network Error');
});
