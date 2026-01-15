
import { HistoryItem } from '../types';
import { PROMPTS, fill } from '../constants/prompts';

export const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

export const getGenderConstraint = (item: HistoryItem): string => {
    const people = item.peopleDetection?.people || [];
    if (people.length === 0) return "";
    const desc = people.map((p, i) => `Person ${i+1}: ${p.gender || 'Unknown'}`).join(', ');
    return fill(PROMPTS.common.genderConstraint, { genderList: desc });
};

export const getMainPersonName = (item?: HistoryItem | null): string | null => {
    if (!item || !item.peopleDetection?.people.length) return null;
    return item.peopleDetection.people[0].name || null;
};
