"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, ShieldCheck, ChevronRight, Loader2, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const KERNEL_HOST = process.env.NEXT_PUBLIC_KERNEL_HOST || "localhost";
const KERNEL_PORT = process.env.NEXT_PUBLIC_KERNEL_PORT || "9090";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LogEntry {
    type: "input" | "output" | "error" | "system";
    content: string;
    timestamp: string;
}

export const SingularityTerminal = () => {
    const { accountType } = useAuth();
    const [logs, setLogs] = useState<LogEntry[]>([
        { type: "system", content: "ANTP KERNEL INITIALIZED", timestamp: new Date().toLocaleTimeString() },
        { type: "system", content: "CYBERSHIELD: EIP-191 SIGNATURE LAYER ACTIVE", timestamp: new Date().toLocaleTimeString() },
        { type: "system", content: "TYPE 'help' FOR AVAILABLE COMMANDS", timestamp: new Date().toLocaleTimeString() },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [kernelConnected, setKernelConnected] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIdx, setHistoryIdx] = useState(-1);

    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    useEffect(() => {
        checkKernelConnection();
    }, []);

    const addLog = (type: LogEntry["type"], content: string) => {
        setLogs(prev => [...prev, { type, content, timestamp: new Date().toLocaleTimeString() }]);
    };

    const checkKernelConnection = async () => {
        try {
            const res = await fetch(`${API}/v1/shell/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: "mesh status" }),
            });
            if (res.ok) {
                setKernelConnected(true);
                addLog("system", "AXIOM KERNEL BRIDGE: CONNECTED");
            }
        } catch {
            setKernelConnected(false);
            addLog("system", "KERNEL BRIDGE: SIMULATION MODE (kernel offline)");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (history.length > 0 && historyIdx < history.length - 1) {
                const newIdx = historyIdx + 1;
                setHistoryIdx(newIdx);
                setInput(history[history.length - 1 - newIdx]);
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (historyIdx > 0) {
                const newIdx = historyIdx - 1;
                setHistoryIdx(newIdx);
                setInput(history[history.length - 1 - newIdx]);
            } else if (historyIdx === 0) {
                setHistoryIdx(-1);
                setInput("");
            }
        }
    };

    const executeViaKernel = async (cmd: string): Promise<{ success: boolean; output: string; error: string } | null> => {
        try {
            const res = await fetch(`${API}/v1/shell/execute`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: cmd }),
            });
            if (res.ok) {
                return await res.json();
            }
        } catch { }
        return null;
    };

    const simulateCommand = (cmd: string): string => {
        const lower = cmd.toLowerCase().trim();

        if (lower === "help") {
            return [
                "AXIOM SHELL COMMANDS",
                "------------------------------------------------------------",
                "mesh status                           Kernel health report",
                "mesh onboard --endpoint <URL> --type   Register a hosted model",
                "mesh bid --task <ID> --stake <AXM>     Submit a financial bid",
                "mesh gig --desc <TEXT> --budget <AXM>  Publish a job for agents",
                "mesh agents                          List registered agents",
                "mesh withdraw --amount <USD>          Request fiat payout",
                "mesh audit --intent <ID>              Audit intent trace",
                "mesh intents                         Recent intent log",
                "help                                  This help message",
                "clear                                 Clear terminal",
                "------------------------------------------------------------",
                "FOUNDER FEE: 5% | DEVELOPER PAYOUT: 95%",
            ].join("\n");
        }

        if (lower === "mesh status" || lower === "status") {
            return [
                "AXIOM KERNEL STATUS",
                "MESH: ONLINE",
                "AGENTS: 0 REGISTERED",
                "BIDS: 0 ACTIVE",
                "GIGS: 0 OPEN",
                "SHIELD: S-CLASS ACTIVE",
                "FOUNDER FEE: 5%",
                "PROTOCOL: CONVERGED",
            ].join("\n");
        }

        if (lower.startsWith("mesh onboard")) {
            return [
                "AGENT ONBOARDED (SIMULATION)",
                "ID: AGT-000001",
                "ENDPOINT: user-provided",
                "TYPE: OLLAMA",
                "STATUS: ONLINE",
                "SKILLS: general, text, reasoning",
                "PAYOUT SHARE: 95% TO YOU",
            ].join("\n");
        }

        if (lower.startsWith("mesh bid")) {
            return [
                "BID SUBMITTED (SIMULATION)",
                "BID ID: BID-00000001",
                "STATUS: IN PRIORITY QUEUE",
            ].join("\n");
        }

        if (lower.startsWith("mesh agents")) {
            return "NO AGENTS REGISTERED\nUse 'mesh onboard --endpoint <URL> --type OLLAMA' to register.";
        }

        if (lower.startsWith("mesh withdraw")) {
            return [
                "WITHDRAWAL REQUEST QUEUED (SIMULATION)",
                "METHOD: STRIPE PAYOUT",
                "ETA: 2-3 BUSINESS DAYS",
                "STATUS: PENDING_FIAT_BRIDGE",
            ].join("\n");
        }

        return "UNKNOWN COMMAND: " + cmd + " | Type 'help' for available commands";
    };

    const handleCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        const cmd = input.trim();
        if (!cmd) return;

        addLog("input", cmd);
        setHistory(prev => [cmd, ...prev.filter(c => c !== cmd)].slice(0, 50));
        setHistoryIdx(-1);
        setInput("");
        setLoading(true);

        if (cmd.toLowerCase() === "clear") {
            setLogs([]);
            setLoading(false);
            return;
        }

        const kernelResult = await executeViaKernel(cmd);

        if (kernelResult) {
            if (kernelResult.success) {
                addLog("output", kernelResult.output);
            } else {
                addLog("error", kernelResult.error);
            }
        } else {
            const simulated = simulateCommand(cmd);
            addLog("output", simulated + "\n[SIMULATION MODE — Connect axiom_core for live execution]");
        }

        setLoading(false);
    };

    return (
        <div className="flex flex-col h-[650px] w-full rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-[#30363d] font-mono text-sm relative"
            style={{ background: "#000000" }}>

            {/* CRT Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

            <div className="flex items-center justify-between px-4 py-2 bg-[#0a0c0f] border-b border-[#30363d] z-20">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="text-[#gcp-blue]" />
                    <span className="text-[11px] text-[#8b949e] font-bold tracking-widest uppercase">AXIOM_SHELL_V1.0</span>
                    <div className="flex items-center gap-1.5 ml-4">
                        <span className={`w-1.5 h-1.5 rounded-full ${kernelConnected ? "bg-[#34a853]" : "bg-[#fbbc04]"} animate-pulse`} />
                        <span className="text-[9px] font-bold tracking-tighter opacity-80" style={{ color: kernelConnected ? "#34a853" : "#fbbc04" }}>
                            {kernelConnected ? "KERNELBRIDGE_ACTIVE" : "SIMULATION_MODE"}
                        </span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setLogs([])} className="p-1 hover:bg-[#1c2128] rounded text-[#484f58] transition-colors"><X size={14} /></button>
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-3 custom-scrollbar z-0 relative">
                {/* Glow Overlay */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(66,133,244,0.05)_0%,transparent_70%)]" />

                {logs.map((log, i) => (
                    <div key={i} className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex items-start gap-3">
                            <span className="text-[#484f58] shrink-0 text-[10px] mt-0.5">[{log.timestamp}]</span>
                            {log.type === "input" && <span className="text-[#4285f4] font-bold">▶</span>}
                            <div className={`whitespace-pre-wrap break-all leading-relaxed ${log.type === "input" ? "text-[#ffffff] font-medium" :
                                log.type === "error" ? "text-[#ea4335]" :
                                    log.type === "system" ? "text-[#24c1e0] opacity-80" :
                                        "text-[#e6edf3]"
                                }`}>
                                {log.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-3 text-[#24c1e0] animate-pulse">
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs font-bold tracking-[0.2em]">MESH_NEGOTIATING_QUORUM...</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleCommand} className="flex items-center gap-3 p-5 bg-[#050505] border-t border-[#1c2128] z-20">
                <span className="text-[#4285f4] font-black drop-shadow-[0_0_8px_rgba(66,133,244,0.4)]">ANTP://{accountType || "GUEST"}#</span>
                <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent border-none outline-none text-[#ffffff] placeholder:text-[#30363d] font-bold"
                    placeholder="ENTER_INTENT_COMMAND"
                />
                <div className="flex items-center gap-2">
                    <div className="text-[10px] text-[#484f58] mr-2 hidden md:block">SHIFT + ENTER FOR MULTI-LINE</div>
                    <button type="submit" disabled={loading} className="p-1.5 rounded bg-[#4285f4]/10 text-[#4285f4] hover:bg-[#4285f4]/20 transition-all disabled:opacity-20 border border-[#4285f4]/30">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </form>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1c2128;
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #30363d;
                }
            `}</style>
        </div>
    );
};
