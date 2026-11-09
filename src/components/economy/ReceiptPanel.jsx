import {useState} from 'react';
import {motion,useReducedMotion} from 'framer-motion';
import {receiptTitle,materialLabel,paymentLabel} from '../../utils/economyUI';
import {formatMoney} from '../../utils/money';
export const receiptStates={RESERVED:'En attente',CONFIRMED:'Confirmée',CANCELLED:'Annulée',RECONCILIATION_REQUIRED:'À vérifier'};
export function ReceiptPanel({receipt,children}){
  const [notice,setNotice]=useState('');const reduced=useReducedMotion();
  if(!receipt)return <div className="economy-placeholder"><span>01 — LE JUSTIFICATIF</span><h2>Chaque mouvement<br/>a sa trace.</h2><p>Sélectionnez une ligne pour retrouver le prix accepté, la destination et la référence de votre opération.</p></div>;
  const details=[['Montant',formatMoney(receipt.amount)],['État',receiptStates[receipt.state]||receipt.state],['Paiement',paymentLabel(receipt)],
    ...(receipt.business_label?[["Établissement",receipt.business_label]]:[]),...(receipt.tax!==undefined?[['Taxe incluse',formatMoney(receipt.tax)]]:[]),
    ...(receipt.refunded_tax!==undefined?[['Taxe restituée',formatMoney(receipt.refunded_tax)]]:[]),...(receipt.quantity!==undefined?[['Quantité',receipt.quantity]]:[]),
    ...(receipt.item_display_name||receipt.offer_id?[['Objet ou offre',receipt.item_display_name||receipt.offer_id]]:[]),
    ...(receipt.material_state?[['Remise',materialLabel(receipt.material_state)]]:[]),['Règle',receipt.business_rule_version||receipt.rule_version],
    ...(receipt.price_version?[['Prix accepté',receipt.price_version]]:[]),['Motif',receipt.administrative_reason||receipt.reason||'Opération bancaire'],['Référence',receipt.operation_id],
    ['Dernier état',new Date(receipt.updated_at).toLocaleString('fr-FR')]];
  const copy=async()=>{try{await navigator.clipboard.writeText(receipt.operation_id);setNotice('Référence copiée.');}catch{setNotice('Copiez la référence affichée dans le reçu.');}};
  const download=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(receipt,null,2)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download=`renblood-${receipt.operation_id}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  return <motion.section key={receipt.operation_id} initial={{opacity:0,y:reduced?0:6}} animate={{opacity:1,y:0}} transition={{duration:.18}} aria-label="Détail du reçu">
    <p className="economy-eyebrow">LE JUSTIFICATIF</p><h2>{receiptTitle(receipt)}</h2><dl className="economy-details">{details.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value??'—'}</dd></div>)}</dl>
    {receipt.legs?.length>0&&<div className="economy-legs"><h3>Trajet des fonds</h3>{receipt.legs.map((leg,index)=><p key={`${leg.account_id}-${index}`}><span>{leg.direction==='IN'?'Vers':'Depuis'} {leg.account_id}</span><strong>{formatMoney(leg.amount)}</strong></p>)}</div>}
    {receipt.state==='RECONCILIATION_REQUIRED'&&<p className="economy-callout">Ce reçu demande une vérification. Transmettez sa référence à l’intendance ; ne renouvelez pas le paiement.</p>}
    {receipt.state==='RESERVED'&&<p className="economy-callout">{receipt.action==='FUND'&&receipt.actor_id?.startsWith('web:')?'Ce virement est réservé. L’intendance peut reprendre sa confirmation avec ce reçu, sans nouveau débit.':'Ce montant est réservé. Rejoignez le jeu pour reprendre la vérification de la remise.'}</p>}
    <div className="economy-actions"><button type="button" className="realm-action" onClick={copy}>Copier la référence</button><button type="button" className="realm-action" onClick={download}>Télécharger le reçu</button></div>
    <p role="status" className="economy-muted">{notice}</p>{children}
  </motion.section>;
}
export function ReceiptRows({rows,selected,onSelect}){return <div className="economy-receipts">{rows.map(receipt=><button type="button" key={receipt.operation_id} aria-pressed={selected===receipt.operation_id} className="economy-receipt" onClick={()=>onSelect(receipt)}>
  <span><strong>{receiptTitle(receipt)}</strong><small>{receipt.business_label||receipt.reason||receipt.business_id||'Compte bancaire'}</small><small>{new Date(receipt.created_at).toLocaleString('fr-FR')}</small></span>
  <span><strong>{formatMoney(receipt.amount)}</strong><small className="economy-state" data-state={receipt.state}>{receiptStates[receipt.state]||receipt.state}</small>{receipt.material_state&&<small>{materialLabel(receipt.material_state)}</small>}</span>
</button>)}</div>;}
