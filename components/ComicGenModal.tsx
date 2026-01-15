
import React, { useState, useEffect } from 'react';
import { X, BookOpenCheck, CheckCircle2, Square, Layout, Maximize2, Layers, MessageSquare } from 'lucide-react';
import { HistoryItem } from '../types';

interface ComicGenModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onConfirm: (config: { style: string, tone: string, mode: 'single' | 'multi' }) => void;
    onEditPrompt?: (config: { style: string, tone: string, mode: 'single' | 'multi' }) => void;
}

export const ComicGenModal: React.FC<ComicGenModalProps> = ({ isOpen, onClose, image, onConfirm, onEditPrompt }) => {
    const [style, setStyle] = useState("Black & White Drawing");
    const [tone, setTone] = useState("Humorous");
    const [mode, setMode] = useState<'single' | 'multi'>('single');

    const handleConfirm = () => {
        onConfirm({ style, tone, mode });
        onClose();
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt({ style, tone, mode });
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
    }, [isOpen, onClose, style, tone, mode]);

    if (!isOpen) return null;

    const styles = [
        "Black & White Drawing (Ink)", "Colored Drawing (Comic Book)", "Painted Drawing (Artistic)", "Photorealistic (Fumetti)"
    ];

    const tones = [
        "Humorous", "Sarcastic", "Absurd/Surreal", "Wholesome"
    ];

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-600 rounded-xl shadow-lg shadow-yellow-900/40">
                            <BookOpenCheck className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Comic Strip Generator</h2>
                            <p className="text-xs text-gray-500">Create a 4-panel comic adventure</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-8 bg-gray-950 flex-1 overflow-y-auto">
                    
                    {/* Style Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Visual Style</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {styles.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setStyle(s)}
                                    className={`p-4 rounded-xl border text-sm font-bold transition-all text-left ${style === s ? 'bg-yellow-900/30 border-yellow-500 text-yellow-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tone Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Story Tone</label>
                        <div className="flex flex-wrap gap-2">
                            {tones.map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTone(t)}
                                    className={`px-4 py-3 rounded-lg text-sm font-bold border transition-all ${tone === t ? 'bg-yellow-600 text-white border-yellow-500' : 'bg-gray-900 text-gray-400 border-gray-700 hover:text-white'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Generation Mode */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Generation Method</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => setMode('single')}
                                className={`p-6 rounded-xl border flex flex-col gap-2 transition-all ${mode === 'single' ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-900 border-gray-800 hover:bg-gray-800/80'}`}
                            >
                                <div className="flex items-center gap-2 text-lg font-bold text-white">
                                    <Maximize2 className="w-5 h-5 text-blue-400" /> Single Image
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Generates all 4 panels in one go. Faster, more cohesive style, but lower resolution per panel.
                                </p>
                            </button>

                            <button
                                onClick={() => setMode('multi')}
                                className={`p-6 rounded-xl border flex flex-col gap-2 transition-all ${mode === 'multi' ? 'bg-violet-900/30 border-violet-500' : 'bg-gray-900 border-gray-800 hover:bg-gray-800/80'}`}
                            >
                                <div className="flex items-center gap-2 text-lg font-bold text-white">
                                    <Layers className="w-5 h-5 text-violet-400" /> Multi-Panel Stitch
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Generates 4 separate high-res images and stitches them together. Best quality, slower process.
                                </p>
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end shrink-0 gap-3">
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
                        className="flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold text-sm shadow-xl shadow-yellow-900/20 transition-all active:scale-95"
                    >
                        <BookOpenCheck className="w-5 h-5" /> Generate Comic
                    </button>
                </div>
            </div>
        </div>
    );
};
