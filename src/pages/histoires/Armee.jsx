import React, { useState } from "react";
import data from "../../data/Armee";

function Armee() {
    const [selectedRank, setSelectedRank] = useState(null);
    const [selectedType, setSelectedType] = useState(null);

    // 🔄 Associer les types de sélection aux vraies clés de `data`
    const typeMapping = {
        Humains: "Armée des humains",
        Créatures: "Armée des créatures",
        Mystique: "Armée Mystique",
    };

    const handleClick = (index, type) => {
        setSelectedRank(index);
        setSelectedType(type);
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <h1 className="text-4xl font-bold text-center mb-6">⚔️ Hiérarchie Militaire</h1>
            <p className="text-lg text-center mb-6 max-w-3xl mx-auto">
                Découvrez les différents rangs des armées du royaume, leurs années d'expérience et leur rôle.
            </p>

            {/* Tableau */}
            <div className="overflow-x-auto">
                <table className="w-full border border-gray-700 text-center">
                    <thead>
                        <tr className="bg-gray-800">
                            <th className="p-3 border border-gray-700">Armée des Humains</th>
                            <th className="p-3 border border-gray-700">Armée des Créatures</th>
                            <th className="p-3 border border-gray-700">Armée Mystique</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data["Armée des humains"].map((rank, index) => (
                            <tr key={index} className="hover:bg-gray-700 cursor-pointer">
                                <td className="p-3 border border-gray-700" onClick={() => handleClick(index, "Humains")}>
                                    {rank}
                                </td>
                                <td className="p-3 border border-gray-700" onClick={() => handleClick(index, "Créatures")}>
                                    {data["Armée des créatures"]?.[index] || "-"}
                                </td>
                                <td className="p-3 border border-gray-700" onClick={() => handleClick(index, "Mystique")}>
                                    {data["Armée Mystique"]?.[index] || "-"}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ✅ MODAL D'INFORMATION SUR LE RANG SELECTIONNÉ */}
            {selectedRank !== null && selectedType && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
                    onClick={() => setSelectedRank(null)}
                >
                    <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative max-w-md w-full border-2 border-yellow-500"
                        onClick={(e) => e.stopPropagation()} // Empêche la fermeture si on clique dedans
                    >
                        <button onClick={() => setSelectedRank(null)}
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-500 text-white p-2 rounded-full"
                        >
                            ✖
                        </button>
                        <h2 className="text-2xl font-bold text-center text-yellow-400">
                            {data[typeMapping[selectedType]]?.[selectedRank] || "Inconnu"}
                        </h2>
                        <p className="text-center text-gray-300">
                            📜 {data[`Description (${selectedType})`]?.[selectedRank] || "Pas de description."}
                        </p>
                        <p className="text-center mt-4 text-lg font-bold text-yellow-400">
                            ⏳ Année : {data["Année"]?.[selectedRank] || "Inconnue"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Armee;
