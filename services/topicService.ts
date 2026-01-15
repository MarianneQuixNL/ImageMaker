
import { logger } from './loggerService';
import { LogType, LogSource } from '../types';

const BASE_URL = 'https://imagemarker.katje.org';

export interface DetailedTopicNode {
    name: string; // The Topic (Root) or Subtopic
    description?: string;
    children?: DetailedTopicNode[];
}

class TopicService {
    private simpleTopics: string[] = [];
    private detailedTopicsRaw: string[] = [];
    private detailedTopicsTree: DetailedTopicNode[] = [];

    public async loadTopics() {
        await Promise.all([
            this.fetchSimpleTopics(),
            this.fetchDetailedTopics()
        ]);
    }

    private async fetchSimpleTopics() {
        try {
            const response = await fetch(`${BASE_URL}/Data/Topics`, {
                method: 'GET',
                headers: { 'accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.simpleTopics = await response.json();
            logger.log(`Loaded ${this.simpleTopics.length} simple topics`, LogType.INFO, undefined, LogSource.SYSTEM);
        } catch (error) {
            logger.log("Failed to load simple topics", LogType.WARNING, String(error), LogSource.SYSTEM);
        }
    }

    private async fetchDetailedTopics() {
        try {
            const response = await fetch(`${BASE_URL}/Data/DetailedTopics`, {
                method: 'GET',
                headers: { 'accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            this.detailedTopicsRaw = await response.json();
            this.parseDetailedTopics();
            logger.log(`Loaded ${this.detailedTopicsRaw.length} detailed topic entries`, LogType.INFO, undefined, LogSource.SYSTEM);
        } catch (error) {
            logger.log("Failed to load detailed topics", LogType.WARNING, String(error), LogSource.SYSTEM);
        }
    }

    private parseDetailedTopics() {
        const treeMap = new Map<string, DetailedTopicNode>();

        this.detailedTopicsRaw.forEach(entry => {
            // Format: Topic|Subtopic|Description
            const parts = entry.split('|');
            if (parts.length < 3) return;

            const topicName = parts[0].trim();
            const subtopicName = parts[1].trim();
            const description = parts[2].trim();

            if (!treeMap.has(topicName)) {
                treeMap.set(topicName, {
                    name: topicName,
                    children: []
                });
            }

            const parent = treeMap.get(topicName)!;
            parent.children?.push({
                name: subtopicName,
                description: description
            });
        });

        this.detailedTopicsTree = Array.from(treeMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }

    public getSimpleTopics(): string[] {
        return this.simpleTopics;
    }

    public getDetailedTopicsTree(): DetailedTopicNode[] {
        return this.detailedTopicsTree;
    }
}

export const topicService = new TopicService();
