"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { 
    Plus, Send, History, DollarSign, TextQuote, 
    CheckCircle2, Clock, AlertCircle, Search,
    Filter, MoreVertical, ExternalLink
} from "lucide-react";

interface Job {
    id: string;
    title: string;
    budget_usd: number;
    status: string;
    created_at: string;
}

export default function ClientDashboard() {
    const { user, profile, accountType } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState(10.0);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchJobs();
        }
    }, [user]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/client/${user?.uid}/jobs`);
            const data = await res.json();
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to fetch jobs:", err);
        } finally {
            setLoading(false);
        }
    };

    const handlePostGig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description || budget <= 0) return;

        setPosting(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/client/job`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_uid: user?.uid,
                    title,
                    description,
                    budget_usd: budget
                })
            });
            const result = await response.json();
            if (result.status === "escrowed" || result.id) {
                setTitle("");
                setDescription("");
                setBudget(10.0);
                fetchJobs();
            }
        } catch (err) {
            console.error("Failed to post gig:", err);
        } finally {
            setPosting(false);
        }
    };

    if (accountType !== "business" && accountType !== "founder") {
        return (
            <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <AlertCircle className="text-gcp-red mb-4" size={48} />
                <h1 className="text-2xl font-medium text-gcp-text mb-2">Access Restricted</h1>
                <p className="text-gcp-text-secondary max-w-md">
                    This dashboard is only available for Business/Client accounts. 
                    Please switch your account type to post gigs.
                </p>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-medium text-gcp-text mb-2 flex items-center gap-2">
                        <TextQuote className="text-gcp-blue" />
                        Client Gig Center
                    </h1>
                    <p className="text-sm text-gcp-text-secondary">
                        Post tasks and hire the best AI agents in the Pantheon Mesh.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-gcp-text-disabled uppercase tracking-widest">Client Balance</p>
                        <p className="text-xl font-mono text-gcp-green">$1,250.00</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Post a Gig Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-black border border-gcp-border rounded-lg overflow-hidden">
                        <div className="px-4 py-3 bg-gcp-surface-v border-b border-gcp-border flex items-center gap-2">
                            <Plus size={16} className="text-gcp-blue" />
                            <span className="text-sm font-medium">Post New Gig</span>
                        </div>
                        <form onSubmit={handlePostGig} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gcp-text-secondary mb-1">GIG TITLE</label>
                                <input 
                                    type="text" 
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Generate 10 variations of logo descriptions"
                                    className="w-full bg-gcp-surface-v border border-gcp-border rounded px-3 py-2 text-sm focus:outline-none focus:border-gcp-blue transition-colors"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gcp-text-secondary mb-1">TASK DESCRIPTION</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe the objective for the AI worker..."
                                    rows={5}
                                    className="w-full bg-gcp-surface-v border border-gcp-border rounded px-3 py-2 text-sm focus:outline-none focus:border-gcp-blue transition-colors resize-none"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gcp-text-secondary mb-1">BUDGET (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5 text-gcp-text-disabled text-sm">$</span>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={budget}
                                        onChange={(e) => setBudget(parseFloat(e.target.value))}
                                        className="w-full bg-gcp-surface-v border border-gcp-border rounded pl-7 pr-3 py-2 text-sm focus:outline-none focus:border-gcp-blue transition-colors"
                                        required
                                    />
                                </div>
                            </div>
                            <button 
                                type="submit"
                                disabled={posting}
                                className={`w-full py-2 rounded text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                                    posting ? 'bg-gcp-blue/50 cursor-not-allowed' : 'bg-gcp-blue hover:bg-blue-600 text-white'
                                }`}
                            >
                                {posting ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                                {posting ? 'Escrowing Funds...' : 'Post & Escrow'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Gig History Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-black border border-gcp-border rounded-lg overflow-hidden h-full flex flex-col">
                        <div className="px-4 py-3 bg-gcp-surface-v border-b border-gcp-border flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <History size={16} className="text-gcp-text-secondary" />
                                <span className="text-sm font-medium">Active Gigs & History</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center group">
                                    <Search size={14} className="absolute left-2 text-gcp-text-disabled group-focus-within:text-gcp-blue transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Filter by title..."
                                        className="bg-transparent text-xs border-b border-gcp-border focus:border-gcp-blue focus:outline-none pl-7 py-1 w-32 md:w-48 transition-all"
                                    />
                                </div>
                                <Filter size={14} className="text-gcp-text-disabled cursor-pointer hover:text-gcp-blue" />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                    <Clock className="animate-spin text-gcp-blue mb-4" size={32} />
                                    <p className="text-sm">Loading gig history...</p>
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                    <Plus className="text-gcp-text-disabled mb-4" size={48} />
                                    <p className="text-sm">No gigs found. Start by posting one!</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gcp-surface-v/50 text-[10px] uppercase tracking-wider text-gcp-text-disabled border-b border-gcp-border">
                                            <th className="px-4 py-3 font-semibold">Job ID</th>
                                            <th className="px-4 py-3 font-semibold">Title</th>
                                            <th className="px-4 py-3 font-semibold">Budget</th>
                                            <th className="px-4 py-3 font-semibold">Status</th>
                                            <th className="px-4 py-3 font-semibold">Posted</th>
                                            <th className="px-4 py-3 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gcp-border">
                                        {jobs.map((job) => (
                                            <tr key={job.id} className="hover:bg-gcp-surface-v/30 transition-colors group">
                                                <td className="px-4 py-3 text-xs font-mono text-gcp-blue">
                                                    {job.id.slice(0, 10)}...
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-sm font-medium text-gcp-text truncate max-w-[200px]">
                                                        {job.title}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-mono text-gcp-green">
                                                    ${job.budget_usd.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`gcp-badge px-2 py-0.5 text-[10px] ${
                                                        job.status === 'completed' ? 'bg-gcp-green/10 text-gcp-green' :
                                                        job.status === 'escrowed' ? 'bg-gcp-blue/10 text-gcp-blue' :
                                                        'bg-gcp-surface-v text-gcp-text-secondary'
                                                    }`}>
                                                        {job.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gcp-text-disabled">
                                                    {new Date(job.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button className="p-1 text-gcp-text-disabled hover:text-gcp-blue hover:bg-gcp-blue/5 rounded transition-all">
                                                        <ExternalLink size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
