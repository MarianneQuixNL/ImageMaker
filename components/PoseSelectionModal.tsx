
import React, { useState } from 'react';
import { X, UserCheck, ChevronRight, Circle, Folder, FolderOpen, Image as ImageIcon, CheckSquare, Square, RotateCcw, MessageSquare } from 'lucide-react';
import { POSE_CATEGORIES } from '../constants/poseOptions';

interface PoseSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectPose: (poses: string[], keepBackground: boolean, aspectRatio: string) => void;
    onEditPrompt?: (poses: string[], keepBackground: boolean, aspectRatio: string) => void;
}

const AspectRatioSelector = ({ value, onChange }: { value: string, onChange: (v: string) => void }) => (
    <div className="flex flex-col gap-2 bg-gray-900 p-3 rounded-lg border border-gray-800">
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

export const PoseSelectionModal: React.FC<PoseSelectionModalProps> = ({ isOpen, onClose, onSelectPose, onEditPrompt }) => {
    const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [selectedPoses, setSelectedPoses] = useState<Set<string>>(new Set());
    const [keepBackground, setKeepBackground] = useState(false);
    const [aspectRatio, setAspectRatio] = useState("As-is");

    if (!isOpen) return null;

    const handleReset = () => {
        setSelectedPoses(new Set());
        setKeepBackground(false);
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

    const togglePose = (pose: string) => {
        const next = new Set(selectedPoses);
        if (next.has(pose)) next.delete(pose);
        else next.add(pose);
        setSelectedPoses(next);
    };

    const handleConfirm = () => {
        if (selectedPoses.size > 0) {
            onSelectPose(Array.from(selectedPoses), keepBackground, aspectRatio === "As-is" ? undefined : aspectRatio);
            onClose();
        }
    };

    const handleEdit = () => {
        if (selectedPoses.size > 0 && onEditPrompt) {
            onEditPrompt(Array.from(selectedPoses), keepBackground, aspectRatio === "As-is" ? undefined : aspectRatio);
            onClose();
        }
    };

    const renderTree = (nodes: any, path: string[] = []) => {
        const isLeaf = Array.isArray(nodes);
        if (isLeaf) return null;
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
        let current: any = POSE_CATEGORIES;
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
                        <UserCheck className="w-6 h-6 text-violet-500"/> Select Pose
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
                    <div className="w-1/3 border-r border-gray-800 overflow-y-auto p-4 bg-gray-900 flex flex-col gap-4">
                        <div className="space-y-1 flex-1">
                            {renderTree(POSE_CATEGORIES)}
                        </div>
                        <div className="mt-auto border-t border-gray-800 pt-4 space-y-4">
                            <AspectRatioSelector value={aspectRatio} onChange={setAspectRatio} />
                            <label className="flex items-center gap-2 cursor-pointer select-none group bg-gray-900 p-3 rounded-lg border border-gray-800">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${keepBackground ? 'bg-violet-600 border-violet-600' : 'bg-gray-800 border-gray-600 group-hover:border-violet-400'}`}>
                                    {keepBackground && <ImageIcon className="w-3 h-3 text-white" />}
                                </div>
                                <input type="checkbox" checked={keepBackground} onChange={(e) => setKeepBackground(e.target.checked)} className="hidden" />
                                <div>
                                    <span className="text-sm font-bold text-gray-200 block">Keep Background</span>
                                    <span className="text-[10px] text-gray-500 block">Background will be adapted.</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 bg-gray-950 pb-24">
                        {options ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {options.map((option: string) => {
                                    const isSelected = selectedPoses.has(option);
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => togglePose(option)}
                                            className={`p-4 rounded-xl border transition-all text-left group relative ${isSelected ? 'bg-violet-900/30 border-violet-500 shadow-md' : 'bg-gray-900 border-gray-800 hover:border-violet-500/50 hover:bg-violet-900/10'}`}
                                        >
                                            <span className={`font-bold ${isSelected ? 'text-violet-300' : 'text-gray-300 group-hover:text-white'}`}>{option}</span>
                                            <div className="absolute top-4 right-4">
                                                {isSelected ? <CheckSquare className="w-5 h-5 text-violet-400" /> : <Square className="w-5 h-5 text-gray-700 group-hover:text-gray-600" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                <UserCheck className="w-16 h-16 mb-4 opacity-10" />
                                <p>Select a pose category from the sidebar</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="absolute bottom-0 right-0 left-1/3 bg-gray-900 border-t border-gray-800 p-4 flex justify-end gap-3">
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            disabled={selectedPoses.size === 0}
                            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-xl font-bold transition-all border border-gray-700 flex items-center gap-2"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleConfirm}
                        disabled={selectedPoses.size === 0}
                        className="px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all"
                    >
                        Generate {selectedPoses.size > 0 ? `(${selectedPoses.size})` : ''}
                    </button>
                </div>
            </div>
        </div>
    );
};
