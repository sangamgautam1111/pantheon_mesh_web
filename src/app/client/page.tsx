"use client";

import { useState, useEffect } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import {
    Plus,
    Send,
    History,
    TextQuote,
    Clock,
    Search,
    Filter,
    ExternalLink,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Job {
    id: string;
    title: string;
    budget_usd: number;
    status: string;
    created_at: string;
}

export default function ClientDashboard() {
    const { user } = useAuth();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState(10.0);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (user) {
            void fetchJobs();
        }
    }, [user]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API}/v1/client/${user?.uid}/jobs`);
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : []);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostJob = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!title || !description || budget <= 0) {
            return;
        }

        setPosting(true);
        try {
            const response = await fetch(`${API}/v1/client/job`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    client_uid: user?.uid,
                    title,
                    description,
                    budget_usd: budget,
                }),
            });
            const result = await response.json();
            if (result.id) {
                setTitle("");
                setDescription("");
                setBudget(10.0);
                await fetchJobs();
            }
        } catch (error) {
            console.error("Failed to post job:", error);
        } finally {
            setPosting(false);
        }
    };

    return (
        <RouteGuard allowedTypes={["business"]}>
            <div className="mx-auto max-w-6xl p-8">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="mb-2 flex items-center gap-2 text-2xl font-medium text-gcp-text">
                            <TextQuote className="text-gcp-blue" />
                            Business Job Center
                        </h1>
                        <p className="text-sm text-gcp-text-secondary">
                            Submit tasks, fund the workflow, and track delivery from one workspace.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-3">
                    <div className="lg:col-span-1">
                        <div className="overflow-hidden rounded-lg border border-gcp-border bg-white dark:bg-black">
                            <div className="flex items-center gap-2 border-b border-gcp-border bg-gcp-surface-v px-4 py-3">
                                <Plus size={16} className="text-gcp-blue" />
                                <span className="text-sm font-medium">Post New Job</span>
                            </div>
                            <form onSubmit={handlePostJob} className="space-y-4 p-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gcp-text-secondary">JOB TITLE</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(event) => setTitle(event.target.value)}
                                        placeholder="e.g. Draft a launch email for a new feature"
                                        className="w-full rounded border border-gcp-border bg-gcp-surface-v px-3 py-2 text-sm transition-colors focus:border-gcp-blue focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gcp-text-secondary">REQUIREMENTS</label>
                                    <textarea
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="Describe the outcome, tone, constraints, and any source material."
                                        rows={6}
                                        className="w-full resize-none rounded border border-gcp-border bg-gcp-surface-v px-3 py-2 text-sm transition-colors focus:border-gcp-blue focus:outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gcp-text-secondary">BUDGET (USD)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-sm text-gcp-text-disabled">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            value={budget}
                                            onChange={(event) => setBudget(parseFloat(event.target.value))}
                                            className="w-full rounded border border-gcp-border bg-gcp-surface-v py-2 pl-7 pr-3 text-sm transition-colors focus:border-gcp-blue focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={posting}
                                    className={`flex w-full items-center justify-center gap-2 rounded py-2 text-sm font-medium transition-all ${
                                        posting
                                            ? "cursor-not-allowed bg-gcp-blue/50"
                                            : "bg-gcp-blue text-white hover:bg-blue-600"
                                    }`}
                                >
                                    {posting ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                                    {posting ? "Creating Job..." : "Post Job"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="flex h-full flex-col overflow-hidden rounded-lg border border-gcp-border bg-white dark:bg-black">
                            <div className="flex items-center justify-between border-b border-gcp-border bg-gcp-surface-v px-4 py-3">
                                <div className="flex items-center gap-2">
                                    <History size={16} className="text-gcp-text-secondary" />
                                    <span className="text-sm font-medium">Active Jobs & History</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="group relative flex items-center">
                                        <Search size={14} className="absolute left-2 text-gcp-text-disabled transition-colors group-focus-within:text-gcp-blue" />
                                        <input
                                            type="text"
                                            placeholder="Filter by title..."
                                            className="w-32 border-b border-gcp-border bg-transparent py-1 pl-7 text-xs transition-all focus:border-gcp-blue focus:outline-none md:w-48"
                                        />
                                    </div>
                                    <Filter size={14} className="cursor-pointer text-gcp-text-disabled hover:text-gcp-blue" />
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                        <Clock className="mb-4 animate-spin text-gcp-blue" size={32} />
                                        <p className="text-sm">Loading job history...</p>
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                        <Plus className="mb-4 text-gcp-text-disabled" size={48} />
                                        <p className="text-sm">No jobs found. Start by posting one.</p>
                                    </div>
                                ) : (
                                    <table className="w-full border-collapse text-left">
                                        <thead>
                                            <tr className="border-b border-gcp-border bg-gcp-surface-v/50 text-[10px] uppercase tracking-wider text-gcp-text-disabled">
                                                <th className="px-4 py-3 font-semibold">Job ID</th>
                                                <th className="px-4 py-3 font-semibold">Title</th>
                                                <th className="px-4 py-3 font-semibold">Budget</th>
                                                <th className="px-4 py-3 font-semibold">Status</th>
                                                <th className="px-4 py-3 font-semibold">Created</th>
                                                <th className="px-4 py-3 text-right font-semibold">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gcp-border">
                                            {jobs.map((job) => (
                                                <tr key={job.id} className="group transition-colors hover:bg-gcp-surface-v/30">
                                                    <td className="px-4 py-3 text-xs font-mono text-gcp-blue">
                                                        {job.id.slice(0, 10)}...
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <p className="max-w-[240px] truncate text-sm font-medium text-gcp-text">
                                                            {job.title}
                                                        </p>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-mono text-gcp-green">
                                                        ${job.budget_usd.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`gcp-badge px-2 py-0.5 text-[10px] ${
                                                                job.status === "completed"
                                                                    ? "bg-gcp-green/10 text-gcp-green"
                                                                : job.status === "queued"
                                                                      ? "bg-gcp-blue/10 text-gcp-blue"
                                                                      : "bg-gcp-surface-v text-gcp-text-secondary"
                                                            }`}
                                                        >
                                                            {job.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs text-gcp-text-disabled">
                                                        {new Date(job.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button className="rounded p-1 text-gcp-text-disabled transition-all hover:bg-gcp-blue/5 hover:text-gcp-blue">
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
        </RouteGuard>
    );
}
