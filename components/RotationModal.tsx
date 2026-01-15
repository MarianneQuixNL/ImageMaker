
import React, { useState, useEffect } from 'react';
import { X, RotateCw, CheckCircle2, Image as ImageIcon, Box, RotateCcw, MessageSquare } from 'lucide-react';
import { HistoryItem } from '../types';

interface RotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onRotate: (yaw: number, pitch: number, keepBg: boolean) => void;
    onEditPrompt?: (yaw: number, pitch: number, keepBg: boolean) => void;
}

export const RotationModal: React.FC<RotationModalProps> = ({ isOpen, onClose, image, onRotate, onEditPrompt }) => {
    const [yaw, setYaw] = useState(0);
    const [pitch, setPitch] = useState(0); // Default 0
    const [keepBackground, setKeepBackground] = useState(true);

    const handleConfirm = () => {
        onRotate(yaw, pitch, keepBackground);
        onClose();
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt(yaw, pitch, keepBackground);
            onClose();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, yaw, pitch, keepBackground]);

    if (!isOpen) return null;

    const handleReset = () => {
        setYaw(0);
        setPitch(0);
        setKeepBackground(true);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-[2.5rem] shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-white/10 ring-1 ring-white/5">
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gray-950/50 backdrop-blur-md flex-none">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">
                            <RotateCw className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                                Rotate Subject
                                <span className="bg-white/10 text-white/40 text-[10px] px-2 py-0.5 rounded-full font-mono tracking-widest border border-white/5">3D_ROTATION</span>
                            </h2>
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
                    {/* Left: Image Preview */}
                    <div className="flex-1 p-8 bg-gray-900/50 flex items-center justify-center relative overflow-hidden">
                        <div className="relative shadow-2xl border border-white/10 rounded-xl overflow-hidden group select-none max-h-full">
                            <img src={image.url} alt="Rotation Input" className="max-h-[60vh] object-contain block select-none" draggable={false} />
                            <div className="absolute inset-0 flex items-end justify-center pointer-events-none p-4">
                                <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 text-center shadow-xl">
                                    <span className="text-xs font-black text-white/60 mr-2">TARGET:</span>
                                    <span className="text-lg font-black text-blue-400 font-mono">{yaw}° H <span className="text-white/30">|</span> {pitch}° V</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Controls */}
                    <div className="w-80 bg-gray-950 border-l border-white/10 flex flex-col p-6 gap-6 overflow-y-auto">
                        
                        {/* Horizontal (Yaw) */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest">Yaw (Horizontal)</h3>
                                <span className="text-xs font-mono text-blue-400">{yaw}°</span>
                            </div>
                            <div className="bg-gray-900 border border-white/5 rounded-xl p-4">
                                <input 
                                    type="range" min="0" max="360" step="5" value={yaw} 
                                    onChange={(e) => setYaw(parseInt(e.target.value))}
                                    className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-4"
                                />
                                <div className="grid grid-cols-4 gap-2">
                                    {[0, 90, 180, 270].map(val => (
                                        <button 
                                            key={val} onClick={() => setYaw(val)}
                                            className={`py-1.5 rounded-md text-[9px] font-bold border transition-all ${yaw === val ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-850 border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-400'}`}
                                        >
                                            {val === 0 ? 'Front' : val === 90 ? 'Right' : val === 180 ? 'Back' : 'Left'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Vertical (Pitch) - New Compact Layout */}
                        <div className="flex-1 min-h-0 flex flex-col">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-xs font-black text-white/60 uppercase tracking-widest">Pitch (Vertical)</h3>
                                <span className="text-xs font-mono text-blue-400">{pitch > 0 ? `+${pitch}° (High)` : pitch < 0 ? `${pitch}° (Low)` : '0° (Level)'}</span>
                            </div>
                            
                            <div className="bg-gray-900 border border-white/5 rounded-xl p-4 flex flex-1 gap-4 items-stretch min-h-[200px]">
                                {/* Slider */}
                                <div className="flex flex-col items-center h-full">
                                    <span className="text-[9px] font-bold text-gray-600 mb-1">+180</span>
                                    <input 
                                        type="range" min="-180" max="180" step="5" value={pitch} 
                                        onChange={(e) => setPitch(parseInt(e.target.value))}
                                        className="flex-1 w-1.5 bg-gray-800 rounded-full appearance-none cursor-pointer accent-blue-500"
                                        style={{ WebkitAppearance: 'slider-vertical' } as React.CSSProperties}
                                    />
                                    <span className="text-[9px] font-bold text-gray-600 mt-1">-180</span>
                                </div>

                                {/* Presets */}
                                <div className="flex-1 flex flex-col justify-between gap-2">
                                    {[90, 45, 0, -45, -90].map(val => (
                                        <button 
                                            key={val} onClick={() => setPitch(val)}
                                            className={`flex-1 flex items-center justify-between px-3 rounded-lg border transition-all group ${pitch === val ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-gray-850 border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-300'}`}
                                        >
                                            <span className="text-[10px] font-bold uppercase">
                                                {val === 0 ? 'Level' : val === 90 ? 'Top' : val === -90 ? 'Bottom' : val > 0 ? 'High' : 'Low'}
                                            </span>
                                            <span className="text-[9px] opacity-60 font-mono">{val}°</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-auto space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group p-3 bg-gray-900 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${keepBackground ? 'bg-blue-600 border-blue-600 text-white' : 'bg-transparent border-gray-600'}`}>
                                    {keepBackground && <ImageIcon className="w-3 h-3" />}
                                </div>
                                <input type="checkbox" checked={keepBackground} onChange={(e) => setKeepBackground(e.target.checked)} className="hidden" />
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-gray-300">Preserve Background</span>
                                </div>
                            </label>

                            <div className="flex gap-2">
                                {onEditPrompt && (
                                    <button 
                                        onClick={handleEdit}
                                        className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border border-gray-700"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Edit
                                    </button>
                                )}
                                <button 
                                    onClick={handleConfirm}
                                    className="flex-[2] flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-900/20"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Generate View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
