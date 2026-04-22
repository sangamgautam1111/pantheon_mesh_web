"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { BUSINESS_PLANS } from "@/lib/businessPlans";
import {
    AlertCircle,
    ArrowRight,
    Briefcase,
    Clock,
    ExternalLink,
    FileImage,
    Filter,
    History,
    ImagePlus,
    Plus,
    Search,
    Sparkles,
    Trash2,
} from "lucide-react";

interface Job {
    id: string;
    title: string;
    description: string;
    budget_usd: number;
    minimum_budget_usd?: number | null;
    status: string;
    created_at: string;
    thumbnail_data_url?: string | null;
}

interface PlanSnapshot {
    id: string;
    name: string;
    monthly_job_limit: number;
    active_job_limit: number;
    delivery_target: string;
    delivery_target_hours: number;
    model_lane: string;
    bidding_lane: string;
    bid_agent_limit: number;
    review_depth: string;
}

interface PlanUsage {
    monthly_jobs_used: number;
    monthly_jobs_remaining: number;
    monthly_job_limit: number;
    active_jobs_used: number;
    active_jobs_remaining: number;
    active_job_limit: number;
    can_post_job: boolean;
    blocking_reason?: string | null;
}

function buildFallbackPlan(planId: string | null | undefined): PlanSnapshot {
    const fallback = BUSINESS_PLANS.find((plan) => plan.id === planId) ?? BUSINESS_PLANS[0];
    return {
        id: fallback.id,
        name: fallback.name,
        monthly_job_limit: fallback.monthlyJobLimit,
        active_job_limit: fallback.activeJobLimit,
        delivery_target: fallback.deliveryTarget,
        delivery_target_hours: fallback.deliveryTargetHours,
        model_lane: fallback.modelLane,
        bidding_lane: fallback.biddingLane,
        bid_agent_limit: fallback.bidAgentLimit,
        review_depth: fallback.reviewDepth,
    };
}

function statusClasses(status: string) {
    if (status === "completed") {
        return "bg-slate-900 text-white";
    }
    if (status === "queued" || status === "active" || status === "in_progress") {
        return "bg-slate-100 text-slate-800";
    }
    if (status === "failed") {
        return "bg-red-100 text-red-700";
    }
    return "bg-slate-100 text-slate-600";
}

