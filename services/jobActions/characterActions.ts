import { JobType, HistoryItem } from '../../types';
import * as JobDef from '../../jobs/definitions';
import { jobService } from '../jobService';
import { applyToTargets } from './jobActionUtils';

export const runGeneratePersona = (item: HistoryItem) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createGeneratePersonaJob();
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const createCharacterOverviewJob = (item: HistoryItem) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createCharacterOverviewJob();
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const runCharacterSheetTemplate = (item: HistoryItem) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createCharacterSheetTemplateJob(target);
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const runCharacterAnalysis = (item: HistoryItem, personIndex: number, jobType: JobType) => {
    const payload = JobDef.createCharacterAnalysisJob(item, personIndex, jobType);
    if (payload) jobService.createJobInternal(payload.type!, item.id, payload);
};

export const runFullCharacterAnalysis = (item: HistoryItem, personIndex: number) => {
    const types = [
        JobType.ANALYZE_PHYSICAL, JobType.ANALYZE_MENTAL, JobType.ANALYZE_SPIRITUAL, 
        JobType.ANALYZE_POSSESSIONS, JobType.GENERATE_PERSON_BACKSTORY, 
        JobType.ANALYZE_RPG_STATS, JobType.ANALYZE_SKILLS, JobType.ANALYZE_SOCIAL
    ];
    types.forEach(t => runCharacterAnalysis(item, personIndex, t));
};
