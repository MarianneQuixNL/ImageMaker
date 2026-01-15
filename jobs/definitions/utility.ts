import { Job, JobType, JobStatus } from '../../types';
import { generateUUID } from '../utils';

export const createCombineJob = (ids: string[], bgId: string | undefined, ratio: string, instructions: string): Partial<Job> => ({
    type: JobType.COMBINE_IMAGES,
    name: "Combine Images",
    prompt: `Combine these images. ${instructions}`,
    metadata: { sourceImageIds: ids, backgroundImageId: bgId, aspectRatio: ratio }
});

export const createSmartMirrorJob = (): Partial<Job> => ({
    type: JobType.MIRROR_IMAGE,
    name: "Mirror",
    prompt: "Local client-side mirror operation (horizontal flip). No AI was used for this job."
});

export const createManualCropJob = (box: number[]): Partial<Job> => ({
    type: JobType.SAVE_CROP,
    name: "Manual Crop",
    prompt: "Local client-side crop operation based on user-defined bounding box. No AI was used for this job.",
    metadata: { box_2d: box }
});