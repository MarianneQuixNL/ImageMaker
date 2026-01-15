
import React, { useState, useEffect } from 'react';
import { X, Sword, ShieldAlert, CheckCircle2, Droplets, Trash2, Scissors, RotateCcw, MessageSquare } from 'lucide-react';

interface SmartDamageModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (clothingDamage: string, wounds: string, filth: string) => void;
    onEditPrompt?: (clothingDamage: string, wounds: string, filth: string) => void;
}

export const SmartDamageModal: React.FC<SmartDamageModalProps> = ({ isOpen, onClose, onConfirm, onEditPrompt }) => {
    const [damageLevel, setDamageLevel] = useState("Low Damage");
    const [woundLevel, setWoundLevel] = useState("None");
    const [filthLevel, setFilthLevel] = useState("Clean");

    const damageOptions = ["None", "Low Damage (Tears)", "Medium Damage (Ripped)", "High Damage (Shredded)", "Destroyed/Tatters"];
    const woundOptions = ["None", "Minor Scratches", "Bruising", "Bleeding Cuts", "Battle Wounds (Artistic)"];
    const filthOptions = ["Clean", "Dusty", "Dirty", "Muddy", "Filthy/Grime-Covered"];

    const handleConfirm = () => {
        onConfirm(damageLevel, woundLevel, filthLevel);
        onClose();
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt(damageLevel, woundLevel, filthLevel);
            onClose();
        }
    };

    const handleReset = () => {
        setDamageLevel("Low Damage");
        setWoundLevel("None");
        setFilthLevel("Clean");
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, damageLevel, woundLevel, filthLevel]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-900/50 rounded-xl shadow-lg shadow-red-900/20 border border-red-800">
                            <Sword className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Smart Damage</h2>
                            <p className="text-xs text-gray-500">Apply wear, tear, and battle damage</p>
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

                <div className="p-8 space-y-8 bg-gray-950 flex-1 overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Scissors className="w-4 h-4 text-violet-500" /> Clothing Damage
                        </label>
                        <div className="flex flex-col gap-2">
                            {damageOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setDamageLevel(opt)}
                                    className={`px-4 py-3 rounded-xl border text-sm font-bold transition-all text-left ${damageLevel === opt ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-red-500" /> Wounds & Blood
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {woundOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setWoundLevel(opt)}
                                    className={`px-3 py-3 rounded-lg border text-sm font-bold transition-all ${woundLevel === opt ? 'bg-red-900/30 border-red-500 text-red-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-yellow-600" /> Filth & Dirt
                        </label>
                        <input 
                            type="range" 
                            min="0" max="4" step="1" 
                            value={filthOptions.indexOf(filthLevel)}
                            onChange={(e) => setFilthLevel(filthOptions[parseInt(e.target.value)])}
                            className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                        />
                        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mt-2">
                            <span>Clean</span>
                            <span className="text-yellow-500">{filthLevel}</span>
                            <span>Filthy</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3 shrink-0">
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-sm transition-all border border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-8 py-4 bg-red-700 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-red-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Apply Damage
                    </button>
                </div>
            </div>
        </div>
    );
};
