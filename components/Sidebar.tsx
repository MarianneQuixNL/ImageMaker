import React, { useSyncExternalStore } from 'react';
import { Archive, FolderInput, Plus, Upload, Cloud } from 'lucide-react';
import { HistoryItem, Job } from '../types';
import { SidebarItem } from './SidebarItem';
import { jobService } from '../services/jobService';

interface SidebarProps {
    isOpen: boolean;
    history: HistoryItem[];
    jobs: Job[];
    selectedImageId: string | undefined;
    onSelectImage: (item: HistoryItem) => void;
    onSelectJob: (job: Job) => void;
    onUploadClick: () => void;
    onCloudClick: () => void;
    hasCompletedImageJobs: boolean;
    onZoom: (item: HistoryItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    history,
    jobs,
    selectedImageId,
    onSelectImage,
    onSelectJob,
    onUploadClick,
    onCloudClick,
    hasCompletedImageJobs,
    onZoom
}) => {
    // We need selected items for checking boxes
    const { selectedItems } = useSyncExternalStore(jobService.subscribe, jobService.getSnapshot);

    if (!isOpen) return null;

    return (
        <aside 
            className="bg-gray-900 border-r border-gray-800 flex flex-col z-20 relative w-full h-full transition-all duration-300 ease-in-out"
        >
            <div className="p-3 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0 z-10">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Archive className="w-3 h-3" /> Library
                </h3>
                <div className="flex gap-1">
                    {hasCompletedImageJobs && (
                        <button 
                            onClick={() => jobService.promoteAllCompletedJobsGlobal()} 
                            className="p-1.5 bg-green-900/30 text-green-400 rounded hover:bg-green-900/50 transition-colors" 
                            title="Add All Finished Results to Workspace"
                        >
                            <FolderInput className="w-3 h-3" />
                        </button>
                    )}
                    <button 
                        onClick={onCloudClick} 
                        className="p-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors"
                        title="Open Cloud Library"
                    >
                        <Cloud className="w-3 h-3" />
                    </button>
                    <button 
                        onClick={onUploadClick} 
                        className="p-1.5 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 hover:text-white transition-colors"
                        title="Upload Image"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar">
                {history.length === 0 ? (
                    <div className="text-center p-8 text-gray-600 flex flex-col items-center">
                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                        <p className="text-xs">Drop images here</p>
                    </div>
                ) : (
                    history.map(item => (
                        <SidebarItem 
                            key={item.id} 
                            item={item} 
                            jobs={jobs.filter(j => j.imageId === item.id && !j.hidden)}
                            isSelected={selectedImageId === item.id}
                            isChecked={selectedItems.has(item.id)}
                            onSelectImage={onSelectImage}
                            onToggleCheck={(itm) => jobService.toggleImageSelection(itm.id)}
                            onSelectJob={onSelectJob}
                            onRunJobs={() => jobService.retryAllFailedJobs(item.id)}
                            onPrioritizeJob={(j) => jobService.prioritizeJob(j.id)}
                            onViewPrompt={(j) => navigator.clipboard.writeText(j.prompt || "")}
                            onClearFailed={() => jobService.removeFailedJobsForImage(item.id)}
                            onDelete={() => jobService.deleteHistoryItem(item.id)}
                            onCancelJobs={() => jobService.cancelJobsForImage(item.id)}
                            onZoom={() => onZoom(item)}
                            onToggleLock={() => jobService.toggleHistoryItemLock(item.id)}
                        />
                    ))
                )}
            </div>
        </aside>
    );
};