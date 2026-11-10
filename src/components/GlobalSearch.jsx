import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaMapMarkerAlt, FaSearch, FaScroll, FaTimes, FaUser, FaWrench } from "react-icons/fa";
import { getNpcsList, getPlayerQuests, getPlayers, getQuestsList } from "../services/api";
import { useUser } from "../context/UserContext";
import { staticContentResults } from "../data/globalSearchIndex";
import "./global-search.css";

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
  { label: "Registre des personnages", description: "Personnages du royaume, familles et liens", path: "/histoires/personnages", type: "Personnage", keywords: "lore wiki généalogie conjoint épouse époux" },
  { label: "Accueil", description: "Retour à l'accueil", path: "/", type: "Page", keywords: "home début rejoindre discord" },
  { label: "Guide", description: "Histoire, règles et informations du royaume", path: "/histoire", type: "Page", keywords: "information aide comment jouer débuter" },
  { label: "Joueurs", description: "Citoyens de Renblood", path: "/players", type: "Joueur", keywords: "personnage citoyen liste" },
  { label: "Carte", description: "Carte du royaume", path: "/map", type: "Lieu", keywords: "ville comté coordonnées chemin map" },
  { label: "PNJ", description: "Personnages rencontrés", path: "/histoires/npcs", type: "PNJ", keywords: "parler interlocuteur npc personnage" },
  { label: "Métiers", description: "Découvrir les métiers", path: "/histoires/metiers", type: "Métier", keywords: "travail xp argent gagner produire économie" },
  { label: "Guildes", description: "Guildes du royaume", path: "/histoires/guildes", type: "Page", keywords: "organisation faction rejoindre" },
  { label: "Lois", description: "Lois de Renblood", path: "/histoires/lois", type: "Règle", keywords: "règlement sanction amende prison crime justice interdit" },
  { label: "Livres", description: "Bibliothèque et chroniques", path: "/histoires/livres", type: "Page", keywords: "lore histoire archive chronique" },
  { label: "Journal de Shaleton", description: "Nouvelles, événements et patch notes", path: "/histoires/journal", type: "Journal", keywords: "actualité annonces nouveauté patch note changement" },
  { label: "Prix des marchés", description: "Prix publics pratiqués dans les villes", path: "/market-prices", type: "Règle", keywords: "argent économie marché prix vendre acheter commerce" },
];

const authenticatedPages = [
  { label: "Suivi des échanges", description: "Outil de l’équipe : rechercher un reçu et suivre un incident", path: "/support/economie", type: "Support", minRole: "Moderateur" },
  { label: "Mon personnage", description: "Profil, statistiques, traits et licences", path: "/character", type: "Joueur", minRole: "Esclave", keywords: "stats fiche argent inventaire discord licence action trait" },
  { label: "Mes talents", description: "Arbre des talents", path: "/talents", type: "Page", minRole: "Esclave", keywords: "compétence build progression" },
  { label: "Sessions", description: "Sessions et futurs", path: "/sessions", type: "Page", minRole: "Esclave", keywords: "préparer session futur rp" },
  { label: "Quêtes", description: "Carte des quêtes", path: "/quests", type: "Quête", minRole: "Etranger", keywords: "objectif mission progression récompense xp argent" },
  { label: "Mes comptoirs", description: "Comptoirs marchands et historique", path: "/account/merchant-counters", type: "Règle", minRole: "Esclave", keywords: "marché commerce vendre retrait transaction économie" },
];

const adminPages = [
  { label: "Administration", description: "Tableau de bord administrateur", path: "/admin-dashboard", type: "Admin" },
  { label: "Gérer les joueurs", description: "Administration des joueurs", path: "/players-admin", type: "Admin" },
  { label: "Créer un joueur", description: "Ajouter un nouveau joueur", path: "/create-player", type: "Admin" },
  { label: "Gérer les quêtes", description: "Éditeur de quêtes", path: "/admin/quests", type: "Admin" },
  { label: "Rapport monétaire", description: "Évolution de l'économie", path: "/reporting/money", type: "Admin" },
  { label: "Gestion des marchés", description: "Administration des prix et comptoirs", path: "/admin/markets", type: "Admin" },
];

