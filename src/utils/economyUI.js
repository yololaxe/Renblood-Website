import { parseMoney } from './money.js';

const actions={BUY:'Achat',SELL:'Vente',SERVICE:'Prestation',CLAIM:'Caisse vers banque',FUND:'Approvisionnement',REFUND:'Remboursement',STOCK_IN:'Dépôt de stock',STOCK_OUT:'Reprise de stock',STOCK_ADJUST:'Ajustement du stock'};
const types={DEPOSIT:'Dépôt',WITHDRAW:'Retrait',CREDIT:'Crédit',DEBIT:'Débit',OPENING_BALANCE:'Solde repris',COMPENSATION:'Compensation',QUEST_REWARD:'Récompense de quête'};
export const receiptTitle=receipt=>receipt.type==='COMMERCE'?(actions[receipt.action]||'Commerce'):(types[receipt.type]||receipt.type);
export const materialLabel=state=>({PENDING:'Objets conservés, remise à reprendre',DELIVERING:'Remise des objets en cours',DELIVERED:'Objets remis',RECONCILIATION_REQUIRED:'Remise des objets à vérifier'}[state]||'');
export function averageMoney(values){
  const known=values.map(parseMoney).filter(value=>value!==null);
  if(!known.length)return undefined;
  const count=BigInt(known.length);
  return ((known.reduce((total,value)=>total+value,0n)+count/2n)/count).toString();
}
export function signedMoney(value){
  if(typeof value==='number'&&!Number.isSafeInteger(value))return null;
  const text=String(value);
  if(!/^-?(0|[1-9][0-9]{0,18})$/.test(text)||text==='-0')return null;
  const absolute=parseMoney(text.startsWith('-')?text.slice(1):text);
  return absolute===null?null:(text.startsWith('-')?-absolute:absolute);
}
export const absoluteMoney=value=>value===null?null:(value<0n?-value:value);
export const paymentLabel=receipt=>receipt.action?.startsWith('STOCK_')?'Stock · aucun mouvement monétaire':receipt.payment==='CASH'?'Espèces en jeu':'Banque';
