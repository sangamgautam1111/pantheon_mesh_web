"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Clock3,
    Coins,
    FileImage,
    FileText,
    Layers3,
    LogOut,
    Plus,
    Sparkles,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { useGuide } from "@/context/GuideProvider";
import { BUSINESS_PLANS } from "@/lib/businessPlans";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Job {
    id: string;
    title: string;
    budget_usd: number;
    status: string;
    created_at: string;
    completed_at?: string | null;
    thumbnail_data_url?: string | null;
}

export default function Dashboard() {
    const { user, profile, signOut } = useAuth();
    const { setChatOpen } = useGuide();
    const router = useRouter();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loadingJobs, setLoadingJobs] = useState(true);

    useEffect(() => {
        const loadJobs = async () => {
            if (!user?.uid) {
                setJobs([]);
                setLoadingJobs(false);
                return;
            }

            setLoadingJobs(true);
            try {
                const response = await fetch(`${API}/v1/client/${user.uid}/jobs`);
                const data = await response.json();
                const nextJobs = Array.isArray(data) ? data : Array.isArray(data.jobs) ? data.jobs : [];
                setJobs(nextJobs);
            } catch (error) {
                console.error("Failed to load jobs:", error);
                setJobs([]);
            } finally {
                setLoadingJobs(false);
            }
        };

        void loadJobs();
    }, [user?.uid]);

    const metrics = useMemo(() => {
        const totalBudget = jobs.reduce((sum, job) => sum + job.budget_usd, 0);
        const activeJobs = jobs.filter((job) => job.status !== "completed").length;
        const completedJobs = jobs.filter((job) => job.status === "completed").length;
        const jobsWithAssets = jobs.filter((job) => Boolean(job.thumbnail_data_url)).length;

        return {
            totalJobs: jobs.length,
            activeJobs,
            completedJobs,
            totalBudget,
            jobsWithAssets,
        };
    }, [jobs]);

    const currentPlan = BUSINESS_PLANS.find((plan) => plan.id === profile?.currentPlanId) ?? BUSINESS_PLANS[0];
    const featuredPlans = BUSINESS_PLANS.filter((plan) => ["free", "growth", "scale"].includes(plan.id));

    return (
        <RouteGuard allowedTypes={["business"]}>
            <div className="max-w-7xl p-6 md:p-8">
                <section className="overflow-hidden rounded-[28px] border border-gcp-border bg-[radial-gradient(circle_at_top_right,rgba(26,115,232,0.16),transparent_38%),linear-gradient(180deg,var(--bg-surface),var(--bg-surface-variant))] p-6 shadow-xl md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gcp-blue/20 bg-gcp-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.26em] text-gcp-blue">
                                <Layers3 size={14} />
                                Business Command Center
                            </div>
                            <h1 className="text-3xl font-heading font-bold leading-tight text-gcp-text md:text-5xl">
                                Run every business request from one dashboard.
                            </h1>
                            <p className="mt-4 max-w-2xl text-sm leading-7 text-gcp-text-secondary md:text-base">
                                Post new work, track active delivery, see how much budget is committed, and upgrade into
                                stronger model lanes when your team needs more speed.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <button
                                    onClick={() => router.push("/client")}
                                    className="gcp-btn-primary inline-flex items-center gap-2"
                                >
                                    <Plus size={14} />
                                    Post a Job
                                </button>
                                <button
                                    onClick={() => router.push("/pricing")}
                                    className="gcp-btn-text inline-flex items-center gap-2"
                                >
                                    View Pricing
                                    <ArrowRight size={14} />
                                </button>
                                <button
                                    onClick={() => setChatOpen(true)}
                                    className="gcp-btn-text inline-flex items-center gap-2"
                                >
                                    <Sparkles size={14} />
                                    Ask Assistant
                                </button>
                            </div>
                        </div>

                        <div className="min-w-[260px] rounded-3xl border border-gcp-blue/15 bg-gcp-blue/[0.04] p-5">
                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-gcp-blue">
                                Workspace
                            </p>
                            <div className="mt-3 flex items-center gap-3">
                                {profile?.photoURL ? (
                                    <img
                                        src={profile.photoURL}
                                        alt=""
                                        className="h-12 w-12 rounded-full border border-gcp-border object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gcp-border bg-gcp-surface-v">
                                        <Layers3 size={18} className="text-gcp-blue" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="truncate text-base font-bold text-gcp-text">
                                        {profile?.companyName || profile?.displayName || "Business Workspace"}
                                    </p>
                                    <p className="truncate text-xs text-gcp-text-secondary">{profile?.email}</p>
                                </div>
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl border border-gcp-border bg-gcp-surface p-4">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gcp-text-disabled">
                                        Current plan
                                    </p>
                                    <p className="mt-2 font-semibold text-gcp-text">{currentPlan.name}</p>
                                </div>
                                <div className="rounded-2xl border border-gcp-border bg-gcp-surface p-4">
                                    <p className="text-[10px] font-black uppercase tracking-wider text-gcp-text-disabled">
                                        Delivery lane
                                    </p>
                                    <p className="mt-2 font-semibold text-gcp-text">{currentPlan.deliveryTarget}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {[
                        {
                            label: "Submitted Jobs",
                            value: String(metrics.totalJobs),
                            icon: <FileText size={18} className="text-gcp-blue" />,
                        },
                        {
                            label: "Active Jobs",
                            value: String(metrics.activeJobs),
                            icon: <Activity size={18} className="text-gcp-yellow" />,
                        },
                        {
                            label: "Completed Jobs",
                            value: String(metrics.completedJobs),
                            icon: <CheckCircle2 size={18} className="text-gcp-green" />,
                        },
                        {
                            label: "Committed Budget",
                            value: `$${metrics.totalBudget.toFixed(2)}`,
                            icon: <Coins size={18} className="text-gcp-cyan" />,
                        },
                        {
                            label: "Jobs With Thumbnails",
                            value: String(metrics.jobsWithAssets),
                            icon: <FileImage size={18} className="text-gcp-blue" />,
                        },
                    ].map((item) => (
                        <div key={item.label} className="gcp-card p-5">
                            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-gcp-blue/10">
                                {item.icon}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gcp-text-disabled">
                                {item.label}
                            </p>
                            <p className="mt-3 text-2xl font-heading font-bold text-gcp-text">{item.value}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="gcp-card p-6 md:p-8">
                        <div className="mb-5 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-heading font-bold text-gcp-text">Recent jobs</h2>
                                <p className="mt-1 text-sm text-gcp-text-secondary">
                                    Your latest requests, budgets, and delivery progress.
                                </p>
                            </div>
                            <Link href="/client" className="text-sm font-medium text-gcp-blue hover:underline">
                                Open Job Center
                            </Link>
                        </div>

                        {loadingJobs ? (
                            <div className="flex min-h-[320px] items-center justify-center text-sm text-gcp-text-secondary">
                                Loading your workspace...
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-gcp-border text-center">
                                <FileText size={36} className="mb-4 text-gcp-text-disabled" />
                                <p className="text-sm font-medium text-gcp-text-secondary">No jobs posted yet.</p>
                                <p className="mt-2 max-w-sm text-xs leading-6 text-gcp-text-disabled">
                                    Start by posting a request. You can now attach a thumbnail or reference image right
                                    in the job form.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {jobs.slice(0, 6).map((job) => (
                                    <div
                                        key={job.id}
                                        className="flex flex-col gap-4 rounded-3xl border border-gcp-border p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            {job.thumbnail_data_url ? (
                                                <img
                                                    src={job.thumbnail_data_url}
                                                    alt=""
                                                    className="h-16 w-16 rounded-2xl border border-gcp-border object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-gcp-border bg-gcp-surface-v">
                                                    <FileImage size={18} className="text-gcp-text-disabled" />
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-semibold text-gcp-text">{job.title}</p>
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gcp-text-secondary">
                                                    <span className="font-mono">{job.id}</span>
                                                    <span>•</span>
                                                    <span>{new Date(job.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                            <span className="text-sm font-semibold text-gcp-green">
                                                ${job.budget_usd.toFixed(2)}
                                            </span>
                                            <span className="gcp-badge bg-gcp-blue/10 text-[10px] font-bold text-gcp-blue">
                                                {job.status.toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="gcp-card p-6 md:p-8">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gcp-blue/10">
                                    <Clock3 size={18} className="text-gcp-blue" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-gcp-text">How the plans work</h2>
                                    <p className="mt-1 text-sm text-gcp-text-secondary">
                                        Same workspace, different throughput and delivery lanes.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {featuredPlans.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className={`rounded-3xl border p-5 ${
                                            plan.featured ? "border-gcp-blue/30 bg-gcp-blue/[0.04]" : "border-gcp-border bg-gcp-surface"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gcp-blue">
                                                    {plan.name}
                                                </p>
                                                <p className="mt-2 text-2xl font-bold text-gcp-text">
                                                    {plan.price}
                                                    <span className="ml-1 text-sm font-normal text-gcp-text-disabled">
                                                        {plan.cadence}
                                                    </span>
                                                </p>
                                            </div>
                                            {plan.badge && (
                                                <span className="rounded-full border border-gcp-blue/20 bg-gcp-blue/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-gcp-blue">
                                                    {plan.badge}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-2xl bg-gcp-surface-v p-3">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-gcp-text-disabled">
                                                    Jobs / month
                                                </p>
                                                <p className="mt-1 font-semibold text-gcp-text">{plan.jobsPerMonth}</p>
                                            </div>
                                            <div className="rounded-2xl bg-gcp-surface-v p-3">
                                                <p className="text-[10px] font-black uppercase tracking-wider text-gcp-text-disabled">
                                                    Delivery
                                                </p>
                                                <p className="mt-1 font-semibold text-gcp-text">{plan.deliveryTarget}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button
                                type="button"
                                onClick={() => router.push("/pricing")}
                                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gcp-blue/20 bg-gcp-blue/10 px-4 py-3 text-sm font-semibold text-gcp-blue transition-colors hover:bg-gcp-blue/15"
                            >
                                Compare all plans
                                <ArrowRight size={14} />
                            </button>
                        </div>

                        <div className="gcp-card p-6 md:p-8">
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gcp-blue/10">
                                    <Sparkles size={18} className="text-gcp-blue" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-heading font-bold text-gcp-text">Need help?</h2>
                                    <p className="mt-1 text-sm text-gcp-text-secondary">
                                        The assistant now stays as a helper, not your dashboard.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm leading-6 text-gcp-text-secondary">
                                <p>Ask where to post work, what each plan unlocks, or how the minimum budget is applied.</p>
                                <p>Use the dashboard for overview, the job center for posting, and pricing when you want to upgrade.</p>
                            </div>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={() => setChatOpen(true)}
                                    className="gcp-btn-primary inline-flex items-center gap-2"
                                >
                                    Open Assistant
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        await signOut();
                                        router.push("/login");
                                    }}
                                    className="gcp-btn-text inline-flex items-center gap-2"
                                >
                                    <LogOut size={14} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </RouteGuard>
    );
}
