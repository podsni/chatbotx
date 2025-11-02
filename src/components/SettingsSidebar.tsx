import { useState, useEffect } from "react";
import {
  Settings,
  X,
  Globe,
  Search,
  Key,
  Palette,
  Shield,
  Zap,
  Database,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsSidebar = ({ isOpen, onClose }: SettingsSidebarProps) => {
  const [ragEnabled, setRagEnabled] = useState(false);
  const [searchEngine, setSearchEngine] = useState<"duckduckgo" | "brave">(
    "duckduckgo"
  );
  const [braveApiKey, setBraveApiKey] = useState("");
  const [maxSearchResults, setMaxSearchResults] = useState("5");
  const [autoSearch, setAutoSearch] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("chatbotx-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setRagEnabled(settings.ragEnabled ?? false);
        setSearchEngine(settings.searchEngine ?? "duckduckgo");
        setBraveApiKey(settings.braveApiKey ?? "");
        setMaxSearchResults(settings.maxSearchResults ?? "5");
        setAutoSearch(settings.autoSearch ?? false);
      } catch (error) {
        console.error("Error loading settings:", error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      ragEnabled,
      searchEngine,
      braveApiKey,
      maxSearchResults,
      autoSearch,
    };
    localStorage.setItem("chatbotx-settings", JSON.stringify(settings));
  };

  useEffect(() => {
    saveSettings();
  }, [ragEnabled, searchEngine, braveApiKey, maxSearchResults, autoSearch]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-background border-l border-border z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Settings</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full hover:bg-accent"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* RAG & Search Settings */}
              <Accordion type="single" collapsible defaultValue="rag-search">
                <AccordionItem value="rag-search">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-primary" />
                      <span className="font-semibold">
                        RAG & Web Search
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    {/* Enable RAG */}
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="rag-enabled" className="text-sm font-medium">
                          Enable RAG
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Enhance responses with web search
                        </p>
                      </div>
                      <Switch
                        id="rag-enabled"
                        checked={ragEnabled}
                        onCheckedChange={setRagEnabled}
                      />
                    </div>

                    <Separator />

                    {/* Search Engine Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="search-engine" className="text-sm font-medium">
                        Search Engine
                      </Label>
                      <Select
                        value={searchEngine}
                        onValueChange={(value: "duckduckgo" | "brave") =>
                          setSearchEngine(value)
                        }
                        disabled={!ragEnabled}
                      >
                        <SelectTrigger id="search-engine">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="duckduckgo">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4" />
                              DuckDuckGo
                            </div>
                          </SelectItem>
                          <SelectItem value="brave">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Brave Search
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {searchEngine === "duckduckgo"
                          ? "Free, no API key required"
                          : "Requires Brave API key"}
                      </p>
                    </div>

                    {/* Brave API Key */}
                    {searchEngine === "brave" && (
                      <div className="space-y-2">
                        <Label htmlFor="brave-api-key" className="text-sm font-medium">
                          Brave API Key
                        </Label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="brave-api-key"
                            type="password"
                            placeholder="BSA..."
                            value={braveApiKey}
                            onChange={(e) => setBraveApiKey(e.target.value)}
                            className="pl-10"
                            disabled={!ragEnabled}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Get your API key from{" "}
                          <a
                            href="https://brave.com/search/api/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Brave Search API
                          </a>
                        </p>
                      </div>
                    )}

                    <Separator />

                    {/* Max Search Results */}
                    <div className="space-y-2">
                      <Label htmlFor="max-results" className="text-sm font-medium">
                        Max Search Results
                      </Label>
                      <Select
                        value={maxSearchResults}
                        onValueChange={setMaxSearchResults}
                        disabled={!ragEnabled}
                      >
                        <SelectTrigger id="max-results">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 results</SelectItem>
                          <SelectItem value="5">5 results</SelectItem>
                          <SelectItem value="10">10 results</SelectItem>
                          <SelectItem value="15">15 results</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Auto Search */}
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="auto-search" className="text-sm font-medium">
                          Auto Search
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Automatically search for relevant context
                        </p>
                      </div>
                      <Switch
                        id="auto-search"
                        checked={autoSearch}
                        onCheckedChange={setAutoSearch}
                        disabled={!ragEnabled}
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Appearance Settings */}
                <AccordionItem value="appearance">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Palette className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Appearance</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Theme</Label>
                      <Select defaultValue="system">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Performance Settings */}
                <AccordionItem value="performance">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span className="font-semibold">Performance</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-4">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                          Stream Responses
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Show AI responses as they're generated
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Settings are saved automatically
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
