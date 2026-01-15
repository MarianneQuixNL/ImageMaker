
import React, { useState, useEffect } from 'react';
import { X, LayoutTemplate, ChevronRight, Folder, FolderOpen, FileText, CheckSquare, Square, Shirt, RotateCcw, MessageSquare, CheckCircle2 } from 'lucide-react';
import { topicService, DetailedTopicNode } from '../services/topicService';

interface TopicSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectTopics: (topics: { name: string, description?: string }[], clothingStyle: string) => void;
    onEditPrompt?: (topics: { name: string, description?: string }[], clothingStyle: string) => void;
}

export const TopicSelectionModal: React.FC<TopicSelectionModalProps> = ({ isOpen, onClose, onSelectTopics, onEditPrompt }) => {
    const [simpleTopics, setSimpleTopics] = useState<string[]>([]);
    const [detailedTree, setDetailedTree] = useState<DetailedTopicNode[]>([]);
    
    // Selection state
    const [selectedSimpleTopics, setSelectedSimpleTopics] = useState<Set<string>>(new Set());
    const [selectedDetailedTopics, setSelectedDetailedTopics] = useState<Set<DetailedTopicNode>>(new Set());
    const [lastViewedDetailedTopic, setLastViewedDetailedTopic] = useState<DetailedTopicNode | null>(null);
    
    const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
    const [activeTab, setActiveTab] = useState<'simple' | 'detailed'>('detailed');
    
    // Clothing Style State
    const [clothingStyle, setClothingStyle] = useState<string>('Be Creative');

    useEffect(() => {
        if (isOpen) {
            setSimpleTopics(topicService.getSimpleTopics());
            setDetailedTree(topicService.getDetailedTopicsTree());
            // Reset selection state
            handleReset();
        }
    }, [isOpen]);

    const handleReset = () => {
        setSelectedSimpleTopics(new Set());
        setSelectedDetailedTopics(new Set());
        setLastViewedDetailedTopic(null);
        setClothingStyle('Be Creative');
        setActiveTab('detailed');
    };

    const getSelection = () => {
        if (activeTab === 'simple') {
            return Array.from(selectedSimpleTopics).map(name => ({ name }));
        } else {
            return Array.from(selectedDetailedTopics).map((node: DetailedTopicNode) => ({ name: node.name, description: node.description }));
        }
    };

    const handleConfirm = () => {
        onSelectTopics(getSelection(), clothingStyle);
        onClose();
    };

    const handleEdit = () => {
        if (onEditPrompt) {
            onEditPrompt(getSelection(), clothingStyle);
            onClose();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter') handleConfirm();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, selectedSimpleTopics, selectedDetailedTopics, clothingStyle, activeTab]);

    // CRITICAL FIX: Ensure modal only renders when open
    if (!isOpen) return null;

    const toggleExpand = (nodeName: string) => {
        setExpandedNodes(prev => {
            const next = new Set(prev);
            if (next.has(nodeName)) next.delete(nodeName);
            else next.add(nodeName);
            return next;
        });
    };

    const toggleSimpleTopic = (topic: string) => {
        const next = new Set(selectedSimpleTopics);
        if (next.has(topic)) next.delete(topic);
        else next.add(topic);
        setSelectedSimpleTopics(next);
    };

    const toggleDetailedTopic = (node: DetailedTopicNode) => {
        const next = new Set(selectedDetailedTopics);
        if (next.has(node)) next.delete(node);
        else next.add(node);
        setSelectedDetailedTopics(next);
        setLastViewedDetailedTopic(node);
    };

    const countSelected = activeTab === 'simple' ? selectedSimpleTopics.size : selectedDetailedTopics.size;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-gray-800">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-gray-100">
                        <LayoutTemplate className="w-6 h-6 text-violet-500"/> Topic Selection
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

                {/* Tabs */}
                <div className="flex border-b border-gray-800 bg-gray-900">
                    <button 
                        onClick={() => setActiveTab('detailed')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'detailed' ? 'bg-gray-800 text-violet-400 border-b-2 border-violet-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        Detailed Topics (Tree)
                    </button>
                    <button 
                        onClick={() => setActiveTab('simple')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'simple' ? 'bg-gray-800 text-violet-400 border-b-2 border-violet-500' : 'text-gray-400 hover:text-white'}`}
                    >
                        Simple Topics
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden p-6 bg-gray-950 flex flex-col">
                    {activeTab === 'simple' ? (
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Choose one or more basic themes</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {simpleTopics.map(topic => {
                                    const isSelected = selectedSimpleTopics.has(topic);
                                    return (
                                        <div 
                                            key={topic} 
                                            onClick={() => toggleSimpleTopic(topic)}
                                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-all ${isSelected ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
                                        >
                                            <span className="font-bold text-sm">{topic}</span>
                                            {isSelected ? <CheckSquare className="w-5 h-5 text-violet-500" /> : <Square className="w-5 h-5 text-gray-700" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="flex h-full gap-6 overflow-hidden">
                            {/* Tree View */}
                            <div className="w-1/2 border border-gray-800 rounded-xl bg-gray-900 overflow-y-auto p-4 custom-scrollbar">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Browse Categories</label>
                                {detailedTree.map(rootNode => (
                                    <div key={rootNode.name} className="mb-2">
                                        <div 
                                            className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-gray-800 text-gray-300 font-bold text-sm select-none"
                                            onClick={() => toggleExpand(rootNode.name)}
                                        >
                                            {expandedNodes.has(rootNode.name) ? <FolderOpen className="w-4 h-4 text-violet-500" /> : <Folder className="w-4 h-4 text-gray-500" />}
                                            {rootNode.name}
                                        </div>
                                        
                                        {expandedNodes.has(rootNode.name) && rootNode.children && (
                                            <div className="ml-4 pl-2 border-l border-gray-800 mt-1 space-y-1">
                                                {rootNode.children.map(child => {
                                                    const isSelected = selectedDetailedTopics.has(child);
                                                    return (
                                                        <div 
                                                            key={child.name}
                                                            onClick={() => toggleDetailedTopic(child)}
                                                            className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${isSelected ? 'bg-violet-900/30 text-violet-200 border border-violet-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-transparent'}`}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="w-3 h-3" />
                                                                {child.name}
                                                            </div>
                                                            {isSelected && <CheckCircle2 className="w-3 h-3 text-violet-500" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Description Panel */}
                            <div className="w-1/2 flex flex-col">
                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full shadow-inner flex flex-col">
                                    {lastViewedDetailedTopic ? (
                                        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-black text-white">{lastViewedDetailedTopic.name}</h3>
                                                {selectedDetailedTopics.has(lastViewedDetailedTopic) && <span className="text-[10px] bg-violet-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Selected</span>}
                                            </div>
                                            <div className="h-px bg-gray-800 w-full mb-4" />
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {lastViewedDetailedTopic.description || "No detailed description available."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-600 flex-1 flex flex-col items-center justify-center">
                                            <ChevronRight className="w-12 h-12 mb-2 opacity-20" />
                                            <p className="text-sm font-bold uppercase tracking-wider">Select a subtopic to view details</p>
                                        </div>
                                    )}
                                    
                                    <div className="mt-auto pt-4 border-t border-gray-800">
                                        <p className="text-xs text-gray-500">
                                            Selected in Detailed View: <span className="text-white font-bold">{selectedDetailedTopics.size}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-between items-center gap-6">
                    {/* Clothing Style Selection */}
                    <div className="flex-1 flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                            <Shirt className="w-4 h-4 text-violet-500" />
                            Clothing:
                        </label>
                        <select 
                            value={clothingStyle} 
                            onChange={(e) => setClothingStyle(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 outline-none focus:border-violet-500"
                        >
                            <option value="Bare Minimum">Bare minimum (Loincloths/Rags)</option>
                            <option value="As-Is">As-is (Adapted Material)</option>
                            <option value="Be Creative">Be Creative (AI Decides)</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-400">
                            Total Selected: <span className="text-white font-bold text-lg">{countSelected}</span>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-6 py-2 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                            {onEditPrompt && (
                                <button 
                                    onClick={handleEdit}
                                    disabled={countSelected !== 1}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-lg font-bold transition-all border border-gray-700"
                                >
                                    <MessageSquare className="w-4 h-4" /> Edit Prompt
                                </button>
                            )}
                            <button 
                                onClick={handleConfirm}
                                disabled={countSelected === 0}
                                className="flex items-center gap-2 px-8 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg shadow-violet-900/20 transition-all active:scale-95"
                            >
                                <CheckCircle2 className="w-5 h-5" /> Generate {countSelected > 1 ? `(${countSelected})` : ''}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
