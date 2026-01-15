
import { Job, HistoryItem } from '../types';
import { ServiceResult } from '../services/geminiService';

export interface JobContext {
    image?: HistoryItem;
    history: HistoryItem[];
    aiSettings: {
        analysisModel: string;
        generationModel: string;
        transformationModel: string;
    };
}

export type JobHandler = (
    job: Job,
    context: JobContext
) => Promise<ServiceResult<any>>;