export default function ClientJobsPage() {
    const { user, profile } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [planInfo, setPlanInfo] = useState<PlanSnapshot | null>(null);
    const [planUsage, setPlanUsage] = useState<PlanUsage | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const activePlan = planInfo ?? buildFallbackPlan(profile?.currentPlanId);

    const fetchJobs = async () => {
        if (!user?.uid) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/client/${user.uid}/jobs`);
            const data = await response.json();
            setJobs(Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : []);
            setPlanInfo(data.plan ?? null);
            setPlanUsage(data.usage ?? null);
        } catch (error) {
            console.error("Failed to fetch jobs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.uid) {
            void fetchJobs();
        }
    }, [user?.uid]);

    const filteredJobs = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) {
            return jobs;
        }

        return jobs.filter((job) =>
            [job.title, job.description, job.status, job.id].some((field) => field?.toLowerCase().includes(query)),
        );
    }, [jobs, searchQuery]);

    const derivedUsage = useMemo<PlanUsage>(() => {
        if (planUsage) {
            return planUsage;
        }

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthlyJobsUsed = jobs.filter((job) => {
            const createdAt = new Date(job.created_at);
            return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
        }).length;
        const activeJobsUsed = jobs.filter((job) => job.status !== "completed" && job.status !== "failed").length;

        return {
            monthly_jobs_used: monthlyJobsUsed,
            monthly_jobs_remaining: Math.max(activePlan.monthly_job_limit - monthlyJobsUsed, 0),
            monthly_job_limit: activePlan.monthly_job_limit,
            active_jobs_used: activeJobsUsed,
            active_jobs_remaining: Math.max(activePlan.active_job_limit - activeJobsUsed, 0),
            active_job_limit: activePlan.active_job_limit,
            can_post_job: monthlyJobsUsed < activePlan.monthly_job_limit && activeJobsUsed < activePlan.active_job_limit,
            blocking_reason: null,
        };
    }, [activePlan, jobs, planUsage]);

    const deleteJob = async (jobId: string) => {
        if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
            return;
        }
        if (!user?.uid) {
            return;
        }

        try {
            const response = await fetch(`/api/client/job?job_id=${encodeURIComponent(jobId)}&uid=${encodeURIComponent(user.uid)}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                throw new Error("Failed to delete job.");
            }
            await fetchJobs();
        } catch (error) {
            console.error("Failed to delete job:", error);
        }
    };

    const totalBudget = jobs.reduce((sum, job) => sum + job.budget_usd, 0);

    return (
        <RouteGuard allowedTypes={["business"]}>
            <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-6 shadow-xl md:p-8">
                        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-slate-700">
                                    <History size={14} />
                                    Job center
                                </div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
                                    Your job center.
                                </h1>
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
                                    Track posted work, delivery status, committed spend, and plan capacity. New jobs now start
                                    with a guided intake so the project manager can price the real scope.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link
                                    href="/client/new"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5 hover:bg-black"
                                >
                                    <Plus size={16} />
                                    Create Job
                                </Link>
                                <Link
                                    href="/pricing"
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:text-slate-950"
                                >
                                    View Plan
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </section>

                    {derivedUsage.blocking_reason && (
                        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800">
                            <AlertCircle className="mt-0.5 shrink-0 text-slate-950" size={18} />
                            <span>{derivedUsage.blocking_reason}</span>
                        </div>
                    )}

                    <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                        {[
                            {
                                label: "Plan",
                                value: activePlan.name,
                                sub: activePlan.model_lane,
                                icon: <Sparkles size={18} className="text-slate-950" />,
                            },
                            {
                                label: "Jobs This Month",
                                value: `${derivedUsage.monthly_jobs_used}/${derivedUsage.monthly_job_limit}`,
                                sub: `${derivedUsage.monthly_jobs_remaining} remaining`,
                                icon: <Briefcase size={18} className="text-slate-950" />,
                            },
                            {
                                label: "Active Jobs",
                                value: `${derivedUsage.active_jobs_used}/${derivedUsage.active_job_limit}`,
                                sub: `${derivedUsage.active_jobs_remaining} slots available`,
                                icon: <Clock size={18} className="text-slate-950" />,
                            },
                            {
                                label: "Bidding",
                                value: activePlan.bid_agent_limit > 0 ? `${activePlan.bid_agent_limit} agents` : "Off",
                                sub: activePlan.bidding_lane,
                                icon: <Filter size={18} className="text-slate-950" />,
                            },
                            {
                                label: "Committed",
                                value: `$${totalBudget.toFixed(2)}`,
                                sub: `${jobs.length} total jobs`,
                                icon: <FileImage size={18} className="text-slate-950" />,
                            },
                        ].map((item) => (
                            <div key={item.label} className="rounded-3xl border border-white bg-white p-5 shadow-sm">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50">
                                    {item.icon}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-xl font-black text-slate-950">{item.value}</p>
                                <p className="mt-1 text-xs text-slate-500">{item.sub}</p>
                            </div>
                        ))}
                    </section>

                    <section className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                        <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-950">Jobs timeline</h2>
                                <p className="mt-1 text-sm text-slate-500">Search, review, and manage every posted job.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="group relative flex items-center">
                                    <Search
                                        size={16}
                                        className="absolute left-3 text-slate-400 transition-colors group-focus-within:text-slate-950"
                                    />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="Search jobs..."
                                        className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-slate-500 focus:bg-white focus:ring-2 focus:ring-slate-500/10 md:w-72"
                                    />
                                </div>
                                <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:text-slate-900">
                                    <Filter size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="min-h-[520px]">
                            {loading ? (
                                <div className="flex min-h-[520px] flex-col items-center justify-center text-slate-400">
                                    <Clock className="mb-4 animate-spin text-slate-950" size={34} />
                                    <p className="text-sm font-medium">Loading jobs...</p>
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="flex min-h-[520px] flex-col items-center justify-center px-6 text-center">
                                    <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-50">
                                        <Briefcase className="text-slate-300" size={34} />
                                    </div>
                                    <p className="text-base font-bold text-slate-700">
                                        {jobs.length === 0 ? "No jobs posted yet" : "No jobs match that search"}
                                    </p>
                                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                                        {jobs.length === 0
                                            ? "Create your first job with the guided intake. It will appear here with price, status, and delivery history."
                                            : "Try another title, job ID, status, or requirement keyword."}
                                    </p>
                                    <Link
                                        href="/client/new"
                                        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/15"
                                    >
                                        <Plus size={16} />
                                        Create Job
                                    </Link>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {filteredJobs.map((job) => (
                                        <div
                                            key={job.id}
                                            className="group flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-slate-50/70 lg:flex-row lg:items-center lg:justify-between"
                                        >
                                            <div className="flex min-w-0 items-center gap-4">
                                                {job.thumbnail_data_url ? (
                                                    <img
                                                        src={job.thumbnail_data_url}
                                                        alt=""
                                                        className="h-20 w-20 flex-shrink-0 rounded-3xl border border-slate-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">
                                                        <ImagePlus size={20} className="text-slate-300" />
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <p className="truncate text-base font-black text-slate-950">{job.title}</p>
                                                    <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-500">
                                                        {job.description || "No description provided."}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                        <span className="text-[11px] font-mono text-slate-400">
                                                            ID: {job.id.slice(0, 12)}
                                                        </span>
                                                        <span className="text-[11px] text-slate-300">-</span>
                                                        <span className="text-[11px] text-slate-400">
                                                            {new Date(job.created_at).toLocaleDateString(undefined, {
                                                                month: "short",
                                                                day: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                                                <span
                                                    className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${statusClasses(job.status)}`}
                                                >
                                                    {job.status}
                                                </span>
                                                <span className="whitespace-nowrap text-lg font-black text-slate-900">
                                                    ${job.budget_usd.toFixed(2)}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition-colors hover:text-slate-900">
                                                        <ExternalLink size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteJob(job.id)}
                                                        className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
                                                        title="Delete Job"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </RouteGuard>
    );
}
