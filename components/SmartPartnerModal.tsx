
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Heart, ChevronRight, Circle, Folder, FolderOpen, CheckCircle2, Swords, RefreshCw, RotateCcw, MessageSquare } from 'lucide-react';
import { SPECIES_CATEGORIES } from '../constants/speciesOptions';
import { PARTNER_INTERACTIONS } from '../constants/partnerInteractions';
import { HAIR_COLORS } from '../constants/hairOptions';
import { EYE_COLORS } from '../constants/eyeOptions';
import { GENDER_OPTIONS } from '../constants/transformationOptions';

interface SmartPartnerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: { species: string, gender: string, hairColor: string, eyeColor: string, heightDiff: string, interaction: string, adaptPose: boolean }) => void;
    onEditPrompt?: (config: { species: string, gender: string, hairColor: string, eyeColor: string, heightDiff: string, interaction: string, adaptPose: boolean }) => void;
}

export const SmartPartnerModal: React.FC<SmartPartnerModalProps> = ({ isOpen, onClose, onConfirm, onEditPrompt }) => {
    // Mode State
    const [activeTab, setActiveTab] = useState<'identity' | 'interaction'>('identity');

    // Selection State
    const [selectedSpeciesCategory, setSelectedSpeciesCategory] = useState<string[]>([]);
    const [selectedInteractionCategory, setSelectedInteractionCategory] = useState<string[]>([]);
    
    // Tree Expansion State
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    
    // Form Data
    const [species, setSpecies] = useState<string | null>(null);
    const [interaction, setInteraction] = useState<string | null>(null);
    
    const [gender, setGender] = useState("Female");
    const [hairColor, setHairColor] = useState("Black");
    const [eyeColor, setEyeColor] = useState("Brown");
    const [heightDiff, setHeightDiff] = useState("Slightly Shorter");
    const [adaptPose, setAdaptPose] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && species && interaction) handleGenerate();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, species, interaction, gender, hairColor, eyeColor, heightDiff, adaptPose]);

    if (!isOpen) return null;

    const handleReset = () => {
        setSpecies(null);
        setInteraction(null);
        setGender("Female");
        setHairColor("Black");
        setEyeColor("Brown");
        setHeightDiff("Slightly Shorter");
        setAdaptPose(false);
    };

    const toggleExpand = (pathStr: string) => {
        setExpandedCategories(prev => {
            const isExpanding = !prev[pathStr];
            if (!isExpanding) return { ...prev, [pathStr]: false };

            const parentPath = pathStr.includes('::') ? pathStr.substring(0, pathStr.lastIndexOf('::')) : '';
            const nextState = { ...prev };
            Object.keys(nextState).forEach(key => {
                if (nextState[key]) {
                    const keyParent = key.includes('::') ? key.substring(0, key.lastIndexOf('::')) : '';
                    if (keyParent === parentPath && key !== pathStr) {
                        nextState[key] = false;
                    }
                }
            });
            nextState[pathStr] = true;
            return nextState;
        });
    };

    const handleSelectCategory = (path: string[]) => {
        if (activeTab === 'identity') setSelectedSpeciesCategory(path);
        else setSelectedInteractionCategory(path);
    };

    const renderTree = (nodes: any, path: string[] = []) => {
        const isLeaf = Array.isArray(nodes);
        const currentSelection = activeTab === 'identity' ? selectedSpeciesCategory : selectedInteractionCategory;
        const colorClass = activeTab === 'identity' ? 'text-pink-500' : 'text-orange-500';
        const bgClass = activeTab === 'identity' ? 'bg-pink-900/40 text-pink-300' : 'bg-orange-900/40 text-orange-300';
        const fillClass = activeTab === 'identity' ? 'text-pink-400' : 'text-orange-400';

        return (
            <div className="pl-4 border-l border-gray-700 ml-2">
                {Object.entries(nodes).map(([key, value]) => {
                    const newPath = [...path, key];
                    const newPathStr = newPath.join('::');
                    const isNodeLeaf = Array.isArray(value);
                    const isSelected = currentSelection.join('::') === newPathStr;
                    const isExpanded = expandedCategories[newPathStr];

                    return (
                        <div key={key}>
                            <div 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? `${bgClass} font-bold` : 'hover:bg-gray-800 text-gray-300'}`}
                                onClick={() => {
                                    if (isNodeLeaf) handleSelectCategory(newPath);
                                    else toggleExpand(newPathStr);
                                }}
                            >
                                {isNodeLeaf ? <Circle className={`w-2 h-2 ${fillClass} fill-current`} /> : (isExpanded ? <FolderOpen className={`w-4 h-4 ${colorClass}`} /> : <Folder className="w-4 h-4 text-gray-500" />)}
                                <span>{key}</span>
                                {!isNodeLeaf && <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
                            </div>
                            {!isNodeLeaf && isExpanded && renderTree(value, newPath)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getOptions = () => {
        const selection = activeTab === 'identity' ? selectedSpeciesCategory : selectedInteractionCategory;
        const rootData = activeTab === 'identity' ? SPECIES_CATEGORIES : PARTNER_INTERACTIONS;
        
        if (selection.length === 0) return null;
        let current: any = rootData;
        for (const key of selection) {
            current = current[key];
        }
        return Array.isArray(current) ? current : null;
    };

    const currentOptions = getOptions();

    const handleGenerate = () => {
        if (!species || !interaction) return;
        onConfirm({
            species,
            interaction,
            gender,
            hairColor,
            eyeColor,
            heightDiff,
            adaptPose
        });
        onClose();
    };

    const handleEdit = () => {
        if (!species || !interaction || !onEditPrompt) return;
        onEditPrompt({
            species,
            interaction,
            gender,
            hairColor,
            eyeColor,
            heightDiff,
            adaptPose
        });
        onClose();
    };

    const handleOptionSelect = (opt: string) => {
        if (activeTab === 'identity') setSpecies(opt);
        else setInteraction(opt);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-[2.5rem] shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-white/10 ring-1 ring-white/5">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gray-950/50 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-pink-600 rounded-xl shadow-lg shadow-pink-900/40">
                            <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Smart Partner</h2>
                            <p className="text-xs text-gray-500">Create a companion for the scene</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded-full transition-all group" title="Reset">
                            <RotateCcw className="w-6 h-6 text-gray-500 group-hover:text-white" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all group active:scale-90">
                            <X className="w-6 h-6 text-gray-500 group-hover:text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Navigation & Tree */}
                    <div className="w-[30%] border-r border-gray-800 flex flex-col bg-gray-900">
                        {/* Tab Switcher */}
                        <div className="flex p-4 border-b border-gray-800 gap-2">
                            <button 
                                onClick={() => setActiveTab('identity')}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'identity' ? 'bg-pink-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                            >
                                <UserPlus className="w-4 h-4" /> Identity
                            </button>
                            <button 
                                onClick={() => setActiveTab('interaction')}
                                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${activeTab === 'interaction' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                            >
                                <Swords className="w-4 h-4" /> Interaction
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">
                                {activeTab === 'identity' ? 'Select Species' : 'Select Interaction'}
                            </h3>
                            {renderTree(activeTab === 'identity' ? SPECIES_CATEGORIES : PARTNER_INTERACTIONS)}
                        </div>
                    </div>

                    {/* Middle: Options List */}
                    <div className="w-[30%] border-r border-gray-800 overflow-y-auto p-4 bg-gray-950 custom-scrollbar">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Specific Option</h3>
                        {currentOptions ? (
                            <div className="flex flex-col gap-2">
                                {(currentOptions as string[]).map((opt: string) => {
                                    const isActive = activeTab === 'identity' ? species === opt : interaction === opt;
                                    const activeClass = activeTab === 'identity' ? 'bg-pink-900/30 border-pink-500 text-pink-200' : 'bg-orange-900/30 border-orange-500 text-orange-200';
                                    
                                    return (
                                        <button
                                            key={opt}
                                            onClick={() => handleOptionSelect(opt)}
                                            className={`p-3 rounded-lg border text-sm font-bold text-left transition-all ${isActive ? activeClass : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white'}`}
                                        >
                                            {opt.split('(')[0]}
                                            {opt.includes('(') && <span className="text-[10px] text-gray-500 block font-normal">{opt.match(/\(([^)]+)\)/)?.[1]}</span>}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-600 border border-dashed border-gray-800 rounded-xl">
                                {activeTab === 'identity' ? <UserPlus className="w-8 h-8 mb-2 opacity-20" /> : <Swords className="w-8 h-8 mb-2 opacity-20" />}
                                <p className="text-xs">Select a category on the left</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Summary & Details */}
                    <div className="flex-1 p-8 overflow-y-auto bg-gray-900/30 flex flex-col gap-8 custom-scrollbar">
                        
                        {/* Status Card */}
                        <div className="bg-gray-900 rounded-2xl p-6 border border-white/10 shadow-lg space-y-4">
                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Partner Identity</h3>
                                <div className="text-sm font-bold text-pink-400">{species || "Not Selected"}</div>
                            </div>
                            <div>
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Interaction</h3>
                                <div className="text-sm font-bold text-orange-400">{interaction || "Not Selected"}</div>
                            </div>
                        </div>

                        {/* Detailed Controls */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Gender</label>
                                    <select 
                                        value={gender} 
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-pink-500"
                                    >
                                        {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Height Diff</label>
                                    <select 
                                        value={heightDiff} 
                                        onChange={(e) => setHeightDiff(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-pink-500"
                                    >
                                        {["Much Taller", "Taller", "Same Height", "Slightly Shorter", "Much Shorter"].map(h => <option key={h} value={h}>{h}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Hair Color</label>
                                    <select 
                                        value={hairColor} 
                                        onChange={(e) => setHairColor(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-pink-500"
                                    >
                                        {HAIR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Eye Color</label>
                                    <select 
                                        value={eyeColor} 
                                        onChange={(e) => setEyeColor(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 outline-none focus:border-pink-500"
                                    >
                                        {EYE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group p-3 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${adaptPose ? 'bg-orange-600 border-orange-600 text-white' : 'bg-transparent border-gray-600'}`}>
                                        {adaptPose && <RefreshCw className="w-3 h-3" />}
                                    </div>
                                    <input type="checkbox" checked={adaptPose} onChange={(e) => setAdaptPose(e.target.checked)} className="hidden" />
                                    <div>
                                        <span className="text-xs font-bold text-gray-300 block">Adapt Main Subject</span>
                                        <span className="text-[10px] text-gray-500 block">Allow AI to modify the original character's pose to match interaction.</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-2">
                            {onEditPrompt && (
                                <button 
                                    onClick={handleEdit}
                                    disabled={!species || !interaction}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-gray-700"
                                >
                                    <MessageSquare className="w-4 h-4" /> Edit Prompt
                                </button>
                            )}
                            <button 
                                onClick={handleGenerate}
                                disabled={!species || !interaction}
                                className="w-full flex items-center justify-center gap-2 py-4 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 disabled:grayscale text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-pink-900/20"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Generate Duo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
