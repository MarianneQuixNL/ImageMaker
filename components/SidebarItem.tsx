import React, { useState } from 'react';
import { Loader2, RefreshCw, ChevronDown, ChevronRight, FileText, Rocket, Circle, CheckCircle2, AlertCircle, Ban, OctagonX, XCircle, Trash2, StopCircle as StopIcon, CheckSquare, Square, Maximize2, Play, Lock, Unlock } from 'lucide-react';
import { HistoryItem, Job, JobStatus } from '../types';
import { RichTooltip } from './RichTooltip';

interface SidebarItemProps {
    item: HistoryItem;
    jobs: Job[];
    isSelected: boolean;
    isChecked: boolean;
    onSelectImage: (item: HistoryItem) => void;
    onToggleCheck: (item: HistoryItem) => void;
    onSelectJob: (job: Job) => void;
    onRunJobs: (item: HistoryItem) => void;
    onPrioritizeJob: (job: Job) => void;
    onViewPrompt: (job: Job) => void;
    onClearFailed: (item: HistoryItem) => void;
    onDelete: (item: HistoryItem) => void;
    onCancelJobs?: (item: HistoryItem) => void;
    onZoom: (item: HistoryItem) => void;
    onToggleLock: (item: HistoryItem) => void;
}

const StatusIcon: React.FC<{ status: JobStatus }> = ({ status }) => {
  switch (status) {
    case JobStatus.WAITING: return <div title="Waiting"><Circle className="w-4 h-4 text-yellow-500 fill-current drop-shadow-sm" /></div>;
    case JobStatus.RUNNING: return <div title="Running"><Loader2 className="w-4 h-4 text-blue-400 animate-spin drop-shadow-sm" /></div>;
    case JobStatus.FINISHED: return <div title="Finished"><CheckCircle2 className="w-4 h-4 text-green-500 fill-green-900 drop-shadow-sm" /></div>;
    case JobStatus.FAILED: return <div title="Failed"><AlertCircle className="w-4 h-4 text-red-500 fill-red-900 drop-shadow-sm" /></div>;
    case JobStatus.DEAD: return <div title="Dead"><Ban className="w-4 h-4 text-gray-500 fill-gray-900 drop-shadow-sm" /></div>;
    case JobStatus.CANCELLED: return <div title="Cancelled"><Ban className="w-4 h-4 text-orange-500 fill-orange-900 drop-shadow-sm" /></div>;
    default: return null;
  }
};

