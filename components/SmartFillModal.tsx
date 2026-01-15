
import React, { useState, useEffect } from 'react';
import { X, Droplets, ChevronRight, Circle, Folder, FolderOpen, CheckCircle2, Ruler, MessageSquare } from 'lucide-react';
import { FLOOD_OPTIONS } from '../constants/floodOptions';

interface SmartFillModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (material: string, height: number) => void;
    onEditPrompt?: (material: string, height: number) => void;
}

export const SmartFillModal: React.FC<SmartFillModalProps> = ({ isOpen, onClose, onConfirm, onEditPrompt }) => {
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null);
    const [height, setHeight] = useState(50); // cm

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && selectedMaterial) handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, selectedMaterial, height]);

    if (!isOpen) return null;

    const toggleExpand = (pathStr: string) => {
        setExpandedCategories(prev => {
            const isExpanding = !prev[pathStr];
            if (!isExpanding) return { ...prev, [pathStr]: false };

            const parentPath = pathStr.includes('::') ? pathStr.substring(0, pathStr.lastIndexOf('::')) : '';
            const nextState = { ...prev };
            Object.keys(nextState).forEach(key => {
                if (nextState[key]) {
                    const keyParent = key.includes('::') ? key.substring(0, key.lastIndexOf('::')) : '';
                    if (keyParent === parentPath && key !== pathStr) {
                        nextState[key] = false;
                    }
                }
            });
            nextState[pathStr] = true;
            return nextState;
        });
    };

    const handleSelectCategory = (path: string[]) => {
        setSelectedCategory(path);
    };

    const handleMaterialSelect = (material: string) => {
        setSelectedMaterial(material);
    };

    const handleConfirm = () => {
        if (selectedMaterial) {
            onConfirm(selectedMaterial, height);
            onClose();
        }
    };

    const handleEdit = () => {
        if (selectedMaterial && onEditPrompt) {
            onEditPrompt(selectedMaterial, height);
            onClose();
        }
    };

    const getHeightDescription = (cm: number) => {
        if (cm < 10) return "Puddle / Feet";
        if (cm < 30) return "Ankle Deep";
        if (cm < 50) return "Knee Deep";
        if (cm < 90) return "Waist Deep";
        if (cm < 130) return "Chest Deep";
        return "Shoulder Deep (Dangerous)";
    };

    const renderTree = (nodes: any, path: string[] = []) => {
        const isLeaf = Array.isArray(nodes);
        
        return (
            <div className="pl-4 border-l border-gray-700 ml-2">
                {Object.entries(nodes).map(([key, value]) => {
                    const newPath = [...path, key];
                    const newPathStr = newPath.join('::');
                    const isNodeLeaf = Array.isArray(value);
                    const isSelected = selectedCategory.join('::') === newPathStr;
                    const isExpanded = expandedCategories[newPathStr];

                    return (
                        <div key={key}>
                            <div 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-cyan-900/40 text-cyan-300 font-bold' : 'hover:bg-gray-800 text-gray-300'}`}
                                onClick={() => {
                                    if (isNodeLeaf) handleSelectCategory(newPath);
                                    else toggleExpand(newPathStr);
                                }}
                            >
                                {isNodeLeaf ? <Circle className="w-2 h-2 text-cyan-400 fill-current" /> : (isExpanded ? <FolderOpen className="w-4 h-4 text-cyan-500" /> : <Folder className="w-4 h-4 text-gray-500" />)}
                                <span>{key}</span>
                                {!isNodeLeaf && <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`} />}
                            </div>
                            {!isNodeLeaf && isExpanded && renderTree(value, newPath)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getOptions = () => {
        if (selectedCategory.length === 0) return null;
        let current: any = FLOOD_OPTIONS;
        for (const key of selectedCategory) {
            current = current[key];
        }
        return Array.isArray(current) ? current : null;
    };

    const options = getOptions();

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-gray-800">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-600 rounded-xl shadow-lg shadow-cyan-900/40">
                            <Droplets className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Smart Fill</h2>
                            <p className="text-xs text-gray-500">Flood the environment with materials</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Left: Tree */}
                    <div className="w-80 border-r border-gray-800 bg-gray-900 overflow-y-auto p-4 custom-scrollbar">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Fill Material</h3>
                        {renderTree(FLOOD_OPTIONS)}
                    </div>

                    {/* Middle: Options Grid */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-32 custom-scrollbar">
                        {options ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {(options as string[]).map((option: string) => {
                                    const isSelected = selectedMaterial === option;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleMaterialSelect(option)}
                                            className={`p-5 rounded-xl border transition-all text-left group relative ${isSelected ? 'bg-cyan-900/30 border-cyan-500 shadow-md' : 'bg-gray-900 border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-900/10'}`}
                                        >
                                            <span className={`font-bold block ${isSelected ? 'text-cyan-300' : 'text-gray-300 group-hover:text-cyan-300'}`}>{option}</span>
                                            {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400 absolute top-5 right-5" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                <Droplets className="w-16 h-16 mb-4 opacity-10" />
                                <p>Select a material category from the sidebar</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Height Control */}
                    <div className="w-80 border-l border-gray-800 bg-gray-900 p-6 flex flex-col justify-center">
                        <div className="bg-gray-950 border border-gray-800 rounded-xl p-6 relative">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Ruler className="w-4 h-4" /> Flood Height
                            </h3>
                            
                            {/* Visual Mannequin Representation (Abstract) */}
                            <div className="h-64 w-20 mx-auto bg-gray-800 rounded-full relative mb-6 overflow-hidden border border-gray-700">
                                {/* Fill Level */}
                                <div 
                                    className="absolute bottom-0 left-0 right-0 bg-cyan-600/50 transition-all duration-300 border-t border-cyan-400"
                                    style={{ height: `${(height / 180) * 100}%` }}
                                />
                                {/* Markers */}
                                <div className="absolute bottom-[10%] left-0 right-0 border-t border-white/10 text-[9px] text-white/30 text-right pr-1">Ankle</div>
                                <div className="absolute bottom-[30%] left-0 right-0 border-t border-white/10 text-[9px] text-white/30 text-right pr-1">Knee</div>
                                <div className="absolute bottom-[50%] left-0 right-0 border-t border-white/10 text-[9px] text-white/30 text-right pr-1">Hip</div>
                                <div className="absolute bottom-[70%] left-0 right-0 border-t border-white/10 text-[9px] text-white/30 text-right pr-1">Chest</div>
                                <div className="absolute bottom-[85%] left-0 right-0 border-t border-white/10 text-[9px] text-white/30 text-right pr-1">Neck</div>
                            </div>

                            <input 
                                type="range" 
                                min="0" 
                                max="170" 
                                value={height} 
                                onChange={(e) => setHeight(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-4"
                            />
                            
                            <div className="text-center">
                                <span className="text-2xl font-black text-white font-mono">{height} cm</span>
                                <div className="text-sm font-bold text-cyan-400 uppercase mt-1">{getHeightDescription(height)}</div>
                            </div>

                            {height > 140 && (
                                <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg text-[10px] text-red-300 text-center font-bold">
                                    Warning: High fill level. Subject's head must remain visible.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            disabled={!selectedMaterial}
                            className="flex items-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-sm transition-all border border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedMaterial}
                        className="flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-xl shadow-cyan-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Start Flood
                    </button>
                </div>
            </div>
        </div>
    );
};
