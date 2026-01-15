
import { Job, JobType } from '../types';
import { JobContext, JobHandler } from './types';
import * as gemini from '../services/geminiService';

const fetchTemplateBase64 = async (gender: 'man' | 'woman') => {
    const response = await fetch(`templates/${gender}.png`);
    if (!response.ok) throw new Error(`Template not found: templates/${gender}.png`);
    const blob = await response.blob();
    return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
};

export const handleGenerationJob: JobHandler = async (job: Job, context: JobContext) => {
    const { image, aiSettings } = context;
    const base64 = image?.url || "";
    const prompt = job.prompt || "";
    const model = job.metadata?.modelUsed || aiSettings.generationModel;

    switch (job.type) {
        case JobType.GENERATE_STORY:
            return await gemini.generateStory(base64, prompt, model);

        case JobType.GENERATE_PERSONA:
            return await gemini.generatePersona(base64, prompt, model);

        case JobType.GENERATE_IMAGE:
        case JobType.GENERIC_GENERATE:
            // Uses Imagen 3 or configured generation model
            if (model.includes('imagen')) {
                return await gemini.generateImageFromPrompt(prompt, job.metadata?.negativePrompt);
            } else {
                // Fallback to Gemini generation if model is gemini-based (rare for generic gen, but possible)
                // Pass Aspect Ratio if available from metadata
                return await gemini.generateContent(model, prompt, base64, undefined, job.metadata?.aspectRatio);
            }

        case JobType.GENERATE_VIDEO:
            return await gemini.generateVideo(
                base64, 
                prompt, 
                job.metadata?.videoConfig?.model || 'veo-3.1-fast-generate-preview', 
                job.metadata?.videoConfig?.resolution || '720p',
                (job.metadata?.aspectRatio === '9:16' ? '9:16' : '16:9')
            );

        case JobType.GENERATE_STABLE_DIFFUSION_PROMPT:
            return await gemini.generateSDPrompt(base64, prompt, model);
            
        case JobType.GENERATE_TEMPLATE_PERSON:
            const gender = job.metadata?.templateGender as 'man' | 'woman';
            if (!gender) throw new Error("Template gender missing");
            const templateBase64 = await fetchTemplateBase64(gender);
            // Use Gemini 3 Pro Vision for high fidelity image-to-image
            return await gemini.editImage(templateBase64, prompt, "gemini-3-pro-image-preview", undefined, "4K");
        
        case JobType.GENERATE_TITLE:
            // Explicitly use editImage for book titles to ensure image output
            return await gemini.editImage(base64, prompt, "gemini-3-pro-image-preview", "9:16", "4K");

        default:
             // Fallback for types that might be routed here but are generic
             return await gemini.generateContent(model, prompt, base64);
    }
};
