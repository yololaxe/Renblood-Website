import CharacterPortrait from "../components/character/CharacterPortrait";
import { useUser } from "../context/UserContext";
import RealmHeader from "../components/RealmHeader";
// src/pages/Character.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { listenToAuthChanges } from "../data/firebaseConfig";
import {
  getPlayerFullProfile,
  initializeStatsBonus,
  getPlayerDiscord,
  getDiscordLink,
  unlinkDiscord,
  getOnlineDiscordMembers,
  managePlayerLicences,
} from "../services/api";
import { MoneyDisplay } from "../components/MoneyDisplay";
import ToolTip from "../components/Tooltip";
import Toast from "../components/Toast";
import LoadingButton from "../components/LoadingButton";
import StatCard from "../components/character/StatCard";
import {
  FaSync,
  FaUserCircle,
  FaDiscord,
  FaHeart,
  FaFistRaised,
  FaBolt,
  FaBullseye,
  FaShieldAlt,
  FaHeartbeat,
  FaPalette,
  FaBoxOpen,
  FaMagic,
  FaRunning,
  FaUserNinja,
  FaSmile,
  FaBullhorn,
  FaHandshake,
  FaCrown,
  FaGraduationCap,
  FaFileContract,
  FaTimes,
  FaStar,
  FaLink,
  FaUnlink
} from "react-icons/fa";

// définitions de métiers en français
import { categories, specials } from "../data/metiers";

// --- CONFIGURATION DES STATS ---
const STAT_GROUPS = {
  physical: {
    label: "Physique & Combat",
    color: "text-red-400",
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    stats: [
      { key: "life", icon: <FaHeart />, label: "Vie" },
      { key: "strength", icon: <FaFistRaised />, label: "Force" },
      { key: "resistance", icon: <FaShieldAlt />, label: "Résistance" },
      { key: "regeneration", icon: <FaHeartbeat />, label: "Régénération" },
    ]
  },
  agility: {
    label: "Agilité & Compétence",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    stats: [
      { key: "speed", icon: <FaBolt />, label: "Vitesse" },
      { key: "dodge", icon: <FaRunning />, label: "Esquive" },
      { key: "haste", icon: <FaPalette />, label: "Célérité" },
      { key: "reach", icon: <FaBullseye />, label: "Portée" },
      { key: "skill", icon: <FaGraduationCap />, label: "Compétence" },
    ]
  },
  social: {
    label: "Social & Mental",
    color: "text-amber-300",
    border: "border-amber-600/30",
    bg: "bg-blue-500/10",
    stats: [
      { key: "mana", icon: <FaMagic />, label: "Mana" },
      { key: "charisma", icon: <FaSmile />, label: "Charisme" },
      { key: "rethoric", icon: <FaBullhorn />, label: "Rhétorique" },
      { key: "negotiation", icon: <FaHandshake />, label: "Négociation" },
      { key: "influence", icon: <FaCrown />, label: "Influence" },
      { key: "discretion", icon: <FaUserNinja />, label: "Discrétion" },
    ]
  }
};

// Traduction camel_case → Title Case
const formatTypeLabel = (raw) =>
  raw.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

// Niveaux témoins (xpThreshold → level)
const LEVEL_THRESHOLDS = [
  { thresh: 3000, level: 15 },
  { thresh: 2000, level: 14 },
  { thresh: 1600, level: 13 },
  { thresh: 1250, level: 12 },
  { thresh: 1000, level: 11 },
  { thresh: 750, level: 10 },
  { thresh: 600, level: 9 },
  { thresh: 450, level: 8 },
  { thresh: 350, level: 7 },
  { thresh: 270, level: 6 },
  { thresh: 200, level: 5 },
  { thresh: 140, level: 4 },
  { thresh: 90, level: 3 },
  { thresh: 50, level: 2 },
  { thresh: 20, level: 1 },
  { thresh: 0, level: 0 },
];

// Métiers exceptionnels (pas de max=10)
const EXCEPTIONS = new Set(["bestiaire", "banquier", "politique", "builder"]);

