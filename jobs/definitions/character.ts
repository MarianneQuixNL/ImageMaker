
import { Job, JobType, JobAttribute, HistoryItem } from '../../types';
import { PROMPTS, fill } from '../../constants/prompts';

export const createCharacterAnalysisJob = (item: HistoryItem, personIndex: number, jobType: JobType): Partial<Job> | null => {
    const person = item.peopleDetection?.people[personIndex];
    if (!person || !person.box_2d) return null;

    let promptTemplate = "";
    let jobName = "";

    switch(jobType) {
        case JobType.ANALYZE_PHYSICAL: promptTemplate = PROMPTS.analysis.charAnalyzePhysical; jobName = "Physical Analysis"; break;
        case JobType.ANALYZE_MENTAL: promptTemplate = PROMPTS.analysis.charAnalyzeMental; jobName = "Mental Analysis"; break;
        case JobType.ANALYZE_SPIRITUAL: promptTemplate = PROMPTS.analysis.charAnalyzeSpiritual; jobName = "Spiritual Analysis"; break;
        case JobType.ANALYZE_POSSESSIONS: promptTemplate = PROMPTS.analysis.charAnalyzePossessions; jobName = "Possessions Analysis"; break;
        case JobType.GENERATE_PERSON_BACKSTORY: promptTemplate = PROMPTS.analysis.charGenerateBackstory; jobName = "Backstory Gen"; break;
        case JobType.ANALYZE_RPG_STATS: promptTemplate = PROMPTS.analysis.charAnalyzeRPGStats; jobName = "Roll Stats"; break;
        case JobType.ANALYZE_SKILLS: promptTemplate = PROMPTS.analysis.charAnalyzeSkills; jobName = "Skill Check"; break;
        case JobType.ANALYZE_SOCIAL: promptTemplate = PROMPTS.analysis.charAnalyzeSocial; jobName = "Social Map"; break;
    }

    const prompt = fill(promptTemplate, {
        box: person.box_2d.join(','),
        name: person.name || "Subject"
    });

    return {
        type: jobType,
        name: jobName,
        prompt,
        metadata: { personIndex },
        attribute: JobAttribute.JSON
    };
};

export const createCharacterOverviewJob = (): Partial<Job> => ({
    type: JobType.COMBINE_CHARACTER_SHEET,
    name: "Character Sheet",
    prompt: PROMPTS.editing.charSheetCommon,
    metadata: { sheetMode: 'grid_3_rows' }
});

export const createCharacterSheetTemplateJob = (item: HistoryItem): Partial<Job> => {
    // Determine gender
    const person = item.peopleDetection?.people?.[0];
    const gender = person?.gender === 'Female' ? 'woman' : 'man'; // Default to man if unknown/male

    return {
        type: JobType.GENERATE_CHARACTER_SHEET_TEMPLATE,
        name: "Character Sheet (Template)",
        prompt: "You are an expert character sheet artist. You will be given two images: the first is the character, the second is a pose template. Your task is to generate a new image that places the character into the poses shown on the template (Front, Left, Right, Back). Recreate the character with high fidelity. Do not include the gray template figures in the final output; replace them completely. The final image must have a solid white background, 4:3 aspect ratio, and be high resolution. Keep the character's original clothing.",
        metadata: { 
            templateGender: gender,
            aspectRatio: '4:3',
            quality: '4K'
        },
        attribute: JobAttribute.IMAGE
    };
};
