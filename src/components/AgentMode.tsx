import { useState, useEffect, useRef } from "react";
import { Send, Loader2, X, CheckSquare, Square, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { aiApi, Provider } from "@/lib/aiApi";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface ModelSelection {
    provider: Provider;
    modelId: string;
    modelName: string;
}

interface ModelResponse {
    provider: Provider;
    modelId: string;
    modelName: string;
    content: string;
    isLoading: boolean;
    error?: string;
    metadata?: {
        duration?: string;
        tokens?: string;
        speed?: string;
    };
}

interface AgentModeProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AgentMode = ({ isOpen, onClose }: AgentModeProps) => {
    const [selectedModels, setSelectedModels] = useState<ModelSelection[]>([]);
    const [input, setInput] = useState("");
    const [responses, setResponses] = useState<ModelResponse[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const allModels = aiApi.getAllModels();
    const availableProviders = aiApi.getAvailableProviders();

    // Quick select presets
    const quickPresets = [
        {
            name: "Fast Trio",
            icon: "⚡",
            models: [
                {
                    provider: "groq" as Provider,
                    modelId: "llama-3.1-8b-instant",
                },
                { provider: "groq" as Provider, modelId: "mixtral-8x7b-32768" },
                { provider: "groq" as Provider, modelId: "gemma2-9b-it" },
            ],
        },
        {
            name: "Best of Each",
            icon: "🏆",
            models: [
                { provider: "poe" as Provider, modelId: "GPT-5-mini" },
                {
                    provider: "together" as Provider,
                    modelId: "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo",
                },
                {
                    provider: "groq" as Provider,
                    modelId: "llama-3.1-8b-instant",
                },
            ],
        },
        {
            name: "All Providers",
            icon: "🌐",
            models: [
                { provider: "poe" as Provider, modelId: "GPT-5-mini" },
                {
                    provider: "together" as Provider,
                    modelId: "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo",
                },
                {
                    provider: "groq" as Provider,
                    modelId: "llama-3.1-8b-instant",
                },
            ],
        },
    ];

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    const toggleModelSelection = (
        provider: Provider,
        modelId: string,
        modelName: string,
    ) => {
        const exists = selectedModels.find(
            (m) => m.provider === provider && m.modelId === modelId,
        );

        if (exists) {
            setSelectedModels(
                selectedModels.filter(
                    (m) => !(m.provider === provider && m.modelId === modelId),
                ),
            );
        } else {
            setSelectedModels([
                ...selectedModels,
                { provider, modelId, modelName },
            ]);
        }
    };

    const isModelSelected = (provider: Provider, modelId: string) => {
        return selectedModels.some(
            (m) => m.provider === provider && m.modelId === modelId,
        );
    };

    const getProviderColor = (provider: Provider) => {
        switch (provider) {
            case "poe":
                return "border-blue-500 bg-blue-500/10";
            case "together":
                return "border-purple-500 bg-purple-500/10";
            case "groq":
                return "border-yellow-500 bg-yellow-500/10";
            default:
                return "border-gray-500 bg-gray-500/10";
        }
    };

    const getProviderBadgeColor = (provider: Provider) => {
        switch (provider) {
            case "poe":
                return "bg-blue-500/20 text-blue-300 border-blue-500/30";
            case "together":
                return "bg-purple-500/20 text-purple-300 border-purple-500/30";
            case "groq":
                return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
            default:
                return "bg-gray-500/20 text-gray-300 border-gray-500/30";
        }
    };

    const handleSendToMultipleModels = async () => {
        if (!input.trim() || selectedModels.length === 0) return;

        setIsProcessing(true);
        const userMessage = input.trim();
        setInput("");

        // Initialize responses for all selected models
        const initialResponses: ModelResponse[] = selectedModels.map(
            (model) => ({
                provider: model.provider,
                modelId: model.modelId,
                modelName: model.modelName,
                content: "",
                isLoading: true,
            }),
        );

        setResponses(initialResponses);

        // Send to all models in parallel
        const promises = selectedModels.map(async (model, index) => {
            const startTime = Date.now();
            let content = "";
            let tokenCount = 0;

            try {
                await aiApi.sendMessage(
                    {
                        provider: model.provider,
                        model: model.modelId,
                        messages: [{ role: "user", content: userMessage }],
                    },
                    // onChunk
                    (chunk: string) => {
                        content += chunk;
                        tokenCount = content.split(/\s+/).length;

                        setResponses((prev) =>
                            prev.map((r, i) =>
                                i === index
                                    ? { ...r, content, isLoading: true }
                                    : r,
                            ),
                        );
                    },
                    // onComplete
                    () => {
                        const endTime = Date.now();
                        const duration = ((endTime - startTime) / 1000).toFixed(
                            2,
                        );
                        const tokensPerSecond = (
                            tokenCount /
                            ((endTime - startTime) / 1000)
                        ).toFixed(0);

                        const metadata = {
                            duration: `${duration}s`,
                            tokens: `${tokenCount} tokens`,
                            speed: `${tokensPerSecond} tok/s`,
                        };

                        setResponses((prev) =>
                            prev.map((r, i) =>
                                i === index
                                    ? {
                                          ...r,
                                          content,
                                          isLoading: false,
                                          metadata,
                                      }
                                    : r,
                            ),
                        );
                    },
                    // onError
                    (error: Error) => {
                        setResponses((prev) =>
                            prev.map((r, i) =>
                                i === index
                                    ? {
                                          ...r,
                                          isLoading: false,
                                          error: error.message,
                                      }
                                    : r,
                            ),
                        );
                    },
                );
            } catch (error) {
                setResponses((prev) =>
                    prev.map((r, i) =>
                        i === index
                            ? {
                                  ...r,
                                  isLoading: false,
                                  error:
                                      error instanceof Error
                                          ? error.message
                                          : "Unknown error",
                              }
                            : r,
                    ),
                );
            }
        });

        await Promise.all(promises);
        setIsProcessing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendToMultipleModels();
        }
    };

    const clearResponses = () => {
        setResponses([]);
    };

    const applyQuickPreset = (preset: (typeof quickPresets)[0]) => {
        const newSelections: ModelSelection[] = [];

        preset.models.forEach(({ provider, modelId }) => {
            const models = aiApi.getModelsByProvider(provider);
            const model = models.find((m) => m.id === modelId);
            if (model && availableProviders.includes(provider)) {
                newSelections.push({
                    provider,
                    modelId,
                    modelName: model.name,
                });
            }
        });

        setSelectedModels(newSelections);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-[95vw] w-full h-[90vh] max-h-[90vh] p-0 gap-0 flex flex-col">
                <DialogHeader className="px-4 lg:px-6 py-4 border-b border-border flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-lg">
                        <Zap className="w-5 h-5 text-primary" />
                        Agent Mode - Multi-Model Comparison
                    </DialogTitle>
                    <DialogDescription className="text-xs lg:text-sm">
                        Select multiple models and compare their responses
                        side-by-side
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 lg:p-6 overflow-hidden min-h-0">
                    {/* Model Selection Panel */}
                    <div className="w-full lg:w-80 flex-shrink-0 flex flex-col border border-border rounded-lg overflow-hidden">
                        <div className="p-3 border-b border-border bg-sidebar-accent/50">
                            <h3 className="text-sm font-semibold flex items-center justify-between mb-2">
                                Select Models
                                <Badge
                                    variant="outline"
                                    className="text-[9px] px-1.5 py-0"
                                >
                                    {selectedModels.length} selected
                                </Badge>
                            </h3>
                            {/* Quick Presets */}
                            <div className="flex gap-1 flex-wrap">
                                {quickPresets.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyQuickPreset(preset)}
                                        className="text-[9px] px-2 py-1 rounded bg-sidebar-accent hover:bg-sidebar-accent/80 border border-border transition-all"
                                        title={`Select: ${preset.models.map((m) => m.modelId).join(", ")}`}
                                    >
                                        {preset.icon} {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-3 space-y-3">
                                {availableProviders.map((provider) => {
                                    const models =
                                        aiApi.getModelsByProvider(provider);
                                    return (
                                        <div key={provider}>
                                            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                                {provider}
                                            </h4>
                                            <div className="space-y-1">
                                                {models.map((model) => {
                                                    const selected =
                                                        isModelSelected(
                                                            provider,
                                                            model.id,
                                                        );
                                                    return (
                                                        <button
                                                            key={model.id}
                                                            onClick={() =>
                                                                toggleModelSelection(
                                                                    provider,
                                                                    model.id,
                                                                    model.name,
                                                                )
                                                            }
                                                            className={cn(
                                                                "w-full text-left p-2 rounded-md border transition-all hover:bg-sidebar-accent/80",
                                                                selected
                                                                    ? "border-primary bg-primary/10"
                                                                    : "border-border bg-sidebar-accent/30",
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {selected ? (
                                                                    <CheckSquare className="w-4 h-4 text-primary flex-shrink-0" />
                                                                ) : (
                                                                    <Square className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-[11px] font-medium truncate">
                                                                        {
                                                                            model.name
                                                                        }
                                                                    </div>
                                                                    <div className="text-[9px] text-muted-foreground truncate">
                                                                        {model.description.substring(
                                                                            0,
                                                                            40,
                                                                        )}
                                                                        ...
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* Responses Panel */}
                    <div className="flex-1 flex flex-col min-w-0 min-h-0">
                        {/* Input Area */}
                        <div className="mb-4 flex-shrink-0">
                            <div className="flex gap-2 items-end">
                                <Textarea
                                    ref={textareaRef}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={
                                        selectedModels.length === 0
                                            ? "Select models first..."
                                            : `Ask ${selectedModels.length} model(s) anything...`
                                    }
                                    rows={2}
                                    disabled={
                                        isProcessing ||
                                        selectedModels.length === 0
                                    }
                                    className="min-h-[60px] max-h-32 resize-none text-sm flex-1"
                                />
                                <Button
                                    size="icon"
                                    className="h-[60px] w-[60px] flex-shrink-0"
                                    onClick={handleSendToMultipleModels}
                                    disabled={
                                        isProcessing ||
                                        !input.trim() ||
                                        selectedModels.length === 0
                                    }
                                >
                                    {isProcessing ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </Button>
                            </div>
                            {responses.length > 0 && (
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-xs text-muted-foreground">
                                        {
                                            responses.filter(
                                                (r) => !r.isLoading,
                                            ).length
                                        }{" "}
                                        of {responses.length} responses
                                        completed
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearResponses}
                                        className="text-xs h-7"
                                    >
                                        <X className="w-3 h-3 mr-1" />
                                        Clear
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Responses Grid */}
                        <ScrollArea className="flex-1 min-h-0">
                            {responses.length === 0 ? (
                                <div className="h-full flex items-center justify-center">
                                    <div className="text-center text-muted-foreground">
                                        <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm font-medium">
                                            Agent Mode Ready
                                        </p>
                                        <p className="text-xs mt-1">
                                            Select models and send a message to
                                            compare responses
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 pb-4">
                                    {responses.map((response, index) => (
                                        <Card
                                            key={`${response.provider}-${response.modelId}-${index}`}
                                            className={cn(
                                                "flex flex-col border-2",
                                                getProviderColor(
                                                    response.provider,
                                                ),
                                            )}
                                        >
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm flex items-center justify-between">
                                                    <span className="truncate">
                                                        {response.modelName}
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={cn(
                                                            "text-[8px] px-1.5 py-0 ml-2 flex-shrink-0",
                                                            getProviderBadgeColor(
                                                                response.provider,
                                                            ),
                                                        )}
                                                    >
                                                        {response.provider}
                                                    </Badge>
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="flex-1 pt-0 flex flex-col min-h-0">
                                                <ScrollArea className="flex-1 -mx-6 px-6 min-h-[200px]">
                                                    {response.error ? (
                                                        <div className="text-xs text-destructive bg-destructive/10 p-3 rounded border border-destructive/30">
                                                            <p className="font-semibold mb-1">
                                                                Error:
                                                            </p>
                                                            <p>
                                                                {response.error}
                                                            </p>
                                                        </div>
                                                    ) : response.isLoading &&
                                                      !response.content ? (
                                                        <div className="flex items-center gap-2 text-muted-foreground text-xs">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Waiting for
                                                            response...
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                                                            <MarkdownRenderer
                                                                content={
                                                                    response.content
                                                                }
                                                            />
                                                        </div>
                                                    )}
                                                </ScrollArea>

                                                {response.metadata &&
                                                    !response.isLoading && (
                                                        <div className="mt-3 pt-3 border-t border-border">
                                                            <div className="flex flex-wrap gap-2 text-[9px] text-muted-foreground">
                                                                {response
                                                                    .metadata
                                                                    .duration && (
                                                                    <span className="whitespace-nowrap">
                                                                        ⏱️{" "}
                                                                        {
                                                                            response
                                                                                .metadata
                                                                                .duration
                                                                        }
                                                                    </span>
                                                                )}
                                                                {response
                                                                    .metadata
                                                                    .tokens && (
                                                                    <span className="whitespace-nowrap">
                                                                        📊{" "}
                                                                        {
                                                                            response
                                                                                .metadata
                                                                                .tokens
                                                                        }
                                                                    </span>
                                                                )}
                                                                {response
                                                                    .metadata
                                                                    .speed && (
                                                                    <span className="whitespace-nowrap">
                                                                        ⚡{" "}
                                                                        {
                                                                            response
                                                                                .metadata
                                                                                .speed
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}

                                                {response.isLoading &&
                                                    response.content && (
                                                        <div className="mt-2 flex items-center gap-2 text-[9px] text-muted-foreground">
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                            Streaming...
                                                        </div>
                                                    )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
