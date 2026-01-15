
import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle2, ChevronRight, Circle, Folder, FolderOpen, CheckSquare, Square, RotateCcw, MessageSquare } from 'lucide-react';
import { PROSTHESIS_CATEGORIES } from '../constants/prosthesisOptions';

interface SmartProsthesisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (style: string, bodyParts: string[]) => void;
    onEditPrompt?: (style: string, bodyParts: string[]) => void;
}

const BODY_PARTS = [
    "Left Arm", "Right Arm", "Left Leg", "Right Leg", 
    "Left Hand", "Right Hand", "Left Eye", "Right Eye", 
    "Jaw / Lower Face", "Spine / Back", "Full Body (Cyborg)"
];

export const SmartProsthesisModal: React.FC<SmartProsthesisModalProps> = ({ isOpen, onClose, onConfirm, onEditPrompt }) => {
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && selectedStyle && selectedParts.size > 0) handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, selectedStyle, selectedParts]);

    if (!isOpen) return null;

    const handleReset = () => {
        setSelectedStyle(null);
        setSelectedParts(new Set());
    };

    const toggleExpand = (pathStr: string) => {
        setExpandedCategories(prev => {
            const isExpanding = !prev[pathStr];
            if (!isExpanding) return { ...prev, [pathStr]: false };
            const parentPath = pathStr.includes('::') ? pathStr.substring(0, pathStr.lastIndexOf('::')) : '';
            const nextState = { ...prev };
            Object.keys(nextState).forEach(key => {
                if (nextState[key]) {
                    const keyParent = key.includes('::') ? key.substring(0, key.lastIndexOf('::')) : '';
                    if (keyParent === parentPath && key !== pathStr) nextState[key] = false;
                }
            });
            nextState[pathStr] = true;
            return nextState;
        });
    };

    const handleSelectCategory = (path: string[]) => {
        setSelectedCategory(path);
    };

    const handleStyleSelect = (style: string) => {
        setSelectedStyle(style);
    };

    const togglePart = (part: string) => {
        const next = new Set(selectedParts);
        if (next.has(part)) next.delete(part);
        else next.add(part);
        setSelectedParts(next);
    };

    const handleConfirm = () => {
        if (selectedStyle && selectedParts.size > 0) {
            onConfirm(selectedStyle, Array.from(selectedParts));
            onClose();
        }
    };

    const handleEdit = () => {
        if (selectedStyle && selectedParts.size > 0 && onEditPrompt) {
            onEditPrompt(selectedStyle, Array.from(selectedParts));
            onClose();
        }
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
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-teal-900/40 text-teal-300 font-bold' : 'hover:bg-gray-800 text-gray-300'}`}
                                onClick={() => {
                                    if (isNodeLeaf) handleSelectCategory(newPath);
                                    else toggleExpand(newPathStr);
                                }}
                            >
                                {isNodeLeaf ? <Circle className="w-2 h-2 text-teal-400 fill-current" /> : (isExpanded ? <FolderOpen className="w-4 h-4 text-teal-500" /> : <Folder className="w-4 h-4 text-gray-500" />)}
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
        let current: any = PROSTHESIS_CATEGORIES;
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
                        <div className="p-3 bg-teal-600 rounded-xl shadow-lg shadow-teal-900/40">
                            <Cpu className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Smart Prosthesis</h2>
                            <p className="text-xs text-gray-500">Apply technological or magical limb replacements</p>
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

                <div className="flex-1 flex overflow-hidden">
                    {/* Left: Tech Tree */}
                    <div className="w-80 border-r border-gray-800 bg-gray-900 overflow-y-auto p-4 custom-scrollbar">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Technology Level</h3>
                        {renderTree(PROSTHESIS_CATEGORIES)}
                    </div>

                    {/* Middle: Style Options */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-32 custom-scrollbar">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Select Aesthetic</h3>
                        {options ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {(options as string[]).map((option: string) => {
                                    const isSelected = selectedStyle === option;
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleStyleSelect(option)}
                                            className={`p-5 rounded-xl border transition-all text-left group relative ${isSelected ? 'bg-teal-900/30 border-teal-500 shadow-md' : 'bg-gray-900 border-gray-800 hover:border-teal-500/50 hover:bg-teal-900/10'}`}
                                        >
                                            <span className={`font-bold block ${isSelected ? 'text-teal-300' : 'text-gray-300 group-hover:text-teal-300'}`}>{option}</span>
                                            {isSelected && <CheckCircle2 className="w-5 h-5 text-teal-400 absolute top-5 right-5" />}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                                <Cpu className="w-16 h-16 mb-4 opacity-10" />
                                <p>Select a technology category from the sidebar</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Body Parts */}
                    <div className="w-72 bg-gray-950 border-l border-gray-800 p-6 flex flex-col">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Body Locations</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                            {BODY_PARTS.map(part => {
                                const isSelected = selectedParts.has(part);
                                return (
                                    <button
                                        key={part}
                                        onClick={() => togglePart(part)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all text-xs font-bold ${isSelected ? 'bg-teal-900/40 border-teal-500 text-white' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800'}`}
                                    >
                                        {part}
                                        {isSelected ? <CheckSquare className="w-4 h-4 text-teal-400" /> : <Square className="w-4 h-4 text-gray-600" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            disabled={!selectedStyle || selectedParts.size === 0}
                            className="flex items-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-sm transition-all border border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm}
                        disabled={!selectedStyle || selectedParts.size === 0}
                        className="flex items-center gap-2 px-8 py-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-xl shadow-teal-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Install Prosthetics
                    </button>
                </div>
            </div>
        </div>
    );
};
