import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPlayerJobs, updatePlayerJobs } from "../data/api";

function PlayerJobs() {
    const { playerId } = useParams();
    const [jobs, setJobs] = useState([]);
    const [editedJobs, setEditedJobs] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        async function fetchJobs() {
            try {
                const data = await getPlayerJobs(playerId);
                console.log("📦 Données métiers récupérées:", data);
    
                if (data && data.jobs && data.jobs.jobs) {
                    const formattedJobs = Object.entries(data.jobs.jobs).map(([name, jobData]) => ({
                        id: name,
                        name,
                        xp: jobData?.xp ?? 0,
                        level: jobData?.level ?? 0,
                        progression: Array.isArray(jobData?.progression) ? jobData.progression : Array(10).fill(false),
                        choose_lvl_10: jobData?.choose_lvl_10 ?? "",
                    }));
    
                    console.log("✅ Métiers formatés :", formattedJobs);
                    setJobs(formattedJobs);
                    setEditedJobs(formattedJobs.reduce((acc, job) => ({ ...acc, [job.id]: job }), {}));
                } else {
                    console.error("❌ Format des données inattendu :", data);
                    setJobs([]);
                }
            } catch (error) {
                console.error("❌ Erreur lors de la récupération des métiers :", error);
            }
        }
    
        if (playerId) {
            fetchJobs();
        }
    }, [playerId]);
    

    // 🔄 Gérer les modifications
    const handleChange = (jobId, field, value) => {
        setEditedJobs((prev) => ({
            ...prev,
            [jobId]: {
                ...prev[jobId],
                [field]: value,
            },
        }));
    };

    // 🔄 Gérer la modification de la progression (Toggle ✅/❌)
    const toggleProgression = (jobId, index) => {
        setEditedJobs((prev) => ({
            ...prev,
            [jobId]: {
                ...prev[jobId],
                progression: prev[jobId].progression.map((step, i) =>
                    i === index ? !step : step
                ),
            },
        }));
    };

    // 🔄 Enregistrer les modifications
    const handleSave = async () => {
        setIsSaving(true);

        try {
            for (const jobId in editedJobs) {
                const job = editedJobs[jobId];

                // Met à jour chaque champ modifié individuellement
                await updatePlayerJobs(playerId, jobId, "xp", job.xp);
                await updatePlayerJobs(playerId, jobId, "level", job.level);
                await updatePlayerJobs(playerId, jobId, "progression", job.progression);

                if (job.level >= 10) {
                    await updatePlayerJobs(playerId, jobId, "choose_lvl_10", job.choose_lvl_10);
                }
            }

            alert("✅ Modifications enregistrées avec succès !");
            setIsEditing(false);
        } catch (error) {
            alert("❌ Une erreur est survenue lors de l'enregistrement.");
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };



    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">🏗️ Métiers du joueur {playerId}</h1>

            {jobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {jobs.map((job) => (
                        <div key={job.id} className="bg-gray-800 p-6 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold text-blue-400">{job.name}</h2>

                            <div className="mt-2">
                                <label className="block">XP :</label>
                                <input
                                    type="number"
                                    value={editedJobs[job.id]?.xp || 0}
                                    onChange={(e) => handleChange(job.id, "xp", Number(e.target.value))}
                                    className="w-full bg-gray-700 px-2 py-1 rounded"
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="mt-2">
                                <label className="block">Niveau :</label>
                                <input
                                    type="number"
                                    value={editedJobs[job.id]?.level || 0}
                                    onChange={(e) => handleChange(job.id, "level", Number(e.target.value))}
                                    className="w-full bg-gray-700 px-2 py-1 rounded"
                                    disabled={!isEditing}
                                />
                            </div>

                            {/* 🔥 Affichage de la progression */}
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">📊 Progression :</h3>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {editedJobs[job.id]?.progression.map((step, index) => (
                                        <button
                                            key={index}
                                            className={`px-2 py-1 rounded-md transition ${step ? "bg-green-500 hover:bg-green-400" : "bg-red-500 hover:bg-red-400"
                                                }`}
                                            onClick={() => isEditing && toggleProgression(job.id, index)}
                                        >
                                            {step ? "✅" : "❌"} Niveau {index + 1}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 🔥 Choix niveau 10 si disponible */}
                            {job.level >= 10 && (
                                <div className="mt-2">
                                    <label className="block">🎖️ Choix niveau 10 :</label>
                                    <input
                                        type="text"
                                        value={editedJobs[job.id]?.choose_lvl_10 || ""}
                                        onChange={(e) => handleChange(job.id, "choose_lvl_10", e.target.value)}
                                        className="w-full bg-gray-700 px-2 py-1 rounded"
                                        disabled={!isEditing}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-400 text-center">Aucun métier trouvé.</p>
            )}

            {/* 🔘 Boutons Modifier / Enregistrer */}
            <div className="mt-6 flex justify-center space-x-4">
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-lg font-semibold transition"
                    >
                        ✏️ Modifier
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-lg font-semibold transition"
                            disabled={isSaving}
                        >
                            {isSaving ? "💾 Enregistrement..." : "💾 Enregistrer"}
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setEditedJobs(jobs.reduce((acc, job) => ({ ...acc, [job.id]: job }), {}));
                            }}
                            className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-lg font-semibold transition"
                        >
                            ❌ Annuler
                        </button>
                    </>
                )}
            </div>

        </div>
    );
}

export default PlayerJobs;
