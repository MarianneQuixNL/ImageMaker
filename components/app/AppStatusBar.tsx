
import React from 'react';
import { StatusBar } from '../StatusBar';
import { Job, JobStatus } from '../../types';
import { jobService } from '../../services/jobService';

interface AppStatusBarProps {
    statusStats: {
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
    onClearStatus: (status: JobStatus) => void;
    setSelectedJob: (job: Job | null) => void;
}

export const AppStatusBar: React.FC<AppStatusBarProps> = ({ 
    statusStats, jobs, runningJob, runningPersonName, runningJobFilename, onRunQueue, onClearStatus, setSelectedJob
}) => {
    return (
        <StatusBar 
            stats={statusStats}
            jobs={jobs}
            runningJob={runningJob}
            runningPersonName={runningPersonName}
            runningJobFilename={runningJobFilename}
            onRunQueue={onRunQueue}
            onDeleteAll={onClearStatus}
            onRetryAllFailed={() => jobService.retryAllFailed()}
            onDeleteJob={(id) => jobService.deleteJob(id)}
            onRetryJob={(job) => jobService.retryJob(job)}
            onPrioritizeJob={(id) => jobService.prioritizeJob(id)}
            onSelectJob={setSelectedJob}
        />
    );
};
