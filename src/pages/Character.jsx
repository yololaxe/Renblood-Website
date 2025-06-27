// src/pages/Character.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listenToAuthChanges } from "../data/firebaseConfig";
import {
  getPlayerFullProfile,
  initializeStatsBonus,
  getPlayerDiscord,
  getDiscordLink,
  unlinkDiscord,
  getOnlineDiscordMembers,
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
} from "react-icons/fa";

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

const formatTypeLabel = (raw) =>
  raw
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function Character() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [player, setPlayer] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [discordInfo, setDiscordInfo] = useState(null);
  const [onlineMembers, setOnlineMembers] = useState([]);
  const [toast, setToast] = useState({ status: null, message: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = listenToAuthChanges(async (user) => {
      if (!user) return navigate("/auth");
      setAuthUser(user);
      setUserId(user.uid);

      // Discord
      const d = await getPlayerDiscord(user.uid);
      setDiscordInfo(d);
      if (d?.discord_id) {
        getOnlineDiscordMembers().then(setOnlineMembers);
      }

      // Profil complet
      const cache = sessionStorage.getItem("mcFullProfile");
      if (cache) {
        setPlayer(JSON.parse(cache));
        setLoading(false);
        return;
      }
      try {
        const data = await getPlayerFullProfile(user.uid);
        sessionStorage.setItem("mcFullProfile", JSON.stringify(data));
        setPlayer(data);
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
      setToast({ status: "success", message: "Discord déliené !" });
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setToast({ status: "error", message: "Échec du délienement." });
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-32 h-32 bg-gray-800 animate-pulse rounded-2xl" />
      </div>
    );
  if (error)
    return <p className="text-red-400 text-center mt-10">{error}</p>;

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

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr_1.2fr] gap-6 items-start">
          {/* Discord Card */}
          <aside className="bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center">
            {discordInfo?.discord_id ? (
                <>
                  <img
                      src={`https://cdn.discordapp.com/avatars/${discordInfo.discord_id}/${discordInfo.discord_avatar}.png`}
                      alt="Avatar Discord"
                      className="w-16 h-16 rounded-full mb-4"
                  />
                  <p className="flex items-center gap-2 text-white font-medium mb-4">
                    <FaDiscord className="text-indigo-400"/>
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
                  <FaDiscord className="text-4xl text-indigo-400 mb-2"/>
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

          {/* Profile & Stats */}
          <main className="space-y-8">
            {/* Identity & Resources */}
            <div
                className="bg-gray-800 p-6 rounded-2xl shadow-lg flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
                  👤 {name} {surname}
                </h2>
                <p className="text-gray-400 italic">{rank}</p>
              </div>
              <div className="flex flex-wrap gap-6 text-white text-lg">
                <div className="flex items-center gap-2">
                  <MoneyDisplay value={money}/>
                </div>
                <div className="flex items-center gap-2">
                  🔮 <span>{divin}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <section className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl sm:text-2xl font-semibold text-white">
                  📊 Statistiques
                </h3>
                <button
                    onClick={handleReloadStats}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
                >
                  <FaSync className="animate-spin duration-500"/>
                  Recharger
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {CHARACTERISTICS.map(({key, icon, label}) => {
                  const base = player[key] || 0;
                  const bonuses = Array.isArray(real_charact[key])
                      ? real_charact[key]
                      : real_charact[key]
                          ? [real_charact[key]]
                          : [];
                  const totalBonus = bonuses.reduce((s, b) => s + b.count, 0);
                  const total = base + totalBonus;
                  return (
                      <div
                          key={key}
                          className="bg-gray-700 p-4 rounded-xl text-center hover:bg-gray-600 transition"
                      >
                        <div className="text-2xl flex justify-center">
                          {icon}
                        </div>
                        <p className="mt-2 text-white font-semibold">{label}</p>
                        <p className="mt-1 flex justify-center items-center text-white text-lg gap-1">
                          {total}
                          {bonuses.length > 0 && (
                              <ToolTip
                                  text={
                                      `Base: ${base}` +
                                      bonuses
                                          .map((b) => {
                                            const raw = b.type.replace(
                                                /^talent_tree_/,
                                                ""
                                            );
                                            return `, +${b.count} (${formatTypeLabel(
                                                raw
                                            )})`;
                                          })
                                          .join("")
                                  }
                              >
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

            {/* Expériences */}
            <section className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-semibold text-white text-center">
                📜 Expériences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {Object.entries(experiences.jobs || {}).map(
                    ([jobKey, job]) => (
                        <div
                            key={jobKey}
                            className="bg-gray-700 p-4 rounded-xl hover:bg-gray-600 transition"
                        >
                          <p className="font-bold text-white">
                            {jobKey
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </p>
                          <p className="text-gray-300 mt-1">
                            Niveau : {job.level}
                          </p>
                          <p className="text-gray-300">
                            XP : {job.xp === -1 ? "🔒" : job.xp}
                          </p>
                        </div>
                    )
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
          </main>

          {/* Firebase Profile Card */}
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
                      <FaUserCircle className="w-16 h-16 text-gray-400"/>
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

      <Toast status={toast.status} message={toast.message}/>
    </div>
  );
}
