
import React, { useState, useEffect } from 'react';
import { X, MessageSquare, CheckCircle2, RotateCcw } from 'lucide-react';

interface PromptEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    originalPrompt: string;
    onConfirm: (newPrompt: string) => void;
}

export const PromptEditDialog: React.FC<PromptEditDialogProps> = ({ isOpen, onClose, originalPrompt, onConfirm }) => {
    const [prompt, setPrompt] = useState(originalPrompt);

    useEffect(() => {
        setPrompt(originalPrompt);
    }, [originalPrompt, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-gray-950 w-[800px] max-w-[95vw] rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-800 bg-gray-900">
                    <h2 className="text-lg font-bold flex items-center gap-3 text-white">
                        <MessageSquare className="w-5 h-5 text-blue-500"/> Edit Prompt
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>
                
                <div className="p-6 bg-gray-950 flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        Review & Modify Instructions
                    </label>
                    <textarea 
                        className="w-full h-64 bg-gray-900 border border-gray-700 rounded-xl p-4 text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none font-mono text-sm leading-relaxed"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        autoFocus
                    />
                </div>

                <div className="p-5 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
                    <button 
                        onClick={() => setPrompt(originalPrompt)}
                        className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-white transition-colors"
                    >
                        <RotateCcw className="w-3 h-3" /> Reset to Original
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-5 py-2.5 text-gray-400 hover:text-white font-bold text-sm transition-colors">
                            Cancel
                        </button>
                        <button 
                            onClick={() => { onConfirm(prompt); onClose(); }}
                            disabled={!prompt.trim()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-lg transition-all active:scale-95"
                        >
                            <CheckCircle2 className="w-4 h-4" /> Confirm & Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
