import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Players from "./pages/Players";
import Map from "./pages/Map";
import Auth from "./pages/Auth";
import Talents from "./pages/Talents";
import Account from "./pages/Account";
import Histoire from "./pages/Histoire";
import Navbar from "./components/Navbar";
import Livres from "./pages/histoires/Livre";
import Chapitres from "./pages/histoires/livres/Chapitres";
import Familles from "./pages/histoires/Familles";
import Lois from "./pages/histoires/Lois";
import Politique from "./pages/histoires/Politique";
import Arbre from "./pages/histoires/Arbre";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-gray-200 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/histoire" element={<Histoire />} />
          <Route path="/players" element={<Players />} />
          <Route path="/map" element={<Map />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/talents" element={<Talents />} />
          <Route path="/account" element={<Account />} />
          {/* Histoire : */}
          <Route path="/histoires/livres" element={<Livres />} />
          <Route path="/histoires/livres/:livreId/chapitre/:chapitreId" element={<Chapitres />} />
          <Route path="/histoires/familles" element={<Familles />} />
          <Route path="/histoires/arbre/:famille" element={<Arbre />} />
          <Route path="/histoires/lois" element={<Lois />} />
          <Route path="/histoires/politique" element={<Politique />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
