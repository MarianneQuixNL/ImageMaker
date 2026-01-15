
import React, { useState } from 'react';
import { X, Scissors, ChevronRight, Circle, Folder, FolderOpen, CheckSquare, Square, CheckCircle2, RotateCcw, MessageSquare } from 'lucide-react';
import { HAIR_CATEGORIES } from '../constants/hairOptions';

interface HairSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectHair: (description: string, aspectRatio?: string) => void;
    onEditPrompt?: (description: string, aspectRatio?: string) => void;
}

const AspectRatioSelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="flex items-center gap-3">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">Aspect Ratio</label>
        <div className="flex gap-2">
            {["As-is", "1:1", "16:9", "4:3", "3:4", "9:16"].map(r => (
                <button
                    key={r}
                    onClick={() => onChange(r)}
                    className={`px-2 py-1.5 rounded text-[10px] font-bold border transition-all ${value === r ? 'bg-violet-600 border-violet-500 text-white' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                >
                    {r}
                </button>
            ))}
        </div>
    </div>
);

export const HairSelectionModal: React.FC<HairSelectionModalProps> = ({ isOpen, onClose, onSelectHair, onEditPrompt }) => {
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
    const [aspectRatio, setAspectRatio] = useState("As-is");

    if (!isOpen) return null;

    const handleReset = () => {
        setSelectedOptions(new Set());
        setAspectRatio("As-is");
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

    const toggleOption = (option: string) => {
        const newSet = new Set(selectedOptions);
        if (newSet.has(option)) {
            newSet.delete(option);
        } else {
            newSet.add(option);
        }
        setSelectedOptions(newSet);
    };

    const handleApply = () => {
        if (selectedOptions.size === 0) return;
        const description = Array.from(selectedOptions).join(', ');
        onSelectHair(description, aspectRatio === "As-is" ? undefined : aspectRatio);
        onClose();
    };

    const handleEdit = () => {
        if (selectedOptions.size === 0 || !onEditPrompt) return;
        const description = Array.from(selectedOptions).join(', ');
        onEditPrompt(description, aspectRatio === "As-is" ? undefined : aspectRatio);
        onClose();
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
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-violet-900/40 text-violet-300 font-bold' : 'hover:bg-gray-800 text-gray-300'}`}
                                onClick={() => {
                                    if (isNodeLeaf) handleSelectCategory(newPath);
                                    else toggleExpand(newPathStr);
                                }}
                            >
                                {isNodeLeaf ? <Circle className="w-2 h-2 text-violet-400 fill-current" /> : (isExpanded ? <FolderOpen className="w-4 h-4 text-violet-500" /> : <Folder className="w-4 h-4 text-gray-500" />)}
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
        let current: any = HAIR_CATEGORIES;
        for (const key of selectedCategory) {
            current = current[key];
        }
        return Array.isArray(current) ? current : null;
    };

    const options = getOptions();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden relative border border-gray-800">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-100">
                        <Scissors className="w-6 h-6 text-violet-500"/> Change Hair
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white" title="Reset">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-500"/>
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 bg-gray-900">
                        <div className="space-y-1">
                            {renderTree(HAIR_CATEGORIES)}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-24">
                        {options ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(options as string[]).map((option: string) => {
                                    const isSelected = selectedOptions.has(option);
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => toggleOption(option)}
                                            className={`p-5 rounded-xl border transition-all text-left group relative ${isSelected ? 'bg-violet-900/30 border-violet-500 shadow-md' : 'bg-gray-900 border-gray-800 hover:border-violet-500/50 hover:bg-violet-900/10'}`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="pr-6">
                                                    <span className={`font-bold block mb-1 ${isSelected ? 'text-violet-300' : 'text-gray-300 group-hover:text-violet-300'}`}>{option.split('(')[0]}</span>
                                                    {option.includes('(') && <span className={`text-[10px] leading-tight block ${isSelected ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-400'}`}>{option.match(/\(([^)]+)\)/)?.[1]}</span>}
                                                </div>
                                                <div className={`absolute top-5 right-5`}>
                                                    {isSelected ? <CheckSquare className="w-5 h-5 text-violet-400" /> : <Square className="w-5 h-5 text-gray-700 group-hover:text-gray-600" />}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                <Scissors className="w-16 h-16 mb-4 opacity-10" />
                                <p>Select Style, Color, Length or Movement to see options</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center gap-4">
                    <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                    
                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            <span className="font-bold text-white">{selectedOptions.size}</span> attributes selected
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setSelectedOptions(new Set())}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                disabled={selectedOptions.size === 0}
                            >
                                Clear Selection
                            </button>
                            {onEditPrompt && (
                                <button 
                                    onClick={handleEdit}
                                    disabled={selectedOptions.size === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg font-bold transition-all border border-gray-700"
                                >
                                    <MessageSquare className="w-4 h-4" /> Edit Prompt
                                </button>
                            )}
                            <button 
                                onClick={handleApply}
                                disabled={selectedOptions.size === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg shadow-violet-900/20 transition-all active:scale-95"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
