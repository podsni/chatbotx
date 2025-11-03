import { FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

interface DesktopHeaderProps {
    sessionTitle: string;
    ragEnabled?: boolean;
    onToggleRAG?: () => void;
    uploadedDocumentCount?: number;
    onOpenDocuments?: () => void;
    onOpenSettings?: () => void;
}

export const DesktopHeader = ({
    sessionTitle,
    ragEnabled = true,
    onToggleRAG,
    uploadedDocumentCount = 0,
    onOpenDocuments,
    onOpenSettings,
}: DesktopHeaderProps) => {
    return (
        <div className="border-b border-border px-6 py-3 bg-card">
            <div className="flex items-center justify-between">
                {/* Left side - Session info */}
                <div className="flex items-center gap-4">
                    <div className="text-sm">
                        <span className="text-muted-foreground">Session: </span>
                        <span className="text-foreground font-medium">
                            {sessionTitle}
                        </span>
                    </div>

                    {/* RAG Status Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 border border-border">
                        <div
                            className={`w-2 h-2 rounded-full ${
                                ragEnabled
                                    ? "bg-green-500 animate-pulse"
                                    : "bg-gray-400"
                            }`}
                        />
                        <span className="text-xs text-muted-foreground">
                            RAG {ragEnabled ? "Enabled" : "Disabled"}
                        </span>
                        {uploadedDocumentCount > 0 && (
                            <span className="text-xs text-primary font-medium">
                                • {uploadedDocumentCount} doc
                                {uploadedDocumentCount !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                </div>

                {/* Right side - Actions */}
                <div className="flex items-center gap-3">
                    {/* RAG Toggle */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-background/50">
                        <span className="text-xs text-muted-foreground">
                            RAG
                        </span>
                        <Switch
                            checked={ragEnabled}
                            onCheckedChange={onToggleRAG}
                            className="scale-75"
                        />
                    </div>

                    {/* Documents Button */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenDocuments}
                        className="gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        Documents
                        {uploadedDocumentCount > 0 && (
                            <span className="px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                                {uploadedDocumentCount}
                            </span>
                        )}
                    </Button>

                    {/* Settings Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onOpenSettings}
                        title="Settings (Ctrl+K)"
                    >
                        <Settings className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};
