"use client";

import { useEffect, useState } from "react";
import { Briefcase, Clock, FileText, CheckCircle2, Layers3, Sparkles } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Job {
    id: string;
    title: string;
    budget_usd: number;
    minimum_budget_usd?: number | null;
    status: string;
    description: string;
    created_at: string;
    thumbnail_data_url?: string | null;
}

export default function Marketplace() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch(`${API}/v1/marketplace/jobs`);
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : []);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl p-8">
            <div className="mb-12">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gcp-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-gcp-blue">
                    <Briefcase size={14} />
                    Work Marketplace
                </div>
                <h1 className="text-4xl font-heading font-bold text-gcp-text">Explore Available Jobs</h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-gcp-text-secondary">
                    Browse the latest requested jobs posted by businesses and see the kinds of work moving through the managed business workflow.
                </p>
            </div>

            <div className="mb-10 grid gap-4 md:grid-cols-3">
                {[
                    { icon: <Layers3 size={24} />, label: "Verified client requests" },
                    { icon: <CheckCircle2 size={24} />, label: "Protected minimum budgets" },
                    { icon: <Sparkles size={24} />, label: "Managed AI delivery lanes" },
                ].map((item) => (
                    <div key={item.label} className="gcp-card flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gcp-blue/10 text-gcp-blue">
                            {item.icon}
                        </div>
                        <span className="text-base font-semibold text-gcp-text">{item.label}</span>
                    </div>
                ))}
            </div>

            <h2 className="mb-6 text-2xl font-bold text-gcp-text">Recent Jobs</h2>
            
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Clock className="mb-4 animate-spin text-gcp-blue" size={32} />
                    <p className="text-sm">Loading available jobs...</p>
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gcp-border py-20 opacity-50">
                    <FileText className="mb-4 text-gcp-text-disabled" size={48} />
                    <p className="text-lg font-medium text-gcp-text">No jobs posted yet.</p>
                    <p className="text-sm">Posted jobs from clients will be shown here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {jobs.map((job) => (
                        <div key={job.id} className="gcp-card-hover flex flex-col p-6">
                            {job.thumbnail_data_url && (
                                <img
                                    src={job.thumbnail_data_url}
                                    alt=""
                                    className="mb-5 h-44 w-full rounded-2xl border border-gcp-border object-cover"
                                />
                            )}
                            <div className="mb-4 flex items-start justify-between">
                                <h3 className="text-lg font-bold text-gcp-text line-clamp-2">{job.title}</h3>
                                <span className="rounded bg-gcp-green/10 px-2 py-1 text-xs font-mono font-bold text-gcp-green">
                                    ${job.budget_usd.toFixed(2)}
                                </span>
                            </div>
                            <p className="mb-6 flex-1 text-sm leading-6 text-gcp-text-secondary line-clamp-3">
                                {job.description || "No description provided."}
                            </p>
                            {typeof job.minimum_budget_usd === "number" && (
                                <div className="mb-4 inline-flex rounded-full border border-gcp-blue/15 bg-gcp-blue/[0.04] px-3 py-1 text-[11px] font-semibold text-gcp-blue">
                                    Minimum floor ${job.minimum_budget_usd.toFixed(2)}
                                </div>
                            )}
                            <div className="mt-auto flex items-center justify-between border-t border-gcp-border pt-4">
                                <span className="text-xs text-gcp-text-disabled">
                                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Just now"}
                                </span>
                                <button className="gcp-btn-primary py-1.5 px-4 text-xs font-semibold">
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
