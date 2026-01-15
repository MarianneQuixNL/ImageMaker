
import React, { useState, useEffect } from 'react';
import { X, Camera, ChevronRight, Circle, Folder, FolderOpen, CheckCircle2, User, RotateCcw, MessageSquare } from 'lucide-react';
import { HistoryItem } from '../types';
import { FRAMING_OPTIONS, PORTRAIT_EXPRESSIONS } from '../constants/portraitOptions';
import { HAIR_COLORS } from '../constants/hairOptions';
import { EYE_COLORS } from '../constants/eyeOptions';

interface PortraitModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onConfirm: (config: { framing: string, angle: string, hairColor: string, eyeColor: string, expression: string }) => void;
    onEditPrompt?: (config: { framing: string, angle: string, hairColor: string, eyeColor: string, expression: string }) => void;
}

export const PortraitModal: React.FC<PortraitModalProps> = ({ isOpen, onClose, image, onConfirm, onEditPrompt }) => {
    const [framing, setFraming] = useState("Chest up");
    const [angle, setAngle] = useState(0); // -90 to 90
    const [hairColor, setHairColor] = useState("Original");
    const [eyeColor, setEyeColor] = useState("Original");
    
    // Expression Tree State
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedExpression, setSelectedExpression] = useState("Neutral");

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleGenerate();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, framing, angle, hairColor, eyeColor, selectedExpression]);

    if (!isOpen) return null;

    const handleReset = () => {
        setFraming("Chest up");
        setAngle(0);
        setHairColor("Original");
        setEyeColor("Original");
        setSelectedExpression("Neutral");
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

    const handleExpressionSelect = (expr: string) => {
        setSelectedExpression(expr);
    };

    const renderTree = (nodes: any, path: string[] = []) => {
        return (
            <div className="pl-4 border-l border-gray-800 ml-2">
                {Object.entries(nodes).map(([key, value]) => {
                    const newPath = [...path, key];
                    const newPathStr = newPath.join('::');
                    const isLeaf = Array.isArray(value);
                    const isExpanded = expandedCategories[newPathStr];

                    return (
                        <div key={key}>
                            <div 
                                className="flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer text-sm mb-1 hover:bg-gray-800 text-gray-400"
                                onClick={() => toggleExpand(newPathStr)}
                            >
                                {isExpanded ? 
                                    <FolderOpen className={`w-3 h-3 ${isLeaf ? 'text-cyan-400' : 'text-cyan-600'}`} /> : 
                                    <Folder className={`w-3 h-3 ${isLeaf ? 'text-gray-500' : 'text-gray-600'}`} />
                                }
                                <span className={!isLeaf ? "font-bold text-gray-300" : "text-gray-300"}>{key}</span>
                            </div>
                            
                            {isLeaf && isExpanded && (
                                <div className="grid grid-cols-1 gap-1 pl-4 mb-2">
                                    {(value as string[]).map(expr => (
                                        <button
                                            key={expr}
                                            onClick={() => handleExpressionSelect(expr)}
                                            className={`text-left text-[10px] px-3 py-1.5 rounded border transition-all ${selectedExpression === expr ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'}`}
                                        >
                                            {expr}
                                        </button>
                                    ))}
                                </div>
                            )}
                            
                            {!isLeaf && isExpanded && renderTree(value, newPath)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const getAngleLabel = (val: number) => {
        if (val === 0) return "Front Facing";
        if (val === -90) return "Left Profile";
        if (val === 90) return "Right Profile";
        if (val === -45) return "3/4 Left";
        if (val === 45) return "3/4 Right";
        return val < 0 ? `${Math.abs(val)}° Left` : `${val}° Right`;
    };

    const handleGenerate = () => {
        onConfirm({
            framing,
            angle: getAngleLabel(angle),
            hairColor,
            eyeColor,
            expression: selectedExpression
        });
        onClose();
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt({
                framing,
                angle: getAngleLabel(angle),
                hairColor,
                eyeColor,
                expression: selectedExpression
            });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-[2rem] shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-gray-800">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-800 bg-gray-900 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-cyan-600 rounded-xl shadow-lg shadow-cyan-900/40">
                            <Camera className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Portrait Generator</h2>
                            <p className="text-xs text-gray-500">Create a professional studio portrait</p>
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
                    {/* Column 1: Preview & Framing */}
                    <div className="w-[30%] border-r border-gray-800 p-6 flex flex-col gap-6 bg-gray-900/30 overflow-y-auto">
                        <div className="relative rounded-xl overflow-hidden border border-gray-700 shadow-xl aspect-[3/4] bg-black">
                            <img src={image.url} alt="Reference" className="w-full h-full object-cover opacity-60" />
                            
                            {/* Overlay for Framing Preview */}
                            <div className={`absolute left-0 right-0 bottom-0 border-t-2 border-cyan-500 bg-cyan-500/10 transition-all duration-300 ${
                                framing === "Neck up" ? "top-[20%]" : 
                                framing === "Chest up" ? "top-[40%]" : "top-[60%]"
                            }`}>
                                <div className="absolute top-2 left-2 bg-cyan-600 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                    {framing}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Framing</label>
                            <div className="grid grid-cols-1 gap-2">
                                {FRAMING_OPTIONS.map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setFraming(opt.id)}
                                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-left ${framing === opt.id ? 'bg-cyan-600 border-cyan-500 text-white' : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Column 2: Facial Expressions (Left-aligned relative to controls) */}
                    <div className="w-[35%] border-r border-gray-800 flex flex-col bg-gray-950">
                        <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Facial Expression</label>
                            <div className="mt-1 text-sm font-bold text-cyan-400">{selectedExpression}</div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {renderTree(PORTRAIT_EXPRESSIONS)}
                        </div>
                    </div>

                    {/* Column 3: Controls (Angle, Colors) */}
                    <div className="flex-1 p-8 overflow-y-auto bg-gray-950 flex flex-col gap-8">
                        
                        {/* Angle Slider */}
                        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-sm font-bold text-gray-200">Camera Angle</label>
                                <span className="text-xs font-mono text-cyan-400 bg-cyan-900/30 px-2 py-1 rounded">{getAngleLabel(angle)}</span>
                            </div>
                            <input 
                                type="range" 
                                min="-90" max="90" step="15" 
                                value={angle}
                                onChange={(e) => setAngle(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <div className="flex justify-between text-[10px] text-gray-600 mt-2 font-mono uppercase">
                                <span>Left Profile</span>
                                <span>Front</span>
                                <span>Right Profile</span>
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Hair Color</label>
                                <select 
                                    value={hairColor} 
                                    onChange={(e) => setHairColor(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none"
                                >
                                    <option value="Original">Original / As Is</option>
                                    {HAIR_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Eye Color</label>
                                <select 
                                    value={eyeColor} 
                                    onChange={(e) => setEyeColor(e.target.value)}
                                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-cyan-500 outline-none"
                                >
                                    <option value="Original">Original / As Is</option>
                                    {EYE_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            className="flex items-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl font-bold text-sm transition-all border border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleGenerate}
                        className="flex items-center gap-2 px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-cyan-900/20 transition-all active:scale-95"
                    >
                        <Camera className="w-6 h-6" /> Generate Portrait
                    </button>
                </div>
            </div>
        </div>
    );
};
