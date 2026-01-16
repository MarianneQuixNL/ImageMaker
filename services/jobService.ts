import { 
    Job, JobStatus, JobType, JobAttribute, HistoryItem, LogType, LogSource, 
    Transformation, Person, PartyMemberConfig 
} from '../types';
import { logger } from './loggerService';
import { storageService } from './storageService';
import * as gemini from './geminiService';
import { DEFAULT_TRANSFORMATIONS } from '../presets/presetRegistry';
import { dispatchJob } from '../jobs/index';
import { JobContext } from '../jobs/types';
import * as JobDef from '../jobs/definitions/index';
import { generateUUID } from '../jobs/utils';
import { PROMPTS } from '../constants/prompts';

// Helper for UI
export const getMainPersonName = (item?: HistoryItem | null): string | null => {
    if (!item || !item.peopleDetection?.people.length) return null;
    return item.peopleDetection.people[0].name || null;
};

// Re-export generateUUID for components that might still use it from here
export { generateUUID } from '../jobs/utils';

const generateVideoThumbnail = (file: File | Blob): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
        video.currentTime = Math.min(1, video.duration * 0.1);
    }
    video.onseeked = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      resolve(dataUrl);
    };
    video.onerror = () => {
        resolve(""); 
    }
    video.src = URL.createObjectURL(file);
  });
};

export interface JobServiceState {
    jobs: Job[];
    history: HistoryItem[];
    isQueuePaused: boolean;
    freeTierMode: boolean;
    markdownEvent: { title: string, content: string } | null;
    promptResultEvent: any | null;
    autoRetry: boolean;
    autoAddToWorkspace: boolean;
    useSelected: boolean;
    selectedItems: Set<string>;
    concurrencyLimit: number;
    transformations: Transformation[];
    aiSettings: any;
}

class JobService {
    private jobs: Job[] = [];
    private history: HistoryItem[] = [];
    private listeners: Set<() => void> = new Set();
    private currentSnapshot: JobServiceState | null = null;
    
    public isQueuePaused = false;
    public freeTierMode = true; // Default to TRUE to prevent 429 errors on free accounts
    public concurrencyLimit = 5;
    public autoRetry = false;
    public autoAddToWorkspace = true; 
    public useSelected = false;
    
    public markdownEvent: { title: string, content: string } | null = null;
    public promptResultEvent: any | null = null;
    public selectedItems: Set<string> = new Set();
    public transformations: Transformation[] = [];
    public aiSettings: any = {
        analysisModel: 'gemini-3-flash-preview',
        generationModel: 'gemini-2.5-flash-image',
        transformationModel: 'gemini-2.5-flash-image'
    };

    private processingQueue = false;

    constructor() {
        this.loadConfig();
    }

    private async loadConfig() {
        try {
            const config = await storageService.getConfig();
            if (config) {
                if (config.transformations && config.transformations.length > 0) {
                    this.transformations = config.transformations;
                } else {
                    this.transformations = DEFAULT_TRANSFORMATIONS;
                }

                if (config.concurrencyLimit) this.concurrencyLimit = config.concurrencyLimit;
                if (config.freeTierMode !== undefined) this.freeTierMode = config.freeTierMode;
                if (config.aiSettings) this.aiSettings = config.aiSettings;
            } else {
                this.transformations = DEFAULT_TRANSFORMATIONS;
            }
            this.notify();
        } catch (e) {
            console.error("Config load error", e);
            this.transformations = DEFAULT_TRANSFORMATIONS;
        }
    }

