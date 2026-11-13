// A person can retain several technical NPC IDs required by older quests.
// Select a single representative without rewriting any saved quest reference.
export function npcOptions(npcs = []) {
  const groups = new Map();
  const score = n => (n.type === 'QUEST' ? 100 : 0) + (n.quest_links?.length ? 20 : 0) + (n.configured_enabled ?? n.enabled ? 10 : 0);
  for (const npc of npcs) {
    if (!npc?.npc_id || npc.archived) continue;
    const key = npc.character_id ? `character:${npc.character_id}` : `npc:${npc.npc_id}`;
    const group = groups.get(key) || [];
    group.push(npc); groups.set(key, group);
  }
  return [...groups.values()].map(profiles => {
    const ranked = [...profiles].sort((a, b) => score(b) - score(a) || a.npc_id.localeCompare(b.npc_id));
    return { ...ranked[0], profile_ids: profiles.map(p => p.npc_id) };
  });
}

export const selectedNpcOption = (options, id) => options.find(n => n.npc_id === id || n.profile_ids?.includes(id));
