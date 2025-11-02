import {
    Menu,
    Copy,
    FileText,
    MoreVertical,
    Settings,
    Database,
} from "lucide-react";
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

interface MobileHeaderProps {
    onMenuClick: () => void;
    sessionTitle: string;
    ragEnabled?: boolean;
    isSearching?: boolean;
    resultsCount?: number;
    searchEngine?: "duckduckgo" | "brave";
    onOpenSettings?: () => void;
    onToggleRAG?: (enabled: boolean) => void;
    documentCount?: number;
}

export const MobileHeader = ({
    onMenuClick,
    sessionTitle,
    ragEnabled = false,
    isSearching = false,
    resultsCount = 0,
    searchEngine,
    onOpenSettings,
    onToggleRAG,
    documentCount = 0,
}: MobileHeaderProps) => {
    return (
        <div className="lg:hidden border-b border-border bg-card flex-shrink-0">
            <div className="px-2 sm:px-4 py-2 sm:py-3 flex items-center justify-between">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                >
                    <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>

                <div className="flex-1 mx-2 sm:mx-3 min-w-0">
                    <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        <span className="text-foreground">{sessionTitle}</span>
                    </p>
                </div>

                <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                        <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 sm:h-9 sm:w-9"
                    >
                        <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>

                    {/* Three Dots Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 sm:h-9 sm:w-9"
                            >
                                <MoreVertical className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel className="text-xs">
                                Quick Actions
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />

                            {/* RAG Toggle */}
                            <div className="flex items-center justify-between px-2 py-2 hover:bg-accent rounded-sm">
                                <div className="flex items-center gap-2">
                                    <Database className="w-4 h-4" />
                                    <span className="text-sm">Enable RAG</span>
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
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* RAG Indicator for Mobile */}
            {ragEnabled && (
                <div className="px-2 sm:px-4 pb-2">
                    <RAGIndicator
                        isEnabled={ragEnabled}
                        isSearching={isSearching}
                        resultsCount={resultsCount}
                        searchEngine={searchEngine}
                        documentCount={documentCount}
                    />
                </div>
            )}
        </div>
    );
};
