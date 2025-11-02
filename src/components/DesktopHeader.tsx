import { Copy, FileText, MoreVertical, Settings, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RAGIndicator } from "@/components/RAGIndicator";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";

interface DesktopHeaderProps {
    sessionTitle: string;
    ragEnabled?: boolean;
    isSearching?: boolean;
    resultsCount?: number;
    searchEngine?: "duckduckgo" | "brave";
    onOpenSettings?: () => void;
    onToggleRAG?: (enabled: boolean) => void;
    documentCount?: number;
}

export const DesktopHeader = ({
    sessionTitle,
    ragEnabled = false,
    isSearching = false,
    resultsCount = 0,
    searchEngine,
    onOpenSettings,
    onToggleRAG,
    documentCount = 0,
}: DesktopHeaderProps) => {
    return (
        <div className="hidden lg:flex border-b border-border px-6 py-3 items-center justify-between bg-card">
            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                    Session:{" "}
                    <span className="text-foreground">{sessionTitle}</span>
                </div>
                <RAGIndicator
                    isEnabled={ragEnabled}
                    isSearching={isSearching}
                    resultsCount={resultsCount}
                    searchEngine={searchEngine}
                    documentCount={documentCount}
                />
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="text-xs">
                    <Copy className="w-3 h-3 mr-1" />
                    Copy All
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                    <FileText className="w-3 h-3 mr-1" />
                    Summarize
                </Button>

                {/* Three Dots Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        {/* RAG Toggle */}
                        <div className="flex items-center justify-between px-2 py-2 hover:bg-accent rounded-sm cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Database className="w-4 h-4" />
                                <span className="text-sm">
                                    Enable RAG Search
                                </span>
                            </div>
                            <Switch
                                checked={ragEnabled}
                                onCheckedChange={onToggleRAG}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        <DropdownMenuSeparator />

                        {/* Settings */}
                        <DropdownMenuItem onClick={onOpenSettings}>
                            <Settings className="w-4 h-4 mr-2" />
                            Settings
                            <span className="ml-auto text-xs text-muted-foreground">
                                ⌘K
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
