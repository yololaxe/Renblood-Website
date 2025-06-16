// src/pages/Metier.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { categories, specials } from '../../data/metiers';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { listenToAuthChanges } from '../../data/firebaseConfig';
import { getPlayerJobs } from '../../services/api';
import ToolTip from '../../components/Tooltip'; // Assure-toi que le chemin est correct

// Utility to normalize string: lowercase & remove accents
const normalizeString = str =>
    str
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();

function Badge({ children }) {
    return (
        <span className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium px-2 py-1 rounded-full">
            {children}
        </span>
    );
}

function JobCard({ job, level, xp }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ scale: 1.03 }}
            className="relative rounded-2xl shadow-xl overflow-hidden cursor-pointer"
        >
            {/* Niveau du joueur, si > 0, avec tooltip XP */}
            {/* test avec title natif */}
            {level > 0 && (
                <div
                    title={`${xp} XP`}
                    className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold z-10"
                >
                    {level}
                </div>
            )}


            <button
                className="w-full text-left focus:outline-none"
                onClick={() => setOpen(o => !o)}
            >
                <div className="relative group">
                    <img
                        src={job.image}
                        alt={job.name}
                        loading="lazy"
                        className="w-full aspect-video object-cover block rounded-t-2xl"
                    />
                    <div className="absolute bottom-0 left-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
                        <h3 className="text-white text-lg font-semibold drop-shadow-md">{job.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {job.mods.length > 0
                                ? job.mods.map(mod => <Badge key={mod}>{mod}</Badge>)
                                : <Badge>Aucun mod</Badge>
                            }
                        </div>
                    </div>
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold opacity-0 transition-opacity"
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                    >
                        {open ? <FiChevronUp /> : <FiChevronDown />}
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-4 pb-4 bg-gray-700 text-gray-200 space-y-2"
                    >
                        <p>{job.description}</p>
                        <p>
                            Difficulté : <strong>{job.difficulty}</strong>
                        </p>
                        <p>
                            Gain potentiel : <strong>{job.potentialGain}</strong>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function Metier() {
    const [activeTab, setActiveTab] = useState(categories[0].name);
    const [query, setQuery] = useState('');
    const [user, setUser] = useState(null);
    const [jobStats, setJobStats] = useState({}); // stocke { jobId: { level, xp } }

    // Prépare les onglets
    const tabs = useMemo(
        () => [...categories, { name: 'Spéciaux', jobs: specials }],
        []
    );

    // Filtrage par onglet ou global
    const filteredTabs = useMemo(
        () =>
            tabs.map(tab => ({
                ...tab,
                jobs: tab.jobs.filter(job =>
                    normalizeString(job.name).includes(normalizeString(query))
                )
            })),
        [tabs, query]
    );
    const allJobs = useMemo(
        () => [...categories.flatMap(cat => cat.jobs), ...specials],
        []
    );
    const filteredJobs = useMemo(
        () =>
            allJobs.filter(job =>
                normalizeString(job.name).includes(normalizeString(query))
            ),
        [allJobs, query]
    );

    // Écoute l'auth et charge niveaux + XP
    useEffect(() => {
        const unsubscribe = listenToAuthChanges(async firebaseUser => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const resp = await getPlayerJobs(firebaseUser.uid);
                const jobObj = resp.jobs.jobs; // l'objet { lumberjack: {...}, ... }
                // transforme en { jobId: { level, xp } }
                const stats = Object.fromEntries(
                    Object.entries(jobObj).map(([key, val]) => [
                        key,
                        { level: val.level || 0, xp: val.xp ?? 0 }
                    ])
                );
                setJobStats(stats);
            } else {
                setJobStats({});
            }
        });
        return () => unsubscribe && unsubscribe();
    }, []);

    return (
        <div className="px-8 md:px-16 bg-gray-900 min-h-screen mt-8">
            <div className="max-w-5xl mx-auto">
                {/* Search */}
                <div className="max-w-md mx-auto mb-8">
                    <div className="relative text-gray-400 focus-within:text-gray-200">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Rechercher un métier..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                        />
                    </div>
                </div>

                {/* Tabs (si pas de recherche) */}
                {query.length === 0 && (
                    <div className="flex flex-wrap justify-center space-x-4 mb-8">
                        {tabs.map(tab => (
                            <button
                                key={tab.name}
                                className={`px-4 py-2 font-medium ${activeTab === tab.name
                                        ? 'border-b-2 border-indigo-500 text-white'
                                        : 'text-gray-400 hover:text-gray-200'
                                    }`}
                                onClick={() => setActiveTab(tab.name)}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid 2x2 */}
                <div className="grid grid-cols-2 gap-6 mb-16">
                    <AnimatePresence>
                        {(query.length > 0 ? filteredJobs : filteredTabs.find(t => t.name === activeTab)?.jobs || [])
                            .map(job => {
                                const stats = jobStats[job.id] || { level: 0, xp: 0 };
                                return (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        level={user ? stats.level : 0}
                                        xp={user ? stats.xp : 0}
                                    />
                                );
                            })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
