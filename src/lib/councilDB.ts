/**
 * COUNCIL-HADES: Session Database
 * IndexedDB for persisting Council sessions
 */

import { CouncilSession, SavedCouncilSession } from './councilTypes';

const DB_NAME = 'council_hades_db';
const DB_VERSION = 1;
const STORE_NAME = 'council_sessions';

class CouncilDatabase {
    private db: IDBDatabase | null = null;

    /**
     * Initialize the database
     */
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Failed to open Council database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Council database initialized successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;

                // Create object store if it doesn't exist
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'session.id',
                    });

                    // Create indexes
                    store.createIndex('savedAt', 'savedAt', { unique: false });
                    store.createIndex('mode', 'session.mode', { unique: false });
                    store.createIndex('status', 'session.status', { unique: false });
                }
            };
        });
    }

    /**
     * Save a Council session
     */
    async saveSession(session: CouncilSession, title?: string): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const preview = session.question.substring(0, 100);
            const savedSession: SavedCouncilSession = {
                session,
                savedAt: Date.now(),
                title: title || `Session ${new Date().toLocaleString()}`,
                preview,
            };

            const request = store.put(savedSession);

            request.onsuccess = () => {
                console.log('Council session saved:', session.id);
                resolve();
            };

            request.onerror = () => {
                console.error('Failed to save session:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Load a Council session by ID
     */
    async loadSession(sessionId: string): Promise<CouncilSession | null> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(sessionId);

            request.onsuccess = () => {
                const savedSession = request.result as SavedCouncilSession | undefined;
                resolve(savedSession?.session || null);
            };

            request.onerror = () => {
                console.error('Failed to load session:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get all saved sessions
     */
    async getAllSessions(): Promise<SavedCouncilSession[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const sessions = request.result as SavedCouncilSession[];
                // Sort by savedAt descending (newest first)
                sessions.sort((a, b) => b.savedAt - a.savedAt);
                resolve(sessions);
            };

            request.onerror = () => {
                console.error('Failed to get all sessions:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Delete a session by ID
     */
    async deleteSession(sessionId: string): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(sessionId);

            request.onsuccess = () => {
                console.log('Council session deleted:', sessionId);
                resolve();
            };

            request.onerror = () => {
                console.error('Failed to delete session:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Delete all sessions
     */
    async deleteAllSessions(): Promise<void> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('All Council sessions deleted');
                resolve();
            };

            request.onerror = () => {
                console.error('Failed to delete all sessions:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get sessions by status
     */
    async getSessionsByStatus(status: 'running' | 'paused' | 'completed' | 'error'): Promise<SavedCouncilSession[]> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('status');
            const request = index.getAll(status);

            request.onsuccess = () => {
                const sessions = request.result as SavedCouncilSession[];
                sessions.sort((a, b) => b.savedAt - a.savedAt);
                resolve(sessions);
            };

            request.onerror = () => {
                console.error('Failed to get sessions by status:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Update session status
     */
    async updateSessionStatus(
        sessionId: string,
        status: 'running' | 'paused' | 'completed' | 'error'
    ): Promise<void> {
        const savedSession = await this.loadSessionData(sessionId);
        if (!savedSession) {
            throw new Error('Session not found');
        }

        savedSession.session.status = status;
        await this.saveSession(savedSession.session, savedSession.title);
    }

    /**
     * Load full saved session data (including metadata)
     */
    private async loadSessionData(sessionId: string): Promise<SavedCouncilSession | null> {
        if (!this.db) {
            await this.init();
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(sessionId);

            request.onsuccess = () => {
                resolve(request.result || null);
            };

            request.onerror = () => {
                console.error('Failed to load session data:', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * Get incomplete sessions (running or paused)
     */
    async getIncompleteSessions(): Promise<SavedCouncilSession[]> {
        const allSessions = await this.getAllSessions();
        return allSessions.filter(
            s => s.session.status === 'running' || s.session.status === 'paused'
        );
    }

    /**
     * Estimate database size
     */
    async estimateSize(): Promise<{ usage: number; quota: number }> {
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage || 0,
                quota: estimate.quota || 0,
            };
        }
        return { usage: 0, quota: 0 };
    }
}

// Export singleton instance
export const councilDB = new CouncilDatabase();
