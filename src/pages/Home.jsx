import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import YouTube from "react-youtube";
import { FaVolumeMute, FaVolumeUp } from "react-icons/fa";

function Home() {
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    document.title = "Renblood - Accueil";
  }, []);

  const toggleSound = (player) => {
    if (isMuted) {
      player.unMute();
    } else {
      player.mute();
    }
    setIsMuted(!isMuted);
  };

  const videoOptions = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      mute: 1,
      loop: 1,
      playlist: "jLFNzAMJ5DE", // ID de la vidéo pour la lecture en boucle
      modestbranding: 1,
      showinfo: 0,
      fs: 0,
      disablekb: 1,
      rel: 0,
      iv_load_policy: 3,
      cc_load_policy: 0,
      quality: "hd1080",
    },
  };

  return (
    <div className="text-white bg-gray-900 min-h-screen relative">
      {/* 🎇 Message d'intro avec vidéo de fond */}
      <div className="relative w-screen h-screen overflow-hidden">
        {/* Vidéo de fond YouTube */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <YouTube
            videoId="jLFNzAMJ5DE" // Remplace par l'ID de ta vidéo YouTube
            opts={videoOptions}
            className="full-screen-video"
            onReady={(event) => event.target.mute()}
          />
          {/* Filtre flou léger */}
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute inset-0 backdrop-blur-sm"></div>
        </div>

        {/* Icône de son */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => toggleSound(window.YT.get("player"))}
            className="text-white text-2xl bg-gray-700 p-2 rounded-full hover:bg-gray-600"
          >
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
        </div>

        {/* 🎇 Contenu du message d'intro */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          <img src="/accueil/logo.png" alt="Renblood" className="w-48 mb-4 drop-shadow-lg" />
          <h1 className="text-4xl md:text-6xl font-bold">Bienvenue sur Renblood</h1>
          <p className="text-lg text-gray-300 mt-2">Un monde Semi-RP où votre aventure commence.</p>
          <motion.button
            onClick={() => window.location.href = "https://discord.gg/uwNy5tM8jU"}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="mt-6 px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-500 transition"
          >
            Rejoindre l'Aventure
          </motion.button>
        </motion.div>
      </div>

      {/* 🗺️ Présentation du Royaume */}
      <motion.section
        className="p-10 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-bold mb-6">🗺️ Le Royaume de Renblood</h2>
        <img src="/accueil/carte-renblood.png" alt="Carte" className="w-full max-w-3xl mx-auto rounded-lg shadow-md" />
        <p className="text-lg text-gray-300 mt-4 max-w-2xl mx-auto">
          Un vaste monde rempli de mystères, de royaumes et de dangers. Découvrez ses grandes villes et aventurez-vous à travers ses terres.
        </p>
      </motion.section>

      {/* 🌆 Grandes Villes */}
      <motion.section
        className="p-10 text-center bg-gray-800"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-bold mb-6">🌆 Les Grandes Villes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {["ville1.png", "ville2.png", "ville3.png", "ville4.png"].map((image, index) => (
            <motion.div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <img src={`/accueil/${image}`} alt={`Ville ${index + 1}`} className="w-full h-56 object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <p className="text-xl font-bold">🏰 Ville {index + 1}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ⚒️ Les Métiers */}
      <motion.section
        className="p-10 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-bold mb-6">⚒️ Les Métiers</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {["job1.png", "job2.png"].map((job, index) => (
            <motion.div
              key={index}
              className="relative bg-gray-800 p-4 rounded-lg shadow-lg hover:scale-105 transition cursor-pointer"
            >
              <img src={`/accueil/${job}`} alt={`Métier ${index + 1}`} className="w-48 h-48 object-cover rounded-md" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 📸 Screenshots */}
      <motion.section
        className="p-10 text-center bg-gray-800"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-bold mb-6">📸 Aperçu du Serveur</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {["screen1.png", "screen2.png", "screen3.png", "screen4.png", "screen5.png"].map((screen, index) => (
            <motion.div
              key={index}
              className="overflow-hidden rounded-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              <img src={`/accueil/${screen}`} alt={`Screenshot ${index + 1}`} className="w-full h-40 object-cover" />
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* 🚀 Rejoindre l'aventure */}
      <motion.div
        className="text-center p-10"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <h2 className="text-3xl font-bold mb-4">🚀 Rejoignez-nous dès maintenant !</h2>
        <motion.button
        onClick={() => window.location.href = "https://discord.gg/uwNy5tM8jU"}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="px-8 py-3 bg-green-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-green-500 transition"
        >
          Rejoindre l'Aventure
        </motion.button>
      </motion.div>
      
    </div>
  );
}

export default Home;
