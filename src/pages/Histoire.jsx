import { Link } from "react-router-dom";

function Histoire() {
  return (
    <div className="p-10 text-center text-gray-200">
      <h1 className="text-4xl font-bold text-white mb-6">📜 L'Histoire de Renblood</h1>
      <p className="text-lg max-w-3xl mx-auto mb-10">
        Découvrez les fondements du royaume à travers ses archives et récits...
      </p>

      {/* ✅ Section des boutons améliorés */}
      <div className="grid grid-cols-3 gap-10 max-w-lg mx-auto">
        <Link
          to="/histoires/livres"
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex justify-center items-center transition-transform transform hover:scale-105 group"
        >
          <img
            loading="lazy"
            src="/images/livres.jpg"
            alt="Livres"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 rounded-xl"
          />
          <span className="relative z-10">📖 Les Livres</span>
        </Link>

        <Link
          to="/histoires/familles"
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex justify-center items-center transition-transform transform hover:scale-105 group"
        >
          <img
            src="/images/familles.jpg"
            alt="Familles"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 rounded-xl"
          />
          <span className="relative z-10">🏰 Les Familles</span>
        </Link>

        <Link
          to="/histoires/lois"
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex justify-center items-center transition-transform transform hover:scale-105 group"
        >
          <img
            src="/images/lois.jpg"
            alt="Lois"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 rounded-xl"
          />
          <span className="relative z-10">⚖️ Les Lois</span>
        </Link>

        <Link
          to="/histoires/politique"
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex justify-center items-center transition-transform transform hover:scale-105 group"
        >
          <img
            src="/images/politique.jpg"
            alt="Politique"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 rounded-xl"
          />
          <span className="relative z-10">🏛️ La Politique</span>
        </Link>
        <Link
          to="/histoires/armee"
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex justify-center items-center transition-transform transform hover:scale-105 group"
        >
          <img
            src="/images/armee.jpg"
            alt="Armée"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 rounded-xl"
          />
          <span className="relative z-10">⚔️ L'Armée</span>
        </Link>
        <Link
          to="/histoires/titres"
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex justify-center items-center transition-transform transform hover:scale-105 group"
        >
          <img
            src="/images/titre.jpg"
            alt="Titres"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 rounded-xl"
          />
          <span className="relative z-10">🏅 Les Titres</span>
        </Link>
        <Link
          to="/histoires/guildes"
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex justify-center items-center transition-transform transform hover:scale-105 group"
        >
          <img
            src="/images/guildes.jpg"
            alt="Guildes"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 rounded-xl"
          />
          <span className="relative z-10">🛡️ Les Guildes</span>
        </Link>
        <Link
          to="/histoires/metiers"
          className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg text-xl font-semibold flex justify-center items-center transition-transform transform hover:scale-105 group"
        >
          <img
            src="/images/metiers.jpg"
            alt="Métiers"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 rounded-xl"
          />
          <span className="relative z-10">💼 Les Métiers</span>
        </Link>
      </div>
    </div>
  );
}

export default Histoire;
