
export enum LogType {
  INFO = 'INFO',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  ERROR = 'ERROR'
}

export enum LogSource {
  SYSTEM = 'System',
  GEMINI = 'Gemini',
  IMAGEN = 'Imagen',
  VEO = 'Veo'
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  message: string;
  type: LogType;
  source: LogSource;
  details?: string;
}

export interface SDResult {
  positive: string;
  negative: string;
}

export enum ModelType {
  GEMINI_FLASH = 'gemini-2.5-flash-image',
  GEMINI_PRO = 'gemini-3-pro-image-preview',
  IMAGEN = 'imagen-4.0-generate-001',
  VEO_FAST = 'veo-3.1-fast-generate-preview',
  VEO_PRO = 'veo-3.1-generate-preview'
}

export enum JobStatus {
  WAITING = 'Waiting',
  RUNNING = 'Running',
  FINISHED = 'Finished',
  FAILED = 'Failed',
  DEAD = 'Dead',
  CANCELLED = 'Cancelled'
}

export enum JobAttribute {
    DATA = 'Data', // Generates data inherited by other jobs
    IMAGE = 'Image', // Generates images, adds to workspace, auto-download
    VIDEO = 'Video', // Generates video, auto-download, no workspace
    MARKDOWN = 'Full Markdown', // Generates .md, auto-download, opens dialog
    JSON = 'JSON', // Character sheet data, internal use, no download
    TEXT = 'Text' // Plain text, download if > 100 words
}

export enum JobType {
  SAFETY_CHECK = 'Safety Check',
  DETECT_STYLE = 'Detect Style',
  COUNT_PEOPLE = 'Count People',
  GENERATE_FILENAME = 'Generate Filename',
  DESCRIBE_IMAGE = 'Describe Image',
  FULL_VISION_ANALYSIS = 'Vision Analysis',
  GENERATE_STORY = 'Generate Story',
  GENERATE_PERSONA = 'Generate Persona',
  EXTRACT_PERSONS = 'Extract Persons',
  TRANSFORM_IMAGE = 'Transform Image',
  SAVE_CROP = 'Save Crop',
  COMBINE_IMAGES = 'Combine Images',
  GENERIC_GENERATE = 'Generate Image',
  GENERATE_IMAGE = 'Generate Image',
  MIRROR_IMAGE = 'Mirror Image',
  SOURCE_IMAGE = 'Source Image',
  MODIFY_POSE = 'Modify Pose',
  SMART_POSE = 'Smart Pose',
  ROTATE_SUBJECT = 'Rotate Subject',
  SMART_ROTATE = 'Smart Rotate',
  SMART_ASPECT_RATIO = 'Smart Aspect Ratio',
  EXTRACT_BACKGROUND = 'Extract Background', 
  EXTRACT_BACKGROUND_DATA = 'Save Background Data', 
  CHANGE_BACKGROUND = 'Change Background',
  APPLY_BACKGROUND_DATA = 'Load Background Data',
  CHANGE_CLOTHES = 'Change Clothes',
  SMART_CLOTHES = 'Smart Clothes',
  CHANGE_SPECIES = 'Change Species',
  CHANGE_HAIR = 'Change Hair',
  CHANGE_LIGHTING = 'Change Lighting',
  SMART_LIGHTING = 'Smart Lighting',
  CHANGE_AGE = 'Change Age',
  CUSTOM_PROMPT = 'Custom Prompt',
  FULL_BODY = 'Full Body',
  UPSCALE = 'Upscale Image',
  SMART_CROP = 'Smart Crop (Zoom)',
  GENERATE_STABLE_DIFFUSION_PROMPT = 'Generate Prompt',
  BARE_ALL = 'Bare All',
  EXTRACT_POSE = 'Save Pose',
  APPLY_POSE = 'Apply Pose',
  EXTRACT_CLOTHES = 'Save Clothes',
  APPLY_CLOTHES = 'Apply Clothes',
  EXTRACT_HAIR = 'Save Hair',
  APPLY_HAIR = 'Apply Hair',
  EXTRACT_HEAD = 'Save Head',
  APPLY_HEAD = 'Apply Head',
  EXTRACT_PERSON_DATA = 'Save Person Body',
  APPLY_PERSON_DATA = 'Apply Person Body',
  GENERATE_VIDEO = 'Generate Video',
  SUGGEST_VIDEO_PROMPT = 'Suggest Video Prompt',
  REMOVE_ARTIFACTS = 'Remove Artifacts',
  APPLY_CLOTHES_DATA = 'Apply Clothes Data',
  APPLY_POSE_DATA = 'Apply Pose Data',
  APPLY_HAIR_DATA = 'Apply Hair Data',
  APPLY_HEAD_DATA = 'Apply Head Data',
  APPLY_PERSON_DATA_OBJ = 'Apply Person Data',
  SMART_PERSONS = 'Smart Persons',
  SMART_CONTRAST = 'Smart Contrast',
  SMART_CLEANUP = 'Smart Cleanup',
  SMART_SPECIES = 'Smart Species',
  SMART_SKIN = 'Smart Skin',
  SMART_HAIR = 'Smart Hair',
  SMART_PHOTO = 'Smart Photo',
  SMART_ENGRAVE = 'Smart Engrave',
  SMART_EYES = 'Smart Eyes',
  SMART_TRANSPARENCY = 'Smart Transparency',
  SMART_BODYSHAPE = 'Smart Body Shape',
  GENERATE_PORTRAIT = 'Generate Portrait',
  CHANGE_EXPRESSION = 'Change Expression',
  SMART_TOPIC = 'Smart Topic',
  SMART_FULL_BODY_ZOOM = 'Smart Full Body',
  MAKE_DECENT = 'Make Decent',
  
