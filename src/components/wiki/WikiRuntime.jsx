import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import axios from '../../services/axiosInstance';
import { applyWikiPackage, registry, builtInWikiPackage } from '../../services/wiki.mjs';
import { validateWikiSnapshot } from '../../services/wikiSnapshot.mjs';
import { createWikiSession } from '../../services/wikiSession.mjs';
const session = createWikiSession({
  initial: builtInWikiPackage,
  apply: applyWikiPackage,
  validate: value => validateWikiSnapshot(value, builtInWikiPackage),
  getVersion: () => registry.version,
  loadPublic: async () => {
    const response = await fetch(`${String(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api/wiki/public/`, {
      signal: AbortSignal.timeout(10000),
      cache: 'no-cache'
    });
    if (!response.ok) throw Error('Wiki indisponible');
    return response.json();
  },
  loadPreview: async id => (await axios.get(`/api/wiki/admin/drafts/${encodeURIComponent(id)}/preview/`)).data,
  storage: () => sessionStorage
});
export const refreshWiki = () => session.refresh();
export const beginWikiPreview = (value, id) => session.begin(value, id);
export const endWikiPreview = () => session.end();
export default function WikiRuntime({
  children
}) {
  const {
    previewId,
    warning
  } = useSyncExternalStore(session.subscribe, session.snapshot, session.snapshot);
  const {
    userRank,
    authStatus
  } = useUser();
  const [message, setMessage] = useState('');
  useEffect(() => {
    session.refresh().catch(() => {});
  }, []);
  useEffect(() => {
    if (authStatus === 'loading') return;
    if (userRank !== 'Admin') {
      session.cancelResume();
      if (session.snapshot().previewId) session.end({
        reload: false
      }).catch(() => {});
      return;
    }
    let active = true;
    session.resume(() => active);
    return () => {
      active = false;
      session.cancelResume();
    };
  }, [userRank, authStatus]);
  return <>{previewId && userRank === 'Admin' && <aside className="wiki-preview-banner" role="status"><span>Aperçu privé du brouillon · aucune publication</span><Link to="/admin/wiki">Retour à l’atelier</Link><button onClick={() => session.end().catch(() => setMessage('La dernière version publique connue est affichée. Impossible de la resynchroniser pour le moment.'))}>Quitter l’aperçu ×</button></aside>}{(warning || message) && <p className="wiki-runtime-message" role="status">{warning || message}</p>}{children}</>;
}
