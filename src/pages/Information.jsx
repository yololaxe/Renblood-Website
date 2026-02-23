// src/pages/Information.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBook, FaLandmark, FaBalanceScale, FaChessRook, FaShieldAlt, FaMedal, FaUsers, FaHammer } from "react-icons/fa";

const sections = [
  { to: "livres", icon: <FaBook />, label: "Les Livres", desc: "Chroniques et légendes anciennes.", color: "from-amber-500 to-orange-600" },
  { to: "familles", icon: <FaLandmark />, label: "Les Familles", desc: "Lignées nobles et alliances.", color: "from-purple-500 to-indigo-600" },
  { to: "lois", icon: <FaBalanceScale />, label: "Les Lois", desc: "Code pénal et règles de vie.", color: "from-red-500 to-rose-600" },
  { to: "politique", icon: <FaChessRook />, label: "La Politique", desc: "Intrigues et gouvernance.", color: "from-blue-500 to-cyan-600" },
  { to: "armee", icon: <FaShieldAlt />, label: "L’Armée", desc: "Forces militaires et défense.", color: "from-gray-500 to-slate-600" },
  { to: "titres", icon: <FaMedal />, label: "Les Titres", desc: "Rangs et distinctions.", color: "from-yellow-400 to-amber-500" },
  { to: "guildes", icon: <FaUsers />, label: "Les Guildes", desc: "Organisations et confréries.", color: "from-green-500 to-emerald-600" },
  { to: "metiers", icon: <FaHammer />, label: "Les Métiers", desc: "Savoir-faire et artisanat.", color: "from-teal-500 to-cyan-600" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function Information() {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      
      {/* --- HERO SECTION --- */}
      <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/accueil/carte-renblood.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 via-gray-900/80 to-gray-900" />
        
        <div className="relative z-10 text-center px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-600 mb-4 drop-shadow-lg"
          >
            Archives Royales
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-light italic"
          >
            "Celui qui ne connaît pas l'histoire est condamné à la revivre. 
            Explorez le savoir de Renblood."
          </motion.p>
        </div>
      </div>

      {/* --- GRID SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 pb-20 -mt-10 relative z-20">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {sections.map(({ to, icon, label, desc, color }) => (
            <motion.div key={to} variants={item}>
              <Link
                to={`/histoires/${to}`}
                className="group block h-full bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg hover:shadow-2xl hover:border-gray-500 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`h-2 bg-gradient-to-r ${color}`} />
                <div className="p-6 flex flex-col items-center text-center h-full">
                  <div className={`text-4xl mb-4 bg-gradient-to-br ${color} bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300`}>
                    {icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                    {label}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    {desc}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

    </div>
  );
}
