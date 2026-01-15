import { Job, JobType, JobAttribute, HistoryItem, PartyMemberConfig } from '../../types';
import * as JobDef from '../../jobs/definitions';
import { jobService } from '../jobService';
import { applyToTargets } from './jobActionUtils';

export const runCountPeople = (item: HistoryItem) => {
    const payload = JobDef.createCountPeopleJob(item);
    jobService.createJobInternal(payload.type!, item.id, payload);
};

export const runDetectStyle = (item: HistoryItem) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createDetectStyleJob();
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const runDescribeImage = (item: HistoryItem) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createDescribeImageJob(target);
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const runGenerateFilename = (item: HistoryItem, force = false) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createGenerateFilenameJob(force);
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const runSafetyCheck = (item: HistoryItem) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createSafetyCheckJob();
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const runFullVisionAnalysis = (item: HistoryItem) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createFullVisionAnalysisJob();
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const runExplainFailures = (item: HistoryItem) => {
    const failedJobs = jobService.getSnapshot().jobs.filter(j => j.imageId === item.id && j.status === 'Failed');
    const payload = JobDef.createExplainFailuresJob(item, failedJobs);
    jobService.createJobInternal(payload.type!, item.id, payload);
};

export const createSuggestVideoPromptJob = (item: HistoryItem) => {
    const payload = JobDef.createSuggestVideoPromptJob();
    jobService.createJobInternal(payload.type!, item.id, payload);
};

export const createPromptGenerationJob = (item: HistoryItem, config: any) => {
    const payload = JobDef.createPromptGenerationJob(config);
    jobService.createJobInternal(payload.type!, item.id, payload);
};
