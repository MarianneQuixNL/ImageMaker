
import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import { CLASS_HIERARCHY, SPECIES_HIERARCHY } from '../constants/generationPresets';

interface AddPersonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (config: { class: string, species: string, gender: string, wealth: string }) => void;
}

export const AddPersonModal: React.FC<AddPersonModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedSpecies, setSelectedSpecies] = useState<string | null>(null);
    const [gender, setGender] = useState("Female");
    const [wealth, setWealth] = useState("Average");
    
    const [expandedClasses, setExpandedClasses] = useState<Record<string, boolean>>({});
    const [expandedSpecies, setExpandedSpecies] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, selectedClass, selectedSpecies, gender, wealth]);

    if (!isOpen) return null;

    const toggleClassExpand = (key: string) => {
        setExpandedClasses(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const toggleSpeciesExpand = (key: string) => {
        setExpandedSpecies(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleConfirm = () => {
        if (selectedClass && selectedSpecies) {
            onConfirm({
                class: selectedClass,
                species: selectedSpecies,
                gender,
                wealth
            });
            // Reset for next use
            setSelectedClass(null);
            setSelectedSpecies(null);
            setGender("Female");
            setWealth("Average");
            onClose();
        }
    };

    const renderTree = (
        nodes: any, 
        selectedItem: string | null, 
        onSelect: (item: string) => void, 
        expandedState: Record<string, boolean>, 
        toggleExpand: (key: string) => void, 
        path: string = ''
    ) => {
        return (
            <div className="pl-2 border-l border-gray-700 ml-2">
                {Object.entries(nodes).map(([key, value]) => {
                    const currentPath = path ? `${path}::${key}` : key;
                    if (Array.isArray(value)) {
                        return (
                            <div key={key}>
                                <div 
                                    className="px-2 py-1 text-xs font-bold text-gray-400 cursor-pointer hover:text-white"
                                    onClick={() => toggleExpand(currentPath)}
                                >
                                    {key}
                                </div>
                                {expandedState[currentPath] && (
                                    <div className="pl-2 grid grid-cols-1 gap-1">
                                        {value.map((item: string) => {
                                            // Clean the item name for selection (remove parens details)
                                            const cleanName = item.includes('(') ? item.split('(')[0].trim() : item;
                                            return (
                                                <button
                                                    key={item}
                                                    onClick={() => onSelect(cleanName)}
                                                    className={`px-2 py-1.5 text-xs text-left rounded truncate transition-colors ${selectedItem === cleanName ? 'bg-violet-600 text-white font-bold' : 'text-gray-500 hover:bg-gray-800'}`}
                                                    title={item}
                                                >
                                                    {item}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }
                    return (
                        <div key={key}>
                            <div className="px-2 py-1 text-xs font-bold text-gray-300 cursor-pointer hover:text-white" onClick={() => toggleExpand(currentPath)}>{key}</div>
                            {expandedState[currentPath] && renderTree(value, selectedItem, onSelect, expandedState, toggleExpand, currentPath)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const genders = ["Male", "Female", "Non-Binary", "Androgynous", "Eunuch", "Intersex", "Transmasculine", "Transfeminine", "Genderfluid", "Agender"];
    const wealthLevels = ["Destitute", "Poor", "Average", "Wealthy", "Aristocratic", "Royal"];

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-900 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-gray-700">
                <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-gray-850 shrink-0">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-green-500" /> Add Person
                    </h3>
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-700 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
                </div>
                
                <div className="flex-1 p-6 overflow-hidden flex flex-col min-h-0">
                    <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
                        {/* Class Selection */}
                        <div className="border border-gray-700 rounded-lg p-3 bg-gray-950 flex flex-col min-h-0">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 shrink-0">Class / Profession</label>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {renderTree(CLASS_HIERARCHY, selectedClass, setSelectedClass, expandedClasses, toggleClassExpand)}
                            </div>
                            <div className="mt-2 text-sm font-bold text-violet-400 text-center border-t border-gray-800 pt-2 shrink-0">{selectedClass || "Select a Class"}</div>
                        </div>

                        {/* Species Selection */}
                        <div className="border border-gray-700 rounded-lg p-3 bg-gray-950 flex flex-col min-h-0">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 shrink-0">Species / Race</label>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {renderTree(SPECIES_HIERARCHY, selectedSpecies, setSelectedSpecies, expandedSpecies, toggleSpeciesExpand)}
                            </div>
                            <div className="mt-2 text-sm font-bold text-violet-400 text-center border-t border-gray-800 pt-2 shrink-0">{selectedSpecies || "Select a Species"}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 mt-6 shrink-0">
                        {/* Gender */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Gender Identity</label>
                            <select 
                                value={gender} 
                                onChange={(e) => setGender(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-green-500 outline-none"
                            >
                                {genders.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        {/* Wealth */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Wealth Level</label>
                            <select 
                                value={wealth} 
                                onChange={(e) => setWealth(e.target.value)}
                                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none"
                            >
                                {wealthLevels.map(w => <option key={w} value={w}>{w}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-850 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white text-sm font-bold">Cancel</button>
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedClass || !selectedSpecies}
                        className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg transition-all"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Add Character
                    </button>
                </div>
            </div>
        </div>
    );
};
