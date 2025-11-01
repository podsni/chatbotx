// Unified AI API service - supports multiple providers (Poe, Together, Groq)

import { poeApi, PoeMessage } from "./poeApi";
import { togetherApi, TogetherMessage } from "./togetherApi";
import { groqApi, GroqMessage } from "./groqApi";

export type Provider = "poe" | "together" | "groq";

export interface UnifiedMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

export interface UnifiedRequestOptions {
    provider: Provider;
    model: string;
    messages: UnifiedMessage[];
    temperature?: number;
    max_tokens?: number;
}

export interface ModelInfo {
    id: string;
    name: string;
    provider: Provider;
    description: string;
    speed: "Fast" | "Balanced" | "Slow";
    quality: "High" | "Medium" | "Low";
    features: string[];
    icon: string;
    color: string;
}

// All available models across providers
export const ALL_MODELS: Record<string, ModelInfo> = {
    // Poe Models
    "poe:GPT-5-mini": {
        id: "GPT-5-mini",
        name: "GPT-5-mini",
        provider: "poe",
        description: "Balanced performance with high-quality responses. Perfect for most tasks.",
        speed: "Balanced",
        quality: "High",
        features: ["Advanced reasoning", "Long context", "Code generation", "Multi-language", "Complex tasks"],
        icon: "Bot",
        color: "from-blue-500 to-purple-500",
    },
    "poe:GPT-5-nano": {
        id: "GPT-5-nano",
        name: "GPT-5-nano",
        provider: "poe",
        description: "Ultra-fast responses for quick queries. Optimized for speed.",
        speed: "Fast",
        quality: "Medium",
        features: ["Lightning fast", "Low latency", "Quick answers", "Simple tasks", "Chat optimized"],
        icon: "Zap",
        color: "from-green-500 to-teal-500",
    },
    // Together AI Models
    "together:openai/gpt-oss-20b": {
        id: "openai/gpt-oss-20b",
        name: "GPT-OSS-20B",
        provider: "together",
        description: "Open source GPT model with 20B parameters. Great for general tasks.",
        speed: "Balanced",
        quality: "High",
        features: ["Open source", "20B parameters", "General purpose", "Code capable", "Fast inference"],
        icon: "Brain",
        color: "from-orange-500 to-red-500",
    },
    "together:Qwen/Qwen3-Next-80B-A3B-Instruct": {
        id: "Qwen/Qwen3-Next-80B-A3B-Instruct",
        name: "Qwen3-Next-80B",
        provider: "together",
        description: "Powerful 80B model from Alibaba. Excellent for complex reasoning.",
        speed: "Slow",
        quality: "High",
        features: ["80B parameters", "Advanced reasoning", "Multi-lingual", "Long context", "High quality"],
        icon: "Sparkles",
        color: "from-purple-500 to-pink-500",
    },
    "together:meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8": {
        id: "meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8",
        name: "Llama-4-Maverick-17B",
        provider: "together",
        description: "Meta's Llama 4 variant. Optimized for instruction following.",
        speed: "Fast",
        quality: "High",
        features: ["Meta Llama 4", "17B parameters", "FP8 optimized", "Fast inference", "Instruction tuned"],
        icon: "Flame",
        color: "from-yellow-500 to-orange-500",
    },
    "together:zai-org/GLM-4.5-Air-FP8": {
        id: "zai-org/GLM-4.5-Air-FP8",
        name: "GLM-4.5-Air",
        provider: "together",
        description: "Lightweight GLM model. Fast and efficient for most tasks.",
        speed: "Fast",
        quality: "Medium",
        features: ["Lightweight", "FP8 optimized", "Fast responses", "Efficient", "General purpose"],
        icon: "Wind",
        color: "from-cyan-500 to-blue-500",
    },
    // Groq Models (Updated with correct models)
    "groq:openai/gpt-oss-20b": {
        id: "openai/gpt-oss-20b",
        name: "GPT-OSS-20B",
        provider: "groq",
        description: "Open source GPT 20B on Groq. Ultra-fast inference.",
        speed: "Fast",
        quality: "High",
        features: ["20B parameters", "Groq LPU", "Fast inference", "Open source", "General purpose"],
        icon: "Rocket",
        color: "from-blue-500 to-indigo-500",
    },
    "groq:groq/compound": {
        id: "groq/compound",
        name: "Groq-Compound",
        provider: "groq",
        description: "Groq's compound model. Optimized for performance.",
        speed: "Fast",
        quality: "High",
        features: ["Groq optimized", "Compound architecture", "High throughput", "Low latency", "Versatile"],
        icon: "Zap",
        color: "from-yellow-500 to-orange-600",
    },
    "groq:llama-3.1-8b-instant": {
        id: "llama-3.1-8b-instant",
        name: "Llama-3.1-8B-Instant",
        provider: "groq",
        description: "Meta's Llama 3.1 8B. Lightning-fast instant responses on Groq LPU.",
        speed: "Fast",
        quality: "High",
        features: ["Instant responses", "8B parameters", "Groq LPU", "Low latency", "High quality"],
        icon: "Zap",
        color: "from-green-500 to-teal-500",
    },
    "groq:openai/gpt-oss-120b": {
        id: "openai/gpt-oss-120b",
        name: "GPT-OSS-120B",
        provider: "groq",
        description: "Large 120B model on Groq. Best for complex reasoning.",
        speed: "Balanced",
        quality: "High",
        features: ["120B parameters", "Complex reasoning", "Groq LPU", "High accuracy", "Advanced tasks"],
        icon: "Brain",
        color: "from-purple-500 to-pink-600",
    },
    "groq:moonshotai/kimi-k2-instruct-0905": {
        id: "moonshotai/kimi-k2-instruct-0905",
        name: "Kimi-K2-Instruct",
        provider: "groq",
        description: "Moonshot AI's Kimi K2 on Groq. Instruction-tuned for precision.",
        speed: "Balanced",
        quality: "High",
        features: ["Instruction tuned", "High precision", "Groq LPU", "Multi-lingual", "Reliable"],
        icon: "Sparkles",
        color: "from-teal-500 to-cyan-500",
    },
};

