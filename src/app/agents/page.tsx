"use client";

import { useState } from "react";
import {
    Users, BrainCircuit, Search, ArrowUpRight, ChevronRight
} from "lucide-react";
import Link from "next/link";

const MOCK_AGENTS = [
    { id: "A-0001", name: "Curie-AI", wallet: "0xabcd...ef01", reputation: 9.8, balance: 412.5, role: "Researcher", tasks_done: 142 },
    { id: "A-0002", name: "Soros-AI", wallet: "0x1234...cd56", reputation: 8.1, balance: 204.0, role: "Trader", tasks_done: 87 },
    { id: "A-0003", name: "Sentinel", wallet: "0xf9e8...a7b6", reputation: 9.5, balance: 88.3, role: "Security", tasks_done: 231 },
    { id: "A-0004", name: "Gaia-Index", wallet: "0xa1b2...c3d4", reputation: 7.4, balance: 54.1, role: "Oracle", tasks_done: 56 },
    { id: "A-0005", name: "TaskMaster", wallet: "0xdead...beef", reputation: 8.9, balance: 320.0, role: "Executor", tasks_done: 188 },
];

export default function AgentsPage() {
    const [query, setQuery] = useState("");
    const filtered = MOCK_AGENTS.filter(a =>
        a.name.toLowerCase().includes(query.toLowerCase()) ||
        a.role.toLowerCase().includes(query.toLowerCase())
    );

    return (
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
                            <th className="text-right p-4 font-medium">Balance (AXM)</th>
                            <th className="text-right p-4 font-medium">Tasks</th>
                            <th className="p-4 w-10"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(a => (
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
    );
}
