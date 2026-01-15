
import React, { useState, useEffect } from 'react';
import { X, Ghost, ChevronRight, Circle, Folder, FolderOpen, CheckCircle2, Droplets, RotateCcw, MessageSquare } from 'lucide-react';
import { TRANSPARENCY_METHODS } from '../constants/transparencyOptions';

interface SmartTransparencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (method: string, intensity: number) => void;
    onEditPrompt?: (method: string, intensity: number) => void;
}

export const SmartTransparencyModal: React.FC<SmartTransparencyModalProps> = ({ isOpen, onClose, onConfirm, onEditPrompt }) => {
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [intensity, setIntensity] = useState(50);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && selectedMethod) handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, selectedMethod, intensity]);

    if (!isOpen) return null;

    const handleReset = () => {
        setSelectedMethod(null);
        setIntensity(50);
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

    const handleMethodSelect = (method: string) => {
        setSelectedMethod(method);
    };

    const handleConfirm = () => {
        if (selectedMethod) {
            onConfirm(selectedMethod, intensity);
            onClose();
        }
    };

    const handleEdit = () => {
        if (selectedMethod && onEditPrompt) {
            onEditPrompt(selectedMethod, intensity);
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
        let current: any = TRANSPARENCY_METHODS;
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
                        <Ghost className="w-6 h-6 text-cyan-500"/> Smart Transparency
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
                    {/* Sidebar */}
                    <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 bg-gray-900">
                        <div className="space-y-1">
                            {renderTree(TRANSPARENCY_METHODS)}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-32">
                        {options ? (
                            <div className="grid grid-cols-2 gap-4">
                                {(options as string[]).map((option: string) => (
                                    <button
                                        key={option}
                                        onClick={() => handleMethodSelect(option)}
                                        className={`p-5 rounded-xl border transition-all text-left group relative ${selectedMethod === option ? 'bg-cyan-900/30 border-cyan-500 shadow-md' : 'bg-gray-900 border-gray-800 hover:border-cyan-500/50 hover:bg-cyan-900/10'}`}
                                    >
                                        <span className={`font-bold block ${selectedMethod === option ? 'text-cyan-300' : 'text-gray-300 group-hover:text-cyan-300'}`}>{option}</span>
                                        {selectedMethod === option && <CheckCircle2 className="w-5 h-5 text-cyan-400 absolute top-5 right-5" />}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                <Ghost className="w-16 h-16 mb-4 opacity-10" />
                                <p>Select a method category from the sidebar</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-6">
                    <div className="flex items-center gap-8">
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                    <Droplets className="w-4 h-4 text-cyan-500" /> Transparency Intensity
                                </label>
                                <span className="text-sm font-mono text-cyan-400 font-bold">{intensity}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="10" 
                                max="90" 
                                step="10" 
                                value={intensity} 
                                onChange={(e) => setIntensity(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-bold uppercase">
                                <span>Subtle (10%)</span>
                                <span>Balanced (50%)</span>
                                <span>Extreme (90%)</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2">
                            {onEditPrompt && (
                                <button 
                                    onClick={handleEdit}
                                    disabled={!selectedMethod}
                                    className="flex items-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-xl font-bold transition-all border border-gray-700"
                                >
                                    <MessageSquare className="w-4 h-4" /> Edit Prompt
                                </button>
                            )}
                            <button 
                                onClick={handleConfirm}
                                disabled={!selectedMethod}
                                className="flex items-center gap-2 px-8 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg shadow-cyan-900/20 transition-all active:scale-95 h-12"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Apply Transparency
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
