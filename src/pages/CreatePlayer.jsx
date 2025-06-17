import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPlayer } from "../services/api"; // Fonction API pour créer un joueur

function CreatePlayer() {
    const navigate = useNavigate();

    const [playerData, setPlayerData] = useState({
        id: "",
        id_minecraft: "",
        pseudo_minecraft: "",
        name: "",
        surname: "",
        total_lvl: 1,
        description: "",
        rank: "Paysan",
        money: 0,
        divin: "",
        experiences: {
            jobs: {
                lumberjack: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                naval_architect: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                artisan: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                carpenter: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                miner: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                blacksmith: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                glassmaker: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                mason: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                farmer: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                breeder: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                fisherman: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                innkeeper: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                guard: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                merchant: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                transporter: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                explorer: {
                    xp: -1,
                    level: 0,
                    progression: Array(10).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                bestiary: {
                    xp: -1,
                    level: 0,
                    progression: Array(15).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                banker: {
                    xp: -1,
                    level: 0,
                    progression: Array(15).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                politician: {
                    xp: -1,
                    level: 0,
                    progression: Array(15).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
                builder: {
                    xp: -1,
                    level: 0,
                    progression: Array(15).fill(false),
                    inter_choice: [],
                    choose_lvl_10: "",
                },
            },
        },

    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPlayerData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await createPlayer(playerData);

        if (response) {
            alert("✅ Joueur créé avec succès !");
            navigate("/players");
        } else {
            alert("❌ Une erreur est survenue lors de la création du joueur.");
        }
    };

    return (
        <div className="p-6 text-white">
            <h1 className="text-3xl font-bold mb-6">➕ Créer un Nouveau Joueur</h1>

            <form onSubmit={handleSubmit} className="space-y-4 bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg mx-auto">
                <div>
                    <label className="block">🔢 ID Unique :</label>
                    <input
                        type="text"
                        name="id"
                        value={playerData.id}
                        onChange={handleChange}
                        className="w-full bg-gray-700 px-2 py-1 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block">🎮 ID Minecraft :</label>
                    <input
                        type="text"
                        name="id_minecraft"
                        value={playerData.id_minecraft}
                        onChange={handleChange}
                        className="w-full bg-gray-700 px-2 py-1 rounded"
                        required
                    />
                </div>

                <div>
                    <label className="block">👤 Pseudo Minecraft :</label>
                    <input
                        type="text"
                        name="pseudo_minecraft"
                        value={playerData.pseudo_minecraft}
                        onChange={handleChange}
                        className="w-full bg-gray-700 px-2 py-1 rounded"
                        required
                    />
                </div>

                <div className="flex space-x-4">
                    <div className="w-1/2">
                        <label className="block">📛 Prénom :</label>
                        <input
                            type="text"
                            name="name"
                            value={playerData.name}
                            onChange={handleChange}
                            className="w-full bg-gray-700 px-2 py-1 rounded"
                            required
                        />
                    </div>

                    <div className="w-1/2">
                        <label className="block">🏷️ Nom :</label>
                        <input
                            type="text"
                            name="surname"
                            value={playerData.surname}
                            onChange={handleChange}
                            className="w-full bg-gray-700 px-2 py-1 rounded"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block">📖 Description :</label>
                    <textarea
                        name="description"
                        value={playerData.description}
                        onChange={handleChange}
                        className="w-full bg-gray-700 px-2 py-1 rounded"
                    />
                </div>

                <div>
                    <label className="block">🏅 Rang :</label>
                    <select
                        name="rank"
                        value={playerData.rank}
                        onChange={handleChange}
                        className="w-full bg-gray-700 px-2 py-1 rounded"
                    >
                        <option value="Esclave">Paysan</option>
                        <option value="Etranger">Etranger</option>
                        <option value="Villageois">Villageois</option>
                        <option value="Citoyen">Citoyen</option>
                        <option value="Citoyen Libre">Citoyen Libre</option>
                        <option value="Patricien">Patricien</option>
                        <option value="Noble">Noble</option>
                        <option value="Seigneur">Seigneur</option>
                        <option value="Vicompte">Vicompte</option>
                        <option value="Compte">Compte</option>
                        <option value="Marquis">Marquis</option>
                        <option value="Moderateur">Moderateur</option>
                        <option value="Admin">Admin</option>
                    </select>
                </div>

                <div>
                    <label className="block">💰 Argent :</label>
                    <input
                        type="number"
                        name="money"
                        value={playerData.money}
                        onChange={handleChange}
                        className="w-full bg-gray-700 px-2 py-1 rounded"
                    />
                </div>

                <div>
                    <label className="block">🔮 Divinité :</label>
                    <select
                        name="divin"
                        value={playerData.divin}
                        onChange={handleChange}
                        className="w-full bg-gray-700 px-3 py-2 rounded"
                    >
                        <option value="aucun">Aucun</option>
                        <option value="Ardorium">Ardorium</option>
                        <option value="Sylvaria">Sylvaria</option>
                        <option value="Inquisora">Inquisora</option>
                        <option value="Solanaré">Solanaré</option>
                        <option value="Aurelios">Aurelios</option>
                        <option value="Explorien">Explorien</option>
                        <option value="Ignotembris">Ignotembris</option>
                        <option value="Ombrelume">Ombrelume</option>
                        <option value="Scénarche">Scénarche</option>
                        <option value="Glacilune">Glacilune</option>
                        <option value="Nevrosante">Nevrosante</option>
                        <option value="Érudihiver">Érudihiver</option>
                    </select>
                </div>


                <button
                    type="submit"
                    className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-lg font-semibold transition w-full"
                >
                    ➕ Ajouter le Joueur
                </button>
            </form>
        </div>
    );
}

export default CreatePlayer;