class UnifiedAiService {
    async sendMessage(
        options: UnifiedRequestOptions,
        onChunk: (chunk: string) => void,
        onComplete: () => void,
        onError: (error: Error) => void,
    ): Promise<void> {
        const { provider, model, messages, temperature, max_tokens } = options;

        if (provider === "poe") {
            const poeMessages: PoeMessage[] = messages.map((m) => ({
                role: m.role === "assistant" ? "assistant" : m.role,
                content: m.content,
            }));

            await poeApi.sendMessageStream(
                { model, messages: poeMessages, temperature, max_tokens },
                onChunk,
                onComplete,
                onError,
            );
        } else if (provider === "together") {
            const togetherMessages: TogetherMessage[] = messages.map((m) => ({
                role: m.role === "assistant" ? "assistant" : m.role,
                content: m.content,
            }));

            await togetherApi.sendMessageStream(
                { model, messages: togetherMessages, temperature, max_tokens },
                onChunk,
                onComplete,
                onError,
            );
        } else if (provider === "groq") {
            const groqMessages: GroqMessage[] = messages.map((m) => ({
                role: m.role === "assistant" ? "assistant" : m.role,
                content: m.content,
            }));

            await groqApi.sendMessageStream(
                { model, messages: groqMessages, temperature, max_completion_tokens: max_tokens },
                onChunk,
                onComplete,
                onError,
            );
        } else {
            onError(new Error(`Unsupported provider: ${provider}`));
        }
    }

    getAllModels(): ModelInfo[] {
        return Object.values(ALL_MODELS);
    }

    getModelsByProvider(provider: Provider): ModelInfo[] {
        return Object.values(ALL_MODELS).filter((m) => m.provider === provider);
    }

    getModelInfo(provider: Provider, modelId: string): ModelInfo | undefined {
        return ALL_MODELS[`${provider}:${modelId}`];
    }

    isProviderConfigured(provider: Provider): boolean {
        if (provider === "poe") {
            return poeApi.isConfigured();
        } else if (provider === "together") {
            return togetherApi.isConfigured();
        } else if (provider === "groq") {
            const configured = groqApi.isConfigured();
            console.log("🔍 Groq provider check:", configured);
            return configured;
        }
        return false;
    }

    getAvailableProviders(): Provider[] {
        const providers: Provider[] = [];
        if (poeApi.isConfigured()) providers.push("poe");
        if (togetherApi.isConfigured()) providers.push("together");
        if (groqApi.isConfigured()) {
            console.log("✅ Adding Groq to available providers");
            providers.push("groq");
        }
        console.log("📋 Final available providers:", providers);
        return providers;
    }
}

// Export singleton instance
export const aiApi = new UnifiedAiService();
