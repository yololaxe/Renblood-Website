import React from "react";
import titresRoyaume from "../../data/Titre";

function Titres() {
    return (
        <div className="bg-gray-900 text-white min-h-screen p-6">
            <h1 className="text-4xl font-bold text-center mb-6">🏅 Titres du Royaume</h1>
            <p className="text-lg text-center mb-6 max-w-3xl mx-auto">
                Découvrez les différents titres sociaux et leurs conditions d'accès dans le royaume.
            </p>

            <div className="overflow-x-auto">
                <table className="w-full border border-gray-700 text-center">
                    <thead>
                        <tr className="bg-gray-800 text-lg">
                            <th className="p-3 border border-gray-700">Titre</th>
                            <th className="p-3 border border-gray-700">Description</th>
                            <th className="p-3 border border-gray-700">Conditions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {titresRoyaume.map((titre, index) => (
                            <tr 
                                key={index} 
                                className="hover:bg-gray-700 cursor-pointer transition-all duration-200"
                            >
                                <td className="p-3 border border-gray-700 font-bold">{titre.titre}</td>
                                <td className="p-3 border border-gray-700">{titre.description}</td>
                                <td className="p-3 border border-gray-700">{titre.requis}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Titres;
