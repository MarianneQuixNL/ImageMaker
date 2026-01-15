
import { Job, JobType, JobAttribute, HistoryItem, PartyMemberConfig } from '../../types';
import { PROMPTS, fill } from '../../constants/prompts';

export const createCountPeopleJob = (item: HistoryItem): Partial<Job> => {
    // Attempt to extract a name from the filename
    // 1. Remove extension
    // 2. Replace underscores and hyphens with spaces
    // 3. Remove common numeric suffixes (e.g. "Name 01", "Name (2)")
    const cleanName = item.title
        .replace(/\.[^/.]+$/, "") 
        .replace(/[_-]/g, " ")
        .replace(/\s*\(\d+\)$/, "")
        .replace(/\s+\d+$/, "")
        .trim();

    const suggestionText = cleanName.length > 2 
        ? `The filename is "${cleanName}". CHECK THIS FIRST. If this looks like a person's name, YOU MUST ASSIGN IT to the main subject. Otherwise, suggest European names (preferably Dutch).` 
        : "Suggest European names (preferably Dutch).";

    return {
        type: JobType.COUNT_PEOPLE,
        name: "Detect People",
        prompt: fill(PROMPTS.analysis.countPeople, { suggestionText, exclusionList: "None" }),
        priority: 50,
        attribute: JobAttribute.DATA
    };
};

export const createDetectStyleJob = (): Partial<Job> => ({
    type: JobType.DETECT_STYLE,
    name: "Detect Style",
    prompt: PROMPTS.analysis.detectStyle,
    attribute: JobAttribute.DATA
});

export const createDescribeImageJob = (item: HistoryItem): Partial<Job> => ({
    type: JobType.DESCRIBE_IMAGE,
    name: "Describe Image",
    prompt: fill(PROMPTS.analysis.describeImage, { title: item.title }),
    attribute: JobAttribute.TEXT
});

export const createGenerateFilenameJob = (force = false): Partial<Job> => ({
    type: JobType.GENERATE_FILENAME,
    name: "Generate Filename",
    prompt: fill(PROMPTS.analysis.generateFilename, { nameContext: "" }),
    priority: force ? 100 : 10,
    attribute: JobAttribute.DATA
});

export const createSafetyCheckJob = (): Partial<Job> => ({
    type: JobType.SAFETY_CHECK,
    name: "Safety Check",
    prompt: PROMPTS.analysis.safetyCheckReport,
    attribute: JobAttribute.MARKDOWN
});

export const createFullVisionAnalysisJob = (): Partial<Job> => ({
    type: JobType.FULL_VISION_ANALYSIS,
    name: "Full Vision Report",
    prompt: PROMPTS.analysis.fullVisionAnalysis,
    attribute: JobAttribute.MARKDOWN
});

export const createExplainFailuresJob = (item: HistoryItem, failedJobs: Job[]): Partial<Job> => {
    const jobList = failedJobs.map(j => `- Job "${j.name || j.type}": ${j.error}`).join('\n');
    return {
        type: JobType.EXPLAIN_FAILURES,
        name: "Explain Failures",
        prompt: fill(PROMPTS.analysis.explainFailures, { 
            imageTitle: item.title, 
            detectedPeople: item.peopleDetection?.count || 0,
            jobList 
        }),
        attribute: JobAttribute.MARKDOWN
    };
};

export const createSuggestVideoPromptJob = (): Partial<Job> => ({
    type: JobType.SUGGEST_VIDEO_PROMPT,
    name: "Suggest Motion",
    prompt: PROMPTS.analysis.suggestVideo,
    attribute: JobAttribute.TEXT
});

export const createPromptGenerationJob = (config: any): Partial<Job> => {
    const prompt = fill(PROMPTS.analysis.universalPromptGenerator, {
        generator: config.generator,
        style: config.style,
        backgroundMode: config.backgroundMode,
        clothingMode: config.clothingMode,
        explicitMode: config.explicitMode,
        armpitHair: config.armpitHair,
        pubicHair: config.pubicHair
    });
    
    return {
        type: JobType.GENERATE_STABLE_DIFFUSION_PROMPT,
        name: "Prompt Engineer",
        prompt,
        attribute: JobAttribute.JSON
    };
};

export const createExtractAttributeJob = (type: JobType): Partial<Job> => {
    let name = "Extract Data";
    let prompt = "";
    
    switch (type) {
        case JobType.EXTRACT_POSE: name = "Extract Pose"; prompt = PROMPTS.analysis.extractPose; break;
        case JobType.EXTRACT_CLOTHES: name = "Extract Clothes"; prompt = fill(PROMPTS.analysis.analyzeClothing, {}); break;
        case JobType.EXTRACT_HAIR: name = "Extract Hair"; prompt = PROMPTS.analysis.extractHair; break;
        case JobType.EXTRACT_HEAD: name = "Extract Head"; prompt = PROMPTS.analysis.extractHead; break;
    }

    return { type, name, prompt, attribute: JobAttribute.JSON };
};

export const createDescribePartyJob = (partyMembers: PartyMemberConfig[]): Partial<Job> => {
    const partyDescription = partyMembers.map((p, i) => 
        `${i + 1}. [${p.gender}] [${p.species}] [${p.class}] (${p.wealth})`
    ).join('\n');

    return {
        type: JobType.DESCRIBE_PARTY,
        name: "Analyze Party",
        prompt: fill(PROMPTS.analysis.describeParty, { partyList: partyDescription }),
        attribute: JobAttribute.MARKDOWN
    };
};
