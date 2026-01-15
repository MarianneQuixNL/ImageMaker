
import { Color } from './Nodes/color';
import { ShapeSize } from './Nodes/shapeSize';
import { PupilIris } from './Nodes/pupilIris';
import { Eyewear } from './Nodes/eyewear';
import { StatusInjury } from './Nodes/status';
import { EyeMakeup } from './Nodes/makeup';
import { EyeEffects } from './Nodes/effects';
import { AnimalisticEyes } from './Nodes/animalistic';
import { FantasyEyes } from './Nodes/fantasy_types';
import { BlindnessStatus } from './Nodes/blindness';
import { Mutations } from './Nodes/mutations';

export const EYE_TREE = {
    "Color": Color,
    "Shape & Size": ShapeSize,
    "Pupil & Iris": PupilIris,
    "Mutations & Multiplicity": Mutations,
    "Animalistic": AnimalisticEyes,
    "Fantasy & Tech": FantasyEyes,
    "Blindness & Status": BlindnessStatus,
    "Eyewear": Eyewear,
    "Makeup & Lashes": EyeMakeup,
    "Effects": EyeEffects,
    "Injury & Damage": StatusInjury
};
