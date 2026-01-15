
import React, { useState, useRef, useEffect } from 'react';
import { Circle, Loader2, CheckCircle2, AlertCircle, Activity, PlayCircle, Trash2, RefreshCw, X, Rocket, FileText } from 'lucide-react';
import { Job, JobStatus } from '../types';

interface StatusBarProps {
    stats: {
        waiting: number;
        running: number;
        finished: number;
        failed: number;
    };
    jobs: Job[];
    runningJob?: Job;
    runningPersonName?: string | null;
    runningJobFilename?: string | null;
    onRunQueue: () => void;
    onDeleteAll: (status: JobStatus) => void;
    onRetryAllFailed: () => void;
    onDeleteJob: (id: string) => void;
    onRetryJob: (job: Job) => void;
    onPrioritizeJob: (id: string) => void;
    onSelectJob: (job: Job) => void;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
    stats, jobs, runningJob, runningPersonName, runningJobFilename, 
    onRunQueue, onDeleteAll, onRetryAllFailed, onDeleteJob, onRetryJob, onPrioritizeJob, onSelectJob 
}) => {
    const [activePopup, setActivePopup] = useState<JobStatus | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setActivePopup(null);
            }
        };
        if (activePopup) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activePopup]);

    const getRecentJobs = (status: JobStatus) => {
        return jobs.filter(j => j.status === status)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 10);
    };

    const handleCounterClick = (status: JobStatus) => {
        if (activePopup === status) setActivePopup(null);
        else setActivePopup(status);
    };

    const renderPopup = (status: JobStatus) => {
        const recent = getRecentJobs(status);
        return (
            <div ref={popupRef} className="absolute bottom-10 left-4 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-[60] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                <div className="p-2 border-b border-gray-800 bg-gray-950 flex flex-col gap-1">
                    <button 
                        onClick={() => { onDeleteAll(status); setActivePopup(null); }} 
                        className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:bg-gray-900 rounded transition-colors w-full text-left"
                    >
                        <Trash2 className="w-3 h-3" /> Delete All {status}
                    </button>
                    {status === JobStatus.FAILED && (
                        <button 
                            onClick={() => { onRetryAllFailed(); setActivePopup(null); }} 
                            className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-green-400 hover:bg-gray-900 rounded transition-colors w-full text-left"
                        >
                            <RefreshCw className="w-3 h-3" /> Retry All Failed
                        </button>
                    )}
                </div>
                <div className="max-h-64 overflow-y-auto p-1 bg-gray-900 custom-scrollbar">
                    {recent.length === 0 ? (
                        <div className="p-3 text-xs text-gray-500 text-center italic">No recent jobs found</div>
                    ) : (
                        recent.map(job => (
                            <div key={job.id} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded group border border-transparent hover:border-gray-700 transition-all">
                                <div 
                                    className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer" 
                                    onClick={() => { onSelectJob(job); setActivePopup(null); }}
                                    title="Show Job Details"
                                >
                                    <FileText className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-300 truncate font-medium max-w-[140px]">{job.name || job.type}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {status === JobStatus.WAITING && (
                                        <button onClick={() => onPrioritizeJob(job.id)} className="p-1 text-yellow-500 hover:bg-yellow-900/30 rounded" title="Speed Up (Prioritize)">
                                            <Rocket className="w-3 h-3" />
                                        </button>
                                    )}
                                    {status === JobStatus.FAILED && (
                                        <button onClick={() => onRetryJob(job)} className="p-1 text-green-500 hover:bg-green-900/30 rounded" title="Retry">
                                            <RefreshCw className="w-3 h-3" />
                                        </button>
                                    )}
                                    <button onClick={() => onDeleteJob(job.id)} className="p-1 text-red-500 hover:bg-red-900/30 rounded" title="Delete">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="h-8 bg-gray-950 border-t border-gray-800 flex items-center justify-between px-3 text-[10px] select-none z-50 relative">
            <div className="relative flex items-center gap-4">
                {activePopup && renderPopup(activePopup)}
                
                <div 
                    className={`flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded transition-colors ${activePopup === JobStatus.WAITING ? 'bg-gray-800 text-yellow-400' : 'text-yellow-500 hover:bg-gray-900'}`}
                    title="Waiting Jobs"
                    onClick={() => handleCounterClick(JobStatus.WAITING)}
                >
                    <Circle className="w-2 h-2 fill-current" /> <span className="font-mono font-bold">{stats.waiting}</span> Waiting
                </div>
                <div 
                    className={`flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded transition-colors ${activePopup === JobStatus.RUNNING ? 'bg-gray-800 text-blue-300' : 'text-blue-400 hover:bg-gray-900'}`}
                    title="Running Jobs"
                    onClick={() => handleCounterClick(JobStatus.RUNNING)}
                >
                    <Loader2 className="w-2 h-2 animate-spin" /> <span className="font-mono font-bold">{stats.running}</span> Running
                </div>
                <div 
                    className={`flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded transition-colors ${activePopup === JobStatus.FINISHED ? 'bg-gray-800 text-green-400' : 'text-green-500 hover:bg-gray-900'}`}
                    title="Finished Jobs"
                    onClick={() => handleCounterClick(JobStatus.FINISHED)}
                >
                    <CheckCircle2 className="w-2 h-2" /> <span className="font-mono font-bold">{stats.finished}</span> Done
                </div>
                <div 
                    className={`flex items-center gap-1.5 cursor-pointer px-2 py-0.5 rounded transition-colors ${activePopup === JobStatus.FAILED ? 'bg-gray-800 text-red-400' : 'text-red-500 hover:bg-gray-900'}`}
                    title="Failed Jobs"
                    onClick={() => handleCounterClick(JobStatus.FAILED)}
                >
                    <AlertCircle className="w-2 h-2" /> <span className="font-mono font-bold">{stats.failed}</span> Failed
                </div>
                
                <div className="h-4 w-px bg-gray-800 mx-2" />
                
                <div className="flex items-center gap-2 text-gray-400">
                    {runningJob ? (
                        <>
                            <Activity className="w-3 h-3 text-violet-500 animate-pulse" />
                            <span>
                                Processing: <span className="text-gray-200 font-bold">{runningJob.name || runningJob.type}</span>
                                {runningJobFilename && <span className="text-gray-400 ml-1">on <span className="text-gray-300 font-bold">{runningJobFilename}</span></span>}
                                {runningPersonName && <span className="text-gray-500 ml-1">({runningPersonName})</span>}
                            </span>
                        </>
                    ) : (
                        <span className="text-gray-600 italic">System Idle</span>
                    )}
                </div>
            </div>

            <button 
                onClick={onRunQueue}
                disabled={stats.waiting === 0}
                className={`flex items-center gap-2 px-3 py-0.5 rounded transition-colors ${
                    stats.waiting > 0 && stats.running === 0 
                    ? 'bg-blue-600 hover:bg-blue-500 text-white animate-pulse' 
                    : 'bg-gray-800 text-gray-500 hover:bg-gray-700 hover:text-gray-300'
                }`}
                title="Force Run Queue"
            >
                <PlayCircle className="w-3 h-3" /> Run Queue
            </button>
        </div>
    );
};
