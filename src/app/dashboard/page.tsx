"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, ArrowRight, Loader2, Paperclip } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import chatIcon from "@/app/chat_icon.png";
import { RouteGuard } from "@/components/auth/RouteGuard";

interface ChatMsg {
    id: string;
    role: "user" | "assistant";
    text: string;
    actions?: { type: string; path?: string; elementId?: string; label?: string }[];
}

const SUGGESTIONS = [
    "How do I post a job?",
    "Explain the business plans",
    "Show me pricing",
    "Open the job center"
];

export default function Dashboard() {
    const [messages, setMessages] = useState<ChatMsg[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "**Hi, I'm Mesh Assist.** I can help you navigate the business workspace, explain pricing, and point you to the right place to post and track jobs.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (text?: string) => {
        const userText = text || input.trim();
        if (!userText || loading) {
            return;
        }

        const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", text: userText };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText }),
            });

            if (!response.ok) {
                throw new Error("API error");
            }

            const data = await response.json();
            const botMsg: ChatMsg = {
                id: crypto.randomUUID(),
                role: "assistant",
                text: data.response,
                actions: data.actions || [],
            };
            setMessages((prev) => [...prev, botMsg]);

        } catch {
            setMessages((prev) => [
                ...prev,
                { id: crypto.randomUUID(), role: "assistant", text: "Connection issue. Please try again." },
            ]);
        }

        setLoading(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSend();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const userMsg: ChatMsg = { 
            id: crypto.randomUUID(), 
            role: "user", 
            text: `[Attached File: ${file.name}]` 
        };
        setMessages((prev) => [...prev, userMsg]);
        
        // Mocking an assistant response for the file attachment
        setTimeout(() => {
            setMessages(prev => [...prev, {
                id: crypto.randomUUID(),
                role: "assistant",
                text: `I've received ${file.name}. I will attach this to your context for upcoming job requests. What would you like to do next?`
            }]);
        }, 1000);
        
        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const renderText = (text: string) =>
        text.split("\n").map((line, index) => (
            <span key={index}>
                {index > 0 && <br />}
                {line.split(/(\*\*.*?\*\*)/).map((part, partIndex) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={partIndex} className="font-bold">{part.slice(2, -2)}</strong>
                    ) : part.startsWith("*") && part.endsWith("*") ? (
                        <em key={partIndex} className="italic">{part.slice(1, -1)}</em>
                    ) : (
                        <span key={partIndex}>{part}</span>
                    ),
                )}
            </span>
        ));

    return (
        <RouteGuard allowedTypes={["business"]}>
            <div className="flex h-[calc(100vh-48px)] w-full flex-col bg-slate-50">
                <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden bg-white shadow-sm sm:my-6 sm:rounded-2xl sm:border sm:border-gray-200">
                    <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-6 py-4">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gray-100 bg-slate-50 p-1 shadow-sm">
                            <Image src={chatIcon} alt="Assistant" className="h-full w-full object-contain" />
                        </div>
                        <div>
                            <div className="text-lg font-semibold text-gray-900">
                                Mesh Assist
                            </div>
                            <div className="text-sm text-gray-500">
                                Global Business Navigator
                            </div>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-6 overflow-y-auto bg-slate-50 p-6 md:p-8 scrollbar-hide">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] md:max-w-[70%] px-5 py-3 text-sm md:text-base leading-relaxed shadow-sm ${
                                        message.role === "user" 
                                            ? "rounded-2xl rounded-br-sm bg-blue-600 text-white" 
                                            : "rounded-2xl rounded-bl-sm bg-white border border-gray-100 text-gray-800"
                                    }`}
                                >
                                    {renderText(message.text)}
                                    {message.actions && message.actions.length > 0 && (
                                        <div className="mt-3 space-y-2">
                                            {message.actions
                                                .filter((action) => action.type === "navigate")
                                                .map((action, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            router.push(action.path!);
                                                        }}
                                                        className={`flex w-full items-center gap-2 rounded-xl px-4 py-2 font-medium transition-all hover:scale-[1.02] ${
                                                            message.role === "user"
                                                                ? "bg-white/20 text-white hover:bg-white/30"
                                                                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                        }`}
                                                    >
                                                        <ArrowRight size={14} />
                                                        Navigate to {action.path}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="flex items-center gap-2 rounded-2xl rounded-bl-sm border border-gray-100 bg-white px-5 py-4 shadow-sm text-gray-500">
                                    <Loader2 size={16} className="animate-spin text-blue-600" />
                                    <span className="text-sm font-medium">Thinking...</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {messages.length <= 2 && (
                        <div className="flex flex-wrap gap-2 bg-slate-50 px-6 pb-2 md:px-8">
                            {SUGGESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => void handleSend(suggestion)}
                                    className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="bg-white p-4 md:p-6 border-t border-gray-100">
                        <div className="flex items-end gap-2 rounded-2xl border border-gray-300 bg-white p-2 shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                            
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileChange}
                            />
                            
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none"
                                title="Attach File"
                            >
                                <Paperclip size={20} />
                            </button>
                            
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Message Mesh Assist..."
                                className="max-h-32 min-h-[40px] w-full resize-none bg-transparent py-2.5 px-2 text-base text-gray-900 outline-none placeholder:text-gray-400"
                                rows={1}
                            />
                            
                            <button
                                onClick={() => void handleSend()}
                                disabled={!input.trim() || loading}
                                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white transition-all hover:bg-blue-700 focus:outline-none disabled:opacity-50 disabled:hover:bg-blue-600"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                        <p className="mt-3 text-center text-xs text-gray-400">
                            Mesh Assist can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