const shortcutResults = [
  {
    label: "Comment gagner de l'argent ?",
    description: "Métiers, quêtes, marchés et économie",
    path: "/histoires/metiers",
    type: "Règle",
    keywords: "argent gagner riche économie travail métier marché vendre quete récompense",
  },
  {
    label: "Préparer ma session",
    description: "Quêtes, carte, PNJ, métiers et lois",
    path: "/histoire",
    type: "Page",
    keywords: "session préparer jouer objectif où aller quoi faire",
  },
  {
    label: "Sanctions, amendes et prison",
    description: "Consulter les lois et les règles importantes",
    path: "/histoires/lois",
    type: "Règle",
    keywords: "sanction amende prison crime justice interdit punition règle loi",
  },
  {
    label: "À qui parler ?",
    description: "PNJ, guildes, autorités et interlocuteurs utiles",
    path: "/histoires/npcs",
    type: "PNJ",
    keywords: "parler pnj npc chef guilde autorité quête interlocuteur",
  },
];

const normalize = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr");

const ResultIcon = ({ type }) => {
  if (["Joueur", "Personnage"].includes(type)) return <FaUser />;
  if (type === "PNJ") return <FaMapMarkerAlt />;
  if (type === "Quête") return <FaScroll />;
  if (type === "Admin") return <FaWrench />;
  return <FaBook />;
};

