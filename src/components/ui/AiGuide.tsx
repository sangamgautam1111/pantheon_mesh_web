"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Send, Sparkles, ArrowRight, Loader2, Bot } from "lucide-react";
import { useGuide } from "@/context/GuideProvider";
import { useRouter } from "next/navigation";

interface ChatMsg {
    id: string;
    role: "user" | "assistant";
    text: string;
    actions?: { type: string; path?: string; elementId?: string; label?: string }[];
}

const SUGGESTIONS = [
    "What is ANTP protocol?",
    "How does the Swarm work?",
    "Explain knowledge royalties",
    "Show me the marketplace",
    "Take me to the dashboard",
];

export const AiGuide = () => {
    const { isChatOpen: open, setChatOpen: setOpen, navigateAndHighlight } = useGuide();
    const [messages, setMessages] = useState<ChatMsg[]>([
        { id: "welcome", role: "assistant", text: "**Hey! I'm Mesh Assist** — your AI guide for Pantheon Mesh.\n\nI know everything about the protocols: ANTP, Swarm orchestration, Prosperity engine, CyberShield, Memory Fabric, and more.\n\nAsk me anything, or say *\"take me to...\"* and I'll navigate you there." },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 769);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        if (open && inputRef.current) inputRef.current.focus();
    }, [open]);

    const handleSend = async (text?: string) => {
        const userText = text || input.trim();
        if (!userText || loading) return;

        const userMsg: ChatMsg = { id: crypto.randomUUID(), role: "user", text: userText };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText }),
            });
            if (!res.ok) throw new Error("API error");
            const data = await res.json();
            const botMsg: ChatMsg = { id: crypto.randomUUID(), role: "assistant", text: data.response, actions: data.actions || [] };
            setMessages(prev => [...prev, botMsg]);

            if (data.actions?.length > 0) {
                for (const action of data.actions) {
                    if (action.type === "navigate" && action.path) {
                        setTimeout(() => {
                            if (action.elementId) navigateAndHighlight(action.path, action.elementId, action.label || "Click here");
                            else router.push(action.path);
                        }, 800);
                    }
                }
            }
        } catch {
            setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", text: "Connection issue. Please try again." }]);
        }
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    // Simple markdown: **bold** and \n
    const renderText = (t: string) => {
        return t.split("\n").map((line, i) => (
            <span key={i}>
                {i > 0 && <br />}
                {line.split(/(\*\*.*?\*\*)/).map((part, j) =>
                    part.startsWith("**") && part.endsWith("**")
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part.startsWith("*") && part.endsWith("*")
                            ? <em key={j}>{part.slice(1, -1)}</em>
                            : <span key={j}>{part}</span>
                )}
            </span>
        ));
    };

    const panelWidth = isMobile ? "100vw" : "420px";
    const panelHeight = isMobile ? "100vh" : "600px";
    const panelBottom = isMobile ? "0" : "24px";
    const panelRight = isMobile ? "0" : "24px";
    const panelRadius = isMobile ? "0" : "12px";

    return (
        <>
            {/* Floating Chat Button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed z-50 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105"
                    style={{
                        background: "var(--btn-primary-bg)",
                        color: "var(--btn-primary-text)",
                        bottom: isMobile ? 16 : 24,
                        right: isMobile ? 16 : 24,
                        width: isMobile ? 52 : 56,
                        height: isMobile ? 52 : 56,
                    }}
                    title="Mesh Assist"
                >
                    <Bot size={24} />
                </button>
            )}

            {/* Chat Panel */}
            {open && (
                <div className="fixed z-50 flex flex-col overflow-hidden shadow-2xl border"
                    style={{
                        background: "var(--bg-surface)",
                        borderColor: isMobile ? "transparent" : "var(--border-color)",
                        width: panelWidth,
                        height: panelHeight,
                        bottom: panelBottom,
                        right: panelRight,
                        borderRadius: panelRadius,
                    }}>

                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b"
                        style={{ borderColor: "var(--border-color)", background: "var(--bg-surface-variant)" }}>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={{ background: "var(--btn-primary-bg)" }}>
                                <Sparkles size={16} style={{ color: "var(--btn-primary-text)" }} />
                            </div>
                            <div>
                                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Mesh Assist</div>
                                <div className="text-xs" style={{ color: "var(--text-disabled)" }}>AI-Powered Protocol Guide</div>
                            </div>
                        </div>
                        <button onClick={() => setOpen(false)} className="p-1.5 rounded hover:opacity-70 transition-opacity"
                            style={{ color: "var(--text-disabled)" }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] rounded-lg px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "rounded-br-sm" : "rounded-bl-sm"}`}
                                    style={{
                                        background: msg.role === "user" ? "var(--btn-primary-bg)" : "var(--bg-surface-variant)",
                                        color: msg.role === "user" ? "var(--btn-primary-text)" : "var(--text-primary)",
                                    }}>
                                    {renderText(msg.text)}
                                    {msg.actions && msg.actions.length > 0 && (
                                        <div className="mt-2.5 space-y-1.5">
                                            {msg.actions.filter(a => a.type === "navigate").map((a, i) => (
                                                <button key={i} onClick={() => {
                                                    if (a.elementId) navigateAndHighlight(a.path!, a.elementId, a.label || "Here");
                                                    else router.push(a.path!);
                                                    setOpen(false);
                                                }}
                                                    className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md transition-all hover:scale-[1.02]"
                                                    style={{
                                                        background: msg.role === "user" ? "rgba(255,255,255,0.15)" : "var(--sidebar-active)",
                                                        color: msg.role === "user" ? "inherit" : "var(--gcp-blue)",
                                                    }}>
                                                    <ArrowRight size={12} /> Navigate to {a.path}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-lg px-4 py-3 flex items-center gap-2"
                                    style={{ background: "var(--bg-surface-variant)", color: "var(--text-disabled)" }}>
                                    <Loader2 size={14} className="animate-spin" /> Thinking...
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 2 && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                            {SUGGESTIONS.map(s => (
                                <button key={s} onClick={() => handleSend(s)}
                                    className="text-xs px-3 py-1.5 rounded-full border transition-all hover:scale-[1.02]"
                                    style={{ borderColor: "var(--border-color)", color: "var(--gcp-blue)", background: "transparent" }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-4 py-3 border-t" style={{ borderColor: "var(--border-color)" }}>
                        <div className="flex items-center gap-2 rounded-lg px-3 py-2"
                            style={{ background: "var(--input-bg)", border: "1px solid var(--input-border)" }}>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about ANTP, Swarm, CyberShield..."
                                className="flex-1 bg-transparent outline-none text-sm"
                                style={{ color: "var(--text-primary)" }}
                            />
                            <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                                className="p-1.5 rounded transition-opacity disabled:opacity-30"
                                style={{ color: "var(--gcp-blue)" }}>
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
