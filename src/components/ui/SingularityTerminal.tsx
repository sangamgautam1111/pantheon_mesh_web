"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, ShieldCheck, ChevronRight, Loader2, Sparkles, X } from "lucide-react";

const KERNEL_HOST = process.env.NEXT_PUBLIC_KERNEL_HOST || "localhost";
const KERNEL_PORT = process.env.NEXT_PUBLIC_KERNEL_PORT || "9090";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface LogEntry {
    type: "input" | "output" | "error" | "system";
    content: string;
    timestamp: string;
}

export const SingularityTerminal = () => {
    const [logs, setLogs] = useState<LogEntry[]>([
        { type: "system", content: "ANTP KERNEL INITIALIZED", timestamp: new Date().toLocaleTimeString() },
        { type: "system", content: "CYBERSHIELD: EIP-191 SIGNATURE LAYER ACTIVE", timestamp: new Date().toLocaleTimeString() },
        { type: "system", content: "TYPE 'help' FOR AVAILABLE COMMANDS", timestamp: new Date().toLocaleTimeString() },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [kernelConnected, setKernelConnected] = useState(false);
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
        <div className="flex flex-col h-[600px] w-full rounded-lg overflow-hidden shadow-2xl border border-[#30363d] font-mono text-sm"
            style={{ background: "#0d1117" }}>

            <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                    <TerminalIcon size={14} className="text-[#8b949e]" />
                    <span className="text-xs text-[#8b949e] font-bold tracking-tight">AXIOM_SHELL</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold tracking-tighter ${kernelConnected ? "bg-[#81c995]/20 text-[#81c995]" : "bg-[#fde293]/20 text-[#fde293]"}`}>
                        {kernelConnected ? "KERNEL LIVE" : "SIMULATION"}
                    </span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#f28b82] opacity-30" />
                    <div className="w-3 h-3 rounded-full bg-[#fde293] opacity-30" />
                    <div className="w-3 h-3 rounded-full bg-[#81c995] opacity-30" />
                </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-2 custom-scrollbar">
                {logs.map((log, i) => (
                    <div key={i} className="flex flex-col">
                        <div className="flex items-start gap-2">
                            <span className="text-[#484f58] shrink-0">[{log.timestamp}]</span>
                            {log.type === "input" && <span className="text-[#81c995] italic">user@axiom:~$</span>}
                            <div className={`whitespace-pre-wrap break-all ${log.type === "input" ? "text-[#e6edf3]" :
                                log.type === "error" ? "text-[#f28b82]" :
                                    log.type === "system" ? "text-[#8ab4f8]" :
                                        "text-[#c9d1d9]"
                                }`}>
                                {log.content}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex items-center gap-2 text-[#8ab4f8] animate-pulse">
                        <Loader2 size={14} className="animate-spin" />
                        <span>RESOLVING MESH QUORUM...</span>
                    </div>
                )}
            </div>

            <form onSubmit={handleCommand} className="flex items-center gap-2 p-4 bg-[#0d1117] border-t border-[#30363d]">
                <span className="text-[#81c995] font-bold">user@axiom:~$</span>
                <input
                    ref={inputRef}
                    autoFocus
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-[#e6edf3] placeholder:text-[#484f58]"
                    placeholder="Type a command or an intent..."
                />
                <button type="submit" disabled={loading} className="text-[#81c995] hover:text-[#aff5b4] transition-colors disabled:opacity-30">
                    <ChevronRight size={20} />
                </button>
            </form>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #30363d;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #484f58;
                }
            `}</style>
        </div>
    );
};
