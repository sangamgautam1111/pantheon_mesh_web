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

interface PanelSize {
    width: number;
    height: number;
}

interface PanelPosition {
    x: number;
    y: number;
}

const DEFAULT_PANEL_SIZE: PanelSize = { width: 440, height: 620 };
const MIN_PANEL_SIZE: PanelSize = { width: 360, height: 440 };
const PANEL_MARGIN = 12;
const PANEL_TOP_MARGIN = 56;

function clampNumber(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), Math.max(min, max));
}

function getDefaultPanelPosition(size: PanelSize): PanelPosition {
    return {
        x: window.innerWidth - size.width - 24,
        y: window.innerHeight - size.height - 24,
    };
}

function clampPanelPosition(position: PanelPosition, size: PanelSize): PanelPosition {
    const maxX = window.innerWidth - size.width - PANEL_MARGIN;
    const maxY = window.innerHeight - size.height - PANEL_MARGIN;
    return {
        x: clampNumber(position.x, PANEL_MARGIN, maxX),
        y: clampNumber(position.y, PANEL_TOP_MARGIN, maxY),
    };
}

const SUGGESTIONS = [
    "Post a phone repair request",
    "Explain Needaro MVP",
    "How do shops make offers?",
    "What should I validate first?",
    "Open business plans",
];