export const SidebarItem: React.FC<SidebarItemProps> = ({ item, jobs, isSelected, isChecked, onSelectImage, onToggleCheck, onSelectJob, onRunJobs, onPrioritizeJob, onViewPrompt, onClearFailed, onDelete, onCancelJobs, onZoom, onToggleLock }) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const activeJobs = jobs.filter(j => j.status !== JobStatus.DEAD && !j.hidden);
  const statuses: JobStatus[] = Array.from(new Set(activeJobs.map(j => j.status)));
  const hasErrors = activeJobs.some(j => j.status === JobStatus.FAILED);
  
  const isRunning = statuses.includes(JobStatus.RUNNING);
  const isWaiting = statuses.includes(JobStatus.WAITING) && !isRunning;
  const isStopped = !isRunning && !isWaiting && hasErrors;
  const isPlaceholder = !item.url;
  const isVideo = !!item.videoUrl;

  const isBusy = activeJobs.some(j => j.status === JobStatus.RUNNING || j.status === JobStatus.WAITING);

  return (
    <div className={`bg-gray-800 border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all ${isSelected ? 'ring-2 ring-violet-500 border-violet-500 bg-gray-750' : 'border-gray-700 hover:border-gray-600'} ${item.isLocked ? 'border-red-900/80 ring-2 ring-red-900/50' : ''} ${item.hidden ? 'border-orange-900/50 ring-2 ring-orange-900/30 opacity-60' : ''}`}>
      <div 
        className="bg-gray-850 px-2 py-2 border-b border-gray-700 flex items-center justify-between cursor-pointer hover:bg-gray-750 group"
        onClick={() => onSelectImage(item)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
            <button 
                onClick={(e) => { e.stopPropagation(); onToggleCheck(item); }}
                className="text-gray-500 hover:text-white transition-colors p-1"
            >
                {isChecked ? <CheckSquare className="w-4 h-4 text-violet-500" /> : <Square className="w-4 h-4" />}
            </button>
            {item.isLocked && <Lock className="w-3 h-3 text-red-400 shrink-0" title="Item is locked" />}
            <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-gray-200 truncate" title={item.title}>
                {item.title} {item.hidden && "(Hidden)"}
                </span>
                {item.folderPath && (
                    <span className="text-[9px] text-gray-500 font-mono truncate" title={item.folderPath}>
                        {item.folderPath}
                    </span>
                )}
            </div>
        </div>
      </div>

      <div 
        className="h-[300px] w-full bg-gray-900 flex items-center justify-center p-2 relative group cursor-pointer overflow-hidden"
        onClick={() => onSelectImage(item)}
      >
        {isPlaceholder ? (
            <div className="flex flex-col items-center gap-3">
                {isRunning ? (
                    <Loader2 className="w-16 h-16 text-violet-400 animate-spin" />
                ) : (
                    <div className="bg-yellow-900/20 p-4 rounded-full">
                       <Loader2 className="w-8 h-8 text-yellow-600 animate-spin" />
                    </div>
                )}
                <span className="text-xs text-gray-500 font-medium">Generating...</span>
            </div>
        ) : (
            <>
                <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                    <img src={item.url} alt={item.title} className="max-h-full max-w-full object-contain shadow-sm rounded-sm" />
                    {/* Gradient Overlay for better control visibility on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-sm" />
                </div>

                {isVideo && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="bg-black/50 p-3 rounded-full backdrop-blur-sm border border-white/20">
                            <Play className="w-8 h-8 text-white fill-white" />
                        </div>
                    </div>
                )}
                
                {/* Badges - positioned relative to container, not scaled image */}
                {item.originJobName && <div className="absolute top-2 left-2 bg-violet-600/90 text-white text-[10px] px-2 py-0.5 rounded shadow-sm max-w-[120px] truncate border border-violet-500/50 pointer-events-none z-10">{item.originJobName}</div>}
                
                {/* Type Labels - Below the Image (Visually at the bottom of the container) */}
                {(item.isBackground || item.isTemplate) && (
                    <div className="absolute bottom-2 left-2 flex gap-1 z-20 pointer-events-none">
                         {item.isBackground && (
                             <span className="px-2 py-0.5 bg-blue-900 text-blue-100 text-[9px] font-black uppercase tracking-widest rounded border border-blue-700 shadow-lg">Background</span>
                         )}
                         {item.isTemplate && (
                             <span className="px-2 py-0.5 bg-amber-900 text-amber-100 text-[9px] font-black uppercase tracking-widest rounded border border-amber-700 shadow-lg">Template</span>
                         )}
                    </div>
                )}

                {/* Fades out on hover to avoid overlapping with action buttons */}
                {item.detectedStyle && <div className="absolute top-2 right-2 bg-black/70 text-gray-200 text-[10px] px-2 py-0.5 rounded backdrop-blur-md border border-gray-600/30 pointer-events-none z-10 transition-opacity duration-200 group-hover:opacity-0">{item.detectedStyle}</div>}
                
                {/* Large STOP icon for failures */}
                {isStopped && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-950/40 backdrop-blur-[2px] transition-all group-hover:backdrop-blur-[4px] z-10">
                        <OctagonX className="w-24 h-24 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse" />
                        <div className="absolute bottom-10 text-white font-black text-xs uppercase tracking-widest bg-red-600 px-3 py-1 rounded-full shadow-lg">Job Failed</div>
                    </div>
                )}

                {isRunning && !isStopped && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[1px] z-10">
                        <Loader2 className="w-12 h-12 text-blue-400 animate-spin drop-shadow-md" />
                    </div>
                )}
                {isWaiting && !isRunning && !isStopped && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-10">
                        <Loader2 className="w-12 h-12 text-yellow-500 animate-spin drop-shadow-md" />
                    </div>
                )}
            </>
        )}
        
        {/* Floating Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1 z-30 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0">
           {!isPlaceholder && (
               <button 
                    onClick={(e) => { e.stopPropagation(); onZoom(item); }} 
                    className="p-2 bg-gray-900/90 hover:bg-blue-600 text-gray-300 hover:text-white rounded-lg border border-gray-700 backdrop-blur-sm transition-all shadow-lg hover:scale-105" 
                    title={isVideo ? "Play Video" : "Zoom"}
               >
                   {isVideo ? <Play className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
               </button>
           )}
           {isBusy && onCancelJobs && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onCancelJobs(item); }}
                    className="p-2 bg-orange-900/90 hover:bg-orange-700 text-orange-200 rounded-lg border border-orange-700 backdrop-blur-sm transition-all shadow-lg animate-pulse"
                    title="Stop All Jobs"
                >
                    <StopIcon className="w-4 h-4 fill-current" />
                </button>
           )}
           <button 
                onClick={(e) => { e.stopPropagation(); onToggleLock(item); }}
                className={`p-2 rounded-lg border backdrop-blur-sm transition-all shadow-lg hover:scale-105 ${
                    item.isLocked 
                    ? 'bg-red-900/90 border-red-800 text-red-200 hover:bg-red-700' 
                    : 'bg-gray-900/90 border-gray-700 text-gray-300 hover:bg-green-600'
                }`}
                title={item.isLocked ? "Unlock Item" : "Lock Item"}
            >
                {item.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
           <button 
                onClick={(e) => { 
                    e.stopPropagation(); 
                    if (!isBusy && !item.isLocked) onDelete(item); 
                }} 
                disabled={isBusy || item.isLocked}
                className={`p-2 rounded-lg border backdrop-blur-sm transition-all shadow-lg ${
                    (isBusy || item.isLocked) 
                    ? 'bg-gray-800/50 border-gray-700 text-gray-600 cursor-not-allowed' 
                    : 'bg-red-900/90 border-red-800 text-red-200 hover:bg-red-600 hover:text-white hover:scale-105'
                }`}
                title={item.isLocked ? "Item is locked" : (isBusy ? "Wait for jobs to finish" : "Delete")}
           >
               <Trash2 className="w-4 h-4" />
           </button>
        </div>

        <div className="absolute bottom-2 right-2 flex flex-col gap-1 bg-gray-900/90 backdrop-blur rounded-lg p-1.5 shadow-lg border border-gray-700 z-20">
             {statuses.length === 0 ? <span className="text-[10px] text-gray-500 px-1">No jobs</span> : statuses.map(status => <StatusIcon key={status} status={status} />)}
        </div>
        
        {hasErrors && (
            <div className="absolute bottom-2 left-2 z-20 flex flex-col gap-1">
                <button onClick={(e) => { e.stopPropagation(); onRunJobs(item); }} className="flex items-center gap-1 px-2 py-1 bg-red-900/80 text-red-200 rounded-md text-[10px] font-bold shadow-sm hover:bg-red-800 border border-red-700 transition-colors"><RefreshCw className="w-3 h-3" /> Retry All</button>
                <button onClick={(e) => { e.stopPropagation(); onClearFailed(item); }} className="flex items-center gap-1 px-2 py-1 bg-gray-800/90 text-gray-400 rounded-md text-[10px] font-bold shadow-sm hover:bg-gray-700 border border-gray-600 transition-colors"><XCircle className="w-3 h-3" /> Clear Failed</button>
            </div>
        )}
      </div>

      <div className="border-t border-gray-700">
        <button onClick={() => setIsDetailsOpen(!isDetailsOpen)} className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-400 hover:bg-gray-750 transition-colors">
          <span className="font-medium flex items-center gap-1">Jobs ({jobs.length})</span>
          {isDetailsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>
        
        {isDetailsOpen && (
          <div className="px-3 py-2 bg-gray-850 text-xs text-gray-300 space-y-2 border-t border-gray-700 font-medium">
             {jobs.length === 0 ? <div className="text-gray-600 italic">No jobs yet</div> : jobs.map(job => (
                 <div key={job.id} className={`flex items-center justify-between p-1.5 rounded cursor-pointer border border-transparent hover:border-gray-700 ${job.status === JobStatus.DEAD || job.status === JobStatus.CANCELLED ? 'opacity-50 line-through decoration-gray-500' : 'hover:bg-gray-800'}`} onClick={() => onSelectJob(job)}>
                     <span className="truncate flex-1">{job.name || job.type}</span>
                     <div className="flex items-center gap-2">
                         {job.prompt && (
                             <RichTooltip 
                                content={
                                    <div className="space-y-1">
                                        <div className="font-bold text-xs text-white">Full Prompt</div>
                                        <div className="text-[10px] text-gray-400 max-h-20 overflow-y-auto">{job.prompt}</div>
                                    </div>
                                }
                                placement="top"
                             >
                                <button onClick={(e) => { e.stopPropagation(); onViewPrompt(job); }} className="text-violet-400 hover:text-violet-300">
                                    <FileText className="w-3 h-3" />
                                </button>
                             </RichTooltip>
                         )}
                         {job.status === JobStatus.WAITING && <button onClick={(e) => { e.stopPropagation(); onPrioritizeJob(job); }} className="text-violet-400 hover:text-violet-300" title="Execute Next"><Rocket className="w-3 h-3" /></button>}
                         
                         <RichTooltip
                            content={
                                <div className="flex flex-col gap-2">
                                    <div className="font-bold text-gray-200 border-b border-gray-700 pb-1">{job.name || job.type}</div>
                                    <div className={`text-[10px] font-mono ${
                                        job.status === JobStatus.FINISHED ? 'text-green-400' : 
                                        job.status === JobStatus.FAILED ? 'text-red-400' : 
                                        'text-yellow-400'
                                    }`}>
                                        Status: {job.status.toUpperCase()}
                                    </div>
                                    {job.status === JobStatus.FINISHED && typeof job.result === 'string' && job.result.startsWith('data:image') && (
                                        <img src={job.result} className="w-32 h-32 object-contain bg-black rounded border border-gray-800" alt="Job Result" />
                                    )}
                                </div>
                            }
                            placement="left"
                         >
                            <div className="cursor-help"><StatusIcon status={job.status} /></div>
                         </RichTooltip>
                     </div>
                 </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};