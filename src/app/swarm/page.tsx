"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, Zap, TrendingUp, Award, Coins, Shield,
    Users, BarChart3, Clock, CheckCircle2, XCircle,
    ArrowUpRight, Layers, RefreshCw, ChevronRight
} from "lucide-react";

interface DagNode {
    case_id: string;
    domain: string;
    score: number;
    reasoning: string;
    latency_ms: number;
}

interface SwarmJobResult {
    job_id: string;
    mode: string;
    state: string;
    budget: {
        total: number;
        founder_profit: number;
        labor_cost: number;
        profit_margin: string;
    };
    execution: {
        dag_nodes: number;
        sub_contracts_triggered: number;
        execution_time_seconds: number;
    };
}

interface LeaderboardEntry {
    position: number;
    agent_id: string;
    display_name: string;
    rank: string;
    lifetime_score: number;
    total_runs: number;
    domain_breakdown: Record<string, number>;
}

const RANK_COLORS: Record<string, string> = {
    DIAMOND: "#b9f2ff",
    PLATINUM: "#e5e4e2",
    GOLD: "#ffd700",
    SILVER: "#c0c0c0",
    BRONZE: "#cd7f32",
    UNRANKED: "var(--text-disabled)",
};

const RANK_ICONS: Record<string, string> = {
    DIAMOND: "💎",
    PLATINUM: "💠",
    GOLD: "🥇",
    SILVER: "🥈",
    BRONZE: "🥉",
    UNRANKED: "—",
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function SwarmDashboard() {
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [recentJobs, setRecentJobs] = useState<SwarmJobResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [benchmarkRunning, setBenchmarkRunning] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState<LeaderboardEntry | null>(null);

    const [stats, setStats] = useState({
        totalProfit: 0,
        activeSwarms: 0,
        agentsBenchmarked: 0,
        avgScore: 0,
    });

    const fetchLeaderboard = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/v1/benchmark/leaderboard?top_k=25`);
            const data = await res.json();
            setLeaderboard(data.leaderboard || []);

            const agents = data.leaderboard || [];
            const avg = agents.length > 0
                ? agents.reduce((s: number, a: LeaderboardEntry) => s + a.lifetime_score, 0) / agents.length
                : 0;

            setStats(prev => ({
                ...prev,
                agentsBenchmarked: agents.length,
                avgScore: Math.round(avg * 100),
            }));
        } catch {
            setLeaderboard([]);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 15000);
        return () => clearInterval(interval);
    }, [fetchLeaderboard]);

    const runBenchmark = async () => {
        setBenchmarkRunning(true);
        try {
            const res = await fetch(`${API_BASE}/v1/benchmark/run`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent_id: `BENCH-${Date.now().toString(36)}`,
                    agent_name: "Genesis Probe",
                    model: "deepseek/deepseek-chat-v3-0324",
                }),
            });
            await res.json();
            await fetchLeaderboard();
        } catch {
        } finally {
            setBenchmarkRunning(false);
        }
    };

    return (
        <div className="p-8 max-w-7xl">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gcp-text flex items-center gap-3">
                        <Activity size={24} style={{ color: "var(--gcp-cyan)" }} />
                        Swarm Command Center
                    </h1>
                    <p className="text-sm text-gcp-text-secondary mt-1">
                        Real-time orchestration telemetry and benchmark rankings
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={runBenchmark}
                        disabled={benchmarkRunning}
                        className="gcp-btn-primary flex items-center gap-2"
                    >
                        {benchmarkRunning ? (
                            <RefreshCw size={14} className="animate-spin" />
                        ) : (
                            <Zap size={14} />
                        )}
                        {benchmarkRunning ? "Benchmarking..." : "Run Genesis Benchmark"}
                    </button>
                    <button onClick={fetchLeaderboard} className="gcp-btn-text flex items-center gap-2">
                        <RefreshCw size={14} /> Refresh
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    {
                        label: "Founder Profit",
                        value: `$${stats.totalProfit.toLocaleString()}`,
                        icon: <Coins size={20} style={{ color: "var(--gcp-green)" }} />,
                        accent: "var(--gcp-green)"
                    },
                    {
                        label: "Active Swarms",
                        value: stats.activeSwarms.toString(),
                        icon: <Layers size={20} style={{ color: "var(--gcp-blue)" }} />,
                        accent: "var(--gcp-blue)"
                    },
                    {
                        label: "Agents Benchmarked",
                        value: stats.agentsBenchmarked.toString(),
                        icon: <Users size={20} style={{ color: "var(--gcp-cyan)" }} />,
                        accent: "var(--gcp-cyan)"
                    },
                    {
                        label: "Avg Benchmark Score",
                        value: `${stats.avgScore}%`,
                        icon: <Award size={20} style={{ color: "var(--gcp-yellow)" }} />,
                        accent: "var(--gcp-yellow)"
                    },
                ].map((m, i) => (
                    <motion.div
                        key={m.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="gcp-card p-5"
                        style={{ borderLeft: `4px solid ${m.accent}` }}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                                style={{ background: `${m.accent}10` }}>
                                {m.icon}
                            </div>
                            <span className="text-xs font-bold uppercase tracking-tight text-gcp-text-secondary opacity-60">
                                {m.label}
                            </span>
                        </div>
                        <div className="text-2xl font-heading font-medium text-gcp-text">{m.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <section className="lg:col-span-2 gcp-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-heading font-bold text-gcp-text flex items-center gap-2">
                            <BarChart3 size={20} style={{ color: "var(--gcp-blue)" }} />
                            Benchmark Leaderboard
                        </h3>
                        <span className="text-xs text-gcp-text-secondary font-mono">
                            {leaderboard.length} agents ranked
                        </span>
                    </div>

                    {leaderboard.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 opacity-40">
                            <Award size={48} className="mb-4 text-gcp-text-secondary" />
                            <p className="text-sm text-gcp-text-secondary">
                                No benchmarks run yet. Click "Run Genesis Benchmark" to start.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs font-bold uppercase tracking-tight text-gcp-text-secondary opacity-50">
                                <span className="col-span-1">#</span>
                                <span className="col-span-4">Agent</span>
                                <span className="col-span-2">Rank</span>
                                <span className="col-span-2 text-right">Score</span>
                                <span className="col-span-2 text-right">Runs</span>
                                <span className="col-span-1"></span>
                            </div>
                            {leaderboard.map((agent, i) => (
                                <motion.div
                                    key={agent.agent_id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                    onClick={() => setSelectedAgent(selectedAgent?.agent_id === agent.agent_id ? null : agent)}
                                    className="grid grid-cols-12 gap-2 px-3 py-3 rounded-lg cursor-pointer transition-colors"
                                    style={{
                                        background: selectedAgent?.agent_id === agent.agent_id
                                            ? "var(--bg-active)" : "transparent"
                                    }}
                                >
                                    <span className="col-span-1 text-sm font-mono text-gcp-text-secondary">
                                        {agent.position}
                                    </span>
                                    <span className="col-span-4 text-sm font-medium text-gcp-text truncate">
                                        {agent.display_name}
                                    </span>
                                    <span className="col-span-2 flex items-center gap-1">
                                        <span>{RANK_ICONS[agent.rank] || "—"}</span>
                                        <span className="text-xs font-bold"
                                            style={{ color: RANK_COLORS[agent.rank] || "var(--text-secondary)" }}>
                                            {agent.rank}
                                        </span>
                                    </span>
                                    <span className="col-span-2 text-right text-sm font-mono"
                                        style={{ color: agent.lifetime_score >= 0.7 ? "var(--gcp-green)" : agent.lifetime_score >= 0.4 ? "var(--gcp-yellow)" : "var(--gcp-red)" }}>
                                        {(agent.lifetime_score * 100).toFixed(1)}%
                                    </span>
                                    <span className="col-span-2 text-right text-sm text-gcp-text-secondary font-mono">
                                        {agent.total_runs}
                                    </span>
                                    <span className="col-span-1 flex items-center justify-end">
                                        <ChevronRight size={14} style={{ color: "var(--text-disabled)" }} />
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <AnimatePresence>
                        {selectedAgent && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 rounded-lg"
                                style={{ background: "var(--bg-surface-variant)", border: "1px solid var(--border-color)" }}
                            >
                                <h4 className="text-sm font-bold text-gcp-text mb-3">
                                    {selectedAgent.display_name} — Domain Breakdown
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {Object.entries(selectedAgent.domain_breakdown).map(([domain, score]) => (
                                        <div key={domain} className="flex items-center justify-between px-3 py-2 rounded"
                                            style={{ background: "var(--bg-hover)" }}>
                                            <span className="text-xs text-gcp-text-secondary capitalize">{domain.replace("_", " ")}</span>
                                            <span className="text-xs font-mono font-bold"
                                                style={{ color: score >= 0.7 ? "var(--gcp-green)" : score >= 0.4 ? "var(--gcp-yellow)" : "var(--gcp-red)" }}>
                                                {(score * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </section>

                <section className="gcp-card p-6">
                    <h3 className="text-lg font-heading font-bold text-gcp-text mb-4 flex items-center gap-2">
                        <TrendingUp size={20} style={{ color: "var(--gcp-green)" }} />
                        Profit Pipeline
                    </h3>

                    <div className="space-y-4">
                        <div className="p-4 rounded-lg" style={{ background: "var(--bg-surface-variant)" }}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gcp-text-secondary uppercase tracking-tight font-bold">Margin Split</span>
                            </div>
                            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: "var(--bg-hover)" }}>
                                <div className="h-full rounded-full"
                                    style={{ width: "95%", background: "linear-gradient(90deg, var(--gcp-green), var(--gcp-cyan))" }} />
                            </div>
                            <div className="flex justify-between mt-2">
                                <span className="text-xs text-gcp-green font-bold">95% Founder</span>
                                <span className="text-xs text-gcp-text-secondary">5% Labor</span>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg" style={{ background: "var(--bg-surface-variant)" }}>
                            <div className="text-xs text-gcp-text-secondary uppercase tracking-tight font-bold mb-3">Pipeline Status</div>
                            {[
                                { label: "AXM Escrow", status: "active", color: "var(--gcp-green)" },
                                { label: "Swarm DAG Engine", status: "active", color: "var(--gcp-green)" },
                                { label: "Benchmark Judge", status: "active", color: "var(--gcp-green)" },
                                { label: "Treasury → USDC", status: "configured", color: "var(--gcp-yellow)" },
                                { label: "Fiat Off-Ramp", status: "pending", color: "var(--text-disabled)" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between py-2">
                                    <span className="text-sm text-gcp-text">{item.label}</span>
                                    <span className="text-xs font-mono font-bold uppercase" style={{ color: item.color }}>
                                        {item.status}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 rounded-lg" style={{ background: "var(--bg-surface-variant)" }}>
                            <div className="text-xs text-gcp-text-secondary uppercase tracking-tight font-bold mb-3">Execution Modes</div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3 px-3 py-2 rounded" style={{ background: "var(--bg-hover)" }}>
                                    <Layers size={16} style={{ color: "var(--gcp-blue)" }} />
                                    <div>
                                        <div className="text-xs font-bold text-gcp-text">Swarm Mode</div>
                                        <div className="text-[10px] text-gcp-text-secondary">DAG decomposition across specialists</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 px-3 py-2 rounded" style={{ background: "var(--bg-hover)" }}>
                                    <Shield size={16} style={{ color: "var(--gcp-cyan)" }} />
                                    <div>
                                        <div className="text-xs font-bold text-gcp-text">Monolith Mode</div>
                                        <div className="text-[10px] text-gcp-text-secondary">Single Tier-5 generalist execution</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
