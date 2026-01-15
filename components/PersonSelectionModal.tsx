
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, MousePointer2, Trash2, CheckCircle2, Layout, Maximize2, Move } from 'lucide-react';
import { HistoryItem } from '../types';

interface PersonSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onExtract: (boxes: number[][]) => void;
}

interface Selection {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export const PersonSelectionModal: React.FC<PersonSelectionModalProps> = ({ isOpen, onClose, image, onExtract }) => {
    const [selections, setSelections] = useState<Selection[]>([]);
    const [firstClick, setFirstClick] = useState<{x: number, y: number} | null>(null);
    const [currentRect, setCurrentRect] = useState<Selection | null>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelections([]);
            setFirstClick(null);
            setCurrentRect(null);
            setCursorPos(null);
        }
    }, [isOpen]);

    // Calculate normalized coordinates [ymin, xmin, ymax, xmax] 0-1000
    const normalizeBox = (sel: Selection) => {
        if (!imgRef.current) return [0, 0, 0, 0];
        const rect = imgRef.current.getBoundingClientRect();
        
        // Ensure values are within bounds of the image
        const x = Math.max(0, Math.min(sel.x, rect.width));
        const y = Math.max(0, Math.min(sel.y, rect.height));
        const w = Math.max(0, Math.min(sel.w, rect.width - x));
        const h = Math.max(0, Math.min(sel.h, rect.height - y));

        const xmin = Math.round((x / rect.width) * 1000);
        const ymin = Math.round((y / rect.height) * 1000);
        const xmax = Math.round(((x + w) / rect.width) * 1000);
        const ymax = Math.round(((y + h) / rect.height) * 1000);

        return [ymin, xmin, ymax, xmax];
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!firstClick) {
            // First click: Start selection
            setFirstClick({ x, y });
            setCurrentRect({ id: 'temp', x, y, w: 0, h: 0 });
        } else {
            // Second click: Finalize selection
            if (currentRect && currentRect.w > 10 && currentRect.h > 10) {
                setSelections(prev => [...prev, { ...currentRect, id: Math.random().toString(36).substr(2, 9) }]);
            }
            setFirstClick(null);
            setCurrentRect(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;

        setCursorPos({ x: curX, y: curY });

        if (firstClick) {
            const x = Math.min(firstClick.x, curX);
            const y = Math.min(firstClick.y, curY);
            const w = Math.abs(firstClick.x - curX);
            const h = Math.abs(firstClick.y - curY);

            setCurrentRect({ id: 'temp', x, y, w, h });
        }
    };

    const handleMouseLeave = () => {
        setCursorPos(null);
    };

    const removeSelection = (id: string) => {
        setSelections(prev => prev.filter(s => s.id !== id));
    };

    const handleConfirm = () => {
        const normalizedBoxes = selections.map(s => normalizeBox(s));
        onExtract(normalizedBoxes);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-[2.5rem] shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-white/10 ring-1 ring-white/5">
                {/* Modal Header */}
                <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gray-950/50 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-red-600 rounded-2xl shadow-lg shadow-red-900/40">
                            <MousePointer2 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                                Manual Subject Selection
                                <span className="bg-white/10 text-white/40 text-[10px] px-3 py-1 rounded-full font-mono tracking-widest ml-2 border border-white/5">MODE: MULTI_CROP</span>
                            </h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Click to start a selection, click again to finish. Add multiple regions.</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-4 hover:bg-white/10 rounded-full transition-all group active:scale-90"
                    >
                        <X className="w-8 h-8 text-gray-500 group-hover:text-white" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Drawing Canvas */}
                    <div className="flex-1 p-12 bg-gray-900/50 flex items-center justify-center relative overflow-hidden">
                        <div 
                            className={`relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 rounded-lg overflow-hidden group select-none ${firstClick ? 'cursor-crosshair' : 'cursor-pointer'}`}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img 
                                ref={imgRef}
                                src={image.url} 
                                alt="Subject Selection" 
                                className="max-h-[70vh] w-auto block select-none" 
                                draggable={false}
                            />
                            
                            {/* Crosshair Guides */}
                            {cursorPos && (
                                <>
                                    <div 
                                        className="absolute top-0 bottom-0 w-px bg-red-500/50 pointer-events-none z-10"
                                        style={{ left: cursorPos.x }} 
                                    />
                                    <div 
                                        className="absolute left-0 right-0 h-px bg-red-500/50 pointer-events-none z-10"
                                        style={{ top: cursorPos.y }} 
                                    />
                                </>
                            )}

                            {/* SVG Overlay for selections */}
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                                {selections.map((sel) => (
                                    <g key={sel.id}>
                                        <rect 
                                            x={sel.x} y={sel.y} width={sel.w} height={sel.h} 
                                            className="fill-red-500/10 stroke-red-500 stroke-2"
                                            strokeDasharray="4 2"
                                        />
                                        <foreignObject x={sel.x} y={sel.y - 30} width="100" height="30">
                                            <div className="bg-red-600 text-white text-[10px] font-black px-2 py-1 rounded-t shadow-lg flex items-center gap-1">
                                                <Maximize2 className="w-3 h-3" /> TARGET
                                            </div>
                                        </foreignObject>
                                    </g>
                                ))}
                                {currentRect && (
                                    <rect 
                                        x={currentRect.x} y={currentRect.y} width={currentRect.w} height={currentRect.h} 
                                        className="fill-white/10 stroke-white stroke-2"
                                        strokeDasharray="8 4"
                                    />
                                )}
                            </svg>

                            {/* Interaction Guides */}
                            <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-4 text-[10px] font-black text-white/60 tracking-widest uppercase">
                                    <div className="flex items-center gap-2">
                                        <Move className="w-3 h-3 text-red-400" /> 
                                        {firstClick ? 'Click opposite corner to finish' : 'Click top-left corner to start'}
                                    </div>
                                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                                    <span>Precision Mode Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Panel: Selection List */}
                    <div className="w-96 bg-gray-950 border-l border-white/10 flex flex-col">
                        <div className="p-8 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Layout className="w-4 h-4" /> Queue
                            </h3>
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{selections.length} Selected</span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {selections.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-10 grayscale opacity-20">
                                    <MousePointer2 className="w-16 h-16 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest text-white">No regions marked</p>
                                </div>
                            ) : (
                                selections.map((sel, idx) => (
                                    <div key={sel.id} className="group bg-gray-900 border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-red-500/50 transition-all animate-in slide-in-from-right-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-red-600/20 border border-red-500/30 rounded-xl flex items-center justify-center font-black text-red-400">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="text-xs font-black text-white uppercase tracking-tighter">Selection Layer</div>
                                                <div className="text-[10px] text-gray-500 font-mono mt-0.5">{Math.round(sel.w)}px × {Math.round(sel.h)}px</div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeSelection(sel.id)}
                                            className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-8 border-t border-white/10 bg-black/20 space-y-4">
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setSelections([])}
                                    className="flex-1 py-4 text-xs font-black text-gray-500 hover:text-white uppercase tracking-widest transition-all"
                                >
                                    Clear All
                                </button>
                                <button 
                                    onClick={handleConfirm}
                                    disabled={selections.length === 0}
                                    className="flex-[2] flex items-center justify-center gap-3 py-4 bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:grayscale text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-red-900/20"
                                >
                                    <CheckCircle2 className="w-5 h-5" /> Extract {selections.length} Areas
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
