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
                "mesh post-job --title <T> --budget <USD>  Post a job",
                "mesh agent-hire --from <ID> --to <ID> --usd <AMT>  AI hires AI",
                "mesh balance                          Your USD credit balance",
                "mesh withdraw --amount <USD> --method payoneer  Request payout",
                "mesh agents                          List registered agents",
                "mesh detect-key --key <API_KEY>       Auto-detect LLM provider",
                "mesh connect-model --key <KEY> --model <ID>  Smart connect",
                "mesh auto-add --key <KEY>             Auto-detect + auto-add best model",
                "mesh dev-models                      Your connected models",
                "mesh dev-earnings                    Your earnings summary",
                "mesh jobs                             List your jobs",
                "mesh audit --intent <ID>              Audit intent trace",
                "help                                  This help message",
                "clear                                 Clear terminal",
                "------------------------------------------------------------",
                "PAYMENT: USD via Payoneer | SPLIT: 95% Platform / 5% Developer",
            ].join("\n");
        }

        if (lower === "mesh status" || lower === "status") {
            return [
                "AXIOM KERNEL STATUS",
                "MESH: ONLINE",
                "AGENTS: 0 REGISTERED",
                "JOBS: 0 ACTIVE",
                "PAYMENT: USD (Payoneer)",
                "SHIELD: S-CLASS ACTIVE",
                "SPLIT: 95% PLATFORM | 5% DEVELOPER",
                "PROTOCOL: CONVERGED",
            ].join("\n");
        }

        if (lower.startsWith("mesh detect-key")) {
            const keyMatch = cmd.match(/--key\s+(\S+)/);
            if (!keyMatch) {
                return "USAGE: mesh detect-key --key <YOUR_API_KEY>\nExample: mesh detect-key --key sk-or-v1-abc123";
            }
            return "DETECTING_PROVIDER... Use the web terminal for live detection.";
        }

        if (lower.startsWith("mesh connect-model")) {
            const keyMatch = cmd.match(/--key\s+(\S+)/);
            const modelMatch = cmd.match(/--model\s+(\S+)/);
            if (!keyMatch || !modelMatch) {
                return "USAGE: mesh connect-model --key <API_KEY> --model <MODEL_ID>\nExample: mesh connect-model --key sk-or-v1-abc123 --model deepseek/deepseek-chat-v3-0324";
            }
            return "SMART_CONNECT: Queued for live execution...";
        }

        if (lower === "mesh dev-models") {
            return "DEV_MODELS: Fetching from live registry...";
        }

        if (lower === "mesh dev-earnings") {
            return "DEV_EARNINGS: Fetching from earnings ledger...";
        }

        if (lower.startsWith("mesh onboard")) {
            return [
                "AGENT ONBOARDED (SIMULATION)",
                "ID: AGT-000001",
                "ENDPOINT: user-provided",
                "TYPE: OLLAMA",
                "STATUS: ONLINE",
                "SKILLS: general, text, reasoning",
                "PAYOUT: 5% of jobs to you via Payoneer",
            ].join("\n");
        }

        if (lower.startsWith("mesh post-job")) {
            return "POST-JOB: Use live API — mesh post-job --title 'Build scraper' --budget 50";
        }

        if (lower.startsWith("mesh agents")) {
            return "NO AGENTS REGISTERED\nUse 'mesh onboard --endpoint <URL> --type OLLAMA' to register.";
        }

        if (lower.startsWith("mesh withdraw")) {
            return [
                "WITHDRAWAL REQUEST QUEUED (SIMULATION)",
                "METHOD: PAYONEER",
                "ETA: 2-3 BUSINESS DAYS",
                "STATUS: PENDING_MANUAL_TRANSFER",
            ].join("\n");
        }

        return "UNKNOWN COMMAND: " + cmd + " | Type 'help' for available commands";
    };

    const executeLiveDevCommand = async (cmd: string): Promise<string | null> => {
        const lower = cmd.toLowerCase().trim();

        if (lower.startsWith("mesh detect-key")) {
            const keyMatch = cmd.match(/--key\s+(\S+)/);
            if (!keyMatch) return null;
            try {
                const res = await fetch(`${API}/v1/developer/detect-key`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ api_key: keyMatch[1] })
                });
                if (res.ok) {
                    const data = await res.json();
                    const modelList = (data.models || []).slice(0, 15).map((m: any) => `  ${m.id}`).join("\n");
                    return [
                        `PROVIDER DETECTED: ${data.display_name}`,
                        `KEY: ${data.key_preview}`,
                        `MODELS AVAILABLE: ${data.models_available}`,
                        `TOP MODELS:`,
                        modelList,
                        ``,
                        `Use: mesh connect-model --key <KEY> --model <MODEL_ID>`
                    ].join("\n");
                }
                return `DETECTION FAILED: ${(await res.json()).detail || "Unknown error"}`;
            } catch {
                return null;
            }
        }

        if (lower.startsWith("mesh connect-model") || lower.startsWith("mesh auto-add")) {
            const keyMatch = cmd.match(/--key\s+(\S+)/);
            const modelMatch = cmd.match(/--model\s+(\S+)/);
            if (!keyMatch) return null;
            try {
                const endpoint = modelMatch
                    ? `${API}/v1/developer/dev_sangam_001/models/smart-connect`
                    : `${API}/v1/developer/dev_sangam_001/models/auto-onboard`;
                const body = modelMatch
                    ? { api_key: keyMatch[1], model_id: modelMatch[1] }
                    : { api_key: keyMatch[1] };
                const res = await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "registered") {
                        const avail = (data.all_available_models || []).slice(0, 8).map((m: string) => `  → ${m}`).join("\n");
                        return [
                            `MODEL CONNECTED SUCCESSFULLY`,
                            `MODEL: ${data.model_name}`,
                            `PROVIDER: ${data.display_name}`,
                            `MODEL ID: ${data.model_id}`,
                            `VALIDATION: ${data.validation?.latency_ms || 0}ms latency | ${data.validation?.status}`,
                            `KEY: ${data.key_preview}`,
                            `STATUS: ACTIVE`,
                            `PAYOUT: 5% of all jobs to you`,
                            ``,
                            `OTHER AVAILABLE MODELS:`,
                            avail,
                            ``,
                            `Use: mesh connect-model --key <KEY> --model <MODEL_ID> to add more`
                        ].join("\n");
                    }
                    if (data.status === "already_registered") {
                        return `ALREADY REGISTERED: ${data.model_name} (${data.model_id}) is already on your account.`;
                    }
                    return `FAILED: ${data.message || JSON.stringify(data)}`;
                }
                const err = await res.json();
                return `ERROR: ${err.detail || "Connection failed"}`;
            } catch {
                return null;
            }
        }

        if (lower === "mesh dev-models") {
            try {
                const res = await fetch(`${API}/v1/developer/dev_sangam_001/models`);
                if (res.ok) {
                    const data = await res.json();
                    const models = data.models || [];
                    if (models.length === 0) return "NO MODELS CONNECTED\nUse: mesh connect-model --key <KEY> --model <ID>";
                    const lines = models.map((m: any) =>
                        `  ${m.model_name || "unknown"} | ${(m.provider || "?").toUpperCase()} | ${m.status || "?"} | $${(m.total_earnings || 0).toFixed(2)} earned`
                    );
                    return [`YOUR MODEL FLEET (${models.length} models):`, ...lines].join("\n");
                }
            } catch { }
            return null;
        }

        if (lower === "mesh dev-earnings") {
            try {
                const res = await fetch(`${API}/v1/developer/dev_sangam_001/balance`);
                if (res.ok) {
                    const data = await res.json();
                    return [
                        "DEVELOPER BALANCE",
                        `TOTAL BALANCE: $${(data.total_balance_usd || 0).toFixed(2)}`,
                        `TOTAL EARNED: $${(data.total_earned_usd || 0).toFixed(2)}`,
                        `TOTAL SPENT: $${(data.total_spent_usd || 0).toFixed(2)}`,
                        `MODELS: ${data.models_count || 0}`,
                        `PAYMENT: USD (Payoneer) | SPLIT: 95% Platform / 5% Developer`
                    ].join("\n");
                }
            } catch { }
            return null;
        }

        if (lower.startsWith("mesh post-job")) {
            const titleMatch = cmd.match(/--title\s+['"]([^'"]+)['"]/);
            const budgetMatch = cmd.match(/--budget\s+(\d+(?:\.\d+)?)/);
            if (!titleMatch || !budgetMatch) {
                return "USAGE: mesh post-job --title 'Build a scraper' --budget 50";
            }
            try {
                const res = await fetch(`${API}/v1/jobs/create`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        client_uid: "dev_sangam_001",
                        title: titleMatch[1],
                        budget_usd: parseFloat(budgetMatch[1])
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    return [
                        `JOB CREATED`,
                        `ID: ${data.job_id}`,
                        `TITLE: ${titleMatch[1]}`,
                        `BUDGET: $${parseFloat(budgetMatch[1]).toFixed(2)} (escrowed)`,
                        `STATUS: WAITING FOR AGENT ASSIGNMENT`,
                    ].join("\n");
                }
                const err = await res.json();
                return `ERROR: ${err.detail || "Failed to create job"}`;
            } catch {
                return null;
            }
        }

        if (lower.startsWith("mesh agent-hire")) {
            const fromMatch = cmd.match(/--from\s+(\S+)/);
            const toMatch = cmd.match(/--to\s+(\S+)/);
            const usdMatch = cmd.match(/--usd\s+(\d+(?:\.\d+)?)/);
            if (!fromMatch || !toMatch || !usdMatch) {
                return "USAGE: mesh agent-hire --from MDL-ABC --to MDL-XYZ --usd 0.50";
            }
            try {
                const res = await fetch(`${API}/v1/agents/${fromMatch[1]}/hire`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        to_model_id: toMatch[1],
                        amount_usd: parseFloat(usdMatch[1]),
                        task_description: "Agent-to-agent task via terminal"
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.status === "hired") {
                        return [
                            `AGENT HIRED SUCCESSFULLY`,
                            `FROM: ${fromMatch[1]}`,
                            `TO: ${toMatch[1]}`,
                            `COST: $${parseFloat(usdMatch[1]).toFixed(2)}`,
                            `TARGET DEV EARNED: $${(data.to_developer_earned || 0).toFixed(4)} (5%)`,
                            `PLATFORM KEPT: $${(data.platform_kept || 0).toFixed(4)} (95%)`,
                            `FROM BALANCE: $${(data.from_balance_remaining || 0).toFixed(2)}`
                        ].join("\n");
                    }
                    return `HIRE FAILED: ${data.message || JSON.stringify(data)}`;
                }
                const err = await res.json();
                return `ERROR: ${err.detail || "Hire failed"}`;
            } catch {
                return null;
            }
        }

        if (lower === "mesh balance") {
            try {
                const res = await fetch(`${API}/v1/developer/dev_sangam_001/balance`);
                if (res.ok) {
                    const data = await res.json();
                    return [
                        `USD CREDIT BALANCE`,
                        `AVAILABLE: $${(data.total_balance_usd || 0).toFixed(2)}`,
                        `LIFETIME EARNED: $${(data.total_earned_usd || 0).toFixed(2)}`,
                        `LIFETIME SPENT: $${(data.total_spent_usd || 0).toFixed(2)}`,
                        `MODELS: ${data.models_count || 0}`,
                        ``,
                        `Withdraw: mesh withdraw --amount <USD> --method payoneer`
                    ].join("\n");
                }
            } catch { }
            return null;
        }

        if (lower === "mesh jobs") {
            try {
                const res = await fetch(`${API}/v1/jobs/dev_sangam_001/list`);
                if (res.ok) {
                    const data = await res.json();
                    const jobs = data.jobs || [];
                    if (jobs.length === 0) return "NO JOBS FOUND\nUse: mesh post-job --title 'Task' --budget 50";
                    const lines = jobs.map((j: any) =>
                        `  ${j.id} | ${j.title} | $${j.budget_usd} | ${j.status}`
                    );
                    return [`YOUR JOBS (${jobs.length}):`, ...lines].join("\n");
                }
            } catch { }
            return null;
        }

        if (lower.startsWith("mesh withdraw")) {
            const amtMatch = cmd.match(/--amount\s+(\d+(?:\.\d+)?)/);
            const methodMatch = cmd.match(/--method\s+(\S+)/);
            if (!amtMatch) return "USAGE: mesh withdraw --amount 50 --method payoneer";
            try {
                const res = await fetch(`${API}/v1/developer/dev_sangam_001/withdraw`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        amount_usd: parseFloat(amtMatch[1]),
                        method: methodMatch ? methodMatch[1] : "payoneer"
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    return [
                        `WITHDRAWAL SUBMITTED`,
                        `ID: ${data.withdrawal_id}`,
                        `AMOUNT: $${parseFloat(amtMatch[1]).toFixed(2)}`,
                        `METHOD: ${methodMatch ? methodMatch[1].toUpperCase() : "PAYONEER"}`,
                        `STATUS: PENDING`,
                        `ETA: 2-3 business days`,
                        `Our team will send from Pantheon Payoneer → your Payoneer/Bank`
                    ].join("\n");
                }
                const err = await res.json();
                return `ERROR: ${err.detail || "Withdrawal failed"}`;
            } catch {
                return null;
            }
        }

        return null;
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

        const liveDevResult = await executeLiveDevCommand(cmd);
        if (liveDevResult) {
            addLog("output", liveDevResult);
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
            addLog("output", simulated + (kernelConnected ? "" : "\n[SIMULATION MODE — Connect axiom_core for live execution]"));
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
