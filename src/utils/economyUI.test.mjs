import test from 'node:test';
import assert from 'node:assert/strict';
import {averageMoney,receiptTitle,materialLabel,signedMoney,absoluteMoney} from './economyUI.js';
test('price averages preserve integer precision and unknown values',()=>{
  assert.equal(averageMoney(['9223372036854775807','9223372036854775805']),'9223372036854775806');
  assert.equal(averageMoney([undefined,null,NaN,9007199254740992]),undefined);
  assert.equal(averageMoney(['1','2']),'2');
});
test('pockets and material delivery have distinct labels',()=>{
  assert.equal(receiptTitle({type:'COMMERCE',action:'CLAIM'}),'Caisse vers banque');
  assert.equal(receiptTitle({type:'QUEST_REWARD'}),'Récompense de quête');
  assert.match(materialLabel('PENDING'),/conservés/);
});
test('legacy negative flows remain exact and invalid values stay unknown',()=>{
  assert.equal(signedMoney('-9223372036854775807'),-9223372036854775807n);
  assert.equal(absoluteMoney(signedMoney('-64')),64n);
  assert.equal(signedMoney(9007199254740992),null);
  assert.equal(signedMoney(undefined),null);
});
