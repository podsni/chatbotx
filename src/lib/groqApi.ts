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
    "openai/gpt-oss-20b": "GPT-OSS-20B",
    "groq/compound": "Groq Compound",
    "openai/gpt-oss-120b": "GPT-OSS-120B",
    "moonshotai/kimi-k2-instruct-0905": "Kimi K2 Instruct",
} as const;

export type GroqModelType = keyof typeof GROQ_MODELS;

// Models that don't support reasoning_effort parameter
const NO_REASONING_MODELS = [
    "llama-3.1-8b-instant",
    "mixtral-8x7b-32768",
    "gemma2-9b-it",
    "groq/compound",
    "moonshotai/kimi-k2-instruct-0905",
];

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
            const requestBody: Record<string, unknown> = {
                model: options.model,
                messages: options.messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_completion_tokens || 8192,
                stream: options.stream || false,
            };

            // Only add reasoning_effort if model supports it
            if (!NO_REASONING_MODELS.includes(options.model)) {
                requestBody.reasoning_effort = "medium";
            }

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(requestBody),
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
            const requestBody: Record<string, unknown> = {
                model: options.model,
                messages: options.messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.max_completion_tokens || 8192,
                stream: true,
            };

            // Only add reasoning_effort if model supports it
            if (!NO_REASONING_MODELS.includes(options.model)) {
                requestBody.reasoning_effort = "medium";
            }

            const response = await fetch(this.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${this.apiKey}`,
                },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error = new Error(
                    `Groq API error: ${response.status} ${response.statusText}. ${
                        errorData.error?.message || ""
                    }`,
                );
                onError(error);
                return;
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("Response body is not readable");
            }

            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();

                if (done) {
                    onComplete();
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || trimmedLine === "data: [DONE]") {
                        continue;
                    }

                    if (trimmedLine.startsWith("data: ")) {
                        try {
                            const jsonStr = trimmedLine.slice(6);
                            const data = JSON.parse(jsonStr);

                            if (data.choices?.[0]?.delta?.content) {
                                onChunk(data.choices[0].delta.content);
                            }
                        } catch (error) {
                            console.error("Error parsing SSE data:", error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error in Groq stream:", error);
            onError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    isConfigured(): boolean {
        return !!this.apiKey;
    }
}

export const groqApi = new GroqApiService();
