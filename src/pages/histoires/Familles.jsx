import { useState } from "react";
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


function Familles() {
  const navigate = useNavigate();
  const [familleSelectionnee, setFamilleSelectionnee] = useState(null);

  return (
    <div className="p-10 text-center text-gray-200 relative">
      <h1 className="text-4xl font-bold text-white mb-6">🏰 Les Grandes Familles de Renblood</h1>
      <p className="text-lg max-w-3xl mx-auto mb-10">
        Découvrez l’histoire et la puissance des familles nobles du royaume.
      </p>

      {/* 📜 Affichage des cartes des familles */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto ${familleSelectionnee ? "hidden" : ""}`}>
        {familles.map((famille) => (
          <motion.div
            key={famille.id}
            onClick={() => setFamilleSelectionnee(famille.id)}
            className="relative bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl shadow-lg cursor-pointer transition-transform hover:scale-105 flex flex-col items-center"
            whileHover={{ scale: 1.05 }}
          >
            <img src={famille.blason} alt={famille.nom} className="w-32 h-32 object-cover rounded-lg" />
            <h2 className="text-2xl font-bold mt-4">{famille.nom}</h2>
          </motion.div>
        ))}
      </div>

      {/* 📖 Affichage des détails d'une famille sélectionnée */}
      <AnimatePresence>
        {familleSelectionnee && (
          <motion.div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center p-10 backdrop-blur-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setFamilleSelectionnee(null)}
          >
            {/* 📜 Récupération des infos de la famille sélectionnée */}
            {(() => {
              const famille = familles.find((f) => f.id === familleSelectionnee);
              return (

                <motion.div
                  className="relative bg-gray-800/90 p-8 rounded-xl shadow-2xl text-white w-full max-w-3xl border border-gray-700"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  onClick={(e) => e.stopPropagation()} // ❌ Empêche la fermeture quand on clique DANS la carte
                >

                  <button
                    onClick={() => setFamilleSelectionnee(null)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-200 text-3xl"
                  >
                    ✖
                  </button>

                  <h2 className="text-3xl font-bold mb-4">{famille.nom}</h2>
                  <div className="flex justify-center mb-4">
                    <img src={famille.blason} alt={famille.nom} className="w-40 h-40 object-cover rounded-md shadow-lg" />
                  </div>
                  <p className="text-lg mb-4">{famille.description}</p>

                  {/* 📊 Détails des statistiques */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left text-lg">
                    <p><strong>📍 Comté :</strong> {famille.comté}</p>
                    <p><strong>🏙 Ville :</strong> {famille.ville}</p>
                    <p><strong>⚔ Armée :</strong> {famille.armee} soldats</p>
                    <p><strong>🐎 Chevaux :</strong> {famille.chevaux}</p>
                    <p><strong>🐉 Dragons :</strong> {famille.dragons}</p>
                    <p><strong>🏰 Bâtiments :</strong> {famille.batiments}</p>
                    <p><strong>🔮 Magiciens :</strong> {famille.magiciens}</p>
                    <p><strong>⛵ Navires :</strong> {famille.navires}</p>
                    <p><strong>💰 Argent :</strong> {famille.argent} or</p>
                    <p><strong>👑 Relation Royale :</strong> {famille.relationRoyale}%</p>
                    <p><strong>🔥 Puissance :</strong> {famille.puissance}</p>
                  </div>

                  {/* 🌳 Bouton pour ouvrir l’arbre généalogique */}

                  <button
                    onClick={() => navigate(`/histoires/arbre/${famille.nom.toLowerCase()}`)}
                    className="mt-6 bg-green-600 hover:bg-green-500 text-white p-4 rounded-lg text-lg font-semibold transition-transform hover:scale-105"
                  >
                    🌳 Voir l’Arbre Généalogique
                  </button>
                </motion.div>
              );
            })()}
          </motion.div>
        )
        }
      </AnimatePresence>
    </div>
  );
}

export default Familles;
