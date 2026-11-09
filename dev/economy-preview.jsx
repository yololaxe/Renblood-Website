import React,{useState} from 'react';import{createRoot}from'react-dom/client';import{BrowserRouter}from'react-router-dom';import{MotionConfig}from'framer-motion';
import Finance from '../src/pages/Finance';import EconomyDesk from '../src/pages/admin/EconomyDesk';import '../src/index.css';
if(!import.meta.env.DEV)throw new Error('Preview available only in development');
const date=new Date().toISOString(),owner='personnage-de-recette';
const bank={account_id:'bank:'+owner,pocket:'BANK',available:'327680',reserved:'4096',incoming:'64',updated_at:date};
const business={business_id:'inn:recette',label:'L’Auberge des Trois Couronnes',owner_id:owner,kind:'INN',active:true,revision:0,rule_version:'commerce-v1',tax_bps:0};
const account={account_id:'cashbox:inn:recette',business_id:business.business_id,available:'65536',reserved:'128',incoming:'4096',label:business.label};
const rows=[
 {operation_id:'11111111-1111-4111-8111-111111111111',type:'WITHDRAW',state:'RECONCILIATION_REQUIRED',amount:'4096',revision:1,owner_id:owner,actor_id:'minecraft:recette',rule_version:'bank-v1',created_at:date,updated_at:date,reason:'Retrait interrompu au banquier'},
 {operation_id:'22222222-2222-4222-8222-222222222222',type:'COMMERCE',action:'BUY',state:'CONFIRMED',amount:'128',tax:'0',revision:1,payment:'CASH',business_label:business.label,business_id:business.business_id,rule_version:'commerce-v1',created_at:date,updated_at:date,reason:'Achat au comptoir',price_version:'pilote-circos-01',quantity:4,item_display_name:'Pain de campagne',legs:[{account_id:account.account_id,direction:'IN',amount:'128'}]},
 {operation_id:'33333333-3333-4333-8333-333333333333',type:'QUEST_REWARD',state:'CONFIRMED',amount:'32768',revision:0,material_state:'PENDING',quest_id:'m1.1',rule_version:'commerce-v1',created_at:date,updated_at:date,reason:'Les portes du royaume'},
 {operation_id:'44444444-4444-4444-8444-444444444444',type:'CREDIT',state:'CONFIRMED',amount:'64',revision:0,owner_id:owner,owner_account:bank,rule_version:'bank-v1',created_at:date,updated_at:date,reason:'Correction de recette'}];
const offers=[{offer_id:'minecraft:bread',stock:23,reserved_stock:1,incoming_stock:0},{offer_id:'minecraft:iron_sword',stock:3,reserved_stock:0,incoming_stock:0}];const plans=[];
const api={get:async path=>{
 const url=new URL(path,'http://fixture.local/');const name=decodeURIComponent(url.pathname.slice(1));
 if(name==='wallet')return{bank,bank_state:'MIGRATED',cashboxes:[account],observed_at:date,has_more:false};
 if(name==='admin/desk/overview')return{review:1,reserved:0,materials:0,businesses:1,scheduled:plans.filter(p=>p.state==='SCHEDULED').length,observed_at:date};
 if(name==='admin/desk/businesses')return{businesses:[{...business,account}],has_more:false};
 if(name==='admin/businesses/inn:recette')return{business,account,funding_account:bank,offers,plans,has_more:false};
 if(name.startsWith('admin/operations/')||name.startsWith('operations/')){const result=rows.find(row=>row.operation_id===name.split('/').at(-1));if(!result)throw new Error('Reçu fictif introuvable');return result;}
 if(name==='operations'||name==='admin/desk/operations'){const state=url.searchParams.get('state'),type=url.searchParams.get('type');return{operations:rows.filter(row=>(!state||row.state===state)&&(!type||row.type===type)),has_more:false};}
 throw new Error('Fixture inconnue '+path);
},post:async(path,body)=>{
 await new Promise(resolve=>setTimeout(resolve,250));
 if(path.endsWith('/availability')){business.active=body.active;business.revision++;}
 if(path.endsWith('/schedule'))plans.push({...body,schedule_id:'plan-demo',state:'SCHEDULED'});
 if(path.endsWith('/cancel'))plans[0].state='CANCELLED';
 if(path.endsWith('/stock'))offers.find(o=>o.offer_id===body.offer_id).stock=body.stock;
 if(path.endsWith('/resolve'))rows[0].state=body.decision==='delivery'?'CONFIRMED':'CANCELLED';
 return{state:'CONFIRMED'};
}};
function Preview(){const[mode,setMode]=useState('player');return <MotionConfig reducedMotion="user"><BrowserRouter><div className="economy-demo-label">RECETTE VISUELLE — DONNÉES FICTIVES — aucun appel aux comptes réels</div><div style={{background:'#11110f',display:'flex',gap:16,padding:16,color:'#e8c978'}}><button onClick={()=>setMode('player')}>Vue joueur</button><button onClick={()=>setMode('admin')}>Vue intendance</button></div>{mode==='player'?<Finance api={api}/>:<EconomyDesk api={api}/>}</BrowserRouter></MotionConfig>}
createRoot(document.getElementById('root')).render(<Preview/>);
