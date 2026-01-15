
import { WORLD_TREE } from '../Worlds/worldRegistry';

// We now derive the BACKGROUND_CATEGORIES from our structured TS files
// This maintains compatibility with the ConfigModal and other consumers
// while using the new structure for the Smart World modal.
export const BACKGROUND_CATEGORIES: any = WORLD_TREE;
