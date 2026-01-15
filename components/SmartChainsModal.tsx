
import React, { useState, useEffect } from 'react';
import { X, Link, CheckCircle2, RotateCcw, CheckSquare, Square, MessageSquare } from 'lucide-react';

interface SmartChainsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (material: string, bodyParts: string[]) => void;
    onEditPrompt?: (material: string, bodyParts: string[]) => void;
}

export const SmartChainsModal: React.FC<SmartChainsModalProps> = ({ isOpen, onClose, onConfirm, onEditPrompt }) => {
    const [material, setMaterial] = useState("Iron Chains");
    const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && selectedParts.size > 0) handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, material, selectedParts]);

    if (!isOpen) return null;

    const handleReset = () => {
        setMaterial("Iron Chains");
        setSelectedParts(new Set());
    };

    const materials = [
        "Iron Chains", "Rusty Chains", "Steel Cables", "Golden Chains", 
        "Glowing Energy Bonds", "Rope (Shibari)", "Vines/Roots", "Leather Straps", 
        "Silk Ribbons", "Barbed Wire", "Digital Glitch Bonds", "Ice Chains"
    ];

    const bodyParts = [
        "Wrists", "Ankles", "Neck (Collar)", "Torso/Waist", "Arms", "Legs", "Full Body", "Suspended"
    ];

    const togglePart = (part: string) => {
        const next = new Set(selectedParts);
        if (next.has(part)) next.delete(part);
        else next.add(part);
        setSelectedParts(next);
    };

    const handleConfirm = () => {
        if (selectedParts.size > 0) {
            onConfirm(material, Array.from(selectedParts));
            onClose();
        }
    };

    const handleEdit = () => {
        if (selectedParts.size > 0 && onEditPrompt) {
            onEditPrompt(material, Array.from(selectedParts));
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-600/20 rounded-xl shadow-lg border border-zinc-600/50">
                            <Link className="w-6 h-6 text-zinc-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Smart Chains & Restraints</h2>
                            <p className="text-xs text-gray-500">Apply visual bindings or accessories</p>
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
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Material / Type</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {materials.map(mat => (
                                <button
                                    key={mat}
                                    onClick={() => setMaterial(mat)}
                                    className={`px-3 py-4 rounded-xl border text-sm font-bold transition-all text-center ${material === mat ? 'bg-zinc-800 border-zinc-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {mat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Placement</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {bodyParts.map(part => {
                                const isSelected = selectedParts.has(part);
                                return (
                                    <button
                                        key={part}
                                        onClick={() => togglePart(part)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all text-sm font-bold ${isSelected ? 'bg-zinc-900/50 border-zinc-500 text-zinc-300' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'}`}
                                    >
                                        {part}
                                        {isSelected ? <CheckSquare className="w-4 h-4 text-zinc-400" /> : <Square className="w-4 h-4 text-gray-700" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3 shrink-0">
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            disabled={selectedParts.size === 0}
                            className="flex items-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-sm transition-all border border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm}
                        disabled={selectedParts.size === 0}
                        className="flex items-center gap-2 px-8 py-4 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-xl shadow-zinc-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
