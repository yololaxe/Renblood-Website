import React,{ useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// 📜 Liste des familles avec leurs détails
const familles = [
  {
    id: 1,
    nom: "Rollingford",
    comté: "Mofrage",
    ville: "Triomphe",
    symbole: "Ours",
    blason: "/blasons/rollingford.png",
    argent: 210,
    armee: 3200,
    chevaux: 1200,
    dragons: 3,
    batiments: 60,
    magiciens: 300,
    navires: 150,
    relationRoyale: 100,
    puissance: 16010,
    description:
      "Les Rollingford sont une famille puissante et influente du comté de Mofrage, connue pour leur force militaire et leur influence royale.",
  },
  {
    id: 2,
    nom: "Chalk",
    comté: "Mofrage",
    ville: "Sylinore",
    symbole: "Arc",
    blason: "/blasons/chalk.png",
    argent: 75,
    armee: 300,
    chevaux: 150,
    dragons: 0,
    batiments: 50,
    magiciens: 110,
    navires: 0,
    relationRoyale: 35,
    puissance: 4305,
    description:
      "Les Chalk sont des érudits et des archers redoutables, souvent alliés aux magiciens du royaume.",
  },
  {
    id: 3,
    nom: "Feran",
    comté: "Mofrage",
    ville: "Isvanore",
    symbole: "Livre",
    blason: "/blasons/feran.png",
    argent: 130,
    armee: 700,
    chevaux: 150,
    dragons: 0,
    batiments: 40,
    magiciens: 110,
    navires: 80,
    relationRoyale: 30,
    puissance: 3830,
    description:
      "Les Feran sont les gardiens du savoir et de la culture, réputés pour leur érudition et leurs bibliothèques.",
  },
  {
    id: 4,
    nom: "Banefort",
    comté: "Eldia",
    ville: "Fyvelune",
    symbole: "Âne",
    blason: "/blasons/banefort.png",
    argent: 220,
    armee: 1000,
    chevaux: 2400,
    dragons: 0,
    batiments: 120,
    magiciens: 40,
    navires: 60,
    relationRoyale: 40,
    puissance: 12640,
    description:
      "Les Banefort sont des seigneurs agricoles et marchands influents, possédant d'immenses terres fertiles et un important réseau commercial.",
  },
  {
    id: 5,
    nom: "Rok",
    comté: "Eldia",
    ville: "Saint Toufion de Paume",
    symbole: "Roue",
    blason: "/blasons/rok.png",
    argent: 250,
    armee: 800,
    chevaux: 1000,
    dragons: 0,
    batiments: 60,
    magiciens: 55,
    navires: 30,
    relationRoyale: 30,
    puissance: 9060,
    description:
      "Les Rok sont des stratèges et ingénieurs, experts en sièges et en constructions militaires, jouant un rôle clé dans la défense du royaume.",
  },
  {
    id: 6,
    nom: "Wyne",
    comté: "Palam",
    ville: "Circos",
    symbole: "Dragon",
    blason: "/blasons/wyne.png",
    argent: 180,
    armee: 1400,
    chevaux: 900,
    dragons: 11,
    batiments: 30,
    magiciens: 135,
    navires: 40,
    relationRoyale: 30,
    puissance: 14090,
    description:
      "Les Wyne sont des seigneurs draconiques, maîtres dans l'élevage et le dressage des dragons, leur conférant une puissance inégalée sur le champ de bataille.",
  },
  {
    id: 7,
    nom: "Roxton",
    comté: "Palam",
    ville: "Rozdru",
    symbole: "Navire",
    blason: "/blasons/roxton.png",
    argent: 120,
    armee: 1500,
    chevaux: 250,
    dragons: 10,
    batiments: 50,
    magiciens: 30,
    navires: 50,
    relationRoyale: 15,
    puissance: 7610,
    description:
      "Les Roxton sont une famille de navigateurs et de conquérants, à l’origine de nombreuses batailles navales et explorations maritimes.",
  },
  {
    id: 8,
    nom: "Lynster",
    comté: "Cornwall",
    ville: "Colrac",
    symbole: "Loup",
    blason: "/blasons/linster.png",
    argent: 220,
    armee: 1000,
    chevaux: 1900,
    dragons: 0,
    batiments: 30,
    magiciens: 40,
    navires: 40,
    relationRoyale: 15,
    puissance: 9360,
    description:
      "Les Linster sont des seigneurs du Nord, réputés pour leur résilience et leurs capacités de survie dans les conditions les plus rudes.",
  },
  {
    id: 9,
    nom: "Goodbrook",
    comté: "Cornwall",
    ville: "Moria",
    symbole: "Hache",
    blason: "/blasons/goodbrook.png",
    argent: 130,
    armee: 800,
    chevaux: 400,
    dragons: 0,
    batiments: 15,
    magiciens: 30,
    navires: 15,
    relationRoyale: 10,
    puissance: 4640,
    description:
      "Les Goodbrook sont une lignée de nains forgerons, maîtres de l’artisanat et des souterrains, produisant les armes et armures les plus redoutables du royaume.",
  },
];


export default function Familles() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);

  return (
    <div className="min-h-screen bg-gray-900 px-6 py-12 text-gray-200">
      {/* Page title */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1
          className="
            inline-block px-4 py-2
            text-4xl md:text-5xl font-extrabold
            bg-gradient-to-r from-green-300 to-blue-400
            text-transparent bg-clip-text
          "
        >
          🏰 Grandes Familles
        </h1>
        <p className="mt-4 text-lg text-gray-400">
          Découvrez l’histoire et la puissance des dynasties de Renblood
        </p>
      </header>

      {/* Family cards */}
      <div className={`grid gap-8 max-w-6xl mx-auto ${selected ? "opacity-30 pointer-events-none" : ""}`}
           style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))" }}>
        {familles.map(f => (
          <motion.div
            key={f.id}
            onClick={() => setSelected(f.id)}
            className="
              flex flex-col items-center
              bg-gray-800 rounded-2xl p-6 cursor-pointer
              shadow-lg hover:shadow-2xl transition
            "
            whileHover={{ scale: 1.03 }}
          >
            <img
              src={f.blason}
              alt={`${f.nom} blason`}
              className="w-24 h-24 object-cover rounded-full border-2 border-gray-700"
            />
            <h2 className="mt-4 text-2xl font-bold">{f.nom}</h2>
            <p className="mt-1 text-sm text-gray-400">{f.comté}, {f.ville}</p>
          </motion.div>
        ))}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="
              fixed inset-0 z-50 flex items-center justify-center
              bg-black bg-opacity-50 backdrop-blur-sm
            "
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="
                bg-gray-800 rounded-2xl max-w-xl w-full p-8
                shadow-2xl relative text-gray-200
              "
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-100 text-3xl"
                onClick={() => setSelected(null)}
              >
                &times;
              </button>

              {(() => {
                const f = familles.find(x => x.id === selected);
                return (
                  <>
                    <div className="flex flex-col items-center mb-6">
                      <img
                        src={f.blason}
                        alt={f.nom}
                        className="w-32 h-32 rounded-full border-4 border-gray-700 mb-4"
                      />
                      <h2 className="text-3xl font-bold">{f.nom}</h2>
                      <p className="mt-2 text-gray-400 text-center">
                        {f.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-left mb-6">
                      <div><strong>📍 Comté:</strong> {f.comté}</div>
                      <div><strong>🏙 Ville:</strong> {f.ville}</div>
                      <div><strong>⚔ Armée:</strong> {f.armee.toLocaleString()}</div>
                      <div><strong>🐎 Chevaux:</strong> {f.chevaux.toLocaleString()}</div>
                      <div><strong>🐉 Dragons:</strong> {f.dragons}</div>
                      <div><strong>🏰 Bâtiments:</strong> {f.batiments}</div>
                      <div><strong>🔮 Magiciens:</strong> {f.magiciens}</div>
                      <div><strong>⛵ Navires:</strong> {f.navires}</div>
                      <div><strong>💰 Argent:</strong> {f.argent} or</div>
                      <div><strong>👑 Relation Royale:</strong> {f.relationRoyale}%</div>
                      <div className="sm:col-span-2"><strong>🔥 Puissance:</strong> {f.puissance.toLocaleString()}</div>
                    </div>

                    <button
                      onClick={() => navigate(`/histoires/arbre/${f.nom.toLowerCase()}`)}
                      className="
                        w-full py-3 bg-green-500 hover:bg-green-400
                        rounded-full text-lg font-semibold
                        transition transform hover:scale-102
                      "
                    >
                      🌳 Voir l’Arbre Généalogique
                    </button>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}