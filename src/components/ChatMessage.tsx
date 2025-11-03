import { Bot, User, Copy, Check } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Message } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
    const { role, content, modelName, metadata } = message;
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopyMessage = async () => {
        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(content);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast({
                        title: "Copied!",
                        description: "Message copied to clipboard.",
                    });
                    return;
                } catch (clipboardError) {
                    console.warn(
                        "Clipboard API failed, trying fallback:",
                        clipboardError,
                    );
                }
            }

            // Fallback method
            const textArea = document.createElement("textarea");
            textArea.value = content;
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            document.body.appendChild(textArea);
            textArea.select();

            try {
                const successful = document.execCommand("copy");
                if (successful) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast({
                        title: "Copied!",
                        description: "Message copied to clipboard.",
                    });
                } else {
                    throw new Error("execCommand failed");
                }
            } finally {
                document.body.removeChild(textArea);
            }
        } catch (error) {
            console.error("Error copying message:", error);
            toast({
                title: "Copy Failed",
                description: "Failed to copy message.",
                variant: "destructive",
            });
        }
    };

    return (
        <div
            className={`flex gap-2 sm:gap-2.5 md:gap-3 mb-4 sm:mb-5 md:mb-6 px-1 sm:px-2 group ${role === "user" ? "justify-end" : "justify-start"}`}
        >
            {role === "ai" && (
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-primary/20 flex items-center justify-center ring-2 ring-primary/10">
                    <Bot className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-primary" />
                </div>
            )}

            <div
                className={`max-w-[85%] sm:max-w-[85%] md:max-w-2xl min-w-0 ${role === "user" ? "order-first" : ""} relative`}
            >
                {/* Copy Button - Always visible on mobile, hover on desktop */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyMessage}
                    className={`absolute -top-1 ${role === "user" ? "-left-1" : "-right-1"} sm:top-1 sm:${role === "user" ? "left-1" : "right-1"} h-8 w-8 sm:h-7 sm:w-7 transition-all duration-200 z-10 rounded-lg ${
                        copied
                            ? "opacity-100 scale-100 bg-green-500/20 hover:bg-green-500/30 border-2 border-green-500/50 shadow-lg"
                            : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:scale-105 bg-background/95 backdrop-blur-sm hover:bg-background border border-border/50 shadow-md hover:shadow-lg active:scale-95"
                    }`}
                    title="Copy message"
                >
                    {copied ? (
                        <Check className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-green-600 dark:text-green-400 animate-in zoom-in duration-200" />
                    ) : (
                        <Copy className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-foreground/70" />
                    )}
                </Button>

                <div
                    className={`rounded-2xl sm:rounded-2xl px-3 py-2.5 sm:px-3.5 sm:py-2.5 md:px-4 md:py-3 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 ${
                        role === "ai" ? "bg-chat-ai" : "bg-chat-user"
                    }`}
                >
                    {role === "ai" && modelName && (
                        <div className="flex items-center gap-2 mb-2 min-w-0 pb-1.5 border-b border-border/20">
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-pulse"></div>
                            <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-primary/90 truncate block">
                                {modelName}
                            </span>
                        </div>
                    )}

                    <div className="text-[13px] sm:text-sm md:text-[15px] text-foreground leading-relaxed break-words overflow-wrap-anywhere prose prose-sm max-w-none dark:prose-invert">
                        {role === "ai" ? (
                            <MarkdownRenderer content={content} />
                        ) : (
                            <p className="whitespace-pre-wrap">{content}</p>
                        )}
                    </div>

                    {metadata && (
                        <div className="mt-2 sm:mt-2.5 pt-2 sm:pt-2.5 border-t border-border/20">
                            <div className="flex flex-wrap gap-2 sm:gap-2.5 md:gap-3 text-[9px] sm:text-[10px] md:text-[10px] text-chat-metadata font-medium">
                                {metadata.duration && (
                                    <span className="whitespace-nowrap flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/50">
                                        ⏱️ {metadata.duration}
                                    </span>
                                )}
                                {metadata.ttft && (
                                    <span className="whitespace-nowrap flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/50">
                                        ⚡ {metadata.ttft}
                                    </span>
                                )}
                                {metadata.tokens && (
                                    <span className="hidden sm:flex whitespace-nowrap items-center gap-1 px-1.5 py-0.5 rounded bg-background/50">
                                        📊 {metadata.tokens}
                                    </span>
                                )}
                                {metadata.speed && (
                                    <span className="whitespace-nowrap flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/50">
                                        🚀 {metadata.speed}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {role === "user" && (
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                    <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-foreground" />
                </div>
            )}
        </div>
    );
};
