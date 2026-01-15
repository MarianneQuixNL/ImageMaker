
import { logger } from './loggerService';
import { LogType, LogSource } from '../types';

const BASE_URL = 'https://imagemarker.katje.org';

// Simple LRU-like cache for image blobs to speed up gallery browsing
// Caching blobs avoids repeated network requests and speeds up rendering significantly.
const blobCache = new Map<string, Blob>();
const MAX_CACHE_SIZE = 200; // Store up to ~16 pages of thumbnails

export const getImageFolders = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${BASE_URL}/Site/ImageFolders`, {
            method: 'GET',
            headers: { 'accept': 'application/json' }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        logger.log("Failed to fetch folders", LogType.ERROR, String(error), LogSource.SYSTEM);
        return [];
    }
};

export const getImagesInFolder = async (path: string): Promise<string[]> => {
    try {
        const formData = new FormData();
        formData.append('path', path);
        
        // The API returns simple filenames, not full paths, based on typical usage.
        const response = await fetch(`${BASE_URL}/Site/Images`, {
            method: 'POST',
            headers: { 'accept': 'application/json' },
            body: formData
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        logger.log("Failed to fetch images list", LogType.ERROR, String(error), LogSource.SYSTEM);
        return [];
    }
};

export const downloadImageBlob = async (fullPath: string): Promise<Blob | null> => {
    // Check cache first for instant load
    if (blobCache.has(fullPath)) {
        return blobCache.get(fullPath)!;
    }

    try {
        const formData = new FormData();
        formData.append('name', fullPath);
        
        const response = await fetch(`${BASE_URL}/Site/Image`, {
            method: 'POST',
            headers: { 'accept': 'application/octet-stream' },
            body: formData
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();

        // Cache Management: Maintain size limit to prevent memory bloat
        if (blobCache.size >= MAX_CACHE_SIZE) {
            // Remove the oldest inserted item (first key in iterator)
            const firstKey = blobCache.keys().next().value;
            if (firstKey) blobCache.delete(firstKey);
        }
        blobCache.set(fullPath, blob);

        return blob;
    } catch (error) {
        logger.log(`Failed to download image: ${fullPath}`, LogType.ERROR, String(error), LogSource.SYSTEM);
        return null;
    }
};
