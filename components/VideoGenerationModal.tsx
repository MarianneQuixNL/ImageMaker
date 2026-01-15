import React, { useState, useEffect } from 'react';
import { X, Video, Sparkles, Film, Loader2, RotateCcw, MessageSquare } from 'lucide-react';
import { HistoryItem, JobStatus, JobType } from '../types';
import { jobService } from '../services/jobService';
// @FIX: Import job action creators
import { createSuggestVideoPromptJob, createVideoGenerationJob } from '../../services/jobActions';

interface VideoGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: HistoryItem;
    onEditPrompt?: (prompt: string, resolution: '720p' | '1080p', isVeo: boolean) => void;
}

export const VideoGenerationModal: React.FC<VideoGenerationModalProps> = ({ isOpen, onClose, image, onEditPrompt }) => {
    const [prompt, setPrompt] = useState("");
    const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
    const [isSuggesting, setIsSuggesting] = useState(false);

    // Listen for suggestion job completion
    useEffect(() => {
        if (!isOpen) return;
        
        // Find latest suggestion job
        const jobs = jobService.getSnapshot().jobs;
        const suggestJob = jobs.find(j => 
            j.imageId === image.id && 
            j.type === JobType.SUGGEST_VIDEO_PROMPT && 
            j.status === JobStatus.FINISHED &&
            j.createdAt.getTime() > (Date.now() - 30000) // Within last 30 seconds
        );

        if (suggestJob && suggestJob.result && typeof suggestJob.result === 'string') {
            const cleanResult = suggestJob.result.replace(/^"|"$/g, '').trim();
            if (cleanResult && cleanResult !== prompt) {
                setPrompt(cleanResult);
                setIsSuggesting(false);
            }
        }
    }, [isOpen, image.id, jobService.getSnapshot().jobs]);

    const handleReset = () => {
        setPrompt("");
        setResolution('1080p');
    };

    const handleGenerate = () => {
        if (!prompt.trim()) return;
        // @FIX: Use action creator
        createVideoGenerationJob(image, prompt, resolution, true);
        onClose();
    };

    const handleEdit = () => {
        if (!prompt.trim()) return;
        if (onEditPrompt) {
            onEditPrompt(prompt, resolution, true);
            onClose();
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'Enter' && !e.shiftKey) {
                if (e.target instanceof HTMLTextAreaElement) {
                    if (e.ctrlKey) handleGenerate();
                    return;
                }
                handleGenerate();
            }
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, prompt, resolution]);

    if (!isOpen) return null;

    const handleSuggest = () => {
        setIsSuggesting(true);
        // @FIX: Use action creator
        createSuggestVideoPromptJob(image);
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="bg-gray-950 rounded-2xl shadow-2xl w-[95vw] h-[95vh] overflow-hidden border border-gray-800 flex flex-col">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-600 rounded-xl shadow-lg shadow-violet-900/40">
                            <Video className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Generate Video</h2>
                            <p className="text-xs text-gray-500">Animate this image using Veo</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleReset} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-gray-500 hover:text-white" title="Reset">
                            <RotateCcw className="w-6 h-6" />
                        </button>
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <X className="w-6 h-6 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6 bg-gray-950 flex-1 overflow-y-auto">
                    
                    {/* Prompt Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Motion Prompt</label>
                            <button 
                                onClick={handleSuggest}
                                disabled={isSuggesting}
                                className="flex items-center gap-1.5 text-xs font-bold text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors"
                            >
                                {isSuggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                {isSuggesting ? "Analyzing..." : "Suggest Motion"}
                            </button>
                        </div>
                        <textarea 
                            className="w-full h-32 bg-gray-900 border border-gray-700 rounded-xl p-4 text-sm text-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none resize-none placeholder-gray-600 leading-relaxed"
                            placeholder="Describe the movement... (e.g. The camera pans slowly to the right, the trees sway in the wind)"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>

                    {/* Resolution Selection */}
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">Resolution</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setResolution('1080p')}
                                className={`p-4 rounded-xl border text-sm font-bold transition-all text-center ${resolution === '1080p' ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                            >
                                1080p (HD)
                            </button>
                            <button
                                onClick={() => setResolution('720p')}
                                className={`p-4 rounded-xl border text-sm font-bold transition-all text-center ${resolution === '720p' ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'}`}
                            >
                                720p (Fast)
                            </button>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800 bg-gray-900 flex justify-end shrink-0 gap-3">
                    {onEditPrompt && (
                        <button 
                            onClick={handleEdit}
                            disabled={!prompt.trim()}
                            className="flex items-center gap-2 px-4 py-4 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 rounded-xl font-bold text-sm transition-all border border-gray-700"
                        >
                            <MessageSquare className="w-4 h-4" /> Edit Prompt
                        </button>
                    )}
                    <button 
                        onClick={handleGenerate}
                        disabled={!prompt.trim()}
                        className="flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:grayscale text-white rounded-xl font-bold text-sm shadow-xl shadow-violet-900/20 transition-all active:scale-95"
                    >
                        <Film className="w-5 h-5" /> Generate Video
                    </button>
                </div>
            </div>
        </div>
    );
};