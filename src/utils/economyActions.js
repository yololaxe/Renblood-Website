import {parseMoney,MAX_MONEY,formatMoney} from './money.js';
const fail=message=>{throw new Error(message);};
export function rateBasisPoints(value){
  const text=String(value).trim().replace(',','.');
  if(!/^\d{1,3}(\.\d{1,2})?$/.test(text))return null;
  const [whole,decimal='']=text.split('.');const rate=Number(whole)*100+Number(decimal.padEnd(2,'0'));
  return rate<=10000?rate:null;
}
export function actionPreview(action,subject,fields){
  const reason=fields.reason?.trim();
  if(action!=='complete-transfer'&&(!reason||reason.length>160))fail('Expliquez le motif en 160 caractères maximum.');
  const business=subject.business,receipt=subject.receipt,offer=subject.offer;
  let path,body={reason},changes=[],physical=false;
  if(action==='availability'){
    path=`admin/businesses/${encodeURIComponent(business.business_id)}/availability`;
    body={...body,revision:business.revision??0,active:!business.active};
    changes=[['État actuel',business.active?'Ouvert':'Suspendu'],['Après validation',business.active?'Suspendu':'Ouvert']];
  }else if(action==='fund'){
    const amount=parseMoney(fields.amount);if(amount===null||amount===0n)fail('Indiquez un montant entier positif en fer.');
    const available=parseMoney(subject.funding_account?.available),boxAvailable=parseMoney(subject.account?.available);
    if(available===null||boxAvailable===null)fail('Rechargez les comptes avant de préparer le virement. Votre banque doit être initialisée.');
    if(available<amount)fail('Votre banque ne dispose pas de ce montant.');
    const reserved=parseMoney(subject.account?.reserved??'0'),incoming=parseMoney(subject.account?.incoming??'0');
    if(reserved===null||incoming===null||boxAvailable+reserved+incoming+amount>MAX_MONEY)fail('Le virement dépasserait la capacité de cette caisse.');
    path=`admin/businesses/${encodeURIComponent(business.business_id)}/fund`;body={...body,amount:amount.toString()};
    changes=[['Votre banque · avant',formatMoney(available)],['Votre banque · après',formatMoney(available-amount)],['Caisse · avant',formatMoney(boxAvailable)],['Caisse · après',formatMoney(boxAvailable+amount)]];
  }else if(action==='stock'){
    if(!offer||offer.stock===null)fail('Sélectionnez une offre à stock limité.');
    if(!/^(0|[1-9]\d{0,9})$/.test(fields.stock||'')||Number(fields.stock)>2147483647)fail('Le stock doit être un entier entre 0 et 2 147 483 647.');
    path=`admin/businesses/${encodeURIComponent(business.business_id)}/stock`;
    body={...body,offer_id:offer.offer_id,expected_stock:offer.stock,stock:Number(fields.stock)};
    const marketSlot=business.business_id.startsWith('market:')&&offer.offer_id.startsWith('slot:');
    const capacity=marketSlot?(offer.stock_capacity??64):2147483647;
    const reserved=offer.reserved_stock??0,incoming=offer.incoming_stock??0;
    if(![capacity,reserved,incoming].every(value=>Number.isSafeInteger(value)&&value>=0)||capacity<1||capacity>(marketSlot?64:2147483647))fail('Rechargez l’offre avant de préparer cet ajustement.');
    if(body.stock+reserved+incoming>capacity)fail(marketSlot?`Cette case accepte ${capacity} objet(s) au total, réservations et dépôts en cours compris.`:'L’ajustement dépasserait la capacité de stock, réservations et dépôts en cours compris.');
    changes=[['Offre',offer.offer_id],['Disponible actuel',String(offer.stock)],['Après validation',fields.stock],['Réservations',`${reserved} conservées`],['Dépôts en cours',`${incoming} conservés`]];
    if(marketSlot)changes.push(['Capacité totale de la case',String(capacity)]);
  }else if(action==='schedule'){
    const tax=rateBasisPoints(fields.tax);if(tax===null)fail('Indiquez une taxe de 0 à 100 %, avec deux décimales maximum.');
    const date=new Date(fields.date);if(!Number.isFinite(date.getTime())||date.getTime()<=Date.now()||date.getTime()-Date.now()>180*86400000)fail('Choisissez une date future dans les 180 jours.');
    if(!fields.version?.trim()||fields.version.length>160||fields.version===business.rule_version)fail('Donnez une nouvelle version au barème.');
    if(tax>0&&!fields.treasury?.trim())fail('Indiquez l’identifiant de la caisse fiscale.');
    path=`admin/businesses/${encodeURIComponent(business.business_id)}/schedule`;
    body={...body,expected_rule_version:business.rule_version,rule_version:fields.version.trim(),tax_bps:tax,treasury_account_id:fields.treasury?.trim()||null,effective_at:date.toISOString()};
    changes=[['Barème actuel',business.rule_version],['Taxe actuelle',`${(business.tax_bps??0)/100} %`],['Taxe programmée',`${tax/100} %`],['Publication',date.toLocaleString('fr-FR')],['Trésorerie',body.treasury_account_id||'Aucune taxe']];
  }else{
    const base=`admin/operations/${receipt.operation_id}`;
    if(action==='compensations'){
      if(receipt.state!=='CONFIRMED'||!['CREDIT','DEBIT'].includes(receipt.type))fail('Une compensation automatique exige un crédit ou débit confirmé.');
      const account=receipt.owner_account,amount=parseMoney(receipt.amount),available=parseMoney(account?.available);
      if(amount===null||available===null)fail('Rechargez le compte avant de proposer la compensation.');
      const next=available+(receipt.type==='CREDIT'?-amount:amount);
      const reserved=parseMoney(account.reserved),incoming=parseMoney(account.incoming??'0');
      if(reserved===null||incoming===null||next<0n||next+reserved+incoming>MAX_MONEY)fail('Cette compensation dépasserait le disponible ou la limite du compte.');
      path=`${base}/compensations`;changes=[['Compte concerné',receipt.owner_id],['Disponible actuel',formatMoney(available)],['Après compensation',formatMoney(next)]];
    }else if(action==='resolve'){
      if(receipt.state!=='RECONCILIATION_REQUIRED')fail('Ce reçu n’attend pas de rapprochement.');
      if(!['delivery','cancel'].includes(fields.decision))fail('Choisissez une décision.');
      path=`${base}/resolve`;body={...body,decision:fields.decision,revision:receipt.revision};physical=true;
      changes=[['Reçu',receipt.operation_id],['Décision',fields.decision==='delivery'?'Confirmer la remise déjà vérifiée':'Annuler et libérer les réservations']];
    }else if(action==='materials'){
      if(!['DELIVERED','RETRY'].includes(fields.decision))fail('Choisissez l’état de la remise.');
      path=`${base}/materials`;body={...body,decision:fields.decision};physical=true;
      changes=[['Quête',receipt.quest_id||receipt.operation_id],['Décision',fields.decision==='RETRY'?'Autoriser une nouvelle remise des objets et de l’XP':'Marquer la remise comme vérifiée']];
    }else if(action==='review'){
      if(receipt.state!=='RESERVED')fail('Ce reçu n’est plus réservé.');
      path=`${base}/review`;body={...body,revision:receipt.revision};changes=[['Après validation','À vérifier'],['Fonds et stock','Réservations conservées']];
    }else if(action==='complete-transfer'){
      if(receipt.type!=='COMMERCE'||receipt.action!=='FUND'||receipt.state!=='RESERVED'||!receipt.actor_id?.startsWith('web:'))fail('Ce virement ne peut pas être repris ici.');
      path=`${base}/complete-transfer`;body={revision:receipt.revision};changes=[['Montant déjà réservé',formatMoney(receipt.amount)],['Après validation','Virement confirmé, aucun second débit']];
    }else fail('Action inconnue.');
  }
  return {path,body,changes,physical};
}
