import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Players from "./pages/Players";
import Map from "./pages/Map";
import Auth from "./pages/Auth";
import Talents from "./pages/Talents";
import Account from "./pages/Account";
import Navbar from "./components/Navbar";
import "./index.css";

function App() {
  return (
    <Router>
      <div className="bg-gray-900 text-gray-200 min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/players" element={<Players />} />
          <Route path="/map" element={<Map />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/talents" element={<Talents />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
