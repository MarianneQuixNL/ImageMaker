
import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Terminal, ThumbsDown, Lightbulb } from 'lucide-react';

interface PromptResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: {
        prompt: string;
        negativePrompt: string;
        suggestions: string;
        generator?: string;
    };
}

const CopyBlock: React.FC<{ title: string, text: string, icon: React.ReactNode, colorClass: string }> = ({ title, text, icon, colorClass }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col gap-2 h-full">
            <div className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider ${colorClass}`}>
                <span className="flex items-center gap-2">{icon} {title}</span>
                <button 
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white flex items-center gap-1"
                >
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <textarea 
                readOnly
                value={text}
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm text-gray-300 focus:outline-none resize-none font-mono leading-relaxed"
            />
        </div>
    );
};

export const PromptResultModal: React.FC<PromptResultModalProps> = ({ isOpen, onClose, data }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-600/20 rounded-xl shadow-lg border border-violet-600/50">
                            <Terminal className="w-6 h-6 text-violet-500" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Generated Prompt Result</h2>
                            <p className="text-xs text-gray-500">
                                Target Engine: <span className="text-violet-400 font-bold">{data.generator || "Unknown"}</span>
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 bg-gray-950 flex-1 overflow-hidden grid grid-rows-3 gap-6">
                    <CopyBlock 
                        title="Positive Prompt" 
                        text={data.prompt} 
                        icon={<Terminal className="w-4 h-4" />}
                        colorClass="text-violet-400"
                    />
                    <CopyBlock 
                        title="Negative Prompt" 
                        text={data.negativePrompt} 
                        icon={<ThumbsDown className="w-4 h-4" />}
                        colorClass="text-red-400"
                    />
                    <CopyBlock 
                        title="Suggestions / Notes" 
                        text={data.suggestions} 
                        icon={<Lightbulb className="w-4 h-4" />}
                        colorClass="text-yellow-400"
                    />
                </div>
            </div>
        </div>
    );
};
