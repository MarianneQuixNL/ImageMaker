
import React, { useState, useEffect } from 'react';
import { X, Footprints, CheckCircle2, Gem, RotateCcw, MessageSquare } from 'lucide-react';

interface SmartShoesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (shoeStyle: string, decorations: string, ankletType: string, ankletThickness: string) => void;
    onEditPrompt?: (shoeStyle: string, decorations: string, ankletType: string, ankletThickness: string) => void;
}

export const SmartShoesModal: React.FC<SmartShoesModalProps> = ({ isOpen, onClose, onConfirm, onEditPrompt }) => {
    const [shoeStyle, setShoeStyle] = useState("Barefoot");
    const [decorations, setDecorations] = useState("None");
    const [ankletType, setAnkletType] = useState("None");
    const [ankletThickness, setAnkletThickness] = useState("Thin");

    const handleConfirm = () => {
        onConfirm(shoeStyle, decorations, ankletType, ankletThickness);
        onClose();
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, shoeStyle, decorations, ankletType, ankletThickness]);

    if (!isOpen) return null;

    const handleReset = () => {
        setShoeStyle("Barefoot");
        setDecorations("None");
        setAnkletType("None");
        setAnkletThickness("Thin");
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt(shoeStyle, decorations, ankletType, ankletThickness);
            onClose();
        }
    };

    const shoeStyles = [
        "Barefoot", "Sandals (Gladiator)", "Sandals (Strappy)", "High Heels", "Stilettos", 
        "Boots (Combat)", "Boots (Knee High)", "Sneakers", "Ballet Flats", "Platform Shoes",
        "Wraps (Cloth)", "Wraps (Leather)", "Jeweled Sandals"
    ];

    const decorationOptions = [
        "None", "Toe Ring (Gold)", "Toe Ring (Silver)", "Ankle Tattoo", "Henna Design", 
        "Dirt/Mud Splatter", "Blood Stains", "Water Droplets", "Polished Nails (Red)", "Polished Nails (Black)"
    ];

    const ankletOptions = [
        "None", "Gold Chain", "Silver Chain", "Leather Strap", "Rope/Cord", 
        "Beaded", "Flower Vine", "Bell Anklet", "Cuff (Metal)", "Shackle (Iron)"
    ];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-fuchsia-600 rounded-xl shadow-lg shadow-fuchsia-900/40">
                            <Footprints className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Smart Shoes & Feet</h2>
                            <p className="text-xs text-gray-500">Customize footwear and details</p>
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
                    {/* Shoe Style Grid */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Footwear Style</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {shoeStyles.map(style => (
                                <button
                                    key={style}
                                    onClick={() => setShoeStyle(style)}
                                    className={`px-3 py-4 rounded-xl border text-sm font-bold transition-all text-center ${shoeStyle === style ? 'bg-fuchsia-900/30 border-fuchsia-500 text-fuchsia-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Decorations */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block flex items-center gap-2">
                            <Gem className="w-4 h-4 text-fuchsia-500" /> Decorations
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {decorationOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setDecorations(opt)}
                                    className={`px-3 py-3 rounded-lg border text-xs font-bold transition-all ${decorations === opt ? 'bg-fuchsia-900/20 border-fuchsia-500/50 text-fuchsia-300' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Anklets */}
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Anklet Type</label>
                            <select 
                                value={ankletType} 
                                onChange={(e) => setAnkletType(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-fuchsia-500 outline-none"
                            >
                                {ankletOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Thickness / Weight</label>
                            <div className="flex gap-2">
                                {["Thin", "Medium", "Thick", "Heavy"].map(th => (
                                    <button
                                        key={th}
                                        onClick={() => setAnkletThickness(th)}
                                        className={`flex-1 py-3 rounded-lg border text-xs font-bold transition-all ${ankletThickness === th ? 'bg-fuchsia-900/20 border-fuchsia-500/50 text-white' : 'bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-700'}`}
                                    >
                                        {th}
                                    </button>
                                ))}
                            </div>
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
                        className="flex items-center gap-2 px-8 py-4 bg-fuchsia-700 hover:bg-fuchsia-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-fuchsia-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
