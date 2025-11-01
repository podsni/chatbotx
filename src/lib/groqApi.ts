// Groq API service for chat completions

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export interface GroqMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface GroqRequestOptions {
    model: string;
    messages: GroqMessage[];
    temperature?: number;
    max_completion_tokens?: number;
    stream?: boolean;
}

export interface GroqResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        message: {
            role: string;
            content: string;
        };
        finish_reason: string;
    }[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

export const GROQ_MODELS = {
    "llama-3.1-8b-instant": "Llama-3.1-8B",
    "mixtral-8x7b-32768": "Mixtral-8x7B",
    "gemma2-9b-it": "Gemma2-9B",
} as const;

export type GroqModelType = keyof typeof GROQ_MODELS;

class GroqApiService {
    private apiKey: string;
    private apiUrl: string;

    constructor() {
        this.apiKey = GROQ_API_KEY || "";
        this.apiUrl = GROQ_API_URL;
    }

    async sendMessage(options: GroqRequestOptions): Promise<GroqResponse> {
        if (!this.apiKey) {
            throw new Error(
                "Groq API key is not configured. Please set VITE_GROQ_API_KEY in .env file",
            );
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: options.model,
                    messages: options.messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_completion_tokens || 8192,
                    stream: options.stream || false,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    `Groq API error: ${response.status} ${response.statusText}. ${
                        errorData.error?.message || ""
                    }`,
                );
            }

            const data: GroqResponse = await response.json();
            return data;
        } catch (error) {
            console.error("Error calling Groq API:", error);
            throw error;
        }
    }

    async sendMessageStream(
        options: GroqRequestOptions,
        onChunk: (chunk: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void,
    ): Promise<void> {
        if (!this.apiKey) {
            throw new Error(
                "Groq API key is not configured. Please set VITE_GROQ_API_KEY in .env file",
            );
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify({
                    model: options.model,
                    messages: options.messages,
                    temperature: options.temperature || 0.7,
                    max_tokens: options.max_completion_tokens || 8192,
                    stream: true,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error