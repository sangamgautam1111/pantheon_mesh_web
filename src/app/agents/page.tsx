"use client";

import { useState, useEffect } from "react";
import {
    Users, BrainCircuit, Search, ArrowUpRight, ChevronRight, Loader2
} from "lucide-react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const MOCK_UID = "dev_sangam_001";

interface Agent {
    id: string;
    model_id: string;
    name: string;
    wallet: string;
    reputation: number;
    balance: number;
    role: string;
    tasks_done: number;
    status: string;
}

export default function AgentsPage() {
    const [query, setQuery] = useState("");
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAgents();
    }, []);

    async function loadAgents() {
        try {
            const res = await fetch(`${API}/v1/developer/${MOCK_UID}/models`);
            if (res.ok) {
                const data = await res.json();
                // Map models to the agent interface
                const mapped = (data.models || []).map((m: any) => ({
                    id: m.model_id.slice(0, 8),
                    model_id: m.model_id,
                    name: m.model_name,
                    wallet: "0x" + m.model_id.slice(-8),
                    reputation: m.health_score ? parseFloat((m.health_score * 10).toFixed(1)) : 9.0,
                    balance: m.total_earnings || 0,
                    role: m.provider.toUpperCase(),
                    tasks_done: m.total_requests || 0,
                    status: m.status
                }));
                setAgents(mapped);
            }
        } catch (err) {
            console.error("Failed to load agents", err);
        } finally {
            setLoading(false);
        }
    }

    const filtered = agents.filter(a =>
        (a as any).name.toLowerCase().includes(query.toLowerCase()) ||
        (a as any).role.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <RouteGuard allowedTypes={["developer"]}>
            <div className="p-8 max-w-6xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-heading font-medium text-gcp-text">Agents</h1>
                    <span className="text-sm text-gcp-text-secondary">{filtered.length} agents registered</span>
                </div>

                <div className="mb-6">
                    <div className="max-w-md flex items-center gap-2 gcp-input px-3 py-2">
                        <Search size={16} className="text-gcp-text-disabled flex-shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Filter agents..."
                            className="bg-transparent outline-none text-sm text-gcp-text placeholder:text-gcp-text-disabled flex-1"
                        />
                    </div>
                </div>

                <div className="gcp-card overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-xs text-gcp-text-secondary border-b border-gcp-border">
                                <th className="text-left p-4 font-medium">Agent</th>
                                <th className="text-left p-4 font-medium">Role</th>
                                <th className="text-left p-4 font-medium">Wallet</th>
                                <th className="text-right p-4 font-medium">Reputation</th>
                                <th className="text-right p-4 font-medium">Balance (USD)</th>
                                <th className="text-right p-4 font-medium">Tasks</th>
                                <th className="p-4 w-10"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Loader2 size={24} className="text-gcp-blue animate-spin" />
                                            <span className="text-sm text-gcp-text-secondary">Synchronizing agents with mesh...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-12 text-center text-gcp-text-secondary">
                                        No agents registered yet. Connect a model to get started.
                                    </td>
                                </tr>
                            ) : filtered.map(a => (
                                <tr key={a.id} className="border-b border-gcp-border/50 hover:bg-[var(--bg-hover)] transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gcp-blue/10 flex items-center justify-center">
                                                <BrainCircuit size={14} className="text-gcp-blue" />
                                            </div>
                                            <div>
                                                <Link href={`/agents/${a.id}`} className="text-gcp-blue hover:underline font-medium">{a.name}</Link>
                                                <div className="text-xs text-gcp-text-disabled font-mono">{a.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="gcp-badge bg-gcp-surface-v text-gcp-text-secondary">{a.role}</span>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-gcp-text-secondary">{a.wallet}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-16 h-1.5 bg-gcp-surface-v rounded-full overflow-hidden">
                                                <div className="h-full bg-gcp-blue rounded-full" style={{ width: `${a.reputation * 10}%` }} />
                                            </div>
                                            <span className="text-xs font-medium text-gcp-text">{a.reputation}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right font-mono text-gcp-text">{a.balance.toFixed(1)}</td>
                                    <td className="p-4 text-right text-gcp-text-secondary">{a.tasks_done}</td>
                                    <td className="p-4">
                                        <Link href={`/agents/${a.id}`}>
                                            <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gcp-blue/10 transition-all">
                                                <ChevronRight size={14} className="text-gcp-blue" />
                                            </button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </RouteGuard>
    );
}
