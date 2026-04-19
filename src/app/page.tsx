"use client";

import Link from "next/link";
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Clock3,
    FileText,
    Layers3,
    ShieldCheck,
    Sparkles,
    Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { BUSINESS_PLANS } from "@/lib/businessPlans";

const WORKFLOW_PILLARS = [
    {
        icon: FileText,
        title: "Submit outcomes",
        copy: "Request emails, landing pages, research briefs, support drafts, and other repeatable business work from one intake flow.",
    },
    {
        icon: ShieldCheck,
        title: "Protected delivery",
        copy: "Every request is routed through planning, execution, review, and fallback checks before it reaches your workspace.",
    },
    {
        icon: Clock3,
        title: "Faster throughput",
        copy: "Plans change capacity and delivery speed, while the interface stays simple for the team using it every day.",
    },
];

const DESTINATIONS = [
    {
        icon: Briefcase,
        title: "Job Center",
        copy: "Post a job, attach a thumbnail, and let the platform set a protected minimum budget before submission.",
        href: "/client",
        accent: "from-blue-50 to-white",
    },
    {
        icon: Sparkles,
        title: "Marketplace",
        copy: "See the live business jobs and managed work categories currently moving through the system.",
        href: "/marketplace",
        accent: "from-amber-50 to-white",
    },
    {
        icon: CheckCircle2,
        title: "Pricing",
        copy: "Compare the business plans by monthly jobs, delivery target, review depth, and model lane.",
        href: "/pricing",
        accent: "from-emerald-50 to-white",
    },
    {
        icon: FileText,
        title: "Whitepaper",
        copy: "Read the product architecture and how the managed business workflow is structured end to end.",
        href: "/whitepaper",
        accent: "from-slate-100 to-white",
    },
];

const HOW_IT_WORKS = [
    "Write the job title and business requirements.",
    "Pantheon Mesh estimates provider cost and applies a protected client minimum budget.",
    "The managed workflow executes, reviews, and delivers through one business workspace.",
];

