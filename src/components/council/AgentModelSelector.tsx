/**
 * AgentModelSelector Component
 * Allows users to select provider and model for each council agent individually
 * Uses existing aiApi system for consistency with chat
 */

import React, { useState, useEffect } from "react";
import {
    Brain,
    ChevronDown,
    ChevronUp,
    Zap,
    DollarSign,
    RefreshCw,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import type { AgentRole, AgentModelConfig } from "@/lib/councilTypes";
import { COUNCIL_AGENTS } from "@/lib/councilTypes";
import { aiApi, type Provider, type ModelInfo } from "@/lib/aiApi";

interface AgentModelSelectorProps {
    agentModels: Record<AgentRole, AgentModelConfig>;
    onChange: (agentModels: Record<AgentRole, AgentModelConfig>) => void;
    activeAgents?: AgentRole[];
}

const PROVIDER_CONFIG = {
    poe: { name: "Poe", icon: "🤖", color: "from-blue-500 to-indigo-600" },
    together: { name: "Together AI", icon: "🔥", color: "from-orange-500 to-red-600" },
    groq: { name: "Groq", icon: "⚡", color: "from-yellow-500 to-orange-600" },
    openrouter: { name: "OpenRouter", icon: "🌐", color: "from-green-500 to-emerald-600" },
} as const;

export function AgentModelSelector({
    agentModels,
    onChange,
    activeAgents,
}: AgentModelSelectorProps) {
    const [expandedAgents, setExpandedAgents] = useState<Set<AgentRole>>(new Set());
    const [bulkMode, setBulkMode] = useState(false);
    const [bulkProvider, setBulkProvider] = useState<Provider>("poe");
    const [bulkModel, setBulkModel] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [modelsByProvider, setModelsByProvider] = useState<Record<Provider, ModelInfo[]>>({
        poe: [],
        together: [],
        groq: [],
        openrouter: [],
    });
    const [availableProviders, setAvailableProviders] = useState<Provider[]>([]);

    // Load models on mount
    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = () => {
        setIsLoading(true);
        try {
            const providers: Provider[] = ["poe", "together", "groq", "openrouter"];
            const available: Provider[] = [];
            const modelsByProv: Record<Provider, ModelInfo[]> = {
                poe: [],
                together: [],
                groq: [],
                openrouter: [],
            };

            providers.forEach((provider) => {
                // Check if provider has API key
                const hasKey = aiApi.hasProvider(provider);
                if (hasKey) {
                    available.push(provider);
                    const models = aiApi.getModelsByProvider(provider);
                    modelsByProv[provider] = models;
                }
            });

            setAvailableProviders(available);
            setModelsByProvider(modelsByProv);

            // Set default bulk provider to first available
            if (available.length > 0 && !available.includes(bulkProvider)) {
                setBulkProvider(available[0]);
                const models = modelsByProv[available[0]];
                if (models.length > 0) {
                    setBulkModel(models[0].id);
                }
            }
        } catch (error) {
            console.error("Error loading models:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAgent = (agent: AgentRole) => {
        const newExpanded = new Set(expandedAgents);
        if (newExpanded.has(agent)) {
            newExpanded.delete(agent);
        } else {
            newExpanded.add(agent);
        }
        setExpandedAgents(newExpanded);
    };

    const handleProviderChange = (agent: AgentRole, provider: Provider) => {
        const models = modelsByProvider[provider] || [];
        const newModel = models[0]?.id || "";

        onChange({
            ...agentModels,
            [agent]: { provider, model: newModel },
        });
    };

    const handleModelChange = (agent: AgentRole, model: string) => {
        onChange({
            ...agentModels,
            [agent]: { ...agentModels[agent], model },
        });
    };

    const handleBulkApply = () => {
        if (!bulkProvider || !bulkModel) return;

        const newAgentModels = { ...agentModels };
        const agents = activeAgents || (Object.keys(COUNCIL_AGENTS) as AgentRole[]);

        agents.forEach((agent) => {
            newAgentModels[agent] = { provider: bulkProvider, model: bulkModel };
        });

        onChange(newAgentModels);
        setBulkMode(false);
    };

    const handleBulkProviderChange = (provider: Provider) => {
        setBulkProvider(provider);
        const models = modelsByProvider[provider] || [];
        setBulkModel(models[0]?.id || "");
    };

    const getModelInfo = (provider: Provider, modelId: string): ModelInfo | undefined => {
        return aiApi.getModelInfo(provider, modelId);
    };

    const calculateEstimatedCost = () => {
        const agents = activeAgents || (Object.keys(COUNCIL_AGENTS) as AgentRole[]);
        let totalCost = 0;

        agents.forEach((agent) => {
            const config = agentModels[agent];
            const modelInfo = getModelInfo(config.provider, config.model);

            // Estimate cost based on speed/quality
            if (modelInfo?.quality === "High") {
                totalCost += modelInfo.speed === "Fast" ? 2 : 5;
            } else {
                totalCost += 1;
            }
        });

        return totalCost;
    };

    const getCategoryBadge = (modelInfo?: ModelInfo) => {
        if (!modelInfo) return "Standard";
        if (modelInfo.features.includes("Free tier") || modelInfo.features.includes("🆓 Free")) {
            return "Free";
        }
        if (modelInfo.speed === "Fast") return "Fast";
        if (modelInfo.quality === "High") return "High Quality";
        return "Balanced";
    };

    const getCategoryColor = (modelInfo?: ModelInfo) => {
        if (!modelInfo) return "text-gray-600 dark:text-gray-400";
        if (modelInfo.features.includes("Free tier") || modelInfo.features.includes("🆓 Free")) {
            return "text-green-600 dark:text-green-400";
        }
        if (modelInfo.speed === "Fast") return "text-blue-600 dark:text-blue-400";
        if (modelInfo.quality === "High") return "text-purple-600 dark:text-purple-400";
        return "text-gray-600 dark:text-gray-400";
    };

    const agents = activeAgents || (Object.keys(COUNCIL_AGENTS) as AgentRole[]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <RefreshCw className="h-6 w-6 animate-spin text-purple-600 dark:text-purple-400" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Loading models...</span>
            </div>
        );
    }

    if (availableProviders.length === 0) {
        return (
            <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                            No Providers Configured
                        </h4>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                            Please configure at least one API key to use Council-Hades. Go to Settings
                            and add keys for Poe, Together AI, Groq, or OpenRouter.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header with Bulk Mode Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-lg font-semibold">Agent Model Configuration</h3>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => loadModels()}
                        className="p-2 rounded-lg border border-gray-300 dark:border-gray-600
                                 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        title="Refresh models"
                    >
                        <RefreshCw className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => setBulkMode(!bulkMode)}
                        className="px-3 py-1 text-sm rounded-lg border border-purple-300 dark:border-purple-700
                                 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                    >
                        {bulkMode ? "Individual Mode" : "Bulk Apply"}
                    </button>
                </div>
            </div>

            {/* Provider Status */}
            <div className="flex flex-wrap gap-2">
                {(Object.keys(PROVIDER_CONFIG) as Provider[]).map((provider) => {
                    const config = PROVIDER_CONFIG[provider];
                    const isAvailable = availableProviders.includes(provider);
                    const modelCount = modelsByProvider[provider]?.length || 0;

                    return (
                        <div
                            key={provider}
                            className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                isAvailable
                                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            }`}
                        >
                            <span>{config.icon}</span>
                            <span>{config.name}</span>
                            {isAvailable && (
                                <>
                                    <CheckCircle className="h-3 w-3" />
                                    <span>({modelCount})</span>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Cost Estimate */}
            <div className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-blue-50
                          dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200
                          dark:border-purple-800">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div className="flex-1">
                    <div className="text-sm font-medium">Estimated Cost Impact</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                        Relative cost for this session
                    </div>
                </div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {calculateEstimatedCost()}x
                </div>
            </div>

            {/* Bulk Mode Panel */}
            {bulkMode && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200
                              dark:border-purple-800 space-y-3">
                    <div className="text-sm font-medium">Apply to All Agents</div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium mb-1">Provider</label>
                            <select
                                value={bulkProvider}
                                onChange={(e) => handleBulkProviderChange(e.target.value as Provider)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                         bg-white dark:bg-gray-800 text-sm"
                            >
                                {availableProviders.map((provider) => (
                                    <option key={provider} value={provider}>
                                        {PROVIDER_CONFIG[provider].icon} {PROVIDER_CONFIG[provider].name} (
                                        {modelsByProvider[provider]?.length || 0})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium mb-1">Model</label>
                            <select
                                value={bulkModel}
                                onChange={(e) => setBulkModel(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600
                                         bg-white dark:bg-gray-800 text-sm"
                            >
                                {(modelsByProvider[bulkProvider] || []).map((model) => (
                                    <option key={model.id} value={model.id}>
                                        {model.name} [{getCategoryBadge(model)}]
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleBulkApply}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg
                                 transition-colors text-sm font-medium"
                    >
                        Apply to All {agents.length} Agents
                    </button>
                </div>
            )}

            {/* Individual Agent Selectors */}
            <div className="space-y-2">
                {agents.map((agentRole) => {
                    const agent = COUNCIL_AGENTS[agentRole];
                    const config = agentModels[agentRole];
                    const isExpanded = expandedAgents.has(agentRole);
                    const modelInfo = getModelInfo(config.provider, config.model);
                    const providerConfig = PROVIDER_CONFIG[config.provider];

                    return (
                        <div
                            key={agentRole}
                            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden
                                     hover:border-purple-300 dark:hover:border-purple-600 transition-colors"
                        >
                            {/* Agent Header */}
                            <button
                                onClick={() => toggleAgent(agentRole)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50
                                         dark:hover:bg-gray-800/50 transition-colors"
                            >
                                <div className="text-2xl">{agent.icon}</div>

                                <div className="flex-1 text-left">
                                    <div className="font-medium">{agent.name}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {providerConfig.icon} {providerConfig.name} / {config.model}
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="flex items-center gap-2 text-xs">
                                    <span
                                        className={`px-2 py-0.5 rounded ${getCategoryColor(
                                            modelInfo
                                        )} bg-current/10`}
                                    >
                                        {getCategoryBadge(modelInfo)}
                                    </span>
                                </div>

                                {isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                            </button>

                            {/* Expanded Configuration */}
                            {isExpanded && (
                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t
                                              border-gray-200 dark:border-gray-700 space-y-3">
                                    <div className="text-xs text-gray-600 dark:text-gray-400">
                                        {agent.description}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium mb-1">Provider</label>
                                            <select
                                                value={config.provider}
                                                onChange={(e) =>
                                                    handleProviderChange(agentRole, e.target.value as Provider)
                                                }
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300
                                                         dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                            >
                                                {availableProviders.map((provider) => (
                                                    <option key={provider} value={provider}>
                                                        {PROVIDER_CONFIG[provider].icon}{" "}
                                                        {PROVIDER_CONFIG[provider].name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium mb-1">Model</label>
                                            <select
                                                value={config.model}
                                                onChange={(e) => handleModelChange(agentRole, e.target.value)}
                                                className="w-full px-3 py-2 rounded-lg border border-gray-300
                                                         dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                            >
                                                {(modelsByProvider[config.provider] || []).map((model) => (
                                                    <option key={model.id} value={model.id}>
                                                        {model.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Model Info Details */}
                                    {modelInfo && (
                                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                {modelInfo.description}
                                            </div>

                                            <div className="flex flex-wrap gap-2 text-xs">
                                                <span className={getCategoryColor(modelInfo)}>
                                                    • Speed: {modelInfo.speed}
                                                </span>
                                                <span className={getCategoryColor(modelInfo)}>
                                                    • Quality: {modelInfo.quality}
                                                </span>
                                            </div>

                                            {modelInfo.features && modelInfo.features.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {modelInfo.features.slice(0, 4).map((feature, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                                                        >
                                                            {feature}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Summary Footer */}
            <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200
                          dark:border-gray-700 text-sm">
                <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                        {agents.length} agents configured across {availableProviders.length} providers
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                        Est. tokens: ~{agents.length * 2000}
                    </span>
                </div>
            </div>
        </div>
    );
}
