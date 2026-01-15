
import React, { useState, useEffect } from 'react';
import { X, Ratio, CheckCircle2, MessageSquare } from 'lucide-react';
import { HistoryItem } from '../types';

interface SmartAspectRatioModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onConfirm: (width: number, height: number, position: string) => void;
    onEditPrompt?: (width: number, height: number, position: string) => void;
}

export const SmartAspectRatioModal: React.FC<SmartAspectRatioModalProps> = ({ isOpen, onClose, image, onConfirm, onEditPrompt }) => {
    const [width, setWidth] = useState(16);
    const [height, setHeight] = useState(9);
    const [position, setPosition] = useState("Center");
    
    // Preview calculation
    const [previewStyle, setPreviewStyle] = useState({});

    useEffect(() => {
        const ratio = width / height;
        // Adjust preview logic for larger container if needed, relative size
        const maxDim = 300; 
        
        let w, h;
        if (ratio > 1) {
            w = maxDim;
            h = maxDim / ratio;
        } else {
            h = maxDim;
            w = maxDim * ratio;
        }
        
        setPreviewStyle({ width: w, height: h });
    }, [width, height]);

    const handleConfirm = () => {
        onConfirm(width, height, position);
        onClose();
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt(width, height, position);
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
    }, [isOpen, onClose, width, height, position]);

    if (!isOpen) return null;

    const positions = [
        "Top Left", "Top", "Top Right",
        "Left", "Center", "Right",
        "Bottom Left", "Bottom", "Bottom Right"
    ];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600/20 rounded-xl shadow-lg border border-indigo-600/50">
                            <Ratio className="w-6 h-6 text-indigo-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Smart Aspect Ratio</h2>
                            <p className="text-xs text-gray-500">Extend & Outpaint Background</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Preview */}
                    <div className="flex-1 p-8 bg-gray-900/50 flex flex-col items-center justify-center border-r border-gray-800 overflow-hidden">
                        <div className="relative flex items-center justify-center">
                            {/* Represents New Canvas */}
                            <div 
                                className="border-2 border-indigo-500 bg-indigo-500/10 rounded flex items-center justify-center relative transition-all duration-300 shadow-[0_0_50px_rgba(79,70,229,0.2)]"
                                style={previewStyle}
                            >
                                {/* Represents Original Image Position */}
                                <div className={`w-1/3 h-1/3 bg-white/20 border border-white/40 absolute flex items-center justify-center ${
                                    position === "Center" ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" :
                                    position === "Top Left" ? "top-2 left-2" :
                                    position === "Top Right" ? "top-2 right-2" :
                                    position === "Bottom Left" ? "bottom-2 left-2" :
                                    position === "Bottom Right" ? "bottom-2 right-2" :
                                    position === "Top" ? "top-2 left-1/2 -translate-x-1/2" :
                                    position === "Bottom" ? "bottom-2 left-1/2 -translate-x-1/2" :
                                    position === "Left" ? "left-2 top-1/2 -translate-y-1/2" :
                                    "right-2 top-1/2 -translate-y-1/2"
                                }`}>
                                    <span className="text-[10px] font-bold text-white/80">Subject</span>
                                </div>
                                <span className="absolute -bottom-6 text-xs font-mono text-indigo-300 font-bold">{width}:{height}</span>
                            </div>
                        </div>
                        <div className="mt-12 bg-indigo-900/20 border border-indigo-900/50 p-4 rounded-lg max-w-md text-center">
                            <p className="text-sm text-indigo-200 leading-relaxed">
                                The AI will expand the canvas to match <strong>{width}:{height}</strong>, placing the subject at <strong>{position}</strong> and generating new background content to fill the space.
                            </p>
                        </div>
                    </div>

                    {/* Right Panel: Controls */}
                    <div className="w-96 bg-gray-950 p-8 flex flex-col gap-8 overflow-y-auto">
                        
                        {/* Dimension Inputs */}
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-4">Target Dimensions</label>
                            <div className="flex items-center justify-center gap-4 bg-gray-900 p-6 rounded-xl border border-gray-800">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-600">WIDTH</span>
                                    <input 
                                        type="number" 
                                        min="1" max="20" 
                                        value={width} 
                                        onChange={(e) => setWidth(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                        className="w-20 bg-black border border-gray-700 rounded-lg p-3 text-center text-2xl font-black text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="text-gray-600 font-black text-2xl mt-4">:</div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-600">HEIGHT</span>
                                    <input 
                                        type="number" 
                                        min="1" max="20" 
                                        value={height} 
                                        onChange={(e) => setHeight(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                                        className="w-20 bg-black border border-gray-700 rounded-lg p-3 text-center text-2xl font-black text-white focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-2 justify-center">
                                <button onClick={() => { setWidth(16); setHeight(9); }} className="text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-400">16:9</button>
                                <button onClick={() => { setWidth(9); setHeight(16); }} className="text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-400">9:16</button>
                                <button onClick={() => { setWidth(1); setHeight(1); }} className="text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-400">1:1</button>
                                <button onClick={() => { setWidth(4); setHeight(3); }} className="text-[10px] bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-400">4:3</button>
                            </div>
                        </div>
                        
                        {/* Subject Positioning Grid */}
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase block mb-4">Subject Position</label>
                            <div className="grid grid-cols-3 gap-3 aspect-square max-w-[240px] mx-auto">
                                {positions.map(pos => (
                                    <button
                                        key={pos}
                                        onClick={() => setPosition(pos)}
                                        className={`rounded-lg border-2 transition-all flex items-center justify-center ${position === pos ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg scale-105' : 'bg-gray-900 border-gray-800 text-gray-600 hover:border-gray-600 hover:bg-gray-800'}`}
                                        title={`Place subject at ${pos}`}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${position === pos ? 'bg-white' : 'bg-gray-700'}`} />
                                    </button>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-indigo-400 text-center mt-4">{position}</p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-800 flex flex-col gap-2">
                            {onEditPrompt && (
                                <button 
                                    onClick={handleEdit}
                                    className="w-full flex items-center justify-center gap-2 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-sm uppercase tracking-widest transition-all border border-gray-700"
                                >
                                    <MessageSquare className="w-4 h-4" /> Edit Prompt
                                </button>
                            )}
                            <button 
                                onClick={handleConfirm}
                                className="w-full flex items-center justify-center gap-3 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-lg uppercase tracking-widest shadow-xl shadow-indigo-900/20 transition-all active:scale-95"
                            >
                                <CheckCircle2 className="w-6 h-6" /> Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
