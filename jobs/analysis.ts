
import { Job, JobType } from '../types';
import { JobContext, JobHandler } from './types';
import * as gemini from '../services/geminiService';
import { PROMPTS, fill } from '../constants/prompts';

export const handleAnalysisJob: JobHandler = async (job: Job, context: JobContext) => {
    const { image, aiSettings } = context;
    const base64 = image?.url || "";
    const prompt = job.prompt || "";
    const model = job.metadata?.modelUsed || aiSettings.analysisModel;

    switch (job.type) {
        case JobType.COUNT_PEOPLE:
            return await gemini.countPeople(base64, prompt, model);
        
        case JobType.DETECT_STYLE:
            return await gemini.detectImageStyle(base64, prompt, model);
        
        case JobType.DESCRIBE_IMAGE:
            return await gemini.describeImage(base64, prompt, model);
        
        case JobType.GENERATE_FILENAME:
            return await gemini.generateFilename(base64, prompt, model);
        
        case JobType.SAFETY_CHECK:
            return await gemini.performSafetyCheck(base64, prompt, model);
        
        case JobType.FULL_VISION_ANALYSIS:
            return await gemini.performFullVisionAnalysis(base64, prompt, model);
        
        case JobType.EXPLAIN_FAILURES:
            return await gemini.generateContent(model, prompt, base64);
            
        case JobType.SUGGEST_VIDEO_PROMPT:
            return await gemini.suggestVideoPrompt(base64);

        case JobType.EXTRACT_POSE:
            return await gemini.extractPose(base64, model);
            
        case JobType.EXTRACT_CLOTHES:
            return await gemini.extractClothes(base64, prompt, model);
            
        case JobType.EXTRACT_HAIR:
            return await gemini.extractHair(base64, model);
            
        case JobType.EXTRACT_HEAD:
            return await gemini.extractHead(base64, model);

        case JobType.DESCRIBE_PARTY:
            // Party list is embedded in the prompt
            return await gemini.generateContent(model, prompt, base64);

        default:
            throw new Error(`Unsupported analysis job type: ${job.type}`);
    }
};
