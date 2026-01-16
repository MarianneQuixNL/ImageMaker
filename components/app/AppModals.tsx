import React, { useState } from 'react';
import { ModalState } from '../../hooks/useModalState';
import { HistoryItem, Job, JobType } from '../../types';
import { jobService } from '../../services/jobService';
import * as JobDef from '../../jobs/definitions';
import * as Actions from '../../services/jobActions';

// Import All Modals
import { JobDetailsModal } from '../JobDetailsModal';
import { ConfigurationModal } from '../ConfigurationModal';
import { ConsoleModal } from '../ConsoleModal';
import { CombineImagesModal } from '../CombineImagesModal';
import { PoseSelectionModal } from '../PoseSelectionModal';
import { RotationModal } from '../RotationModal';
import { BackgroundSelectionModal, TraitSelections } from '../BackgroundSelectionModal';
import { ClothingSelectionModal } from '../ClothingSelectionModal';
import { SmartClothesModal } from '../SmartClothesModal';
import { SpeciesSelectionModal } from '../SpeciesSelectionModal';
import { PersonSelectionModal } from '../PersonSelectionModal';
import { ExtractPersonsModal } from '../ExtractPersonsModal';
import { ImageCropModal } from '../ImageCropModal';
import { HairSelectionModal } from '../HairSelectionModal';
import { LightingSelectionModal } from '../LightingSelectionModal';
import { CustomPromptModal } from '../CustomPromptModal';
import { AgeSelectionModal } from '../AgeSelectionModal';
import { DrawModal } from '../DrawModal';
import { TopicSelectionModal } from '../TopicSelectionModal';
import { SmartEyesModal } from '../SmartEyesModal';
import { SmartTransparencyModal } from '../SmartTransparencyModal';
import { SmartDamageModal } from '../SmartDamageModal';
import { SmartShoesModal } from '../SmartShoesModal';
import { SmartChainsModal } from '../SmartChainsModal';
import { SmartSelectionModal } from '../SmartSelectionModal';
import { PortraitModal } from '../PortraitModal';
import { ComicGenModal } from '../ComicGenModal';
import { VideoGenerationModal } from '../VideoGenerationModal';
import { GeneratePromptModal } from '../GeneratePromptModal';
import { SmartPartnerModal } from '../SmartPartnerModal';
import { SmartAspectRatioModal } from '../SmartAspectRatioModal';
import { SmartFillModal } from '../SmartFillModal';
import { SmartUndressModal } from '../SmartUndressModal';
import { SmartProsthesisModal } from '../SmartProsthesisModal';
import { PromptResultModal } from '../PromptResultModal';
import { LightboxModal } from '../LightboxModal';
import { ConfirmationModal } from '../ConfirmationModal';
import { ImageMarkerModal } from '../ImageMarkerModal';
import { GenerateImageModal } from '../GenerateImageModal';
import { MarkdownViewerModal } from '../MarkdownViewerModal';
import { SectionEditorModal } from '../SectionEditorModal';
import { PromptEditDialog } from '../PromptEditDialog';
import { StoryConfigurationModal } from '../StoryConfigurationModal';

// Constants
import { SKIN_OPTIONS } from '../../constants/skinOptions';
import { BODY_SHAPE_CATEGORIES } from '../../constants/bodyShapeOptions';
import { CONTRAST_CATEGORIES } from '../../constants/contrastOptions';
import { PORTRAIT_EXPRESSIONS } from '../../constants/portraitOptions';
import { STYLE_OPTIONS } from '../../constants/transformationOptions';
import { ANIMAL_OPTIONS, PLANT_OPTIONS, OBJECT_OPTIONS, STRUCTURE_OPTIONS } from '../../constants/smartElementOptions';
import { User, Fingerprint, Palette, Smile, Dog, Flower, Box, Home } from 'lucide-react';