export const AiGuide = () => {
    const { isChatOpen: open, setChatOpen: setOpen, navigateAndHighlight } = useGuide();
    const { profile } = useAuth();
    const [messages, setMessages] = useState<ChatMsg[]>([
        {
            id: "welcome",
            role: "assistant",
            text: "Hi, I'm Needaro Assist. Tell me the local service problem or business question, and I will help with requests, offers, plans, or launch steps.",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [panelSize, setPanelSize] = useState<PanelSize>(DEFAULT_PANEL_SIZE);
    const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dragStateRef = useRef<{
        startPointer: PanelPosition;
        startPosition: PanelPosition;
    } | null>(null);
    const resizeStateRef = useRef<{
        startPointer: PanelPosition;
        startSize: PanelSize;
        startPosition: PanelPosition;
    } | null>(null);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 769);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    useEffect(() => {
        if (!open || isMobile) {
            return;
        }
        setPanelPosition((current) => {
            const nextPosition = current ?? getDefaultPanelPosition(panelSize);
            return clampPanelPosition(nextPosition, panelSize);
        });
    }, [open, isMobile, panelSize]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 769) {
                return;
            }
            setPanelPosition((current) => (current ? clampPanelPosition(current, panelSize) : current));
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [panelSize]);

    useEffect(() => {
        const handlePointerMove = (event: PointerEvent) => {
            if (dragStateRef.current) {
                const deltaX = event.clientX - dragStateRef.current.startPointer.x;
                const deltaY = event.clientY - dragStateRef.current.startPointer.y;
                setPanelPosition(
                    clampPanelPosition(
                        {
                            x: dragStateRef.current.startPosition.x + deltaX,
                            y: dragStateRef.current.startPosition.y + deltaY,
                        },
                        panelSize,
                    ),
                );
            }

            if (resizeStateRef.current) {
                const deltaX = event.clientX - resizeStateRef.current.startPointer.x;
                const deltaY = event.clientY - resizeStateRef.current.startPointer.y;
                const maxWidth = window.innerWidth - resizeStateRef.current.startPosition.x - PANEL_MARGIN;
                const maxHeight = window.innerHeight - resizeStateRef.current.startPosition.y - PANEL_MARGIN;
                setPanelSize({
                    width: clampNumber(resizeStateRef.current.startSize.width + deltaX, MIN_PANEL_SIZE.width, maxWidth),
                    height: clampNumber(resizeStateRef.current.startSize.height + deltaY, MIN_PANEL_SIZE.height, maxHeight),
                });
            }
        };

        const handlePointerUp = () => {
            dragStateRef.current = null;
            resizeStateRef.current = null;
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };
    }, [panelSize]);

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

    useEffect(() => {
        const openAssistant = () => setOpen(true);
        window.addEventListener("needaro-open-assistant", openAssistant);
        return () => {
            window.removeEventListener("needaro-open-assistant", openAssistant);
        };
    }, [setOpen]);

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

    const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
        if (isMobile || event.button !== 0) {
            return;
        }
        const currentPosition = panelPosition ?? getDefaultPanelPosition(panelSize);
        dragStateRef.current = {
            startPointer: { x: event.clientX, y: event.clientY },
            startPosition: clampPanelPosition(currentPosition, panelSize),
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
    };

    const handleResizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
        if (isMobile || event.button !== 0) {
            return;
        }
        const currentPosition = panelPosition ?? getDefaultPanelPosition(panelSize);
        resizeStateRef.current = {
            startPointer: { x: event.clientX, y: event.clientY },
            startSize: panelSize,
            startPosition: clampPanelPosition(currentPosition, panelSize),
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        event.preventDefault();
        event.stopPropagation();
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

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="group fixed z-[70] flex items-center justify-center rounded-full bg-slate-950 shadow-2xl transition-all hover:scale-110 active:scale-95"
                    style={{
                        bottom: isMobile ? 16 : 32,
                        right: isMobile ? 16 : 32,
                        width: isMobile ? 56 : 64,
                        height: isMobile ? 56 : 64,
                    }}
                    title="Needaro Assist"
                >
                    <div className="flex h-10 w-10 items-center justify-center p-1">
                        <Image src={chatIcon} alt="Needaro Assist" className="h-full w-full object-contain brightness-0 invert" />
                    </div>
                    {!isMobile && (
                        <div className="pointer-events-none absolute right-20 whitespace-nowrap rounded-lg border border-gray-100 bg-white px-4 py-2 text-sm font-bold text-[#0f1114] opacity-0 shadow-2xl transition-opacity group-hover:opacity-100">
                            Needaro Assist - Ask about requests, offers, or launch
                        </div>
                    )}
                </button>
            )}

            {open && (
                <div
                    className="fixed z-[80] flex flex-col overflow-hidden border shadow-2xl backdrop-blur-xl"
                    style={{
                        background: "var(--bg-surface)",
                        borderColor: isMobile ? "transparent" : "var(--border-color)",
                        width: isMobile ? "100vw" : panelSize.width,
                        height: isMobile ? "100vh" : panelSize.height,
                        top: isMobile ? 0 : panelPosition?.y,
                        left: isMobile ? 0 : panelPosition?.x,
                        bottom: isMobile || panelPosition ? undefined : 24,
                        right: isMobile || panelPosition ? undefined : 24,
                        borderRadius: isMobile ? 0 : 16,
                    }}
                >
                    <div
                        onPointerDown={handleDragStart}
                        className="flex cursor-move select-none items-center justify-between border-b px-4 py-3"
                        style={{ borderColor: "var(--border-color)", background: "var(--bg-surface-variant)" }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white p-0.5 shadow-sm">
                                <Image src={chatIcon} alt="Assistant" className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <div className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                                    Needaro Assist
                                </div>
                                <div className="text-xs" style={{ color: "var(--text-disabled)" }}>
                                    Drag header. Resize corner.
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setOpen(false)}
                            onPointerDown={(event) => event.stopPropagation()}
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
                                                                    : "var(--text-primary)",
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
                                        color: "var(--text-primary)",
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
                                placeholder="Ask about requests, shops, offers, or launch..."
                                className="flex-1 bg-transparent text-sm outline-none"
                                style={{ color: "var(--text-primary)" }}
                            />
                            <button
                                onClick={() => void handleSend()}
                                disabled={!input.trim() || loading}
                                className="rounded p-1.5 transition-opacity disabled:opacity-30"
                                style={{ color: "var(--text-primary)" }}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>
                    {!isMobile && (
                        <div
                            onPointerDown={handleResizeStart}
                            className="absolute bottom-1 right-1 z-10 h-6 w-6 cursor-nwse-resize rounded-br-xl"
                            aria-label="Resize Needaro Assist"
                            title="Resize Needaro Assist"
                        >
                            <div className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-slate-400" />
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
