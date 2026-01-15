
import { logger } from './loggerService';
import { LogType, LogSource } from '../types';

const BASE_URL = 'https://imagemarker.katje.org';

class NameService {
    private usedNames: Set<string> = new Set();

    public async loadNames() {
        try {
            const response = await fetch(`${BASE_URL}/Data/Names`, {
                method: 'GET',
                headers: { 'accept': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const names = await response.json();
            if (Array.isArray(names)) {
                this.usedNames = new Set(names.map((n: string) => n.toLowerCase()));
                logger.log(`Loaded ${this.usedNames.size} used names from registry`, LogType.INFO, undefined, LogSource.SYSTEM);
            }
        } catch (error) {
            logger.log("Failed to load used names registry", LogType.WARNING, String(error), LogSource.SYSTEM);
        }
    }

    public isNameUsed(name: string): boolean {
        if (!name) return false;
        return this.usedNames.has(name.trim().toLowerCase());
    }

    public getUsedNames(): string[] {
        return Array.from(this.usedNames);
    }

    public async registerName(firstName: string, lastName: string) {
        // Register First, Last, and Full as per instructions
        const namesToRegister = [
            firstName, 
            lastName, 
            `${firstName} ${lastName}`
        ].filter(n => n && n.trim().length > 0);
        
        // Optimistically add to local set to prevent immediate reuse
        namesToRegister.forEach(n => this.usedNames.add(n.toLowerCase()));

        // Send to API individually
        for (const name of namesToRegister) {
            try {
                await fetch(`${BASE_URL}/Data/Names`, {
                    method: 'POST',
                    headers: { 
                        'accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify([name])
                });
            } catch (error) {
                logger.log(`Failed to register name: ${name}`, LogType.WARNING, String(error), LogSource.SYSTEM);
            }
        }
        logger.log(`Registered new identity: ${firstName} ${lastName}`, LogType.INFO, undefined, LogSource.SYSTEM);
    }
}

export const nameService = new NameService();
