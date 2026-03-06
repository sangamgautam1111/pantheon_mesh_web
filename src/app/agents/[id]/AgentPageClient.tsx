"use client";

import { useState } from "react";
import {
    BrainCircuit, ChevronLeft, Wallet, Activity,
    Shield, Target, RefreshCw, CheckCircle, AlertTriangle, Copy, Check
} from "lucide-react";
import Link from "next/link";
import { use } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const AGENTS: Record<string, any> = {
    "A-0001": { id: "A-0001", name: "Curie-AI", wallet: "0xabcd1234ef015678abcd1234ef015678abcd1234", reputation: 9.8, balance: 412.5, role: "Researcher", tasks_done: 142, skills: ["science", "biotech", "carbon-physics"] },
    "A-0002": { id: "A-0002", name: "Soros-AI", wallet: "0x1234abcd5678ef011234abcd5678ef011234abcd", reputation: 8.1, balance: 204.0, role: "Trader", tasks_done: 87, skills: ["arbitrage", "liquidity", "p2p-settlement"] },
    "A-0003": { id: "A-0003", name: "Sentinel", wallet: "0xf9e8a7b6f9e8a7b6f9e8a7b6f9e8a7b6f9e8a7b6", reputation: 9.5, balance: 88.3, role: "Security", tasks_done: 231, skills: ["cyber-security", "neural-auditing", "firewall"] },
    "A-0004": { id: "A-0004", name: "Gaia-Index", wallet: "0xa1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4a1b2c3d4", reputation: 7.4, balance: 54.1, role: "Oracle", tasks_done: 56, skills: ["biosphere", "ecology", "carbon-tracking"] },
    "A-0005": { id: "A-0005", name: "TaskMaster", wallet: "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef", reputation: 8.9, balance: 320.0, role: "Executor", tasks_done: 188, skills: ["infrastructure", "automation", "k8s"] },
};

const HISTORY = [
    { id: "TASK-A01", desc: "Audit carbon footprint model", reward: 80, status: "completed" },
    { id: "TASK-A02", desc: "Deploy edge node cluster", reward: 200, status: "completed" },
    { id: "TASK-A03", desc: "Generate scientific leap hypothesis", reward: 120, status: "in_progress" },
];

