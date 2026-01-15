import { Job, JobType } from '../types';
import { JobContext, JobHandler } from './types';
import * as gemini from '../services/geminiService';

export const handleEditingJob: JobHandler = async (job: Job, context: JobContext) => {
    const { image, aiSettings } = context;
    // Check for a pre-processed image override in metadata.
    // If it exists, use it. Otherwise, fall back to the history item's image.
    const base64 = job.metadata?.overrideImageBase64 || image?.url || "";
    const prompt = job.prompt || "";
    // Default to transformation model for edits
    const model = job.metadata?.modelUsed || aiSettings.transformationModel;

    // All these types use the generic editImage flow
    return await gemini.editImage(
        base64, 
        prompt, 
        model, 
        job.metadata?.aspectRatio,
        job.metadata?.quality
    );
};