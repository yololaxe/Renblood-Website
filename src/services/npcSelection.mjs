// A person can retain several technical NPC IDs required by older quests.
// Group only explicit shared identities, never names alone.
function groups(npcs, includeArchived = false) {
  const result = new Map();
  for (const npc of npcs) {
    if (!npc?.npc_id || (npc.archived && !includeArchived)) continue;
    const key = npc.character_id ? `character:${npc.character_id}` : `npc:${npc.npc_id}`;
    const profiles = result.get(key) || [];
    profiles.push(npc);
    result.set(key, profiles);
  }
  const score = n => (n.archived ? -1000 : 0) + (n.type === 'QUEST' ? 100 : 0)
    + (n.quest_links?.length ? 20 : 0) + ((n.configured_enabled ?? n.enabled) ? 10 : 0);
  return [...result.values()].map(profiles => [...profiles].sort((a, b) =>
    score(b) - score(a) || a.npc_id.localeCompare(b.npc_id)));
}

export function npcOptions(npcs = []) {
  return groups(npcs).map(profiles => ({
    ...profiles[0], profile_ids: profiles.map(p => p.npc_id),
  }));
}

function combinedQuestLinks(profiles) {
  const links = new Map();
  for (const profile of profiles) for (const link of profile.quest_links || []) {
    const id = link.questId || link.quest_id;
    const key = id ? `quest:${id}` : JSON.stringify(link);
    const previous = links.get(key);
    const roles = [...new Set([...(previous?.roles || []), ...(link.roles || (link.role ? [link.role] : []))])];
    links.set(key, { ...link, ...previous, roles });
  }
  return [...links.values()];
}

// Display projection only. Admin mutations must select an original raw profile.
export function npcDirectory(npcs = [], { includeArchived = false } = {}) {
  return groups(npcs, includeArchived).map(profiles => ({
    ...profiles[0],
    profile_ids: profiles.map(p => p.npc_id),
    profile_types: [...new Set(profiles.map(p => p.type).filter(Boolean))],
    met_by: [...new Set(profiles.flatMap(p => p.met_by || []))],
    quest_links: combinedQuestLinks(profiles),
  }));
}

export const selectedNpcOption = (options, id) => options.find(n => n.npc_id === id || n.profile_ids?.includes(id));
