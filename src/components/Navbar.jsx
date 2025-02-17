import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <ul className="flex justify-around">
        <li><Link to="/" className="text-white">Accueil</Link></li>
        <li><Link to="/players" className="text-white">Joueurs</Link></li>
        <li><Link to="/map" className="text-white">Carte</Link></li>
        <li><Link to="/auth" className="text-white">Connexion</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
