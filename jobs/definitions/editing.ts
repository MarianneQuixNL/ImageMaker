import { Job, JobType, JobAttribute, HistoryItem, Transformation } from '../../types';
import { PROMPTS, fill } from '../../constants/prompts';
import { getGenderConstraint } from '../utils';

export const createTransformationJob = (t: Transformation): Partial<Job> => ({
    type: JobType.TRANSFORM_IMAGE,
    name: t.name || "Transformation",
    prompt: `Apply transformation: ${t.name}. Style: ${Array.isArray(t.outputStyle) ? t.outputStyle.join(', ') : 'Default'}. ` + PROMPTS.common.smartFullBodyInstruction,
    metadata: { transformation: t, aspectRatio: t.aspectRatio, quality: t.quality } 
});

export const createSmartClothesJob = (item: HistoryItem, config: any, aspectRatio?: string): Partial<Job> => {
    let instruction = `Theme: ${config.theme}. `;
    Object.entries(config.parts).forEach(([part, conf]: [string, any]) => {
        if (conf.base === 'clothe') instruction += `${part}: Clothed. `;
        if (conf.base === 'strip') instruction += `${part}: Stripped/Bare. `;
        if (conf.accessories?.length) instruction += `${part} Accessories: ${conf.accessories.join(',')}. `;
    });
    
    const prompt = fill(PROMPTS.editing.smartClothes, {
        specificInstructions: instruction,
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });

    return {
        type: JobType.SMART_CLOTHES,
        name: `Wardrobe: ${config.theme}`,
        prompt,
        metadata: { smartClothesConfig: config, aspectRatio }
    };
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
): Partial<Job> => {
    const instructions: string[] = [];

    instructions.push(`- Background: ${bg}. The lighting on the subject should match this new background.`);
    
    if (pose && pose !== "As-is") {
        instructions.push(`- Pose: ${pose}.`);
    }

    let clothingInstr = clothing;
    if (barefoot) {
        if (!clothingInstr || clothingInstr === "As-is") {
            clothingInstr = "Subject must be barefoot.";
        } else {
            clothingInstr += ", and subject must be barefoot.";
        }
    }
    if (clothingInstr && clothingInstr !== "As-is") {
        instructions.push(`- Clothing: ${clothingInstr}.`);
    }

    if (lighting && lighting !== "As-is") instructions.push(`- Overall Lighting: ${lighting}.`);
    if (species && species !== "As-is") instructions.push(`- Species: ${species}.`);
    if (bodyShape && bodyShape !== "As-is") instructions.push(`- Body Shape: ${bodyShape}.`);
    if (skin && skin !== "As-is") instructions.push(`- Skin: ${skin}.`);
    if (hair && hair !== "As-is") instructions.push(`- Hair: ${hair}.`);
    if (eyes && eyes !== "As-is") instructions.push(`- Eyes: ${eyes}.`);
    if (expression && expression !== "As-is") instructions.push(`- Expression: ${expression}.`);
    if (prosthesis && prosthesis !== "As-is") instructions.push(`- Prosthesis: ${prosthesis}.`);
    if (animals && animals !== "As-is") instructions.push(`- Animals: ${animals}.`);
    if (plants && plants !== "As-is") instructions.push(`- Plants: ${plants}.`);
    if (objects && objects !== "As-is") instructions.push(`- Objects: ${objects}.`);
    if (structures && structures !== "As-is") instructions.push(`- Structures: ${structures}.`);

    const poseInstruction = (pose && pose !== "As-is") ? "" : PROMPTS.common.posePreservationInstruction;

    const prompt = `Redraw the scene with the following changes for the main subject. Preserve their identity (face and body type) unless specified otherwise.
${instructions.join('\n')}

${PROMPTS.common.smartFullBodyInstruction}
${poseInstruction}
${getGenderConstraint(item)}
`;

    return {
        type: JobType.CHANGE_BACKGROUND,
        name: `Scene: ${bg}`,
        prompt,
        metadata: { 
            isUpload: isUp, 
            backgroundImageId: upId, 
            aspectRatio, 
            poseCommand: pose, 
            clothingDescription: clothing, 
            lightingDescription: lighting, 
            speciesDescription: species,
            elementDescription: [animals, plants, objects, structures].filter(Boolean).join(', ')
        },
        attribute: JobAttribute.IMAGE
    };
};

