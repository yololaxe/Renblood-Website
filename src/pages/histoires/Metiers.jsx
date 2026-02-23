// src/pages/Metier.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { categories, specials } from '../../data/metiers';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { listenToAuthChanges } from '../../data/firebaseConfig';
import { getPlayerJobs } from '../../services/api';
import { FaHammer, FaLeaf, FaGem, FaUtensils, FaConciergeBell, FaStar } from "react-icons/fa";

// Utility to normalize string: lowercase & remove accents
const normalizeString = str =>
    str
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();

function Badge({ children }) {
    return (
        <span className="inline-block bg-gray-900/50 text-gray-300 text-xs font-medium px-2 py-1 rounded border border-gray-600">
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
            whileHover={{ y: -5 }}
            className="flex flex-col h-full rounded-xl shadow-lg overflow-hidden cursor-pointer bg-gray-800 border border-gray-700 hover:border-teal-500/50 transition-all group"
        >
            {/* Niveau du joueur, si > 0 */}
            {level > 0 && (
                <div
                    title={`${xp} XP`}
                    className="absolute top-3 right-3 bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold z-20 shadow-lg border border-teal-400"
                >
                    {level}
                </div>
            )}

            <button
                className="w-full text-left focus:outline-none relative"
                onClick={() => setOpen(o => !o)}
            >
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={job.image}
                        alt={job.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90" />
                    
                    <div className="absolute bottom-0 left-0 p-4 w-full">
                        <h3 className="text-white text-xl font-bold drop-shadow-md group-hover:text-teal-400 transition-colors">{job.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-1">
                            {job.mods.length > 0
                                ? job.mods.slice(0, 3).map(mod => <Badge key={mod}>{mod}</Badge>)
                                : <Badge>Aucun mod</Badge>
                            }
                            {job.mods.length > 3 && <Badge>+{job.mods.length - 3}</Badge>}
                        </div>
                    </div>

                    <motion.div
                        className="absolute inset-0 flex items-center justify-center text-white text-4xl opacity-0 transition-opacity bg-black/30 backdrop-blur-sm"
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
                        className="p-5 bg-gray-800 border-t border-gray-700 text-sm text-gray-300 space-y-3"
                    >
                        <p className="italic border-l-2 border-teal-500 pl-3">{job.description}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                                <span className="block text-xs text-gray-500 uppercase font-bold">Difficulté</span>
                                <span className={`font-medium ${job.difficulty === 'Facile' ? 'text-green-400' : job.difficulty === 'Moyenne' ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {job.difficulty}
                                </span>
                            </div>
                            <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                                <span className="block text-xs text-gray-500 uppercase font-bold">Gain</span>
                                <span className="text-white truncate" title={job.potentialGain}>{job.potentialGain}</span>
                            </div>
                        </div>
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
    const [jobStats, setJobStats] = useState({});

    const tabs = useMemo(
        () => [...categories, { name: 'Spéciaux', jobs: specials }],
        []
    );

    const icons = {
        "Bois": <FaLeaf />,
        "Pierre": <FaGem />,
        "Nourriture": <FaUtensils />,
        "Services": <FaConciergeBell />,
        "Spéciaux": <FaStar />,
    };

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

    useEffect(() => {
        const unsubscribe = listenToAuthChanges(async firebaseUser => {
            setUser(firebaseUser);
            if (firebaseUser) {
                const resp = await getPlayerJobs(firebaseUser.uid);
                const jobObj = resp?.jobs?.jobs || {};
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
        <div className="min-h-screen bg-gray-900 text-gray-200 pb-20">
            
            {/* Hero Header */}
            <div className="relative bg-gray-800 border-b border-gray-700 py-16 px-4 mb-12 text-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-5 pointer-events-none" />
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-600 mb-4 relative z-10"
                >
                    Artisanat & Métiers
                </motion.h1>
                <p className="text-gray-400 max-w-2xl mx-auto relative z-10 text-lg">
                    Explorez les carrières disponibles, apprenez les ficelles du métier et devenez un maître artisan.
                </p>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Search */}
                <div className="max-w-md mx-auto mb-10">
                    <div className="relative text-gray-400 focus-within:text-teal-400 transition-colors">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl" />
                        <input
                            type="text"
                            placeholder="Rechercher un métier..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-white shadow-lg transition"
                        />
                    </div>
                </div>

                {/* Tabs */}
                {query.length === 0 && (
                    <div className="flex flex-wrap justify-center gap-3 mb-10">
                        {tabs.map(tab => (
                            <button
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`
                                    px-5 py-2 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2
                                    ${activeTab === tab.name
                                        ? "bg-teal-600 text-white shadow-lg shadow-teal-500/30"
                                        : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border border-gray-700"
                                    }
                                `}
                            >
                                {icons[tab.name] || <FaHammer />} {tab.name}
                            </button>
                        ))}
                    </div>
                )}

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                        {(query.length > 0 ? filteredJobs : filteredTabs.find(t => t.name === activeTab)?.jobs || [])
                            .map(job => {
                                const stats = jobStats[job.id] || {level: 0, xp: 0};
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
