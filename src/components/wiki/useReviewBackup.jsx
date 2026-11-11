import { useEffect, useRef, useState } from 'react';
import { createReviewBackupStore, recoverReview, sameDecisions } from '../../services/wikiReview.mjs';
const store = createReviewBackupStore(() => localStorage);
export default function useReviewBackup({
  draft,
  decisions,
  conflicts,
  owner,
  scope,
  pending
}) {
  const [notice, setNotice] = useState('');
  const latest = useRef(null);
  latest.current = {
    draft,
    decisions,
    conflicts,
    owner,
    scope,
    pending
  };
  const persist = current => {
    if (!current?.draft || current.pending || !current.owner) return;
    try {
      if (current.draft.status !== 'DRAFT' || sameDecisions(current.decisions, current.draft.decisions) && !current.conflicts.length) store.remove(current.draft, current.owner, current.scope);else store.write(current.draft, current.decisions, current.conflicts, current.owner, current.scope);
      setNotice('');
    } catch {
      setNotice('La copie locale est indisponible. Utilisez « Enregistrer les décisions » avant de quitter.');
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => persist(latest.current), 600);
    return () => clearTimeout(timer);
  }, [draft, decisions, conflicts, owner, scope, pending]);
  useEffect(() => {
    const save = () => persist(latest.current);
    window.addEventListener('pagehide', save);
    return () => {
      window.removeEventListener('pagehide', save);
      save();
    };
  }, []);
  function restore(value) {
    try {
      const saved = store.read(value, owner, scope);
      return saved && value.status === 'DRAFT' ? recoverReview(saved, value) : null;
    } catch {
      setNotice('La copie locale est indisponible ; la revue partagée reste accessible.');
      return null;
    }
  }
  function discard(value = draft) {
    try {
      store.remove(value, owner, scope);
    } catch {}
  }
  return {
    notice,
    persist: () => persist(latest.current),
    restore,
    discard
  };
}
