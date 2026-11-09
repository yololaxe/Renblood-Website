// src/pages/PlayerJobs.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPlayerJobs, updatePlayerJobs, getPlayerData } from "../services/api";
import { motion } from "framer-motion";
import { FaUserCircle, FaSave, FaEdit, FaTimes, FaCheck } from "react-icons/fa";

export default function PlayerJobs() {
    const { playerId } = useParams();
    const navigate = useNavigate();
    const [player, setPlayer] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [editedJobs, setEditedJobs] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("jobs");

    useEffect(() => {
        async function fetchData() {
            try {
                // 1. Récupérer les infos du joueur
                const playerData = await getPlayerData(playerId);
                setPlayer(playerData);

                // 2. Récupérer les métiers
                const jobsData = await getPlayerJobs(playerId);
                if (jobsData?.jobs?.jobs) {
                    const formattedJobs = Object.entries(jobsData.jobs.jobs).map(([name, jobData]) => ({
                        id: name,
                        name,
                        xp: jobData?.xp ?? 0,
                        level: jobData?.level ?? 0,
                        progression: Array.isArray(jobData?.progression) ? jobData.progression : Array(10).fill(false),
                        choose_lvl_10: jobData?.choose_lvl_10 ?? "",
                    }));
                    setJobs(formattedJobs);
                    setEditedJobs(formattedJobs.reduce((acc, job) => ({ ...acc, [job.id]: job }), {}));
                }
            } catch (error) {
                console.error("Erreur chargement:", error);
            }
        }
        if (playerId) fetchData();
    }, [playerId]);

    const handleChange = (jobId, field, value) => {
        setEditedJobs((prev) => ({
            ...prev,
            [jobId]: { ...prev[jobId], [field]: value },
        }));
    };

    const toggleProgression = (jobId, index) => {
        setEditedJobs((prev) => ({
            ...prev,
            [jobId]: {
                ...prev[jobId],
                progression: prev[jobId].progression.map((step, i) => (i === index ? !step : step)),
            },
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            for (const jobId in editedJobs) {
                const job = editedJobs[jobId];
                await updatePlayerJobs(playerId, jobId, "xp", job.xp);
                await updatePlayerJobs(playerId, jobId, "level", job.level);
                await updatePlayerJobs(playerId, jobId, "progression", job.progression);
                if (job.level >= 10) {
                    await updatePlayerJobs(playerId, jobId, "choose_lvl_10", job.choose_lvl_10);
                }
            }
            alert("✅ Modifications enregistrées !");
            setIsEditing(false);
        } catch (error) {
            alert("❌ Erreur lors de l'enregistrement.");
        } finally {
            setIsSaving(false);
        }
    };

    if (!player) return <div className="text-center text-white mt-20">Chargement...</div>;

    return (
        <div className="min-h-screen bg-[#11110f] text-stone-200 pb-20">
            
            {/* --- HEADER --- */}
            <div className="bg-[#1b1b17] border-b border-stone-700 py-8 px-6 shadow-none">
                <div className="max-w-[1520px] mx-auto flex items-center gap-6">
                    
                    <div className="w-20 h-20 rounded-full bg-stone-800 flex items-center justify-center overflow-hidden border-4 border-stone-600">
                        {player.discord_avatar ? (
                            <img src={`https://cdn.discordapp.com/avatars/${player.discord_id}/${player.discord_avatar}.png`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <FaUserCircle size={40} className="text-stone-400" />
                        )}
                    </div>
                    
                    <div>
                        <h1 className="text-3xl font-bold text-white editorial-title">{player.pseudo_minecraft}</h1>
                        <p className="text-amber-300 font-medium">{player.rank} • {player.name} {player.surname}</p>
                    </div>

                    <div className="ml-auto flex gap-3">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-amber-800 hover:bg-amber-700 text-white rounded-lg font-bold shadow transition">
                                <FaEdit /> Modifier
                            </button>
                        ) : (
                            <>
                                <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold shadow transition">
                                    <FaSave /> {isSaving ? "..." : "Enregistrer"}
                                </button>
                                <button onClick={() => setIsEditing(false)} className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold shadow transition">
                                    <FaTimes /> Annuler
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- TABS --- */}
            <div className="max-w-[1520px] mx-auto px-6 mt-8">
                <div className="flex border-b border-stone-700 mb-6">
                    <button 
                        onClick={() => setActiveTab("jobs")}
                        className={`px-6 py-3 font-bold text-lg transition ${activeTab === "jobs" ? "text-amber-300 border-b-2 border-blue-400" : "text-stone-400 hover:text-white"}`}
                    >
                        Métiers
                    </button>
                    {/* Ajouter d'autres onglets ici si besoin (Stats, Inventaire...) */}
                </div>

                {/* --- CONTENU METIERS --- */}
                {activeTab === "jobs" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {jobs.map((job) => {
                            const currentData = isEditing ? editedJobs[job.id] : job;
                            const progressPercent = Math.min(100, (currentData.level / 10) * 100); // Simplifié pour la démo

                            return (
                                <motion.div 
                                    key={job.id} 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#1b1b17] p-6 rounded-sm border border-stone-700 shadow-none hover:border-amber-600/30 transition"
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-bold text-white capitalize">{job.name.replace(/_/g, " ")}</h3>
                                        <span className="bg-[#11110f] text-amber-300 px-3 py-1 rounded-full text-sm font-mono border border-stone-700">
                                            Lvl {currentData.level}
                                        </span>
                                    </div>

                                    {/* Inputs XP / Level */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-xs text-stone-500 uppercase mb-1">XP</label>
                                            <input
                                                type="number"
                                                value={currentData.xp}
                                                onChange={(e) => handleChange(job.id, "xp", Number(e.target.value))}
                                                disabled={!isEditing}
                                                className="w-full bg-[#11110f] border border-stone-600 rounded p-2 text-white focus:border-amber-600 outline-none disabled:opacity-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-stone-500 uppercase mb-1">Niveau</label>
                                            <input
                                                type="number"
                                                value={currentData.level}
                                                onChange={(e) => handleChange(job.id, "level", Number(e.target.value))}
                                                disabled={!isEditing}
                                                className="w-full bg-[#11110f] border border-stone-600 rounded p-2 text-white focus:border-amber-600 outline-none disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Progression Visuelle */}
                                    <div className="mb-4">
                                        <div className="flex justify-between text-xs text-stone-400 mb-1">
                                            <span>Progression</span>
                                            <span>{Math.round(progressPercent)}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-[#11110f] rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                                        </div>
                                    </div>

                                    {/* Arbre de talents (Checkboxes) */}
                                    <div>
                                        <label className="block text-xs text-stone-500 uppercase mb-2">Talents débloqués</label>
                                        <div className="flex flex-wrap gap-1">
                                            {currentData.progression.map((step, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => isEditing && toggleProgression(job.id, idx)}
                                                    disabled={!isEditing}
                                                    className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition ${
                                                        step 
                                                            ? "bg-green-600 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]" 
                                                            : "bg-stone-800 text-stone-500 hover:bg-gray-600"
                                                    }`}
                                                    title={`Niveau ${idx + 1}`}
                                                >
                                                    {idx + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Choix Lvl 10 */}
                                    {currentData.level >= 10 && (
                                        <div className="mt-4 pt-4 border-t border-stone-700">
                                            <label className="block text-xs text-amber-300 uppercase mb-1 font-bold">Spécialisation (Lvl 10)</label>
                                            <input
                                                type="text"
                                                value={currentData.choose_lvl_10}
                                                onChange={(e) => handleChange(job.id, "choose_lvl_10", e.target.value)}
                                                disabled={!isEditing}
                                                className="w-full bg-[#11110f] border border-stone-600 rounded p-2 text-white focus:border-yellow-500 outline-none disabled:opacity-50"
                                                placeholder="Choix de spécialisation..."
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
