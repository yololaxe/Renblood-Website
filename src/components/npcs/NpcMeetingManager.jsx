import { FaUsers } from "react-icons/fa";

export default function NpcMeetingManager({ npc, players, updatingPlayerId, onToggle }) {
  return (
    <div className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 mt-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
        <FaUsers /> Joueurs ayant rencontré ce PNJ ({npc.met_by?.length || 0}/{players.length})
      </h3>
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {players.map(player => {
          const hasMet = npc.met_by?.includes(player.id);
          const isUpdating = updatingPlayerId === player.id;
          const playerName = player.pseudo_minecraft || `${player.name || ""} ${player.surname || ""}`.trim() || player.id;

          return (
            <label
              key={player.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-lg border transition ${
                hasMet
                  ? "bg-green-900/20 border-green-700/50"
                  : "bg-gray-800 border-gray-700 hover:border-gray-600"
              } ${isUpdating ? "opacity-50 cursor-wait" : "cursor-pointer"}`}
            >
              <span>
                <span className="block text-sm font-semibold text-white">{playerName}</span>
                <span className="block text-xs text-gray-500">{player.id}</span>
              </span>
              <input
                type="checkbox"
                checked={Boolean(hasMet)}
                disabled={Boolean(updatingPlayerId)}
                onChange={() => onToggle(player.id)}
                className="w-5 h-5 accent-green-600"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
