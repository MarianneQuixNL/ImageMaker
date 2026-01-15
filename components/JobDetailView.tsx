
import React, { useState, useMemo } from 'react';
import { 
    ChevronDown, ChevronRight, FileText, Rocket, RefreshCw, EyeOff, Loader2, 
    AlertTriangle, AlertCircle, CheckCircle2, Ban, Trash2, OctagonX, ClipboardCopy, Coins, FolderInput, BookOpen, Download, Terminal, Layers, StopCircle, Copy, Check, ListChecks
} from 'lucide-react';
import { Job, JobStatus, JobType } from '../types';

const StatusIcon: React.FC<{ status: JobStatus }> = ({ status }) => {
  switch (status) {
    case JobStatus.WAITING: return <div className="w-5 h-5 rounded-full border-2 border-yellow-500" />;
    case JobStatus.RUNNING: return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
    case JobStatus.FINISHED: return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    case JobStatus.FAILED: return <AlertCircle className="w-5 h-5 text-red-500" />;
    case JobStatus.DEAD: return <Ban className="w-5 h-5 text-gray-500" />;
    case JobStatus.CANCELLED: return <Ban className="w-5 h-5 text-orange-500" />;
    default: return null;
  }
};

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <button onClick={handleCopy} className="p-1 hover:text-white text-gray-500 transition-colors" title="Copy to Clipboard">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
    );
};

const calculateEstimatedCost = (job: Job): number => {
    const model = job.metadata?.modelUsed || 'gemini-3-flash-preview';
    let cost = 0;

    const isFlash = model.includes('flash');
    const isPro = model.includes('pro');
    const isImagen = model.includes('imagen');
    const isVeo = model.includes('veo');

    if (isImagen) {
        return 3.7; // ~0.04 USD
    }
    
    if (isVeo) {
        return 20;
    }

    const inputTokens = 300 + (job.prompt ? job.prompt.length / 4 : 50);
    
    let outputTokens = 100;
    if (job.type === JobType.DESCRIBE_IMAGE) outputTokens = 500;
    if (job.type === JobType.GENERATE_FILENAME) outputTokens = 50;
    if (job.type === JobType.COUNT_PEOPLE) outputTokens = 200;
    if (job.type === JobType.GENERATE_STORY) outputTokens = 4000;

    if (isFlash) {
        if (model.includes('image')) return 0.2;
        cost = (inputTokens * 0.000007) + (outputTokens * 0.000028);
    } else if (isPro) {
        if (model.includes('image')) return 3.7; 
        cost = (inputTokens * 0.00032) + (outputTokens * 0.00096);
    }

    return cost * 100;
};

const getFlattenedDependencies = (jobId: string, allJobs: Job[]): Job[] => {
    const deps = new Map<string, Job>();
    
    const recurse = (currentId: string) => {
        const currentJob = allJobs.find(j => j.id === currentId);
        if (!currentJob) return;
        
        const sourceIds = currentJob.metadata?.sourceImageIds || [];
        
        sourceIds.forEach(sourceId => {
            if (!deps.has(sourceId)) {
                const sourceJob = allJobs.find(j => j.id === sourceId);
                if (sourceJob) {
                    deps.set(sourceId, sourceJob);
                    recurse(sourceId);
                }
            }
        });
    };

    recurse(jobId);
    return Array.from(deps.values()).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
};

