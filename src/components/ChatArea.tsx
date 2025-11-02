import { useState, useRef, useEffect } from "react";
import {
    Send,
    Loader2,
    Search as SearchIcon,
    Upload,
    FileText,
} from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { MobileHeader } from "./MobileHeader";
import { DesktopHeader } from "./DesktopHeader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chatDB, Message } from "@/lib/db";
import { aiApi, UnifiedMessage, Provider } from "@/lib/aiApi";
import { useToast } from "@/hooks/use-toast";
import { useRAG } from "@/hooks/useRAG";
import { SearchResponse, getSearchSettings } from "@/lib/searchApi";
import {
    ProcessedDocument,
    formatDocumentsForRAG,
} from "@/lib/documentProcessor";
import { DocumentUpload } from "@/components/DocumentUpload";

interface ChatAreaProps {
    onMenuClick: () => void;
    sessionId?: string;
    modelName?: string;
    provider?: Provider;
    onSearchResults?: (results: SearchResponse) => void;
    onSearchStart?: () => void;
    onSearchEnd?: () => void;
    onOpenSettings?: () => void;
}

export const ChatArea = ({
    onMenuClick,
    sessionId,
    modelName,
    provider,
    onSearchResults,
    onSearchStart,
    onSearchEnd,
    onOpenSettings,
}: ChatAreaProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionTitle, setSessionTitle] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [currentSearchResults, setCurrentSearchResults] =
        useState<SearchResponse | null>(null);
    const [uploadedDocuments, setUploadedDocuments] = useState<
        ProcessedDocument[]
    >([]);
    const [documentPanelOpen, setDocumentPanelOpen] = useState(false);
    const [ragEnabledForSession, setRagEnabledForSession] = useState(true);
    const { toast } = useToast();
    const { performWebSearch, getRAGContext, shouldAutoSearch } = useRAG();

    // Get RAG settings
    const ragSettings = getSearchSettings();

    // Combined RAG enabled state (global setting AND session toggle)
    const isRagEnabled = ragSettings.ragEnabled && ragEnabledForSession;

    // Load messages when session changes
    useEffect(() => {
        if (sessionId) {
            loadMessages();
            loadSessionInfo();
        } else {
            setMessages([]);
            setSessionTitle("No session selected");
        }
    }, [sessionId]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height =
                textareaRef.current.scrollHeight + "px";
        }
    }, [input]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollElement = scrollAreaRef.current.querySelector(
                "[data-radix-scroll-area-viewport]",
            );
            if (scrollElement) {
                scrollElement.scrollTop = scrollElement.scrollHeight;
            }
        }
    }, [messages]);

    const loadMessages = async () => {
        if (!sessionId) return;
        try {
            const sessionMessages =
                await chatDB.getMessagesBySession(sessionId);
            setMessages(sessionMessages);
        } catch (error) {
            console.error("Error loading messages:", error);
            toast({
                title: "Error",
                description: "Failed to load messages",
                variant: "destructive",
            });
        }
    };

    const loadSessionInfo = async () => {
        if (!sessionId) return;
        try {
            const session = await chatDB.getSession(sessionId);
            if (session) {
                setSessionTitle(session.title);
            }
        } catch (error) {
            console.error("Error loading session:", error);
        }
    };

    const handleSendMessage = async () => {
        if (
            !input.trim() ||
            isLoading ||
            !sessionId ||
            !modelName ||
            !provider
        ) {
            if (!sessionId) {
                toast({
                    title: "No session",
                    description: "Please create a new chat session first",
                    variant: "destructive",
                });
            }
            return;
        }

        const userMessageContent = input.trim();
        setInput("");
        setIsLoading(true);

        // Add user message to UI and DB
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            sessionId,
            role: "user",
            content: userMessageContent,
            timestamp: Date.now(),
        };

        try {
            await chatDB.addMessage(userMessage);
            setMessages((prev) => [...prev, userMessage]);

            // Build RAG context from multiple sources
            let ragContext = "";

            // 1. Add uploaded documents context
            if (isRagEnabled && uploadedDocuments.length > 0) {
                const docContext = formatDocumentsForRAG(uploadedDocuments);
                ragContext += docContext;
            }

            // 2. Add web search context if auto-search is enabled
            if (isRagEnabled && shouldAutoSearch(userMessageContent)) {
                setIsSearching(true);
                onSearchStart?.();
                const searchResponse =
                    await performWebSearch(userMessageContent);
                setIsSearching(false);
                onSearchEnd?.();

                if (searchResponse && searchResponse.results.length > 0) {
                    ragContext += getRAGContext(searchResponse);
                    setCurrentSearchResults(searchResponse);
                    onSearchResults?.(searchResponse);
                } else {
                    setCurrentSearchResults(null);
                }
            }

            // Prepare messages for API
            const apiMessages: UnifiedMessage[] = messages
                .filter((m) => m.role === "user" || m.role === "ai")
                .map((m) => ({
                    role: m.role === "ai" ? "assistant" : "user",
                    content: m.content,
                }));

            // Add current user message with RAG context
            const messageContent = ragContext
                ? ragContext + userMessageContent
                : userMessageContent;

            apiMessages.push({
                role: "user",
                content: messageContent,
            });

            // Start timing
            const startTime = Date.now();
            let firstTokenTime: number | null = null;

            // Create placeholder for AI response
            const aiMessageId = `ai-${Date.now()}`;
            let aiContent = "";

            const aiMessage: Message = {
                id: aiMessageId,
                sessionId,
                role: "ai",
                content: "",
                timestamp: Date.now(),
                modelName,
                metadata: {},
            };

            setMessages((prev) => [...prev, aiMessage]);

            // Call AI API with streaming
            await aiApi.sendMessage(
                {
                    provider,
                    model: modelName,
                    messages: apiMessages,
                    temperature: 0.7,
                    max_tokens: 2000,
                },
                // onChunk
                (chunk: string) => {
                    if (firstTokenTime === null) {
                        firstTokenTime = Date.now();
                    }
                    aiContent += chunk;
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === aiMessageId
                                ? { ...m, content: aiContent }
                                : m,
                        ),
                    );
                },
                // onComplete
                async () => {
                    const endTime = Date.now();
                    const duration = ((endTime - startTime) / 1000).toFixed(2);
                    const ttft = firstTokenTime
                        ? ((firstTokenTime - startTime) / 1000).toFixed(2)
                        : "0";

                    // Count tokens (approximate)
                    const tokenCount = aiContent.split(/\s+/).length;
                    const tokensPerSecond = (
                        tokenCount /
                        ((endTime - startTime) / 1000)
                    ).toFixed(0);

                    const finalMetadata = {
                        duration: `${duration}s`,
                        ttft: `${ttft}s`,
                        tokens: `${tokenCount} tokens`,
                        speed: `${tokensPerSecond} tok/s`,
                    };

                    // Update message with metadata
                    const finalMessage: Message = {
                        id: aiMessageId,
                        sessionId,
                        role: "ai",
                        content: aiContent,
                        timestamp: Date.now(),
                        modelName,
                        metadata: finalMetadata,
                    };

                    await chatDB.addMessage(finalMessage);
                    setMessages((prev) =>
                        prev.map((m) =>
                            m.id === aiMessageId ? finalMessage : m,
                        ),
                    );

                    // Update session with last message
                    const session = await chatDB.getSession(sessionId);
                    if (session) {
                        await chatDB.updateSession({
                            ...session,
                            lastMessage: userMessageContent.substring(0, 50),
                            timestamp: Date.now(),
                        });
                    }

                    setIsLoading(false);
                },
                // onError
                (error: Error) => {
                    console.error("Error from Poe API:", error);
                    toast({
                        title: "Error",
                        description:
                            error.message || "Failed to get response from AI",
                        variant: "destructive",
                    });

                    // Remove the placeholder message
                    setMessages((prev) =>
                        prev.filter((m) => m.id !== aiMessageId),
                    );
                    setIsLoading(false);
                },
            );
        } catch (error) {
            console.error("Error sending message:", error);
            toast({
                title: "Error",
                description: "Failed to send message",
                variant: "destructive",
            });
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col h-screen">
            {/* Headers */}
            <MobileHeader
                onMenuClick={onMenuClick}
                sessionTitle={sessionTitle}
                ragEnabled={isRagEnabled}
                isSearching={isSearching}
                resultsCount={currentSearchResults?.results.length || 0}
                searchEngine={ragSettings.searchEngine}
                onOpenSettings={onOpenSettings}
                onToggleRAG={setRagEnabledForSession}
                documentCount={uploadedDocuments.length}
            />
            <DesktopHeader
                sessionTitle={sessionTitle}
                ragEnabled={isRagEnabled}
                isSearching={isSearching}
                resultsCount={currentSearchResults?.results.length || 0}
                searchEngine={ragSettings.searchEngine}
                onOpenSettings={onOpenSettings}
                onToggleRAG={setRagEnabledForSession}
                documentCount={uploadedDocuments.length}
            />

            {/* Messages */}
            <ScrollArea className="flex-1 w-full" ref={scrollAreaRef}>
                <div className="max-w-5xl mx-auto px-2 sm:px-3 py-3 sm:py-4 md:p-6">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-12">
                            <div className="text-muted-foreground mb-4">
                                <svg
                                    className="w-16 h-16 mx-auto mb-4 opacity-50"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                    />
                                </svg>
                                <p className="text-lg font-medium">
                                    {sessionId
                                        ? "Start a conversation"
                                        : "Create a new chat to get started"}
                                </p>
                                <p className="text-sm mt-2">
                                    {sessionId
                                        ? `Using ${modelName || "AI model"}`
                                        : "Select a model from the sidebar"}
                                </p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <ChatMessage
                                key={message.id}
                                role={message.role}
                                content={message.content}
                                modelName={message.modelName}
                                metadata={message.metadata}
                            />
                        ))
                    )}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-muted-foreground py-4">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">AI is thinking...</span>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Document Upload Panel */}
            <DocumentUpload
                isOpen={documentPanelOpen}
                onClose={() => setDocumentPanelOpen(false)}
                documents={uploadedDocuments}
                onDocumentsChange={setUploadedDocuments}
            />

            {/* Input Area */}
            <div className="border-t border-border p-2 sm:p-3 md:p-6 bg-card safe-bottom flex-shrink-0">
                <div className="max-w-5xl mx-auto w-full">
                    {/* Document indicator */}
                    {uploadedDocuments.length > 0 && (
                        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                            <FileText className="w-3 h-3" />
                            <span>
                                {uploadedDocuments.length} document
                                {uploadedDocuments.length !== 1 ? "s" : ""} in
                                context
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDocumentPanelOpen(true)}
                                className="h-5 text-xs px-2"
                            >
                                Manage
                            </Button>
                        </div>
                    )}

                    <div className="flex gap-1.5 sm:gap-2 md:gap-3 items-end">
                        <div className="relative flex-1 min-w-0">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={
                                    sessionId
                                        ? "Type your message... (RAG enabled for questions)"
                                        : "Create a session first..."
                                }
                                rows={1}
                                disabled={isLoading || !sessionId}
                                className="min-h-[40px] sm:min-h-[44px] md:min-h-[60px] max-h-28 sm:max-h-32 resize-none bg-input border-border text-xs sm:text-sm md:text-base w-full pr-10"
                            />
                            {shouldAutoSearch(input) && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <SearchIcon className="w-4 h-4 text-primary animate-pulse" />
                                </div>
                            )}
                        </div>

                        {/* Upload Document Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-10 w-10 sm:h-11 sm:w-11 md:h-[60px] md:w-[60px] flex-shrink-0"
                            onClick={() => setDocumentPanelOpen(true)}
                            disabled={isLoading || !sessionId}
                            title="Upload documents for RAG"
                        >
                            <Upload className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                        </Button>

                        {/* Send Button */}
                        <Button
                            size="icon"
                            className="h-10 w-10 sm:h-11 sm:w-11 md:h-[60px] md:w-[60px] flex-shrink-0"
                            onClick={handleSendMessage}
                            disabled={isLoading || !input.trim() || !sessionId}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
