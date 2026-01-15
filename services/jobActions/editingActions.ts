import { Job, JobType, HistoryItem, Transformation } from '../../types';
import * as JobDef from '../../jobs/definitions';
import { jobService, generateUUID } from '../jobService';
import { applyToTargets } from './jobActionUtils';

export const applyTransformation = (item: HistoryItem, t: Transformation) => {
    applyToTargets(item, (target) => {
        const payload = JobDef.createTransformationJob(t);
        jobService.createJobInternal(payload.type!, target.id, payload);
    });
};

export const createBikiniResetJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createBikiniResetJob(t);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createBareBaseJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createBareBaseJob(t);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createChangeBackgroundJob = (
    item: HistoryItem, 
    bg: string, 
    isUp: boolean, 
    upId?: string, 
    aspectRatio?: string, 
    pose?: string, 
    clothing?: string, 
    barefoot?: boolean, 
    lighting?: string, 
    species?: string, 
    bodyShape?: string, 
    skin?: string, 
    hair?: string, 
    eyes?: string, 
    expression?: string, 
    prosthesis?: string,
    animals?: string,
    plants?: string,
    objects?: string,
    structures?: string
) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createChangeBackgroundJob(
            t, bg, isUp, upId, aspectRatio, pose, clothing, barefoot, lighting, species, bodyShape, skin, hair, eyes, expression, prosthesis, animals, plants, objects, structures
        );
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createPoseJob = (item: HistoryItem, pose: string, keepBg: boolean, aspectRatio?: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createPoseJob(t, pose, keepBg, aspectRatio);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createRotationJob = (item: HistoryItem, yaw: number, pitch: number, keepBg: boolean) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createRotationJob(t, yaw, pitch, keepBg);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartClothesJob = (item: HistoryItem, config: any, aspectRatio?: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartClothesJob(t, config, aspectRatio);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createFixPersonJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createFixPersonJob();
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartAspectRatioJob = (item: HistoryItem, width: number, height: number, position: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartAspectRatioJob(t, width, height, position);
        if (payload) jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartUndressJob = (item: HistoryItem, config: any) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartUndressJob(t, config);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createChangeClothesJob = (item: HistoryItem, clothing: string) => {
    createChangeBackgroundJob(item, "Keep Background", false, undefined, undefined, "As-is", clothing);
};

export const createChangeSpeciesJob = (item: HistoryItem, species: string, aspectRatio?: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createChangeSpeciesJob(t, species, aspectRatio);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createChangeHairJob = (item: HistoryItem, hair: string, aspectRatio?: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createChangeHairJob(t, hair, aspectRatio);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createChangeLightingJob = (item: HistoryItem, lighting: string, aspectRatio?: string) => {
    createChangeBackgroundJob(item, "Keep Background", false, undefined, aspectRatio, "As-is", "As-is", false, lighting);
};

export const createCustomPromptJob = (item: HistoryItem, promptText: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createCustomPromptJob(promptText);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createChangeAgeJob = (item: HistoryItem, age: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createChangeAgeJob(age);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartTopicJob = (item: HistoryItem, topic: string, clothStyle: string, description?: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartTopicJob(t, topic, clothStyle, description);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartEyesJob = (item: HistoryItem, promptText: string, aspectRatio?: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartEyesJob(promptText, aspectRatio);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartTransparencyJob = (item: HistoryItem, method: string, intensity: number) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartTransparencyJob(t, method, intensity);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartDamageJob = (item: HistoryItem, clothingDamage: string, wounds: string, filth: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartDamageJob(t, clothingDamage, wounds, filth);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartShoesJob = (item: HistoryItem, shoeStyle: string, decorations: string, ankletType: string, ankletThickness: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartShoesJob(t, shoeStyle, decorations, ankletType, ankletThickness);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartChainsJob = (item: HistoryItem, material: string, bodyParts: string[]) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartChainsJob(t, material, bodyParts);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartFillJob = (item: HistoryItem, material: string, height: number) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartFillJob(t, material, height);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartProsthesisJob = (item: HistoryItem, style: string, bodyParts: string[]) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartProsthesisJob(t, style, bodyParts);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartSkinJob = (item: HistoryItem, val: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartSkinJob(val);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartBodyShapeJob = (item: HistoryItem, val: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartBodyShapeJob(t, val);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartContrastJob = (item: HistoryItem, val: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartContrastJob(val);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createChangeExpressionJob = (item: HistoryItem, val: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createChangeExpressionJob(t, val);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createChangeStyleJob = (item: HistoryItem, val: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createChangeStyleJob(t, val);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartFixAnatomyJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createFixPersonJob();
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartCompleteBodyJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartCompleteBodyJob();
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createMakeDecentJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createMakeDecentJob(t);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartStripPokerJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartStripPokerJob(t);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartBareJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartBareJob(t);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartStripJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        createSmartClothesJob(t, { 
            theme: "Strip", 
            parts: { full_body: { base: 'strip', accessories: [] } },
            jewelryStyle: "None", propsStyle: "None", dirtType: "Clean", skinMarkingStyle: "None"
        });
    });
};

export const createSmartPhotoJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartPhotoJob(t);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartEngraveJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartEngraveJob(t);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartUpscaleJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartUpscaleJob();
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createUpscaleJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createUpscaleJob();
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartTextRemovalJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartTextRemovalJob();
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartCropJob = (item: HistoryItem, box?: number[], keepBackground = false, personIndex = 0) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartCropJob(t, box, keepBackground, personIndex);
        if (payload) jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createClearAudienceJob = (item: HistoryItem) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createClearAudienceJob(t);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartAnimalsJob = (item: HistoryItem, animal: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartAnimalsJob(t, animal);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartPlantsJob = (item: HistoryItem, plant: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartPlantsJob(t, plant);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartObjectsJob = (item: HistoryItem, object: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartObjectsJob(t, object);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartPartnerJob = (item: HistoryItem, config: any) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartPartnerJob(t, config);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};

export const createSmartStructuresJob = (item: HistoryItem, structure: string) => {
    applyToTargets(item, (t) => {
        const payload = JobDef.createSmartStructuresJob(t, structure);
        jobService.createJobInternal(payload.type!, t.id, payload);
    });
};
