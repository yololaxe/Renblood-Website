import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../../services/axiosInstance';
import { registry } from '../../../services/wiki.mjs';
export default function WikiWidget() {
  const [state, setState] = useState(null),
    [error, setError] = useState('');
  const load = () => {
    setError('');
    axios.get('/api/wiki/admin/').then(({
      data
    }) => setState(data)).catch(() => setError('L’atelier est momentanément inaccessible.'));
  };
  useEffect(load, []);
  return <div className="wiki-admin-widget"><p>Relire les imports, suivre les informations à compléter et publier une version approuvée du lore.</p><div className="wiki-widget-counts"><span><strong>{registry.people.length}</strong> personnages</span><span><strong>{state ? state.drafts.filter(draft => draft.status === 'DRAFT').length : '—'}</strong> brouillons récents</span></div>{state && <p className="wiki-muted">Version : {state.current}</p>}{error && <p role="status">{error} <button onClick={load}>Réessayer</button></p>}<Link className="wiki-action" to="/admin/wiki">Ouvrir l’atelier du wiki ↗</Link><Link className="wiki-text-link" to="/histoires/chronologie">Consulter la chronologie ↗</Link></div>;
}
