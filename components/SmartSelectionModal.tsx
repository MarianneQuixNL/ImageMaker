
import React, { useState } from 'react';
import { X, ChevronRight, Circle, Folder, FolderOpen, LucideIcon, CheckSquare, Square, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';

interface SmartSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: LucideIcon;
    treeData: any;
    onConfirm: (selection: string) => void;
    colorClass?: string; // e.g. "text-violet-500"
    multiSelect?: boolean;
    onEditPrompt?: (selection: string) => void;
}

export const SmartSelectionModal: React.FC<SmartSelectionModalProps> = ({ 
    isOpen, onClose, title, icon: Icon, treeData, onConfirm, colorClass = "text-violet-500", multiSelect = false, onEditPrompt 
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    const toggleExpand = (pathStr: string) => {
        setExpandedCategories(prev => {
            const isExpanding = !prev[pathStr];
            if (!isExpanding) return { ...prev, [pathStr]: false };

            // Accordion logic: Close siblings
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

    const handleOptionClick = (option: string, path: string[]) => {
        if (multiSelect) {
            const fullOption = option; // Can change to include path if needed for context
            const next = new Set(selectedOptions);
            if (next.has(fullOption)) {
                next.delete(fullOption);
            } else {
                next.add(fullOption);
            }
            setSelectedOptions(next);
        } else {
            const fullPath = [...path, option].join(' > ');
            onConfirm(fullPath);
            onClose();
        }
    };

    const handleMultiConfirm = () => {
        if (selectedOptions.size > 0) {
            onConfirm(Array.from(selectedOptions).join(', '));
            onClose();
        }
    };

    const handleEdit = () => {
        if (!onEditPrompt) return;
        if (multiSelect) {
             if (selectedOptions.size > 0) {
                 onEditPrompt(Array.from(selectedOptions).join(', '));
                 onClose();
             }
        }
    };

    const handleAutoDetect = () => {
        // "As-Is" / Empty string signals the service to let AI decide
        onConfirm(""); 
        onClose();
    };

    const renderTree = (nodes: any, path: string[] = []) => {
        const isLeaf = Array.isArray(nodes);
        
        if (isLeaf) return null; // Leaf arrays rendered in main area

        return (
            <div className="pl-4 border-l border-gray-800 ml-2">
                {Object.entries(nodes).map(([key, value]) => {
                    const newPath = [...path, key];
                    const newPathStr = newPath.join('::');
                    const isNodeLeaf = Array.isArray(value);
                    const isSelected = selectedCategory.join('::') === newPathStr;
                    const isExpanded = expandedCategories[newPathStr];

                    return (
                        <div key={key}>
                            <div 
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-gray-800 text-white font-bold' : 'hover:bg-gray-900 text-gray-400'}`}
                                onClick={() => {
                                    if (isNodeLeaf) handleSelectCategory(newPath);
                                    else toggleExpand(newPathStr);
                                }}
                            >
                                {isNodeLeaf ? <Circle className={`w-2 h-2 fill-current ${colorClass}`} /> : (isExpanded ? <FolderOpen className={`w-4 h-4 ${colorClass}`} /> : <Folder className="w-4 h-4 text-gray-600" />)}
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
        let current: any = treeData;
        for (const key of selectedCategory) {
            current = current[key];
        }
        return Array.isArray(current) ? current : null;
    };

    const options = getOptions();

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden relative border border-gray-800">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md">
                    <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-100">
                        <Icon className={`w-6 h-6 ${colorClass}`}/> {title}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500"/>
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 bg-gray-900/30 flex flex-col">
                        {/* Auto Detect Button at top of sidebar */}
                        <button 
                            onClick={handleAutoDetect}
                            className="flex items-center gap-3 p-4 mb-4 rounded-xl border border-gray-700 bg-gray-900 hover:bg-gray-800 hover:border-violet-500/50 transition-all group text-left shadow-lg"
                        >
                            <div className="p-2 rounded-full bg-gray-800 group-hover:bg-violet-900/30 text-gray-400 group-hover:text-violet-400 transition-colors">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-200 group-hover:text-white">Auto-Detect (As-Is)</span>
                                <span className="block text-[10px] text-gray-500">Let AI determine the best style</span>
                            </div>
                        </button>
                        
                        <div className="space-y-1 flex-1">
                            {renderTree(treeData)}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-24">
                        {options ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {(options as string[]).map((option: string) => {
                                    const isSelected = multiSelect && selectedOptions.has(option);
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleOptionClick(option, selectedCategory)}
                                            className={`p-4 rounded-xl border transition-all text-left group relative flex justify-between items-start ${isSelected ? 'bg-violet-900/30 border-violet-500' : 'border-gray-800 hover:border-gray-600 hover:bg-gray-900'}`}
                                        >
                                            <span className={`font-bold ${isSelected ? 'text-violet-300' : 'text-gray-300 group-hover:text-white'}`}>{option}</span>
                                            {multiSelect && (
                                                <div className="ml-2">
                                                    {isSelected ? <CheckSquare className="w-5 h-5 text-violet-400" /> : <Square className="w-5 h-5 text-gray-700 group-hover:text-gray-500" />}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                <Icon className="w-16 h-16 mb-4 opacity-10" />
                                <p>Select a category to explore options</p>
                            </div>
                        )}
                    </div>
                </div>

                {multiSelect && (
                    <div className="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center absolute bottom-0 left-0 right-0 z-10">
                        <div className="text-sm text-gray-400">
                            <span className="font-bold text-white">{selectedOptions.size}</span> selected
                        </div>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setSelectedOptions(new Set())}
                                className="px-4 py-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
                                disabled={selectedOptions.size === 0}
                            >
                                Clear
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
                                onClick={handleMultiConfirm}
                                disabled={selectedOptions.size === 0}
                                className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg shadow-violet-900/20 transition-all active:scale-95"
                            >
                                <CheckCircle2 className="w-4 h-4" /> Confirm Selection
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
