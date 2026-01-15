import React from 'react';
import { Layout, ScanFace, Loader2, Circle, CheckCircle2, AlertCircle, Circle as CircleIcon } from 'lucide-react';
import { HistoryItem, Job, JobStatus, JobType, Person } from '../../types';
import { CharacterSheetView } from '../CharacterSheetView';
import { runCharacterAnalysis, runFullCharacterAnalysis, runCountPeople } from '../../services/jobActions';

interface AppMainStageProps {
    liveSelectedImage: HistoryItem | null;
    executedJobs: Job[];
    selectedJob: Job | null;
    setSelectedJob: (job: Job | null) => void;
    handleContextMenu: (e: React.MouseEvent, job: Job) => void;
    isDetecting: boolean;
    selectedPerson: Person | undefined;
    selectedPersonIndex: number;
    setEditingSection: (val: any) => void;
}

export const AppMainStage: React.FC<AppMainStageProps> = ({ 
    liveSelectedImage, executedJobs, selectedJob, setSelectedJob, handleContextMenu, 
    isDetecting, selectedPerson, selectedPersonIndex, setEditingSection
}) => {
    
    return (
        <main className="flex-1 flex flex-col min-w-0 bg-gray-950 overflow-hidden relative">
            {/* Job History Strip */}
            <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-4 gap-2 overflow-x-auto no-scrollbar shrink-0 z-20 w-full">
                {executedJobs.map(job => {
                    const isCompact = job.status === JobStatus.FINISHED || job.status === JobStatus.FAILED;
                    return (
                        <div 
                            key={job.id} 
                            onClick={() => setSelectedJob(job)}
                            onContextMenu={(e) => handleContextMenu(e, job)}
                            title={job.name || job.type}
                            className={`
                                flex items-center gap-2 py-1.5 rounded-lg border cursor-pointer transition-all whitespace-nowrap select-none
                                ${isCompact ? 'px-2' : 'px-3 min-w-[120px] max-w-[200px]'}
                                ${selectedJob?.id === job.id ? 'bg-violet-900/30 border-violet-500 text-violet-200' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'}
                            `}
                        >
                            {job.status === JobStatus.RUNNING ? <Loader2 className="w-3 h-3 animate-spin text-blue-400" /> :
                                job.status === JobStatus.FAILED ? <AlertCircle className="w-3 h-3 text-red-500" /> :
                                job.status === JobStatus.FINISHED ? <CheckCircle2 className="w-3 h-3 text-green-500" /> :
                                <Circle className="w-3 h-3 text-yellow-500" />}
                            {!isCompact && <span className="text-xs font-bold truncate">{job.name || job.type}</span>}
                        </div>
                    );
                })}
                {executedJobs.length === 0 && <span className="text-xs text-gray-600 italic">No job history for this item.</span>}
            </div>

            <div className="flex-1 flex overflow-hidden relative">
                {liveSelectedImage ? (
                    <div className="flex-1 bg-gray-900/50 flex flex-col overflow-hidden relative z-0">
                        {liveSelectedImage.peopleDetection ? (
                            <CharacterSheetView 
                                person={selectedPerson} 
                                image={liveSelectedImage}
                                onGenerate={(type) => runCharacterAnalysis(liveSelectedImage, selectedPersonIndex, type)}
                                onGenerateAll={() => runFullCharacterAnalysis(liveSelectedImage, selectedPersonIndex)}
                                onEditSection={(title, key, data) => setEditingSection({ title, key, data })}
                            />
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                                {isDetecting ? (
                                    <div className="flex flex-col items-center gap-3 animate-pulse">
                                        <Loader2 className="w-12 h-12 text-violet-500 animate-spin" />
                                        <p className="text-sm font-bold text-violet-400">Detecting subjects...</p>
                                    </div>
                                ) : (
                                    <>
                                        <ScanFace className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-sm font-medium">No subjects detected yet.</p>
                                        <button onClick={() => runCountPeople(liveSelectedImage)} className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-xs font-bold">Run Detection</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-600">
                        <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                            <Layout className="w-10 h-10 opacity-20" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-500 mb-2">No Image Selected</h2>
                        <p className="text-sm text-gray-600 max-w-xs text-center">Select an image from the library or upload a new one to begin editing.</p>
                    </div>
                )}
            </div>
        </main>
    );
};