    public subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }

    public getSnapshot = (): JobServiceState => {
        if (!this.currentSnapshot) {
            this.currentSnapshot = {
                jobs: this.jobs,
                history: this.history,
                isQueuePaused: this.isQueuePaused,
                freeTierMode: this.freeTierMode,
                markdownEvent: this.markdownEvent,
                promptResultEvent: this.promptResultEvent,
                autoRetry: this.autoRetry,
                autoAddToWorkspace: this.autoAddToWorkspace,
                useSelected: this.useSelected,
                selectedItems: new Set(this.selectedItems),
                concurrencyLimit: this.concurrencyLimit,
                transformations: this.transformations,
                aiSettings: this.aiSettings
            };
        }
        return this.currentSnapshot;
    }

    private notify() {
        this.currentSnapshot = null;
        this.listeners.forEach(l => l());
    }

    public triggerQueueProcessing() {
        if (!this.processingQueue) {
            this.processQueue();
        }
    }

    private async processQueue() {
        if (this.isQueuePaused) return;
        this.processingQueue = true;

        const activeCount = this.jobs.filter(j => j.status === JobStatus.RUNNING).length;
        const maxConcurrent = this.freeTierMode ? 1 : this.concurrencyLimit;

        if (activeCount >= maxConcurrent) {
            this.processingQueue = false;
            return;
        }

        const nextJob = this.jobs
            .filter(j => j.status === JobStatus.WAITING)
            .sort((a, b) => (b.priority || 0) - (a.priority || 0) || a.createdAt.getTime() - b.createdAt.getTime())[0];

        if (nextJob) {
            if (nextJob.dependencies && nextJob.dependencies.length > 0) {
                const deps = this.jobs.filter(j => nextJob.dependencies?.includes(j.id));
                const anyFailed = deps.some(d => d.status === JobStatus.FAILED || d.status === JobStatus.CANCELLED || d.status === JobStatus.DEAD);
                const allDone = deps.every(d => d.status === JobStatus.FINISHED);

                if (anyFailed) {
                    this.updateJob(nextJob.id, { status: JobStatus.DEAD, error: "Dependency failed" });
                    this.processQueue();
                    return;
                }
                if (!allDone) {
                    this.processingQueue = false;
                    return;
                }
            }

            this.updateJob(nextJob.id, { status: JobStatus.RUNNING, startedAt: new Date() });
            
            this.executeJob(nextJob).then(() => {
                if (this.freeTierMode) {
                    setTimeout(() => this.processQueue(), 5000); 
                } else {
                    this.processQueue();
                }
            });

            if (activeCount + 1 < maxConcurrent) {
                setTimeout(() => this.processQueue(), 100);
            }
        } else {
            this.processingQueue = false;
        }
    }

    private triggerDownload(url: string, filename: string) {
        try {
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            console.error("Auto-download failed", e);
        }
    }

    private async executeJob(job: Job) {
        try {
            const image = this.history.find(h => h.id === job.imageId);

            if (job.type !== JobType.GENERIC_GENERATE && job.type !== JobType.GENERATE_TEMPLATE_PERSON && !image) {
                if (![JobType.COMBINE_IMAGES, JobType.COMBINE_CHARACTER_SHEET].includes(job.type)) {
                    throw new Error("Source image not found");
                }
            }
            
            const context: JobContext = {
                image,
                history: this.history,
                aiSettings: this.aiSettings
            };

            const result = await dispatchJob(job, context);

            // --- Post-Processing Side Effects ---

            this.updateJob(job.id, { 
                status: JobStatus.FINISHED, 
                result: result.data, 
                debug: result.debug,
                completedAt: new Date()
            });

            if (job.type === JobType.GENERATE_STABLE_DIFFUSION_PROMPT && result.data) {
                this.promptResultEvent = { ...result.data, generator: job.metadata?.generator };
                this.notify();
            }

            if (image) {
                if (job.type === JobType.COUNT_PEOPLE && result.data?.people) {
                    this.updateHistoryItem(image.id, { peopleDetection: result.data });
                }
                else if (job.type === JobType.DETECT_STYLE && typeof result.data === 'string') {
                    this.updateHistoryItem(image.id, { detectedStyle: result.data });
                }
                else if (job.type === JobType.GENERATE_FILENAME && result.data?.filename) {
                    this.updateHistoryItem(image.id, { 
                        title: result.data.filename, 
                        folderPath: result.data.folder_path,
                        filenameGenerated: true
                    });
                }
                
                // Character Sheet Updates
                if (job.metadata?.personIndex !== undefined) {
                    const idx = job.metadata.personIndex;
                    const updateKeyMap: Record<string, keyof Person> = {
                        [JobType.ANALYZE_PHYSICAL]: 'physicalAttributes',
                        [JobType.ANALYZE_MENTAL]: 'mentalAttributes',
                        [JobType.ANALYZE_SPIRITUAL]: 'spiritualAttributes',
                        [JobType.ANALYZE_POSSESSIONS]: 'possessions',
                        [JobType.GENERATE_PERSON_BACKSTORY]: 'backstory',
                        [JobType.ANALYZE_RPG_STATS]: 'rpgStats',
                        [JobType.ANALYZE_SKILLS]: 'skills',
                        [JobType.ANALYZE_SOCIAL]: 'social'
                    };
                    const key = updateKeyMap[job.type];
                    if (key) {
                        this.updatePersonDetails(image.id, idx, { [key]: result.data });
                    }
                }
            }

            if (job.attribute === JobAttribute.MARKDOWN) {
                let title = job.name || "Report";
                let content = "";
                
                if (typeof result.data === 'string') content = result.data;
                else if (result.data.markdown) {
                    content = result.data.markdown;
                    title = result.data.filename || title;
                }
                
                if (content) {
                    this.markdownEvent = { title, content };
                    this.notify();
                }
            }

            const finishedJob = { ...job, result: result.data, status: JobStatus.FINISHED };
            
            if (typeof result.data === 'string') {
                const isImage = job.attribute === JobAttribute.IMAGE;
                const isVideo = job.attribute === JobAttribute.VIDEO;
                
                if (this.autoAddToWorkspace && (isImage || isVideo)) {
                    this.promoteJob(finishedJob);
                }

                if (isImage || isVideo || (job.attribute === JobAttribute.MARKDOWN && job.metadata?.autoDownload)) {
                    let ext = isVideo ? 'mp4' : 'png';
                    if (job.attribute === JobAttribute.MARKDOWN) ext = 'md';
                    
                    // Construct safe filename using full job name (including potential char name) if available
                    let baseName = job.name || job.type;
                    const parentImage = this.history.find(h => h.id === job.imageId);
                    if (parentImage) {
                        const charName = getMainPersonName(parentImage);
                        if (charName && !baseName.startsWith(charName)) {
                            baseName = `${charName} - ${baseName}`;
                        }
                    }

                    const safeName = baseName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                    const filename = `${safeName}_${job.id.substring(0, 4)}.${ext}`;
                    
                    this.triggerDownload(result.data, filename);
                }
            }

        } catch (error: any) {
            console.error(`Job ${job.id} failed:`, error);
            
            const isProhibited = error.message.includes("PROHIBITED") || error.message.includes("SAFETY") || error.message.includes("Safety Block");
            const isImageOther = error.message.includes("IMAGE_OTHER");
            const isRefusal = error.message.includes("STOP") || error.message.includes("cannot fulfill") || error.message.includes("not a person") || error.message.includes("celebrity");
            const isSensitive = error.message.includes("sensitive words") || error.message.includes("Responsible AI") || error.message.includes("INVALID_ARGUMENT");

            // Handle Refusals & Safety Blocks with Sanitization Retry
            if (this.autoRetry && job.retryCount < 2 && (isProhibited || isImageOther || isRefusal || isSensitive)) {
                logger.log(`Safety block or rejection detected for job ${job.id}. Attempting auto-sanitize (removing identities)...`, LogType.WARNING, error.message, LogSource.SYSTEM);
                try {
                    const image = this.history.find(h => h.id === job.imageId);
                    const safePrompt = await gemini.rephrasePromptForSafety(job.prompt || "", image?.url || "");
                    
                    this.updateJob(job.id, {
                        status: JobStatus.WAITING,
                        prompt: safePrompt,
                        retryCount: job.retryCount + 1,
                        error: `Retrying with sanitized prompt: ${safePrompt.substring(0, 50)}...`,
                        metadata: { ...job.metadata, autoSanitizeOnRetry: true }
                    });
                    this.processQueue();
                    return;
                } catch (retryError) {
                    logger.log("Auto-sanitize failed", LogType.ERROR, String(retryError), LogSource.SYSTEM);
                }
            }

            if (error.message.includes("429")) {
                // If not in free tier mode, just pause the queue.
                // If already in free tier mode, still pause but also log the message.
                this.isQueuePaused = true;
                logger.log("API Quota Exceeded (429). Queue Paused.", LogType.ERROR, "Please wait or switch API keys.", LogSource.SYSTEM);
                this.notify();
            }

            this.updateJob(job.id, { 
                status: JobStatus.FAILED, 
                error: error.message,
                completedAt: new Date(),
                debug: error.debug
            });
        }
    }

    // --- Core State Mutators ---

    public addHistoryItem(file: File, origin: string) {
        if (file.type.startsWith('video/')) {
            this.addVideoHistoryItem(file, origin);
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const url = e.target?.result as string;
            const item: HistoryItem = {
                id: generateUUID(),
                url,
                title: file.name,
                source: 'uploaded',
                origin,
                timestamp: new Date(),
                fileDetails: { size: file.size, type: file.type },
                jobIds: []
            };
            this.history = [item, ...this.history];
            this.notify();
            
            // Auto-run count people on new uploads
            const payload = JobDef.createCountPeopleJob(item);
            this.createJobInternal(payload.type!, item.id, payload);
        };
        reader.readAsDataURL(file);
    }

    private async addVideoHistoryItem(file: File | Blob, origin: string) {
        try {
            const thumbnailData = await generateVideoThumbnail(file);
            const videoUrl = URL.createObjectURL(file);
            const filename = (file as File).name || `video_${Date.now()}.mp4`;

            const item: HistoryItem = {
                id: generateUUID(),
                url: thumbnailData || '', 
                videoUrl: videoUrl,
                title: filename,
                baseFilename: filename.split('.')[0],
                source: 'uploaded',
                origin,
                timestamp: new Date(),
                fileDetails: { size: file.size, type: file.type },
                jobIds: [],
                peopleDetection: { count: 0, people: [] }
            };
            this.history = [item, ...this.history];
            this.notify();
        } catch (e) {
            logger.log("Failed to process video file", LogType.ERROR, String(e), LogSource.SYSTEM);
        }
    }

    public async addHistoryItemFromBlob(blob: Blob, filename: string, origin: string, source: 'uploaded' | 'generated') {
        if (blob.type.startsWith('video/')) {
            await this.addVideoHistoryItem(blob, origin);
            return;
        }
        const url = URL.createObjectURL(blob);
        const item: HistoryItem = {
            id: generateUUID(),
            url,
            title: filename,
            source,
            origin,
            timestamp: new Date(),
            fileDetails: { size: blob.size, type: blob.type },
            jobIds: []
        };
        this.history = [item, ...this.history];
        this.notify();
        if (source === 'uploaded') {
            const payload = JobDef.createCountPeopleJob(item);
            this.createJobInternal(payload.type!, item.id, payload);
        }
    }

    public handleWebImageDrop(url: string) {
        fetch(url).then(res => res.blob()).then(blob => {
            const filename = url.split('/').pop() || "web_image";
            this.addHistoryItemFromBlob(blob, filename, "Web Drop", "uploaded");
        }).catch(() => {
            if (url.startsWith('data:')) {
                const item: HistoryItem = {
                    id: generateUUID(),
                    url,
                    title: "Pasted Image",
                    source: 'uploaded',
                    origin: "Clipboard/Drag",
                    timestamp: new Date(),
                    fileDetails: { size: 0, type: 'image/png' },
                    jobIds: []
                };
                this.history = [item, ...this.history];
                this.notify();
                const payload = JobDef.createCountPeopleJob(item);
                this.createJobInternal(payload.type!, item.id, payload);
            }
        });
    }

    public updateHistoryItem(id: string, updates: Partial<HistoryItem>) {
        this.history = this.history.map(h => h.id === id ? { ...h, ...updates } : h);
        this.notify();
    }

    public deleteHistoryItem(id: string) {
        this.history = this.history.filter(h => h.id !== id);
        const jobsToDelete = this.jobs.filter(j => j.imageId === id);
        jobsToDelete.forEach(j => { if (j.status !== JobStatus.RUNNING) this.deleteJob(j.id); });
        this.notify();
    }

    // INTERNAL entry point for action creators
    public createJobInternal(type: JobType, imageId: string, details: Partial<Job>) {
        const job: Job = {
            id: generateUUID(),
            imageId,
            type,
            attribute: JobAttribute.IMAGE,
            status: JobStatus.WAITING,
            createdAt: new Date(),
            retryCount: 0,
            ...details
        };
        this.jobs = [job, ...this.jobs];
        const item = this.history.find(h => h.id === imageId);
        if (item) {
            const newJobIds = item.jobIds ? [...item.jobIds, job.id] : [job.id];
            this.updateHistoryItem(imageId, { jobIds: newJobIds });
        }
        this.triggerQueueProcessing();
        return job;
    }

    public updateJob(id: string, updates: Partial<Job>) {
        this.jobs = this.jobs.map(j => j.id === id ? { ...j, ...updates } : j);
        this.notify();
    }

    public deleteJob(id: string) {
        this.jobs = this.jobs.filter(j => j.id !== id);
        this.notify();
    }

    public retryJob(job: Job) {
        this.updateJob(job.id, { status: JobStatus.WAITING, retryCount: job.retryCount + 1, error: undefined });
        this.triggerQueueProcessing();
    }

    public cancelJob(job: Job) {
        this.updateJob(job.id, { status: JobStatus.CANCELLED });
    }

    public promoteJob(job: Job) {
        if (job.result && typeof job.result === 'string') {
            
            // VALIDATION CHECK
            const isDataUri = job.result.startsWith('data:');
            const isBlob = job.result.startsWith('blob:');
            const isHttp = job.result.startsWith('http');
            
            if (!isDataUri && !isBlob && !isHttp) {
                logger.log("Job Promotion Failed", LogType.WARNING, "Result appears to be text, not an image.", LogSource.SYSTEM);
                return;
            }

            const isVideo = job.attribute === JobAttribute.VIDEO;
            let title = job.name || job.type;
            const parentImage = this.history.find(h => h.id === job.imageId);
            
            if (parentImage) {
                const charName = getMainPersonName(parentImage);
                if (charName && !title.startsWith(charName)) {
                    title = `${charName} - ${title}`;
                }
            }

            const item: HistoryItem = {
                id: generateUUID(),
                parentId: job.imageId,
                url: job.result,
                videoUrl: isVideo ? job.result : undefined,
                title: title,
                source: 'generated',
                origin: `Job: ${job.type}`,
                timestamp: new Date(),
                fileDetails: { size: 0, type: isVideo ? 'video/mp4' : 'image/png' },
                jobIds: []
            };

            if (isVideo) {
                fetch(job.result).then(res => res.blob()).then(blob => {
                    generateVideoThumbnail(blob).then(thumb => {
                        item.url = thumb;
                        this.history = [item, ...this.history];
                        this.notify();
                    });
                });
            } else {
                this.history = [item, ...this.history];
                this.notify();
                if (job.type !== JobType.UPSCALE) {
                    const payload = JobDef.createCountPeopleJob(item);
                    this.createJobInternal(payload.type!, item.id, payload);
                }
            }
        }
    }
    
    // --- Bulk Actions / UI State Toggles ---

    public retryAllFailedJobs(imageId: string) {
        this.jobs.filter(j => j.imageId === imageId && j.status === JobStatus.FAILED).forEach(j => this.retryJob(j));
    }
    public removeFailedJobsForImage(imageId: string) {
        this.jobs = this.jobs.filter(j => !(j.imageId === imageId && j.status === JobStatus.FAILED));
        this.notify();
    }
    public cancelJobsForImage(imageId: string) {
        this.jobs.filter(j => j.imageId === imageId && (j.status === JobStatus.WAITING || j.status === JobStatus.RUNNING)).forEach(j => this.cancelJob(j));
    }
    public prioritizeJob(id: string) {
        this.updateJob(id, { priority: 100 });
        this.triggerQueueProcessing();
    }
    public promoteAllCompletedJobsGlobal() {
        this.jobs.filter(j => j.status === JobStatus.FINISHED && (j.attribute === JobAttribute.IMAGE || j.attribute === JobAttribute.VIDEO)).forEach(j => this.promoteJob(j));
    }
    public retryAllFailed() {
        this.jobs.filter(j => j.status === JobStatus.FAILED).forEach(j => this.retryJob(j));
    }
    public deleteJobsByStatus(status: JobStatus) {
        this.jobs = this.jobs.filter(j => j.status !== status);
        this.notify();
    }
    public toggleImageSelection(id: string) {
        if (this.selectedItems.has(id)) { this.selectedItems.delete(id); } else { this.selectedItems.add(id); }
        this.notify();
    }
    public toggleUseSelected() { this.useSelected = !this.useSelected; this.notify(); }
    public toggleAutoRetry() { this.autoRetry = !this.autoRetry; this.notify(); }
    public toggleAutoAddToWorkspace() { this.autoAddToWorkspace = !this.autoAddToWorkspace; this.notify(); }
    
    public toggleFreeTierMode() {
        this.freeTierMode = !this.freeTierMode;
        this.updateConfiguration({
            transformations: this.transformations,
            concurrencyLimit: this.concurrencyLimit,
            freeTierMode: this.freeTierMode,
            aiSettings: this.aiSettings
        });
        this.notify();
    }

    public updateConfiguration(config: any) {
        this.concurrencyLimit = config.concurrencyLimit;
        this.transformations = config.transformations;
        this.freeTierMode = config.freeTierMode;
        this.aiSettings = config.aiSettings;
        storageService.saveConfig(config);
        this.notify();
    }
    public importConfig(json: any, name: string) {
        if (json.transformations) this.updateConfiguration(json);
        logger.log(`Configuration imported: ${name}`, LogType.SUCCESS);
    }
    public clearMarkdownEvent() { this.markdownEvent = null; this.notify(); }
    public clearPromptResultEvent() { this.promptResultEvent = null; this.notify(); }
    public triggerMarkdownViewer(content: string, title: string) { this.markdownEvent = { title, content }; this.notify(); }
    
    public updatePersonDetails(imageId: string, personIndex: number, updates: Partial<Person>) {
        const item = this.history.find(h => h.id === imageId);
        if (item && item.peopleDetection?.people[personIndex]) {
            const person = item.peopleDetection.people[personIndex];
            Object.assign(person, updates);
            this.history = [...this.history];
            this.notify();
        }
    }
}

export const jobService = new JobService();