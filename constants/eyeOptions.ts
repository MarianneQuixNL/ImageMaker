
import { EYE_TREE } from '../Eyes/eyeRegistry';

export const EYE_OPTIONS: any = EYE_TREE;
export const EYE_COLORS: string[] = [];

const flattenDeep = (obj: any): string[] => {
    if (Array.isArray(obj)) return obj;
    return Object.values(obj).flatMap(v => flattenDeep(v));
};

export const updateEyeDerived = () => {
    if (EYE_OPTIONS.Color) {
        EYE_COLORS.length = 0;
        EYE_COLORS.push(...flattenDeep(EYE_OPTIONS.Color).sort());
    }
};
