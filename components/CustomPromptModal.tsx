
import React, { useState, useEffect } from 'react';
import { X, MessageSquare, CheckCircle2, ShieldCheck, Undo2, Loader2 } from 'lucide-react';
import { sanitizeAndEnhancePrompt } from '../services/geminiService';

interface CustomPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (prompt: string) => void;
}

export const CustomPromptModal: React.FC<CustomPromptModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [prompt, setPrompt] = useState("");
    const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && !e.shiftKey) {
                // Ignore Enter if focused on textarea unless Ctrl+Enter
                if (e.target instanceof HTMLTextAreaElement) {
                    if (e.ctrlKey) handleSubmit();
                    return;
                }
                handleSubmit();
            }
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, prompt]);

    if (!isOpen) return null;

    const handleSanitize = async () => {
        if (!prompt.trim()) return;
        setIsProcessing(true);
        try {
            setOriginalPrompt(prompt); // Save state for undo
            const enhanced = await sanitizeAndEnhancePrompt(prompt);
            setPrompt(enhanced);
        } catch (e) {
            console.error(e);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleUndo = () => {
        if (originalPrompt) {
            setPrompt(originalPrompt);
            setOriginalPrompt(null);
        }
    };

    const handleSubmit = () => {
        if (!prompt.trim()) return;
        onSubmit(prompt);
        onClose();
        setPrompt("");
        setOriginalPrompt(null);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-950 rounded-xl shadow-2xl w-[95vw] h-[95vh] flex flex-col overflow-hidden border border-gray-800">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900">
                    <h2 className="text-xl font-bold flex items-center gap-3 text-gray-100">
                        <MessageSquare className="w-5 h-5 text-violet-500"/> Custom Prompt
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500"/>
                    </button>
                </div>
                <div className="flex-1 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-gray-400">Enter your instructions</label>
                        {originalPrompt && (
                            <button onClick={handleUndo} className="text-xs text-gray-500 hover:text-white flex items-center gap-1">
                                <Undo2 className="w-3 h-3" /> Undo Changes
                            </button>
                        )}
                    </div>
                    <textarea 
                        className="flex-1 w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none resize-none"
                        placeholder="E.g., Make the subject smile, add a hat, change the lighting to neon..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        autoFocus
                    />
                    <div className="flex justify-between items-center mt-4">
                        <p className="text-xs text-gray-500">The AI will try to follow your instructions while preserving the original image's style.</p>
                        <button 
                            onClick={handleSanitize}
                            disabled={!prompt.trim() || isProcessing}
                            className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                            Sanitize & Enhance
                        </button>
                    </div>
                </div>
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white font-bold text-sm">Cancel</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={!prompt.trim()}
                        className="flex items-center gap-2 px-6 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold shadow-lg transition-all"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Run
                    </button>
                </div>
            </div>
        </div>
    );
};
