"use client";

import Link from "next/link";
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Clock3,
    FileText,
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
        title: "Not just a chatbot",
        copy: "Clients get intake, pricing, bidding where eligible, delivery tracking, review, and job history in one place.",
    },
    {
        icon: Clock3,
        title: "Faster throughput",
        copy: "Plans change capacity, speed, model quality, and review depth without changing the simple interface.",
    },
];

const DESTINATIONS = [
    {
        icon: Briefcase,
        title: "Job Center",
        copy: "Post a job, attach a thumbnail, and calculate the minimum project price before submission.",
        href: "/client",
        accent: "from-white to-white",
    },
    {
        icon: Sparkles,
        title: "Marketplace",
        copy: "See recent client jobs and the kinds of work moving through the system.",
        href: "/marketplace",
        accent: "from-white to-white",
    },
    {
        icon: CheckCircle2,
        title: "Pricing",
        copy: "Compare plans by job volume, delivery target, model lane, review depth, and bidding agents.",
        href: "/pricing",
        accent: "from-white to-white",
    },
    {
        icon: FileText,
        title: "Whitepaper",
        copy: "Read the product architecture and delivery plan.",
        href: "/whitepaper",
        accent: "from-slate-100 to-white",
    },
];

const HOW_IT_WORKS = [
    "Write the job title and business requirements.",
    "Pantheon Mesh calculates the minimum project price.",
    "The job is delivered and tracked from one account.",
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
                    <div className="relative overflow-hidden rounded-[34px] border border-gcp-border bg-white p-7 shadow-xl md:p-10">
                        <div className="relative z-10">
                            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
                                <div>
                                    <h1 className="max-w-4xl text-3xl font-heading font-bold leading-tight text-gcp-text md:text-5xl xl:text-6xl">
                                        {user ? (
                                            <>
                                                Welcome back, {displayName}.
                                                <br />
                                                Run work from one account.
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
                                        Pantheon Mesh keeps it simple: describe the task, get a low AI project price,
                                        post the job, and track delivery without freelancer back-and-forth.
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
                                                    Sign In
                                                    <ArrowRight size={15} />
                                                </Link>
                                                <Link href="/pricing" className="gcp-btn-text inline-flex items-center gap-2 rounded-xl px-5 py-3">
                                                    Explore Pricing
                                                </Link>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="rounded-[28px] border border-gcp-border bg-white/90 p-6 shadow-lg backdrop-blur">
                                    <div className="mb-5 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gcp-text-disabled">
                                                Account Snapshot
                                            </p>
                                            <p className="mt-2 text-2xl font-bold text-gcp-text">{workspaceName}</p>
                                        </div>
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gcp-surface-v">
                                            <Zap size={22} className="text-gcp-text" />
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
                                                Bidding agents
                                            </p>
                                            <p className="mt-2 text-sm font-semibold text-gcp-text">{currentPlan.biddingAgents}</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-2xl border border-dashed border-gcp-border bg-white p-4">
                                        <p className="text-sm leading-6 text-gcp-text-secondary">
                                            Every job gets a minimum price before posting, so clients see a clear low price up front.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 grid gap-4 lg:grid-cols-3">
                                {WORKFLOW_PILLARS.map((item) => (
                                    <div key={item.title} className="rounded-[26px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gcp-surface-v">
                                            <item.icon size={19} className="text-gcp-text" />
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
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gcp-surface-v">
                                    <Sparkles size={20} className="text-gcp-text" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gcp-text-disabled">
                                        How It Works
                                    </p>
                                    <h2 className="mt-2 text-2xl font-bold text-gcp-text">How it works</h2>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {HOW_IT_WORKS.map((step, index) => (
                                    <div key={step} className="flex gap-4 rounded-2xl bg-gcp-surface-v p-4">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-gcp-text shadow-sm">
                                            {index + 1}
                                        </div>
                                        <p className="text-sm leading-6 text-gcp-text-secondary">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[30px] border border-gcp-border bg-white p-6 shadow-lg md:p-7">
                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gcp-text-disabled">
                                Quick Start
                            </p>
                            <h2 className="mt-3 text-2xl font-bold text-gcp-text">Start with a job</h2>
                            <p className="mt-4 text-sm leading-7 text-gcp-text-secondary">
                                A client can buy a raw AI chat app, but Pantheon gives them a workflow: minimum pricing,
                                job tracking, bidding agents on paid plans, review, and delivery history.
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                <Link href="/client" className="rounded-2xl border border-white/80 bg-white/90 p-4 transition-transform hover:-translate-y-0.5">
                                    <p className="text-sm font-bold text-gcp-text">Post new work</p>
                                    <p className="mt-2 text-xs leading-5 text-gcp-text-secondary">
                                        Open the job form and calculate the minimum project price.
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
                                    <item.icon size={22} className="text-gcp-text" />
                                </div>
                                <h2 className="text-xl font-bold text-gcp-text">{item.title}</h2>
                                <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">{item.copy}</p>
                                <div className="mt-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gcp-text">
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
