
import React, { useState } from 'react';
import { X, BrainCircuit, ChevronRight, Circle, Folder, FolderOpen, RotateCcw, MessageSquare } from 'lucide-react';
import { SPECIES_CATEGORIES } from '../constants/speciesOptions';

interface SpeciesSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectSpecies: (species: string, aspectRatio?: string) => void;
    onEditPrompt?: (species: string, aspectRatio?: string) => void;
    treeData?: any;
}

const AspectRatioSelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-2 bg-gray-900 p-3 rounded-lg border border-gray-800 mt-4">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Aspect Ratio</label>
        <div className="grid grid-cols-3 gap-2">
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

export const SpeciesSelectionModal: React.FC<SpeciesSelectionModalProps> = ({ isOpen, onClose, onSelectSpecies, onEditPrompt, treeData }) => {
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [aspectRatio, setAspectRatio] = useState("As-is");

    const data = treeData || SPECIES_CATEGORIES;

    if (!isOpen) return null;

    const handleReset = () => {
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
        let current: any = data;
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
                        <BrainCircuit className="w-6 h-6 text-violet-500"/> Change Species
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
                    <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 bg-gray-900 flex flex-col">
                        <div className="space-y-1 flex-1">
                            {renderTree(data)}
                        </div>
                        <div className="mt-auto border-t border-gray-800 pt-4">
                            <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-24">
                        {options ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(options as string[]).map((option: string) => (
                                    <div key={option} className="flex flex-col gap-2">
                                        <button
                                            onClick={() => { onSelectSpecies(option, aspectRatio === "As-is" ? undefined : aspectRatio); onClose(); }}
                                            className="p-5 rounded-xl border border-gray-800 hover:border-violet-500 hover:bg-violet-900/20 hover:shadow-md transition-all text-left group bg-gray-900 w-full"
                                        >
                                            <span className="font-bold text-gray-300 group-hover:text-violet-300 block mb-1">{option.split('(')[0]}</span>
                                            {option.includes('(') && <span className="text-[10px] text-gray-500 group-hover:text-gray-400 leading-tight block">{option.match(/\(([^)]+)\)/)?.[1]}</span>}
                                        </button>
                                        {onEditPrompt && (
                                            <button 
                                                onClick={() => { onEditPrompt(option, aspectRatio === "As-is" ? undefined : aspectRatio); onClose(); }}
                                                className="text-[10px] text-gray-500 hover:text-white flex items-center justify-center gap-1 py-1 rounded hover:bg-gray-800 transition-colors"
                                            >
                                                <MessageSquare className="w-3 h-3" /> Edit
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                <BrainCircuit className="w-16 h-16 mb-4 opacity-10" />
                                <p>Select a category to explore species variations</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
