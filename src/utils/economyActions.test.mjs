import test from 'node:test';import assert from 'node:assert/strict';
import {actionPreview,rateBasisPoints} from './economyActions.js';
const business={business_id:'market:test',active:true,revision:3,rule_version:'v1',tax_bps:0};
test('percentage input uses exact basis points',()=>{assert.equal(rateBasisPoints('2,35'),235);assert.equal(rateBasisPoints('100'),10000);for(const value of ['-1','1.001','100.01','NaN','1e2'])assert.equal(rateBasisPoints(value),null);});
test('funding preview uses integer strings and shows actual before and after',()=>{
 const row=actionPreview('fund',{business,funding_account:{available:'9223372036854775807'},account:{available:'0'}},{amount:'9007199254740993',reason:'Pilote'});
 assert.equal(row.body.amount,'9007199254740993');assert.ok(row.changes.some(([label])=>label==='Votre banque · après'));
 assert.throws(()=>actionPreview('fund',{business,funding_account:{available:'1'},account:{available:'0'}},{amount:'2',reason:'Budget'}));
});
test('physical correction needs an explicit decision and current revision',()=>{
 const receipt={state:'RECONCILIATION_REQUIRED',operation_id:'receipt',revision:4};
 const result=actionPreview('resolve',{receipt},{reason:'Sauvegarde contrôlée',decision:'cancel'});assert.equal(result.body.revision,4);assert.equal(result.physical,true);
 assert.throws(()=>actionPreview('resolve',{receipt},{reason:'Contrôle',decision:''}));
});
test('compensation refuses overdrafts and preserves int64',()=>{
 const receipt={state:'CONFIRMED',type:'CREDIT',amount:'64',operation_id:'id',owner_account:{available:'63',reserved:'0',incoming:'0'}};
 assert.throws(()=>actionPreview('compensations',{receipt},{reason:'Correction'}));
 receipt.owner_account.available='64';assert.equal(actionPreview('compensations',{receipt},{reason:'Correction'}).path,'admin/operations/id/compensations');
});
test('stock preview preserves the accepted available quantity',()=>{
 const row=actionPreview('stock',{business,offer:{offer_id:'sword',stock:4,reserved_stock:2}},{stock:'0',reason:'Retrait contrôlé'});
 assert.equal(row.body.expected_stock,4);assert.equal(row.body.stock,0);assert.throws(()=>actionPreview('stock',{business,offer:{stock:null}},{stock:'1',reason:'Test'}));
});
test('schedules are drafts with an explicit future time and no immediate policy mutation',()=>{
 const row=actionPreview('schedule',{business},{version:'v2',tax:'0',date:new Date(Date.now()+86400000).toISOString(),reason:'Pilote'});
 assert.match(row.path,/\/schedule$/);assert.equal(row.body.expected_rule_version,'v1');assert.equal(row.body.tax_bps,0);
});

test('stock preview counts incoming and reserved units within real player-slot capacity',()=>{
 const subject={business:{...business,business_id:'market:counter'},offer:{offer_id:'slot:0:item',stock:2,reserved_stock:4,incoming_stock:4,stock_capacity:16}};
 const plan=actionPreview('stock',subject,{stock:'8',reason:'Réapprovisionnement'});
 assert.equal(plan.body.expected_stock,2);assert.equal(plan.body.stock,8);
 assert.deepEqual(plan.changes.find(([label])=>label==='Capacité totale de la case'),['Capacité totale de la case','16']);
 assert.deepEqual(plan.changes.find(([label])=>label==='Dépôts en cours'),['Dépôts en cours','4 conservés']);
 assert.throws(()=>actionPreview('stock',subject,{stock:'9',reason:'Trop plein'}),/16 objet/);
 subject.offer={offer_id:'slot:0:sword',stock:0,reserved_stock:1,incoming_stock:0,stock_capacity:1};
 assert.throws(()=>actionPreview('stock',subject,{stock:'1',reason:'Équipement réservé'}),/1 objet/);
 assert.equal(actionPreview('stock',subject,{stock:'0',reason:'Conserver le reçu'}).body.stock,0);
});

test('stock preview keeps legacy slot limits and official capacity, rejecting invalid snapshots',()=>{
 const subject={business:{...business,business_id:'market:counter'},offer:{offer_id:'slot:0:item',stock:0,reserved_stock:0,incoming_stock:0}};
 assert.equal(actionPreview('stock',subject,{stock:'64',reason:'Ancienne offre'}).body.stock,64);
 assert.throws(()=>actionPreview('stock',subject,{stock:'65',reason:'Trop plein'}),/64 objet/);
 for(const capacity of [0,65,'16',NaN]){
  subject.offer.stock_capacity=capacity;
  assert.throws(()=>actionPreview('stock',subject,{stock:'1',reason:'Vue invalide'}),/Rechargez/);
 }
 subject.offer={offer_id:'minecraft:stone',stock:5,reserved_stock:0,incoming_stock:0};
 assert.equal(actionPreview('stock',subject,{stock:'200',reason:'Boutique officielle'}).body.stock,200);
 subject.offer.incoming_stock=1;
 assert.throws(()=>actionPreview('stock',subject,{stock:'2147483647',reason:'Limite officielle'}),/capacité de stock/);
});
