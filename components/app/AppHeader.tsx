import React from 'react';
import { PanelLeft, Wand2, Key, AlertTriangle } from 'lucide-react';
import { MenuItemDef } from '../Header'; 
import { Header } from '../Header'; 
import { PROMPTS } from '../../constants/prompts';
import { 
    Upload, Cloud, Download, FileText, Settings, Terminal, ShieldCheck, Eye, ScanFace, AlertCircle, Heart, 
    RotateCw, User, UserPlus, Fingerprint, Smile, Activity, Gamepad2, Sword, 
    Footprints, Link, Layers, Ghost, Globe, Ratio, Palette, Camera, Pencil, Sparkles, Eraser, FlipHorizontal, 
    Droplets, Sun, ImagePlus, BoxSelect, Maximize2, UserMinus, Columns, BookOpen, BookOpenCheck, Video, LayoutTemplate, Book,
    Shirt, Scissors, Anchor, Users, MonitorPlay, Brush, Cpu, Dog, Flower, Box, Home
} from 'lucide-react';
import { jobService } from '../../services/jobService';
import { HistoryItem, Transformation } from '../../types';
import { MANUAL_MD, SYS_INSTRUCTIONS_MD, CODE_OVERVIEW_MD, PROMPT_OVERVIEW_MD } from '../../constants/documentation';

// Import new action creators
import * as Actions from '../../services/jobActions';

interface AppHeaderProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    apiKeySet: boolean;
    onApiKeySelect: () => void;
    freeTierMode: boolean;
    onToggleFreeTierMode: () => void;
    isQueuePaused: boolean;
    onResumeQueue: () => void;
    toggleModal: (key: string, val: boolean) => void;
    liveSelectedImage: HistoryItem | null;
    fileInputRef: React.RefObject<HTMLInputElement>;
    useSelected: boolean;
    autoRetry: boolean;
    autoAddToWorkspace: boolean;
    selectedPersonIndex: number;
    transformations: Transformation[];
}