export const createPoseJob = (item: HistoryItem, pose: string, keepBg: boolean, aspectRatio?: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartPose, {
        theme: pose,
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: keepBg ? "Try to maintain the background context if possible." : "",
        genderInstr: getGenderConstraint(item)
    });
    return {
        type: JobType.SMART_POSE,
        name: `Pose: ${pose}`,
        prompt,
        metadata: { keepBackground: keepBg, poseCommand: pose, aspectRatio }
    };
};

export const createRotationJob = (item: HistoryItem, yaw: number, pitch: number, keepBg: boolean): Partial<Job> => {
    // Interpret yaw/pitch as absolute target angles
    let angleDesc = "Front View";
    const normYaw = ((yaw % 360) + 360) % 360;

    if (normYaw >= 337.5 || normYaw < 22.5) angleDesc = "Front View (Facing Camera)";
    else if (normYaw >= 22.5 && normYaw < 67.5) angleDesc = "3/4 View (Facing Front-Right)";
    else if (normYaw >= 67.5 && normYaw < 112.5) angleDesc = "Side Profile (Facing Right)";
    else if (normYaw >= 112.5 && normYaw < 157.5) angleDesc = "3/4 Back View (Facing Back-Right)";
    else if (normYaw >= 157.5 && normYaw < 202.5) angleDesc = "Back View (Facing Away)";
    else if (normYaw >= 202.5 && normYaw < 247.5) angleDesc = "3/4 Back View (Facing Back-Left)";
    else if (normYaw >= 247.5 && normYaw < 292.5) angleDesc = "Side Profile (Facing Left)";
    else if (normYaw >= 292.5 && normYaw < 337.5) angleDesc = "3/4 View (Facing Front-Left)";

    let pitchDesc = "Eye Level";
    if (pitch > 15) pitchDesc = "High Angle (Looking Down)";
    else if (pitch < -15) pitchDesc = "Low Angle (Looking Up)";

    const prompt = `Rotate the subject to show a ${angleDesc} from a ${pitchDesc} perspective. The goal is to change the viewing angle of the subject relative to the camera to match exactly this description: ${angleDesc}. ${keepBg ? "Preserve background." : "Remove background."} ${PROMPTS.common.smartFullBodyInstruction} ${getGenderConstraint(item)}`;
    
    return {
        type: JobType.SMART_ROTATE,
        name: `Rotate: ${angleDesc}`,
        prompt,
        metadata: { rotationYaw: yaw, rotationPitch: pitch, keepBackground: keepBg }
    };
};

export const createExtractPersonJob = (item: HistoryItem, box: number[], description: string, keepBackground: boolean): Partial<Job> => {
    return {
        type: JobType.EXTRACT_PERSONS,
        name: `Extract ${description}`,
        prompt: fill(PROMPTS.editing.extractPersonSingle, {
            description,
            box: box.join(','),
            bgInstr: keepBackground ? "Keep the background context around the subject." : "Remove background, solid white background.",
            smartFullBody: PROMPTS.common.smartFullBodyInstruction
        }),
        metadata: { box_2d: box, keepBackground }
    };
};

export const createFixPersonJob = (): Partial<Job> => ({
    type: JobType.SMART_FIX_ANATOMY,
    name: "Fix / Inpaint",
    prompt: PROMPTS.editing.fixPerson
});

