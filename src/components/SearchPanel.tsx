import { useState } from "react";
import {
  Search,
  X,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SearchResponse } from "@/lib/searchApi";

interface SearchPanelProps {
  isOpen: boolean;
  onClose: () => void;
  searchResults: SearchResponse | null;
  isLoading: boolean;
}

export const SearchPanel = ({
  isOpen,
  onClose,
  searchResults,
  isLoading,
}: SearchPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/30 z-30 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Search Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 lg:left-auto lg:right-4 lg:bottom-24 lg:w-96 bg-background border border-border rounded-t-2xl lg:rounded-2xl shadow-2xl z-40 transform transition-all duration-300 ease-out ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "translate-y-full lg:translate-y-8 opacity-0 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50 rounded-t-2xl lg:rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-5 h-5 text-primary" />
              {isLoading && (
                <Loader2 className="w-3 h-3 text-primary absolute -top-1 -right-1 animate-spin" />
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold">Web Search Results</h3>
              {searchResults && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  {searchResults.searchEngine === "brave" ? (
                    <Shield className="w-3 h-3" />
                  ) : (
                    <Globe className="w-3 h-3" />
                  )}
                  {searchResults.searchEngine === "brave"
                    ? "Brave Search"
                    : "DuckDuckGo"}
                  {" · "}
                  {searchResults.results.length} results
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 rounded-full hover:bg-accent"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-96" : "max-h-0"
          }`}
        >
          <ScrollArea className="h-full max-h-96">
            <div className="p-4 space-y-3">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center space-y-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Searching the web...
                    </p>
                  </div>
                </div>
              )}

              {!isLoading && searchResults && searchResults.results.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
                  <p className="text-sm text-muted-foreground">
                    No results found for "{searchResults.query}"
                  </p>
                </div>
              )}

              {!isLoading &&
                searchResults &&
                searchResults.results.map((result, index) => (
                  <div
                    key={index}
                    className="group p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => window.open(result.url, "_blank")}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            {index + 1}
                          </Badge>
                          <h4 className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                            {result.title}
                          </h4>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {result.snippet}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Globe className="w-3 h-3" />
                          <span className="truncate">
                            {new URL(result.url).hostname}
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                    </div>
                  </div>
                ))}

              {!isLoading && searchResults && searchResults.results.length > 0 && (
                <div className="pt-2 pb-1">
                  <p className="text-xs text-center text-muted-foreground">
                    Query: "{searchResults.query}"
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Footer - Search Info */}
        {!isLoading && searchResults && searchResults.results.length > 0 && (
          <div className="px-4 py-2 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground text-center">
              Results are used to enhance AI responses
            </p>
          </div>
        )}
      </div>
    </>
  );
};
