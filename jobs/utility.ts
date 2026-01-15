
import { Job, JobType } from '../types';
import { JobContext, JobHandler } from './types';
import * as gemini from '../services/geminiService';

export const handleUtilityJob: JobHandler = async (job: Job, context: JobContext) => {
    const { image, history } = context;
    const base64 = image?.url || "";

    switch (job.type) {
        case JobType.COMBINE_IMAGES:
            const sourceUrls = job.metadata?.sourceImageIds?.map(id => {
                const item = history.find(h => h.id === id);
                return item?.url;
            }).filter(u => u) as string[];
            
            if (sourceUrls && sourceUrls.length > 0) {
                return await gemini.combineImages(sourceUrls, job.prompt || "", job.metadata?.aspectRatio);
            } else {
                throw new Error("Missing source images for combine");
            }

        case JobType.MIRROR_IMAGE:
            const mirrorResult = await gemini.mirrorImage(base64);
            return { 
                data: mirrorResult, 
                debug: { request: 'Local Canvas Operation', response: 'Mirrored Image Data' } 
            };

        case JobType.SAVE_CROP:
            if (job.metadata?.box_2d) {
                const cropResult = await gemini.cropImage(base64, job.metadata.box_2d);
                return { 
                    data: cropResult, 
                    debug: { request: { box: job.metadata.box_2d }, response: 'Cropped Image Data' } 
                };
            }
            throw new Error("Missing crop box data");

        default:
            throw new Error(`Unsupported utility job type: ${job.type}`);
    }
};
