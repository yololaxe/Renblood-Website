import { useState } from "react";
import { motion } from "framer-motion";
import { FaFeatherAlt, FaNewspaper } from "react-icons/fa";
import journalEditions from "../../data/journal";

export default function Journal() {
  const [selectedId, setSelectedId] = useState(journalEditions[0]?.id);
  const edition = journalEditions.find((item) => item.id === selectedId);

  return (
    <div className="min-h-screen bg-stone-950 px-4 py-12 text-stone-900">
      <div className="mx-auto max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center text-stone-100"
        >
          <FaNewspaper className="mx-auto mb-4 text-5xl text-amber-500" />
          <h1 className="font-serif text-5xl font-black md:text-7xl">Le Journal de Shaleton</h1>
          <p className="mt-3 text-stone-400">Feuille quotidienne tenue par Paul Mortadelle</p>
        </motion.header>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-xl border border-stone-700 bg-stone-900 p-4 lg:sticky lg:top-24">
            <h2 className="mb-4 border-b border-stone-700 pb-3 font-serif text-xl font-bold text-amber-400">
              Éditions publiées
            </h2>
            <div className="space-y-2">
              {journalEditions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full rounded-lg p-3 text-left transition ${
                    item.id === selectedId
                      ? "bg-amber-700 text-white"
                      : "bg-stone-800 text-stone-300 hover:bg-stone-700"
                  }`}
                >
                  <span className="block text-xs uppercase tracking-wider opacity-70">{item.publication}</span>
                  <span className="mt-1 block font-serif font-bold">{item.title}</span>
                </button>
              ))}
            </div>
          </aside>

          {edition && (
            <motion.article
              key={edition.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-sm border border-amber-950/30 bg-[#eee3c5] shadow-2xl"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 20% 20%, rgba(120, 80, 30, 0.08), transparent 30%), radial-gradient(circle at 80% 70%, rgba(120, 80, 30, 0.06), transparent 35%)",
              }}
            >
              <div className="border-b-4 border-double border-stone-800 px-6 py-8 text-center md:px-12">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-900">{edition.publication}</p>
                <h2 className="mt-4 font-serif text-4xl font-black leading-tight md:text-6xl">{edition.title}</h2>
                <p className="mt-4 flex items-center justify-center gap-2 italic text-stone-700">
                  <FaFeatherAlt /> Par {edition.author}
                </p>
              </div>

              <div className="px-6 py-8 md:px-12 md:py-12">
                <div className="mb-10 space-y-4 border-b border-stone-500 pb-8 font-serif text-lg leading-8">
                  {edition.intro.map((paragraph, index) => (
                    <p key={index} className={paragraph === "Zeubillage devient Shaleton." ? "text-center text-2xl font-black" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="columns-1 gap-10 md:columns-2">
                  {edition.sections.map((section) => (
                    <section key={section.title} className="mb-9 break-inside-avoid border-t-2 border-stone-800 pt-3">
                      <h3 className="mb-3 font-serif text-2xl font-black leading-tight">{section.title}</h3>
                      <div className="space-y-3 text-justify font-serif leading-7 text-stone-800">
                        {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </motion.article>
          )}
        </div>
      </div>
    </div>
  );
}