// Trouve l’xp nécessaire pour atteindre `targetLevel`
function xpForLevel(targetLevel) {
  const entry = LEVEL_THRESHOLDS.find((e) => e.level === targetLevel);
  return entry ? entry.thresh : null;
}

// --- COMPOSANTS UI ---

const JobCard = ({ label, xp, level, maxLevel, nextXp, image }) => {
  const isMaxed = level >= maxLevel;
  const prevXp = xpForLevel(level) || 0;
  const progressPercent = isMaxed 
    ? 100 
    : Math.min(100, Math.max(0, ((xp - prevXp) / (nextXp - prevXp)) * 100));

  return (
    <div className="h-full bg-[#191916] p-4 rounded-sm border border-stone-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between">
      {/* Background Image (Optional, low opacity) */}
      {image && (
        <div 
          className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold text-white text-lg">{label}</h4>
          <span className="text-xs font-mono bg-stone-950 px-2 py-1 rounded text-amber-300 border border-stone-600">
            Lvl {level}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-stone-950 rounded-full overflow-hidden border border-stone-700">
          <div 
            className={`h-full transition-all duration-500 ${isMaxed ? 'bg-gradient-to-r from-yellow-500 to-yellow-300' : 'bg-amber-800'}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs text-stone-400 mt-1">
          <span>{xp === -1 ? "Verrouillé" : `${xp} XP`}</span>
          <span>{isMaxed ? "Max" : `${nextXp} XP`}</span>
        </div>
      </div>
    </div>
  );
};

export default function Character() {
  const { onboarding } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [discordInfo, setDiscordInfo] = useState(null);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [licences, setLicences] = useState([]);
  const [selectedLicence, setSelectedLicence] = useState(null);
  const [toast, setToast] = useState({ status: null, message: "" });
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  // Map jobId → nom français & image
  const jobMetaMap = useMemo(() => {
    const all = [...categories.flatMap((cat) => cat.jobs), ...specials];
    return all.reduce((m, job) => {
      m[job.id] = { name: job.name, image: job.image };
      return m;
    }, {});
  }, []);

  // Helper pour extraire le tableau de licences
  const extractLicences = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.licences)) return data.licences;
    return [];
  };

  // Scope asynchronous responses and cache entries to the current Google account.
  useEffect(() => {
    let generation = 0;
    const unsub = listenToAuthChanges(async user => {
      const current = ++generation;
      if (!user) { navigate("/auth"); return; }
      setAuthUser(user); setUserId(user.uid); setLoading(true); setError(null);
      setLicences([]); setOnlineMembers([]); setDiscordInfo(null);
      try {
        let cached = null;
        try {
          const candidate = JSON.parse(sessionStorage.getItem("mcFullProfile") || "null");
          if (candidate?.id === user.uid) cached = candidate;
        } catch { sessionStorage.removeItem("mcFullProfile"); }
        const [data, discord] = await Promise.all([
          cached ? Promise.resolve(cached) : getPlayerFullProfile(user.uid),
          getPlayerDiscord(user.uid).catch(() => null),
        ]);
        if (current !== generation) return;
        if (!data || data.id !== user.uid) throw new Error("Profil indisponible");
        setPlayer(data); setDiscordInfo(discord);
        sessionStorage.setItem("mcFullProfile", JSON.stringify(data));
        if (discord?.discord_id) getOnlineDiscordMembers().then(members => { if (current === generation) setOnlineMembers(members); }).catch(() => {});
        if (data.id_minecraft) {
          try {
            const lics = await managePlayerLicences(data.id_minecraft, { action: "list" });
            if (current === generation) setLicences(extractLicences(lics));
          } catch { if (current === generation) setLicences([]); }
        }
      } catch {
        if (current === generation) setError("Impossible de charger votre personnage. Réessayez depuis Mon profil.");
      } finally { if (current === generation) setLoading(false); }
    });
    return () => { generation++; unsub(); };
  }, [navigate]);

  const handleReloadStats = async () => {
    if (!userId) return;
    setRefreshing(true);
    await initializeStatsBonus(userId);
    try {
      const full = await getPlayerFullProfile(userId);
      sessionStorage.setItem("mcFullProfile", JSON.stringify(full));
      setPlayer(full);
      if (full.id_minecraft) {
        const lics = await managePlayerLicences(full.id_minecraft, { action: "list" });
        setLicences(extractLicences(lics));
      }
      setToast({ status: "success", message: "Données mises à jour !" });
    } catch {
      setError("Erreur lors du rafraîchissement.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLinkDiscord = async () => {
    const url = await getDiscordLink(userId);
    window.location.href = url;
  };

  const handleUnlinkDiscord = async () => {
    try {
      await unlinkDiscord(userId);
      setDiscordInfo(null);
      setToast({ status: "success", message: "Discord délié !" });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setToast({ status: "error", message: "Échec du déliement." });
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-950">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-500"></div>
      </div>
    );
  if (error) return <p className="text-red-400 text-center mt-10 text-xl">{error}</p>;

  const {
    pseudo_minecraft,
    rank,
    description,
    name,
    surname,
    money,
    divin,
    traits = [],
    actions = [],
    real_charact = {},
    experiences = {},
  } = player;

  const getStatDetails = (key) => {
    const base = player[key] || 0;
    const bonuses = Array.isArray(real_charact[key])
      ? real_charact[key]
      : real_charact[key]
      ? [real_charact[key]]
      : [];
    const totalBonus = bonuses.reduce((sum, bonus) => sum + bonus.count, 0);

    const getBonusLabel = (bonus) => {
      if (bonus.type.startsWith("talent_tree_")) return formatTypeLabel(bonus.type.replace("talent_tree_", ""));
      if (bonus.type.startsWith("trait_")) {
        const id = Number(bonus.type.split("_")[1]);
        return traits.find((trait) => trait.id === id)?.Name || "Trait";
      }
      return bonus.type;
    };

    return {
      totalBonus,
      total: base + totalBonus,
      tooltip: `Base : ${base}` + bonuses.map((bonus) => `, +${bonus.count} (${getBonusLabel(bonus)})`).join("")
    };
  };

  const inventoryStat = getStatDetails("place");
  const unlockedJobsCount = Object.values(experiences.jobs || {}).filter(job => job.xp !== -1).length;

  return (
    <div className="realm-page">
      <RealmHeader eyebrow="Le dossier / Personnage" title="Votre place dans le royaume" description="Identité, aptitudes et savoir-faire : retrouvez les détails de votre personnage et sa progression." />
      {/* --- HERO HEADER --- */}
      <div className="realm-profile relative border-b border-stone-700">
        <div className="hidden" />
        <div className="max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 py-8 md:py-12 relative z-10">
          <div className="flex flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-stone-700 overflow-hidden shadow-xl bg-stone-950">
                {onboarding?.profile?.portrait ? <CharacterPortrait portrait={onboarding.profile.portrait} /> : discordInfo?.discord_id ? (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${discordInfo.discord_id}/${discordInfo.discord_avatar}.png`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <FaUserCircle size={80} />
                  </div>
                )}
              </div>
              {/* Discord Status Badge */}
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-stone-800 ${discordInfo?.discord_id ? 'bg-green-500' : 'bg-gray-500'}`} title={discordInfo?.discord_id ? "Discord Lié" : "Discord Non Lié"} />
            </div>

            {/* Info Principales */}
            <div className="flex-1 w-full text-center md:text-left space-y-3">
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight break-words editorial-title">
                  {name} <span className="text-amber-300">{surname}</span>
                </h1>
                <p className="text-lg sm:text-xl text-amber-200 font-medium mt-1 flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="bg-blue-900/30 px-3 py-1 rounded-full border border-amber-600/30">{rank}</span>
                  <span className="text-stone-500">•</span>
                  <span className="italic text-stone-400 break-all">{pseudo_minecraft}</span>
                </p>
              </div>
              
              <p className="text-stone-400 max-w-2xl mx-auto md:mx-0 leading-relaxed italic break-words">
                "{description || "Un aventurier mystérieux..."}"
              </p>

              {/* Ressources */}
              <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 mt-4">
                <div className="bg-stone-950/80 px-4 py-2 rounded-lg border border-stone-600 flex items-center gap-2 shadow-sm">
                  <MoneyDisplay value={money} />
                </div>
                <div className="bg-purple-900/30 px-4 py-2 rounded-lg border border-purple-500/30 flex items-center gap-2 text-purple-200 shadow-sm">
                  <FaMagic /> <span>{divin || "Aucune divinité"}</span>
                </div>
                <ToolTip text={inventoryStat.tooltip}>
                  <div className="bg-stone-950/80 px-4 py-2 rounded-lg border border-stone-600 flex items-center gap-2 shadow-sm">
                    <FaBoxOpen className="text-amber-300" />
                    <span>Inventaire : <strong className="text-white">{inventoryStat.total}</strong></span>
                    {inventoryStat.totalBonus > 0 && <span className="text-xs text-green-400">+{inventoryStat.totalBonus}</span>}
                  </div>
                </ToolTip>
              </div>
            </div>

            {/* Actions Rapides */}
            <div id="discord" className="flex w-full flex-col gap-3 sm:w-auto md:w-auto">
              <button className="realm-action" onClick={() => navigate("/account/profile")}>Modifier mon profil</button>
              <LoadingButton
                loading={refreshing}
                loadingLabel="Actualisation..."
                onClick={handleReloadStats}
                className="flex items-center justify-center gap-2 bg-stone-800 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition shadow-md"
              >
                <FaSync /> Actualiser
              </LoadingButton>
              {discordInfo?.discord_id ? (
                <button
                  onClick={handleUnlinkDiscord}
                  className="flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-800/50 text-red-200 border border-red-800 px-4 py-2 rounded-lg transition text-sm"
                >
                  <FaUnlink /> Délier Discord
                </button>
              ) : (
                <button
                  onClick={handleLinkDiscord}
                  className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition shadow-md"
                >
                  <FaLink /> Lier Discord
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 mt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Métiers actifs", value: unlockedJobsCount, icon: <FaStar />, color: "text-yellow-400" },
            { label: "Traits", value: traits.length, icon: <FaHeartbeat />, color: "text-green-400" },
            { label: "Actions", value: actions.length, icon: <FaBolt />, color: "text-amber-300" },
            { label: "Licences", value: licences.length, icon: <FaFileContract />, color: "text-purple-400" },
          ].map(item => (
            <div key={item.label} className="bg-[#191916]/70 border border-stone-700 rounded-sm px-4 py-3 flex items-center gap-3 shadow-sm">
              <span className={`text-xl ${item.color}`}>{item.icon}</span>
              <div>
                <p className="text-xl font-bold text-white leading-none">{item.value}</p>
                <p className="text-xs text-stone-400 mt-1">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-[1680px] mx-auto px-5 sm:px-8 lg:px-12 mt-6 grid grid-cols-1 xl:grid-cols-12 gap-6 xl:gap-8">
        <div className="xl:col-span-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaBolt className="text-amber-300" /> Caractéristiques
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 items-stretch">
              {Object.entries(STAT_GROUPS).map(([groupKey, group]) => (
                <div key={groupKey} className={`realm-panel bg-[#191916] rounded-sm p-5 border ${group.border} shadow-none h-full min-h-[260px] flex flex-col`}>
                  <h3 className={`text-lg font-bold mb-4 ${group.color} border-b border-stone-700 pb-2`}>
                    {group.label}
                  </h3>
                  <div className="space-y-3 flex-1">
                    {group.stats.map(({ key, icon, label }) => {
                      const stat = getStatDetails(key);

                      return (
                        <StatCard 
                          key={key} 
                          icon={icon} 
                          label={label} 
                          value={stat.total}
                          bonus={stat.totalBonus}
                          tooltip={stat.tooltip}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-24 xl:self-start">
          <div className="realm-panel bg-[#191916] rounded-sm p-6 border border-stone-700 shadow-none h-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              🧬 Traits & Actions
            </h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-bold text-stone-400 uppercase mb-2">Traits</h4>
              <div className="flex flex-wrap gap-2">
                {traits.length > 0 ? traits.map((t) => (
                  <span key={t.id} className="bg-green-900/40 text-green-300 border border-green-700/50 px-3 py-1 rounded-full text-sm">
                    {t.Name}
                  </span>
                )) : <span className="text-stone-500 italic text-sm">Aucun trait</span>}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold text-stone-400 uppercase mb-2">Actions</h4>
              <div className="flex flex-wrap gap-2">
                {actions.length > 0 ? actions.map((a) => (
                  <span key={a.id} className="bg-blue-900/40 text-amber-200 border border-blue-700/50 px-3 py-1 rounded-full text-sm">
                    {a.Name}
                  </span>
                )) : <span className="text-stone-500 italic text-sm">Aucune action</span>}
              </div>
            </div>
          </div>

          <div className="realm-panel bg-[#191916] rounded-sm p-6 border border-stone-700 shadow-none h-full">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FaFileContract className="text-amber-300" /> Licences
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {licences.length === 0 ? (
                <p className="text-stone-500 italic text-center py-4">Aucune licence active.</p>
              ) : (
                licences.map((lic) => (
                  <div
                    key={lic.id}
                    onClick={() => setSelectedLicence(lic)}
                    className="bg-stone-800/50 p-3 rounded-lg border border-stone-600 hover:bg-stone-800 hover:border-yellow-500/50 cursor-pointer transition flex items-center gap-3"
                  >
                    <div className="bg-[#191916] p-2 rounded-full text-amber-300">
                      <FaFileContract />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-sm truncate">{lic.name}</h4>
                      <p className="text-xs text-stone-400 truncate">Prop: {lic.owner_name}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-12">
          <section>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <FaStar className="text-amber-300" /> Métiers & Expérience
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 items-stretch">
              {Object.entries(experiences.jobs || {}).map(([jobKey, job]) => {
                const meta = jobMetaMap[jobKey] || { name: jobKey, image: null };
                const xp = job.xp;
                const lvl = job.level;
                
                if (xp === -1) return null;

                const isException = EXCEPTIONS.has(jobKey);
                const maxLevel = isException ? 20 : 10;
                const nextXp = xpForLevel(lvl + 1) || xp;

                return (
                  <JobCard 
                    key={jobKey}
                    label={meta.name}
                    xp={xp}
                    level={lvl}
                    maxLevel={maxLevel}
                    nextXp={nextXp}
                    image={meta.image}
                  />
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Modal Licence */}
      <AnimatePresence>
        {selectedLicence && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setSelectedLicence(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#191916] p-6 rounded-sm shadow-none max-w-md w-full border border-stone-600 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedLicence(null)}
                className="absolute top-3 right-3 text-stone-400 hover:text-white transition"
              >
                <FaTimes size={20} />
              </button>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-stone-700 pb-4">
                <FaFileContract className="text-amber-300" />
                {selectedLicence.name}
              </h3>
              <div className="space-y-4 text-stone-200">
                <div className="flex justify-between border-b border-stone-700 pb-2">
                  <span className="font-semibold text-stone-400">Propriétaire</span>
                  <span>{selectedLicence.owner_name}</span>
                </div>
                <div className="flex justify-between border-b border-stone-700 pb-2">
                  <span className="font-semibold text-stone-400">Exploitant</span>
                  <span>{selectedLicence.exploitant_name}</span>
                </div>
                <div className="flex justify-between border-b border-stone-700 pb-2">
                  <span className="font-semibold text-stone-400">Prix</span>
                  <MoneyDisplay value={selectedLicence.price} />
                </div>
                <div className="flex justify-between border-b border-stone-700 pb-2">
                  <span className="font-semibold text-stone-400">Validité</span>
                  <span className="text-sm">{selectedLicence.start_date} - {selectedLicence.end_date}</span>
                </div>
                {selectedLicence.details && (
                  <div className="mt-4 p-4 bg-stone-800/50 rounded-lg border border-stone-600/50">
                    <p className="text-sm italic text-stone-300">{selectedLicence.details}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        status={toast.status}
        message={toast.message}
        onClose={() => setToast({ status: null, message: "" })}
      />
    </div>
  );
}
