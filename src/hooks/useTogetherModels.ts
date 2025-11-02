import { useState, useEffect, useCallback } from "react";

const TOGETHER_CACHE_KEY = "together_chat_models_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export interface TogetherModelPricing {
    input: number; // per 1M tokens
    output: number; // per 1M tokens
    hourly: number;
}

export interface TogetherModel {
    id: string;
    display_name: string;
    organization: string;
    context_length: number;
    type: string;
    link: string;
    pricing: TogetherModelPricing;
    isFree: boolean;
}

interface CachedData {
    models: TogetherModel[];
    timestamp: number;
}

const isFreeModel = (model: TogetherModel): boolean => {
    const pricing = model.pricing || { input: 0, output: 0, hourly: 0 };
    return pricing.input === 0 && pricing.output === 0 && pricing.hourly === 0;
};

const fetchTogetherModels = async (): Promise<TogetherModel[]> => {
    const apiKey = import.meta.env.VITE_TOGETHER_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ VITE_TOGETHER_API_KEY not found in environment");
        return [];
    }

    try {
        console.log("🔄 Fetching Together AI chat models...");

        const response = await fetch("https://api.together.xyz/v1/models", {
            headers: {
                Authorization: `Bearer ${apiKey}`,
            },
        });

        if (!response.ok) {
            throw new Error(
                `Together API error: ${response.status} ${response.statusText}`,
            );
        }

        const allModels = await response.json();

        // Filter only chat models
        const chatModels = allModels.filter(
            (model: any) => model.type === "chat",
        );

        // Map to our format
        const formattedModels: TogetherModel[] = chatModels.map(
            (model: any) => {
                const pricing = model.pricing || {
                    input: 0,
                    output: 0,
                    hourly: 0,
                };
                const formatted: TogetherModel = {
                    id: model.id,
                    display_name: model.display_name || model.id,
                    organization: model.organization || "Unknown",
                    context_length: model.context_length || 0,
                    type: model.type,
                    link: model.link || "",
                    pricing: {
                        input: pricing.input || 0,
                        output: pricing.output || 0,
                        hourly: pricing.hourly || 0,
                    },
                    isFree: isFreeModel({
                        ...model,
                        pricing: {
                            input: pricing.input || 0,
                            output: pricing.output || 0,
                            hourly: pricing.hourly || 0,
                        },
                    } as TogetherModel),
                };
                return formatted;
            },
        );

        console.log(
            `✅ Fetched ${formattedModels.length} Together AI chat models`,
        );
        console.log(
            `   🆓 Free: ${formattedModels.filter((m) => m.isFree).length}`,
        );
        console.log(
            `   💰 Paid: ${formattedModels.filter((m) => !m.isFree).length}`,
        );

        return formattedModels;
    } catch (error) {
        console.error("❌ Error fetching Together AI models:", error);
        return [];
    }
};

const loadFromCache = (): TogetherModel[] | null => {
    try {
        const cached = localStorage.getItem(TOGETHER_CACHE_KEY);
        if (!cached) return null;

        const data: CachedData = JSON.parse(cached);
        const now = Date.now();
        const age = now - data.timestamp;

        if (age > CACHE_DURATION) {
            console.log(
                `⏰ Together cache expired (${Math.round(age / 1000 / 60 / 60)}h old)`,
            );
            return null;
        }

        console.log(
            `✅ Loaded ${data.models.length} Together models from cache (${Math.round(age / 1000 / 60)}min old)`,
        );
        return data.models;
    } catch (error) {
        console.error("❌ Error loading Together cache:", error);
        return null;
    }
};

const saveToCache = (models: TogetherModel[]): void => {
    try {
        const data: CachedData = {
            models,
            timestamp: Date.now(),
        };
        localStorage.setItem(TOGETHER_CACHE_KEY, JSON.stringify(data));
        console.log(`💾 Cached ${models.length} Together models`);
    } catch (error) {
        console.error("❌ Error saving Together cache:", error);
    }
};

export const useTogetherModels = () => {
    const [models, setModels] = useState<TogetherModel[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const loadModels = useCallback(async (forceRefresh = false) => {
        setIsLoading(true);
        setError(null);

        try {
            // Try cache first
            if (!forceRefresh) {
                const cached = loadFromCache();
                if (cached && cached.length > 0) {
                    setModels(cached);
                    const cacheData = localStorage.getItem(TOGETHER_CACHE_KEY);
                    if (cacheData) {
                        const data: CachedData = JSON.parse(cacheData);
                        setLastUpdated(new Date(data.timestamp));
                    }
                    setIsLoading(false);
                    return;
                }
            }

            // Fetch fresh data
            const freshModels = await fetchTogetherModels();
            if (freshModels.length > 0) {
                setModels(freshModels);
                saveToCache(freshModels);
                setLastUpdated(new Date());
            } else {
                setError("No models found");
            }
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : "Failed to load models";
            setError(errorMessage);
            console.error("Error in loadModels:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshModels = useCallback(async () => {
        await loadModels(true);
    }, [loadModels]);

    // Load on mount
    useEffect(() => {
        loadModels(false);
    }, [loadModels]);

    // Get free models
    const freeModels = models.filter((m) => m.isFree);

    // Get paid models sorted by price (cheapest first)
    const paidModels = models
        .filter((m) => !m.isFree)
        .sort((a, b) => {
            const costA = a.pricing.input + a.pricing.output;
            const costB = b.pricing.input + b.pricing.output;
            return costA - costB;
        });

    // Get cheapest model
    const cheapestModel = paidModels.length > 0 ? paidModels[0] : null;

    // Get most expensive model
    const mostExpensiveModel =
        paidModels.length > 0 ? paidModels[paidModels.length - 1] : null;

    return {
        models,
        freeModels,
        paidModels,
        cheapestModel,
        mostExpensiveModel,
        isLoading,
        error,
        lastUpdated,
        refreshModels,
        totalCount: models.length,
        freeCount: freeModels.length,
        paidCount: paidModels.length,
    };
};

// Utility function to format price
export const formatPrice = (price: number): string => {
    if (price === 0) return "Free";
    if (price < 0.0001) return `$${(price * 1000000).toFixed(2)}/1M`;
    if (price < 0.001) return `$${price.toFixed(4)}/1M`;
    if (price < 0.01) return `$${price.toFixed(3)}/1M`;
    if (price < 1) return `$${price.toFixed(2)}/1M`;
    return `$${price.toFixed(2)}/1M`;
};

// Utility function to get total cost estimate
export const estimateCost = (
    model: TogetherModel,
    inputTokens: number,
    outputTokens: number,
): number => {
    const inputCost = (model.pricing.input * inputTokens) / 1000000;
    const outputCost = (model.pricing.output * outputTokens) / 1000000;
    return inputCost + outputCost;
};
