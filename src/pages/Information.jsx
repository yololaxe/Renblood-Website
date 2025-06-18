// src/pages/Information.jsx
import { Link } from "react-router-dom";

const sections = [
  { to: "livres", icon: "📖", label: "Les Livres", img: "/images/livres.jpg" },
  { to: "familles", icon: "🏰", label: "Les Familles", img: "/images/familles.jpg" },
  { to: "lois", icon: "⚖️", label: "Les Lois", img: "/images/lois.jpg" },
  { to: "politique", icon: "🏛️", label: "La Politique", img: "/images/politique.jpg" },
  { to: "armee", icon: "⚔️", label: "L’Armée", img: "/images/armee.jpg" },
  { to: "titres", icon: "🏅", label: "Les Titres", img: "/images/titre.jpg" },
  { to: "guildes", icon: "🛡️", label: "Les Guildes", img: "/images/guildes.jpg" },
  { to: "metiers", icon: "💼", label: "Les Métiers", img: "/images/metiers.jpg" },
];

export default function Information() {
  return (
    <section className="px-4 py-12 bg-gray-900 text-gray-200">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-blue-400 mb-4">
          📜 L'Histoire de Renblood
        </h1>
        <p className="text-lg text-gray-300 mb-12">
          Plongez dans les récits et archives qui forgent la légende de notre royaume.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {sections.map(({ to, icon, label, img }) => (
            <Link
              key={to}
              to={`/histoires/${to}`}
              className="group relative block rounded-xl overflow-hidden bg-gray-800 shadow-lg hover:shadow-2xl transform hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img
                  src={img}
                  alt={label}
                  loading="lazy"
                  className="w-full h-full object-cover filter brightness-75 group-hover:brightness-90 transition duration-300"
                />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-48 p-6">
                <span className="text-4xl mb-2">{icon}</span>
                <span className="text-xl font-semibold text-white">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
