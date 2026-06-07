import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaMapMarkerAlt, FaSearch, FaScroll, FaTimes, FaUser, FaWrench } from "react-icons/fa";
import { getNpcsList, getPlayerQuests, getPlayers, getQuestsList } from "../services/api";
import { useUser } from "../context/UserContext";
import { staticContentResults } from "../data/globalSearchIndex";

const roleHierarchy = {
  Esclave: 0,
  Etranger: 1,
  Villageois: 2,
  Citoyen: 3,
  "Citoyen Libre": 4,
  Patricien: 5,
  Noble: 6,
  Seigneur: 7,
  Vicompte: 8,
  Compte: 9,
  Marquis: 10,
  Moderateur: 11,
  Admin: 12,
};

const publicPages = [
  { label: "Accueil", description: "Retour à l'accueil", path: "/", type: "Page" },
  { label: "Informations", description: "Histoire et informations du royaume", path: "/histoire", type: "Page" },
  { label: "Joueurs", description: "Citoyens de Renblood", path: "/players", type: "Page" },
  { label: "Carte", description: "Carte du royaume", path: "/map", type: "Page" },
  { label: "PNJ", description: "Personnages rencontrés", path: "/histoires/npcs", type: "Page" },
  { label: "Métiers", description: "Découvrir les métiers", path: "/histoires/metiers", type: "Page" },
  { label: "Guildes", description: "Guildes du royaume", path: "/histoires/guildes", type: "Page" },
  { label: "Lois", description: "Lois de Renblood", path: "/histoires/lois", type: "Page" },
  { label: "Livres", description: "Bibliothèque", path: "/histoires/livres", type: "Page" },
];

const authenticatedPages = [
  { label: "Mon personnage", description: "Profil et statistiques", path: "/character", type: "Page", minRole: "Esclave" },
  { label: "Mes talents", description: "Arbre des talents", path: "/talents", type: "Page", minRole: "Esclave" },
  { label: "Sessions", description: "Sessions et futurs", path: "/sessions", type: "Page", minRole: "Esclave" },
  { label: "Quêtes", description: "Carte des quêtes", path: "/quests", type: "Page", minRole: "Etranger" },
];

const adminPages = [
  { label: "Administration", description: "Tableau de bord administrateur", path: "/admin-dashboard", type: "Admin" },
  { label: "Gérer les joueurs", description: "Administration des joueurs", path: "/players-admin", type: "Admin" },
  { label: "Créer un joueur", description: "Ajouter un nouveau joueur", path: "/create-player", type: "Admin" },
  { label: "Gérer les quêtes", description: "Éditeur de quêtes", path: "/admin/quests", type: "Admin" },
  { label: "Rapport monétaire", description: "Évolution de l'économie", path: "/reporting/money", type: "Admin" },
];

const normalize = (value) => String(value || "")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase("fr");

const ResultIcon = ({ type }) => {
  if (type === "Joueur") return <FaUser />;
  if (type === "PNJ") return <FaMapMarkerAlt />;
  if (type === "Quête") return <FaScroll />;
  if (type === "Admin") return <FaWrench />;
  return <FaBook />;
};

