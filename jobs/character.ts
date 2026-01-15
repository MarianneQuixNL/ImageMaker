
import { Job, JobType } from '../types';
import { JobContext, JobHandler } from './types';
import * as gemini from '../services/geminiService';

const blobToBase64 = (blob: Blob): Promise<string> => { 
    return new Promise((resolve, reject) => { 
        const reader = new FileReader(); 
        reader.onloadend = () => resolve(reader.result as string); 
        reader.onerror = reject; 
        reader.readAsDataURL(blob); 
    }); 
};

export const handleCharacterJob: JobHandler = async (job: Job, context: JobContext) => {
    const { image, aiSettings } = context;
    const base64 = image?.url || "";
    const prompt = job.prompt || "";
    const model = job.metadata?.modelUsed || aiSettings.analysisModel;

    switch (job.type) {
        case JobType.ANALYZE_PHYSICAL:
            return await gemini.analyzePhysical(base64, prompt, model);
        case JobType.ANALYZE_MENTAL:
            return await gemini.analyzeMental(base64, prompt, model);
        case JobType.ANALYZE_SPIRITUAL:
            return await gemini.analyzeSpiritual(base64, prompt, model);
        case JobType.ANALYZE_POSSESSIONS:
            return await gemini.analyzePossessions(base64, prompt, model);
        case JobType.GENERATE_PERSON_BACKSTORY:
            return await gemini.analyzeBackstory(base64, prompt, model);
        case JobType.ANALYZE_RPG_STATS:
            return await gemini.analyzeRPGStats(base64, prompt, model);
        case JobType.ANALYZE_SKILLS:
            return await gemini.analyzeSkills(base64, prompt, model);
        case JobType.ANALYZE_SOCIAL:
            return await gemini.analyzeSocialRelations(base64, prompt, model);
            
        case JobType.GENERATE_CHARACTER_SHEET_TEMPLATE:
            const gender = job.metadata?.templateGender || 'man';
            const templatePath = `templates/${gender}.png`;
            
            const response = await fetch(templatePath);
            if (!response.ok) throw new Error(`Template generation failed: Could not load template file at ${templatePath}`);
            const blob = await response.blob();
            const templateBase64 = await blobToBase64(blob);
            
            // Use Gemini 3 Pro Vision for this complex task (best quality and resolution support)
            const genModel = "gemini-3-pro-image-preview";
            
            return await gemini.generateCharacterSheet(base64, templateBase64, prompt, genModel);

        default:
            throw new Error(`Unsupported character job type: ${job.type}`);
    }
};
