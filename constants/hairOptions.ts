
import { HAIR_TREE } from '../Hairs/hairRegistry';

export const HAIR_CATEGORIES: any = HAIR_TREE;
export const HAIR_COLORS: string[] = [];

const flattenDeep = (obj: any): string[] => {
    if (Array.isArray(obj)) return obj;
    return Object.values(obj).flatMap(v => flattenDeep(v));
};

export const updateHairDerived = () => {
    if (HAIR_CATEGORIES.Color) {
        HAIR_COLORS.length = 0;
        HAIR_COLORS.push(...flattenDeep(HAIR_CATEGORIES.Color).sort());
    }
}