  // Extended types
  GENERATE_TEMPLATE_PERSON = 'Generate Template',
  COMBINE_CHARACTER_SHEET = 'Character Sheet',
  ANALYZE_PHYSICAL = 'Physical Analysis',
  ANALYZE_MENTAL = 'Mental Analysis',
  ANALYZE_SPIRITUAL = 'Spiritual Analysis',
  ANALYZE_POSSESSIONS = 'Possessions Analysis',
  GENERATE_PERSON_BACKSTORY = 'Backstory Generation',
  ANALYZE_RPG_STATS = 'RPG Stats',
  ANALYZE_SKILLS = 'Skills Analysis',
  ANALYZE_SOCIAL = 'Social Analysis',
  GENERATE_COMIC = 'Generate Comic',
  SMART_DAMAGE = 'Smart Damage',
  SMART_SHOES = 'Smart Shoes',
  SMART_CHAINS = 'Smart Chains',
  CHANGE_STYLE = 'Change Style',
  SMART_PARTNER = 'Smart Partner',
  SMART_UNDRESS = 'Smart Undress',
  SMART_FILL = 'Smart Fill',
  SMART_STRIP_POKER = 'Strip Poker',
  CLEAR_AUDIENCE = 'Clear Audience',
  SMART_UPSCALE = 'Smart Upscale',
  SMART_TEXT_REMOVAL = 'Text Removal',
  SMART_MIRROR = 'Smart Mirror',
  GENERATE_TITLE = 'Generate Title',
  SMART_BARE = 'Smart Bare',
  SMART_FIX_ANATOMY = 'Fix Anatomy',
  SMART_COMPLETE_BODY = 'Complete Body',
  EXPLAIN_FAILURES = 'Explain Failures',
  DESCRIBE_PARTY = 'Describe Party',
  GENERATE_CHARACTER_SHEET_TEMPLATE = 'Sheet Template',
  BARE_BASE = 'Bare Base',
  FIX_CLOTHES = 'Fix Clothes',
  SMART_PROSTHESIS = 'Smart Prosthesis',
  SMART_EQUIPMENT = 'Smart Equipment',
  EXPAND_SCENE = 'Expand Scene',
  SMART_ANIMALS = 'Smart Animals',
  SMART_PLANTS = 'Smart Plants',
  SMART_OBJECTS = 'Smart Objects',
  SMART_STRUCTURES = 'Smart Structures',
}

