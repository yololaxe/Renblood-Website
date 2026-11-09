import {useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import RealmHeader from '../../components/RealmHeader';
import {ReceiptPanel,ReceiptRows,receiptStates} from '../../components/economy/ReceiptPanel';
import EconomyAction from '../../components/economy/EconomyAction';
import {useEconomyPage} from '../../components/economy/useEconomyPage';
import {economyApi,queryString} from '../../services/economyApi';
import {formatMoney} from '../../utils/money';
import '../../components/economy/economy.css';

export default function EconomyDesk({api=economyApi}){
  const [tab,setTab]=useState('operations'),[filters,setFilters]=useState({state:'RECONCILIATION_REQUIRED',type:'',q:''}),[search,setSearch]=useState(''),[summary,setSummary]=useState(null),[summaryError,setSummaryError]=useState(''),[selected,setSelected]=useState(null),[detail,setDetail]=useState(null),[detailError,setDetailError]=useState(''),[loadingDetail,setLoadingDetail]=useState(false),[revision,setRevision]=useState(0),[offer,setOffer]=useState(null);
  const list=useEconomyPage(api,`admin/desk/${tab}?${queryString(tab==='businesses'?{q:filters.q}:filters)}`,tab);
  const activeDetail=useRef(null),detailElement=useRef(null);
  useEffect(()=>{const controller=new AbortController();setSummaryError('');api.get('admin/desk/overview',controller.signal).then(data=>{if(!controller.signal.aborted)setSummary(data);}).catch(error=>{if(error.name!=='AbortError')setSummaryError(error.message);});return()=>controller.abort();},[api,revision]);
  useEffect(()=>{
    activeDetail.current?.abort();setDetail(null);setDetailError('');setOffer(null);if(!selected)return;
    const controller=new AbortController();activeDetail.current=controller;setLoadingDetail(true);
    const path=selected.kind==='businesses'?`admin/businesses/${encodeURIComponent(selected.id)}`:`admin/operations/${selected.id}`;
    api.get(path,controller.signal).then(result=>{if(!controller.signal.aborted)setDetail(result);}).catch(error=>{if(error.name!=='AbortError')setDetailError(error.message);}).finally(()=>{if(!controller.signal.aborted)setLoadingDetail(false);});return()=>controller.abort();
  },[api,selected,revision]);
  useEffect(()=>{if(selected?.id&&window.matchMedia('(max-width:900px)').matches){detailElement.current?.focus({preventScroll:true});detailElement.current?.scrollIntoView({block:'start',behavior:'auto'});}},[selected?.id]);
  const refresh=()=>{list.reload();setRevision(value=>value+1);};
  const select=(kind,id)=>{setSelected({kind,id});};
  const cancelPlan=async plan=>{try{await api.post(`admin/schedules/${plan.schedule_id}/cancel`,{});refresh();}catch(error){setDetailError(error.message);}};
  const [offerLoading,setOfferLoading]=useState(false);
  const moreOffers=async()=>{if(offerLoading||!detail?.next_cursor)return;setOfferLoading(true);const controller=activeDetail.current;try{const data=await api.get(`admin/businesses/${encodeURIComponent(selected.id)}?before=${encodeURIComponent(detail.next_cursor)}`,controller.signal);if(controller!==activeDetail.current||controller.signal.aborted)return;setDetail(old=>({...data,offers:[...old.offers,...data.offers]}));}catch(error){if(error.name!=='AbortError')setDetailError(error.message);}finally{setOfferLoading(false);}};
  const business=detail?.business;
  return <main className="realm-page economy-page"><RealmHeader eyebrow="L’intendance / Économie" title="Le registre du royaume" description="Suivez les règlements, les caisses et les remises à vérifier. Chaque correction garde sa référence et son motif."><Link to="/finances" className="realm-action">Mes finances</Link><Link to={selected?.kind==='operations'?'/support/economie?recu='+encodeURIComponent(selected.id):'/support/economie'} className="realm-action">Notes de support</Link><button className="realm-action" onClick={refresh} disabled={list.loading}>Actualiser</button></RealmHeader>
    <div className="realm-content economy-content">
      <section className="economy-overview" aria-label="État de l’économie">{[['À vérifier','review'],['Réservations','reserved'],['Remises à examiner','materials'],['Établissements','businesses'],['Barèmes programmés','scheduled']].map(([label,key])=><article key={key}><p>{label}</p><strong>{summaryError?'—':summary?.[key]??'…'}</strong></article>)}</section>
      {summaryError&&<p className="economy-error" role="alert">{summaryError} Les indicateurs ne sont pas à jour.</p>}
      {summary&&!summary.publisher_ready&&<p className="economy-callout">Publication des barèmes en attente : le service de planification ne répond pas actuellement. Les programmations restent conservées ; aucun tarif futur n’est considéré comme actif.</p>}
      {summary?.oldest_pending_at&&<p className="economy-muted">Plus ancien reçu en attente : {new Date(summary.oldest_pending_at).toLocaleString('fr-FR')}.</p>}
      <div className="economy-controls"><div className="economy-tabs" aria-label="Afficher"><button aria-pressed={tab==='operations'} onClick={()=>{setTab('operations');setSelected(null);}}>Règlements</button><button aria-pressed={tab==='businesses'} onClick={()=>{setTab('businesses');setSelected(null);}}>Caisses et établissements</button></div>
        <form className="economy-search" onSubmit={event=>{event.preventDefault();setFilters(old=>({...old,q:search.trim()}));}}><label htmlFor="economy-search">{tab==='operations'?'Référence, identifiant de personnage ou d’établissement':'Nom ou identifiant d’établissement'}</label><div><input id="economy-search" value={search} maxLength={160} onChange={event=>setSearch(event.target.value)}/><button className="realm-action" type="submit">Chercher</button></div></form>
        {tab==='operations'&&<div className="economy-filter-row"><label>État<select value={filters.state} onChange={event=>setFilters(old=>({...old,state:event.target.value}))}><option value="">Tous les états</option>{Object.entries(receiptStates).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Type<select value={filters.type} onChange={event=>setFilters(old=>({...old,type:event.target.value}))}><option value="">Tous les mouvements</option>{[['COMMERCE','Commerce et services'],['QUEST_REWARD','Récompenses'],['DEPOSIT','Dépôts'],['WITHDRAW','Retraits'],['CREDIT','Crédits'],['DEBIT','Débits'],['COMPENSATION','Compensations']].map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label></div>}
      </div>
      <div className="economy-workspace"><section aria-label="Résultats"><div className="economy-section-heading"><h2>{tab==='operations'?'Les mouvements':'Les établissements'}</h2><span>{list.data.length} affichés</span></div>
        {list.error&&<p className="economy-error" role="alert">{list.error}</p>}{list.loading&&!list.data.length&&<p className="economy-empty" role="status">Consultation du registre…</p>}
        {!list.loading&&!list.error&&!list.data.length&&<div className="economy-empty"><h3>Aucun résultat pour ces critères.</h3><p>Essayez tous les états, ou collez une référence exacte de reçu.</p></div>}
        {tab==='operations'?<ReceiptRows rows={list.data} selected={selected?.id} onSelect={receipt=>select('operations',receipt.operation_id)}/>:list.data.map(row=><button key={row.business_id} className="economy-receipt" aria-pressed={selected?.id===row.business_id} onClick={()=>select('businesses',row.business_id)}><span><strong>{row.label}</strong><small>{row.business_id}</small><small>{row.active?'Ouvert':'Suspendu'}</small></span><span><strong>{row.account?formatMoney(row.account.available):'Non disponible'}</strong><small>Disponible confirmé</small></span></button>)}
        {list.more&&<button className="realm-action" onClick={list.next} disabled={list.loading}>Voir les résultats suivants</button>}
      </section>
      <aside className="economy-detail" ref={detailElement} tabIndex={-1} id="economy-detail" aria-label="Élément sélectionné">{loadingDetail?<p role="status">Ouverture du détail…</p>:detailError?<p className="economy-error" role="alert">{detailError}</p>:business?<>
        <p className="economy-eyebrow">L’ÉTABLISSEMENT</p><h2>{business.label}</h2><p className="economy-muted">{business.business_id} · {business.active?'Ouvert':'Suspendu'}</p>
        <dl className="economy-details">{[['Disponible',formatMoney(detail.account?.available)],['Réservé',formatMoney(detail.account?.reserved)],['Entrées attendues',formatMoney(detail.account?.incoming)],['Propriétaire',business.owner_id],['Barème',business.rule_version],['Taxe',`${business.tax_bps/100} %`]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        <EconomyAction action="availability" subject={{business}} api={api} onDone={refresh}/><EconomyAction action="fund" subject={{business,account:detail.account,funding_account:detail.funding_account}} api={api} onDone={refresh}/><EconomyAction action="schedule" subject={{business}} api={api} onDone={refresh}/>
        <section className="economy-stock"><h3>Stock et offres</h3><p className="economy-muted">Disponible, réservé et dépôts en cours sont distincts. Un ajustement conserve les réservations.</p><label>Offre<select value={offer?.offer_id||''} onChange={event=>setOffer(detail.offers.find(row=>row.offer_id===event.target.value)||null)}><option value="">Choisir une offre</option>{detail.offers.map(row=><option key={row.offer_id} value={row.offer_id}>{row.offer_id} — {row.stock===null?'illimité':`${row.stock} disponibles / ${row.reserved_stock} réservés`}</option>)}</select></label>
          {detail.has_more&&<button className="realm-action" disabled={offerLoading} onClick={moreOffers}>Charger d’autres offres</button>}
          {offer&&offer.stock!==null&&<><p className="economy-muted">{offer.reserved_stock??0} réservés · {offer.incoming_stock??0} en cours de dépôt{business.business_id.startsWith('market:')&&offer.offer_id.startsWith('slot:')?` · Capacité de la case : ${offer.stock_capacity??64}`:''}</p><EconomyAction key={offer.offer_id} action="stock" subject={{business,offer}} api={api} onDone={refresh}/></>}</section>
        <section className="economy-plans"><h3>Publications</h3>{detail.plans.length?detail.plans.map(plan=><article key={plan.schedule_id}><strong>{plan.rule_version}</strong><p>{new Date(plan.effective_at).toLocaleString('fr-FR')} · {({SCHEDULED:'Programmée',PUBLISHED:'Publiée',CANCELLED:'Annulée',CONFLICT:'À vérifier — le contexte a changé'})[plan.state]}</p>{plan.state==='SCHEDULED'&&<button className="realm-action" onClick={()=>cancelPlan(plan)}>Annuler la programmation</button>}</article>):<p className="economy-muted">Aucun barème programmé.</p>}</section>
      </>:<ReceiptPanel receipt={detail}>{detail&&<>
        {detail.state==='RESERVED'&&<EconomyAction action="review" subject={{receipt:detail}} api={api} onDone={refresh}/>}
        {detail.state==='RESERVED'&&detail.action==='FUND'&&detail.actor_id?.startsWith('web:')&&<EconomyAction action="complete-transfer" subject={{receipt:detail}} api={api} onDone={refresh}/>}
        {detail.state==='RECONCILIATION_REQUIRED'&&<EconomyAction action="resolve" subject={{receipt:detail}} api={api} onDone={refresh}/>}
        {detail.state==='CONFIRMED'&&['CREDIT','DEBIT'].includes(detail.type)&&<EconomyAction action="compensations" subject={{receipt:detail}} api={api} onDone={refresh}/>}
        {detail.type==='QUEST_REWARD'&&detail.material_state!=='DELIVERED'&&<EconomyAction action="materials" subject={{receipt:detail}} api={api} onDone={refresh}/>}
      </>}</ReceiptPanel>}</aside></div>
    </div></main>;
}
