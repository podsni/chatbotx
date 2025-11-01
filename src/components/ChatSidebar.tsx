import { useState, useEffect } from "react";
import {
    MessageSquare,
    MoreVertical,
    X,
    Trash2,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { chatDB, Session } from "@/lib/db";
import { Provider, aiApi } from "@/lib/aiApi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface ChatSidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    currentSessionId?: string;
    onSessionChange?: (sessionId: string) => void;
    onNewSession?: (provider: Provider, modelId: string) => void;
}

export const ChatSidebar = ({
    isOpen = true,
    onClose,
    currentSessionId,
    onSessionChange,
    onNewSession,
}: ChatSidebarProps) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [ragEnabled, setRagEnabled] = useState(true);
    const [expandedProvider, setExpandedProvider] = useState<Provider | null>(
        "poe",
    );

    // Load sessions from IndexedDB
    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const allSessions = await chatDB.getAllSessions();
            setSessions(allSessions);
        } catch (error) {
            console.error("Error loading sessions:", error);
        }
    };

    const handleDeleteSession = async (sessionId: string) => {
        try {
            await chatDB.deleteSession(sessionId);
            await loadSessions();

            // If deleted session was current, clear selection
            if (currentSessionId === sessionId && sessions.length > 0) {
                const remainingSessions = sessions.filter(
                    (s) => s.id !== sessionId,
                );
                if (remainingSessions.length > 0 && onSessionChange) {
                    onSessionChange(remainingSessions[0].id);
                }
            }
        } catch (error) {
            console.error("Error deleting session:", error);
        }
    };

    const handleNewChat = (provider: Provider, modelId: string) => {
        if (onNewSession) {
            onNewSession(provider, modelId);
        }
    };

    const formatTimestamp = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    };

    const availableProviders = aiApi.getAvailableProviders();
    const poeModels = aiApi.getModelsByProvider("poe");
    const togetherModels = aiApi.getModelsByProvider("together");
    const groqModels = aiApi.getModelsByProvider("groq");

    const getProviderColor = (provider: Provider) => {
        switch (provider) {
            case "poe":
                return "text-blue-400";
            case "together":
                return "text-purple-400";
            case "groq":
                return "text-yellow-400";
            default:
                return "text-gray-400";
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

    const renderProviderSection = (
        provider: Provider,
        models: any[],
        providerName: string,
    ) => {
        const isExpanded = expandedProvider === provider;

        return (
            <div key={provider} className="mb-2">
                <button
                    onClick={() =>
                        setExpandedProvider(isExpanded ? null : provider)
                    }
                    className="w-full flex items-center justify-between p-2 rounded hover:bg-sidebar-accent/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "text-xs font-semibold uppercase",
                                getProviderColor(provider),
                            )}
                        >
                            {providerName}
                        </span>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[9px] px-1.5 py-0",
                                getProviderBadgeColor(provider),
                            )}
                        >
                            {models.length}
                        </Badge>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                    ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                </button>

                {isExpanded && (
                    <div className="mt-1 space-y-1 ml-2">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() =>
                                    handleNewChat(provider, model.id)
                                }
                                className="w-full text-left p-2 rounded-md hover:bg-sidebar-accent transition-colors group"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[11px] font-medium text-sidebar-foreground truncate">
                                            {model.name}
                                        </div>
                                        <div className="text-[9px] text-muted-foreground truncate mt-0.5">
                                            {model.description.substring(0, 50)}
                                            ...
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                        <Badge
                                            variant={
                                                model.speed === "Fast"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                            className="text-[8px] px-1 py-0"
                                        >
                                            {model.speed}
                                        </Badge>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={cn(
                    "fixed lg:relative inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] lg:w-80 bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-transform duration-300 lg:translate-x-0 overflow-hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                )}
            >
                {/* Mobile Close Button */}
                <div className="lg:hidden flex justify-end p-2 border-b border-sidebar-border">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="h-8 w-8"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Sessions Section */}
                <div className="p-3 lg:p-4 border-b border-sidebar-border flex-shrink-0">
                    <h2 className="text-xs lg:text-sm font-medium text-sidebar-foreground mb-2 lg:mb-3">
                        Sessions
                    </h2>
                    <ScrollArea className="h-28 lg:h-32">
                        <div className="space-y-1.5 lg:space-y-2 pr-2">
                            {sessions.length === 0 ? (
                                <div className="text-xs text-muted-foreground text-center py-4">
                                    No sessions yet. Create a new chat!
                                </div>
                            ) : (
                                sessions.map((session) => (
                                    <div
                                        key={session.id}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded hover:bg-sidebar-accent/80 cursor-pointer group",
                                            currentSessionId === session.id
                                                ? "bg-sidebar-accent"
                                                : "bg-sidebar-accent/50",
                                        )}
                                        onClick={() =>
                                            onSessionChange?.(session.id)
                                        }
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                                            <MessageSquare className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-sidebar-foreground flex-shrink-0" />
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="text-[10px] lg:text-xs text-sidebar-foreground truncate block">
                                                    {session.title}
                                                </span>
                                                <span className="text-[9px] lg:text-[10px] text-muted-foreground">
                                                    {formatTimestamp(
                                                        session.timestamp,
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 lg:h-6 lg:w-6 opacity-0 group-hover:opacity-100 flex-shrink-0"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <MoreVertical className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteSession(
                                                            session.id,
                                                        );
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* All AI Models - List View */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="p-3 lg:p-4 border-b border-sidebar-border">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xs lg:text-sm font-medium text-sidebar-foreground">
                                All AI Models
                            </h2>
                            <Badge
                                variant="outline"
                                className="text-[9px] px-1.5 py-0"
                            >
                                {aiApi.getAllModels().length} models
                            </Badge>
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-1">
                            {availableProviders.length} providers available
                        </div>
                    </div>

                    <ScrollArea className="flex-1 px-3 lg:px-4 py-2">
                        {availableProviders.includes("poe") &&
                            renderProviderSection("poe", poeModels, "Poe AI")}
                        {availableProviders.includes("together") &&
                            renderProviderSection(
                                "together",
                                togetherModels,
                                "Together AI",
                            )}
                        {availableProviders.includes("groq") &&
                            renderProviderSection("groq", groqModels, "Groq")}
                    </ScrollArea>
                </div>

                {/* RAG Section */}
                <div className="p-3 lg:p-4 border-t border-sidebar-border flex-shrink-0">
                    <div className="flex items-center justify-between mb-2 lg:mb-3">
                        <h2 className="text-xs lg:text-sm font-medium text-sidebar-foreground">
                            RAG
                        </h2>
                        <Switch
                            checked={ragEnabled}
                            onCheckedChange={setRagEnabled}
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex gap-1.5 lg:gap-2">
                            <Input
                                placeholder="Enter directory path"
                                className="text-[10px] lg:text-xs bg-sidebar-accent border-sidebar-border min-w-0"
                            />
                            <Button
                                variant="secondary"
                                size="sm"
                                className="text-[10px] lg:text-xs px-2 lg:px-3 flex-shrink-0"
                            >
                                Add
                            </Button>
                        </div>

                        <div className="space-y-1 mt-2 lg:mt-3">
                            <div className="p-2 rounded bg-sidebar-accent text-[10px] lg:text-xs text-sidebar-foreground truncate">
                                contacts.txt - 7326 bytes
                            </div>
                            <div className="p-2 rounded bg-sidebar-accent text-[10px] lg:text-xs text-sidebar-foreground truncate">
                                indexed_directories.json - 2 bytes
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
