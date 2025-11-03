import { Bot, User } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { Message } from "@/lib/db";

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
    const { role, content, modelName, metadata } = message;
    return (
        <div
            className={`flex gap-2 sm:gap-2.5 md:gap-3 mb-3 sm:mb-4 md:mb-6 px-1 ${role === "user" ? "justify-end" : "justify-start"}`}
        >
            {role === "ai" && (
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                </div>
            )}

            <div
                className={`max-w-[80%] sm:max-w-[85%] md:max-w-2xl min-w-0 ${role === "user" ? "order-first" : ""}`}
            >
                <div
                    className={`rounded-xl sm:rounded-2xl px-2.5 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3 overflow-hidden ${
                        role === "ai" ? "bg-chat-ai" : "bg-chat-user"
                    }`}
                >
                    {role === "ai" && modelName && (
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 min-w-0">
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary flex-shrink-0"></div>
                            <span className="text-[9px] sm:text-[10px] md:text-xs font-medium text-foreground truncate block">
                                {modelName}
                            </span>
                        </div>
                    )}

                    <div className="text-[11px] sm:text-xs md:text-sm text-foreground leading-relaxed break-words overflow-wrap-anywhere prose prose-sm max-w-none dark:prose-invert">
                        {role === "ai" ? (
                            <MarkdownRenderer content={content} />
                        ) : (
                            <p className="whitespace-pre-wrap">{content}</p>
                        )}
                    </div>

                    {metadata && (
                        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-border/30">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 text-[8px] sm:text-[9px] md:text-[10px] text-chat-metadata">
                                {metadata.duration && (
                                    <span className="whitespace-nowrap">
                                        {metadata.duration}
                                    </span>
                                )}
                                {metadata.ttft && (
                                    <span className="whitespace-nowrap">
                                        TTFT: {metadata.ttft}
                                    </span>
                                )}
                                {metadata.tokens && (
                                    <span className="hidden sm:inline whitespace-nowrap">
                                        {metadata.tokens}
                                    </span>
                                )}
                                {metadata.speed && (
                                    <span className="whitespace-nowrap">
                                        {metadata.speed}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {role === "user" && (
                <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 text-foreground" />
                </div>
            )}
        </div>
    );
};
