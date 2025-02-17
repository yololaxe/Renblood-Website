import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-center space-x-6">
      <Link to="/" className="hover:text-gray-400">Accueil</Link>
      <Link to="/histoire" className="hover:text-gray-400">Histoire</Link> {/* ✅ Nouveau lien */}
      <Link to="/players" className="hover:text-gray-400">Joueurs</Link>
      <Link to="/map" className="hover:text-gray-400">Carte</Link>
      <Link to="/auth" className="hover:text-gray-400">Connexion</Link>
    </nav>
  );
}

export default Navbar;
