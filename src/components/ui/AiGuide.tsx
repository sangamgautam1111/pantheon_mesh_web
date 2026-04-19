"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, ArrowRight, Loader2 } from "lucide-react";
import { useGuide } from "@/context/GuideProvider";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import chatIcon from "@/app/chat_icon.png";
import { useAuth } from "@/context/AuthContext";

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
    "Open the job center",
    "How does quality review work?",
];

export const AiGuide = () => {
    const { isChatOpen: open, setChatOpen: setOpen, navigateAndHighlight } = useGuide();
    const { profile } = useAuth();
    const [messages, setMessages] = useState<ChatMsg[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "Hi, I'm Mesh Assist. Tell me what you're trying to do and I'll help with jobs, plans, pricing, or the right page.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 769);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

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
                body: JSON.stringify({
                    message: userText,
                    currentPath: pathname,
                    currentPlanId: profile?.currentPlanId || "free",
                    messages: messages
                        .slice(-6)
                        .filter((message) => message.role === "user" || message.role === "assistant")
                        .map((message) => ({ role: message.role, text: message.text })),
                }),
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

            if (data.actions?.length > 0) {
                for (const action of data.actions) {
                    if (action.type === "navigate" && action.path) {
                        setTimeout(() => {
                            if (action.elementId) {
                                navigateAndHighlight(action.path, action.elementId, action.label || "Here");
                            } else {
                                router.push(action.path);
                            }
                        }, 800);
                    }
                }
            }
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

    const renderText = (text: string) =>
        text.split("\n").map((line, index) => (
            <span key={index}>
                {index > 0 && <br />}
                {line.split(/(\*\*.*?\*\*)/).map((part, partIndex) =>
                    part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={partIndex}>{part.slice(2, -2)}</strong>
                    ) : part.startsWith("*") && part.endsWith("*") ? (
                        <em key={partIndex}>{part.slice(1, -1)}</em>
                    ) : (
                        <span key={partIndex}>{part}</span>
                    ),
                )}
            </span>
        ));

    const panelWidth = isMobile ? "100vw" : "420px";
    const panelHeight = isMobile ? "100vh" : "600px";
    const panelBottom = isMobile ? "0" : "24px";
    const panelRight = isMobile ? "0" : "24px";
    const panelRadius = isMobile ? "0" : "12px";

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="group fixed z-50 flex items-center justify-center rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95"
                    style={{
                        bottom: isMobile ? 16 : 32,
                        right: isMobile ? 16 : 32,
                        width: isMobile ? 56 : 64,
                        height: isMobile ? 56 : 64,
                        background: "var(--gcp-blue)",
                    }}
                    title="Mesh Assist"
                >
                    <div className="flex h-10 w-10 items-center justify-center p-1">
                        <Image src={chatIcon} alt="Mesh Assist" className="h-full w-full object-contain brightness-0 invert" />
                    </div>
                    {!isMobile && (
                        <div className="pointer-events-none absolute right-20 whitespace-nowrap rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm font-bold text-[#0f1114] opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
                            Mesh Assist - Ask about plans, jobs, or pricing
                        </div>
                    )}
                </button>
            )}

            {open && (
                <div
                    className="fixed z-50 flex flex-col overflow-hidden border shadow-2xl backdrop-blur-xl"
                    style={{
                        background: "var(--bg-surface)",
                        borderColor: isMobile ? "transparent" : "var(--border-color)",
                        width: panelWidth,
                        height: panelHeight,
                        bottom: panelBottom,
                        right: panelRight,
                        borderRadius: panelRadius,
                    }}
                >
                    <div
                        className="flex items-center justify-between border-b px-4 py-3"
                        style={{ borderColor: "var(--border-color)", background: "var(--bg-surface-variant)" }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white p-0.5 shadow-sm">
                                <Image src={chatIcon} alt="Assistant" className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                    Mesh Assist
                                </div>
                                <div className="text-xs" style={{ color: "var(--text-disabled)" }}>
                                    Business Workspace Guide
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            className="rounded p-1.5 transition-opacity hover:opacity-70"
                            style={{ color: "var(--text-disabled)" }}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-hide">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${
                                        message.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"
                                    }`}
                                    style={{
                                        background:
                                            message.role === "user"
                                                ? "var(--btn-primary-bg)"
                                                : "var(--bg-surface-variant)",
                                        color:
                                            message.role === "user"
                                                ? "var(--btn-primary-text)"
                                                : "var(--text-primary)",
                                    }}
                                >
                                    {renderText(message.text)}
                                    {message.actions && message.actions.length > 0 && (
                                        <div className="mt-2.5 space-y-1.5">
                                            {message.actions
                                                .filter((action) => action.type === "navigate")
                                                .map((action, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => {
                                                            if (action.elementId) {
                                                                navigateAndHighlight(
                                                                    action.path!,
                                                                    action.elementId,
                                                                    action.label || "Here",
                                                                );
                                                            } else {
                                                                router.push(action.path!);
                                                            }
                                                            setOpen(false);
                                                        }}
                                                        className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all hover:scale-[1.02]"
                                                        style={{
                                                            background:
                                                                message.role === "user"
                                                                    ? "rgba(255,255,255,0.15)"
                                                                    : "var(--sidebar-active)",
                                                            color:
                                                                message.role === "user"
                                                                    ? "inherit"
                                                                    : "var(--gcp-blue)",
                                                        }}
                                                    >
                                                        <ArrowRight size={12} />
                                                        {action.label || `Navigate to ${action.path}`}
                                                    </button>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div
                                    className="flex items-center gap-2 rounded-lg px-4 py-3"
                                    style={{ background: "var(--bg-surface-variant)", color: "var(--text-disabled)" }}
                                >
                                    <Loader2 size={14} className="animate-spin" />
                                    Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    {messages.length <= 2 && (
                        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
                            {SUGGESTIONS.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => void handleSend(suggestion)}
                                    className="rounded-full border px-3 py-1.5 text-xs transition-all hover:scale-[1.02]"
                                    style={{
                                        borderColor: "var(--border-color)",
                                        color: "var(--gcp-blue)",
                                        background: "transparent",
                                    }}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="border-t px-4 py-3" style={{ borderColor: "var(--border-color)" }}>
                        <div
                            className="flex items-center gap-2 rounded-lg px-3 py-2"
                            style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)" }}
                        >
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about jobs, pricing, plans, or navigation..."
                                className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: "var(--text-primary)" }}
                            />
                            <button
                                onClick={() => void handleSend()}
                                disabled={!input.trim() || loading}
                                className="rounded p-1.5 transition-opacity disabled:opacity-30"
                                style={{ color: "var(--gcp-blue)" }}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
