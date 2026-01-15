
import React, { useState, useEffect } from 'react';
import { X, Layers, Check, Image as ImageIcon, Ratio, MessageSquarePlus, Eye, EyeOff, RotateCcw, MessageSquare } from 'lucide-react';
import { HistoryItem, Job, JobType, JobStatus } from '../types';
import { ASPECT_RATIOS } from '../constants/transformationOptions';

interface CombineImagesModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: HistoryItem[];
    jobs: Job[];
    onCombine: (selectedIds: string[], backgroundId?: string, aspectRatio?: string, instructions?: string) => void;
    onEditPrompt?: (selectedIds: string[], backgroundId?: string, aspectRatio?: string, instructions?: string) => void;
}

export const CombineImagesModal: React.FC<CombineImagesModalProps> = ({ isOpen, onClose, history, jobs, onCombine, onEditPrompt }) => {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [selectedBackgroundId, setSelectedBackgroundId] = useState<string | undefined>(undefined);
    const [aspectRatio, setAspectRatio] = useState<string>("Default");
    const [instructions, setInstructions] = useState("");
    const [showHidden, setShowHidden] = useState(false);
    const [onlyLineArt, setOnlyLineArt] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && !e.shiftKey) {
                // Ignore if in textarea unless Ctrl+Enter
                if (e.target instanceof HTMLTextAreaElement) {
                    if(e.ctrlKey) handleCombineClick();
                    return;
                }
                if (selectedIds.size >= 2 || (selectedIds.size >= 1 && selectedBackgroundId)) {
                    handleCombineClick();
                }
            }
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, selectedIds, selectedBackgroundId, aspectRatio, instructions]);

    if (!isOpen) return null;

    const handleReset = () => {
        setSelectedIds(new Set());
        setSelectedBackgroundId(undefined);
        setAspectRatio("Default");
        setInstructions("");
    };

    // Filter Logic
    const combinableItems = history.filter(item => {
        if (!item.url || !item.url.startsWith('data:image')) return false;
        if (!showHidden && item.hidden) return false;
        
        // Backgrounds always visible
        if (item.isBackground) return true;

        if (onlyLineArt) {
            return item.detectedStyle?.toLowerCase().includes('line') || item.detectedStyle?.toLowerCase().includes('sketch');
        }
        return true;
    });

    const toggleSelection = (id: string, isBg: boolean) => {
        const next = new Set(selectedIds);
        
        if (isBg) {
            // Background Logic: Toggle (Max 1)
            if (selectedBackgroundId === id) {
                setSelectedBackgroundId(undefined); // Deselect
            } else {
                setSelectedBackgroundId(id); // Select (replaces prev)
            }
            // Ensure ID is not in regular set
            next.delete(id);
        } else {
            // Standard Image Logic
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
        }
        setSelectedIds(next);
    };

    const handleCombineClick = () => {
        const ids = Array.from(selectedIds).filter(id => id !== selectedBackgroundId);
        onCombine(ids, selectedBackgroundId, aspectRatio, instructions);
        onClose();
        handleReset();
    };

    const handleEditPromptClick = () => {
        const ids = Array.from(selectedIds).filter(id => id !== selectedBackgroundId);
        if (onEditPrompt) {
            onEditPrompt(ids, selectedBackgroundId, aspectRatio, instructions);
            onClose();
        }
    };

    const displayAspectRatios = ["Default", ...ASPECT_RATIOS.filter(r => r !== "Original")];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-gray-800">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-100">
                        <Layers className="w-6 h-6 text-violet-500"/> Combine Images
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white" title="Reset">
                            <RotateCcw className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-500"/>
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-gray-950 flex flex-col gap-6">
                    {/* Instructions Section - On Top */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-violet-900/30 shadow-sm">
                        <label className="block text-sm font-bold text-gray-300 mb-2 flex items-center gap-2">
                            <MessageSquarePlus className="w-4 h-4 text-violet-500" />
                            Additional Instructions
                        </label>
                        <textarea 
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                            className="w-full text-sm bg-gray-950 border-gray-700 rounded-md shadow-sm focus:border-violet-500 focus:ring-violet-500 min-h-[60px] text-white placeholder-gray-600"
                            placeholder="E.g., Make them hold hands, stand back to back, ensure the lighting is dark..."
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-4 px-1">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                            <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500" />
                            {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-gray-500" />} Show Hidden
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                            <input type="checkbox" checked={onlyLineArt} onChange={(e) => setOnlyLineArt(e.target.checked)} className="rounded border-gray-600 bg-gray-800 text-violet-600 focus:ring-violet-500" />
                            Only Line Art
                        </label>
                    </div>

                    {combinableItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-600 py-12">
                            <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                            <p>No images available to combine.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {combinableItems.map(item => {
                                const isSelected = selectedIds.has(item.id);
                                const isBgSelected = selectedBackgroundId === item.id;
                                const isBgType = item.isBackground;
                                
                                return (
                                    <div 
                                        key={item.id} 
                                        onClick={() => toggleSelection(item.id, isBgType || false)}
                                        className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all shadow-sm hover:shadow-md ${
                                            (isBgSelected) 
                                                ? 'border-green-500 ring-2 ring-green-900' 
                                                : isSelected 
                                                    ? 'border-violet-600 ring-2 ring-violet-900' 
                                                    : (isBgType ? 'border-green-900/50 hover:border-green-700' : 'border-gray-800 hover:border-violet-500/50')
                                        } ${item.hidden ? 'opacity-50 border-orange-900' : ''}`}
                                    >
                                        <div className="aspect-square bg-gray-900 relative">
                                            <img src={item.url} alt={item.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                            {isBgType && (
                                                <div className="absolute top-2 right-2 bg-green-600/90 text-white text-[9px] px-1.5 py-0.5 rounded font-bold shadow-sm uppercase tracking-wide">
                                                    Background
                                                </div>
                                            )}
                                            {(isSelected || isBgSelected) && (
                                                <div className={`absolute inset-0 flex items-center justify-center backdrop-blur-[1px] ${isBgSelected ? 'bg-green-600/20' : 'bg-violet-600/20'}`}>
                                                    <div className={`${isBgSelected ? 'bg-green-600' : 'bg-violet-600'} text-white p-2 rounded-full shadow-lg animate-in zoom-in`}>
                                                        <Check className="w-6 h-6" />
                                                    </div>
                                                </div>
                                            )}
                                            {/* Tooltip for unselected images */}
                                            {!(isSelected || isBgSelected) && (
                                                <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-50 pointer-events-none left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 bg-gray-900 border border-gray-700 shadow-xl rounded-lg overflow-hidden">
                                                    <div className="p-2 bg-gray-950 border-b border-gray-800 text-xs font-bold text-gray-300 truncate text-center">{item.title}</div>
                                                    <img src={item.url} className="w-full h-auto" alt="Preview" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-2 bg-gray-900 text-xs font-medium text-gray-300 truncate border-t border-gray-800">
                                            {item.title}
                                        </div>
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm ${item.source === 'generated' ? 'bg-violet-900/80 text-violet-300 border border-violet-800' : 'bg-blue-900/80 text-blue-300 border border-blue-800'}`}>
                                                {item.source}
                                            </span>
                                            {item.hidden && <span className="text-[10px] px-1 py-0.5 rounded-full bg-orange-900/80 text-orange-300 font-bold border border-orange-800">Hidden</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-gray-800 bg-gray-900 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-400 flex-1">
                        Selected: <span className="font-bold text-gray-200">{selectedIds.size}</span> images 
                        {selectedBackgroundId && <span className="text-green-400 ml-2 font-medium">(+ Background)</span>}
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2">
                            <Ratio className="w-4 h-4 text-gray-500" />
                            <span className="text-xs font-medium text-gray-400">Aspect Ratio:</span>
                            <select 
                                value={aspectRatio} 
                                onChange={(e) => setAspectRatio(e.target.value)}
                                className="bg-transparent border-none text-sm font-bold text-gray-200 focus:ring-0 cursor-pointer p-0"
                            >
                                {displayAspectRatios.map(r => (
                                    <option key={r} value={r} className="bg-gray-800">{r}</option>
                                ))}
                            </select>
                        </div>
                        {onEditPrompt && (
                            <button 
                                onClick={handleEditPromptClick}
                                disabled={selectedIds.size < 2 && !(selectedIds.size >=1 && selectedBackgroundId)}
                                className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg font-bold border border-gray-700"
                            >
                                <MessageSquare className="w-4 h-4" /> Edit
                            </button>
                        )}
                        <button 
                            onClick={handleCombineClick}
                            disabled={selectedIds.size < 2 && !(selectedIds.size >=1 && selectedBackgroundId)}
                            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 font-bold shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Layers className="w-5 h-5" /> Combine Selected
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
