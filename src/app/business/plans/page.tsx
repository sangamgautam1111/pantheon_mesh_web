"use client";

import Link from "next/link";
import { ArrowRight, Check, Layers3, Rocket, TimerReset } from "lucide-react";
import { BUSINESS_PLANS } from "@/lib/businessPlans";

const FEATURE_GRID = [
    "Managed AI planning and execution",
    "Structured review before delivery",
    "Job limits based on your plan",
    "Delivery targets based on your lane",
    "Bidding only where your plan allows it",
    "The same business workspace across every tier",
];

export default function BusinessPlansPage() {
    const recommendedPlan = BUSINESS_PLANS.find((plan) => plan.featured) ?? BUSINESS_PLANS[2];

    return (
        <div className="min-h-screen max-w-7xl p-6 md:p-12">
            <div className="relative mb-16">
                <div className="absolute left-0 top-0 h-64 w-64 -translate-x-24 -translate-y-24 rounded-full bg-gcp-blue/5 blur-3xl" />
                <div className="relative z-10 max-w-4xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gcp-blue/15 bg-gcp-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-gcp-blue">
                        <Rocket size={14} />
                        Business Plans
                    </div>
                    <h1 className="mb-6 text-4xl font-heading font-bold leading-[0.95] text-gcp-text md:text-7xl">
                        Build your workflow on one business account.
                    </h1>
                    <p className="max-w-3xl text-lg leading-8 text-gcp-text-secondary">
                        The product surface stays simple. What changes by plan is how many jobs you can post, how fast
                        delivery moves, which model lanes are available, and whether bidding can push the job price lower.
                    </p>
                </div>
            </div>

            <div className="mb-16 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[2.5rem] bg-black p-10 text-white shadow-2xl">
                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                            <TimerReset size={24} className="text-gcp-blue" />
                        </div>
                        {recommendedPlan.badge && (
                            <div className="rounded-full border border-gcp-blue/20 bg-gcp-blue/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-gcp-blue">
                                {recommendedPlan.badge}
                            </div>
                        )}
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-white/35">
                        {recommendedPlan.name}
                    </p>
                    <div className="mt-4 flex items-end gap-3">
                        <h2 className="text-7xl font-black tracking-tight">{recommendedPlan.price}</h2>
                        <span className="pb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/40">
                            {recommendedPlan.cadence.replace("/", "per ")}
                        </span>
                    </div>
                    <p className="mt-6 text-sm leading-7 text-white/60">{recommendedPlan.description}</p>

                    <div className="mt-10 space-y-3 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                        {[
                            ["Jobs per month", recommendedPlan.jobsPerMonth],
                            ["Delivery target", recommendedPlan.deliveryTarget],
                            ["Bidding lane", recommendedPlan.biddingLane],
                            ["Review depth", recommendedPlan.reviewDepth],
                        ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between gap-4 text-sm">
                                <span className="text-white/65">{label}</span>
                                <span className="text-right font-bold text-white">{value}</span>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/pricing"
                        className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-[1.01]"
                    >
                        Compare All Plans
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="rounded-[2.75rem] border border-gcp-border bg-gcp-surface p-10 shadow-xl">
                    <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-4xl font-heading font-bold tracking-tight text-gcp-text">
                                What the plans control
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">
                                Your workspace stays the same. Plans only change throughput, speed, price pressure, and
                                review strength.
                            </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gcp-surface-v">
                            <Layers3 size={26} className="text-gcp-text-disabled" />
                        </div>
                    </div>

                    <div className="mb-12 grid gap-5 md:grid-cols-2">
                        {FEATURE_GRID.map((feature) => (
                            <div key={feature} className="flex items-start gap-3 rounded-2xl bg-gcp-surface-v p-4">
                                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gcp-blue/10">
                                    <Check size={14} className="text-gcp-blue" />
                                </div>
                                <span className="text-sm font-medium leading-6 text-gcp-text-secondary">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {BUSINESS_PLANS.filter((plan) => ["free", "starter", "growth"].includes(plan.id)).map((plan) => (
                            <div key={plan.id} className="rounded-[1.5rem] border border-gcp-border bg-gcp-surface-v p-6">
                                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-gcp-surface text-gcp-blue shadow-sm">
                                    <Rocket size={18} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-gcp-text-disabled">
                                    {plan.name}
                                </p>
                                <p className="mt-2 text-lg font-bold text-gcp-text">{plan.deliveryTarget}</p>
                                <p className="mt-2 text-sm text-gcp-text-secondary">{plan.biddingLane}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
