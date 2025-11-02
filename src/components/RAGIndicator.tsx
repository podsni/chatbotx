import { Database, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RAGIndicatorProps {
    isEnabled: boolean;
    isSearching?: boolean;
    resultsCount?: number;
    searchEngine?: "duckduckgo" | "brave";
    documentCount?: number;
}

export const RAGIndicator = ({
    isEnabled,
    isSearching = false,
    resultsCount = 0,
    searchEngine,
    documentCount = 0,
}: RAGIndicatorProps) => {
    if (!isEnabled) {
        return null;
    }

    return (
        <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
            <Database className="w-4 h-4 text-primary" />

            {isSearching ? (
                <>
                    <div className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                        <span className="text-xs font-medium text-primary">
                            Searching web...
                        </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {searchEngine === "brave" ? "Brave" : "DuckDuckGo"}
                    </Badge>
                </>
            ) : resultsCount > 0 ? (
                <>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs font-medium text-primary">
                            RAG Active
                        </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {resultsCount}{" "}
                        {resultsCount === 1 ? "source" : "sources"}
                    </Badge>
                    {documentCount > 0 && (
                        <Badge variant="outline" className="text-xs">
                            {documentCount} doc{documentCount !== 1 ? "s" : ""}
                        </Badge>
                    )}
                </>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <XCircle className="w-3 h-3 text-orange-500" />
                        <span className="text-xs font-medium text-muted-foreground">
                            No results found
                        </span>
                    </div>
                </>
            )}
        </div>
    );
};
