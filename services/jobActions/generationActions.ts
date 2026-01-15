import { Job, JobType, HistoryItem, PartyMemberConfig } from '../../types';
import * as JobDef from '../../jobs/definitions';
import { jobService, generateUUID } from '../jobService';

export const runGenerateStory = (item: HistoryItem, config?: any) => {
    const payload = JobDef.createGenerateStoryJob(config);
    jobService.createJobInternal(payload.type!, item.id, payload);
};

export const generateNewImage = (prompt: string, negativePrompt?: string, model?: string, partyMembers?: PartyMemberConfig[]) => {
    const payload = JobDef.createNewImageJob(prompt, negativePrompt, model, partyMembers);
    jobService.createJobInternal(payload.type!, generateUUID(), payload);
};

export const createTemplateJob = (type: 'man' | 'woman') => {
    const payload = JobDef.createTemplateJob(type);
    jobService.createJobInternal(payload.type!, generateUUID(), payload);
};

export const createPortraitJob = (item: HistoryItem, config: any) => {
    const payload = JobDef.createPortraitJob(item, config);
    jobService.createJobInternal(payload.type!, item.id, payload);
};

export const createComicJob = (item: HistoryItem, config: { style: string, tone: string, mode: 'single' | 'multi' }) => {
    const payload = JobDef.createComicJob(item, config);
    jobService.createJobInternal(payload.type!, item.id, payload);
};

export const createVideoGenerationJob = (item: HistoryItem, prompt: string, resolution: '720p' | '1080p', isVeo: boolean) => {
    const payload = JobDef.createVideoGenerationJob(prompt, resolution, isVeo);
    jobService.createJobInternal(payload.type!, item.id, payload);
};

export const createTitleJob = (item: HistoryItem) => {
    const payload = JobDef.createBookTitleJob(item);
    jobService.createJobInternal(payload.type!, item.id, payload);
};