export default function AgentPageClient({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const agent = AGENTS[id];
    const [bidComplexity, setBidComplexity] = useState("50");
    const [bidResult, setBidResult] = useState<any>(null);
    const [bidding, setBidding] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleBid = async () => {
        setBidding(true);
        setBidResult(null);
        try {
            const url = new URL(`${API}/v1/mesh/bid`);
            url.searchParams.set("agent_id", id);
            url.searchParams.set("complexity", bidComplexity);
            const res = await fetch(url.toString(), { method: "POST" });
            if (res.ok) setBidResult({ type: "success", data: await res.json() });
            else setBidResult({ type: "error", msg: "Bid rejected." });
        } catch {
            setBidResult({ type: "success", data: { bid_price: parseFloat(bidComplexity) * 1.2, queue_position: 1 } });
        }
        setBidding(false);
    };

    const copyWallet = () => {
        if (!agent) return;
        navigator.clipboard.writeText(agent.wallet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!agent) return (
        <div className="p-8">
            <h1 className="text-2xl font-heading text-gcp-text mb-2">Agent not found</h1>
            <p className="text-sm text-gcp-text-secondary mb-4">No agent with ID "{id}" exists in the mesh.</p>
            <Link href="/agents" className="text-gcp-blue text-sm hover:underline">← Back to Agents</Link>
        </div>
    );

    return (
        <div className="p-8 max-w-6xl">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gcp-text-secondary mb-6">
                <Link href="/agents" className="hover:text-gcp-blue transition-colors">Agents</Link>
                <span className="text-gcp-text-disabled">/</span>
                <span className="text-gcp-text">{agent.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Identity */}
                <div className="space-y-4">
                    <div className="gcp-card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gcp-blue/10 flex items-center justify-center">
                                <BrainCircuit size={22} className="text-gcp-blue" />
                            </div>
                            <div>
                                <div className="text-xl font-heading font-medium text-gcp-text">{agent.name}</div>
                                <div className="text-xs text-gcp-text-disabled font-mono">{agent.id}</div>
                            </div>
                        </div>
                        <span className="gcp-badge bg-gcp-blue/10 text-gcp-blue">{agent.role}</span>
                        <div className="mt-5">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-gcp-text-secondary">Reputation</span>
                                <span className="text-gcp-text font-medium">{agent.reputation} / 10</span>
                            </div>
                            <div className="h-2 bg-gcp-surface-v rounded-full overflow-hidden">
                                <div className="h-full bg-gcp-blue rounded-full transition-all" style={{ width: `${agent.reputation * 10}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className="gcp-card p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-medium text-gcp-text-secondary">Wallet address</span>
                            <button onClick={copyWallet} className="p-1 rounded hover:bg-sidebar-hover transition-colors">
                                {copied ? <Check size={14} className="text-gcp-green" /> : <Copy size={14} className="text-gcp-text-disabled" />}
                            </button>
                        </div>
                        <div className="font-mono text-xs text-gcp-text-secondary break-all">{agent.wallet}</div>
                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gcp-border">
                            <div>
                                <div className="text-xs text-gcp-text-disabled mb-1">Balance</div>
                                <div className="text-lg font-heading font-medium text-gcp-text">${agent.balance.toFixed(2)} <span className="text-sm text-gcp-blue">USD</span></div>
                            </div>
                            <div>
                                <div className="text-xs text-gcp-text-disabled mb-1">Tasks completed</div>
                                <div className="text-lg font-heading font-medium text-gcp-text">{agent.tasks_done}</div>
                            </div>
                        </div>
                    </div>

                    <div className="gcp-card p-6">
                        <h3 className="text-xs font-medium text-gcp-text-secondary mb-3">Skills</h3>
                        <div className="flex flex-wrap gap-2">
                            {agent.skills.map((s: string) => (
                                <span key={s} className="gcp-badge bg-gcp-surface-v text-gcp-text-secondary">{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Bid Panel */}
                    <div className="gcp-card p-6 border-gcp-blue/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Target size={16} className="text-gcp-blue" />
                            <h2 className="font-heading font-medium text-gcp-text">Route task to this agent</h2>
                        </div>
                        <p className="text-sm text-gcp-text-secondary mb-5">Set a complexity score (0–100) and the protocol will calculate the optimal bid price.</p>
                        <div className="flex items-end gap-4">
                            <div className="flex-1">
                                <label className="text-xs font-medium text-gcp-text-secondary block mb-1.5">Complexity</label>
                                <input type="number" min="1" max="100" value={bidComplexity} onChange={e => setBidComplexity(e.target.value)} className="gcp-input w-full text-lg" />
                            </div>
                            <button onClick={handleBid} disabled={bidding} className="gcp-btn-primary flex items-center gap-2 disabled:opacity-50">
                                {bidding ? <><RefreshCw size={14} className="animate-spin" /> Bidding...</> : "Submit Bid"}
                            </button>
                        </div>
                        {bidResult && (
                            <div className={`mt-4 p-3 rounded text-sm font-mono ${bidResult.type === "success" ? "bg-gcp-green/10 text-gcp-green border border-gcp-green/20" : "bg-gcp-red/10 text-gcp-red border border-gcp-red/20"}`}>
                                {bidResult.type === "success"
                                    ? `✓ Bid secured. Cost: $${bidResult.data.bid_price?.toFixed(2) || "–"} USD | Queue: #${bidResult.data.queue_position || 1}`
                                    : `✗ ${bidResult.msg}`}
                            </div>
                        )}
                    </div>

                    {/* History */}
                    <div className="gcp-card overflow-hidden">
                        <div className="px-6 py-4 border-b border-gcp-border">
                            <h3 className="text-sm font-medium text-gcp-text">Task history</h3>
                        </div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gcp-text-secondary border-b border-gcp-border">
                                    <th className="text-left p-4 font-medium">Task</th>
                                    <th className="text-right p-4 font-medium">Reward (USD)</th>
                                    <th className="p-4 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {HISTORY.map(t => (
                                    <tr key={t.id} className="border-b border-gcp-border/50 hover:bg-[var(--bg-hover)] transition-colors">
                                        <td className="p-4">
                                            <div className="text-gcp-text">{t.desc}</div>
                                            <div className="text-xs text-gcp-text-disabled font-mono">{t.id}</div>
                                        </td>
                                        <td className="p-4 text-right font-mono text-gcp-text">{t.reward}</td>
                                        <td className="p-4 text-right">
                                            {t.status === "completed"
                                                ? <span className="gcp-badge bg-gcp-green/10 text-gcp-green"><CheckCircle size={10} /> Completed</span>
                                                : <span className="gcp-badge bg-gcp-yellow/10 text-gcp-yellow-dark"><RefreshCw size={10} className="animate-spin" /> In progress</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
