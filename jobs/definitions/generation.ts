
import { Job, JobType, JobAttribute, HistoryItem, PartyMemberConfig } from '../../types';
import { PROMPTS, fill } from '../../constants/prompts';
import { generateUUID } from '../../services/jobService';
import { getMainPersonName, getGenderConstraint } from '../utils';

export const createGenerateStoryJob = (config?: { genre?: string, tone?: string, length?: string, writingStyle?: string }): Partial<Job> => {
    let prompt = PROMPTS.analysis.generateStory;
    if (config) {
        prompt += `\n\n**STORY CONFIGURATION**:\n- Genre: ${config.genre}\n- Tone: ${config.tone}\n- Length: ${config.length}\n- Writing Style: ${config.writingStyle}`;
    }
    return {
        type: JobType.GENERATE_STORY,
        name: "Generate Story",
        prompt: prompt,
        attribute: JobAttribute.MARKDOWN
    };
};

export const createGeneratePersonaJob = (): Partial<Job> => ({
    type: JobType.GENERATE_PERSONA,
    name: "Generate Persona",
    prompt: fill(PROMPTS.analysis.generatePersona, { exclusionList: "None" }),
    attribute: JobAttribute.MARKDOWN
});

export const createNewImageJob = (prompt: string, negativePrompt?: string, model?: string, partyMembers?: PartyMemberConfig[]): Partial<Job> => ({
    type: JobType.GENERIC_GENERATE,
    name: "Text to Image",
    prompt,
    metadata: { negativePrompt, modelUsed: model, partyData: partyMembers },
    attribute: JobAttribute.IMAGE
});

export const createVideoGenerationJob = (prompt: string, resolution: '720p' | '1080p', isVeo: boolean): Partial<Job> => ({
    type: JobType.GENERATE_VIDEO,
    name: "Video Generation",
    prompt,
    metadata: { videoConfig: { resolution, model: isVeo ? 'veo-3.1-generate-preview' : 'veo-3.1-fast-generate-preview' } },
    attribute: JobAttribute.VIDEO
});

export const createComicJob = (item: HistoryItem, config: { style: string, tone: string, mode: 'single' | 'multi' }): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.comicCommon, {
        name: getMainPersonName(item) || "The Hero",
        style: config.style,
        tone: config.tone,
        genderInstr: getGenderConstraint(item)
    });
    
    return {
        type: JobType.GENERATE_COMIC,
        name: `Comic: ${config.style}`,
        prompt: config.mode === 'single' ? fill(PROMPTS.editing.comicSingle, { commonPrompt: prompt }) : prompt,
        metadata: { comicMode: config.mode }
    };
};

export const createPortraitJob = (item: HistoryItem, config: any): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.portrait, {
        framing: config.framing,
        angle: config.angle,
        expression: config.expression,
        hairColor: config.hairColor,
        eyeColor: config.eyeColor,
        genderInstr: getGenderConstraint(item)
    });
    return {
        type: JobType.GENERATE_PORTRAIT,
        name: `Portrait: ${config.framing}`,
        prompt,
        metadata: { portraitConfig: config }
    };
};

export const createBookTitleJob = (item: HistoryItem): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.bookTitle, {
        name: getMainPersonName(item) || "The Character",
        genderInstr: getGenderConstraint(item)
    });
    return {
        type: JobType.GENERATE_TITLE,
        name: "Book Title",
        prompt
    };
};

export const createTemplateJob = (type: 'man' | 'woman'): Partial<Job> => {
    const prompt = `You are a character concept artist. Take the provided mannequin template image and replace it with a high-quality, photorealistic human ${type}. The final image should show a full-body person in a standing A-pose. The background must be a neutral studio white. This is for an artistic anatomy reference. 8k quality.`;
    
    return {
        type: JobType.GENERATE_TEMPLATE_PERSON,
        name: `${type === 'man' ? 'Man' : 'Woman'} Template`,
        prompt,
        metadata: { templateGender: type },
        attribute: JobAttribute.IMAGE
    };
};
