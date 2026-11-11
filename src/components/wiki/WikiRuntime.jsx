import { Fragment, useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import axios from '../../services/axiosInstance';
import { applyWikiPackage, getWikiRevision, subscribeWiki, registry, builtInWikiPackage } from '../../services/wiki.mjs';
let publicPackage = null,
  pending = null,
  preview = null;
const PREVIEW_KEY = 'renblood:wiki:preview';
export async function refreshWiki() {
  if (!pending) pending = fetch(`${String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wiki/public/`, {
    signal: AbortSignal.timeout(10000),
    cache: 'no-cache'
  }).then(response => {
    if (!response.ok) throw Error('Wiki indisponible');
    return response.json();
  }).then(value => {
    publicPackage = value;
    if (!preview && value.registry.version !== registry.version) applyWikiPackage(value);
    return value;
  }).finally(() => {
    pending = null;
  });
  return pending;
}
export function beginWikiPreview(value, id) {
  preview = id;
  sessionStorage.setItem(PREVIEW_KEY, id);
  applyWikiPackage(value);
}
export async function endWikiPreview() {
  preview = null;
  sessionStorage.removeItem(PREVIEW_KEY);
  applyWikiPackage(publicPackage || builtInWikiPackage);
  await refreshWiki();
}
export default function WikiRuntime({
  children
}) {
  const revision = useSyncExternalStore(subscribeWiki, getWikiRevision, getWikiRevision);
  const {
    userRank
  } = useUser();
  const [message, setMessage] = useState('');
  useEffect(() => {
    refreshWiki().catch(() => {});
  }, []);
  useEffect(() => {
    if (userRank !== 'Admin') {
      if (preview) {
        preview = null;
        applyWikiPackage(publicPackage || builtInWikiPackage);
      }
      return;
    }
    let active = true;
    const id = sessionStorage.getItem(PREVIEW_KEY);
    if (id && preview !== id) axios.get(`/api/wiki/admin/drafts/${encodeURIComponent(id)}/preview/`).then(({
      data
    }) => {
      if (active) beginWikiPreview(data, id);
    }).catch(() => {
      if (active) {
        sessionStorage.removeItem(PREVIEW_KEY);
        setMessage('L’aperçu a expiré. La version publique reste affichée.');
      }
    });
    return () => {
      active = false;
    };
  }, [userRank]);
  return <>{preview && userRank === 'Admin' && <aside className="wiki-preview-banner" role="status"><span>Aperçu privé du brouillon · aucune publication</span><Link to="/admin/wiki">Retour à l’atelier</Link><button onClick={() => endWikiPreview().catch(() => setMessage('Impossible de recharger la version publique. Réessayez.'))}>Quitter l’aperçu ×</button></aside>}{message && <p className="wiki-runtime-message" role="status">{message}</p>}<Fragment key={revision}>{children}</Fragment></>;
}
