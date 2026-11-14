import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import RealmHeader from '../../components/RealmHeader';
import { useUser } from '../../context/UserContext';
import axios from '../../services/axiosInstance';
import { formatMoney } from '../../utils/money';
import './merchant.css';
const base='/api/economy/v1/merchant';
const errorText=e=>e.response?.data?.message || 'Le service est indisponible. Actualisez avant de recommencer.';
const states={ACCEPTED:'À livrer',DELIVERING:'Remise en cours',DELIVERED:'Livrée',EXPIRED:'Expirée',CANCELLED:'Annulée',RECONCILIATION_REQUIRED:'Reçu à vérifier'};
const orientations={supply:'Approvisionnement',shop:'Boutique',specialty:'Négociation spécialisée'};
const money=v=>v==null?'Coût inconnu':formatMoney(String(v));
const signed=v=>v==null?'—':`${BigInt(v)<0n?'−':'+'}${money((BigInt(v)<0n?-BigInt(v):BigInt(v)).toString())}`;
export default function MerchantNotebook(){
  const {userRank}=useUser(),location=useLocation();
  const admin=location.pathname.startsWith('/admin/')&&userRank==='Admin';
  const [data,setData]=useState(null),[config,setConfig]=useState(null),[city,setCity]=useState(''),[view,setView]=useState('opportunities');
  const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[quantity,setQuantity]=useState(16),[filter,setFilter]=useState('');
  const mounted=useRef(true),lock=useRef(false),keys=useRef(new Map());
  useEffect(()=>{mounted.current=true;load();return()=>{mounted.current=false;};},[admin]);
  async function load(){
    if(lock.current)return;lock.current=true;setBusy(true);
    try{
      const {data:next}=await axios.get(`${base}/${admin?'config':'notebook'}`);
      if(mounted.current){if(admin)setConfig(next);else setData(next);setMessage('');}
    }catch(e){if(mounted.current)setMessage(errorText(e));}
    finally{lock.current=false;if(mounted.current)setBusy(false);}
  }
  async function action(path,body={},keyId){
    if(lock.current)return;lock.current=true;setBusy(true);setMessage('');
    let key;
    if(keyId){key=keys.current.get(keyId)||crypto.randomUUID();keys.current.set(keyId,key);}
    try{
      const {data:next}=await axios.post(`${base}/${path}`,body,key?{headers:{'Idempotency-Key':key}}:{});
      if(keyId)keys.current.delete(keyId);
      if(mounted.current){
        if(path==='config'){setConfig(next);setMessage('Configuration enregistrée.');}
        else{const {data:fresh}=await axios.get(`${base}/notebook`);if(mounted.current){setData(fresh);setMessage(path==='contracts'?'Commande réservée. Retrouvez-la dans vos livraisons.':'Modification enregistrée.');}}
      }
    }catch(e){
      // Preserve the idempotency key after an uncertain response; a different offer gets a different key.
      if(e.response && e.response.status<500 && e.response.status!==429 && keyId)keys.current.delete(keyId);
      if(mounted.current)setMessage(errorText(e));
    }finally{lock.current=false;if(mounted.current)setBusy(false);}
  }
  const changeCity=(index,field,value)=>setConfig(c=>({...c,cities:c.cities.map((row,i)=>i===index?{...row,anchor:{world:'minecraft:overworld',x:0,z:0,radius:32,...row.anchor,[field]:value}}:row)}));
  const changeOffer=(index,field,value)=>setConfig(c=>({...c,offers:c.offers.map((row,i)=>i===index?{...row,[field]:value}:row)}));
  const selectedCity=city || data?.cities?.[0]?.id || config?.cities?.[0]?.id || '';
  const knownNet=(data?.ledger||[]).reduce((sum,row)=>row.profit==null?sum:sum+BigInt(row.profit),0n);
  const rows=(data?.offers||[]).filter(o=>o.city_id===selectedCity&&o.name.toLowerCase().includes(filter.toLowerCase()));
  return <main className="realm-page merchant-page">
    <RealmHeader title={admin?'Atelier du négoce':'Carnet marchand'}><button disabled={busy} onClick={load}>Actualiser</button><Link to={admin?'/marchand':'/finances'}>{admin?'Voir le carnet':'Mes finances'}</Link></RealmHeader>
    <div role="status" aria-live="polite" className="merchant-message">{message || (busy?'Chargement…':'')}</div>
    {admin?<>
      <p className="merchant-intro">Cinq villes, des marchandises utiles et une demande partagée. Ces réglages équilibrent le jeu ; ils ne modifient pas le lore.</p>
      {config&&<form onSubmit={e=>{e.preventDefault();action('config',config);}}>
        <section className="merchant-settings">
          <label><input type="checkbox" checked={config.enabled} onChange={e=>setConfig({...config,enabled:e.target.checked})}/> Activer le pilote</label>
          <label><input type="checkbox" checked={config.budget_unlimited} onChange={e=>setConfig({...config,budget_unlimited:e.target.checked})}/> Budgets de rachat illimités</label>
          <label>Délai de livraison (heures réelles)<input type="number" min="1" max="168" step="1" value={config.delivery_seconds/3600} onChange={e=>setConfig({...config,delivery_seconds:Number(e.target.value)*3600})}/></label>
          <p>En mode limité, alimentez les caisses « merchant:demand:… » depuis l’administration économique. Aucun solde existant n’est réinitialisé.</p>
        </section>
        <h2>Points de commerce</h2><p>Les achats et livraisons se font en jeu à proximité de ces points. Définissez-les avant l’activation.</p>
        <div className="merchant-city-settings">{config.cities.map((c,i)=><fieldset key={c.id}><legend>{c.name}</legend>
          <label>Dimension<input value={c.anchor?.world||'minecraft:overworld'} onChange={e=>changeCity(i,'world',e.target.value)}/></label>
          {['x','z','radius'].map(f=><label key={f}>{f==='radius'?'Rayon en blocs':f.toUpperCase()}<input required type="number" min={f==='radius'?8:-30000000} max={f==='radius'?128:30000000} value={c.anchor?.[f]??''} onChange={e=>changeCity(i,f,Number(e.target.value))}/></label>)}
        </fieldset>)}</div>
        <label className="merchant-filter">Ville<select value={selectedCity} onChange={e=>setCity(e.target.value)}>{config.cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <div className="merchant-table-wrap"><table><caption>Références et quotas — 1 fer est l’unité de base</caption><thead><tr><th>Article</th><th>Fournisseur</th><th>Prix de base manuel (fer)</th><th>Demande</th><th>+1 unité / secondes</th><th>Stock fournisseur</th><th>+1 / secondes</th><th>Rachat %</th></tr></thead><tbody>
          {config.offers.map((o,i)=>o.city_id!==selectedCity?null:<tr key={o.item_id}><th scope="row">{o.name}</th><td><input aria-label={`Fournisseur ${o.name}`} type="checkbox" checked={o.source} onChange={e=>changeOffer(i,'source',e.target.checked)}/></td>
          <td><input aria-label={`Prix ${o.name}`} placeholder="Marché de la ville" inputMode="numeric" pattern="[1-9][0-9]*" value={o.manual_price??''} onChange={e=>changeOffer(i,'manual_price',e.target.value||null)}/></td>
          {['capacity','refill_seconds','supply_capacity','supply_refill_seconds'].map(f=><td key={f}><input aria-label={`${o.name} ${f}`} type="number" min={f.includes('seconds')?30:1} max={f.includes('seconds')?86400:4096} required value={o[f]} onChange={e=>changeOffer(i,f,Number(e.target.value))}/></td>)}
          <td><input aria-label={`Rachat ${o.name}`} type="number" min="10" max="150" step="0.01" value={o.sell_bps/100} onChange={e=>changeOffer(i,'sell_bps',Math.round(Number(e.target.value)*100))}/></td></tr>)}
        </tbody></table></div>
        <p>Prix manuel vide : prix calculé du marché de la ville. Sans prix calculé, l’article reste indisponible. Un fournisseur vend à 80 % de la base et ne propose pas de commande du même article. Le rachat des autres villes diminue avec la saturation.</p>
        <button className="merchant-primary" disabled={busy}>Enregistrer les réglages</button>
      </form>}
    </>:<>
      {data&&<>
        <div className="merchant-overview"><div><span className="merchant-eyebrow">Votre réputation</span><h2>{data.profile.rank}</h2><p>{data.profile.xp} XP · {data.profile.contract_limit} commandes simultanées</p></div><div><label>Orientation<select value={data.profile.branch} disabled={busy} onChange={e=>action('branch',{branch:e.target.value})}>{Object.entries(orientations).map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><small>Modifiable toutes les 24 h réelles.</small></div></div>
        <details className="merchant-help"><summary>Comment gagner sa marge ?</summary><p>Comparez les besoins d’une ville aux prix des fournisseurs. Réservez une commande avant d’acheter, transportez les objets et livrez-les au point indiqué avec <code>/mc marchand</code>. Le paiement se fait en pièces dans votre inventaire.</p><p>Une commande réserve la quantité et le prix pour {data.delivery_seconds/3600} h selon le réglage admin ; son échéance exacte est affichée ci-dessous. Les besoins se renouvellent en temps réel. Les objets acquis hors des échanges enregistrés gardent un coût inconnu.</p><p>Colporteur : 2 commandes. Négociant à 100 XP, maître à 500 XP. Approvisionnement : une commande supplémentaire à partir du rang négociant. Spécialisation : +1 à +2 % de négociation. Boutique : suivi des ventes de vos comptoirs. Un maximum de 32 XP par ville et article chaque jour UTC ; fractionner une livraison ne rapporte pas davantage.</p></details>
        <nav className="merchant-tabs" aria-label="Carnet">{[['opportunities','Marchés'],['contracts','Mes livraisons'],['ledger','Mes échanges']].map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>setView(id)}>{label}</button>)}<Link to="/account/merchant-counters">Mes boutiques ↗</Link>{userRank==='Admin'&&<Link to="/admin/marchand">Réglages du pilote ↗</Link>}</nav>
        {!data.enabled&&<p className="merchant-empty">Le pilote marchand est en préparation. Les anciennes commandes restent consultables.</p>}
        {view==='opportunities'&&data.enabled&&<>
          <div className="merchant-toolbar"><label>Ville<select value={selectedCity} onChange={e=>setCity(e.target.value)}>{data.cities.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Rechercher<input type="search" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Pain, bougie…"/></label><label>Quantité<input type="number" min="1" max="256" value={quantity} onChange={e=>setQuantity(e.target.value)}/></label></div>
          <p className="merchant-muted">Point de commerce : {data.cities.find(c=>c.id===selectedCity)?.anchor ? <>X {data.cities.find(c=>c.id===selectedCity).anchor.x} / Z {data.cities.find(c=>c.id===selectedCity).anchor.z} · rayon {data.cities.find(c=>c.id===selectedCity).anchor.radius} blocs</> : 'en préparation'}</p>
          <p className="merchant-muted">Prix par objet · observation du {new Date(data.observed_at).toLocaleString('fr-FR')} · actualisation manuelle</p>
          <div className="merchant-table-wrap"><table><thead><tr><th>Marchandise</th><th>Acheter au fournisseur</th><th>Livrer à la ville</th><th>Disponibilité</th><th>Commande</th></tr></thead><tbody>{rows.map(o=><tr key={o.item_id}><th scope="row">{o.name}<small>{o.item_id}</small></th><td>{o.source&&!o.price_required?money(o.buy_price):'—'}</td><td>{!o.source&&!o.price_required?money(o.sell_price):'—'}</td><td>{o.price_required?'Prix à définir':o.source?`${o.stock} en stock`:`${o.demand} demandés`}</td><td>{o.source?<span className="merchant-muted">Achat en jeu</span>:<button disabled={busy||o.price_required||!Number.isInteger(Number(quantity))||quantity<1||quantity>Math.min(256,o.demand)} onClick={()=>action('contracts',{city_id:o.city_id,item_id:o.item_id,quantity:Number(quantity),price_version:o.price_version},`${o.city_id}:${o.item_id}:${quantity}:${o.price_version}`)}>Réserver · {money((BigInt(o.sell_price)*BigInt(Math.max(1,Math.min(256,Math.trunc(Number(quantity))||1)))).toString())}</button>}</td></tr>)}</tbody></table></div>
        </>}
        {view==='contracts'&&<div className="merchant-orders">{data.contracts.length===0?<p>Aucune commande. Réservez votre première livraison dans les marchés.</p>:data.contracts.map(c=><article key={c.id}><div><span className={`merchant-state state-${c.state.toLowerCase()}`}>{states[c.state]||c.state}</span><h3>{c.quantity} {c.name} → {c.city_name}</h3><p>{money(c.amount)} · échéance {new Date(c.expires_at*1000).toLocaleString('fr-FR')}</p><small>Point : {c.anchor?.x}, {c.anchor?.z} · rayon {c.anchor?.radius} blocs · {c.anchor?.world}</small></div><div>{c.state==='ACCEPTED'&&<button disabled={busy} onClick={()=>action(`contracts/${c.id}/cancel`)}>Annuler la réservation</button>}<small>La remise des objets se fait en jeu.</small></div></article>)}</div>}
        {view==='ledger'&&<><p>Les 100 derniers échanges confirmés. Résultat connu : <strong>{signed(knownNet.toString())}</strong>. Il inclut les traversées enregistrées et leurs remboursements ; les marchandises au coût inconnu sont exclues de ce total.</p><div className="merchant-table-wrap"><table><thead><tr><th>Date</th><th>Échange</th><th>Montant</th><th>Coût connu</th><th>Marge marchandises</th></tr></thead><tbody>{data.ledger.map(r=><tr key={r.id}><td>{new Date(r.created_at).toLocaleString('fr-FR')}</td><th>{({BUY:'Achat',SELL:'Vente',FEE:'Traversée',REFUND:'Remboursement'})[r.action]||r.action} · {r.quantity} {r.name}</th><td>{money(r.amount)}</td><td>{money(r.cost)}</td><td>{signed(r.profit)}</td></tr>)}</tbody></table></div></>}
      </>}
    </>}
  </main>;
}
