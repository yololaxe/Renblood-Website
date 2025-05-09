import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaPatreon, FaDiscord} from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-2">
      <div className="container mx-auto flex justify-center items-center space-x-6">
        {/* Texte de copyright */}
        <p className="text-sm">© Renblood Company - Developed and designed by Yololaxe.</p>

        {/* Séparateur */}
        <span className="mx-2">|</span>

        {/* Liens vers les réseaux sociaux avec icônes */}
        <div className="flex space-x-4">
          <a
            href="https://x.com/Yololaxe2"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="https://www.instagram.com/royaume.renblood/?locale=fr_FR&hl=bn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="https://www.patreon.com/c/Yololaxe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400"
          >
            <FaPatreon size={20} />
          </a>
          <a
            href="https://discord.gg/69Zv8nhM8Q"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400"
          >
            <FaDiscord size={20} />
          </a>
        </div>

        {/* Séparateur */}
        <span className="mx-2">|</span>

        {/* Liens de navigation */}
        <div className="flex space-x-4">
          <Link to="/status" className="hover:text-gray-400">Status SOON...</Link>
          <Link to="/tos" className="hover:text-gray-400">TOS/CGV SOON...</Link>
          <Link to="/legal" className="hover:text-gray-400">Legal mention SOON...</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
