// Offline storage utilities for caching lesson data and progress
const DB_NAME = 'PixelKingdomOffline';
const DB_VERSION = 1;

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

class OfflineStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('progress')) {
          db.createObjectStore('progress', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const store = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
          store.createIndex('timestamp', 'timestamp');
        }
      };
    });
  }

  async cacheLesson(lesson: any): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('lessons', 'readwrite');
    await tx.objectStore('lessons').put(lesson);
  }

  async getLesson(id: string): Promise<any> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('lessons', 'readonly');
    return tx.objectStore('lessons').get(id);
  }

  async saveProgress(progress: any): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('progress', 'readwrite');
    await tx.objectStore('progress').put(progress);
  }

  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('syncQueue', 'readwrite');
    await tx.objectStore('syncQueue').add({
      ...action,
      timestamp: Date.now()
    });
  }

  async getSyncQueue(): Promise<OfflineAction[]> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('syncQueue', 'readonly');
    return tx.objectStore('syncQueue').getAll();
  }

  async clearSyncQueue(): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('syncQueue', 'readwrite');
    await tx.objectStore('syncQueue').clear();
  }
}

export const offlineStorage = new OfflineStorage();
