
import { LogEntry, LogType, LogSource } from '../types';

type LogListener = () => void;

// Simple UUID generator to avoid circular dependency with jobService
const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

class LoggerService {
  private logs: LogEntry[] = [];
  private listeners: Set<LogListener> = new Set();

  public log(message: string, type: LogType = LogType.INFO, details?: string, source: LogSource = LogSource.SYSTEM) {
    const entry: LogEntry = {
      id: generateUUID(),
      timestamp: new Date(),
      message,
      type,
      source,
      details,
    };
    
    // Create new array reference for immutability
    this.logs = [entry, ...this.logs];
    this.notifyListeners();
    
    // Also log to browser console for debugging
    console.log(`[${source}] [${type}] ${message}`, details || '');
  }

  // Stable getter for useSyncExternalStore
  public getSnapshot = (): LogEntry[] => {
    return this.logs;
  }
  
  public getServerSnapshot = (): LogEntry[] => {
    return this.logs;
  }
  
  public subscribe = (listener: LogListener): () => void => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public clear() {
    this.logs = [];
    this.notifyListeners();
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

export const logger = new LoggerService();
