
import { Natural } from './Nodes/natural';
import { Artificial } from './Nodes/artificial';
import { ArtisticStylized } from './Nodes/artistic';
import { ShadowsFixes } from './Nodes/shadows';
import { BrightnessMood } from './Nodes/brightness';
import { Cinematic } from './Nodes/cinematic';
import { MagicalFantasy } from './Nodes/magical';

export const LIGHTING_TREE = {
    "Natural": Natural,
    "Artificial": Artificial,
    "Cinematic & Studio": Cinematic,
    "Magical & Fantasy": MagicalFantasy,
    "Artistic & Stylized": ArtisticStylized,
    "Shadows & Fixes": ShadowsFixes,
    "Brightness/Mood": BrightnessMood
};
