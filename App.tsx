import React, { useState, useEffect, useRef, useMemo, useCallback, useSyncExternalStore } from 'react';
import { Key } from 'lucide-react';
import { jobService, getMainPersonName } from './services/jobService';
import { HistoryItem, Job, JobStatus, Person } from './types';
import { useModalState } from './hooks/useModalState';

// Modular UI Components
import { AppHeader } from './components/app/AppHeader';
import { AppLeftSidebar } from './components/app/AppLeftSidebar';
import { AppRightSidebar } from './components/app/AppRightSidebar';
import { AppMainStage } from './components/app/AppMainStage';
import { AppStatusBar } from './components/app/AppStatusBar';
import { AppModals } from './components/app/AppModals';

export default function App() {
    // Global State from Service
    const { 
        jobs, history, isQueuePaused, freeTierMode, markdownEvent, promptResultEvent, 
        autoRetry, autoAddToWorkspace, useSelected, transformations
    } = useSyncExternalStore(jobService.subscribe, jobService.getSnapshot);

    // Modal State
    const { modals, toggle } = useModalState();

    // Local UI State
    const [selectedImage, setSelectedImage] = useState<HistoryItem | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [apiKeySet, setApiKeySet] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    
    // Sidebar Resizing
    const [sidebarWidth, setSidebarWidth] = useState(280);
    const [isResizing, setIsResizing] = useState(false);
    
    // Popups & Context
    const [lightboxData, setLightboxData] = useState<{url: string, videoUrl?: string, title: string} | null>(null);
    const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, title: string, message: string, onConfirm: () => void, confirmLabel?: string, isDanger?: boolean} | null>(null);
    const [editingSection, setEditingSection] = useState<{ title: string, key: keyof Person, data: any } | null>(null);
    const [reportContent, setReportContent] = useState<string | null>(null);
    const [reportTitle, setReportTitle] = useState("Report");
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, job: Job } | null>(null);
    
    // Selection
    const [selectedPersonIndex, setSelectedPersonIndex] = useState<number>(0);
    const [hoveredPersonIndex, setHoveredPersonIndex] = useState<number | null>(null);
    
    // Upload Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragCounter = useRef(0);
    const [isDragging, setIsDragging] = useState(false);

    // --- Computed Data ---
    const liveSelectedJob = useMemo(() => selectedJob ? (jobs.find(j => j.id === selectedJob.id) || selectedJob) : null, [selectedJob, jobs]);
    const liveSelectedImage = useMemo(() => selectedImage ? (history.find(h => h.id === selectedImage.id) || selectedImage) : null, [selectedImage, history]);
    const executedJobs = useMemo(() => liveSelectedImage ? jobs.filter(j => j.imageId === liveSelectedImage.id && !j.hidden).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) : [], [jobs, liveSelectedImage]);
    
    const activePersonIndex = hoveredPersonIndex !== null ? hoveredPersonIndex : selectedPersonIndex;
    const selectedPerson = liveSelectedImage?.peopleDetection?.people[selectedPersonIndex];
    
    const isDetecting = useMemo(() => { 
        if (!liveSelectedImage) return false; 
        return jobs.some(j => j.imageId === liveSelectedImage.id && j.type.includes('Count') && (j.status === JobStatus.RUNNING || j.status === JobStatus.WAITING)); 
    }, [jobs, liveSelectedImage]);
    
    const hasCompletedImageJobs = useMemo(() => jobs.some(j => j.status === JobStatus.FINISHED && typeof j.result === 'string' && (j.result.startsWith('data:image') || j.result.startsWith('blob:'))), [jobs]);
    
    const statusStats = useMemo(() => ({
        waiting: jobs.filter(j => j.status === JobStatus.WAITING).length,
        running: jobs.filter(j => j.status === JobStatus.RUNNING).length,
        finished: jobs.filter(j => j.status === JobStatus.FINISHED).length,
        failed: jobs.filter(j => j.status === JobStatus.FAILED).length
    }), [jobs]);
    
    const runningJob = useMemo(() => jobs.find(j => j.status === JobStatus.RUNNING), [jobs]);
    const runningImage = useMemo(() => runningJob ? history.find(h => h.id === runningJob.imageId) : null, [runningJob, history]);
    const runningJobFilename = useMemo(() => runningImage?.title || null, [runningImage]);
    const runningPersonName = useMemo(() => { if (!runningJob) return null; return getMainPersonName(runningImage); }, [runningJob, runningImage]);

    // --- Effects ---
    
    useEffect(() => {
        if (liveSelectedImage?.peopleDetection?.people && liveSelectedImage.peopleDetection.people.length > 0) {
            let maxArea = -1;
            let maxIdx = 0;
            liveSelectedImage.peopleDetection.people.forEach((p, idx) => {
                if (p.box_2d && p.box_2d.length === 4) {
                    const w = p.box_2d[3] - p.box_2d[1];
                    const h = p.box_2d[2] - p.box_2d[0];
                    const area = w * h;
                    if (area > maxArea) { maxArea = area; maxIdx = idx; }
                }
            });
            setSelectedPersonIndex(maxIdx);
        } else {
            setSelectedPersonIndex(0);
        }
    }, [liveSelectedImage?.id, liveSelectedImage?.peopleDetection?.count]);

    useEffect(() => { 
        const checkKey = async () => { 
            try {
                const win = window as any; 
                if (win.aistudio) { 
                    const hasKey = await win.aistudio.hasSelectedApiKey(); 
                    setApiKeySet(hasKey); 
                } 
            } catch (e) {
                console.error("API Key Check Failed", e);
            }
        }; 
        checkKey(); 
    }, []);

    useEffect(() => { 
        if (markdownEvent) { 
            setReportContent(markdownEvent.content); 
            setReportTitle(markdownEvent.title); 
            jobService.clearMarkdownEvent(); 
        } 
    }, [markdownEvent]);

    useEffect(() => { 
        const handleClick = () => setContextMenu(null); 
        window.addEventListener('click', handleClick); 
        return () => window.removeEventListener('click', handleClick); 
    }, []);

    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            const newWidth = e.clientX;
            if (newWidth > 200 && newWidth < 600) setSidebarWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    const handleDragEnter = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current += 1; if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragging(true); }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); dragCounter.current -= 1; if (dragCounter.current === 0) setIsDragging(false); }, []);
    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
    const handleDrop = useCallback((e: React.DragEvent) => { 
        e.preventDefault(); e.stopPropagation(); setIsDragging(false); dragCounter.current = 0; 
        const uri = e.dataTransfer.getData('text/uri-list');
        const text = e.dataTransfer.getData('text/plain');
        const url = uri || (text && text.startsWith('http') ? text : null);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { 
            Array.from(e.dataTransfer.files).forEach((item: any) => { 
                const file = item as File;
                if (file.type && (file.type.startsWith('image/') || file.type.startsWith('video/'))) { 
                    let origin = "Drag & Drop";
                    if (url && url.startsWith('http')) { try { const hostname = new URL(url).hostname; origin = `Web Drop (${hostname})`; } catch { origin = "Web Drop"; } }
                    jobService.addHistoryItem(file, origin); 
                } 
            }); 
            e.dataTransfer.clearData(); 
        } else if (url && (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:'))) { jobService.handleWebImageDrop(url); }
    }, []);

    const handleApiKeySelect = async () => { 
        try {
            const win = window as any; 
            if (win.aistudio) { 
                await win.aistudio.openSelectKey(); 
                setApiKeySet(true); 
            } 
        } catch(e) { console.error(e); }
    };

    const handleClearStatus = (status: JobStatus) => { 
        setConfirmModal({ 
            isOpen: true, title: `Delete ${status} Jobs`, 
            message: `Are you sure you want to delete all jobs with status '${status}'?`, 
            confirmLabel: "Delete All", isDanger: true, 
            onConfirm: () => jobService.deleteJobsByStatus(status) 
        }); 
    };

    const handleContextMenu = (e: React.MouseEvent, job: Job) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.clientX, y: e.clientY, job }); };

    if (!apiKeySet) {
        return (
            <div className="h-screen w-screen bg-gray-950 flex flex-col items-center justify-center text-center p-8 font-sans">
                <div className="max-w-md space-y-6">
                    <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800 shadow-2xl">
                        <div className="p-4 bg-violet-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                            <Key className="w-10 h-10 text-violet-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2">Welcome to Image Maker</h1>
                        <p className="text-gray-400 mb-8">Select your Google AI Studio API Key to begin.</p>
                        <button onClick={handleApiKeySelect} className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg flex items-center justify-center gap-2">
                            <Key className="w-5 h-5" /> Select API Key
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen bg-gray-950 flex flex-col text-gray-100 overflow-hidden font-sans" onDragEnter={handleDragEnter}>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={(e) => { if(e.target.files?.[0]) jobService.addHistoryItem(e.target.files[0], "File Upload"); }} />
            
            {/* Header: Area 1 */}
            <AppHeader 
                isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                apiKeySet={apiKeySet} onApiKeySelect={handleApiKeySelect}
                freeTierMode={freeTierMode} onToggleFreeTierMode={() => jobService.toggleFreeTierMode()}
                isQueuePaused={isQueuePaused} onResumeQueue={() => { jobService.isQueuePaused = false; jobService.triggerQueueProcessing(); }}
                toggleModal={toggle} liveSelectedImage={liveSelectedImage} fileInputRef={fileInputRef}
                useSelected={useSelected} autoRetry={autoRetry} autoAddToWorkspace={autoAddToWorkspace}
                selectedPersonIndex={selectedPersonIndex} transformations={transformations}
            />

            {/* Layout Wrapper */}
            <div className="flex-1 flex overflow-hidden relative">
                
                {/* Left Sidebar: Area 2 */}
                <AppLeftSidebar 
                    isOpen={isSidebarOpen} history={history} jobs={jobs} selectedImageId={liveSelectedImage?.id}
                    onSelectImage={setSelectedImage} onSelectJob={setSelectedJob}
                    onUploadClick={() => fileInputRef.current?.click()} onCloudClick={() => toggle('cloudBrowser', true)}
                    toggleModal={toggle} hasCompletedImageJobs={hasCompletedImageJobs} selectedPersonIndex={selectedPersonIndex}
                    onZoom={(item) => setLightboxData({ url: item.url, videoUrl: item.videoUrl, title: item.title })}
                    width={sidebarWidth}
                />

                {/* Resizing Spacer: Area 3 */}
                {isSidebarOpen && (
                    <div 
                        className="w-1.5 bg-gray-900 border-l border-r border-gray-800 flex-none z-30 shadow-[inset_0_0_4px_rgba(0,0,0,0.5)] cursor-col-resize hover:bg-violet-600 transition-colors active:bg-violet-600"
                        onMouseDown={startResizing}
                        title="Drag to Resize Sidebar"
                    />
                )}

                {/* Main Stage: Area 4 */}
                <AppMainStage 
                    liveSelectedImage={liveSelectedImage} executedJobs={executedJobs} selectedJob={selectedJob}
                    setSelectedJob={setSelectedJob} handleContextMenu={handleContextMenu} isDetecting={isDetecting}
                    selectedPerson={selectedPerson} selectedPersonIndex={selectedPersonIndex} setEditingSection={setEditingSection}
                />

                {/* Right sidebar is conditionally rendered but remains as part of the main stage flex logic if image selected */}
                {liveSelectedImage && (
                    <AppRightSidebar 
                        liveSelectedImage={liveSelectedImage} selectedPersonIndex={selectedPersonIndex} setSelectedPersonIndex={setSelectedPersonIndex}
                        toggleModal={toggle} setLightboxData={setLightboxData} hoveredPersonIndex={hoveredPersonIndex} setHoveredPersonIndex={setHoveredPersonIndex}
                    />
                )}
            </div>

            {/* Status Bar: Area 5 */}
            <AppStatusBar 
                statusStats={statusStats} runningJob={runningJob} runningPersonName={runningPersonName} runningJobFilename={runningJobFilename}
                onRunQueue={() => jobService.triggerQueueProcessing()} onClearStatus={handleClearStatus}
                jobs={jobs}
                setSelectedJob={setSelectedJob}
            />

            {/* Modal & Overlay Layers */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-[190]" onClick={() => setContextMenu(null)} onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }} />
                    <div className="fixed z-[200] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl py-1 min-w-[160px]" style={{ top: contextMenu.y + 5, left: contextMenu.x + 5 }}>
                        <div className="p-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 mb-1 px-3">Job ID: {contextMenu.job.id.substring(0,8)}</div>
                        <button onClick={() => { setSelectedJob(contextMenu.job); setContextMenu(null); }} className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-violet-900/30">View Details</button>
                    </div>
                </>
            )}

            {isDragging && (
                <div 
                    className="fixed inset-0 z-[100] bg-violet-900/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200 pointer-events-auto"
                    onDragLeave={handleDragLeave} onDragOver={handleDragOver} onDrop={handleDrop}
                >
                    <div className="bg-gray-950 p-12 rounded-3xl border-4 border-dashed border-violet-400 shadow-2xl flex flex-col items-center">
                        <h2 className="text-3xl font-black text-white mb-2">Drop to Import</h2>
                        <button onClick={(e) => { e.stopPropagation(); setIsDragging(false); dragCounter.current = 0; }} className="mt-8 px-6 py-2 bg-gray-800 text-white rounded-lg">Cancel</button>
                    </div>
                </div>
            )}

            <AppModals 
                modals={modals} toggle={toggle} liveSelectedJob={liveSelectedJob} setSelectedJob={setSelectedJob}
                liveSelectedImage={liveSelectedImage} history={history} jobs={jobs} selectedPersonIndex={selectedPersonIndex}
                promptResultEvent={promptResultEvent} markdownEvent={markdownEvent} lightboxData={lightboxData} setLightboxData={setLightboxData}
                confirmModal={confirmModal} setConfirmModal={setConfirmModal} editingSection={editingSection} setEditingSection={setEditingSection}
                reportContent={reportContent} reportTitle={reportTitle} setReportContent={setReportContent}
            />
        </div>
    );
}