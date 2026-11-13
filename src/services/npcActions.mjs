export function deletionTarget(npc) {
  const id = typeof npc?.npc_id === 'string' ? npc.npc_id.trim() : '';
  if (!id) throw new Error('Aucun PNJ sélectionné. Recharge la liste avant de réessayer.');
  return { id, name: npc.name || id, linkedQuests: npc.quest_links?.length || 0 };
}

export function npcError(error, fallback) {
  return error?.response?.data?.error || error?.response?.data?.message || error?.message || fallback;
}
