
import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Layers, Scissors, User, Users, PersonStanding } from 'lucide-react';
import { HistoryItem } from '../types';

interface ExtractPersonsModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onExtract: (indices: number[], keepBackground: boolean) => void;
}

export const ExtractPersonsModal: React.FC<ExtractPersonsModalProps> = ({ isOpen, onClose, image, onExtract }) => {
    const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
    const [viewFilter, setViewFilter] = useState<'all' | 'men' | 'women'>('all');
    const imgRef = useRef<HTMLImageElement>(null);

    // FIX: Safely access peopleDetection with optional chaining
    const people = image?.peopleDetection?.people || [];

    useEffect(() => {
        if (isOpen && people.length > 0) {
            // Default to selecting main person
            let maxArea = -1;
            let mainIdx = -1;
            people.forEach((p, idx) => {
                if (!p.box_2d || p.box_2d.length < 4) return;
                const area = (p.box_2d[2] - p.box_2d[0]) * (p.box_2d[3] - p.box_2d[1]);
                if (area > maxArea) {
                    maxArea = area;
                    mainIdx = idx;
                }
            });
            if (mainIdx !== -1) {
                setSelectedIndices(new Set([mainIdx]));
            } else {
                setSelectedIndices(new Set());
            }
            setViewFilter('all');
        }
    }, [isOpen, image, people]); // Add people to dependency

    if (!isOpen || !image) return null; // Add !image check

    const toggleSelection = (index: number) => {
        const next = new Set(selectedIndices);
        if (next.has(index)) {
            next.delete(index);
        } else {
            next.add(index);
        }
        setSelectedIndices(next);
    };

    const handleAction = (keepBackground: boolean) => {
        onExtract(Array.from(selectedIndices), keepBackground);
        onClose();
    };

    const isPersonVisible = (description: string) => {
        const desc = description.toLowerCase();
        if (viewFilter === 'all') return true;
        if (viewFilter === 'men') {
            return desc.includes('man') || desc.includes('boy') || desc.includes('male') || desc.includes('gentleman') || desc.includes('guy');
        }
        if (viewFilter === 'women') {
            return desc.includes('woman') || desc.includes('girl') || desc.includes('female') || desc.includes('lady');
        }
        return false;
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-[2.5rem] shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-white/10 ring-1 ring-white/5 relative">
                {/* Header Controls */}
                <div className="absolute top-4 right-4 flex gap-2 z-[60]">
                    <div className="flex bg-gray-900/90 backdrop-blur rounded-full border border-gray-700 p-1 shadow-lg mr-4 items-center">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mx-2">Show:</span>
                        <button 
                            onClick={() => setViewFilter('women')}
                            className={`p-2 rounded-full transition-colors ${viewFilter === 'women' ? 'bg-pink-600 text-white' : 'hover:bg-pink-900/30 text-pink-400'}`}
                            title="Show Women & Girls Only"
                        >
                            <PersonStanding className="w-5 h-5" />
                        </button>
                        <div className="w-px bg-gray-700 mx-1 h-4" />
                        <button 
                            onClick={() => setViewFilter('men')}
                            className={`p-2 rounded-full transition-colors ${viewFilter === 'men' ? 'bg-blue-600 text-white' : 'hover:bg-blue-900/30 text-blue-400'}`}
                            title="Show Men & Boys Only"
                        >
                            <PersonStanding className="w-5 h-5" />
                        </button>
                        <div className="w-px bg-gray-700 mx-1 h-4" />
                        <button 
                            onClick={() => setViewFilter('all')}
                            className={`p-2 rounded-full transition-colors ${viewFilter === 'all' ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
                            title="Show All"
                        >
                            <Users className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center p-8 bg-gray-900/50 relative overflow-hidden">
                    <div className="relative inline-block max-h-full max-w-full shadow-2xl rounded-lg overflow-hidden group select-none">
                        <img 
                            ref={imgRef}
                            src={image.url} 
                            alt="Extraction Selection" 
                            className="max-h-[85vh] w-auto block select-none object-contain" 
                            draggable={false}
                        />
                        
                        {/* Overlays */}
                        {people.map((person, idx) => {
                            if (!isPersonVisible(person.description)) return null;

                            const [ymin, xmin, ymax, xmax] = person.box_2d;
                            const isSelected = selectedIndices.has(idx);
                            
                            return (
                                <div
                                    key={idx}
                                    className={`absolute border-2 transition-all duration-200 ${isSelected ? 'border-violet-500 bg-violet-500/10' : 'border-gray-400/50 hover:border-gray-200'}`}
                                    style={{
                                        top: `${ymin / 10}%`,
                                        left: `${xmin / 10}%`,
                                        height: `${(ymax - ymin) / 10}%`,
                                        width: `${(xmax - xmin) / 10}%`,
                                    }}
                                    onClick={() => toggleSelection(idx)}
                                >
                                    {/* Selection Marker (Top-Left) */}
                                    <div 
                                        className={`absolute -top-3 -left-3 w-6 h-6 rounded-full flex items-center justify-center shadow-md cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                                    >
                                        {isSelected ? <Check className="w-4 h-4" /> : <User className="w-3 h-3" />}
                                    </div>
                                    
                                    {/* Tooltip on hover */}
                                    <div className="absolute top-full left-0 mt-1 bg-black/80 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-10">
                                        {person.description}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Controls (Bottom-Right of Image) */}
                        <div className="absolute bottom-4 right-4 flex gap-2 z-50">
                            <button 
                                onClick={onClose}
                                className="p-3 bg-red-600/90 hover:bg-red-700 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/10 transition-all active:scale-90"
                                title="Cancel"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={() => handleAction(false)}
                                disabled={selectedIndices.size === 0}
                                className="p-3 bg-violet-600/90 hover:bg-violet-700 disabled:opacity-50 disabled:grayscale text-white rounded-full shadow-lg backdrop-blur-sm border border-white/10 transition-all active:scale-90"
                                title="OK: Extract & Remove Background"
                            >
                                <Scissors className="w-6 h-6" />
                            </button>
                            <button 
                                onClick={() => handleAction(true)}
                                disabled={selectedIndices.size === 0}
                                className="p-3 bg-blue-600/90 hover:bg-blue-700 disabled:opacity-50 disabled:grayscale text-white rounded-full shadow-lg backdrop-blur-sm border border-white/10 transition-all active:scale-90"
                                title="Do: Extract & Keep Background"
                            >
                                <Layers className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Legend/Info Footer */}
                <div className="bg-gray-950 border-t border-white/10 p-4 flex justify-between items-center shrink-0">
                    <div className="text-gray-400 text-xs">
                        <span className="text-white font-bold">{selectedIndices.size}</span> subjects selected
                    </div>
                    <div className="flex gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-violet-600" /> Remove BG (OK)</div>
                        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600" /> Keep BG (DO)</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
