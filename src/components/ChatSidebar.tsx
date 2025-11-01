import { useState, useEffect } from "react";
import { MessageSquare, MoreVertical, X, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { chatDB, Session } from "@/lib/db";
import { ModelSelector } from "@/components/ModelSelector";
import { Provider } from "@/lib/aiApi";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

                {/* Models Section - Poe Models */}
                <div className="p-3 lg:p-4 border-b border-sidebar-border flex-shrink-0">
                    <h2 className="text-xs lg:text-sm font-medium text-sidebar-foreground mb-2 lg:mb-3">
                        AI Models
                    </h2>
                    <ModelSelector
                        onSelectModel={handleNewChat}
                        trigger={
                            <Button
                                variant="default"
                                size="sm"
                                className="w-full h-8 lg:h-9 text-[10px] lg:text-xs"
                            >
                                <Plus className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                                New Chat
                            </Button>
                        }
                    />
                </div>

                {/* RAG Section */}
                <div className="p-3 lg:p-4 flex-1 overflow-y-auto">
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
