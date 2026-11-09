import RealmHeader from "../../components/RealmHeader";
// src/pages/Metier.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getStaticJobs } from '../../data/catalog';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { listenToAuthChanges } from '../../data/firebaseConfig';
import { getPlayerJobs } from '../../services/api';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { FaHammer, FaLeaf, FaGem, FaUtensils, FaConciergeBell, FaStar } from "react-icons/fa";

// Utility to normalize string: lowercase & remove accents
const normalizeString = str =>
    str
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();

function JobCard({ job, level, xp }) {
    const [open, setOpen] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            whileHover={{ y: -5 }}
            className="flex flex-col h-full rounded-sm shadow-none overflow-hidden cursor-pointer bg-[#1b1b17] border border-stone-700 hover:border-teal-500/50 transition-all group"
        >
            {/* Niveau du joueur, si > 0 */}
            {level > 0 && (
                <div
                    title={`${xp} XP`}
                    className="absolute top-3 right-3 bg-teal-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold z-20 shadow-none border border-teal-400"
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
                        className="p-5 bg-[#1b1b17] border-t border-stone-700 text-sm text-stone-300 space-y-3"
                    >
                        <p className="italic border-l-2 border-teal-500 pl-3">{job.description}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-[#11110f]/50 p-2 rounded border border-stone-700">
                                <span className="block text-xs text-stone-500 uppercase font-bold">Difficulté</span>
                                <span className={`font-medium ${job.difficulty === 'Facile' ? 'text-green-400' : job.difficulty === 'Moyenne' ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {job.difficulty}
                                </span>
                            </div>
                            <div className="bg-[#11110f]/50 p-2 rounded border border-stone-700">
                                <span className="block text-xs text-stone-500 uppercase font-bold">Gain</span>
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
    const staticJobs = useMemo(() => getStaticJobs(), []);
    const categories = useMemo(
      () => [
        { name: 'Bois', jobs: staticJobs.filter((job) => ['lumberjack', 'artisan', 'naval_architect', 'carpenter'].includes(job.id)) },
        { name: 'Pierre', jobs: staticJobs.filter((job) => ['miner', 'blacksmith', 'glassmaker', 'mason'].includes(job.id)) },
        { name: 'Nourriture', jobs: staticJobs.filter((job) => ['farmer', 'breeder', 'fisherman', 'innkeeper'].includes(job.id)) },
        { name: 'Services', jobs: staticJobs.filter((job) => ['transporter', 'guard', 'merchant', 'explorer'].includes(job.id)) },
      ],
      [staticJobs]
    );
    const specials = useMemo(
      () => staticJobs.filter((job) => ['builder', 'bestiary', 'politician', 'banker'].includes(job.id)),
      [staticJobs]
    );
    const [activeTab, setActiveTab] = useState(categories[0].name);
    const [query, setQuery] = useState('');
    const [user, setUser] = useState(null);
    const [jobStats, setJobStats] = useState({});

    const tabs = useMemo(
        () => [...categories, { name: 'Spéciaux', jobs: specials }],
        [categories, specials]
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
        [categories, specials]
    );
    
    const filteredJobs = useMemo(
        () =>
            allJobs.filter(job =>
                normalizeString(job.name).includes(normalizeString(query))
            ),
        [allJobs, query]
    );

    const hasNoFilteredJobs = query && filteredJobs.length === 0;

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
        <div className="min-h-screen bg-[#11110f] text-stone-200 pb-20">
            
            {/* Hero Header */}
            <RealmHeader eyebrow="Les savoir-faire / Métiers" title="Artisanat & Métiers" description="Explorez les carrières disponibles, apprenez les ficelles du métier et devenez un maître artisan." />

            <div className="max-w-[1680px] mx-auto px-6">
                {/* Search */}
                <div className="max-w-md mx-auto mb-10">
                    <div className="relative text-stone-400 focus-within:text-teal-400 transition-colors">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl" />
                        <input
                            type="text"
                            placeholder="Rechercher un métier..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-[#1b1b17] border border-stone-700 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 text-white shadow-none transition"
                        />
                    </div>
                </div>

                {hasNoFilteredJobs && (
                    <div className="mb-10">
                        <EmptyState
                            title="Aucun métier trouvé"
                            message="Aucun métier ne correspond à votre recherche. Essayez un autre mot-clé."
                        />
                    </div>
                )}

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
                                        ? "bg-teal-600 text-white shadow-none shadow-teal-500/30"
                                        : "bg-[#1b1b17] text-stone-400 hover:bg-stone-800 hover:text-white border border-stone-700"
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
