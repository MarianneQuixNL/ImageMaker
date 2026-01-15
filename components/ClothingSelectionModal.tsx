
import React, { useState } from 'react';
import { X, Shirt, ChevronRight, Circle, Folder, FolderOpen, User, RotateCcw, MessageSquare } from 'lucide-react';
import { GENDERED_CLOTHING_OPTIONS } from '../constants/clothingOptions';

interface ClothingSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectClothing: (clothing: string) => void;
    onEditPrompt?: (clothing: string) => void;
}

export const ClothingSelectionModal: React.FC<ClothingSelectionModalProps> = ({ isOpen, onClose, onSelectClothing, onEditPrompt }) => {
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [gender, setGender] = useState<string>('Androgynous');

    if (!isOpen) return null;

    const handleReset = () => {
        setGender('Androgynous');
        setSelectedCategory([]);
        setExpandedCategories({});
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

    const currentTreeData = GENDERED_CLOTHING_OPTIONS[gender] || GENDERED_CLOTHING_OPTIONS['Androgynous'];

    const getOptions = () => {
        if (selectedCategory.length === 0) return null;
        let current: any = currentTreeData;
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
                    <div className="flex items-center gap-6">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-100">
                            <Shirt className="w-6 h-6 text-violet-500"/> Change Clothes
                        </h2>
                        
                        {/* Gender Selector */}
                        <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1 border border-gray-700">
                            <div className="px-2 py-1 text-gray-500">
                                <User className="w-4 h-4" />
                            </div>
                            <select 
                                value={gender} 
                                onChange={(e) => {
                                    setGender(e.target.value);
                                    setSelectedCategory([]); // Reset selection on gender change
                                    setExpandedCategories({});
                                }}
                                className="bg-transparent text-sm font-bold text-gray-200 focus:outline-none cursor-pointer pr-8 py-1"
                            >
                                <option value="Androgynous" className="bg-gray-900">Androgynous</option>
                                <option value="Female" className="bg-gray-900">Female</option>
                                <option value="Male" className="bg-gray-900">Male</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white" title="Reset">
                            <RotateCcw className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-500"/>
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 bg-gray-900">
                        <div className="space-y-1">
                            {renderTree(currentTreeData)}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-24">
                        {options ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {(options as string[]).map((option: string) => (
                                    <div key={option} className="flex flex-col gap-2">
                                        <button
                                            onClick={() => { onSelectClothing(option); onClose(); }}
                                            className="p-5 rounded-xl border border-gray-800 hover:border-violet-500 hover:bg-violet-900/20 hover:shadow-md transition-all text-left group bg-gray-900 flex justify-between items-center"
                                        >
                                            <span className="font-bold text-gray-300 group-hover:text-violet-300 block">{option}</span>
                                        </button>
                                        {onEditPrompt && (
                                            <button 
                                                onClick={() => { onEditPrompt(option); onClose(); }}
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
                                <Shirt className="w-16 h-16 mb-4 opacity-10" />
                                <p>Select a category to explore {gender.toLowerCase()} outfits</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
