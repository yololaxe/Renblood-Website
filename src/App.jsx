import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Players from "./pages/Players";
import PlayersAdmin from "./pages/PlayersAdmin";
import PlayerJobs from "./pages/PlayerJobs";
import CreatePlayer from "./pages/CreatePlayer";
import Map from "./pages/Map";
import Auth from "./pages/Auth";

import TalentSelection from "./pages/TalentSelection";
import TalentTree from "./pages/TalentTree";
import TalentTree2 from "./pages/TalentTree2";

import Account from "./pages/Account";
import Histoire from "./pages/Histoire";
import Navbar from "./components/Navbar";
import Character from "./pages/Character";
import Livres from "./pages/histoires/Livre";
import Chapitres from "./pages/histoires/livres/Chapitres";
import Familles from "./pages/histoires/Familles";
import Lois from "./pages/histoires/Lois";
import Politique from "./pages/histoires/Politique";
import Arbre from "./pages/histoires/Arbre";
import Armee from "./pages/histoires/Armee";
import Titres from "./pages/histoires/Titres";
import Guildes from "./pages/histoires/Guildes";

import PageTransition from "./components/PageTransition";

import "./index.css";

function AnimatedRoutes() {
  const location = useLocation(); // ✅ DOIT être dans un composant sous `Router`

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/home" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/histoire" element={<PageTransition><Histoire /></PageTransition>} />
        <Route path="/players" element={<PageTransition><Players /></PageTransition>} />
        <Route path="/players-admin" element={<PageTransition><PlayersAdmin /></PageTransition>} />
        <Route path="/player-jobs/:playerId" element={<PlayerJobs />} />
        <Route path="/create-player" element={<CreatePlayer />} />
        <Route path="/map" element={<PageTransition><Map /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        {/* <Route path="/talents" element={<PageTransition><Talents /></PageTransition>} /> */}
        <Route path="/account" element={<PageTransition><Account /></PageTransition>} />
        <Route path="/character" element={<PageTransition><Character /></PageTransition>} />

        <Route path="/talents" element={<PageTransition><TalentSelection /></PageTransition>} />
        <Route path="/talents/:profession" element={<TalentTree />} />
        <Route path="/talent2/:profession" element={<TalentTree2 />} />

        {/* Histoire : */}
        <Route path="/histoires/livres" element={<PageTransition><Livres /></PageTransition>} />
        <Route path="/histoires/livres/:livreId/chapitre/:chapitreId" element={<PageTransition><Chapitres /></PageTransition>} />
        <Route path="/histoires/familles" element={<PageTransition><Familles /></PageTransition>} />
        <Route path="/histoires/arbre/:famille" element={<PageTransition><Arbre /></PageTransition>} />
        <Route path="/histoires/lois" element={<PageTransition><Lois /></PageTransition>} />
        <Route path="/histoires/armee" element={<PageTransition><Armee /></PageTransition>} />
        <Route path="/histoires/politique" element={<PageTransition><Politique /></PageTransition>} />
        <Route path="/histoires/titres" element={<PageTransition><Titres /></PageTransition>} />
        <Route path="/histoires/guildes" element={<PageTransition><Guildes /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen">
      <Navbar />
      <AnimatedRoutes /> {/* ✅ Intégration du composant avec transitions */}
    </div>
  );
}

export default App;
