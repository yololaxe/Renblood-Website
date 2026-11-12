import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import RealmHeader from '../../components/RealmHeader';
import axios from '../../services/axiosInstance';
import './npc-shops.css';
const base = '/api/economy/v1/npc/shops';
const explanation = error => error.response?.data?.message || 'Le service est indisponible. Vos modifications restent dans le formulaire.';
export default function NpcShopsPage() {
  const [shops, setShops] = useState([]),
    [cities, setCities] = useState([]),
    [selected, setSelected] = useState(null),
    [draft, setDraft] = useState(null),
    [query, setQuery] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    let active = true;
    axios.get(base).then(({
      data
    }) => {
      if (active) {
        setShops(data.shops);
        setCities(data.cities);
      }
    }).catch(e => {
      if (active) setMessage(explanation(e));
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const leave = e => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', leave);
    return () => window.removeEventListener('beforeunload', leave);
  }, [dirty]);
  async function open(id) {
    if (busy) return;
    if (dirty && !window.confirm('Abandonner les modifications non enregistrées ?')) return;
    setBusy(true);
    setMessage('');
    try {
      const {
        data
      } = await axios.get(`${base}/${id}`);
      setSelected(id);
      setDraft(data);
      setDirty(false);
    } catch (e) {
      setMessage(explanation(e));
    } finally {
      setBusy(false);
    }
  }
  function change(key, value) {
    setDraft(d => ({
      ...d,
      [key]: value
    }));
    setDirty(true);
  }
  function article(index, key, value) {
    setDraft(d => ({
      ...d,
      offers: d.offers.map((row, i) => i === index ? {
        ...row,
        [key]: value
      } : row)
    }));
    setDirty(true);
  }
  async function save(event) {
    event.preventDefault();
    if (busy || !draft) return;
    setBusy(true);
    setMessage('');
    try {
      const {
        cities: ignoredCities,
        inventory,
        entity,
        ...payload
      } = draft;
      const {
        data
      } = await axios.post(`${base}/${selected}`, payload);
      setDraft(data);
      setShops(rows => rows.map(row => row.id === selected ? {
        ...row,
        name: data.name,
        city_id: data.city_id,
        active: data.active,
        revision: data.revision
      } : row));
      setDirty(false);
      setMessage('Boutique enregistrée. Les prochains échanges utilisent cette version.');
    } catch (e) {
      setMessage(explanation(e));
    } finally {
      setBusy(false);
    }
  }
  return <main className="realm-page npc-shops-page">
    <RealmHeader eyebrow="Intendance / Boutiques PNJ" title="Les comptoirs du royaume" description="Rattachez les marchands à une ville, préparez leurs articles et gardez la main sur leurs prix." />
    <nav className="npc-shops-links"><Link to="/admin/markets">Marchés et économie</Link><Link to="/admin/markets/calculated-prices">Cours des villes</Link><Link to="/admin/markets/reference-items">Références des objets</Link><Link to="/admin/markets/transactions">Échanges confirmés</Link></nav>
    <p className="npc-shops-note">Le placement et le skin se règlent aussi en jeu avec la baguette des boutiques ou <code>/ns shop create</code>. Maj + clic droit sur le marchand ouvre son atelier.</p>
    <div role="status" aria-live="polite" className="npc-shops-message">{message || (busy ? 'Chargement…' : dirty ? 'Modifications non enregistrées.' : '')}</div>
    <div className="npc-shops-layout"><aside>
      <label>Retrouver une boutique<input value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom ou ville" /></label>
      <div className="npc-shops-list">{shops.filter(s => `${s.name} ${cities.find(c => c.id === s.city_id)?.name || 'cours commun'}`.toLocaleLowerCase('fr').includes(query.toLocaleLowerCase('fr'))).map(s => <button key={s.id} type="button" disabled={busy} onClick={() => open(s.id)} aria-pressed={s.id === selected}><strong>{s.name}</strong><span>{cities.find(c => c.id === s.city_id)?.name || 'Cours commun'} · {s.active ? 'Ouverte' : 'Fermée'}</span></button>)}</div>
      {!shops.length && <p>Aucune boutique enregistrée. Placez votre premier marchand en jeu ; il apparaîtra ici.</p>}
    </aside><section aria-label="Configuration du marchand">
      {!draft ? <p className="npc-shops-empty">Choisissez un marchand pour consulter son catalogue.</p> : <form onSubmit={save}>
        <div className="npc-shops-fields"><label>Nom<input required maxLength={64} value={draft.name} onChange={e => change('name', e.target.value)} /></label><label>Ville<select value={draft.city_id || ''} onChange={e => change('city_id', e.target.value || null)}><option value="">Aucune ville · cours commun</option>{cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Texture du personnage<input required maxLength={256} value={draft.skin} onChange={e => change('skin', e.target.value)} /></label><label className="npc-check"><input type="checkbox" checked={draft.active} onChange={e => change('active', e.target.checked)} />Boutique ouverte</label></div>
        <div className="npc-shops-catalogue-title"><h2>Le catalogue <small>{draft.offers.length} / 54 articles</small></h2><button type="button" onClick={() => {
              setDraft(d => ({
                ...d,
                offers: d.offers.map(r => ({
                  ...r,
                  automatic: true
                }))
              }));
              setDirty(true);
            }}>Tout passer en prix automatiques</button></div>
        <p className="npc-shops-note">Les prix sont exprimés en fer par objet ; le lot règle la quantité proposée au joueur. Le rachat automatique vaut 80 % du prix de vente. Une ville sans cours calculé suspend l’article automatique.</p>
        <div className="npc-articles">{draft.offers.map((row, index) => <article key={row.id} className="npc-article">
          <div className="npc-article-heading"><h3>{row.name}</h3><span>{row.item_id}</span><span className="npc-trend">{row.trend === 'UP' ? '↗ Au-dessus de la référence' : row.trend === 'DOWN' ? '↘ Sous la référence' : '→ Stable'}</span></div>
          {row.automatic && !row.available && <p className="npc-shops-note">Cours indisponible : préparez la référence ou le cours de la ville, ou choisissez un prix manuel.</p>}
          <div className="npc-shops-fields"><label className="npc-check"><input type="checkbox" checked={row.automatic} onChange={e => article(index, 'automatic', e.target.checked)} />Prix automatiques</label><label className="npc-check"><input type="checkbox" checked={row.buy_enabled} onChange={e => article(index, 'buy_enabled', e.target.checked)} />Vendre aux joueurs</label><label className="npc-check"><input type="checkbox" checked={row.sell_enabled} onChange={e => article(index, 'sell_enabled', e.target.checked)} />Racheter aux joueurs</label><label>Objets par lot<input type="number" min="1" max="64" required value={row.lot} onChange={e => article(index, 'lot', Number(e.target.value))} /></label>
          <label>Vente / fer<input inputMode="numeric" pattern="[0-9]+" required disabled={row.automatic} value={row.buy_price} onChange={e => article(index, 'buy_price', e.target.value)} /></label><label>Rachat / fer<input inputMode="numeric" pattern="[0-9]+" required disabled={row.automatic} value={row.sell_price} onChange={e => article(index, 'sell_price', e.target.value)} /></label>
          <label className="npc-check"><input type="checkbox" checked={row.stock === null} onChange={e => article(index, 'stock', e.target.checked ? null : 0)} />Stock illimité</label>{row.stock !== null && <label>Stock disponible<input type="number" required min="0" max="1000000" value={row.stock} onChange={e => article(index, 'stock', Number(e.target.value))} /></label>}
          <label>Recharge en secondes · 0 = arrêt<input type="number" required min="0" max="86400" value={row.restock_seconds} onChange={e => article(index, 'restock_seconds', Number(e.target.value))} /></label><label>Plafond de réapprovisionnement<input type="number" required min="0" max="1000000" value={row.restock_target} onChange={e => article(index, 'restock_target', Number(e.target.value))} /></label></div>
          <button className="npc-remove" type="button" onClick={() => {
                setDraft(d => ({
                  ...d,
                  offers: d.offers.filter((_, i) => i !== index)
                }));
                setDirty(true);
              }}>Retirer du catalogue</button>
        </article>)}</div>
        <p className="npc-shops-note">Ajoutez les objets depuis l’inventaire ou la recherche en jeu. Les rachats utilisent la caisse de ce marchand ; le mode illimité se configure explicitement dans l’économie.</p>
        <div className="npc-shops-save"><span>Version {draft.revision} · {dirty ? 'brouillon local' : 'enregistrée'}</span><button type="submit" disabled={busy || !dirty}>{busy ? 'Enregistrement…' : 'Enregistrer la boutique'}</button></div>
      </form>}
    </section></div>
  </main>;
}
