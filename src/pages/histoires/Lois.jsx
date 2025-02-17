import React from "react";
import lois from "../../data/lois"; // ✅ Importation des lois

function Lois() {
  return (
    <div className="p-10 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold text-center mb-6">⚖️ Lois du Royaume</h1>
      <div className="overflow-x-auto">
        <div className="flex space-x-6 w-max">
          {lois.map((loi, index) => (
            <div key={index} className="border border-gray-600 rounded-lg shadow-lg bg-gray-800 w-96 min-w-[24rem]">
              <h2 className="text-2xl font-bold text-center p-4 border-b border-gray-700 bg-gray-700">
                {loi.titre}
              </h2>
              <div className="p-4">
                {loi.articles.map((article, i) => (
                  <div key={i} className="mb-4 border-b border-gray-700 pb-3">
                    <h3 className="text-lg font-bold text-gray-300">{article.titre}</h3>
                    <ul className="text-gray-400">
                      {article.contenu.map((paragraphe, j) => (
                        <li key={j} className="mt-1">📜 {paragraphe}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Lois;
