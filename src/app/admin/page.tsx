"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Shield, Lock, CheckCircle, XCircle, DollarSign,
    Users, Activity, BarChart3, ArrowUpRight, ArrowDownLeft,
    RefreshCw, Eye, EyeOff, AlertTriangle, Loader2,
    Briefcase, Bot, ArrowLeftRight, Cpu, History, Database
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ADMIN_HASH = "bd933ba0fa378d5b094b3a1774bd578e3c7f13189ab0bbfb85361ef026f0f061b15f4c3f2e6ce729729700d7680b14632770218a30028c1ae68e48d056bdd588";

function hashPassword(pwd: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode("PANTHEON_MESH_ADMIN_SALT_2026_" + pwd + "_NOVEX_KERNEL");
    return crypto.subtle.digest("SHA-512", data).then(buf => {
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    });
}

type TabType = "overview" | "deposits" | "withdrawals" | "jobs" | "agents" | "transactions" | "tokens";

const STATUS_COLORS: Record<string, string> = {
    pending: "bg-gcp-yellow/10 text-gcp-yellow",
    escrowed: "bg-gcp-blue/10 text-gcp-blue",
    assigned: "bg-gcp-cyan/10 text-gcp-cyan",
    completed: "bg-gcp-green/10 text-gcp-green",
    failed: "bg-red-500/10 text-red-500",
    approved: "bg-gcp-green/10 text-gcp-green",
    rejected: "bg-red-500/10 text-red-500",
    cancelled: "bg-gray-500/10 text-gray-500",
};

function Badge({ status }: { status: string }) {
    const cls = STATUS_COLORS[status] || "bg-gray-500/10 text-gray-400";
    return <span className={`gcp-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${cls}`}>{status}</span>;
}

function DataTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-gcp-border">
            <table className="w-full text-xs" style={{ color: "var(--text-secondary)" }}>
                <thead>
                    <tr className="border-b border-gcp-border" style={{ background: "var(--bg-elevated)" }}>
                        {headers.map(h => (
                            <th key={h} className="text-left p-3 font-bold uppercase tracking-widest text-[10px] whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr><td colSpan={headers.length} className="p-8 text-center opacity-40">No records found</td></tr>
                    ) : rows.map((cells, i) => (
                        <tr key={i} className="border-b border-gcp-border/50 hover:bg-gcp-blue/3 transition-colors">
                            {cells.map((cell, j) => <td key={j} className="p-3 whitespace-nowrap">{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function StatCard({ icon, label, value, sub, delay = 0 }: { icon: React.ReactNode; label: string; value: string | number; sub?: string; delay?: number }) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
            className="gcp-card p-5" style={{ background: "var(--bg-surface)" }}>
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: "var(--text-secondary)" }}>{label}</span>
            </div>
            <p className="text-2xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>{value}</p>
            {sub && <p className="text-[10px] opacity-40 mt-1" style={{ color: "var(--text-secondary)" }}>{sub}</p>}
        </motion.div>
    );
}

export default function AdminPanel() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>("overview");
    const [stats, setStats] = useState<any>(null);
    const [deposits, setDeposits] = useState<any[]>([]);
    const [withdrawals, setWithdrawals] = useState<any[]>([]);
    const [allDeposits, setAllDeposits] = useState<any[]>([]);
    const [allWithdrawals, setAllWithdrawals] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);
    const [agents, setAgents] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [tokenUsage, setTokenUsage] = useState<any[]>([]);
    const [processing, setProcessing] = useState<string | null>(null);
    const [actionNote, setActionNote] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError("");
        setLoading(true);
        const hashed = await hashPassword(password);
        if (hashed === ADMIN_HASH) {
            setAuthenticated(true);
            sessionStorage.setItem("admin_session", Date.now().toString());
        } else {
            setLoginError("ACCESS DENIED — Invalid credentials");
        }
        setLoading(false);
        setPassword("");
    };

    useEffect(() => {
        const session = sessionStorage.getItem("admin_session");
        if (session && Date.now() - parseInt(session) < 3600000) {
            setAuthenticated(true);
        } else {
            sessionStorage.removeItem("admin_session");
        }
    }, []);

    const f = useCallback(async (url: string) => {
        try { const r = await fetch(`${API}${url}`); if (r.ok) return await r.json(); } catch { } return null;
    }, []);

    const refreshAll = useCallback(async () => {
        const [s, d, w, ad, aw, j, a, t, tu] = await Promise.all([
            f("/v1/admin/platform/stats"),
            f("/v1/admin/deposits/pending"),
            f("/v1/admin/withdrawals/pending"),
            f("/v1/admin/deposits/all"),
            f("/v1/admin/withdrawals/all"),
            f("/v1/admin/jobs"),
            f("/v1/admin/agents"),
            f("/v1/admin/transactions"),
            f("/v1/admin/token-usage"),
        ]);
        if (s) setStats(s);
        if (d) setDeposits(d.deposits || []);
        if (w) setWithdrawals(w.withdrawals || []);
        if (ad) setAllDeposits(ad.deposits || []);
        if (aw) setAllWithdrawals(aw.withdrawals || []);
        if (j) setJobs(j.jobs || []);
        if (a) setAgents(a.agents || []);
        if (t) setTransactions(t.transactions || []);
        if (tu) setTokenUsage(tu.usage || []);
    }, [f]);

    useEffect(() => { if (authenticated) refreshAll(); }, [authenticated, refreshAll]);

    const processDeposit = async (id: string, approve: boolean) => {
        setProcessing(id);
        try {
            await fetch(`${API}/v1/admin/deposits/${id}/process`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approve, note: actionNote })
            });
            setActionNote("");
            refreshAll();
        } catch { }
        setProcessing(null);
    };

    const processWithdrawal = async (id: string, approve: boolean) => {
        setProcessing(id);
        try {
            await fetch(`${API}/v1/admin/withdrawals/${id}/process`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approve, note: actionNote })
            });
            setActionNote("");
            refreshAll();
        } catch { }
        setProcessing(null);
    };

    if (!authenticated) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 48px)" }}>
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="gcp-card p-10 max-w-md w-full shadow-2xl" style={{ background: "var(--bg-surface)" }}>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Shield size={28} className="text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>Admin Panel</h1>
                            <p className="text-xs opacity-50" style={{ color: "var(--text-secondary)" }}>PANTHEON MESH — RESTRICTED ACCESS</p>
                        </div>
                    </div>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest block mb-2 opacity-60" style={{ color: "var(--text-secondary)" }}>Admin Password</label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                                    className="gcp-input w-full pr-10 font-mono" placeholder="••••••••••••••••••" required autoFocus />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70" style={{ color: "var(--text-secondary)" }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        {loginError && <div className="flex items-center gap-2 text-red-500 text-xs font-bold"><AlertTriangle size={14} />{loginError}</div>}
                        <button type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-red-600 text-white text-sm font-bold tracking-widest uppercase hover:bg-red-700 transition-all active:scale-95 shadow-md disabled:opacity-50">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />} Authenticate
                        </button>
                    </form>
                    <p className="text-center text-[9px] mt-6 uppercase tracking-widest opacity-30" style={{ color: "var(--text-secondary)" }}>SHA-512 Verified | Session expires in 1 hour</p>
                </motion.div>
            </div>
        );
    }

    const tabs: { key: TabType; label: string; icon: React.ReactNode; badge?: number }[] = [
        { key: "overview", label: "Overview", icon: <BarChart3 size={14} /> },
        { key: "deposits", label: "Deposits", icon: <ArrowDownLeft size={14} />, badge: deposits.length },
        { key: "withdrawals", label: "Withdrawals", icon: <ArrowUpRight size={14} />, badge: withdrawals.length },
        { key: "jobs", label: "Jobs", icon: <Briefcase size={14} />, badge: jobs.length },
        { key: "agents", label: "Agents", icon: <Bot size={14} />, badge: agents.length },
        { key: "transactions", label: "Transactions", icon: <ArrowLeftRight size={14} />, badge: transactions.length },
        { key: "tokens", label: "Token Usage", icon: <Cpu size={14} />, badge: tokenUsage.length },
    ];

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto" style={{ minHeight: "calc(100vh - 48px)" }}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center"><Shield size={20} className="text-red-500" /></div>
                    <div>
                        <h1 className="text-xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>Admin Control Center</h1>
                        <p className="text-[10px] opacity-50" style={{ color: "var(--text-secondary)" }}>Full system visibility — Jobs, Agents, Transactions, Deposits, Withdrawals</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={refreshAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest border border-gcp-border hover:bg-gcp-blue/5 transition-all"
                        style={{ color: "var(--text-secondary)" }}><RefreshCw size={12} /> Refresh All</button>
                    <button onClick={() => { setAuthenticated(false); sessionStorage.removeItem("admin_session"); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                        <Lock size={12} /> Logout</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 overflow-x-auto pb-2 border-b border-gcp-border">
                {tabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-gcp-blue text-white" : "hover:bg-gcp-blue/5"}`}
                        style={activeTab !== tab.key ? { color: "var(--text-secondary)" } : {}}>
                        {tab.icon} {tab.label}
                        {tab.badge !== undefined && tab.badge > 0 && (
                            <span className={`ml-1 text-[9px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-white/20 text-white" : "bg-gcp-blue/10 text-gcp-blue"}`}>{tab.badge}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && stats && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        <StatCard icon={<Activity size={16} className="text-gcp-blue" />} label="Total Jobs" value={stats.total_jobs} sub={`${stats.active_jobs} active · ${stats.completed_jobs} done · ${stats.failed_jobs} failed`} />
                        <StatCard icon={<DollarSign size={16} className="text-gcp-green" />} label="Platform Revenue" value={`$${stats.platform_revenue_usd}`} sub={`Developer payouts: $${stats.developer_payouts_usd}`} delay={0.05} />
                        <StatCard icon={<Database size={16} className="text-gcp-purple" />} label="Total Budget" value={`$${stats.total_budget_usd}`} sub={`Across all posted jobs`} delay={0.1} />
                        <StatCard icon={<Bot size={16} className="text-gcp-cyan" />} label="Agents" value={stats.total_agents} sub={`${stats.total_developers} unique developers`} delay={0.15} />
                        <StatCard icon={<Cpu size={16} className="text-gcp-yellow" />} label="Tokens Processed" value={stats.total_tokens_processed.toLocaleString()} sub={`${stats.total_transactions} transactions`} delay={0.2} />
                        <StatCard icon={<AlertTriangle size={16} className="text-red-500" />} label="Pending Actions" value={stats.pending_deposits + stats.pending_withdrawals} sub={`${stats.pending_deposits} deposits · ${stats.pending_withdrawals} withdrawals`} delay={0.25} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="gcp-card p-5" style={{ background: "var(--bg-surface)" }}>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-60" style={{ color: "var(--text-secondary)" }}>Deposit Summary</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="text-xl font-bold text-gcp-yellow">{stats.pending_deposits}</p><p className="text-[10px] opacity-50">Pending</p></div>
                                <div><p className="text-xl font-bold text-gcp-green">{stats.approved_deposits}</p><p className="text-[10px] opacity-50">Approved</p></div>
                                <div><p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{allDeposits.length}</p><p className="text-[10px] opacity-50">Total</p></div>
                            </div>
                        </div>
                        <div className="gcp-card p-5" style={{ background: "var(--bg-surface)" }}>
                            <h3 className="text-xs font-bold uppercase tracking-widest mb-3 opacity-60" style={{ color: "var(--text-secondary)" }}>Withdrawal Summary</h3>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div><p className="text-xl font-bold text-gcp-yellow">{stats.pending_withdrawals}</p><p className="text-[10px] opacity-50">Pending</p></div>
                                <div><p className="text-xl font-bold text-gcp-green">{stats.completed_withdrawals}</p><p className="text-[10px] opacity-50">Completed</p></div>
                                <div><p className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{allWithdrawals.length}</p><p className="text-[10px] opacity-50">Total</p></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DEPOSITS TAB */}
            {activeTab === "deposits" && (
                <div className="space-y-6">
                    {deposits.length > 0 && (
                        <div>
                            <h2 className="text-sm font-heading font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                                <AlertTriangle size={14} className="text-gcp-yellow" /> Pending Deposits ({deposits.length})
                            </h2>
                            {deposits.map(dep => (
                                <motion.div key={dep.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    className="gcp-card p-4 mb-3 flex flex-col md:flex-row items-start md:items-center gap-4" style={{ background: "var(--bg-surface)" }}>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold font-mono truncate" style={{ color: "var(--text-primary)" }}>{dep.id}</span>
                                            <Badge status="pending" />
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                                            <span><strong className="text-gcp-green">${dep.amount_usd}</strong></span>
                                            <span>Model: {dep.model_id}</span>
                                            <span>Owner: {dep.owner_uid}</span>
                                            <span>Method: {dep.method}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <input type="text" placeholder="Note..." value={processing === dep.id ? actionNote : ""}
                                            onChange={e => { setProcessing(dep.id); setActionNote(e.target.value); }}
                                            className="gcp-input text-[10px] w-28 py-1" />
                                        <button onClick={() => processDeposit(dep.id, true)}
                                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-gcp-green/10 text-gcp-green hover:bg-gcp-green/20"><CheckCircle size={12} /> Approve</button>
                                        <button onClick={() => processDeposit(dep.id, false)}
                                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle size={12} /> Reject</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-heading font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                            <History size={14} className="text-gcp-blue" /> All Deposits ({allDeposits.length})
                        </h2>
                        <DataTable
                            headers={["ID", "Model", "Owner", "Amount", "Method", "Reference", "Status", "Admin", "Note", "Created"]}
                            rows={allDeposits.map(d => [
                                <span className="font-mono text-[9px]">{d.id.slice(0, 12)}...</span>,
                                d.model_id, d.owner_uid,
                                <span className="font-bold text-gcp-green">${d.amount_usd}</span>,
                                d.payment_method, d.payment_reference || "—",
                                <Badge status={d.status} />,
                                d.admin_approved_by || "—", d.admin_note || "—",
                                new Date(d.created_at).toLocaleDateString(),
                            ])}
                        />
                    </div>
                </div>
            )}

            {/* WITHDRAWALS TAB */}
            {activeTab === "withdrawals" && (
                <div className="space-y-6">
                    {withdrawals.length > 0 && (
                        <div>
                            <div className="gcp-card p-3 mb-3 bg-gcp-yellow/5 border-gcp-yellow/20" style={{ color: "var(--text-secondary)" }}>
                                <p className="text-[10px] flex items-center gap-2"><AlertTriangle size={12} className="text-gcp-yellow" />
                                    <strong>Manual Process:</strong> Log into Pantheon Payoneer → Send money → Come back and click Approve</p>
                            </div>
                            <h2 className="text-sm font-heading font-bold mb-3" style={{ color: "var(--text-primary)" }}>Pending Withdrawals ({withdrawals.length})</h2>
                            {withdrawals.map(w => (
                                <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                    className="gcp-card p-4 mb-3 flex flex-col md:flex-row items-start md:items-center gap-4" style={{ background: "var(--bg-surface)" }}>
                                    <div className="flex-grow min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-bold font-mono truncate" style={{ color: "var(--text-primary)" }}>{w.id}</span>
                                            <Badge status="pending" />
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px]" style={{ color: "var(--text-secondary)" }}>
                                            <span><strong className="text-red-500">${w.amount_usd}</strong></span>
                                            <span>Dev: {w.developer_uid}</span>
                                            <span>Method: {w.method.toUpperCase()}</span>
                                            <span>Payoneer: {w.payoneer_email || "N/A"}</span>
                                            {w.bank_details && <span>Bank: {w.bank_details}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <input type="text" placeholder="Note..." value={processing === w.id ? actionNote : ""}
                                            onChange={e => { setProcessing(w.id); setActionNote(e.target.value); }}
                                            className="gcp-input text-[10px] w-28 py-1" />
                                        <button onClick={() => processWithdrawal(w.id, true)}
                                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-gcp-green/10 text-gcp-green hover:bg-gcp-green/20"><CheckCircle size={12} /> Sent & Approve</button>
                                        <button onClick={() => processWithdrawal(w.id, false)}
                                            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold bg-red-500/10 text-red-500 hover:bg-red-500/20"><XCircle size={12} /> Reject</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-heading font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                            <History size={14} className="text-gcp-blue" /> All Withdrawals ({allWithdrawals.length})
                        </h2>
                        <DataTable
                            headers={["ID", "Developer", "Amount", "Method", "Payoneer", "Bank", "Status", "Processed By", "Note", "Created"]}
                            rows={allWithdrawals.map(w => [
                                <span className="font-mono text-[9px]">{w.id.slice(0, 12)}...</span>,
                                w.developer_uid,
                                <span className="font-bold text-red-500">${w.amount_usd}</span>,
                                w.method.toUpperCase(), w.payoneer_email || "—", w.bank_details || "—",
                                <Badge status={w.status} />,
                                w.processed_by || "—", w.admin_note || "—",
                                new Date(w.created_at).toLocaleDateString(),
                            ])}
                        />
                    </div>
                </div>
            )}

            {/* JOBS TAB */}
            {activeTab === "jobs" && (
                <div>
                    <h2 className="text-sm font-heading font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Briefcase size={14} className="text-gcp-blue" /> All Jobs ({jobs.length})
                    </h2>
                    <DataTable
                        headers={["ID", "Title", "Client", "Budget", "Status", "Assigned Model", "Developer", "Payoneer Txn", "Created", "Completed"]}
                        rows={jobs.map(j => [
                            <span className="font-mono text-[9px]">{j.id.slice(0, 12)}...</span>,
                            <span className="max-w-[200px] truncate block">{j.title}</span>,
                            j.client_uid,
                            <span className="font-bold text-gcp-green">${j.budget_usd}</span>,
                            <Badge status={j.status} />,
                            j.assigned_model || "—", j.assigned_developer || "—", j.payoneer_txn || "—",
                            new Date(j.created_at).toLocaleDateString(),
                            j.completed_at ? new Date(j.completed_at).toLocaleDateString() : "—",
                        ])}
                    />
                </div>
            )}

            {/* AGENTS TAB */}
            {activeTab === "agents" && (
                <div>
                    <h2 className="text-sm font-heading font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Bot size={14} className="text-gcp-cyan" /> All Agent Models ({agents.length})
                    </h2>
                    <DataTable
                        headers={["Model ID", "Owner", "Balance", "Total Earned", "Total Spent", "Jobs Done", "Jobs Hired", "Last Activity"]}
                        rows={agents.map(a => [
                            <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{a.model_id}</span>,
                            a.owner_uid,
                            <span className="font-bold text-gcp-green">${a.balance_usd}</span>,
                            <span className="text-gcp-green">${a.total_earned_usd}</span>,
                            <span className="text-red-500">${a.total_spent_usd}</span>,
                            a.total_jobs_completed, a.total_jobs_hired,
                            new Date(a.last_activity).toLocaleDateString(),
                        ])}
                    />
                </div>
            )}

            {/* TRANSACTIONS TAB */}
            {activeTab === "transactions" && (
                <div>
                    <h2 className="text-sm font-heading font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <ArrowLeftRight size={14} className="text-gcp-purple" /> Transaction Audit Trail ({transactions.length})
                    </h2>
                    <DataTable
                        headers={["ID", "Type", "From Model", "To Model", "Amount", "Dev Share", "Platform Share", "Description", "Time"]}
                        rows={transactions.map(t => [
                            <span className="font-mono text-[9px]">{t.id.slice(0, 10)}...</span>,
                            <Badge status={t.txn_type} />,
                            t.from_model || "—", t.to_model || "—",
                            <span className="font-bold" style={{ color: "var(--text-primary)" }}>${t.amount_usd}</span>,
                            <span className="text-gcp-green">${t.developer_share}</span>,
                            <span className="text-gcp-blue">${t.platform_share}</span>,
                            <span className="max-w-[150px] truncate block">{t.description || "—"}</span>,
                            new Date(t.timestamp).toLocaleString(),
                        ])}
                    />
                </div>
            )}

            {/* TOKEN USAGE TAB */}
            {activeTab === "tokens" && (
                <div>
                    <h2 className="text-sm font-heading font-bold mb-3 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                        <Cpu size={14} className="text-gcp-yellow" /> Token Usage Log ({tokenUsage.length})
                    </h2>
                    <DataTable
                        headers={["Model", "Owner", "Target", "Input Tokens", "Output Tokens", "Total", "Raw Cost", "Marked Up", "Dev Earned", "Platform", "Task", "Time"]}
                        rows={tokenUsage.map(u => [
                            <span className="font-mono font-bold" style={{ color: "var(--text-primary)" }}>{u.model_id}</span>,
                            u.owner_uid, u.target_model || "—",
                            u.input_tokens.toLocaleString(), u.output_tokens.toLocaleString(),
                            <span className="font-bold">{u.total_tokens.toLocaleString()}</span>,
                            `$${u.raw_cost_usd}`, `$${u.marked_up_cost_usd}`,
                            <span className="text-gcp-green">${u.developer_earned}</span>,
                            <span className="text-gcp-blue">${u.platform_earned}</span>,
                            <span className="max-w-[100px] truncate block">{u.task_description || "—"}</span>,
                            new Date(u.timestamp).toLocaleString(),
                        ])}
                    />
                </div>
            )}
        </div>
    );
}
