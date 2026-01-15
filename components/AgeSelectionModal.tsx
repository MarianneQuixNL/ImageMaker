
import React, { useState, useEffect } from 'react';
import { X, UserPlus, CheckCircle2, MessageSquare } from 'lucide-react';

interface AgeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAge: (age: string) => void;
    onEditPrompt?: (age: string) => void;
}

export const AgeSelectionModal: React.FC<AgeSelectionModalProps> = ({ isOpen, onClose, onSelectAge, onEditPrompt }) => {
    const [ageInput, setAgeInput] = useState("");
    const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

    const PRESETS = [
        "Child (5-10 years)", "Teenager (13-17 years)", "Young Adult (18-25 years)", 
        "Adult (30-40 years)", "Middle Aged (45-60 years)", "Elderly (70+ years)"
    ];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, ageInput, selectedPreset]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const val = ageInput.trim() || selectedPreset || "";
        if (val) {
            onSelectAge(val);
            onClose();
            setAgeInput("");
            setSelectedPreset(null);
        }
    };

    const handleEdit = () => {
        const val = ageInput.trim() || selectedPreset || "";
        if (val && onEditPrompt) {
            onEditPrompt(val);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-gray-100">
                        <UserPlus className="w-5 h-5 text-blue-500"/> Change Age
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>
                <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Select Range</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESETS.map(preset => (
                                <button
                                    key={preset}
                                    onClick={() => { setSelectedPreset(preset); setAgeInput(""); }}
                                    className={`px-4 py-3 rounded-lg text-xs font-bold transition-all border ${selectedPreset === preset ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-900 text-gray-400 border-gray-700 hover:border-blue-500/50'}`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-gray-950 px-2 text-gray-500 font-bold">Or Type Custom</span>
                        </div>
                    </div>

                    <div>
                        <input 
                            type="text" 
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none placeholder-gray-600"
                            placeholder="E.g., 85 years old, Baby, Ancient..."
                            value={ageInput}
                            onChange={(e) => { setAgeInput(e.target.value); setSelectedPreset(null); }}
                        />
                    </div>
                </div>
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            disabled={!ageInput.trim() && !selectedPreset}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg font-bold transition-all border border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm}
                        disabled={!ageInput.trim() && !selectedPreset}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg transition-all"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Apply Age
                    </button>
                </div>
            </div>
        </div>
    );
};
