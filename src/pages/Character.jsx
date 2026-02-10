// src/pages/Character.jsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
} from "react-icons/fa";

// définitions de métiers en français
import { categories, specials } from "../data/metiers";

// pour les stats
const CHARACTERISTICS = [
  { key: "life", icon: <FaHeart />, label: "Vie" },
  { key: "strength", icon: <FaFistRaised />, label: "Force" },
  { key: "speed", icon: <FaBolt />, label: "Vitesse" },
  { key: "reach", icon: <FaBullseye />, label: "Portée" },
  { key: "resistance", icon: <FaShieldAlt />, label: "Résistance" },
  { key: "regeneration", icon: <FaHeartbeat />, label: "Régénération" },
  { key: "haste", icon: <FaPalette />, label: "Célérité" },
  { key: "place", icon: <FaBoxOpen />, label: "Inventaire" },
  { key: "mana", icon: <FaMagic />, label: "Mana" },
  { key: "dodge", icon: <FaRunning />, label: "Esquive" },
  { key: "discretion", icon: <FaUserNinja />, label: "Discrétion" },
  { key: "charisma", icon: <FaSmile />, label: "Charisme" },
  { key: "rethoric", icon: <FaBullhorn />, label: "Rhétorique" },
  { key: "negotiation", icon: <FaHandshake />, label: "Négociation" },
  { key: "influence", icon: <FaCrown />, label: "Influence" },
  { key: "skill", icon: <FaGraduationCap />, label: "Compétence" },
];

// traduction camel_case → Title Case
const formatTypeLabel = (raw) =>
  raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

// niveaux témoins (xpThreshold → level)
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

// métiers exceptionnels (pas de max=10)
const EXCEPTIONS = new Set([
  "bestiaire",
  "banquier",
  "politique",
  "builder",
]);

// trouve l’xp nécessaire pour atteindre `targetLevel`
function xpForLevel(targetLevel, jobKey) {
  const entry = LEVEL_THRESHOLDS.find((e) => e.level === targetLevel);
  return entry ? entry.thresh : null;
}

