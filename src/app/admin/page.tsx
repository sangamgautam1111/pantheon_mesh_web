"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    Shield, Lock, CheckCircle, XCircle, DollarSign,
    Users, Activity, BarChart3, ArrowUpRight, ArrowDownLeft,
    RefreshCw, Eye, EyeOff, AlertTriangle, Loader2
} from "lucide-react";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ADMIN_HASH = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855a7ffc6f8bf1ed76651c14756a061d662f580ff4de43b49fa82d80a4b80f8434a";

function hashPassword(pwd: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode("PANTHEON_MESH_ADMIN_SALT_2026_" + pwd + "_NOVEX_KERNEL");
    return crypto.subtle.digest("SHA-512", data).then(buf => {
        return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    });
}

interface PlatformStats {
    total_jobs: number;
    completed_jobs: number;
    completion_rate: number;
    platform_revenue_usd: number;
    total_tokens_processed: number;
    pending_deposits: number;
    pending_withdrawals: number;
}

interface DepositItem {
    id: string;
    model_id: string;
    owner_uid: string;
    amount_usd: number;
    method: string;
    reference: string;
    created_at: string;
}

interface WithdrawalItem {
    id: string;
    developer_uid: string;
    amount_usd: number;
    method: string;
    payoneer_email: string;
    bank_details: string;
    created_at: string;
}

