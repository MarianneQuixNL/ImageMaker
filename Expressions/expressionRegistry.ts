
import { PositiveEmotions } from './Nodes/positive';
import { NegativeEmotions } from './Nodes/negative';
import { NeutralComplex } from './Nodes/neutral';
import { ComplexEmotions } from './Nodes/complex';
import { MicroExpressions } from './Nodes/micro';
import { RomanticExpressions } from './Nodes/romantic';
import { PainExpressions } from './Nodes/pain';
import { MadnessExpressions } from './Nodes/madness';

export const EXPRESSION_TREE = {
    "Positive Emotions": PositiveEmotions,
    "Negative Emotions": NegativeEmotions,
    "Romantic & Flirty": RomanticExpressions,
    "Pain & Suffering": PainExpressions,
    "Madness & Horror": MadnessExpressions,
    "Neutral & Complex": NeutralComplex,
    "Deep & Complex": ComplexEmotions,
    "Micro Expressions": MicroExpressions
};