export const createSmartPartnerJob = (item: HistoryItem, config: any): Partial<Job> => {
    const partnerDesc = `${config.gender} ${config.species}, ${config.hairColor} hair, ${config.eyeColor} eyes`;
    const prompt = fill(PROMPTS.editing.smartPartner, {
        partnerDesc,
        interaction: config.interaction,
        height: config.heightDiff,
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        poseInstruction: config.adaptPose ? "Adjust main subject pose to interact." : PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    
    return {
        type: JobType.SMART_PARTNER,
        name: `Partner: ${config.species}`,
        prompt,
        metadata: { partnerConfig: config }
    };
};

export const createSmartAspectRatioJob = (item: HistoryItem, width: number, height: number, position: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartAspectRatio, {
        ratio: `${width}:${height}`,
        positionInstruction: `Place subject at ${position}.`,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return {
        type: JobType.SMART_ASPECT_RATIO,
        name: `Expand to ${width}:${height}`,
        prompt,
        metadata: { aspectRatio: `${width}:${height}` }
    };
};

export const createSmartUndressJob = (item: HistoryItem, config: any): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartUndress, {
        removedItems: config.removedItems.join(', '),
        extraItems: config.extraItems.join(', '),
        location: config.location,
        outfitDescription: "Elegant editorial style. Focus on implied nudity.",
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return {
        type: JobType.SMART_UNDRESS,
        name: "Smart Undress",
        prompt,
        metadata: { ...config }
    };
};

export const createChangeSpeciesJob = (item: HistoryItem, species: string, aspectRatio?: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartSpecies, {
        species,
        specificInstruction: "",
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.CHANGE_SPECIES, name: `Species: ${species}`, prompt, metadata: { speciesDescription: species, aspectRatio } };
};

export const createChangeHairJob = (item: HistoryItem, hair: string, aspectRatio?: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartHair, { style: hair, posePreservation: PROMPTS.common.posePreservationInstruction });
    return { type: JobType.CHANGE_HAIR, name: `Hair: ${hair}`, prompt, metadata: { hairDescription: hair, aspectRatio } };
};

export const createCustomPromptJob = (promptText: string): Partial<Job> => ({
    type: JobType.CUSTOM_PROMPT,
    name: "Custom Prompt",
    prompt: `${promptText} ${PROMPTS.common.posePreservationInstruction}`,
    metadata: { additionalInstructions: promptText }
});

export const createChangeAgeJob = (age: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.changeAge, { age, posePreservation: PROMPTS.common.posePreservationInstruction });
    return { type: JobType.CHANGE_AGE, name: `Age: ${age}`, prompt, metadata: { ageDescription: age } };
};

export const createSmartTopicJob = (item: HistoryItem, topic: string, clothStyle: string, description?: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartTopic, {
        topic,
        description: description || "",
        clothingInstruction: clothStyle === "As-Is" ? "Keep existing clothing style." : (clothStyle === "Bare Minimum" ? "Minimal skin-tone tan modesty garments." : "Creative thematic outfit."),
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_TOPIC, name: `Topic: ${topic}`, prompt, metadata: { topicDescription: topic } };
};

export const createSmartEyesJob = (promptText: string, aspectRatio?: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartEyes, { promptText, posePreservation: PROMPTS.common.posePreservationInstruction });
    return { type: JobType.SMART_EYES, name: "Smart Eyes", prompt, metadata: { aspectRatio } };
};

export const createSmartTransparencyJob = (item: HistoryItem, method: string, intensity: number): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartTransparency, {
        method,
        intensity,
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_TRANSPARENCY, name: `Transparency: ${method}`, prompt, metadata: { transparency: `${method} ${intensity}%` } };
};

export const createSmartDamageJob = (item: HistoryItem, clothingDamage: string, wounds: string, filth: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartDamage, {
        clothingDamage,
        wounds,
        filth,
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_DAMAGE, name: "Damage", prompt };
};

export const createSmartShoesJob = (item: HistoryItem, shoeStyle: string, decorations: string, ankletType: string, ankletThickness: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartShoes, {
        shoeStyle,
        decorations,
        ankletType,
        ankletThickness,
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_SHOES, name: `Shoes: ${shoeStyle}`, prompt };
};

export const createSmartChainsJob = (item: HistoryItem, material: string, bodyParts: string[]): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartChains, {
        material,
        bodyParts: bodyParts.join(', '),
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_CHAINS, name: `Chains: ${material}`, prompt };
};

export const createSmartFillJob = (item: HistoryItem, material: string, height: number): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartFill, {
        material,
        height,
        heightDesc: `${height}cm`,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_FILL, name: `Fill: ${material}`, prompt, metadata: { floodConfig: { material, height } } };
};

export const createSmartSkinJob = (val: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartSkin, { skinDetails: val, posePreservation: PROMPTS.common.posePreservationInstruction });
    return { type: JobType.SMART_SKIN, name: `Skin: ${val}`, prompt };
};

