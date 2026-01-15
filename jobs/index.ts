


import { Job, JobType } from '../types';
import { JobContext, JobHandler } from './types';
import { handleAnalysisJob } from './analysis';
import { handleGenerationJob } from './generation';
import { handleEditingJob } from './editing';
import { handleCharacterJob } from './character';
import { handleUtilityJob } from './utility';
import * as gemini from '../services/geminiService';

export const dispatchJob: JobHandler = async (job: Job, context: JobContext) => {
    switch (job.type) {
        // --- Analysis ---
        case JobType.COUNT_PEOPLE:
        case JobType.DETECT_STYLE:
        case JobType.DESCRIBE_IMAGE:
        case JobType.GENERATE_FILENAME:
        case JobType.SAFETY_CHECK:
        case JobType.FULL_VISION_ANALYSIS:
        case JobType.EXPLAIN_FAILURES:
        case JobType.SUGGEST_VIDEO_PROMPT:
        case JobType.EXTRACT_POSE:
        case JobType.EXTRACT_CLOTHES:
        case JobType.EXTRACT_HAIR:
        case JobType.EXTRACT_HEAD:
        case JobType.DESCRIBE_PARTY:
            return handleAnalysisJob(job, context);

        // --- Generation ---
        case JobType.GENERATE_STORY:
        case JobType.GENERATE_PERSONA:
        case JobType.GENERATE_IMAGE:
        case JobType.GENERIC_GENERATE:
        case JobType.GENERATE_VIDEO:
        case JobType.GENERATE_STABLE_DIFFUSION_PROMPT:
        case JobType.GENERATE_PORTRAIT:
        case JobType.GENERATE_COMIC:
        case JobType.GENERATE_TITLE:
        case JobType.GENERATE_TEMPLATE_PERSON:
            return handleGenerationJob(job, context);

        // --- Character Sheet ---
        case JobType.ANALYZE_PHYSICAL:
        case JobType.ANALYZE_MENTAL:
        case JobType.ANALYZE_SPIRITUAL:
        case JobType.ANALYZE_POSSESSIONS:
        case JobType.GENERATE_PERSON_BACKSTORY:
        case JobType.ANALYZE_RPG_STATS:
        case JobType.ANALYZE_SKILLS:
        case JobType.ANALYZE_SOCIAL:
        case JobType.COMBINE_CHARACTER_SHEET:
        case JobType.GENERATE_CHARACTER_SHEET_TEMPLATE:
            return handleCharacterJob(job, context);

        // --- Utility ---
        case JobType.COMBINE_IMAGES:
        case JobType.MIRROR_IMAGE:
        case JobType.SAVE_CROP:
            return handleUtilityJob(job, context);

        // --- Editing / Transformations ---
        // Explicitly listing all remaining types handled by handleEditingJob for clarity
        case JobType.TRANSFORM_IMAGE:
        case JobType.CHANGE_BACKGROUND:
        case JobType.CHANGE_CLOTHES:
        case JobType.CHANGE_HAIR:
        case JobType.CHANGE_SPECIES:
        case JobType.CHANGE_LIGHTING:
        case JobType.CHANGE_AGE:
        case JobType.CHANGE_STYLE:
        case JobType.CHANGE_EXPRESSION:
        case JobType.SMART_POSE:
        case JobType.SMART_ROTATE:
        case JobType.SMART_CLOTHES:
        case JobType.SMART_SKIN:
        case JobType.SMART_EYES:
        case JobType.SMART_DAMAGE:
        case JobType.SMART_SHOES:
        case JobType.SMART_CHAINS:
        case JobType.SMART_TRANSPARENCY:
        case JobType.SMART_ASPECT_RATIO:
        case JobType.SMART_UNDRESS:
        case JobType.SMART_FILL:
        case JobType.SMART_PARTNER:
        case JobType.SMART_TOPIC:
        case JobType.SMART_BODYSHAPE:
        case JobType.SMART_CONTRAST:
        case JobType.SMART_PHOTO:
        case JobType.SMART_ENGRAVE:
        case JobType.SMART_UPSCALE:
        case JobType.SMART_TEXT_REMOVAL:
        case JobType.SMART_MIRROR: // Note: MIRROR_IMAGE is utility, SMART_MIRROR might use AI
        case JobType.SMART_CROP:
        case JobType.MAKE_DECENT:
        case JobType.SMART_STRIP_POKER:
        case JobType.SMART_BARE:
        case JobType.BARE_BASE:
        case JobType.SMART_FIX_ANATOMY:
        case JobType.SMART_COMPLETE_BODY:
        case JobType.CLEAR_AUDIENCE:
        case JobType.CUSTOM_PROMPT:
        case JobType.UPSCALE:
        case JobType.FIX_CLOTHES:
        case JobType.REMOVE_ARTIFACTS:
        case JobType.EXTRACT_PERSONS:
        case JobType.EXTRACT_BACKGROUND:
        case JobType.SMART_CLEANUP:
        case JobType.FULL_BODY:
        case JobType.SMART_FULL_BODY_ZOOM:
        case JobType.BARE_ALL:
        case JobType.SMART_PROSTHESIS:
        case JobType.SMART_EQUIPMENT:
        case JobType.EXPAND_SCENE:
        case JobType.SMART_ANIMALS:
        case JobType.SMART_PLANTS:
        case JobType.SMART_OBJECTS:
        case JobType.SMART_STRUCTURES:
            return handleEditingJob(job, context);

        default:
            // Fallback for new/unknown types that likely require generic image editing
            if (context.image) {
                return handleEditingJob(job, context);
            }
            // Absolute fallback for text-only without specific handler
            const model = job.metadata?.modelUsed || context.aiSettings.analysisModel;
            return await gemini.generateContent(model, job.prompt || "", context.image?.url || "");
    }
};