export const AppHeader: React.FC<AppHeaderProps> = ({ 
    isSidebarOpen, toggleSidebar, apiKeySet, onApiKeySelect, freeTierMode, onToggleFreeTierMode, isQueuePaused, onResumeQueue,
    toggleModal, liveSelectedImage, fileInputRef, useSelected, autoRetry, autoAddToWorkspace, selectedPersonIndex, transformations
}) => {
    const hasImage = !!liveSelectedImage;

    const presetMenuItems: MenuItemDef[] = transformations
        .filter(t => t.enabled)
        .map(t => ({
            label: t.name,
            icon: Sparkles,
            action: () => liveSelectedImage && Actions.applyTransformation(liveSelectedImage, t),
            disabled: !hasImage
        }));

    const menuStructure: MenuItemDef[] = [
        {
            label: "File",
            submenu: [
                { label: "Open / Upload...", icon: Upload, action: () => fileInputRef.current?.click(), shortcut: "Ctrl+O" },
                { label: "Cloud Library", icon: Cloud, action: () => toggleModal('cloudBrowser', true) },
                { divider: true, label: "" },
                { label: "Settings", icon: Settings, action: () => toggleModal('config', true) },
                { label: "System Console", icon: Terminal, action: () => toggleModal('console', true) },
                { divider: true, label: "" },
                { label: "Use selected for Bulk", checked: useSelected, action: () => jobService.toggleUseSelected() },
                { label: "Auto-Retry Failures", checked: autoRetry, action: () => jobService.toggleAutoRetry() },
                { label: "Auto Add to Workspace", checked: autoAddToWorkspace, action: () => jobService.toggleAutoAddToWorkspace() },
            ]
        },
        {
            label: "Traits",
            action: () => toggleModal('bgSelect', true),
            disabled: !hasImage
        },
        {
            label: "Presets",
            submenu: presetMenuItems.length > 0 ? presetMenuItems : [{ label: "No presets loaded", disabled: true }]
        },
        {
            label: "Generate",
            submenu: [
                { label: "Generate New Image...", icon: ImagePlus, action: () => toggleModal('generateImage', true) },
                { label: "Video from Image...", icon: Video, action: () => toggleModal('video', true), disabled: !hasImage },
                { label: "Comic Strip...", icon: BookOpenCheck, action: () => toggleModal('comic', true), disabled: !hasImage },
                { label: "Portrait Studio...", icon: Camera, action: () => toggleModal('portrait', true), disabled: !hasImage },
                { label: "Generate Book Title", icon: Book, action: () => liveSelectedImage && Actions.createTitleJob(liveSelectedImage), disabled: !hasImage },
                { divider: true, label: "" },
                { label: "Generate Woman Template", icon: User, action: () => Actions.createTemplateJob('woman') },
                { label: "Generate Man Template", icon: User, action: () => Actions.createTemplateJob('man') }
            ]
        },
        {
            label: "Edit",
            submenu: [
                { 
                    label: "Scene & Elements", 
                    icon: Globe, 
                    submenu: [
                        { label: "Smart Fill (Flood)", icon: Droplets, action: () => toggleModal('smartFill', true), disabled: !hasImage },
                        { label: "Smart Animals", icon: Dog, action: () => toggleModal('smartAnimals', true), disabled: !hasImage },
                        { label: "Smart Plants", icon: Flower, action: () => toggleModal('smartPlants', true), disabled: !hasImage },
                        { label: "Smart Objects", icon: Box, action: () => toggleModal('smartObjects', true), disabled: !hasImage },
                        { label: "Smart Structures", icon: Home, action: () => toggleModal('smartStructures', true), disabled: !hasImage },
                        { label: "Smart Lighting", icon: Sun, action: () => toggleModal('lightingSelect', true), disabled: !hasImage },
                        { label: "Smart Contrast", icon: Palette, action: () => toggleModal('smartContrast', true), disabled: !hasImage },
                        { label: "Clear Audience", icon: UserMinus, action: () => liveSelectedImage && Actions.createClearAudienceJob(liveSelectedImage), disabled: !hasImage }
                    ]
                },
                {
                    label: "Subject Appearance",
                    icon: User,
                    submenu: [
                        { label: "Smart Pose", icon: User, action: () => toggleModal('pose', true), disabled: !hasImage },
                        { label: "Smart Rotate (3D)", icon: RotateCw, action: () => toggleModal('rotation', true), disabled: !hasImage },
                        { label: "Change Age", icon: UserPlus, action: () => toggleModal('ageSelect', true), disabled: !hasImage },
                        { label: "Change Species", icon: ScanFace, action: () => toggleModal('speciesSelect', true), disabled: !hasImage },
                        { label: "Body Shape", icon: User, action: () => toggleModal('smartBodyShape', true), disabled: !hasImage },
                        { label: "Skin Details", icon: Fingerprint, action: () => toggleModal('smartSkin', true), disabled: !hasImage }
                    ]
                },
                {
                    label: "Face & Expression",
                    icon: Smile,
                    submenu: [
                        { label: "Smart Expression", icon: Smile, action: () => toggleModal('expression', true), disabled: !hasImage },
                        { label: "Smart Eyes", icon: Eye, action: () => toggleModal('smartEyes', true), disabled: !hasImage },
                        { label: "Smart Hair", icon: Scissors, action: () => toggleModal('hairSelect', true), disabled: !hasImage }
                    ]
                },
                {
                    label: "Wardrobe",
                    icon: Shirt,
                    submenu: [
                        { label: "Smart Wardrobe", icon: Shirt, action: () => toggleModal('smartClothes', true), disabled: !hasImage },
                        { label: "Quick Change", icon: Shirt, action: () => toggleModal('clothingSelect', true), disabled: !hasImage },
                        { label: "Smart Shoes", icon: Footprints, action: () => toggleModal('smartShoes', true), disabled: !hasImage },
                        { label: "Fix Clothing", icon: Wand2, action: () => liveSelectedImage && Actions.createChangeClothesJob(liveSelectedImage, "Repair and fix clothing details"), disabled: !hasImage },
                        { label: "Reset to Bikini", icon: Anchor, action: () => liveSelectedImage && Actions.createBikiniResetJob(liveSelectedImage), disabled: !hasImage, danger: true }
                    ]
                },
                {
                    label: "Effects & Style",
                    icon: Sparkles,
                    submenu: [
                        { label: "Smart Prosthesis", icon: Cpu, action: () => toggleModal('smartProsthesis', true), disabled: !hasImage },
                        { label: "Change Art Style", icon: Palette, action: () => toggleModal('style', true), disabled: !hasImage },
                        { label: "Smart Transparency", icon: Layers, action: () => toggleModal('smartTransparency', true), disabled: !hasImage },
                        { label: "Smart Damage", icon: Sword, action: () => toggleModal('smartDamage', true), disabled: !hasImage },
                        { label: "Smart Chains", icon: Link, action: () => toggleModal('smartChains', true), disabled: !hasImage },
                        { label: "Smart Photo", icon: Camera, action: () => liveSelectedImage && Actions.createSmartPhotoJob(liveSelectedImage), disabled: !hasImage },
                        { label: "Smart Engrave", icon: Pencil, action: () => liveSelectedImage && Actions.createSmartEngraveJob(liveSelectedImage), disabled: !hasImage }
                    ]
                },
                {
                    label: "Modesty & Nudity",
                    icon: ShieldCheck,
                    submenu: [
                        { label: "Make Decent (Censor)", icon: ShieldCheck, action: () => liveSelectedImage && Actions.createMakeDecentJob(liveSelectedImage), disabled: !hasImage },
                        { label: "Smart Undress", icon: Ghost, action: () => toggleModal('smartUndress', true), disabled: !hasImage },
                        { label: "Smart Bare", icon: User, action: () => liveSelectedImage && Actions.createSmartBareJob(liveSelectedImage), disabled: !hasImage },
                        { label: "Smart Strip", icon: Ghost, action: () => liveSelectedImage && Actions.createSmartStripJob(liveSelectedImage), disabled: !hasImage },
                        { label: "Smart Strip Poker", icon: Gamepad2, action: () => liveSelectedImage && Actions.createSmartStripPokerJob(liveSelectedImage), disabled: !hasImage }
                    ]
                },
                {
                    label: "Correction",
                    icon: Wand2,
                    submenu: [
                        { label: "Fix Anatomy", icon: Activity, action: () => liveSelectedImage && Actions.createSmartFixAnatomyJob(liveSelectedImage), disabled: !hasImage },
                        { label: "Complete Body", icon: ScanFace, action: () => liveSelectedImage && Actions.createSmartCompleteBodyJob(liveSelectedImage), disabled: !hasImage },
                        { label: "Remove Artifacts", icon: Sparkles, action: () => liveSelectedImage && Actions.createSmartTextRemovalJob(liveSelectedImage), disabled: !hasImage },
                        { label: "Smart Mirror", icon: FlipHorizontal, action: () => liveSelectedImage && Actions.createSmartMirrorJob(liveSelectedImage), disabled: !hasImage }
                    ]
                }
            ]
        },
        {
            label: "Tools",
            submenu: [
                { label: "Crop Selection", icon: BoxSelect, action: () => toggleModal('crop', true), disabled: !hasImage },
                { label: "Draw / Paint", icon: Brush, action: () => toggleModal('draw', true), disabled: !hasImage },
                { label: "Combine Images", icon: Layers, action: () => toggleModal('combine', true) },
                { label: "Custom Prompt", icon: Terminal, action: () => toggleModal('customPrompt', true), disabled: !hasImage },
                { label: "Resize / Upscale", icon: Maximize2, action: () => liveSelectedImage && Actions.createUpscaleJob(liveSelectedImage), disabled: !hasImage },
                { label: "Smart Upscale", icon: Sparkles, action: () => liveSelectedImage && Actions.createSmartUpscaleJob(liveSelectedImage), disabled: !hasImage },
                { label: "Smart Aspect Ratio", icon: Ratio, action: () => toggleModal('smartAspectRatio', true), disabled: !hasImage },
                { label: "Add Partner", icon: UserPlus, action: () => toggleModal('smartPartner', true), disabled: !hasImage }
            ]
        },
        {
            label: "Analyze",
            submenu: [
                { label: "Describe Image", icon: FileText, action: () => liveSelectedImage && Actions.runDescribeImage(liveSelectedImage), disabled: !hasImage },
                { label: "Full Vision Report", icon: ScanFace, action: () => liveSelectedImage && Actions.runFullVisionAnalysis(liveSelectedImage), disabled: !hasImage },
                { label: "Detect Style", icon: Eye, action: () => liveSelectedImage && Actions.runDetectStyle(liveSelectedImage), disabled: !hasImage },
                { label: "Safety Check", icon: ShieldCheck, action: () => liveSelectedImage && Actions.runSafetyCheck(liveSelectedImage), disabled: !hasImage },
                { label: "Explain Failures", icon: AlertCircle, action: () => liveSelectedImage && Actions.runExplainFailures(liveSelectedImage), disabled: !hasImage },
                { divider: true, label: "" },
                { label: "Count People", icon: Users, action: () => liveSelectedImage && Actions.runCountPeople(liveSelectedImage), disabled: !hasImage },
                { label: "Extract Person", icon: User, action: () => toggleModal('extract', true), disabled: !hasImage },
                { label: "Generate Prompt", icon: Terminal, action: () => toggleModal('generatePrompt', true), disabled: !hasImage },
                { label: "Suggest Video Prompt", icon: MonitorPlay, action: () => liveSelectedImage && Actions.createSuggestVideoPromptJob(liveSelectedImage), disabled: !hasImage }
            ]
        },
        {
            label: "Lore",
            submenu: [
                { label: "Generate Persona", icon: Fingerprint, action: () => liveSelectedImage && Actions.runGeneratePersona(liveSelectedImage), disabled: !hasImage },
                { label: "Generate Story", icon: BookOpen, action: () => toggleModal('storyConfig', true), disabled: !hasImage },
                { label: "Character Sheet", icon: Columns, action: () => liveSelectedImage && Actions.createCharacterOverviewJob(liveSelectedImage), disabled: !hasImage },
                { label: "Character Sheet (Template)", icon: LayoutTemplate, action: () => liveSelectedImage && Actions.runCharacterSheetTemplate(liveSelectedImage), disabled: !hasImage },
                { label: "Bare Base", icon: User, action: () => liveSelectedImage && Actions.createBareBaseJob(liveSelectedImage), disabled: !hasImage },
                { label: "Apply Topic", icon: LayoutTemplate, action: () => toggleModal('topic', true), disabled: !hasImage }
            ]
        },
        {
            label: "Help",
            submenu: [
                { label: "System Instructions", icon: Terminal, action: () => jobService.triggerMarkdownViewer(SYS_INSTRUCTIONS_MD, "System Instructions") },
                { label: "User Manual", icon: Book, action: () => jobService.triggerMarkdownViewer(MANUAL_MD, "User Manual") },
                { label: "Code Overview", icon: FileText, action: () => jobService.triggerMarkdownViewer(CODE_OVERVIEW_MD, "Code Overview") },
                { label: "Prompt Strategy", icon: Sparkles, action: () => jobService.triggerMarkdownViewer(PROMPT_OVERVIEW_MD, "Prompt Strategy") }
            ]
        }
    ];

    return (
        <Header 
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            menuStructure={menuStructure}
            apiKeySet={apiKeySet}
            onApiKeySelect={onApiKeySelect}
            freeTierMode={freeTierMode}
            isQueuePaused={isQueuePaused}
            onResumeQueue={onResumeQueue}
            onToggleFreeTierMode={onToggleFreeTierMode}
        />
    );
};
