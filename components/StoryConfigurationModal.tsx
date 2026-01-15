import React, { useState, useEffect } from 'react';
import { X, BookOpen, RotateCcw, PenTool } from 'lucide-react';
import { HistoryItem } from '../types';
// @FIX: Use action creator instead of jobService
import { runGenerateStory } from '../services/jobActions';

interface StoryConfigurationModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
}

export const StoryConfigurationModal: React.FC<StoryConfigurationModalProps> = ({ isOpen, onClose, image }) => {
    const [genre, setGenre] = useState("Fantasy");
    const [tone, setTone] = useState("Adventurous");
    const [length, setLength] = useState("Medium");
    const [writingStyle, setWritingStyle] = useState("Descriptive");

    const genres = ["Fantasy", "Sci-Fi", "Modern/Urban", "Horror", "Mystery", "Romance", "Historical", "Cyberpunk", "Steampunk", "Post-Apocalyptic"];
    const tones = ["Adventurous", "Dark & Gritty", "Lighthearted", "Humorous", "Dramatic", "Melancholic", "Suspenseful", "Epic", "Cozy"];
    const lengths = ["Short (Flash Fiction)", "Medium (Standard)", "Long (Detailed Chapters)"];
    const styles = ["Descriptive", "Dialogue Heavy", "Action Oriented", "Introspective", "Poetic/Flowery"];

    const handleConfirm = () => {
        // @FIX: Use action creator
        runGenerateStory(image, { genre, tone, length, writingStyle });
        onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, genre, tone, length, writingStyle]);

    if (!isOpen) return null;

    const handleReset = () => {
        setGenre("Fantasy");
        setTone("Adventurous");
        setLength("Medium");
        setWritingStyle("Descriptive");
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-600/20 rounded-xl shadow-lg border border-emerald-600/50">
                            <BookOpen className="w-6 h-6 text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Story Configuration</h2>
                            <p className="text-xs text-gray-500">Configure the narrative parameters</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white" title="Reset">
                            <RotateCcw className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 bg-gray-950 overflow-y-auto flex-1">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Genre</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {genres.map(g => (
                                <button
                                    key={g}
                                    onClick={() => setGenre(g)}
                                    className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all text-center ${genre === g ? 'bg-emerald-900/30 border-emerald-500 text-emerald-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {g}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Tone</label>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {tones.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t)}
                                    className={`px-3 py-3 rounded-xl border text-xs font-bold transition-all text-center ${tone === t ? 'bg-emerald-900/30 border-emerald-500 text-emerald-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Length</label>
                            <div className="flex flex-col gap-2">
                                {lengths.map(l => (
                                    <button
                                        key={l}
                                        onClick={() => setLength(l)}
                                        className={`px-4 py-3 rounded-lg border text-sm font-bold transition-all text-left ${length === l ? 'bg-emerald-900/30 border-emerald-500 text-emerald-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Writing Style</label>
                            <div className="flex flex-col gap-2">
                                {styles.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setWritingStyle(s)}
                                        className={`px-4 py-3 rounded-lg border text-sm font-bold transition-all text-left ${writingStyle === s ? 'bg-emerald-900/30 border-emerald-500 text-emerald-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end shrink-0">
                    <button 
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-8 py-4 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-emerald-900/20 transition-all active:scale-95"
                    >
                        <PenTool className="w-5 h-5" /> Generate Story
                    </button>
                </div>
            </div>
        </div>
    );
};