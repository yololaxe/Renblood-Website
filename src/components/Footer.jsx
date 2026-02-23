import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaPatreon, FaDiscord, FaEnvelope } from "react-icons/fa";

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 text-center">
        {/* Texte de copyright */}
        <p className="text-sm">© Renblood Company - Developed and designed by Yololaxe.</p>

        {/* Séparateur desktop */}
        <span className="hidden md:inline mx-2">|</span>

        {/* Liens vers les réseaux sociaux avec icônes */}
        <div className="flex space-x-4">
          <a
            href="https://x.com/Yololaxe2"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="https://www.instagram.com/royaume.renblood/?locale=fr_FR&hl=bn"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="https://www.patreon.com/c/Yololaxe"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition"
          >
            <FaPatreon size={20} />
          </a>
          <a
            href="https://discord.gg/69Zv8nhM8Q"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-400 transition"
          >
            <FaDiscord size={20} />
          </a>
        </div>

        {/* Séparateur desktop */}
        <span className="hidden md:inline mx-2">|</span>

        {/* Liens de navigation */}
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a href="mailto:leroyaumederenblood@gmail.com" className="hover:text-gray-400 flex items-center gap-1 transition">
            <FaEnvelope /> Contact
          </a>
          <Link to="/tos" className="hover:text-gray-400 transition">CGU</Link>
          <Link to="/legal" className="hover:text-gray-400 transition">Mentions Légales</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