export default function Home() {
    const { user, profile } = useAuth();
    const currentPlan = BUSINESS_PLANS.find((plan) => plan.id === profile?.currentPlanId) ?? BUSINESS_PLANS[0];
    const displayName = profile?.displayName || user?.displayName || "Team";
    const workspaceName = profile?.companyName || displayName;

    return (
        <div className="w-full px-4 py-6 md:px-8 md:py-8">
            <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-8">
                <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
                    <div className="relative overflow-hidden rounded-[34px] border border-gcp-border bg-[radial-gradient(circle_at_top_right,rgba(26,115,232,0.18),transparent_30%),radial-gradient(circle_at_left_bottom,rgba(251,188,4,0.12),transparent_24%),linear-gradient(180deg,#ffffff,rgba(248,249,250,0.98))] p-7 shadow-xl md:p-10">
                        <div className="absolute right-0 top-0 h-56 w-56 translate-x-16 -translate-y-16 rounded-full bg-blue-100/60 blur-3xl" />
                        <div className="relative z-10">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gcp-blue/15 bg-gcp-blue/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-gcp-blue">
                                <Layers3 size={14} />
                                Managed Business Workspace
                            </div>

                            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                                <div>
                                    <h1 className="max-w-4xl text-3xl font-heading font-bold leading-tight text-gcp-text md:text-5xl xl:text-6xl">
                                        {user ? (
                                            <>
                                                Welcome back, {displayName}.
                                                <br />
                                                Run work from one business account.
                                            </>
                                        ) : (
                                            <>
                                                AI execution built
                                                <br />
                                                for business work.
                                            </>
                                        )}
                                    </h1>

                                    <p className="mt-6 max-w-3xl text-base leading-8 text-gcp-text-secondary md:text-lg">
                                        Pantheon Mesh keeps the product simple: businesses submit work, the managed AI workflow
                                        executes it, and the workspace tracks budgets, delivery, and history without the usual
                                        freelancer back-and-forth.
                                    </p>

                                    <div className="mt-8 flex flex-wrap gap-3">
                                        {user ? (
                                            <>
                                                <Link href="/dashboard" className="gcp-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3">
                                                    Open Dashboard
                                                    <ArrowRight size={15} />
                                                </Link>
                                                <Link href="/client" className="gcp-btn-text inline-flex items-center gap-2 rounded-xl px-5 py-3">
                                                    Post a Job
                                                </Link>
                                                <Link href="/pricing" className="gcp-btn-text inline-flex items-center gap-2 rounded-xl px-5 py-3">
                                                    View Pricing
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <Link href="/login" className="gcp-btn-primary inline-flex items-center gap-2 rounded-xl px-5 py-3">
                                                    Sign In to Business Workspace
                                                    <ArrowRight size={15} />
                                                </Link>
                                                <Link href="/pricing" className="gcp-btn-text inline-flex items-center gap-2 rounded-xl px-5 py-3">
                                                    Explore Pricing
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-gcp-blue/10 bg-white/90 p-6 shadow-lg backdrop-blur">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gcp-blue">
                                                Workspace Snapshot
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-gcp-text">{workspaceName}</p>
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gcp-blue/10">
                                            <Zap size={22} className="text-gcp-blue" />
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <div className="rounded-2xl bg-gcp-surface-v p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gcp-text-disabled">
                                                Current plan
                                            </p>
                                            <p className="mt-2 text-lg font-bold text-gcp-text">{currentPlan.name}</p>
                                        </div>
                                        <div className="rounded-2xl bg-gcp-surface-v p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gcp-text-disabled">
                                                Delivery target
                                            </p>
                                            <p className="mt-2 text-lg font-bold text-gcp-text">{currentPlan.deliveryTarget}</p>
                                        </div>
                                        <div className="rounded-2xl bg-gcp-surface-v p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gcp-text-disabled">
                                                Model lane
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-gcp-text">{currentPlan.modelLane}</p>
                                        </div>
                                        <div className="rounded-2xl bg-gcp-surface-v p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gcp-text-disabled">
                                                Monthly capacity
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-gcp-text">{currentPlan.jobsPerMonth}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-dashed border-gcp-blue/20 bg-gcp-blue/[0.04] p-4">
                                        <p className="text-sm leading-6 text-gcp-text-secondary">
                                            Job budgets are now protected by an AI minimum that stays above estimated provider cost before a request is posted.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                                {WORKFLOW_PILLARS.map((item) => (
                                    <div key={item.title} className="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gcp-blue/10">
                                            <item.icon size={19} className="text-gcp-blue" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gcp-text">{item.title}</h2>
                                        <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">{item.copy}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        <div className="gcp-card rounded-[30px] p-6 md:p-7">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gcp-blue/10">
                                    <Sparkles size={20} className="text-gcp-blue" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gcp-blue">
                                        How It Works
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-gcp-text">One clean workflow</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {HOW_IT_WORKS.map((step, index) => (
                                    <div key={step} className="flex gap-4 rounded-2xl bg-gcp-surface-v p-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-gcp-blue shadow-sm">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm leading-6 text-gcp-text-secondary">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[30px] border border-gcp-blue/15 bg-[linear-gradient(180deg,rgba(26,115,232,0.08),rgba(255,255,255,0.98))] p-6 shadow-lg md:p-7">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gcp-blue">
                                Operator Notes
                            </p>
                            <h2 className="mt-3 text-2xl font-bold text-gcp-text">Built for business speed, not clutter</h2>
                            <p className="mt-4 text-sm leading-7 text-gcp-text-secondary">
                                The welcome page is now a real workspace overview. Use it to jump into jobs, understand the current plan, and move directly into the screens that matter.
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <Link href="/client" className="rounded-2xl border border-white/80 bg-white/90 p-4 transition-transform hover:-translate-y-0.5">
                                    <p className="text-sm font-bold text-gcp-text">Post new work</p>
                                    <p className="mt-2 text-xs leading-5 text-gcp-text-secondary">
                                        Open the job form and let the system calculate the protected minimum budget.
                                    </p>
                                </Link>
                                <Link href="/pricing" className="rounded-2xl border border-white/80 bg-white/90 p-4 transition-transform hover:-translate-y-0.5">
                                    <p className="text-sm font-bold text-gcp-text">Review plan limits</p>
                                    <p className="mt-2 text-xs leading-5 text-gcp-text-secondary">
                                        Compare monthly job capacity, delivery target, and model lane in one place.
                                    </p>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
                    {DESTINATIONS.map((item) => (
                        <Link key={item.title} href={item.href} className="group h-full">
                            <div
                                className={`h-full rounded-[28px] border border-gcp-border bg-gradient-to-br ${item.accent} p-7 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-xl`}
                            >
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                                    <item.icon size={22} className="text-gcp-blue" />
                                </div>
                                <h2 className="text-xl font-bold text-gcp-text">{item.title}</h2>
                                <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">{item.copy}</p>
                                <div className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gcp-blue">
                                    Open
                                    <ArrowRight size={13} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </section>
            </div>
        </div>
    );
}