interface AppModalsProps {
    modals: ModalState;
    toggle: (key: keyof ModalState, val: boolean) => void;
    liveSelectedJob: Job | null;
    setSelectedJob: (j: Job | null) => void;
    liveSelectedImage: HistoryItem | null;
    history: HistoryItem[];
    jobs: Job[];
    selectedPersonIndex: number;
    promptResultEvent: any;
    markdownEvent: any;
    lightboxData: { url: string, videoUrl?: string, title: string } | null;
    setLightboxData: (data: any) => void;
    confirmModal: any;
    setConfirmModal: (data: any) => void;
    editingSection: any;
    setEditingSection: (data: any) => void;
    reportContent: string | null;
    reportTitle: string;
    setReportContent: (c: string | null) => void;
}

const generateCombinations = (data: TraitSelections) => {
    const keys = Object.keys(data) as Array<keyof TraitSelections>;
    const entries = keys.map(key => ({ key, values: data[key].length > 0 ? data[key] : ["As-is"] }));
    return entries.reduce((acc, curr) => {
        const newAcc: Array<Record<keyof TraraitSelections, string>> = [];
        if (acc.length === 0) return curr.values.map(v => ({ [curr.key]: v } as any));
        acc.forEach(existing => {
            curr.values.forEach(v => {
                newAcc.push({ ...existing, [curr.key]: v });
            });
        });
        return newAcc;
    }, [] as Array<Record<keyof TraitSelections, string>>);
};

