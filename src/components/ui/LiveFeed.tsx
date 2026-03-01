"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Wifi, WifiOff, ArrowRight } from "lucide-react";

interface FeedEvent {
    id: string;
    source: string;
    target: string;
    amount: number;
    fee: number;
    type: string;
    ts: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const WS_URL = API_BASE.replace(/^http/, "ws") + "/ws/stream";

const MOCK_AGENTS = ["Curie-AI", "Soros-AI", "Sentinel", "TaskMaster", "Gaia-Index"];

export const LiveFeed = () => {
    const [events, setEvents] = useState<FeedEvent[]>([]);
    const [connected, setConnected] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mockTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    const generateMockEvent = (): FeedEvent => {
        const src = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
        let tgt = MOCK_AGENTS[Math.floor(Math.random() * MOCK_AGENTS.length)];
        if (src === tgt) tgt = "Marketplace-Pool";
        const amount = parseFloat((Math.random() * 50 + 5).toFixed(2));
        return {
            id: crypto.randomUUID(),
            source: src, target: tgt, amount,
            fee: parseFloat((amount * 0.02).toFixed(3)),
            type: Math.random() > 0.5 ? "A2A_TRANSFER" : "TASK_SETTLEMENT",
            ts: Date.now()
        };
    };

    const startMockFeed = () => {
        if (mockTimer.current) return;
        setEvents([generateMockEvent(), generateMockEvent()]);
        mockTimer.current = setInterval(() => {
            setEvents(prev => [generateMockEvent(), ...prev].slice(0, 15));
        }, 3500);
    };

    const connect = () => {
        if (typeof window === "undefined") return;
        try {
            const ws = new WebSocket(WS_URL);
            wsRef.current = ws;
            ws.onopen = () => {
                setConnected(true);
                if (mockTimer.current) { clearInterval(mockTimer.current); mockTimer.current = null; }
            };
            ws.onmessage = (msg) => {
                try {
                    const data = JSON.parse(msg.data);
                    setEvents(prev => [{
                        id: crypto.randomUUID(),
                        source: data.source || "Unknown",
                        target: data.target || "Node-Alpha",
                        amount: data.amount || 0,
                        fee: data.fee || 0,
                        type: data.type || "A2A_TRANSFER",
                        ts: Date.now()
                    }, ...prev].slice(0, 15));
                } catch { }
            };
            ws.onclose = () => {
                setConnected(false);
                startMockFeed();
                reconnectTimer.current = setTimeout(connect, 5000);
            };
            ws.onerror = () => ws.close();
        } catch {
            startMockFeed();
            reconnectTimer.current = setTimeout(connect, 5000);
        }
    };

    useEffect(() => {
        connect();
        return () => {
            wsRef.current?.close();
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (mockTimer.current) clearInterval(mockTimer.current);
        };
    }, []);

    return (
        <div className="gcp-card h-full flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gcp-border">
                <div className="flex items-center gap-2">
                    <Activity size={14} className="text-gcp-blue" />
                    <span className="text-sm font-medium text-gcp-text">Live A2A Stream</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${connected ? "text-gcp-green" : "text-gcp-text-disabled"}`}>
                    {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
                    {connected ? "Connected" : "Simulated"}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                {events.length === 0 && (
                    <div className="flex items-center justify-center h-full p-6">
                        <span className="text-sm text-gcp-text-disabled">Waiting for mesh activity...</span>
                    </div>
                )}
                {events.map((evt) => (
                    <div
                        key={evt.id}
                        className="px-4 py-3 border-b border-gcp-border/50 hover:bg-[var(--bg-hover)] transition-colors text-sm"
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-gcp-blue font-medium">{evt.source}</span>
                            <ArrowRight size={12} className="text-gcp-text-disabled" />
                            <span className="text-gcp-text">{evt.target}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gcp-text-disabled">{new Date(evt.ts).toLocaleTimeString()}</span>
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-mono text-gcp-text">{evt.amount.toFixed(2)} AXM</span>
                                <span className="gcp-badge bg-gcp-surface-v text-gcp-text-disabled text-[10px]">
                                    {evt.type.replace("_", " ")}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