interface JobCardProps {
  job: Job;
  imageTitle: string;
  allJobs?: Job[];
  onRetry: () => void;
  onPrioritize: () => void;
  onHide: () => void;
  onDelete: () => void;
  onCancel?: () => void;
  onPromote: () => void;
  onImageClick: (src: string, title: string) => void;
  onViewPrompt: () => void;
  onViewReport?: (report: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, imageTitle, allJobs = [], onRetry, onPrioritize, onHide, onDelete, onCancel, onPromote, onImageClick, onViewPrompt, onViewReport }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copyStatus, setCopyStatus] = useState<string | null>(null);

    const getBorderClass = (status: JobStatus) => {
        switch (status) {
            case JobStatus.WAITING: return "border-l-4 border-l-yellow-500";
            case JobStatus.RUNNING: return "border-l-4 border-l-blue-500";
            case JobStatus.FINISHED: return "border-l-4 border-l-green-500";
            case JobStatus.FAILED: return "border-l-4 border-l-red-500";
            case JobStatus.DEAD: 
            case JobStatus.CANCELLED: 
                return "border-l-4 border-l-gray-600 opacity-60";
            default: return "border-l-4 border-l-gray-700";
        }
    };

    const isSafetyError = job.error && (
        job.error.includes("PROHIBITED") || 
        job.error.includes("safety") || 
        job.error.includes("blocked") || 
        job.error.includes("Safety Block")
    );
    const hasWarning = job.error && job.status === JobStatus.WAITING;
    const isImageResult = typeof job.result === 'string' && job.result.startsWith('data:image');
    
    const cost = job.status === JobStatus.FINISHED ? calculateEstimatedCost(job) : 0;

    const isSpecialType = [
        JobType.FULL_VISION_ANALYSIS,
        JobType.GENERATE_STORY,
        JobType.GENERATE_VIDEO,
        JobType.GENERATE_STABLE_DIFFUSION_PROMPT,
        JobType.GENERATE_FILENAME,
        JobType.SAFETY_CHECK, 
        JobType.DESCRIBE_IMAGE,
        JobType.GENERATE_PERSONA
    ].includes(job.type);

    const REPORT_JOBS = [
        JobType.FULL_VISION_ANALYSIS, 
        JobType.GENERATE_STORY, 
        JobType.SAFETY_CHECK,
        JobType.GENERATE_PERSONA
    ];

    const dependencies = useMemo(() => {
        if ((job.type === JobType.COMBINE_CHARACTER_SHEET || job.type === JobType.GENERATE_COMIC) && allJobs.length > 0) {
            return getFlattenedDependencies(job.id, allJobs);
        }
        return [];
    }, [job, allJobs]);

    const depStats = useMemo(() => {
        if (dependencies.length === 0) return null;
        return {
            total: dependencies.length,
            waiting: dependencies.filter(j => j.status === JobStatus.WAITING).length,
            running: dependencies.filter(j => j.status === JobStatus.RUNNING).length,
            failed: dependencies.filter(j => j.status === JobStatus.FAILED).length,
            finished: dependencies.filter(j => j.status === JobStatus.FINISHED).length,
        };
    }, [dependencies]);

    const isCancellable = (job.status === JobStatus.WAITING || job.status === JobStatus.RUNNING) && onCancel;

    const parentJob = job.metadata?.parentJobId ? allJobs.find(j => j.id === job.metadata!.parentJobId) : null;
    const isBlockedChild = parentJob && 
                           (parentJob.status === JobStatus.WAITING || parentJob.status === JobStatus.RUNNING);

    React.useEffect(() => {
        if (job.status === JobStatus.FAILED || hasWarning) setIsExpanded(true);
    }, [job.status, hasWarning]);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopyStatus(id);
        setTimeout(() => setCopyStatus(null), 2000);
    };

    const handleDownloadSDPrompt = () => {
        if (job.result) {
            const blob = new Blob([JSON.stringify(job.result, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `sd_prompt_${job.id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const getMarkdownContent = (result: any) => {
        if (typeof result === 'string') return result;
        if (result && typeof result === 'object' && result.markdown) return result.markdown;
        return null;
    };

    const descriptionContent = job.type === JobType.DESCRIBE_IMAGE ? (
        (typeof job.result === 'object' && job.result.description) ? job.result.description : 
        typeof job.result === 'string' ? job.result : null
    ) : null;

    const markdownContent = getMarkdownContent(job.result);

    const debugContent = useMemo(() => {
        if (!job.debug) return null;
        
        const replacer = (key: string, value: any) => {
            if (typeof value === 'string') {
                if (value.length > 500 && (value.startsWith('data:') || value.length > 1000)) {
                    return value.substring(0, 50) + `... [TRUNCATED ${value.length} chars] ...` + value.substring(value.length - 20);
                }
            }
            return value;
        };

        const requestStr = JSON.stringify(job.debug.request, replacer, 2);
        const responseStr = JSON.stringify(job.debug.response, replacer, 2);

        return `/* --- REQUEST START --- */\n${requestStr}\n\n/* --- RESPONSE START --- */\n${responseStr}`;
    }, [job.debug]);

    return (
        <div className={`bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden transition-all ${getBorderClass(job.status)}`}>
            {/* Header */}
            <div 
                className="p-5 bg-gray-850 flex items-center justify-between cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-5 overflow-hidden">
                    <div onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                        {isExpanded ? <ChevronDown className="w-6 h-6 text-gray-500" /> : <ChevronRight className="w-6 h-6 text-gray-500" />}
                    </div>
                    <StatusIcon status={job.status} />
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg text-gray-100 truncate">
                                {job.name || job.type}
                                {job.retryCount > 0 && <span className="ml-2 text-xs text-orange-400 bg-orange-900/30 px-2 py-0.5 rounded-full border border-orange-800/50">(Retry {job.retryCount})</span>}
                            </h3>
                            {job.status === JobStatus.FINISHED && cost > 0 && (
                                <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1 bg-gray-900 px-2 py-0.5 rounded border border-gray-700">
                                    <Coins className="w-3 h-3 text-yellow-600" /> ~{cost.toFixed(2)}¢
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-gray-500 flex items-center gap-2">
                                ID: <span className="font-mono text-gray-600">{job.id.substring(0, 8)}...</span>
                                <span className="text-gray-700">•</span>
                                {job.createdAt.toLocaleTimeString()}
                            </span>
                            
                            {depStats && (
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase bg-black/40 px-2 py-0.5 rounded border border-gray-700">
                                    <ListChecks className="w-3 h-3 text-gray-400" />
                                    <span className="text-gray-400">{depStats.total} Sub-tasks:</span>
                                    {depStats.running > 0 && <span className="text-blue-400">{depStats.running} Run</span>}
                                    {depStats.waiting > 0 && <span className="text-yellow-500">{depStats.waiting} Wait</span>}
                                    {depStats.failed > 0 && <span className="text-red-500">{depStats.failed} Fail</span>}
                                    {depStats.finished > 0 && <span className="text-green-500">{depStats.finished} Done</span>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {isCancellable && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onCancel && onCancel(); }}
                            className="p-2 text-orange-400 hover:text-white hover:bg-orange-600 rounded-lg transition-colors border border-orange-900/50 hover:border-orange-500"
                            title="Cancel Job"
                        >
                            <StopCircle className="w-5 h-5" />
                        </button>
                    )}

                    {job.prompt && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onViewPrompt(); }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                            title="View Prompt"
                        >
                            <FileText className="w-5 h-5" />
                        </button>
                    )}
                    
                    {job.status === JobStatus.FAILED && (
                        <button onClick={(e) => { e.stopPropagation(); onRetry(); }} className="p-2 text-red-400 hover:text-white hover:bg-red-900/50 rounded-lg transition-colors border border-red-900/30" title="Retry">
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    )}
                    
                    {job.status === JobStatus.WAITING && (
                        <button onClick={(e) => { e.stopPropagation(); onPrioritize(); }} className="p-2 text-yellow-500 hover:text-white hover:bg-yellow-900/50 rounded-lg transition-colors" title="Prioritize">
                            <Rocket className="w-5 h-5" />
                        </button>
                    )}

                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Collapsible Content */}
            {isExpanded && (
                <div className="p-5 border-t border-gray-700 bg-gray-900 text-sm">
                    {/* Error Message */}
                    {job.error && (
                        <div className={`p-4 rounded-lg mb-4 flex items-start gap-3 border ${hasWarning ? 'bg-yellow-900/20 border-yellow-700/50 text-yellow-200' : 'bg-red-900/20 border-red-700/50 text-red-200'}`}>
                            <OctagonX className="w-5 h-5 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="font-bold flex items-center justify-between">
                                    {hasWarning ? "Warning / Auto-Retry" : "Error"}
                                    <CopyButton text={job.error} />
                                </p>
                                <p className="font-mono text-xs mt-1 whitespace-pre-wrap">{job.error}</p>
                                {isSafetyError && !hasWarning && (
                                    <div className="mt-3 text-xs bg-black/30 p-2 rounded">
                                        <p>The model blocked this request due to safety filters. Try rephrasing your prompt or using a different transformation.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Report View Button */}
                    {job.status === JobStatus.FINISHED && REPORT_JOBS.includes(job.type) && markdownContent && (
                        <div className="mb-4">
                            <button 
                                onClick={() => onViewReport && onViewReport(markdownContent)}
                                className="w-full py-3 bg-violet-900/30 border border-violet-500/30 hover:bg-violet-900/50 text-violet-300 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <BookOpen className="w-4 h-4" /> Open Full Report
                            </button>
                        </div>
                    )}

                    {/* Image Result */}
                    {isImageResult && (
                        <div className="mb-4">
                            <img 
                                src={job.result} 
                                alt="Result" 
                                className="w-full rounded-lg border border-gray-700 shadow-md cursor-zoom-in hover:border-gray-500 transition-colors bg-black" 
                                onClick={() => onImageClick(job.result, `Result: ${job.name || job.type}`)}
                            />
                            <div className="flex gap-2 mt-3">
                                <button 
                                    onClick={onPromote} 
                                    disabled={!!isBlockedChild}
                                    className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${isBlockedChild ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-green-700 hover:bg-green-600 text-white shadow-green-900/20'}`}
                                    title={isBlockedChild ? "Parent job is still active. Wait for it to finish or fail." : "Add to Sidebar"}
                                >
                                    {isBlockedChild ? <Loader2 className="w-4 h-4 animate-spin" /> : <FolderInput className="w-4 h-4" />} 
                                    {isBlockedChild ? "Wait for Parent" : "Add to Workspace"}
                                </button>
                                <a href={job.result} download={`result_${job.id}.png`} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xs flex items-center gap-2 transition-all">
                                    <Download className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Video Result */}
                    {job.type === JobType.GENERATE_VIDEO && job.status === JobStatus.FINISHED && job.result && (
                        <div className="mb-4">
                            <video controls className="w-full rounded-lg border border-gray-700 shadow-lg bg-black" src={job.result} />
                            <div className="flex gap-2 mt-3">
                                <button onClick={onPromote} className="flex-1 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all">
                                    <FolderInput className="w-4 h-4" /> Add to Workspace
                                </button>
                                <a href={job.result} download={`video_${job.id}.mp4`} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all">
                                    <Download className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    )}

                    {/* SD Prompt Result */}
                    {job.type === JobType.GENERATE_STABLE_DIFFUSION_PROMPT && job.status === JobStatus.FINISHED && job.result && (
                        <div className="bg-black/50 p-3 rounded-lg border border-gray-700 font-mono text-xs text-gray-300 mb-4">
                            <div className="mb-2">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-green-400 font-bold">POSITIVE</span>
                                    <CopyButton text={job.result.positive} />
                                </div>
                                <div className="p-2 bg-gray-800 rounded relative group">
                                    {job.result.positive}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-red-400 font-bold">NEGATIVE</span>
                                    <CopyButton text={job.result.negative} />
                                </div>
                                <div className="p-2 bg-gray-800 rounded relative group">
                                    {job.result.negative}
                                </div>
                            </div>
                            <button onClick={handleDownloadSDPrompt} className="w-full mt-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded text-gray-300 font-bold flex items-center justify-center gap-2"><Download className="w-3 h-3" /> Download JSON</button>
                        </div>
                    )}

                    {/* Text Description Result */}
                    {descriptionContent && job.status === JobStatus.FINISHED && (
                        <div className="relative group bg-gray-950 p-4 rounded-lg border border-gray-800 text-gray-300 text-xs leading-relaxed mb-4 whitespace-pre-wrap font-serif">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={descriptionContent} />
                            </div>
                            {descriptionContent}
                        </div>
                    )}

                    {/* Sub-Jobs (Dependencies) for Character Sheet / Comic */}
                    {dependencies.length > 0 && (
                        <div className="mb-4 bg-black/20 rounded-xl p-3 border border-gray-700/50">
                            <h4 className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Sub-Tasks
                            </h4>
                            <div className="space-y-1">
                                {dependencies.map(dep => (
                                    <div key={dep.id} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700/50">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <StatusIcon status={dep.status} />
                                            <span className="text-xs font-mono truncate max-w-[150px] text-gray-300">{dep.name}</span>
                                        </div>
                                        {dep.status === JobStatus.FINISHED && typeof dep.result === 'string' && dep.result.startsWith('data:image') && (
                                            <img 
                                                src={dep.result} 
                                                className="w-8 h-8 object-cover rounded border border-gray-600 cursor-pointer" 
                                                onClick={() => onImageClick(dep.result, dep.name || "Sub-task Result")} 
                                            />
                                        )}
                                        {dep.status === JobStatus.FAILED && (
                                            <span className="text-[10px] text-red-400 font-bold">Failed</span>
                                        )}
                                        {(dep.status === JobStatus.WAITING || dep.status === JobStatus.RUNNING) && (
                                            <span className="text-[10px] text-gray-500 animate-pulse">Processing...</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* JSON Debug View */}
                    {!isSpecialType && job.result && !isImageResult && (
                        <div className="relative group bg-black p-3 rounded-lg border border-gray-700 font-mono text-xs text-green-400 overflow-x-auto mb-4">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <CopyButton text={JSON.stringify(job.result, null, 2)} />
                            </div>
                            <pre>{JSON.stringify(job.result, null, 2)}</pre>
                        </div>
                    )}

                    {/* Metadata Debug */}
                    {job.metadata && (
                        <div className="relative group mt-2 text-[10px] text-gray-500 font-mono border-t border-gray-800 pt-2">
                            <p className="mb-1 font-bold flex justify-between">
                                Metadata:
                                <CopyButton text={JSON.stringify(job.metadata, null, 2)} />
                            </p>
                            <pre className="whitespace-pre-wrap">{JSON.stringify(job.metadata, null, 1)}</pre>
                        </div>
                    )}

                    {/* API Debug */}
                    {debugContent && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <details className="group">
                                <summary className="cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-300 flex items-center gap-2">
                                    <Terminal className="w-3 h-3" /> View API Debug Log
                                </summary>
                                <div className="relative mt-2 p-3 bg-black rounded border border-gray-800 text-[10px] font-mono text-gray-400 overflow-x-auto max-h-60 group/code">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                        <CopyButton text={debugContent} />
                                    </div>
                                    <pre>{debugContent}</pre>
                                </div>
                            </details>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
