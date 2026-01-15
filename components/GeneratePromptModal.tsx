import React, { useState, useEffect } from 'react';
import { X, Terminal, CheckCircle2, ShieldAlert, Sparkles, Shirt, Image as ImageIcon, Palette, Scissors, RotateCcw } from 'lucide-react';
import { HistoryItem } from '../types';
// @FIX: Use action creator instead of jobService directly
import { createPromptGenerationJob } from '../../services/jobActions';
import { STYLE_OPTIONS } from '../constants/transformationOptions';

interface GeneratePromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
}

export const GeneratePromptModal: React.FC<GeneratePromptModalProps> = ({ isOpen, onClose, image }) => {
    const [generator, setGenerator] = useState("Stable Diffusion XL");
    const [backgroundMode, setBackgroundMode] = useState("Include Background");
    const [clothingMode, setClothingMode] = useState("Include Clothes");
    const [explicitMode, setExplicitMode] = useState(false);
    const [style, setStyle] = useState("Photorealistic");
    
    // New Explicit Controls
    const [armpitHair, setArmpitHair] = useState(false);
    const [pubicHairStyle, setPubicHairStyle] = useState("Bushy");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, generator, backgroundMode, clothingMode, explicitMode, style, armpitHair, pubicHairStyle]);

    if (!isOpen) return null;

    const handleReset = () => {
        setGenerator("Stable Diffusion XL");
        setBackgroundMode("Include Background");
        setClothingMode("Include Clothes");
        setExplicitMode(false);
        setStyle("Photorealistic");
        setArmpitHair(false);
        setPubicHairStyle("Bushy");
    };

    const generators = [
        "Stable Diffusion 1.5", "Stable Diffusion XL", "Stable Diffusion 3", 
        "WAN", "Gemini / Imagen 3", "Microsoft Designer (DALL-E 3)", 
        "Midjourney v6", "Flux.1"
    ];

    const clothingOptions = [
        "Include Clothes (Describe Outfit)",
        "Exclude Clothes (Nude / Anatomical)",
        "Bikini (Replace with simple bikini)"
    ];

    const backgroundOptions = [
        "Include Background (Full Scene)",
        "Exclude Background (White/Solid Color)"
    ];
    
    const pubicHairOptions = ["Bushy", "Natural", "Triangle", "Landing Strip", "Trimmed", "Shaved"];

    const handleConfirm = () => {
        // @FIX: Use action creator
        createPromptGenerationJob(image, {
            generator,
            backgroundMode: backgroundMode.includes("Include") ? "Describe detailed environment" : "Solid background, no details",
            clothingMode: clothingMode.includes("Include") ? "Describe current clothing" : (clothingMode.includes("Bikini") ? "Wearing a simple bikini" : "Exclude Clothes"),
            explicitMode: explicitMode ? "Include intimate details, cup size, accurate anatomy" : "Safe for work, focus on general build, no intimate areas",
            style,
            armpitHair: explicitMode && armpitHair ? "Visible armpit hair matching head hair color" : "",
            pubicHair: explicitMode ? (pubicHairStyle === "Shaved" ? "Shaved pubic area" : `${pubicHairStyle} pubic hair matching head hair color`) : ""
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-600/20 rounded-xl shadow-lg border border-violet-600/50">
                            <Terminal className="w-6 h-6 text-violet-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Generate Prompt</h2>
                            <p className="text-xs text-gray-500">Create optimized prompts for external AI generators</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white" title="Reset">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="p-8 space-y-8 bg-gray-950 overflow-y-auto flex-1">
                    
                    {/* Target Generator */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-violet-500" /> Target AI Generator
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {generators.map(gen => (
                                <button
                                    key={gen}
                                    onClick={() => setGenerator(gen)}
                                    className={`px-3 py-4 rounded-xl border text-sm font-bold transition-all text-center ${generator === gen ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {gen}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Style Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Palette className="w-4 h-4 text-pink-500" /> Output Style
                        </label>
                        <select 
                            value={style} 
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-pink-500 outline-none"
                        >
                            <option value="Photorealistic">Photorealistic (Default)</option>
                            {STYLE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    {/* Clothing Level */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <Shirt className="w-4 h-4 text-blue-500" /> Clothing Level
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {clothingOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setClothingMode(opt)}
                                    className={`px-4 py-4 rounded-xl border text-sm font-bold transition-all text-left ${clothingMode === opt ? 'bg-blue-900/30 border-blue-500 text-blue-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Background */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-green-500" /> Background
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {backgroundOptions.map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setBackgroundMode(opt)}
                                    className={`px-4 py-4 rounded-xl border text-sm font-bold transition-all text-left ${backgroundMode === opt ? 'bg-green-900/30 border-green-500 text-green-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Explicit Mode & Controls */}
                    <div className={`bg-gray-900 rounded-xl border transition-all duration-300 ${explicitMode ? 'border-red-900/50 bg-red-950/10' : 'border-gray-800'}`}>
                        <div className="p-6 flex items-center justify-between">
                            <div>
                                <h3 className={`text-sm font-bold flex items-center gap-2 ${explicitMode ? 'text-red-400' : 'text-gray-200'}`}>
                                    <ShieldAlert className={`w-5 h-5 ${explicitMode ? 'text-red-500' : 'text-gray-500'}`} /> 
                                    Explicit Details Mode
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">If enabled, the prompt will include intimate anatomical details (e.g. cup size).</p>
                            </div>
                            <button 
                                onClick={() => setExplicitMode(!explicitMode)}
                                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none ${explicitMode ? 'bg-red-600' : 'bg-gray-700'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${explicitMode ? 'translate-x-9' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Conditional Sub-Controls */}
                        {explicitMode && (
                            <div className="px-6 pb-6 border-t border-red-900/20 pt-4 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 fade-in">
                                <div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${armpitHair ? 'bg-red-600 border-red-600' : 'bg-gray-800 border-gray-600 group-hover:border-red-400'}`}>
                                            {armpitHair && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            checked={armpitHair} 
                                            onChange={(e) => setArmpitHair(e.target.checked)} 
                                            className="hidden" 
                                        />
                                        <span className="text-sm font-bold text-gray-200 group-hover:text-white">Add Armpit Hair</span>
                                    </label>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-red-300 uppercase tracking-wider mb-2 block flex items-center gap-2">
                                        <Scissors className="w-3 h-3" /> Pubic Hair Style
                                    </label>
                                    <select 
                                        value={pubicHairStyle} 
                                        onChange={(e) => setPubicHairStyle(e.target.value)}
                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-red-500 outline-none"
                                    >
                                        {pubicHairOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end shrink-0">
                    <button 
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-8 py-4 bg-violet-700 hover:bg-violet-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-violet-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Generate Prompt
                    </button>
                </div>
            </div>
        </div>
    );
};