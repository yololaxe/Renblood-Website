const choiceLabel = value => value === 'accept' ? 'Accepter la proposition' : value === 'keep' ? 'Conserver la valeur actuelle' : 'À examiner';
export function ReviewRecovery({
  recovery,
  onResume,
  onDiscard,
  disabled
}) {
  if (!recovery) return null;
  return <aside className="wiki-review-recovery" role="status"><h3>Une revue est conservée sur cet appareil</h3><p>{recovery.changedRevision ? 'La revue partagée a changé depuis votre dernière visite. Comparez vos décisions avant de les reprendre.' : 'Vos dernières décisions n’avaient pas encore été envoyées à l’équipe.'}</p><p>{recovery.conflicts.length ? `${recovery.conflicts.length} conflit(s) de décision à examiner. Aucun conflit ne sera enregistré automatiquement.` : 'Les décisions compatibles peuvent être reprises sans modifier la version partagée.'}</p><div className="wiki-actions"><button disabled={disabled} className="wiki-action" onClick={onResume}>{recovery.changedRevision ? 'Comparer et reprendre ma revue' : 'Reprendre ma revue locale'}</button><button disabled={disabled} className="wiki-text-link" onClick={onDiscard}>Utiliser la revue partagée</button></div></aside>;
}
export function ReviewConflict({
  conflict,
  onResolve
}) {
  if (!conflict) return null;
  return <div className="wiki-review-conflict"><p>Ce choix diffère de la revue partagée.</p><div className="wiki-actions"><button type="button" onClick={() => onResolve(conflict.shared)}>Garder le choix partagé : {choiceLabel(conflict.shared)}</button><button type="button" onClick={() => onResolve(conflict.local)}>Reprendre mon choix : {choiceLabel(conflict.local)}</button></div></div>;
}
