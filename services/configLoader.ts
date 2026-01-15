

import { topicService } from './topicService';
import { nameService } from './nameService';
import { updateClothingDerived } from '../constants/clothingOptions';
import { updateEyeDerived } from '../constants/eyeOptions';
import { updateHairDerived } from '../constants/hairOptions';
import { updateDerivedTransformationOptions } from '../constants/transformationOptions';

export const loadConfigurations = async (onStatus?: (msg: string) => void) => {
    const report = (msg: string) => {
        if (onStatus) onStatus(msg);
        console.log(`[ConfigLoader] ${msg}`);
    };

    report("Initializing remote services...");

    // Create promises that update status on completion
    const topicsPromise = topicService.loadTopics()
        .then(() => report("Topic ontology loaded"));
        
    const namesPromise = nameService.loadNames()
        .then(() => report("Name registry loaded"));

    // Wait for all remote data
    await Promise.all([topicsPromise, namesPromise]);

    report("Building configuration trees...");
    
    // Ensure derived values are initialized from the loaded data
    updateClothingDerived();
    updateEyeDerived();
    updateHairDerived();
    updateDerivedTransformationOptions();
    
    report("Optimizing assets...");
    await new Promise(r => setTimeout(r, 500)); // Short artificial delay for UX smoothness
    
    report("Ready");
};