export const createSmartBodyShapeJob = (item: HistoryItem, val: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartBodyShape, {
        shape: val,
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_BODYSHAPE, name: `Body: ${val}`, prompt };
};

export const createSmartContrastJob = (val: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartContrast, { style: val });
    return { type: JobType.SMART_CONTRAST, name: "Contrast", prompt };
};

export const createChangeExpressionJob = (item: HistoryItem, val: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.changeExpression, { expression: val, genderInstr: getGenderConstraint(item) });
    return { type: JobType.CHANGE_EXPRESSION, name: `Expr: ${val}`, prompt };
};

export const createChangeStyleJob = (item: HistoryItem, val: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.changeStyle, { style: val, genderInstr: getGenderConstraint(item) });
    return { type: JobType.CHANGE_STYLE, name: `Style: ${val}`, prompt };
};

export const createSmartCropJob = (item: HistoryItem, box?: number[], keepBackground = false, personIndex = 0): Partial<Job> | null => {
    let desc = "the subject";
    let boxArr = box;
    if (!box && item.peopleDetection?.people[personIndex]?.box_2d) {
        boxArr = item.peopleDetection.people[personIndex].box_2d;
        desc = item.peopleDetection.people[personIndex].description;
    }
    if (!boxArr) return null;

    const prompt = fill(PROMPTS.editing.smartCrop, {
        description: desc,
        bgInstruction: keepBackground ? "Keep background." : "Remove background.",
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    
    return { 
        type: JobType.SMART_CROP,
        name: "Smart Crop", 
        prompt,
        metadata: { personIndex, keepBackground, box_2d: boxArr }
    };
};

export const createClearAudienceJob = (item: HistoryItem): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.clearAudience, { description: "main subject", genderInstr: getGenderConstraint(item) });
    return { type: JobType.CLEAR_AUDIENCE, name: "Clear Audience", prompt };
};

export const createSmartStripPokerJob = (item: HistoryItem): Partial<Job> => {
    const prompt = fill(PROMPTS.analysis.stripPokerStep, {
        removedItems: "Top layer",
        remainingItems: "minimal tan-tone modesty bikini",
        emotion: "Embarrassed",
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_STRIP_POKER, name: "Strip Poker", prompt };
};

export const createSmartBareJob = (item: HistoryItem): Partial<Job> => {
    const prompt = `Artistic Figure Study. Implied nudity with minimal tan-colored skin-tone bikini. ${PROMPTS.common.smartFullBodyInstruction} ${getGenderConstraint(item)}`;
    return { type: JobType.SMART_BARE, name: "Smart Bare", prompt };
};

export const createSmartPhotoJob = (item: HistoryItem): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartPhoto, { smartFullBody: PROMPTS.common.smartFullBodyInstruction, posePreservation: PROMPTS.common.posePreservationInstruction, genderInstr: getGenderConstraint(item) });
    return { type: JobType.SMART_PHOTO, name: "Photo Style", prompt };
};

export const createSmartEngraveJob = (item: HistoryItem): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartEngrave, { smartFullBody: PROMPTS.common.smartFullBodyInstruction, posePreservation: PROMPTS.common.posePreservationInstruction });
    return { type: JobType.SMART_ENGRAVE, name: "Engraving", prompt };
};

export const createSmartUpscaleJob = (): Partial<Job> => ({
    type: JobType.SMART_UPSCALE,
    name: "Upscale",
    prompt: PROMPTS.editing.smartUpscale
});

export const createUpscaleJob = (): Partial<Job> => ({
    type: JobType.UPSCALE,
    name: "Upscale",
    prompt: "Upscale this image."
});

export const createSmartTextRemovalJob = (): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartTextRemoval, { posePreservation: PROMPTS.common.posePreservationInstruction });
    return { type: JobType.SMART_TEXT_REMOVAL, name: "Clean Text", prompt };
};

export const createSmartCompleteBodyJob = (): Partial<Job> => ({
    type: JobType.SMART_COMPLETE_BODY,
    name: "Complete Body",
    prompt: "Complete the missing parts of the body. " + PROMPTS.common.smartFullBodyInstruction
});