export default function Character() {
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
  const navigate = useNavigate();

  // map jobId → nom français
  const jobNameMap = useMemo(() => {
    const all = [
      ...categories.flatMap((cat) => cat.jobs),
      ...specials,
    ];
    return all.reduce((m, job) => {
      m[job.id] = job.name;
      return m;
    }, {});
  }, []);

  // Helper pour extraire le tableau de licences
  const extractLicences = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.licences)) return data.licences;
    return [];
  };

  // chargement du profil
  useEffect(() => {
    const unsub = listenToAuthChanges(async (user) => {
      if (!user) return navigate("/auth");
      setAuthUser(user);
      setUserId(user.uid);

      const d = await getPlayerDiscord(user.uid);
      setDiscordInfo(d);
      if (d?.discord_id) {
        getOnlineDiscordMembers().then(setOnlineMembers);
      }

      const cache = sessionStorage.getItem("mcFullProfile");
      if (cache) {
        const p = JSON.parse(cache);
        setPlayer(p);
        // Charger les licences si on a l'ID Minecraft
        if (p.id_minecraft) {
          try {
            const lics = await managePlayerLicences(p.id_minecraft, { action: "list" });
            setLicences(extractLicences(lics));
          } catch (err) {
            console.error("Erreur chargement licences:", err);
            setLicences([]);
          }
        }
        setLoading(false);
        return;
      }
      try {
        const data = await getPlayerFullProfile(user.uid);
        sessionStorage.setItem("mcFullProfile", JSON.stringify(data));
        setPlayer(data);
        // Charger les licences
        if (data.id_minecraft) {
          const lics = await managePlayerLicences(data.id_minecraft, { action: "list" });
          setLicences(extractLicences(lics));
        }
      } catch {
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    });
    return () => unsub && unsub();
  }, [navigate]);

  const handleReloadStats = async () => {
    if (!userId) return;
    setLoading(true);
    await initializeStatsBonus(userId);
    try {
      const full = await getPlayerFullProfile(userId);
      sessionStorage.setItem("mcFullProfile", JSON.stringify(full));
      setPlayer(full);
      // Recharger les licences
      if (full.id_minecraft) {
        const lics = await managePlayerLicences(full.id_minecraft, { action: "list" });
        setLicences(extractLicences(lics));
      }
    } catch {
      setError("Erreur lors du rafraîchissement.");
    } finally {
      setLoading(false);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-32 h-32 bg-gray-800 animate-pulse rounded-2xl" />
      </div>
    );
  if (error) return <p className="text-red-400 text-center mt-10">{error}</p>;

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

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-6 space-y-8">
        {/* Header */}
        <header className="text-center space-y-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
            {pseudo_minecraft}
          </h1>
          <p className="text-gray-400 italic">{description}</p>
        </header>

        {/* Grille Principale */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr_1.2fr] gap-6 items-start">
          {/* Discord */}
          <aside className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center">
            {discordInfo?.discord_id ? (
              <>
                <img
                  src={`https://cdn.discordapp.com/avatars/${discordInfo.discord_id}/${discordInfo.discord_avatar}.png`}
                  alt="Avatar Discord"
                  className="w-16 h-16 rounded-full mb-4"
                />
                <p className="flex items-center gap-2 text-white font-medium mb-4">
                  <FaDiscord className="text-indigo-400" />
                  {discordInfo.discord_username}
                </p>
                <button
                  onClick={handleUnlinkDiscord}
                  className="mt-auto flex items-center gap-2 bg-red-600 hover:bg-red-500 px-4 py-2 rounded"
                >
                  Délier Discord
                </button>
                <p className="mt-4 text-gray-300 text-sm">
                  En ligne :{" "}
                  {onlineMembers.length > 0
                    ? onlineMembers.join(", ")
                    : "Aucun membre"}
                </p>
              </>
            ) : (
              <>
                <FaDiscord className="text-4xl text-indigo-400 mb-2" />
                <p className="text-white font-semibold mb-4">Discord</p>
                <p className="text-gray-400 mb-6">Aucun compte lié</p>
                <button
                  onClick={handleLinkDiscord}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded"
                >
                  Lier à Discord
                </button>
              </>
            )}
          </aside>

          {/* Profil & Stats */}
          <main className="space-y-8">
            {/* Identité & Ressources */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                  👤 {name} {surname}
                </h2>
                <p className="text-gray-400 italic">{rank}</p>
              </div>
              <div className="flex flex-wrap gap-6 text-white text-lg">
                <div className="flex items-center gap-2">
                  <MoneyDisplay value={money} />
                </div>
                <div className="flex items-center gap-2">
                  🔮 <span>{divin}</span>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  📊 Statistiques
                </h3>
                <button
                  onClick={handleReloadStats}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
                >
                  <FaSync className="animate-spin duration-500" />
                  Recharger
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {CHARACTERISTICS.map(({ key, icon, label }) => {
                  const base = player[key] || 0;
                  const bonuses = Array.isArray(real_charact[key])
                    ? real_charact[key]
                    : real_charact[key]
                    ? [real_charact[key]]
                    : [];
                  const totalBonus = bonuses.reduce((s, b) => s + b.count, 0);
                  const total = base + totalBonus;

                  const getBonusLabel = (b) => {
                    if (b.type.startsWith("talent_tree_")) {
                      return formatTypeLabel(b.type.replace("talent_tree_", ""));
                    }
                    if (b.type.startsWith("trait_")) {
                      const id = Number(b.type.split("_")[1]);
                      const t = traits.find((t) => t.id === id);
                      return t?.Name || "Trait";
                    }
                    return b.type;
                  };

                  const tooltipText =
                    `Base : ${base}` +
                    bonuses
                      .map((b) => `, +${b.count} (${getBonusLabel(b)})`)
                      .join("");

                  return (
                    <div
                      key={key}
                      className="bg-gray-700 p-4 rounded-xl text-center hover:bg-gray-600 transition"
                    >
                      <div className="text-2xl flex justify-center">{icon}</div>
                      <p className="mt-2 text-white font-semibold">{label}</p>
                      <p className="mt-1 flex justify-center items-center text-white text-lg gap-1">
                        {total}
                        {bonuses.length > 0 && (
                          <ToolTip text={tooltipText}>
                            <span className="text-sm text-green-300">
                              +{totalBonus}
                            </span>
                          </ToolTip>
                        )}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Expériences métiers */}
            <section className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-white text-center">
                📜 Expériences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Object.entries(experiences.jobs || {}).map(
                  ([jobKey, job]) => {
                    const label = jobNameMap[jobKey] || jobKey;
                    const xp = job.xp;
                    const lvl = job.level;
                    let tip = "";

                    if (xp === -1) {
                      tip = "Métier non débloqué";
                    } else {
                      // défaut : max 10 pour les non-exceptions
                      const isException = EXCEPTIONS.has(jobKey);
                      const maxLevel = isException ? Infinity : 10;

                      if (lvl >= maxLevel) {
                        tip = "Métier complété à 100%";
                      } else {
                        const next = xpForLevel(lvl + 1, jobKey);
                        if (next != null) {
                          const missing = next - xp;
                          tip = `${missing} XP avant le niveau ${lvl + 1}`;
                        }
                      }
                    }

                    return (
                      <ToolTip key={jobKey} text={tip}>
                        <div className="bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition cursor-pointer">
                          <p className="font-bold text-white">{label}</p>
                          <p className="text-gray-300 mt-1">
                            Niveau : {lvl}
                          </p>
                          <p className="text-gray-300">
                            XP : {xp === -1 ? "🔒" : xp}
                          </p>
                        </div>
                      </ToolTip>
                    );
                  }
                )}
              </div>
            </section>

            {/* Traits & Actions */}
            <section className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-white text-center">
                🧬 Traits & Actions
              </h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {traits.map((t) => (
                  <span
                    key={t.id}
                    className="bg-green-500 px-3 py-1 rounded-full text-white hover:bg-green-600 transition"
                  >
                    {t.Name}
                  </span>
                ))}
                {actions.map((a) => (
                  <span
                    key={a.id}
                    className="bg-blue-500 px-3 py-1 rounded-full text-white hover:bg-blue-600 transition"
                  >
                    {a.Name}
                  </span>
                ))}
              </div>
            </section>

            {/* Licences */}
            <section className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-white text-center flex items-center justify-center gap-2">
                <FaFileContract /> Licences
              </h3>
              {(!licences || licences.length === 0) ? (
                <p className="text-gray-400 text-center italic">Aucune licence active.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {licences.map((lic) => (
                    <div
                      key={lic.id}
                      onClick={() => setSelectedLicence(lic)}
                      className="bg-gray-700 p-4 rounded-xl shadow-md border border-gray-600 cursor-pointer hover:bg-gray-600 transition flex flex-col items-center justify-center min-h-[6rem] h-full"
                    >
                      <FaFileContract className="text-2xl text-blue-400 mb-2 flex-shrink-0" />
                      <h4 className="text-lg font-bold text-white text-center break-words w-full">{lic.name}</h4>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          {/* Profil Firebase */}
          {authUser && (
            <aside className="bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                {authUser.photoURL ? (
                  <img
                    src={authUser.photoURL}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full border-2 border-gray-600"
                  />
                ) : (
                  <FaUserCircle className="w-16 h-16 text-gray-400" />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {authUser.displayName || "Utilisateur"}
                  </h3>
                  <p className="text-gray-400 text-sm break-all">
                    {authUser.email}
                  </p>
                </div>
              </div>
              <dl className="space-y-2 text-gray-200 text-sm">
                <div className="flex justify-between">
                  <dt>UID :</dt>
                  <dd className="break-all">{authUser.uid}</dd>
                </div>
                {authUser.phoneNumber && (
                  <div className="flex justify-between">
                    <dt>Téléphone :</dt>
                    <dd>{authUser.phoneNumber}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Créé le :</dt>
                  <dd>
                    {new Date(
                      authUser.metadata.creationTime
                    ).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Dernière connexion :</dt>
                  <dd>
                    {new Date(
                      authUser.metadata.lastSignInTime
                    ).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </dd>
                </div>
              </dl>
            </aside>
          )}
        </div>
      </div>

      {/* Modal Licence */}
      {selectedLicence && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setSelectedLicence(null)}
        >
          <div
            className="bg-gray-800 p-6 rounded-2xl shadow-2xl max-w-md w-full border border-gray-600 relative animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedLicence(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition"
            >
              <FaTimes size={20} />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 border-b border-gray-700 pb-4">
              <FaFileContract className="text-blue-400" />
              {selectedLicence.name}
            </h3>
            <div className="space-y-4 text-gray-200">
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-semibold text-gray-400">Propriétaire</span>
                <span>{selectedLicence.owner_name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-semibold text-gray-400">Exploitant</span>
                <span>{selectedLicence.exploitant_name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-semibold text-gray-400">Prix</span>
                <MoneyDisplay value={selectedLicence.price} />
              </div>
              <div className="flex justify-between border-b border-gray-700 pb-2">
                <span className="font-semibold text-gray-400">Validité</span>
                <span className="text-sm">{selectedLicence.start_date} - {selectedLicence.end_date}</span>
              </div>
              {selectedLicence.details && (
                <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <p className="text-sm italic text-gray-300">{selectedLicence.details}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Toast status={toast.status} message={toast.message} />
    </div>
  );
}
