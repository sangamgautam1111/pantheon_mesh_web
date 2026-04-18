"use client";

import Link from "next/link";
import { ArrowRight, Check, Layers, Rocket, Shield, TimerReset } from "lucide-react";

const FEATURE_GRID = [
    "Managed AI planning and execution",
    "Structured review before delivery",
    "Priority routing for paid plans",
    "Business dashboard and job tracking",
    "Escrow-style budget tracking",
    "Support for recurring digital work",
];

export default function BusinessPlansPage() {
    return (
        <div className="min-h-screen max-w-7xl bg-white p-6 text-black md:p-12">
            <div className="relative mb-20">
                <div className="absolute left-0 top-0 h-64 w-64 -translate-x-24 -translate-y-24 rounded-full bg-gcp-blue/5 blur-3xl" />
                <div className="relative z-10 max-w-3xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-black/[0.06] bg-black/[0.03] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-gcp-blue">
                        <Rocket size={14} />
                        Business Plans
                    </div>
                    <h1 className="mb-6 text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
                        Build your workflow on a single business account.
                    </h1>
                    <p className="text-lg leading-8 text-black/50">
                        One workspace handles intake, routing, review, and delivery.
                        Plans control capacity, priority, and quality depth without changing the product surface your team uses every day.
                    </p>
                </div>
            </div>

            <div className="mb-20 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[2.5rem] bg-black p-10 text-white shadow-2xl">
                    <div className="mb-10 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
                            <TimerReset size={24} className="text-gcp-blue" />
                        </div>
                        <div className="rounded-full border border-gcp-blue/20 bg-gcp-blue/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-gcp-blue">
                            Recommended
                        </div>
                    </div>

                    <p className="text-[10px] font-black uppercase tracking-[0.32em] text-white/35">Growth</p>
                    <div className="mt-4 flex items-end gap-3">
                        <h2 className="text-7xl font-black tracking-tight">$69</h2>
                        <span className="pb-3 text-sm font-bold uppercase tracking-[0.2em] text-white/40">per month</span>
                    </div>
                    <p className="mt-6 text-sm leading-7 text-white/60">
                        Best for businesses running active monthly work. It adds faster queueing and stronger review coverage without changing the simple workspace model.
                    </p>

                    <div className="mt-10 space-y-3 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/65">Queue priority</span>
                            <span className="font-bold text-gcp-blue">Elevated</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/65">Review depth</span>
                            <span className="font-bold text-white">Enhanced</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-white/65">Best fit</span>
                            <span className="font-bold text-white">Growing teams</span>
                        </div>
                    </div>

                    <Link
                        href="/client"
                        className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-[1.01]"
                    >
                        Open Job Center
                        <ArrowRight size={16} />
                    </Link>
                </div>

                <div className="rounded-[2.75rem] border border-black/[0.05] bg-white p-10 shadow-xl">
                    <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-4xl font-black tracking-tight">What the plans control</h3>
                            <p className="mt-3 text-sm leading-6 text-black/50">
                                The portal stays the same. What changes is throughput, routing priority, and how much review coverage each job receives.
                            </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[0.04]">
                            <Layers size={26} className="text-black/30" />
                        </div>
                    </div>

                    <div className="mb-12 grid gap-5 md:grid-cols-2">
                        {FEATURE_GRID.map((feature) => (
                            <div key={feature} className="flex items-start gap-3 rounded-2xl bg-black/[0.02] p-4">
                                <div className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-gcp-blue/10">
                                    <Check size={14} className="text-gcp-blue" />
                                </div>
                                <span className="text-sm font-medium leading-6 text-black/65">{feature}</span>
                            </div>
                        ))}
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            { label: "Starter", value: "Light volume", icon: <Rocket size={18} /> },
                            { label: "Growth", value: "Faster queue", icon: <TimerReset size={18} /> },
                            { label: "Scale", value: "Deeper review", icon: <Shield size={18} /> },
                        ].map((item) => (
                            <div key={item.label} className="rounded-[1.5rem] border border-black/[0.04] bg-black/[0.02] p-6">
                                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm text-gcp-blue">
                                    {item.icon}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-black/30">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-lg font-black text-black">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
