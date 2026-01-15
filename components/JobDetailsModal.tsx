
import React, { useState } from 'react';
import { 
    X, FileText, Image as ImageIcon, Terminal, Info, 
    CheckCircle2, AlertCircle, Loader2, Ban, Clock, 
    RefreshCw, Trash2, FolderInput, Download, Copy, Check, Layers, ChevronDown, ChevronRight, Hash, Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Job, JobStatus, JobType, JobAttribute } from '../types';

interface JobDetailsModalProps {
    job: Job;
    onClose: () => void;
    onRetry: () => void;
    onCancel: () => void;
    onDelete: () => void;
    onPromote: () => void;
}

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors" title="Copy">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
    );
};

const SmartValue: React.FC<{ value: any }> = ({ value }) => {
    if (value === null || value === undefined) return <span className="text-gray-600 italic">null</span>;
    if (typeof value === 'boolean') return <span className={value ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{value.toString()}</span>;
    if (typeof value === 'number') return <span className="text-blue-300 font-mono">{value}</span>;
    if (Array.isArray(value)) {
        if (value.length === 0) return <span className="text-gray-600 italic">empty list</span>;
        if (value.every(v => typeof v === 'string' || typeof v === 'number')) {
            return (
                <div className="flex flex-wrap gap-1.5">
                    {value.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700">{v}</span>
                    ))}
                </div>
            );
        }
        return (
            <div className="space-y-2 mt-1 border-l-2 border-gray-700 pl-3">
                {value.map((v, i) => (
                    <div key={i} className="mb-2">
                        <SmartValue value={v} />
                    </div>
                ))}
            </div>
        );
    }
    if (typeof value === 'object') {
        return (
            <div className="grid grid-cols-1 gap-2 mt-1">
                {Object.entries(value).map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-0.5 flex items-center gap-1">
                            {k.replace(/_/g, ' ')}
                        </span>
                        <div className="pl-2">
                            <SmartValue value={v} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    const strVal = String(value);
    if (strVal.startsWith('http') || strVal.startsWith('/')) {
        return <span className="text-blue-400 underline break-all">{strVal}</span>;
    }
    return <span className="text-gray-200">{strVal}</span>;
};

const SmartRenderer: React.FC<{ data: any }> = ({ data }) => {
    if (!data) return <div className="text-gray-500 italic">No data content.</div>;
    if (data.markdown) {
        return <div className="markdown-body text-sm"><ReactMarkdown>{data.markdown}</ReactMarkdown></div>;
    }
    if (data.description && Object.keys(data).length === 1) {
        return <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{data.description}</div>;
    }
    if (typeof data === 'object') {
        return (
            <div className="space-y-4">
                {Object.entries(data).map(([key, val]) => (
                    <div key={key} className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 border-b border-gray-800 pb-1 flex items-center gap-2">
                            <Hash className="w-3 h-3 text-violet-500" />
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <div className="text-sm">
                            <SmartValue value={val} />
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    return <div>{String(data)}</div>;
};

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ job, onClose, onRetry, onCancel, onDelete, onPromote }) => {
    const [activeTab, setActiveTab] = useState<'Result' | 'Prompt' | 'Status' | 'Debug'>('Result');

    if (!job) return null;

    // Enhanced Detection Logic
    const isVideoJob = job.type === JobType.GENERATE_VIDEO;
    const isVideoResult = typeof job.result === 'string' && (job.result.startsWith('data:video') || job.result.endsWith('.mp4') || isVideoJob);
    const isImageResult = !isVideoResult && typeof job.result === 'string' && (job.result.startsWith('data:image') || job.result.startsWith('blob:'));
    const isText = typeof job.result === 'string' && !isImageResult && !isVideoResult;
    const isObject = typeof job.result === 'object' && job.result !== null;

    const getStatusColor = (status: JobStatus) => {
        switch (status) {
            case JobStatus.FINISHED: return 'text-green-500';
            case JobStatus.FAILED: return 'text-red-500';
            case JobStatus.RUNNING: return 'text-blue-500';
            case JobStatus.WAITING: return 'text-yellow-500';
            default: return 'text-gray-500';
        }
    };

    const handlePromote = () => {
        onPromote();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-950 w-[95vw] h-[95vh] rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gray-900 border border-gray-700 ${getStatusColor(job.status)}`}>
                            {job.status === JobStatus.RUNNING ? <Loader2 className="w-6 h-6 animate-spin" /> :
                             job.status === JobStatus.FINISHED ? <CheckCircle2 className="w-6 h-6" /> :
                             job.status === JobStatus.FAILED ? <AlertCircle className="w-6 h-6" /> :
                             <Clock className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                {job.name || job.type}
                                <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 text-xs font-mono border border-gray-700 uppercase tracking-wider flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {job.attribute}
                                </span>
                            </h2>
                            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mt-1">
                                <span>ID: {job.id.split('-')[0]}</span>
                                <span>•</span>
                                <span>{job.createdAt.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Action Buttons in Header */}
                        {(isImageResult || isVideoResult) && (
                            <>
                                <button 
                                    onClick={handlePromote}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-600/50 rounded-lg font-bold text-xs transition-colors"
                                >
                                    <FolderInput className="w-4 h-4" /> Add to Workspace
                                </button>
                                <a 
                                    href={job.result} 
                                    download={`job_result_${job.id}.${isVideoResult ? 'mp4' : 'png'}`}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 rounded-lg font-bold text-xs transition-colors"
                                >
                                    <Download className="w-4 h-4" /> Download
                                </a>
                            </>
                        )}
                        
                        <button onClick={() => { onDelete(); onClose(); }} className="p-2 bg-red-900/10 hover:bg-red-900/30 text-red-400 border border-red-900/30 rounded-lg transition-colors" title="Delete Job">
                            <Trash2 className="w-5 h-5" />
                        </button>
                        
                        <div className="h-6 w-px bg-gray-800 mx-1" />
                        
                        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full text-gray-500 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 bg-gray-900/30">
                    {['Result', 'Prompt', 'Status', 'Debug'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`flex-1 py-3 text-sm font-bold transition-colors border-b-2 ${activeTab === tab ? 'border-violet-500 text-violet-400 bg-gray-900' : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-950">
                    
                    {activeTab === 'Result' && (
                        <div className="h-full flex flex-col">
                            {!job.result ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                                    <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
                                    <p>No result available yet.</p>
                                    {job.status === JobStatus.RUNNING && <p className="text-blue-400 animate-pulse mt-2">Processing...</p>}
                                    {job.status === JobStatus.FAILED && <p className="text-red-400 mt-2">Job Failed. Check Status tab.</p>}
                                </div>
                            ) : (
                                <>
                                    {isImageResult && (
                                        <div className="flex-1 flex flex-col items-center justify-center bg-black/50 rounded-xl border border-gray-800 p-4 mb-4">
                                            <img src={job.result} alt="Result" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl" />
                                        </div>
                                    )}
                                    {isVideoResult && (
                                        <div className="flex-1 flex flex-col items-center justify-center bg-black/50 rounded-xl border border-gray-800 p-4 mb-4">
                                            <video src={job.result} controls className="max-w-full max-h-[70vh] rounded-lg shadow-2xl" />
                                        </div>
                                    )}
                                    {isText && (
                                        <div className="flex-1 bg-gray-900 p-8 rounded-xl border border-gray-800 overflow-y-auto mb-4 markdown-body">
                                            <ReactMarkdown>{job.result}</ReactMarkdown>
                                        </div>
                                    )}
                                    {isObject && (
                                        <div className="flex-1 bg-gray-900 p-6 rounded-xl border border-gray-800 overflow-y-auto mb-4 custom-scrollbar">
                                            <SmartRenderer data={job.result} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                    
                    {activeTab === 'Prompt' && (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Input Prompt
                                </h3>
                                <CopyButton text={job.prompt || ""} />
                            </div>
                            <div className="flex-1 bg-gray-900 p-4 rounded-xl border border-gray-800 font-serif text-gray-300 leading-relaxed overflow-y-auto whitespace-pre-wrap">
                                {job.prompt || "No prompt available."}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Status' && (
                        <div className="space-y-6">
                            <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Info className="w-4 h-4" /> Job Status
                                </h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Current State</label>
                                        <span className={`text-lg font-bold ${getStatusColor(job.status)}`}>{job.status}</span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Retries</label>
                                        <span className="text-lg font-bold text-white">{job.retryCount || 0}</span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Created</label>
                                        <span className="text-sm text-gray-300">{job.createdAt.toLocaleTimeString()}</span>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 block mb-1">Completed</label>
                                        <span className="text-sm text-gray-300">{job.completedAt ? job.completedAt.toLocaleTimeString() : '-'}</span>
                                    </div>
                                </div>
                            </div>

                            {job.error && (
                                <div className="bg-red-900/10 border border-red-900/30 p-6 rounded-xl">
                                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Error Details
                                    </h3>
                                    <p className="text-red-200 font-mono text-xs whitespace-pre-wrap">{job.error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                {job.status === JobStatus.FAILED && (
                                    <button onClick={() => { onRetry(); onClose(); }} className="flex-1 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                                        <RefreshCw className="w-4 h-4" /> Retry Job
                                    </button>
                                )}
                                {(job.status === JobStatus.RUNNING || job.status === JobStatus.WAITING) && (
                                    <button onClick={() => { onCancel(); onClose(); }} className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors">
                                        <Ban className="w-4 h-4" /> Cancel Job
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'Debug' && (
                        <div className="h-full flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Terminal className="w-4 h-4" /> API Logs
                                </h3>
                                {job.debug && <CopyButton text={JSON.stringify(job.debug, null, 2)} />}
                            </div>
                            <div className="flex-1 bg-black p-4 rounded-xl border border-gray-800 font-mono text-xs text-gray-400 overflow-y-auto">
                                {job.debug ? (
                                    <pre>{JSON.stringify(job.debug, null, 2)}</pre>
                                ) : (
                                    <div className="text-gray-600 italic">No debug information available.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