export default function AdminPanel() {
    const [authenticated, setAuthenticated] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "deposits" | "withdrawals">("overview");
    const [stats, setStats] = useState<PlatformStats | null>(null);
    const [deposits, setDeposits] = useState<DepositItem[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
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
        if (session) {
            const elapsed = Date.now() - parseInt(session);
            if (elapsed < 3600000) {
                setAuthenticated(true);
            } else {
                sessionStorage.removeItem("admin_session");
            }
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            const res = await fetch(`${API}/v1/admin/platform/stats`);
            if (res.ok) setStats(await res.json());
        } catch { }
    }, []);

    const fetchDeposits = useCallback(async () => {
        try {
            const res = await fetch(`${API}/v1/admin/deposits/pending`);
            if (res.ok) {
                const data = await res.json();
                setDeposits(data.deposits || []);
            }
        } catch { }
    }, []);

    const fetchWithdrawals = useCallback(async () => {
        try {
            const res = await fetch(`${API}/v1/admin/withdrawals/pending`);
            if (res.ok) {
                const data = await res.json();
                setWithdrawals(data.withdrawals || []);
            }
        } catch { }
    }, []);

    useEffect(() => {
        if (authenticated) {
            fetchStats();
            fetchDeposits();
            fetchWithdrawals();
        }
    }, [authenticated, fetchStats, fetchDeposits, fetchWithdrawals]);

    const processDeposit = async (depositId: string, approve: boolean) => {
        setProcessing(depositId);
        try {
            await fetch(`${API}/v1/admin/deposits/${depositId}/process`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approve, note: actionNote })
            });
            setActionNote("");
            fetchDeposits();
            fetchStats();
        } catch { }
        setProcessing(null);
    };

    const processWithdrawal = async (withdrawalId: string, approve: boolean) => {
        setProcessing(withdrawalId);
        try {
            await fetch(`${API}/v1/admin/withdrawals/${withdrawalId}/process`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ approve, note: actionNote })
            });
            setActionNote("");
            fetchWithdrawals();
            fetchStats();
        } catch { }
        setProcessing(null);
    };

    if (!authenticated) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 48px)" }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="gcp-card p-10 max-w-md w-full shadow-2xl"
                    style={{ background: "var(--bg-surface)" }}
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <Shield size={28} className="text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>
                                Admin Panel
                            </h1>
                            <p className="text-xs opacity-50" style={{ color: "var(--text-secondary)" }}>
                                PANTHEON MESH — RESTRICTED ACCESS
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest block mb-2 opacity-60"
                                style={{ color: "var(--text-secondary)" }}>Admin Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="gcp-input w-full pr-10 font-mono"
                                    placeholder="••••••••••••••••••"
                                    required
                                    autoFocus
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70"
                                    style={{ color: "var(--text-secondary)" }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {loginError && (
                            <div className="flex items-center gap-2 text-red-500 text-xs font-bold">
                                <AlertTriangle size={14} />
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-red-600 text-white text-sm font-bold tracking-widest uppercase hover:bg-red-700 transition-all active:scale-95 shadow-md disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                            Authenticate
                        </button>
                    </form>

                    <p className="text-center text-[9px] mt-6 uppercase tracking-widest opacity-30"
                        style={{ color: "var(--text-secondary)" }}>
                        SHA-512 Verified | Session expires in 1 hour
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-12 max-w-7xl mx-auto" style={{ minHeight: "calc(100vh - 48px)" }}>
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Shield size={24} className="text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>
                            Admin Control Panel
                        </h1>
                        <p className="text-xs opacity-50" style={{ color: "var(--text-secondary)" }}>
                            Manage deposits, withdrawals, and platform operations
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => { fetchStats(); fetchDeposits(); fetchWithdrawals(); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest border border-gcp-border hover:bg-gcp-blue/5 transition-all"
                        style={{ color: "var(--text-secondary)" }}>
                        <RefreshCw size={14} /> Refresh
                    </button>
                    <button onClick={() => { setAuthenticated(false); sessionStorage.removeItem("admin_session"); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                        <Lock size={14} /> Logout
                    </button>
                </div>
            </div>

            <div className="flex gap-2 mb-8 border-b border-gcp-border pb-4">
                {(["overview", "deposits", "withdrawals"] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "bg-gcp-blue text-white" : "hover:bg-gcp-blue/5"}`}
                        style={activeTab !== tab ? { color: "var(--text-secondary)" } : {}}>
                        {tab === "overview" && <BarChart3 size={14} className="inline mr-2" />}
                        {tab === "deposits" && <ArrowDownLeft size={14} className="inline mr-2" />}
                        {tab === "withdrawals" && <ArrowUpRight size={14} className="inline mr-2" />}
                        {tab}
                        {tab === "deposits" && deposits.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{deposits.length}</span>
                        )}
                        {tab === "withdrawals" && withdrawals.length > 0 && (
                            <span className="ml-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{withdrawals.length}</span>
                        )}
                    </button>
                ))}
            </div>

            {activeTab === "overview" && stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="gcp-card p-6" style={{ background: "var(--bg-surface)" }}>
                        <div className="flex items-center gap-3 mb-3">
                            <Activity size={18} className="text-gcp-blue" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: "var(--text-secondary)" }}>Total Jobs</span>
                        </div>
                        <p className="text-3xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>{stats.total_jobs}</p>
                        <p className="text-xs opacity-50 mt-1" style={{ color: "var(--text-secondary)" }}>{stats.completed_jobs} completed ({stats.completion_rate}%)</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                        className="gcp-card p-6" style={{ background: "var(--bg-surface)" }}>
                        <div className="flex items-center gap-3 mb-3">
                            <DollarSign size={18} className="text-gcp-green" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: "var(--text-secondary)" }}>Platform Revenue</span>
                        </div>
                        <p className="text-3xl font-heading font-bold text-gcp-green">${stats.platform_revenue_usd.toFixed(2)}</p>
                        <p className="text-xs opacity-50 mt-1" style={{ color: "var(--text-secondary)" }}>95% of all completed jobs</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="gcp-card p-6" style={{ background: "var(--bg-surface)" }}>
                        <div className="flex items-center gap-3 mb-3">
                            <Users size={18} className="text-gcp-purple" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: "var(--text-secondary)" }}>Tokens Processed</span>
                        </div>
                        <p className="text-3xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>{stats.total_tokens_processed.toLocaleString()}</p>
                        <p className="text-xs opacity-50 mt-1" style={{ color: "var(--text-secondary)" }}>Across all model interactions</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="gcp-card p-6" style={{ background: "var(--bg-surface)" }}>
                        <div className="flex items-center gap-3 mb-3">
                            <AlertTriangle size={18} className="text-gcp-yellow" />
                            <span className="text-xs font-bold uppercase tracking-widest opacity-60" style={{ color: "var(--text-secondary)" }}>Pending Actions</span>
                        </div>
                        <p className="text-3xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>{stats.pending_deposits + stats.pending_withdrawals}</p>
                        <p className="text-xs opacity-50 mt-1" style={{ color: "var(--text-secondary)" }}>{stats.pending_deposits} deposits · {stats.pending_withdrawals} withdrawals</p>
                    </motion.div>
                </div>
            )}

            {activeTab === "deposits" && (
                <div className="space-y-4">
                    <h2 className="text-lg font-heading font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                        Pending Deposits ({deposits.length})
                    </h2>
                    {deposits.length === 0 ? (
                        <div className="gcp-card p-10 text-center" style={{ background: "var(--bg-surface)" }}>
                            <CheckCircle size={40} className="text-gcp-green mx-auto mb-3" />
                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>All clear — no pending deposits</p>
                        </div>
                    ) : deposits.map(dep => (
                        <motion.div key={dep.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="gcp-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
                            style={{ background: "var(--bg-surface)" }}>
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                    <ArrowDownLeft size={16} className="text-gcp-green" />
                                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{dep.id}</span>
                                    <span className="gcp-badge text-[10px] bg-gcp-yellow/10 text-gcp-yellow">PENDING</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
                                    <div><span className="opacity-50">Amount:</span> <span className="font-bold text-gcp-green">${dep.amount_usd}</span></div>
                                    <div><span className="opacity-50">Model:</span> <span className="font-mono">{dep.model_id}</span></div>
                                    <div><span className="opacity-50">Owner:</span> {dep.owner_uid}</div>
                                    <div><span className="opacity-50">Method:</span> {dep.method}</div>
                                </div>
                                {dep.reference && <p className="text-[10px] mt-2 opacity-40" style={{ color: "var(--text-secondary)" }}>Ref: {dep.reference}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <input type="text" placeholder="Admin note..."
                                    value={processing === dep.id ? actionNote : ""}
                                    onChange={e => { setProcessing(dep.id); setActionNote(e.target.value); }}
                                    className="gcp-input text-xs w-40" />
                                <button onClick={() => processDeposit(dep.id, true)}
                                    disabled={processing === dep.id && !actionNote.length}
                                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-gcp-green/10 text-gcp-green text-xs font-bold hover:bg-gcp-green/20 transition-all">
                                    <CheckCircle size={14} /> Approve
                                </button>
                                <button onClick={() => processDeposit(dep.id, false)}
                                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all">
                                    <XCircle size={14} /> Reject
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {activeTab === "withdrawals" && (
                <div className="space-y-4">
                    <h2 className="text-lg font-heading font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                        Pending Withdrawals ({withdrawals.length})
                    </h2>
                    <div className="gcp-card p-4 mb-6 bg-gcp-yellow/5 border-gcp-yellow/20" style={{ color: "var(--text-secondary)" }}>
                        <p className="text-xs flex items-center gap-2">
                            <AlertTriangle size={14} className="text-gcp-yellow" />
                            <span><strong>Manual Process:</strong> Log into Pantheon Payoneer → Send money → Come back and click Approve</span>
                        </p>
                    </div>
                    {withdrawals.length === 0 ? (
                        <div className="gcp-card p-10 text-center" style={{ background: "var(--bg-surface)" }}>
                            <CheckCircle size={40} className="text-gcp-green mx-auto mb-3" />
                            <p className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>All clear — no pending withdrawals</p>
                        </div>
                    ) : withdrawals.map(w => (
                        <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                            className="gcp-card p-6 flex flex-col md:flex-row items-start md:items-center gap-6"
                            style={{ background: "var(--bg-surface)" }}>
                            <div className="flex-grow">
                                <div className="flex items-center gap-3 mb-2">
                                    <ArrowUpRight size={16} className="text-red-500" />
                                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>{w.id}</span>
                                    <span className="gcp-badge text-[10px] bg-gcp-yellow/10 text-gcp-yellow">PENDING</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mt-3" style={{ color: "var(--text-secondary)" }}>
                                    <div><span className="opacity-50">Amount:</span> <span className="font-bold text-red-500">${w.amount_usd}</span></div>
                                    <div><span className="opacity-50">Developer:</span> {w.developer_uid}</div>
                                    <div><span className="opacity-50">Method:</span> {w.method.toUpperCase()}</div>
                                    <div><span className="opacity-50">Payoneer:</span> {w.payoneer_email || "N/A"}</div>
                                </div>
                                {w.bank_details && <p className="text-[10px] mt-2 opacity-40" style={{ color: "var(--text-secondary)" }}>Bank: {w.bank_details}</p>}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <input type="text" placeholder="Admin note..."
                                    value={processing === w.id ? actionNote : ""}
                                    onChange={e => { setProcessing(w.id); setActionNote(e.target.value); }}
                                    className="gcp-input text-xs w-40" />
                                <button onClick={() => processWithdrawal(w.id, true)}
                                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-gcp-green/10 text-gcp-green text-xs font-bold hover:bg-gcp-green/20 transition-all">
                                    <CheckCircle size={14} /> Sent & Approve
                                </button>
                                <button onClick={() => processWithdrawal(w.id, false)}
                                    className="flex items-center gap-1 px-4 py-2 rounded-md bg-red-500/10 text-red-500 text-xs font-bold hover:bg-red-500/20 transition-all">
                                    <XCircle size={14} /> Reject
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