export default function GlobalSearch({ open, onClose }) {
  const { userId, userRank } = useUser();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [dynamicResults, setDynamicResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = userRank === "Admin";

  useEffect(() => {
    if (!open) return;
    setQuery("");
    window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    const loadResults = async () => {
      setLoading(true);
      try {
        const canViewQuests = userId && roleHierarchy[userRank] >= roleHierarchy.Etranger;
        const [playersResult, npcsResult, questsResult, playerQuestsResult] = await Promise.allSettled([
          getPlayers(userRank),
          getNpcsList(),
          canViewQuests ? getQuestsList() : Promise.resolve([]),
          canViewQuests && !isAdmin ? getPlayerQuests(userId) : Promise.resolve([]),
        ]);

        if (!active) return;

        const players = playersResult.status === "fulfilled" ? playersResult.value : [];
        const npcs = npcsResult.status === "fulfilled" ? npcsResult.value : [];
        const quests = questsResult.status === "fulfilled" ? questsResult.value : [];
        const playerQuests = playerQuestsResult.status === "fulfilled" ? playerQuestsResult.value : [];

        const playerResults = (players || []).map(player => ({
          label: player.pseudo_minecraft || `${player.name || ""} ${player.surname || ""}`.trim(),
          description: `${player.rank || "Joueur"}${player.name ? ` · ${player.name} ${player.surname || ""}` : ""}`,
          path: `${isAdmin ? "/players-admin" : "/players"}?search=${encodeURIComponent(player.pseudo_minecraft || player.name || "")}`,
          type: "Joueur",
        }));

        const visibleNpcs = isAdmin
          ? (npcs || [])
          : (npcs || []).filter(npc => npc.met_by?.includes(userId));
        const npcResults = visibleNpcs.map(npc => ({
          label: npc.name,
          description: npc.region || "Lieu inconnu",
          path: `/histoires/npcs?search=${encodeURIComponent(npc.name)}`,
          type: "PNJ",
        }));

        const statusByQuestId = Object.fromEntries((playerQuests || []).map(state => [state.quest_id, state.status]));
        const visibleQuests = isAdmin
          ? (quests || [])
          : (quests || []).filter(quest =>
              !quest.parentId ||
              statusByQuestId[quest.questId] ||
              statusByQuestId[quest.parentId] === "COMPLETED"
            );
        const questResults = visibleQuests.map(quest => ({
          label: quest.name,
          description: `${quest.category || "Quête"} · ${quest.npc || "PNJ inconnu"}`,
          path: isAdmin ? "/admin/quests" : "/quests",
          type: "Quête",
        }));

        setDynamicResults([...playerResults, ...npcResults, ...questResults]);
      } catch (error) {
        console.error("Erreur chargement recherche globale:", error);
        if (active) setDynamicResults([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadResults();
    return () => {
      active = false;
    };
  }, [isAdmin, open, userId, userRank]);

  const results = useMemo(() => {
    const allowedAuthenticatedPages = userId
      ? authenticatedPages.filter(page => roleHierarchy[userRank] >= roleHierarchy[page.minRole])
      : [];
    const pages = [...publicPages, ...allowedAuthenticatedPages, ...(isAdmin ? adminPages : [])];
    const allResults = [...pages, ...staticContentResults, ...dynamicResults];
    const search = normalize(query.trim());
    if (!search) return allResults.slice(0, 12);
    return allResults.filter(result =>
      normalize(`${result.label} ${result.description} ${result.type}`).includes(search)
    ).slice(0, 20);
  }, [dynamicResults, isAdmin, query, userId, userRank]);

  const selectResult = (result) => {
    onClose();
    navigate(result.path);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm p-4 pt-20" onClick={onClose}>
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-gray-600 bg-gray-800 shadow-2xl" onClick={event => event.stopPropagation()}>
        <div className="flex items-center gap-3 border-b border-gray-700 bg-gray-900 px-4">
          <FaSearch className="text-gray-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key === "Escape") onClose();
              if (event.key === "Enter" && results[0]) selectResult(results[0]);
            }}
            placeholder="Rechercher un joueur, PNJ, famille, métier, loi..."
            className="flex-1 bg-transparent py-4 text-white outline-none placeholder:text-gray-500"
          />
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white"><FaTimes /></button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto p-2">
          {loading && dynamicResults.length === 0 ? (
            <p className="p-6 text-center text-gray-400">Chargement de la recherche...</p>
          ) : results.length === 0 ? (
            <p className="p-6 text-center text-gray-400">Aucun résultat autorisé.</p>
          ) : (
            results.map((result, index) => (
              <button
                key={`${result.type}-${result.label}-${index}`}
                onClick={() => selectResult(result)}
                className="flex w-full items-center gap-4 rounded-xl p-3 text-left hover:bg-gray-700"
              >
                <span className={`rounded-lg p-3 ${
                  result.type === "Admin" ? "bg-yellow-900/40 text-yellow-400" :
                  result.type === "Joueur" ? "bg-blue-900/40 text-blue-400" :
                  result.type === "PNJ" ? "bg-purple-900/40 text-purple-400" :
                  result.type === "Quête" ? "bg-green-900/40 text-green-400" :
                  "bg-gray-700 text-gray-300"
                }`}>
                  <ResultIcon type={result.type} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-white">{result.label}</span>
                  <span className="block truncate text-xs text-gray-400">{result.description}</span>
                </span>
                <span className="rounded-full border border-gray-600 px-2 py-1 text-[10px] uppercase text-gray-400">{result.type}</span>
              </button>
            ))
          )}
        </div>
        <div className="border-t border-gray-700 px-4 py-2 text-xs text-gray-500">
          Entrée pour ouvrir le premier résultat · Échap pour fermer · Les résultats respectent vos permissions
        </div>
      </div>
    </div>
  );
}
