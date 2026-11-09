import {useEffect,useRef,useState} from 'react';
import {Link,useSearchParams} from 'react-router-dom';
import RealmHeader from '../components/RealmHeader';
import {ReceiptPanel,ReceiptRows,receiptStates} from '../components/economy/ReceiptPanel';
import {useEconomyPage} from '../components/economy/useEconomyPage';
import {economyApi,queryString} from '../services/economyApi';
import {formatMoney} from '../utils/money';
import '../components/economy/economy.css';

export default function Finance({api=economyApi}){
  const [params,setParams]=useSearchParams(),[filters,setFilters]=useState({state:'',type:'',business_id:''}),[wallet,setWallet]=useState(null),[walletError,setWalletError]=useState(''),[walletLoading,setWalletLoading]=useState(false),[selected,setSelected]=useState(null),[detailError,setDetailError]=useState(''),[refresh,setRefresh]=useState(0);
  const list=useEconomyPage(api,`operations?${queryString(filters)}`),detailController=useRef(null),detailElement=useRef(null),walletGeneration=useRef(0);
  useEffect(()=>{const controller=new AbortController();++walletGeneration.current;setWalletLoading(true);setWalletError('');api.get('wallet',controller.signal).then(data=>{if(!controller.signal.aborted)setWallet(data);}).catch(error=>{if(error.name!=='AbortError')setWalletError(error.message);}).finally(()=>{if(!controller.signal.aborted)setWalletLoading(false);});return()=>controller.abort();},[api,refresh]);
  const reference=params.get('receipt');
  useEffect(()=>{detailController.current?.abort();setDetailError('');if(!reference){setSelected(null);return;}
    if(!/^[a-f0-9-]{36}$/i.test(reference)){setSelected(null);setDetailError('Cette référence de reçu est invalide.');return;}
    const controller=new AbortController();detailController.current=controller;
    api.get(`operations/${reference}`,controller.signal).then(receipt=>{if(!controller.signal.aborted)setSelected(receipt);}).catch(error=>{if(error.name!=='AbortError')setDetailError(error.message);});return()=>controller.abort();
  },[api,reference,refresh]);
  const update=()=>{list.reload();setRefresh(value=>value+1);};
  const select=receipt=>{setSelected(receipt);setParams({receipt:receipt.operation_id},{replace:true});};
  useEffect(()=>{if(selected?.operation_id&&window.matchMedia('(max-width:900px)').matches){detailElement.current?.focus({preventScroll:true});detailElement.current?.scrollIntoView({block:'start',behavior:'auto'});}},[selected?.operation_id]);
  const bank=wallet?.bank;
  const [moreBusy,setMoreBusy]=useState(false);
  const moreBoxes=async()=>{if(moreBusy||!wallet?.next_cursor)return;setMoreBusy(true);const generation=walletGeneration.current;try{const data=await api.get(`wallet?before=${encodeURIComponent(wallet.next_cursor)}`);if(generation!==walletGeneration.current)return;setWallet(old=>({...data,cashboxes:[...old.cashboxes,...data.cashboxes]}));}catch(error){setWalletError(error.message);}finally{setMoreBusy(false);}};
  return <main className="realm-page economy-page"><RealmHeader eyebrow="Le registre / Vos finances" title="Votre argent, ses chemins" description="Banque, caisses et récompenses. Le disponible confirmé reste distinct des montants réservés et des espèces que vous portez en jeu."><button className="realm-action" disabled={walletLoading||list.loading} onClick={update}>Actualiser le registre</button><Link className="realm-action" to="/market-prices">Comparer les marchés</Link></RealmHeader>
    <div className="realm-content economy-content">
      {walletError&&<p role="alert" className="economy-error">{walletError}{wallet&&' Le dernier relevé peut ne plus être à jour.'}</p>}
      {walletLoading&&!wallet?<p role="status" className="economy-empty">Ouverture de votre compte…</p>:wallet&&<>
        {wallet.bank_state==='SETUP_REQUIRED'&&<p className="economy-callout">Votre compte bancaire doit être préparé par l’intendance. Vos reçus et vos caisses restent consultables.</p>}
        <section className="economy-overview economy-balances" aria-label="Compte bancaire">{[['Disponible',bank?.available,'Pour vos règlements et vos retraits.'],['Réservé',bank?.reserved,'Déjà affecté à une opération en cours.'],['Entrées attendues',bank?.incoming,'Créditées après confirmation de la remise.']].map(([label,value,note])=><article key={label}><p>{label}</p><strong>{value===undefined?'À préparer':formatMoney(value)}</strong><small>{note}</small></article>)}</section>
        <p className="economy-muted">Relevé du {new Date(wallet.observed_at).toLocaleString('fr-FR')}. Les espèces de votre inventaire se consultent en jeu.</p>
        <section className="economy-wallet"><div className="economy-section-heading"><h2>Vos établissements</h2><span>{wallet.cashboxes.length} caisses</span></div><p>Les recettes confirmées peuvent être transférées en banque depuis le jeu. Une estimation de gains ne permet aucun retrait.</p>
          {!wallet.cashboxes.length?<p className="economy-empty">Aucune caisse reliée pour le moment.</p>:wallet.cashboxes.map(box=><article className="economy-cashbox" key={box.account_id}><div><h3>{box.label||box.business_id}</h3><small>{box.business_id}</small></div><dl>{[['Disponible',box.available],['Réservé',box.reserved],['Attendu',box.incoming]].map(([label,amount])=><div key={label}><dt>{label}</dt><dd>{formatMoney(amount)}</dd></div>)}</dl><button className="realm-action" onClick={()=>setFilters(old=>({...old,business_id:box.business_id}))}>Voir les reçus</button></article>)}
          {wallet.has_more&&<button className="realm-action" disabled={moreBusy} onClick={moreBoxes}>Autres établissements</button>}
        </section>
      </>}
      <div className="economy-controls"><div className="economy-filter-row"><label>État<select value={filters.state} onChange={event=>setFilters(old=>({...old,state:event.target.value}))}><option value="">Tous les états</option>{Object.entries(receiptStates).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Mouvement<select value={filters.type} onChange={event=>setFilters(old=>({...old,type:event.target.value}))}><option value="">Tous les mouvements</option>{[['COMMERCE','Commerce et services'],['QUEST_REWARD','Récompenses de quête'],['DEPOSIT','Dépôts'],['WITHDRAW','Retraits'],['CREDIT','Crédits'],['DEBIT','Débits']].map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>{filters.business_id&&<button className="realm-action" onClick={()=>setFilters(old=>({...old,business_id:''}))}>Tous les établissements ×</button>}</div></div>
      <div className="economy-workspace"><section aria-label="Historique"><div className="economy-section-heading"><h2>Le fil des opérations</h2><span>{list.data.length} affichées</span></div>{list.error&&<p className="economy-error" role="alert">{list.error}</p>}{list.loading&&!list.data.length&&<p role="status" className="economy-empty">Consultation des reçus…</p>}{!list.loading&&!list.error&&!list.data.length&&<p className="economy-empty">Aucune opération pour ces critères.</p>}
        <ReceiptRows rows={list.data} selected={selected?.operation_id} onSelect={select}/>{list.more&&<button className="realm-action" disabled={list.loading} onClick={list.next}>Opérations précédentes</button>}
      </section><aside className="economy-detail" ref={detailElement} tabIndex={-1} aria-label="Détail du reçu">{detailError?<p className="economy-error" role="alert">{detailError}</p>:<ReceiptPanel receipt={selected}/>}</aside></div>
    </div></main>;
}
