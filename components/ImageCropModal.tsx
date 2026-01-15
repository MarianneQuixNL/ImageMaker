import React, { useState, useRef, useEffect } from 'react';
import { X, Scissors, CheckCircle2, Maximize2, Move } from 'lucide-react';
import { HistoryItem } from '../types';

interface ImageCropModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onCrop: (box: number[]) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({ isOpen, onClose, image, onCrop }) => {
    const [selection, setSelection] = useState<{x: number, y: number, w: number, h: number} | null>(null);
    const [firstClick, setFirstClick] = useState<{x: number, y: number} | null>(null);
    const [cursorPos, setCursorPos] = useState<{ x: number, y: number } | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelection(null);
            setFirstClick(null);
            setCursorPos(null);
        }
    }, [isOpen]);

    const normalizeBox = (sel: {x: number, y: number, w: number, h: number}) => {
        if (!imgRef.current) return [0, 0, 0, 0];
        
        const img = imgRef.current;
        const rect = img.getBoundingClientRect(); // Displayed size on screen
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        if (!naturalWidth || !naturalHeight || !rect.width || !rect.height) return [0,0,0,0];
        
        const widthRatio = naturalWidth / rect.width;
        const heightRatio = naturalHeight / rect.height;

        // Coordinates are relative to the displayed image box. Convert them to natural image coordinates.
        const naturalX = sel.x * widthRatio;
        const naturalY = sel.y * heightRatio;
        const naturalW = sel.w * widthRatio;
        const naturalH = sel.h * heightRatio;

        // Now, normalize these natural coordinates to 0-1000 range for the API
        const ymin = Math.round((naturalY / naturalHeight) * 1000);
        const xmin = Math.round((naturalX / naturalWidth) * 1000);
        const ymax = Math.round(((naturalY + naturalH) / naturalHeight) * 1000);
        const xmax = Math.round(((naturalX + naturalW) / naturalWidth) * 1000);

        return [ymin, xmin, ymax, xmax];
    };

    const handleConfirm = () => {
        if (selection) {
            onCrop(normalizeBox(selection));
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
    }, [isOpen, onClose, selection]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (!firstClick) {
            // First click
            setFirstClick({ x, y });
            setSelection({ x, y, w: 0, h: 0 });
        } else {
            // Second click - Finalize
            setFirstClick(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!imgRef.current) return;
        const rect = imgRef.current.getBoundingClientRect();
        const curX = e.clientX - rect.left;
        const curY = e.clientY - rect.top;

        // Update crosshair position
        setCursorPos({ x: curX, y: curY });

        if (firstClick) {
            const x = Math.min(firstClick.x, curX);
            const y = Math.min(firstClick.y, curY);
            const w = Math.abs(firstClick.x - curX);
            const h = Math.abs(firstClick.y - curY);

            setSelection({ x, y, w, h });
        }
    };

    const handleMouseLeave = () => {
        setCursorPos(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-[2.5rem] shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-white/10 ring-1 ring-white/5">
                <div className="p-8 border-b border-white/10 flex items-center justify-between bg-gray-950/50 backdrop-blur-md">
                    <div className="flex items-center gap-6">
                        <div className="p-4 bg-rose-600 rounded-2xl shadow-lg shadow-rose-900/40">
                            <Scissors className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
                                Manual Crop
                                <span className="bg-white/10 text-white/40 text-[10px] px-3 py-1 rounded-full font-mono tracking-widest ml-2 border border-white/5">MODE: LOCAL_CROP</span>
                            </h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Select an area to create a new image from the selection.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-full transition-all group active:scale-90">
                        <X className="w-8 h-8 text-gray-500 group-hover:text-white" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 p-12 bg-gray-900/50 flex items-center justify-center relative overflow-hidden">
                        <div 
                            className={`relative shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 rounded-lg overflow-hidden group select-none ${firstClick ? 'cursor-crosshair' : 'cursor-pointer'}`}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                        >
                            <img ref={imgRef} src={image.url} alt="Crop Input" className="max-h-[70vh] w-auto block select-none" draggable={false} />
                            
                            {/* Crosshair Guides */}
                            {cursorPos && (
                                <>
                                    <div 
                                        className="absolute top-0 bottom-0 w-px bg-red-500 pointer-events-none z-10"
                                        style={{ left: cursorPos.x }} 
                                    />
                                    <div 
                                        className="absolute left-0 right-0 h-px bg-red-500 pointer-events-none z-10"
                                        style={{ top: cursorPos.y }} 
                                    />
                                </>
                            )}
                            
                            <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible z-20">
                                {selection && (
                                    <g>
                                        <rect x={selection.x} y={selection.y} width={selection.w} height={selection.h} className="fill-rose-500/10 stroke-rose-500 stroke-2" strokeDasharray="4 2" />
                                        <foreignObject x={selection.x} y={selection.y - 30} width="150" height="30">
                                            <div className="bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-t shadow-lg flex items-center gap-1">
                                                <Maximize2 className="w-3 h-3" /> CROP TARGET
                                            </div>
                                        </foreignObject>
                                    </g>
                                )}
                            </svg>

                            <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
                                <div className="bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 flex items-center gap-4 text-[10px] font-black text-white/60 tracking-widest uppercase">
                                    <div className="flex items-center gap-2"><Move className="w-3 h-3 text-rose-400" /> {firstClick ? 'Click opposite corner to finalize' : 'Click top-left corner to start'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-96 bg-gray-950 border-l border-white/10 flex flex-col p-8 gap-8">
                        <div>
                            <h3 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] mb-4">Operation Details</h3>
                            <div className="space-y-4">
                                <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Processing Mode</div>
                                    <div className="text-sm font-black text-rose-400 uppercase">Local Browser Cut</div>
                                </div>
                                <div className="bg-gray-900 border border-white/5 rounded-2xl p-4">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Cost</div>
                                    <div className="text-sm font-black text-green-400 uppercase">Free (Offline)</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button 
                                onClick={handleConfirm}
                                disabled={!selection}
                                className="w-full flex items-center justify-center gap-3 py-6 bg-rose-600 hover:bg-rose-700 disabled:opacity-30 disabled:grayscale text-white rounded-[2rem] font-black text-lg uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-rose-900/20"
                            >
                                <CheckCircle2 className="w-6 h-6" /> Save Crop
                            </button>
                            <p className="text-[10px] text-gray-600 text-center mt-4 font-mono">INSTANT CLIENT-SIDE PROCESSING</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};