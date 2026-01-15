
import React, { useState, useEffect } from 'react';
import { X, Ghost, CheckCircle2, Shirt, ArrowRight, Loader2, ChevronRight, Circle, Folder, FolderOpen, MapPin, Search, RefreshCw, RotateCcw, MessageSquare } from 'lucide-react';
import { HistoryItem } from '../types';
import { analyzeClothingLayers, cropImage } from '../services/geminiService';
import { CLOTHING_PILE_OPTIONS } from '../constants/clothingPileOptions';

interface SmartUndressModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onConfirm: (config: { removedItems: string[], extraItems: string[], location: string }) => void;
    onEditPrompt?: (config: { removedItems: string[], extraItems: string[], location: string }) => void;
}

export const SmartUndressModal: React.FC<SmartUndressModalProps> = ({ isOpen, onClose, image, onConfirm, onEditPrompt }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [detectedItems, setDetectedItems] = useState<string[]>([]);
    const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
    
    // Generic Pile Items
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [selectedExtras, setSelectedExtras] = useState<Set<string>>(new Set());
    
    const [location, setLocation] = useState("Floor");

    // Analysis Logic
    const runAnalysis = async () => {
        if (!image.url) return;
        setIsLoading(true);
        try {
            let imageSource = image.url;
            
            // If a person is detected, crop to them + 10px for better accuracy
            if (image.peopleDetection?.people && image.peopleDetection.people.length > 0) {
                const person = image.peopleDetection.people[0];
                if (person.box_2d) {
                    imageSource = await cropImage(image.url, person.box_2d, 10);
                }
            }

            const result = await analyzeClothingLayers(imageSource, "", "gemini-3-flash-preview");
            const items = result.data.items || [];
            // Filter out non-garment strings if any leaked through (basic length check)
            const cleanItems = items.filter(i => i.length < 50); 
            setDetectedItems(cleanItems);
        } catch (e) {
            console.error("Clothing analysis failed", e);
            setDetectedItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Analysis Effect with Crop
    useEffect(() => {
        if (isOpen && image.url) {
            runAnalysis();
        } else {
            setDetectedItems([]);
            setSelectedToRemove(new Set());
            setSelectedExtras(new Set());
        }
    }, [isOpen, image]);

    // Close on escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, selectedToRemove, selectedExtras]);

    if (!isOpen) return null;

    const handleReset = () => {
        setSelectedToRemove(new Set());
        setSelectedExtras(new Set());
        setLocation("Floor");
    };

    const toggleRemove = (item: string) => {
        const next = new Set(selectedToRemove);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        setSelectedToRemove(next);
    };

    const toggleExtra = (item: string) => {
        const next = new Set(selectedExtras);
        if (next.has(item)) next.delete(item);
        else next.add(item);
        setSelectedExtras(next);
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

    const handleConfirm = () => {
        onConfirm({
            removedItems: Array.from(selectedToRemove),
            extraItems: Array.from(selectedExtras),
            location
        });
        onClose();
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt({
                removedItems: Array.from(selectedToRemove),
                extraItems: Array.from(selectedExtras),
                location
            });
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
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm mb-1 transition-colors ${isSelected ? 'bg-pink-900/40 text-pink-300 font-bold' : 'hover:bg-gray-800 text-gray-300'}`}
                                onClick={() => {
                                    if (isNodeLeaf) handleSelectCategory(newPath);
                                    else toggleExpand(newPathStr);
                                }}
                            >
                                {isNodeLeaf ? <Circle className="w-2 h-2 text-pink-400 fill-current" /> : (isExpanded ? <FolderOpen className="w-4 h-4 text-pink-500" /> : <Folder className="w-4 h-4 text-gray-500" />)}
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
        let current: any = CLOTHING_PILE_OPTIONS;
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
                        <div className="p-3 bg-pink-600 rounded-xl shadow-lg shadow-pink-900/40">
                            <Ghost className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Smart Undress</h2>
                            <p className="text-xs text-gray-500">Create a high-fashion editorial wardrobe scene</p>
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

                <div className="flex flex-1 overflow-hidden">
                    {/* Left Column: On Person */}
                    <div className="w-1/3 border-r border-gray-800 bg-gray-900/50 p-6 overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Search className="w-4 h-4 text-violet-500" /> Detected On Person
                            </h3>
                            <button onClick={runAnalysis} className="p-1.5 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors" title="Retry Detection">
                                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                                <Loader2 className="w-8 h-8 animate-spin mb-2 text-pink-500" />
                                <p className="text-xs">Analyzing outfit...</p>
                            </div>
                        ) : detectedItems.length === 0 ? (
                            <div className="text-gray-500 text-sm text-center py-8">
                                <p>No specific items detected or analysis failed.</p>
                                <button onClick={runAnalysis} className="mt-2 text-violet-400 hover:underline text-xs">Try Again</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {detectedItems.map(item => (
                                    <button
                                        key={item}
                                        onClick={() => toggleRemove(item)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${selectedToRemove.has(item) ? 'bg-red-900/30 border-red-500 text-red-200 shadow-md' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                    >
                                        <span className="text-sm font-bold capitalize truncate pr-2">{item}</span>
                                        {selectedToRemove.has(item) ? <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded font-bold uppercase shrink-0">Remove</span> : <span className="text-[10px] text-gray-600 font-bold uppercase shrink-0">Keep</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                        
                        <div className="mt-8 pt-6 border-t border-gray-800">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin className="w-4 h-4" /> Pile Location
                            </h3>
                            <select 
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-pink-500 outline-none"
                            >
                                <option value="Floor">Floor (Messy Pile)</option>
                                <option value="Chair">Chair</option>
                                <option value="Bed">Bed</option>
                                <option value="Table">Table</option>
                                <option value="Sofa">Sofa</option>
                            </select>
                        </div>

                        <div className="mt-4 p-3 bg-pink-900/10 border border-pink-900/30 rounded-lg">
                            <p className="text-[10px] text-pink-300 leading-tight">
                                <span className="font-bold">Context:</span> Editorial Fashion Scene. Selected items will be removed from the subject and placed as props in the environment.
                            </p>
                        </div>
                    </div>

                    {/* Middle Column: Arrow */}
                    <div className="w-12 bg-gray-950 flex items-center justify-center border-r border-gray-800">
                        <ArrowRight className="w-6 h-6 text-gray-700" />
                    </div>

                    {/* Right Column: Pile Extras */}
                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-64 border-r border-gray-800 bg-gray-900 overflow-y-auto p-4 custom-scrollbar">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3 px-2">Generic Extras</h3>
                            {renderTree(CLOTHING_PILE_OPTIONS)}
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-32 custom-scrollbar">
                            <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Add to Pile</h3>
                            {options ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {(options as string[]).map((option: string) => {
                                        const isSelected = selectedExtras.has(option);
                                        return (
                                            <button
                                                key={option}
                                                onClick={() => toggleExtra(option)}
                                                className={`p-3 rounded-lg border transition-all text-left text-sm font-bold ${isSelected ? 'bg-pink-900/30 border-pink-500 text-pink-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                                    <Shirt className="w-12 h-12 mb-4 opacity-10" />
                                    <p className="text-xs">Select a category to add generic items to the pile</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end items-center gap-3">
                    <div className="text-sm text-gray-400 flex-1">
                        Removing <span className="text-white font-bold">{selectedToRemove.size}</span> items, adding <span className="text-white font-bold">{selectedExtras.size}</span> extras.
                    </div>
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-sm transition-all border border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm}
                        className="flex items-center gap-2 px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-pink-900/20 transition-all active:scale-95"
                    >
                        <CheckCircle2 className="w-5 h-5" /> Generate Scene
                    </button>
                </div>
            </div>
        </div>
    );
};
