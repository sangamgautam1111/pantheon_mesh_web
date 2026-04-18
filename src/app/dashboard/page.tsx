"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Coins,
    FileText,
    LogOut,
    Plus,
    Rocket,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface Job {
    id: string;
    title: string;
    budget_usd: number;
    status: string;
    created_at: string;
    completed_at?: string | null;
}

export default function Dashboard() {
    const { user, profile, signOut } = useAuth();
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

        return {
            totalJobs: jobs.length,
            activeJobs,
            completedJobs,
            totalBudget,
        };
    }, [jobs]);

    return (
        <RouteGuard allowedTypes={["business"]}>
            <div className="max-w-7xl p-8">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-gcp-border bg-white shadow-sm">
                                {profile?.photoURL ? (
                                    <img src={profile.photoURL} alt="" className="h-10 w-10 rounded-full object-cover" />
                                ) : (
                                    <Rocket size={18} className="text-gcp-yellow" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-2xl font-heading font-bold text-gcp-text">
                                    {profile?.displayName || "Business Workspace"}
                                </h1>
                                <p className="text-xs font-mono text-gcp-text-secondary">{profile?.email}</p>
                            </div>
                        </div>
                        <p className="max-w-2xl text-sm text-gcp-text-secondary">
                            Run your client workflow from one place: submit requests, monitor active work, and review completed deliveries.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => router.push("/client")}
                            className="gcp-btn-primary flex items-center gap-2"
                        >
                            <Plus size={14} />
                            Post a Job
                        </button>
                        <button
                            onClick={() => router.push("/business/plans")}
                            className="gcp-btn-text flex items-center gap-2 text-gcp-text-secondary"
                        >
                            <Rocket size={14} />
                            View Plans
                        </button>
                        <button
                            onClick={async () => {
                                await signOut();
                                router.push("/login");
                            }}
                            className="gcp-btn-text flex items-center gap-2 text-gcp-text-secondary"
                        >
                            <LogOut size={14} />
                            Sign Out
                        </button>
                    </div>
                </div>

                <div className="mb-8 grid gap-4 md:grid-cols-4">
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
                    ].map((item) => (
                        <div key={item.label} className="gcp-card border-l-4 border-l-gcp-blue p-5">
                            <div className="mb-3 flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gcp-blue/5">
                                    {item.icon}
                                </div>
                                <span className="text-xs font-bold uppercase tracking-tight text-gcp-text-secondary opacity-60">
                                    {item.label}
                                </span>
                            </div>
                            <div className="text-2xl font-heading font-medium text-gcp-text">{item.value}</div>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                    <section className="gcp-card p-8">
                        <h2 className="mb-4 text-lg font-heading font-bold text-gcp-text">Business Workflow</h2>
                        <div className="space-y-4">
                            {[
                                {
                                    step: "1. Submit",
                                    copy: "Describe the task, attach the requirements, and set the budget you want to commit.",
                                },
                                {
                                    step: "2. Track",
                                    copy: "Monitor status updates from intake through execution, review, and delivery.",
                                },
                                {
                                    step: "3. Expand",
                                    copy: "Upgrade plans when you need faster turnaround, larger job volume, or premium review passes.",
                                },
                            ].map((item) => (
                                <div key={item.step} className="rounded-2xl border border-gcp-border bg-gcp-blue/5 p-5">
                                    <p className="text-xs font-bold uppercase tracking-widest text-gcp-blue">{item.step}</p>
                                    <p className="mt-2 text-sm leading-6 text-gcp-text-secondary">{item.copy}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/client" className="gcp-btn-primary inline-flex items-center gap-2">
                                Open Job Center
                                <ArrowRight size={14} />
                            </Link>
                            <Link href="/pricing" className="gcp-btn-text inline-flex items-center gap-2">
                                See pricing
                            </Link>
                        </div>
                    </section>

                    <section className="gcp-card p-8">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-heading font-bold text-gcp-text">Recent Jobs</h2>
                                <p className="mt-1 text-sm text-gcp-text-secondary">
                                    Your latest requests and delivery progress.
                                </p>
                            </div>
                            <Link href="/client" className="text-sm font-medium text-gcp-blue hover:underline">
                                Manage all jobs
                            </Link>
                        </div>

                        {loadingJobs ? (
                            <div className="flex min-h-[260px] items-center justify-center text-sm text-gcp-text-secondary">
                                Loading your business workspace...
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-gcp-border text-center">
                                <FileText size={36} className="mb-4 text-gcp-text-disabled" />
                                <p className="text-sm font-medium text-gcp-text-secondary">
                                    No jobs have been submitted yet.
                                </p>
                                <p className="mt-2 max-w-sm text-xs leading-5 text-gcp-text-disabled">
                                    Start with your first request and the portal will track every new job here.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {jobs.slice(0, 6).map((job) => (
                                    <div
                                        key={job.id}
                                        className="flex flex-col gap-4 rounded-2xl border border-gcp-border p-4 md:flex-row md:items-center md:justify-between"
                                    >
                                        <div>
                                            <p className="text-sm font-semibold text-gcp-text">{job.title}</p>
                                            <p className="mt-1 text-xs font-mono text-gcp-text-secondary">{job.id}</p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-3 md:justify-end">
                                            <span className="text-sm font-mono text-gcp-green">
                                                ${job.budget_usd.toFixed(2)}
                                            </span>
                                            <span className="gcp-badge bg-gcp-blue/10 px-2 py-0.5 text-[10px] text-gcp-blue">
                                                {job.status.toUpperCase()}
                                            </span>
                                            <span className="text-xs text-gcp-text-disabled">
                                                {new Date(job.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </RouteGuard>
    );
}