export const createMakeDecentJob = (item: HistoryItem): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.makeDecent, { posePreservation: PROMPTS.common.posePreservationInstruction });
    return { type: JobType.MAKE_DECENT, name: "Make Decent", prompt };
};

export const createBikiniResetJob = (item: HistoryItem): Partial<Job> => {
    return createChangeBackgroundJob(item, "Simple Studio Background", false, undefined, undefined, "Standing A-Pose", "Tan-colored skin-tone bikini", true);
};

export const createBareBaseJob = (item: HistoryItem): Partial<Job> => {
    const bg = "Solid White Background";
    const pose = "Standing, arms to the side, legs slightly apart, facing viewer (A-Pose)";
    const clothing = "Minimal tan skin-tone bikini for implied nudity";
    
    // Reuse createChangeBackgroundJob logic to ensure consistent prompting
    const job = createChangeBackgroundJob(item, bg, false, undefined, undefined, pose, clothing, true);
    
    return {
        ...job,
        type: JobType.BARE_BASE,
        name: "Bare Base"
    };
};

export const createSmartCleanupJob = (): Partial<Job> => ({
    type: JobType.SMART_CLEANUP,
    name: "Cleanup",
    prompt: PROMPTS.editing.smartCleanup
});

export const createBareAllJob = (item: HistoryItem): Partial<Job> => {
    const prompt = `Artistic Figure Study. Implied nudity with tan modesty garments. ${PROMPTS.common.smartFullBodyInstruction} ${getGenderConstraint(item)}`;
    return { type: JobType.BARE_ALL, name: "Bare All", prompt };
};

export const createExpandSceneJob = (item: HistoryItem): Partial<Job> => ({
    type: JobType.EXPAND_SCENE,
    name: "Expand Scene",
    prompt: `Zoom out and expand the scene. ${PROMPTS.common.smartFullBodyInstruction} ${getGenderConstraint(item)}`
});

export const createSmartProsthesisJob = (item: HistoryItem, style: string, bodyParts: string[]): Partial<Job> => ({
    type: JobType.SMART_PROSTHESIS,
    name: `Prosthesis: ${style}`,
    prompt: `Replace the subject's ${bodyParts.join(', ')} with ${style} prosthetics. High quality, intricate mechanical/organic details. ${PROMPTS.common.smartFullBodyInstruction} ${PROMPTS.common.posePreservationInstruction} ${getGenderConstraint(item)}`
});

export const createSmartEquipmentJob = (item: HistoryItem): Partial<Job> => ({
    type: JobType.SMART_EQUIPMENT,
    name: "Equipment",
    prompt: `Equip subject with adventurer gear. Backpack, pouches, belts. ${PROMPTS.common.posePreservationInstruction}`
});

// New Smart Element Jobs
export const createSmartAnimalsJob = (item: HistoryItem, animal: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartAnimals, {
        description: animal,
        context: "appropriate",
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_ANIMALS, name: `Animals: ${animal.split('::').pop()}`, prompt, metadata: { elementDescription: animal } };
};

export const createSmartPlantsJob = (item: HistoryItem, plant: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartPlants, {
        description: plant,
        context: "appropriate",
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_PLANTS, name: `Plants: ${plant.split('::').pop()}`, prompt, metadata: { elementDescription: plant } };
};

export const createSmartObjectsJob = (item: HistoryItem, object: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartObjects, {
        description: object,
        context: "appropriate",
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_OBJECTS, name: `Object: ${object.split('::').pop()}`, prompt, metadata: { elementDescription: object } };
};

export const createSmartStructuresJob = (item: HistoryItem, structure: string): Partial<Job> => {
    const prompt = fill(PROMPTS.editing.smartStructures, {
        description: structure,
        context: "appropriate",
        smartFullBody: PROMPTS.common.smartFullBodyInstruction,
        posePreservation: PROMPTS.common.posePreservationInstruction,
        genderInstr: getGenderConstraint(item)
    });
    return { type: JobType.SMART_STRUCTURES, name: `Structure: ${structure.split('::').pop()}`, prompt, metadata: { elementDescription: structure } };
};