export const AppModals: React.FC<AppModalsProps> = ({
    modals, toggle, liveSelectedJob, setSelectedJob, liveSelectedImage, history, jobs, selectedPersonIndex,
    promptResultEvent, markdownEvent, lightboxData, setLightboxData, confirmModal, setConfirmModal, editingSection, setEditingSection,
    reportContent, reportTitle, setReportContent
}) => {
    
    const [editPromptState, setEditPromptState] = useState<{
        isOpen: boolean;
        prompt: string;
        onConfirm: (newPrompt: string) => void;
    }>({ isOpen: false, prompt: "", onConfirm: () => {} });

    const handleEditPrompt = (jobDef: Partial<Job>, imageId?: string) => {
        if (!jobDef.prompt || !jobDef.type) return; // Ensure type is defined
        setEditPromptState({
            isOpen: true,
            prompt: jobDef.prompt,
            onConfirm: (newPrompt) => {
                const updatedJob = { ...jobDef, prompt: newPrompt };
                // FIX: Use the public createJob method instead of a private/internal one.
                jobService.createJob(updatedJob.type!, imageId!, updatedJob);
            }
        });
    };

    return (
        <>
            {liveSelectedJob && (
                <JobDetailsModal 
                    job={liveSelectedJob} 
                    onClose={() => setSelectedJob(null)} 
                    onRetry={() => jobService.retryJob(liveSelectedJob)}
                    onCancel={() => jobService.cancelJob(liveSelectedJob)}
                    onDelete={() => { jobService.deleteJob(liveSelectedJob.id); setSelectedJob(null); }}
                    onPromote={() => jobService.promoteJob(liveSelectedJob)}
                />
            )}
            
            <ConfigurationModal isOpen={modals.config} onClose={() => toggle('config', false)} />
            <ConsoleModal isOpen={modals.console} onClose={() => toggle('console', false)} />
            
            <CombineImagesModal 
                isOpen={modals.combine} 
                onClose={() => toggle('combine', false)} 
                history={history} 
                jobs={jobs} 
                onCombine={(ids, bgId, ratio, instr) => Actions.createCombineJob(ids, bgId, ratio, instr)} 
                onEditPrompt={(ids, bgId, ratio, instr) => handleEditPrompt(JobDef.createCombineJob(ids, bgId, ratio, instr), undefined)}
            />
            
            {liveSelectedImage && (
                <>
                    <PoseSelectionModal 
                        isOpen={modals.pose} 
                        onClose={() => toggle('pose', false)} 
                        onSelectPose={(poses, keepBg, ar) => poses.forEach(pose => Actions.createPoseJob(liveSelectedImage!, pose, keepBg, ar))} 
                        onEditPrompt={(poses, keepBg, ar) => { if(poses.length > 0) handleEditPrompt(JobDef.createPoseJob(liveSelectedImage!, poses[0], keepBg, ar), liveSelectedImage!.id); }}
                    />
                    <RotationModal 
                        isOpen={modals.rotation} 
                        onClose={() => toggle('rotation', false)} 
                        image={liveSelectedImage} 
                        onRotate={(y, p, k) => Actions.createRotationJob(liveSelectedImage!, y, p, k)} 
                        onEditPrompt={(y, p, k) => handleEditPrompt(JobDef.createRotationJob(liveSelectedImage!, y, p, k), liveSelectedImage!.id)}
                    />
                    <SmartClothesModal 
                        isOpen={modals.smartClothes} 
                        onClose={() => toggle('smartClothes', false)} 
                        image={liveSelectedImage} 
                        onConfirm={(config, ar) => Actions.createSmartClothesJob(liveSelectedImage!, config, ar)} 
                        onEditPrompt={(config, ar) => handleEditPrompt(JobDef.createSmartClothesJob(liveSelectedImage!, config, ar), liveSelectedImage!.id)}
                    />
                    <PersonSelectionModal isOpen={modals.personSelect} onClose={() => toggle('personSelect', false)} image={liveSelectedImage} onExtract={(boxes) => Actions.runManualExtraction(liveSelectedImage!, boxes)} />
                    <ExtractPersonsModal isOpen={modals.extract} onClose={() => toggle('extract', false)} image={liveSelectedImage} onExtract={(indices, keepBg) => { indices.forEach(idx => { const p = liveSelectedImage!.peopleDetection?.people[idx]; if (p) Actions.extractSpecificPerson(liveSelectedImage!.id, p, keepBg); }); }} />
                    <ImageCropModal isOpen={modals.crop} onClose={() => toggle('crop', false)} image={liveSelectedImage} onCrop={(box) => Actions.createManualCropJob(liveSelectedImage!, box)} />
                    <DrawModal isOpen={modals.draw} onClose={() => toggle('draw', false)} image={liveSelectedImage} onConfirm={(dataUrl, remove) => { if (remove) { Actions.handleDrawResult(liveSelectedImage!.id, dataUrl, true); Actions.createFixPersonJob(liveSelectedImage!); } else { Actions.handleDrawResult(liveSelectedImage!.id, dataUrl, false); } }} />
                    <PortraitModal 
                        isOpen={modals.portrait} 
                        onClose={() => toggle('portrait', false)} 
                        image={liveSelectedImage} 
                        onConfirm={(config) => Actions.createPortraitJob(liveSelectedImage!, config)} 
                        onEditPrompt={(config) => handleEditPrompt(JobDef.createPortraitJob(liveSelectedImage!, config), liveSelectedImage!.id)}
                    />
                    <ComicGenModal 
                        isOpen={modals.comic} 
                        onClose={() => toggle('comic', false)} 
                        image={liveSelectedImage} 
                        onConfirm={(config) => Actions.createComicJob(liveSelectedImage!, config)} 
                        onEditPrompt={(config) => handleEditPrompt(JobDef.createComicJob(liveSelectedImage!, config), liveSelectedImage!.id)}
                    />
                    <VideoGenerationModal 
                        isOpen={modals.video} 
                        onClose={() => toggle('video', false)} 
                        image={liveSelectedImage} 
                        onEditPrompt={(prompt, res, isVeo) => handleEditPrompt(JobDef.createVideoGenerationJob(prompt, res, isVeo), liveSelectedImage!.id)}
                    />
                    <GeneratePromptModal isOpen={modals.generatePrompt} onClose={() => toggle('generatePrompt', false)} image={liveSelectedImage} />
                    
                    <SmartPartnerModal 
                        isOpen={modals.smartPartner} 
                        onClose={() => toggle('smartPartner', false)} 
                        onConfirm={(config) => Actions.createSmartPartnerJob(liveSelectedImage!, config)} 
                        onEditPrompt={(config) => handleEditPrompt(JobDef.createSmartPartnerJob(liveSelectedImage!, config), liveSelectedImage!.id)}
                    />
                    <SmartAspectRatioModal 
                        isOpen={modals.smartAspectRatio} 
                        onClose={() => toggle('smartAspectRatio', false)} 
                        image={liveSelectedImage} 
                        onConfirm={(w, h, p) => Actions.createSmartAspectRatioJob(liveSelectedImage!, w, h, p)} 
                        onEditPrompt={(w, h, p) => { const job = JobDef.createSmartAspectRatioJob(liveSelectedImage!, w, h, p); if(job) handleEditPrompt(job, liveSelectedImage!.id); }}
                    />
                    
                    <SmartUndressModal 
                        isOpen={modals.smartUndress} 
                        onClose={() => toggle('smartUndress', false)} 
                        image={liveSelectedImage} 
                        onConfirm={(c) => Actions.createSmartUndressJob(liveSelectedImage!, c)} 
                        onEditPrompt={(c) => handleEditPrompt(JobDef.createSmartUndressJob(liveSelectedImage!, c), liveSelectedImage!.id)}
                    />
                    
                    <SmartProsthesisModal 
                        isOpen={modals.smartProsthesis} 
                        onClose={() => toggle('smartProsthesis', false)} 
                        onConfirm={(style, bodyParts) => Actions.createSmartProsthesisJob(liveSelectedImage!, style, bodyParts)} 
                        onEditPrompt={(style, bodyParts) => handleEditPrompt(JobDef.createSmartProsthesisJob(liveSelectedImage!, style, bodyParts), liveSelectedImage!.id)}
                    />
                    
                    <StoryConfigurationModal isOpen={modals.storyConfig} onClose={() => toggle('storyConfig', false)} image={liveSelectedImage} />
                </>
            )}

            <BackgroundSelectionModal 
                isOpen={modals.bgSelect} 
                onClose={() => toggle('bgSelect', false)} 
                history={history} 
                onSelectBackground={(data, isUploadIgnored, uploadIdIgnored, aspectRatio, barefoot) => {
                    if (!liveSelectedImage) return;
                    const combinations = generateCombinations(data);
                    combinations.forEach(combo => {
                        const bg = combo.World;
                        let currentIsUpload = false;
                        let currentUploadId = undefined;
                        if (bg.startsWith('__UPLOAD__')) { currentIsUpload = true; currentUploadId = bg.replace('__UPLOAD__', ''); }
                        const cleanBg = currentIsUpload ? "Keep Background" : bg; 
                        Actions.createChangeBackgroundJob(liveSelectedImage, cleanBg, currentIsUpload, currentUploadId, aspectRatio, combo.Pose, combo.Clothes, barefoot, combo.Lighting, combo.Species, combo['Body Shape'], combo.Skin, combo.Hair, combo.Eyes, combo.Expression, combo.Prosthesis, combo.Animals, combo.Plants, combo.Objects, combo.Structures);
                    });
                }}
                onEditPrompt={(data, aspectRatio, barefoot) => {
                    if (!liveSelectedImage) return;
                    const combinations = generateCombinations(data);
                    if (combinations.length === 1) {
                         const combo = combinations[0];
                         const bg = combo.World.startsWith('__UPLOAD__') ? "Keep Background" : combo.World;
                         handleEditPrompt(JobDef.createChangeBackgroundJob(liveSelectedImage, bg, false, undefined, aspectRatio, combo.Pose, combo.Clothes, barefoot, combo.Lighting, combo.Species, combo['Body Shape'], combo.Skin, combo.Hair, combo.Eyes, combo.Expression, combo.Prosthesis, combo.Animals, combo.Plants, combo.Objects, combo.Structures), liveSelectedImage.id);
                    }
                }}
            />
            <ClothingSelectionModal 
                isOpen={modals.clothingSelect} 
                onClose={() => toggle('clothingSelect', false)} 
                onSelectClothing={(c) => liveSelectedImage && Actions.createChangeClothesJob(liveSelectedImage!, c)} 
                onEditPrompt={(c) => { if (liveSelectedImage) handleEditPrompt({ type: JobType.CHANGE_CLOTHES, name: `Clothes: ${c}`, prompt: `Change clothing to: ${c}.` }, liveSelectedImage.id); }}
            />
            <SpeciesSelectionModal 
                isOpen={modals.speciesSelect} 
                onClose={() => toggle('speciesSelect', false)} 
                onSelectSpecies={(s, ar) => liveSelectedImage && Actions.createChangeSpeciesJob(liveSelectedImage!, s, ar)} 
                onEditPrompt={(s, ar) => liveSelectedImage && handleEditPrompt(JobDef.createChangeSpeciesJob(liveSelectedImage, s, ar), liveSelectedImage.id)}
            />
            <HairSelectionModal 
                isOpen={modals.hairSelect} 
                onClose={() => toggle('hairSelect', false)} 
                onSelectHair={(h, ar) => liveSelectedImage && Actions.createChangeHairJob(liveSelectedImage!, h, ar)} 
                onEditPrompt={(h, ar) => liveSelectedImage && handleEditPrompt(JobDef.createChangeHairJob(liveSelectedImage, h, ar), liveSelectedImage.id)}
            />
            <LightingSelectionModal 
                isOpen={modals.lightingSelect} 
                onClose={() => toggle('lightingSelect', false)} 
                onSelectLighting={(l, ar) => liveSelectedImage && Actions.createChangeLightingJob(liveSelectedImage!, l, ar)} 
                onEditPrompt={(l, ar) => liveSelectedImage && handleEditPrompt({ type: JobType.CHANGE_LIGHTING, name: `Light: ${l}`, prompt: `Change lighting to: ${l}.` }, liveSelectedImage.id)}
            />
            <CustomPromptModal isOpen={modals.customPrompt} onClose={() => toggle('customPrompt', false)} onSubmit={(p) => liveSelectedImage && Actions.createCustomPromptJob(liveSelectedImage!, p)} />
            <AgeSelectionModal 
                isOpen={modals.ageSelect} 
                onClose={() => toggle('ageSelect', false)} 
                onSelectAge={(age) => liveSelectedImage && Actions.createChangeAgeJob(liveSelectedImage!, age)} 
                onEditPrompt={(age) => liveSelectedImage && handleEditPrompt(JobDef.createChangeAgeJob(age), liveSelectedImage.id)}
            />
            <TopicSelectionModal 
                isOpen={modals.topic} 
                onClose={() => toggle('topic', false)} 
                onSelectTopics={(topics, cloth) => { topics.forEach(t => liveSelectedImage && Actions.createSmartTopicJob(liveSelectedImage!, t.name, cloth, t.description)); }} 
                onEditPrompt={(topics, cloth) => { if (topics.length > 0 && liveSelectedImage) { const t = topics[0]; handleEditPrompt(JobDef.createSmartTopicJob(liveSelectedImage, t.name, cloth, t.description), liveSelectedImage.id); } }}
            />
            <SmartEyesModal 
                isOpen={modals.smartEyes} 
                onClose={() => toggle('smartEyes', false)} 
                onConfirm={(prompt, ar) => liveSelectedImage && Actions.createSmartEyesJob(liveSelectedImage!, prompt, ar)} 
                onEditPrompt={(prompt, ar) => liveSelectedImage && handleEditPrompt(JobDef.createSmartEyesJob(prompt, ar), liveSelectedImage.id)}
            />
            <SmartTransparencyModal 
                isOpen={modals.smartTransparency} 
                onClose={() => toggle('smartTransparency', false)} 
                onConfirm={(method, intensity) => Actions.createSmartTransparencyJob(liveSelectedImage!, method, intensity)} 
                onEditPrompt={(method, intensity) => liveSelectedImage && handleEditPrompt(JobDef.createSmartTransparencyJob(liveSelectedImage, method, intensity), liveSelectedImage.id)}
            />
            <SmartDamageModal 
                isOpen={modals.smartDamage} 
                onClose={() => toggle('smartDamage', false)} 
                onConfirm={(clothingDamage, wounds, filth) => Actions.createSmartDamageJob(liveSelectedImage!, clothingDamage, wounds, filth)} 
                onEditPrompt={(cd, w, f) => liveSelectedImage && handleEditPrompt(JobDef.createSmartDamageJob(liveSelectedImage, cd, w, f), liveSelectedImage.id)}
            />
            <SmartShoesModal 
                isOpen={modals.smartShoes} 
                onClose={() => toggle('smartShoes', false)} 
                onConfirm={(shoeStyle, decorations, ankletType, ankletThickness) => Actions.createSmartShoesJob(liveSelectedImage!, shoeStyle, decorations, ankletType, ankletThickness)} 
                onEditPrompt={(ss, d, at, ath) => liveSelectedImage && handleEditPrompt(JobDef.createSmartShoesJob(liveSelectedImage, ss, d, at, ath), liveSelectedImage.id)}
            />
            <SmartChainsModal 
                isOpen={modals.smartChains} 
                onClose={() => toggle('smartChains', false)} 
                onConfirm={(material, bodyParts) => Actions.createSmartChainsJob(liveSelectedImage!, material, bodyParts)} 
                onEditPrompt={(m, bp) => liveSelectedImage && handleEditPrompt(JobDef.createSmartChainsJob(liveSelectedImage, m, bp), liveSelectedImage.id)}
            />
            <SmartFillModal 
                isOpen={modals.smartFill} 
                onClose={() => toggle('smartFill', false)} 
                onConfirm={(m, h) => Actions.createSmartFillJob(liveSelectedImage!, m, h)} 
                onEditPrompt={(m, h) => liveSelectedImage && handleEditPrompt(JobDef.createSmartFillJob(liveSelectedImage, m, h), liveSelectedImage.id)}
            />

            <SmartSelectionModal isOpen={modals.smartSkin} onClose={() => toggle('smartSkin', false)} title="Smart Skin" icon={Fingerprint} treeData={SKIN_OPTIONS} onConfirm={(val) => liveSelectedImage && Actions.createSmartSkinJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createSmartSkinJob(val), liveSelectedImage.id)} />
            <SmartSelectionModal isOpen={modals.smartBodyShape} onClose={() => toggle('smartBodyShape', false)} title="Smart Body Shape" icon={User} treeData={BODY_SHAPE_CATEGORIES} onConfirm={(val) => liveSelectedImage && Actions.createSmartBodyShapeJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createSmartBodyShapeJob(liveSelectedImage, val), liveSelectedImage.id)} />
            <SmartSelectionModal isOpen={modals.smartContrast} onClose={() => toggle('smartContrast', false)} title="Smart Contrast" icon={Palette} treeData={CONTRAST_CATEGORIES} onConfirm={(val) => liveSelectedImage && Actions.createSmartContrastJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createSmartContrastJob(val), liveSelectedImage.id)} />
            <SmartSelectionModal isOpen={modals.expression} onClose={() => toggle('expression', false)} title="Smart Expression" icon={Smile} treeData={PORTRAIT_EXPRESSIONS} onConfirm={(val) => liveSelectedImage && Actions.createChangeExpressionJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createChangeExpressionJob(liveSelectedImage, val), liveSelectedImage.id)} />
            <SmartSelectionModal isOpen={modals.style} onClose={() => toggle('style', false)} title="Smart Style" icon={Palette} treeData={{ "Art Styles": STYLE_OPTIONS }} onConfirm={(val) => liveSelectedImage && Actions.createChangeStyleJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createChangeStyleJob(liveSelectedImage, val), liveSelectedImage.id)} />
            
            <SmartSelectionModal isOpen={modals.smartAnimals} onClose={() => toggle('smartAnimals', false)} title="Smart Animals" icon={Dog} treeData={ANIMAL_OPTIONS} onConfirm={(val) => liveSelectedImage && Actions.createSmartAnimalsJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createSmartAnimalsJob(liveSelectedImage, val), liveSelectedImage.id)} />
            <SmartSelectionModal isOpen={modals.smartPlants} onClose={() => toggle('smartPlants', false)} title="Smart Plants" icon={Flower} treeData={PLANT_OPTIONS} onConfirm={(val) => liveSelectedImage && Actions.createSmartPlantsJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createSmartPlantsJob(liveSelectedImage, val), liveSelectedImage.id)} />
            <SmartSelectionModal isOpen={modals.smartObjects} onClose={() => toggle('smartObjects', false)} title="Smart Objects" icon={Box} treeData={OBJECT_OPTIONS} onConfirm={(val) => liveSelectedImage && Actions.createSmartObjectsJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createSmartObjectsJob(liveSelectedImage, val), liveSelectedImage.id)} />
            <SmartSelectionModal isOpen={modals.smartStructures} onClose={() => toggle('smartStructures', false)} title="Smart Structures" icon={Home} treeData={STRUCTURE_OPTIONS} onConfirm={(val) => liveSelectedImage && Actions.createSmartStructuresJob(liveSelectedImage!, val)} multiSelect={true} onEditPrompt={(val) => liveSelectedImage && handleEditPrompt(JobDef.createSmartStructuresJob(liveSelectedImage, val), liveSelectedImage.id)} />

            <ImageMarkerModal isOpen={modals.cloudBrowser} onClose={() => toggle('cloudBrowser', false)} />
            <GenerateImageModal isOpen={modals.generateImage} onClose={() => toggle('generateImage', false)} />

            <PromptEditDialog 
                isOpen={editPromptState.isOpen}
                onClose={() => setEditPromptState(prev => ({...prev, isOpen: false}))}
                originalPrompt={editPromptState.prompt}
                onConfirm={editPromptState.onConfirm}
            />

            {promptResultEvent && <PromptResultModal isOpen={!!promptResultEvent} onClose={() => jobService.clearPromptResultEvent()} data={promptResultEvent} />}
            {lightboxData && <LightboxModal imageUrl={lightboxData.url} videoUrl={lightboxData.videoUrl} title={lightboxData.title} onClose={() => setLightboxData(null)} />}
            {confirmModal && <ConfirmationModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal(null)} onConfirm={confirmModal.onConfirm} title={confirmModal.title} message={confirmModal.message} confirmLabel={confirmModal.confirmLabel} isDanger={confirmModal.isDanger} />}
            <MarkdownViewerModal isOpen={!!reportContent} onClose={() => { setReportContent(null); jobService.clearMarkdownEvent(); }} content={reportContent || ""} title={reportTitle} />
            
            {editingSection && (
                <SectionEditorModal 
                    isOpen={!!editingSection} 
                    onClose={() => setEditingSection(null)} 
                    title={editingSection.title} 
                    data={editingSection.data} 
                    onSave={(newData) => {
                        if (liveSelectedImage && selectedPersonIndex !== undefined) {
                            jobService.updatePersonDetails(liveSelectedImage.id, selectedPersonIndex, { [editingSection.key]: newData });
                        }
                    }}
                />
            )}
        </>
    );
};