// IndexedDB service for session management

const DB_NAME = "ChatBotDB";
const DB_VERSION = 1;
const SESSIONS_STORE = "sessions";
const MESSAGES_STORE = "messages";

export interface Session {
    id: string;
    title: string;
    timestamp: number;
    modelName: string;
    lastMessage?: string;
}

export interface Message {
    id: string;
    sessionId: string;
    role: "user" | "ai";
    content: string;
    timestamp: number;
    modelName?: string;
    metadata?: {
        duration?: string;
        ttft?: string;
        tokens?: string;
        speed?: string;
    };
}

class ChatDB {
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

                // Create sessions store
                if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
                    const sessionsStore = db.createObjectStore(SESSIONS_STORE, {
                        keyPath: "id",
                    });
                    sessionsStore.createIndex("timestamp", "timestamp", {
                        unique: false,
                    });
                }

                // Create messages store
                if (!db.objectStoreNames.contains(MESSAGES_STORE)) {
                    const messagesStore = db.createObjectStore(MESSAGES_STORE, {
                        keyPath: "id",
                    });
                    messagesStore.createIndex("sessionId", "sessionId", {
                        unique: false,
                    });
                    messagesStore.createIndex("timestamp", "timestamp", {
                        unique: false,
                    });
                }
            };
        });
    }

    // Session operations
    async createSession(session: Session): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [SESSIONS_STORE],
                "readwrite",
            );
            const store = transaction.objectStore(SESSIONS_STORE);
            const request = store.add(session);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getAllSessions(): Promise<Session[]> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [SESSIONS_STORE],
                "readonly",
            );
            const store = transaction.objectStore(SESSIONS_STORE);
            const index = store.index("timestamp");
            const request = index.openCursor(null, "prev"); // Descending order

            const sessions: Session[] = [];
            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    sessions.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(sessions);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getSession(id: string): Promise<Session | undefined> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [SESSIONS_STORE],
                "readonly",
            );
            const store = transaction.objectStore(SESSIONS_STORE);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateSession(session: Session): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [SESSIONS_STORE],
                "readwrite",
            );
            const store = transaction.objectStore(SESSIONS_STORE);
            const request = store.put(session);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async deleteSession(id: string): Promise<void> {
        if (!this.db) await this.init();

        // Delete all messages for this session first
        await this.deleteMessagesBySession(id);

        // Then delete the session
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [SESSIONS_STORE],
                "readwrite",
            );
            const store = transaction.objectStore(SESSIONS_STORE);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Message operations
    async addMessage(message: Message): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [MESSAGES_STORE],
                "readwrite",
            );
            const store = transaction.objectStore(MESSAGES_STORE);
            const request = store.add(message);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getMessagesBySession(sessionId: string): Promise<Message[]> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [MESSAGES_STORE],
                "readonly",
            );
            const store = transaction.objectStore(MESSAGES_STORE);
            const index = store.index("sessionId");
            const request = index.getAll(sessionId);

            request.onsuccess = () => {
                const messages = request.result;
                // Sort by timestamp
                messages.sort((a, b) => a.timestamp - b.timestamp);
                resolve(messages);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteMessagesBySession(sessionId: string): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [MESSAGES_STORE],
                "readwrite",
            );
            const store = transaction.objectStore(MESSAGES_STORE);
            const index = store.index("sessionId");
            const request = index.openCursor(IDBKeyRange.only(sessionId));

            request.onsuccess = (event) => {
                const cursor = (event.target as IDBRequest).result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async clearAllData(): Promise<void> {
        if (!this.db) await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(
                [SESSIONS_STORE, MESSAGES_STORE],
                "readwrite",
            );

            const sessionsStore = transaction.objectStore(SESSIONS_STORE);
            const messagesStore = transaction.objectStore(MESSAGES_STORE);

            const clearSessions = sessionsStore.clear();
            const clearMessages = messagesStore.clear();

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Export singleton instance
export const chatDB = new ChatDB();