export default function GlobalSearch({ open, onClose }) {
  const { userId, userRank } = useUser();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const searchId = useId();
  const [selected, setSelected] = useState(0);
  const [query, setQuery] = useState("");
  const [dynamicResults, setDynamicResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const isAdmin = userRank === "Admin";
  const searchCatalog = open && Boolean(userId) && query.trim().length >= 2;

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    setQuery("");
    setSelected(0);
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => inputRef.current?.focus());
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!searchCatalog) {
      setLoading(false);
      setDynamicResults([]);
      return undefined;
    }
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

        const playerResults = (players || []).map((player) => ({
          label: player.pseudo_minecraft || `${player.name || ""} ${player.surname || ""}`.trim(),
          description: `${player.rank || "Joueur"}${player.name ? ` · ${player.name} ${player.surname || ""}` : ""}`,
          path: `${isAdmin ? "/players-admin" : "/players"}?search=${encodeURIComponent(player.pseudo_minecraft || player.name || "")}`,
          type: "Joueur",
          keywords: "citoyen personnage joueur profil",
        }));

        const visibleNpcs = isAdmin ? npcs || [] : (npcs || []).filter((npc) => npc.met_by?.includes(userId));
        const npcResults = visibleNpcs.map((npc) => ({
          label: npc.name,
          description: npc.region || "Lieu inconnu",
          path: `/histoires/npcs?search=${encodeURIComponent(npc.name)}`,
          type: "PNJ",
          keywords: `parler pnj npc ${npc.region || ""}`,
        }));

        const statusByQuestId = Object.fromEntries((playerQuests || []).map((state) => [state.quest_id, state.status]));
        const visibleQuests = isAdmin
          ? quests || []
          : (quests || []).filter(
              (quest) =>
                !quest.parentId ||
                statusByQuestId[quest.questId] ||
                statusByQuestId[quest.parentId] === "COMPLETED"
            );
        const questResults = visibleQuests.map((quest) => ({
          label: quest.name,
          description: `${quest.category || "Quête"} · ${quest.startNpcName || quest.startNpcId || "PNJ inconnu"}`,
          path: isAdmin ? "/admin/quests" : "/quests",
          type: "Quête",
          keywords: `mission objectif récompense xp argent ${quest.category || ""}`,
        }));

        setDynamicResults([...playerResults, ...npcResults, ...questResults]);
      } catch (error) {
        console.error("Erreur chargement recherche globale:", error);
        if (active) setDynamicResults([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    const delay = window.setTimeout(loadResults, 250);
    return () => {
      active = false;
      window.clearTimeout(delay);
    };
  }, [isAdmin, searchCatalog, userId, userRank]);

  const results = useMemo(() => {
    const allowedAuthenticatedPages = userId
      ? authenticatedPages.filter((page) => roleHierarchy[userRank] >= roleHierarchy[page.minRole])
      : [];
    const pages = [...(userId ? [{ label: "Mon profil", description: "Identité RP et comptes associés", path: "/account/profile", type: "Page" }] : []), ...publicPages, ...allowedAuthenticatedPages, ...(isAdmin ? adminPages : [])];
    const allResults = [...shortcutResults, ...pages, ...staticContentResults, ...dynamicResults];
    const search = normalize(query.trim());
    if (!search) return allResults.slice(0, 12);
    const relevance = result => {
      const label = normalize(result.label);
      return label === search ? 3 : label.startsWith(search) ? 2 : label.includes(search) ? 1 : 0;
    };
    return allResults
      .filter((result) =>
        normalize(`${result.label} ${result.description} ${result.type} ${result.keywords || ""}`).includes(search)
      )
      .sort((left, right) => relevance(right) - relevance(left))
      .slice(0, 20);
  }, [dynamicResults, isAdmin, query, userId, userRank]);

  const selectResult = (result) => {
    onClose();
    navigate(result.path);
  };

  const activeIndex = Math.min(selected, Math.max(0, results.length - 1));
  useEffect(() => {
    document.getElementById(`${searchId}-result-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, searchId, results]);

  function dialogKeys(event) {
    if (event.key === "Escape") { event.preventDefault(); onClose(); }
    if (event.key === "Tab") {
      const focusable = [...dialogRef.current.querySelectorAll('input, button:not([tabindex="-1"])')];
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  }

  if (!open) return null;
  return <div className="kingdom-search-backdrop" onClick={onClose}>
    <section className="kingdom-search" role="dialog" aria-modal="true" aria-labelledby={`${searchId}-title`}
      ref={dialogRef} onClick={event => event.stopPropagation()} onKeyDown={dialogKeys}>
      <div className="kingdom-search-heading">
        <h2 id={`${searchId}-title`}>Rechercher dans le royaume</h2>
        <button type="button" className="kingdom-search-close" onClick={onClose} aria-label="Fermer la recherche"><FaTimes /></button>
      </div>
      <div className="kingdom-search-field">
        <FaSearch aria-hidden="true" />
        <input ref={inputRef} value={query} type="text" role="combobox" aria-label="Votre recherche"
          aria-autocomplete="list" aria-expanded="true" aria-controls={`${searchId}-results`}
          aria-activedescendant={results.length ? `${searchId}-result-${activeIndex}` : undefined}
          autoComplete="off" spellCheck={false} placeholder="Que cherchez-vous ?"
          onChange={event => { setQuery(event.target.value); setSelected(0); }}
          onKeyDown={event => {
            if (["ArrowDown", "ArrowUp"].includes(event.key)) {
              event.preventDefault();
              setSelected(current => results.length ? (Math.min(current, results.length - 1) + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length : 0);
            }
            if (event.key === "Enter" && results[activeIndex]) { event.preventDefault(); selectResult(results[activeIndex]); }
          }} />
      </div>
      <div className="kingdom-search-summary" role="status" aria-live="polite">
        <span>{query.trim() ? `${results.length}${results.length === 20 ? "+" : ""} résultat${results.length === 1 ? "" : "s"}` : "Quelques pistes pour commencer"}</span>
        {loading && <span className="kingdom-search-loading">Recherche dans le registre…</span>}
      </div>
      <div className="kingdom-search-results" id={`${searchId}-results`} role="listbox" aria-label="Résultats">
        {results.map((result, index) => <button key={`${result.type}-${result.path}-${index}`} type="button"
          id={`${searchId}-result-${index}`} role="option" aria-selected={index === activeIndex} tabIndex={-1}
          className={`kingdom-search-result${index === activeIndex ? " is-selected" : ""}`}
          onMouseDown={event => event.preventDefault()} onClick={() => selectResult(result)}>
          <span className="kingdom-search-icon" aria-hidden="true"><ResultIcon type={result.type} /></span>
          <span className="kingdom-search-copy"><strong>{result.label}</strong><small>{result.description}</small></span>
          <span className="kingdom-search-type">{result.type}</span><span className="kingdom-search-arrow" aria-hidden="true">↗</span>
        </button>)}
      </div>
      {results.length === 0 && <p className="kingdom-search-empty"><strong>Aucune piste pour « {query} ».</strong>Essayez le nom d’un lieu, d’un joueur, d’un métier ou d’une règle.</p>}
      <footer className="kingdom-search-footer">
        <span className="kingdom-search-keyboard"><kbd>↑ ↓</kbd> Parcourir</span><span className="kingdom-search-keyboard"><kbd>Entrée</kbd> Ouvrir</span><span><kbd>Échap</kbd> Fermer</span>
      </footer>
    </section>
  </div>;
}
