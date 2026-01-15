import { Job, JobType, Person, HistoryItem } from '../../types';
import * as JobDef from '../../jobs/definitions';
import * as gemini from '../geminiService';
import { jobService, generateUUID } from '../jobService';
import { applyToTargets } from './jobActionUtils';
import { PROMPTS } from '../../constants/prompts';

export const runManualExtraction = (item: HistoryItem, boxes: number[][]) => {
    boxes.forEach((box, i) => {
        const payload = JobDef.createExtractPersonJob(item, box, `Selected Person ${i+1}`, false);
        jobService.createJobInternal(payload.type!, item.id, payload);
    });
};

export async function extractSpecificPerson(imageId: string, person: Person, keepBackground: boolean) {
    if (!person.box_2d) return;
    const item = jobService.getSnapshot().history.find(h => h.id === imageId);
    if (!item) return;

    // 1. Calculate aspect ratio from bounding box
    const [ymin, xmin, ymax, xmax] = person.box_2d;
    const w = xmax - xmin;
    const h = ymax - ymin;
    const aspectRatio = `${w}:${h}`;

    // 2. Crop the image locally with padding to give AI context
    const croppedImageBase64 = await gemini.cropImage(item.url, person.box_2d, 20);

    // 3. Create a new, simpler prompt since the image IS the subject.
    const newPrompt = `
        Task: Isolate the main subject, ${person.name || 'the person'}, from their background.
        Mode: ${keepBackground ? "Keep Context" : "Remove Background"}

        Instructions:
        - If "Keep Context", redraw the subject with high fidelity. Maintain the immediate background visible in this cropped image, creating a clean rectangular image of just them in their environment.
        - If "Remove Background", perform a perfect extraction of the subject and place them on a transparent background.

        ${PROMPTS.common.smartFullBodyInstruction}
    `.trim();
    
    // 4. Create the job payload with the override image data AND the aspect ratio
    const payload: Partial<Job> = {
        type: JobType.EXTRACT_PERSONS,
        name: `Extract: ${person.name || "Subject"}`,
        prompt: newPrompt,
        metadata: {
            keepBackground,
            overrideImageBase64: croppedImageBase64,
            originalBox: person.box_2d,
            modelUsed: 'gemini-3-pro-image-preview', // Use a higher quality model for this precision task
            quality: '1K',
            aspectRatio: aspectRatio
        },
        imageId: imageId 
    };

    jobService.createJobInternal(payload.type!, imageId, payload);
}

export const createManualCropJob = (item: HistoryItem, box: number[]) => {
    const payload = JobDef.createManualCropJob(box);
    jobService.createJobInternal(payload.type!, item.id, payload);
};

export const handleDrawResult = (imageId: string, dataUrl: string, isRemove: boolean) => {
    const item: HistoryItem = { id: generateUUID(), parentId: imageId, url: dataUrl, title: isRemove ? "Mask / Markings" : "Drawing", source: 'generated', origin: "Draw Tool", timestamp: new Date(), fileDetails: { size: 0, type: 'image/png' }, jobIds: [] };
    const newHistory = [item, ...jobService.getSnapshot().history];
    (jobService.getSnapshot() as any).history = newHistory; // This is a bit of a hack.
    (jobService as any).notify(); // Access private method for update
};

export const createCombineJob = (ids: string[], bgId: string | undefined, ratio: string, instructions: string) => {
    const payload = JobDef.createCombineJob(ids, bgId, ratio, instructions);
    jobService.createJobInternal(payload.type!, generateUUID(), payload);
};

export const createSmartMirrorJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartMirrorJob();
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};
