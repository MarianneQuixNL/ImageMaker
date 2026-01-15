
import { HistoryItem, Job } from '../types';
import { logger } from './loggerService';
import { LogType } from '../types';

const DB_NAME = 'ImageMakerDB';
const DB_VERSION = 3; // Version bump for schema changes (dropped tables conceptually)
const STORE_CONFIG = 'config';

class StorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => {
        logger.log("Failed to open IndexedDB", LogType.ERROR, request.error?.message);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // We only care about config now
        if (!db.objectStoreNames.contains(STORE_CONFIG)) {
            db.createObjectStore(STORE_CONFIG, { keyPath: 'key' });
        }
      };
    });

    return this.initPromise;
  }

  // --- PERSISTENCE REMOVED FOR HISTORY AND JOBS AS REQUESTED ---
  // The interface methods remain but do nothing or return empty, to avoid breaking calls in JobService before cleanup.
  // In a full refactor, we would remove these methods entirely, but to minimize diff size and ensure stability,
  // we stub them out to perform in-memory operations in JobService only.

  async saveHistoryItem(item: HistoryItem): Promise<void> {
    return Promise.resolve();
  }

  async getHistory(): Promise<HistoryItem[]> {
    return Promise.resolve([]); // Always return empty on load
  }
  
  async deleteHistoryItem(id: string): Promise<void> {
    return Promise.resolve();
  }

  async saveJob(job: Job): Promise<void> {
    return Promise.resolve();
  }

  async getJobs(): Promise<Job[]> {
    return Promise.resolve([]); // Always return empty on load
  }

  async deleteJob(id: string): Promise<void> {
    return Promise.resolve();
  }

  // --- CONFIG REMAINS PERSISTENT ---

  async saveConfig(config: any): Promise<void> {
      await this.init();
      return new Promise((resolve, reject) => {
          if (!this.db) return reject("DB not initialized");
          const tx = this.db.transaction(STORE_CONFIG, 'readwrite');
          const store = tx.objectStore(STORE_CONFIG);
          const request = store.put({ key: 'main', value: config });
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
      });
  }

  async getConfig(): Promise<any> {
      await this.init();
      return new Promise((resolve, reject) => {
          if (!this.db) return reject("DB not initialized");
          const tx = this.db.transaction(STORE_CONFIG, 'readonly');
          const store = tx.objectStore(STORE_CONFIG);
          const request = store.get('main');
          request.onsuccess = () => resolve(request.result?.value);
          request.onerror = () => reject(request.error);
      });
  }

  async clearAll(): Promise<void> {
      // Logic handled in App/JobService memory now. 
      // This function technically clears DB, but DB is empty of jobs/history now.
      return Promise.resolve();
  }
}

export const storageService = new StorageService();
