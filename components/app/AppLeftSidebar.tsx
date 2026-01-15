import React from 'react';
import { Sidebar } from '../Sidebar';
import { HistoryItem, Job, JobType } from '../../types';
import { jobService } from '../../services/jobService';
import * as Actions from '../../services/jobActions';

interface AppLeftSidebarProps {
    isOpen: boolean;
    history: HistoryItem[];
    jobs: Job[];
    selectedImageId?: string;
    onSelectImage: (item: HistoryItem) => void;
    onSelectJob: (job: Job) => void;
    onUploadClick: () => void;
    onCloudClick: () => void;
    toggleModal: (key: string, val: boolean) => void;
    hasCompletedImageJobs: boolean;
    selectedPersonIndex: number;
    onZoom: (item: HistoryItem) => void;
    width: number;
}

export const AppLeftSidebar: React.FC<AppLeftSidebarProps> = ({ 
    isOpen, history, jobs, selectedImageId, onSelectImage, onSelectJob, 
    onUploadClick, onCloudClick, toggleModal, hasCompletedImageJobs, selectedPersonIndex, onZoom, width
}) => {
    
    return (
        <div 
            style={{ width: isOpen ? width : 0 }}
            className={`flex h-full shrink-0 transition-none ${!isOpen ? 'hidden' : ''}`}
        >
            <Sidebar 
                isOpen={isOpen}
                history={history}
                jobs={jobs}
                selectedImageId={selectedImageId}
                onSelectImage={onSelectImage}
                onSelectJob={onSelectJob}
                onUploadClick={onUploadClick}
                onCloudClick={onCloudClick}
                hasCompletedImageJobs={hasCompletedImageJobs}
                onZoom={onZoom}
            />
        </div>
    );
};