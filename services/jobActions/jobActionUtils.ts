import { jobService } from '../jobService';
import { HistoryItem } from '../../types';

export const applyToTargets = (singleTarget: HistoryItem, action: (item: HistoryItem) => void) => {
    const { useSelected, selectedItems, history } = jobService.getSnapshot();
    if (useSelected && selectedItems.size > 0) {
        selectedItems.forEach(id => {
            const item = history.find(h => h.id === id);
            if (item) action(item);
        });
    } else {
        action(singleTarget);
    }
};
