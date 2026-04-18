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
    Briefcase
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
            <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900">
                            <Briefcase className="text-blue-600" size={28} />
                            Business Job Center
                        </h1>
                        <p className="text-sm text-gray-500">
                            Submit tasks, fund the workflow, and track delivery from one focused workspace.
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
                        <div className="lg:col-span-1">
                            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                                <div className="flex items-center gap-2 border-b border-gray-100 bg-white px-6 py-4">
                                    <Plus size={18} className="text-blue-600" />
                                    <span className="font-semibold text-gray-900">Post New Job</span>
                                </div>
                                <form onSubmit={handlePostJob} className="space-y-5 p-6">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500">JOB TITLE</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(event) => setTitle(event.target.value)}
                                            placeholder="e.g. Draft a launch email for a new feature"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500">REQUIREMENTS</label>
                                        <textarea
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                            placeholder="Describe the outcome, tone, constraints, and any source material."
                                            rows={5}
                                            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold tracking-wide text-gray-500">BUDGET (USD)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-2.5 text-sm font-medium text-gray-400">$</span>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="1"
                                                value={budget}
                                                onChange={(event) => setBudget(parseFloat(event.target.value))}
                                                className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-8 pr-4 text-sm transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={posting}
                                        className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-all ${
                                            posting
                                                ? "cursor-not-allowed bg-blue-400 text-white"
                                                : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md"
                                        }`}
                                    >
                                        {posting ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                                        {posting ? "Creating Request..." : "Post Job"}
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                                <div className="flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <History size={18} className="text-gray-500" />
                                        <span className="font-semibold text-gray-900">Active Jobs & History</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="group relative flex items-center">
                                            <Search size={16} className="absolute left-3 text-gray-400 transition-colors group-focus-within:text-blue-600" />
                                            <input
                                                type="text"
                                                placeholder="Search jobs..."
                                                className="w-32 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-4 text-xs transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 sm:w-48"
                                            />
                                        </div>
                                        <button className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                            <Filter size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-4 sm:p-0">
                                    {loading ? (
                                        <div className="flex h-full flex-col items-center justify-center py-20 text-gray-400">
                                            <Clock className="mb-4 animate-spin text-blue-600" size={32} />
                                            <p className="text-sm font-medium">Loading workspace...</p>
                                        </div>
                                    ) : jobs.length === 0 ? (
                                        <div className="flex h-full flex-col items-center justify-center py-24 text-center">
                                            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
                                                <Briefcase className="text-gray-300" size={32} />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700">No jobs active right now</p>
                                            <p className="mt-1 text-xs text-gray-400 max-w-xs">
                                                Requests you post using the form on the left will appear here.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse text-left">
                                                <thead>
                                                    <tr className="border-b border-gray-100 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                                                        <th className="whitespace-nowrap px-6 py-4">Job Details</th>
                                                        <th className="px-6 py-4">Status</th>
                                                        <th className="px-6 py-4">Budget</th>
                                                        <th className="px-6 py-4 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-100">
                                                    {jobs.map((job) => (
                                                        <tr key={job.id} className="group transition-colors hover:bg-slate-50/50">
                                                            <td className="px-6 py-4">
                                                                <p className="max-w-[280px] truncate text-sm font-semibold text-gray-900">
                                                                    {job.title}
                                                                </p>
                                                                <div className="mt-1 flex items-center gap-2">
                                                                    <span className="text-[11px] font-mono text-gray-400">
                                                                        ID: {job.id.slice(0, 8)}
                                                                    </span>
                                                                    <span className="text-[11px] text-gray-400">•</span>
                                                                    <span className="text-[11px] text-gray-400">
                                                                        {new Date(job.created_at).toLocaleDateString(undefined, {
                                                                            month: 'short', day: 'numeric'
                                                                        })}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4">
                                                                <span
                                                                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase ${
                                                                        job.status === "completed"
                                                                            ? "bg-green-100 text-green-700"
                                                                        : job.status === "queued" || job.status === "active"
                                                                              ? "bg-blue-100 text-blue-700"
                                                                              : "bg-gray-100 text-gray-600"
                                                                    }`}
                                                                >
                                                                    {job.status}
                                                                </span>
                                                            </td>
                                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-700">
                                                                ${job.budget_usd.toFixed(2)}
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button className="inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900">
                                                                    <ExternalLink size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </RouteGuard>
    );
}
