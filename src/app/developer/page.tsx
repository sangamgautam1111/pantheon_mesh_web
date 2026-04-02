"use client";

import { useState, useEffect } from "react";
import {
    Plus, Trash2, Activity, Wallet,
    Server, RefreshCw, BarChart3,
    Clock, Shield, ChevronDown, Globe, Terminal,
    Briefcase, CheckCircle2, AlertCircle, ExternalLink
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ModelCard {
    model_id: string;
    model_name: string;
    provider: string;
    status: string;
    health_score: number;
    total_earnings: number;
    total_requests: number;
    average_latency_ms: number;
}

interface EarningRecord {
    id: string;
    model_id: string;
    job_id: string;
    gross_amount: number;
    developer_share: number;
    platform_share: number;
    tokens_used: number;
    timestamp: string;
}

interface Profile {
    display_name: string;
    uid: string;
    wallet_address: string;
    total_earnings: number;
    pending_payout: number;
    models_registered: number;
    total_jobs_completed: number;
    total_tokens_consumed: number;
}

interface AuditRecord {
    id: number;
    provider: string;
    model_name: string;
    status: string;
    error: string | null;
    timestamp: string;
}

interface CreditSummary {
    total_tokens_consumed: number;
    total_gross_revenue: number;
    total_developer_earnings: number;
    total_jobs_processed: number;
    platform_fee_percent: number;
    developer_fee_percent: number;
}

interface AvailableGig {
    id: string;
    title: string;
    description: string;
    budget_usd: number;
    created_at: string;
}

export default function DeveloperPage() {
    const router = useRouter();
    const { user, accountType } = useAuth();
    const uid = user?.uid;
    
    const [profile, setProfile] = useState<Profile | null>(null);
    const [models, setModels] = useState<ModelCard[]>([]);
    const [earnings, setEarnings] = useState<EarningRecord[]>([]);
    const [audits, setAudits] = useState<AuditRecord[]>([]);
    const [creditSummary, setCreditSummary] = useState<CreditSummary | null>(null);
    const [activeTab, setActiveTab] = useState<"cloud" | "ollama" | "gigs">("cloud");
    const [availableGigs, setAvailableGigs] = useState<AvailableGig[]>([]);
    const [loadingGigs, setLoadingGigs] = useState(false);
    const [savings, setSavings] = useState<{ total_tokens_routed: number, total_savings_usd: number, efficiency_score: number, cost_reduction_percent: string } | null>(null);

    useEffect(() => {
        if (!uid) return;
        loadProfile();
        loadModels();
        loadEarnings();
        loadSavings();
        loadAudits();
        loadGigs();
    }, [uid]);

    async function loadProfile() {
        if (!uid) return;
        try {
            const res = await fetch(`${API}/v1/developer/${uid}/profile`);
            if (res.ok) setProfile(await res.json());
        } catch { }
    }
    async function loadModels() {
        if (!uid) return;
        try {
            const res = await fetch(`${API}/v1/developer/${uid}/models`);
            if (res.ok) {
                const data = await res.json();
                setModels(data.models || []);
            }
        } catch { }
    }
    async function loadEarnings() {
        if (!uid) return;
        try {
            const res = await fetch(`${API}/v1/developer/${uid}/earnings`);
            if (res.ok) {
                const data = await res.json();
                setEarnings(data.history || []);
                setCreditSummary(data.summary || null);
            }
        } catch { }
    }
    async function loadSavings() {
        if (!uid) return;
        try {
            const res = await fetch(`${API}/v1/analytics/savings/${uid}`);
            if (res.ok) {
                setSavings(await res.json());
            }
        } catch { }
    }

    async function loadAudits() {
        if (!uid) return;
        try {
            const res = await fetch(`${API}/v1/developer/${uid}/audit-trail`);
            if (res.ok) {
                const data = await res.json();
                setAudits(data.history || []);
            }
        } catch { }
    }

    async function loadGigs() {
        setLoadingGigs(true);
        try {
            const res = await fetch(`${API}/v1/developer/gigs`);
            const data = await res.json();
            setAvailableGigs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load gigs:", err);
        } finally {
            setLoadingGigs(false);
        }
    }

    async function disconnectModel(modelId: string) {
        if (!uid) return;
        await fetch(`${API}/v1/developer/${uid}/models/${modelId}`, { method: "DELETE" });
        loadModels();
        loadProfile();
    }

    async function healthCheck(modelId: string) {
        if (!uid) return;
        await fetch(`${API}/v1/developer/${uid}/models/${modelId}/health`, { method: "POST" });
        loadModels();
    }

    if (accountType !== "developer") {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="text-gcp-red mb-4" size={48} />
                <h1 className="text-2xl font-medium text-gcp-text mb-2">Access Restricted</h1>
                <p className="text-gcp-text-secondary max-w-md">
                    This dashboard is only available for Developer accounts. 
                    Please switch your account type to manage models and claim gigs.
                </p>
                <button 
                    onClick={() => router.push("/")}
                    className="mt-6 px-4 py-2 bg-gcp-blue text-white rounded text-sm font-medium"
                >
                    Return to Welcome
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-[1440px] mx-auto min-h-screen space-y-8 pb-20" style={{ color: "var(--text-primary)" }}>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: "var(--text-primary)" }}>Developer Central</h1>
                    <p className="text-sm opacity-60">
                        Manage your model cluster and monitor autonomous performance from the mesh
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/pricing")}
                        className="px-6 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg font-semibold transition-all active:scale-95 text-sm dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
                    >
                        Plan & Pricing
                    </button>
                    <button
                        onClick={() => router.push("/connect")}
                        className="px-6 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-lg font-semibold transition-all active:scale-95 text-sm dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                    >
                        Connect Model
                    </button>
                </div>
            </div>

            {/* Top Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[
                    { label: "Total Savings", value: `$${(savings?.total_savings_usd || 0).toFixed(2)}` },
                    { label: "Cost Reduction", value: savings?.cost_reduction_percent || "0%" },
                    { label: "Active Payout", value: `$${(profile?.pending_payout || 0).toFixed(2)}` },
                    { label: "Models Active", value: String(profile?.models_registered || models.length || 0) },
                    { label: "Jobs Completed", value: String(profile?.total_jobs_completed || 0) },
                    { label: "Mesh Efficiency", value: `${((savings?.efficiency_score || 0.94) * 100).toFixed(0)}%` }
                ].map((stat, i) => (
                    <div key={i} className="rounded-xl border p-5 shadow-sm transition-all hover:shadow-md h-full flex flex-col justify-between"
                        style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                        <div className="text-[11px] font-bold uppercase tracking-wider opacity-40 mb-2">
                            {stat.label}
                        </div>
                        <div className="text-2xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Tabs */}
            <div className="flex items-center gap-1 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                <button
                    onClick={() => setActiveTab("cloud")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "cloud" ? "border-gcp-blue text-gcp-blue font-bold" : "border-transparent text-gcp-text-disabled hover:text-gcp-text-secondary"}`}
                >
                    Cloud Fleet
                </button>
                <button
                    onClick={() => setActiveTab("ollama")}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "ollama" ? "border-gcp-blue text-gcp-blue font-bold" : "border-transparent text-gcp-text-disabled hover:text-gcp-text-secondary"}`}
                >
                    Local Ollama
                </button>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Left Column: Fleet/Gigs Management (8 cols) */}
                <div className="xl:col-span-8 space-y-6">
                    
                    {/* Model Fleet (Cloud & Ollama Share this) */}
                    {(activeTab === "cloud" || activeTab === "ollama") && (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">
                                    {activeTab === "cloud" ? "Cloud Models" : "Local Edge Nodes"} 
                                    <span className="text-sm opacity-40 ml-2">({models.length})</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {models.length === 0 ? (
                                    <div className="col-span-full py-16 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center space-y-4"
                                        style={{ background: "var(--bg-surface-variant)", borderColor: "var(--border-subtle)" }}>
                                        <div className="max-w-xs">
                                            <p className="font-semibold opacity-60 text-lg">No Clusters Linked</p>
                                            <p className="text-sm opacity-40 mt-1">Connect your model to the mesh to start processing jobs.</p>
                                        </div>
                                    </div>
                                ) : (
                                    models.map((m, i) => (
                                        <div key={m.model_id || i} className="rounded-xl border shadow-sm p-5 hover:shadow-md transition-all flex flex-col h-full relative group"
                                            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="min-w-0">
                                                    <div className="text-base font-bold truncate">{m.model_name}</div>
                                                    <div className="text-[10px] uppercase opacity-40 font-bold">{m.provider} • ID {m.model_id?.slice(0, 4)}</div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => healthCheck(m.model_id)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                                                        <RefreshCw size={14} className="opacity-40" />
                                                    </button>
                                                    <button onClick={() => disconnectModel(m.model_id)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                                                        <Trash2 size={14} className="opacity-40" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mb-4">
                                                <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                                                    <span className="opacity-60">{m.status.replace('_', ' ')}</span>
                                                    <span className="opacity-40">{((m.health_score || 0) * 100).toFixed(0)}% Health</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-1000 bg-gcp-blue" style={{ width: `${(m.health_score || 0) * 100}%` }} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mt-auto pt-3 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                                                {[
                                                    { label: "Earnings", value: `$${(m.total_earnings || 0).toFixed(2)}` },
                                                    { label: "Requests", value: String(m.total_requests || 0) },
                                                    { label: "Latency", value: `${(m.average_latency_ms || 0).toFixed(0)}ms` }
                                                ].map((s, j) => (
                                                    <div key={j} className="text-center">
                                                        <div className="text-[9px] uppercase opacity-40 font-bold mb-0.5">{s.label}</div>
                                                        <div className="text-xs font-bold">{s.value}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}


                    {/* Audit Trail Section */}
                    <div className="rounded-xl border shadow-sm overflow-hidden" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
                            <h3 className="font-bold text-sm">Cluster Event Log</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 opacity-50 font-bold uppercase text-[10px]" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                                        <th className="px-5 py-3">Model Details</th>
                                        <th className="px-5 py-3 text-center">Status</th>
                                        <th className="px-5 py-3 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                                    {audits.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-10 text-center opacity-30 italic">No events recorded.</td>
                                        </tr>
                                    ) : audits.slice(0, 10).map((a, i) => (
                                        <tr key={i} className="hover:bg-black/[0.01] transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="font-bold">{a.model_name}</div>
                                                <div className="text-[9px] opacity-40 font-bold uppercase">{a.provider}</div>
                                            </td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${a.status === "success" ? "bg-green-500/10 text-gcp-green" : "bg-red-500/10 text-gcp-red"}`}>
                                                    {a.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right font-mono opacity-40 text-[10px]">
                                                {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Financials & Ledger (4 cols) */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="rounded-2xl border shadow-lg p-6 space-y-8" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                        <div>
                            <h3 className="text-xs font-bold opacity-40 uppercase tracking-widest mb-6">Settlement Overview</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-black opacity-30">$</span>
                                <span className="text-6xl font-black tracking-tighter">
                                    {(creditSummary?.total_developer_earnings || 0).toFixed(2)}
                                </span>
                            </div>
                            <div className="mt-4">
                                <span className="text-[10px] font-bold opacity-40 uppercase tracking-tight">Lifetime Net Revenue</span>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                            {[
                                { label: "Workloads Done", value: String(creditSummary?.total_jobs_processed || 0) },
                                { label: "Protocol Fee", value: `${creditSummary?.platform_fee_percent || 20}%` },
                                { label: "Payable Now", value: `$${(profile?.pending_payout || 0).toFixed(2)}`, highlight: true }
                            ].map((row, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                    <div className="opacity-40 font-bold uppercase text-[10px]">{row.label}</div>
                                    <div className={`font-bold ${row.highlight ? 'text-lg text-gcp-green' : ''}`}>{row.value}</div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl font-bold text-sm transition-all active:scale-95"
                            onClick={() => router.push("/withdraw")}>
                            Withdraw to Wallet
                        </button>
                    </div>

                    <div className="rounded-xl border shadow-sm" style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}>
                        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--border-subtle)" }}>
                            <h3 className="font-bold text-sm">Revenue Stream</h3>
                            <Link href="/withdraw" className="text-[10px] font-bold opacity-40 uppercase hover:text-gcp-blue">View History</Link>
                        </div>
                        <div className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                            {earnings.length === 0 ? (
                                <div className="p-10 text-center text-xs opacity-20 italic">Empty transaction log.</div>
                            ) : earnings.slice(0, 5).map((e, i) => (
                                <div key={i} className="p-4 flex items-center justify-between hover:bg-black/[0.01] transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-[9px] font-mono opacity-30">#ID-{e.job_id?.slice(0, 4)}</span>
                                        <span className="text-xs font-bold">{e.tokens_used.toLocaleString()} Tokens</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-gcp-green">+${e.developer_share.toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