export interface RPGStats {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
}

export interface SocialRelations {
    family: string[];
    friends: string[];
    enemies: string[];
}

export interface SkillEntry {
    name: string;
    attribute: string;
    level: number;
}

export interface CharacterPhysical {
    height_build: string;
    hair: string;
    eyes: string;
    skin: string;
    distinctive_features: string[];
    clothing_style: string;
}

export interface CharacterMental {
    personality_archetype: string;
    emotional_state: string;
    social_alignment: string;
    advantages: string[];
    disadvantages: string[];
    quirks: string[];
}

export interface CharacterSpiritual {
    belief_system: string;
    karma: string;
    spirit_animal_totem: string;
    soul_description: string;
}

export interface CharacterBackstory {
    origin_place: string;
    key_life_event: string;
    current_motivation: string;
    secret: string;
    short_biography: string;
}

export interface CharacterPossessions {
    equipped_items: string[];
    carried_inventory: string[];
}

export interface Person {
    description: string;
    box_2d: number[];
    age: number;
    gender: 'Male' | 'Female' | 'Unknown';
    name: string;
    rpgStats?: RPGStats;
    social?: SocialRelations;
    skills?: SkillEntry[];
    physicalAttributes?: CharacterPhysical;
    mentalAttributes?: CharacterMental;
    spiritualAttributes?: CharacterSpiritual;
    backstory?: CharacterBackstory;
    possessions?: CharacterPossessions;
}

export interface PartyMemberConfig {
    gender: string;
    species: string;
    class: string;
    wealth: string;
}

export interface TransformationPart {
    option?: string;
    base?: 'default' | 'clothe' | 'strip';
    accessories?: string[];
}

export interface Transformation {
    id: string;
    name: string;
    enabled: boolean;
    applyToStyle: string[];
    outputStyle: string[];
    parts: Record<string, TransformationPart>;
    fullBody: {
        clothingItems: string[];
        clothingStyle: string;
    };
    background: {
        mode: string;
        prompt?: string;
    };
    quality?: string;
    aspectRatio?: string;
    isRandom?: boolean;
    setting?: string;
    cameraPosition?: string;
    weather?: string;
    mood?: string;
    species?: string;
    gender?: string;
    hairStyle?: string;
    hairColor?: string;
    skinColor?: string;
    eyeColor?: string;
    timeOfDay?: string;
    transparency?: string;
    extraEffects?: string[];
    restraints?: string[];
    animal?: string;
    objectItem?: string;
}

export interface Job {
    id: string;
    type: JobType;
    status: JobStatus;
    name?: string;
    prompt?: string;
    createdAt: Date;
    startedAt?: Date;
    completedAt?: Date;
    imageId?: string; 
    result?: any;
    error?: string;
    retryCount: number;
    attribute?: JobAttribute;
    metadata?: any;
    dependencies?: string[];
    hidden?: boolean;
    priority?: number;
    debug?: any;
}

export interface HistoryItem {
    id: string;
    url: string;
    title: string;
    source: 'uploaded' | 'generated';
    origin: string;
    timestamp: Date;
    fileDetails?: { size: number; type: string };
    jobIds: string[];
    peopleDetection?: { count: number; people: Person[] };
    detectedStyle?: string;
    folderPath?: string;
    filenameGenerated?: boolean;
    videoUrl?: string;
    parentId?: string;
    baseFilename?: string;
    isBackground?: boolean;
    isTemplate?: boolean;
    hidden?: boolean;
    originJobName?: string;
    isLocked?: boolean;
}
