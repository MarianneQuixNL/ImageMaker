
import { useState } from 'react';

export interface ModalState {
    config: boolean;
    console: boolean;
    combine: boolean;
    pose: boolean;
    rotation: boolean;
    bgSelect: boolean;
    clothingSelect: boolean;
    smartClothes: boolean;
    speciesSelect: boolean;
    personSelect: boolean;
    extract: boolean;
    crop: boolean;
    hairSelect: boolean;
    lightingSelect: boolean;
    customPrompt: boolean;
    ageSelect: boolean;
    draw: boolean;
    cloudBrowser: boolean;
    generateImage: boolean;
    smartEyes: boolean;
    smartTransparency: boolean;
    smartDamage: boolean;
    smartShoes: boolean;
    smartChains: boolean;
    smartBodyShape: boolean;
    smartSkin: boolean;
    smartContrast: boolean;
    portrait: boolean;
    topic: boolean;
    comic: boolean;
    video: boolean;
    expression: boolean;
    style: boolean;
    generatePrompt: boolean;
    smartPartner: boolean;
    smartAspectRatio: boolean;
    smartFill: boolean;
    smartUndress: boolean;
    lightbox: boolean;
    markdownViewer: boolean;
    smartProsthesis: boolean;
    smartAnimals: boolean;
    smartPlants: boolean;
    smartObjects: boolean;
    smartStructures: boolean;
    storyConfig: boolean;
}

export const useModalState = () => {
    const [modals, setModals] = useState<ModalState>({
        config: false, console: false, combine: false, pose: false, rotation: false, bgSelect: false,
        clothingSelect: false, smartClothes: false, speciesSelect: false, personSelect: false, extract: false,
        crop: false, hairSelect: false, lightingSelect: false, customPrompt: false, ageSelect: false, draw: false,
        cloudBrowser: false, generateImage: false, smartEyes: false, smartTransparency: false, smartDamage: false,
        smartShoes: false, smartChains: false, smartBodyShape: false, smartSkin: false, smartContrast: false,
        portrait: false, topic: false, comic: false, video: false, expression: false, style: false,
        generatePrompt: false, smartPartner: false, smartAspectRatio: false, smartFill: false, smartUndress: false,
        lightbox: false, markdownViewer: false, smartProsthesis: false,
        smartAnimals: false, smartPlants: false, smartObjects: false, smartStructures: false,
        storyConfig: false
    });

    // Helper to toggle a specific modal
    const toggle = (key: keyof ModalState, value?: boolean) => {
        setModals(prev => ({ ...prev, [key]: value !== undefined ? value : !prev[key] }));
    };

    return { modals, toggle };
};
