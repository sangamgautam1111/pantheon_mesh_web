"use client";

import { Check, Sparkles } from "lucide-react";
import { BUSINESS_PLANS } from "@/lib/businessPlans";

export default function PricingPage() {
    return (
        <div className="mx-auto max-w-7xl p-8">
            <div className="mb-14 mt-8 max-w-4xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gcp-blue/20 bg-gcp-blue/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-gcp-blue">
                    <Sparkles size={14} />
                    Business Pricing
                </div>
                <h1 className="mb-4 text-4xl font-heading font-bold text-gcp-text md:text-6xl">
                    Pick the plan that matches your job volume, delivery speed, and model quality.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-gcp-text-secondary">
                    Plans are built around how many jobs you can post each month, how fast work is returned,
                    which AI lanes are available, and whether bidding is enabled to push the job price lower.
                </p>
            </div>

            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {BUSINESS_PLANS.map((plan) => (
                    <div
                        key={plan.id}
                        className={`gcp-card flex h-full flex-col p-7 shadow-lg ${
                            plan.featured ? "border-gcp-blue/30 bg-gcp-blue/[0.04] shadow-2xl" : ""
                        }`}
                    >
                        {plan.badge && (
                            <div
                                className={`mb-5 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] ${
                                    plan.featured
                                        ? "bg-gcp-blue text-white"
                                        : "border border-gcp-blue/20 bg-gcp-blue/5 text-gcp-blue"
                                }`}
                            >
                                {plan.badge}
                            </div>
                        )}

                        <div className="mb-4 flex items-end justify-between gap-3">
                            <h2 className={`text-2xl font-bold ${plan.featured ? "text-gcp-blue" : "text-gcp-text"}`}>
                                {plan.name}
                            </h2>
                            <span className="text-xs font-bold uppercase tracking-widest text-gcp-text-disabled">
                                {plan.bestFor}
                            </span>
                        </div>

                        <div className="mb-2 text-4xl font-bold text-gcp-text">
                            {plan.price}
                            <span className="text-sm font-normal text-gcp-text-disabled">{plan.cadence}</span>
                        </div>

                        <p className="mb-6 min-h-[72px] text-sm leading-6 text-gcp-text-secondary">
                            {plan.description}
                        </p>

                        <div className="mb-6 space-y-3 rounded-2xl bg-gcp-surface-v/60 p-4">
                            {[
                                ["Jobs / month", plan.jobsPerMonth],
                                ["Active jobs", plan.activeJobs],
                                ["Delivery target", plan.deliveryTarget],
                                ["Model lane", plan.modelLane],
                                ["Price bidding", plan.biddingLane],
                            ].map(([label, value]) => (
                                <div key={label} className="flex items-start justify-between gap-4 text-sm">
                                    <span className="text-gcp-text-secondary">{label}</span>
                                    <span className="text-right font-semibold text-gcp-text">{value}</span>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className={`mb-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold ${
                                plan.featured ? "bg-gcp-blue text-white" : "gcp-btn-secondary"
                            }`}
                        >
                            Buy {plan.name}
                        </button>

                        <div className="mt-auto space-y-4">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-3 text-sm">
                                    <Check size={18} className="mt-0.5 shrink-0 text-gcp-blue" />
                                    <span className="text-gcp-text-secondary">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="gcp-card overflow-hidden">
                    <div className="border-b px-6 py-5" style={{ borderColor: "var(--border-color)" }}>
                        <h2 className="text-2xl font-bold text-gcp-text">Plan comparison</h2>
                        <p className="mt-2 text-sm leading-6 text-gcp-text-secondary">
                            Bidding lowers price by letting the AI lanes allowed in your plan compete for the work.
                            Higher plans unlock better models, faster delivery targets, and stronger price pressure.
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gcp-surface-v/60 text-[10px] uppercase tracking-widest text-gcp-text-disabled">
                                <tr>
                                    <th className="px-6 py-3 font-bold">Feature</th>
                                    {BUSINESS_PLANS.map((plan) => (
                                        <th key={plan.id} className="px-6 py-3 font-bold">
                                            {plan.name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: "var(--border-color)" }}>
                                {[
                                    { label: "Jobs / month", key: "jobsPerMonth" },
                                    { label: "Active jobs", key: "activeJobs" },
                                    { label: "Delivery target", key: "deliveryTarget" },
                                    { label: "Model lane", key: "modelLane" },
                                    { label: "Price bidding", key: "biddingLane" },
                                    { label: "Review depth", key: "reviewDepth" },
                                    { label: "Best for", key: "bestFor" },
                                ].map((row) => (
                                    <tr key={row.label}>
                                        <td className="px-6 py-4 text-sm font-semibold text-gcp-text">{row.label}</td>
                                        {BUSINESS_PLANS.map((plan) => (
                                            <td key={`${plan.id}-${row.key}`} className="px-6 py-4 text-sm text-gcp-text-secondary">
                                                {plan[row.key as keyof typeof plan] as string}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="gcp-card bg-gradient-to-br from-gcp-surface to-gcp-surface-v p-8">
                    <h3 className="mb-4 text-xl font-bold text-gcp-text">Simple buying logic</h3>
                    <div className="space-y-4 text-sm leading-6 text-gcp-text-secondary">
                        <p>
                            <strong className="text-gcp-text">Free</strong> is for trying the workspace.
                        </p>
                        <p>
                            <strong className="text-gcp-text">Starter</strong> is for small teams that want lower prices through economy bidding.
                        </p>
                        <p>
                            <strong className="text-gcp-text">Growth</strong> is the best plan for most businesses because it improves model quality, delivery speed, and bidding power at the same time.
                        </p>
                        <p>
                            <strong className="text-gcp-text">Scale</strong> is for heavy usage, premium jobs, and the strongest routing lane.
                        </p>
                    </div>

                    <div className="mt-8 rounded-2xl border border-dashed border-gcp-blue/25 bg-gcp-blue/[0.04] p-4 text-sm text-gcp-text-secondary">
                        Buy plan buttons are visible now and checkout wiring can be connected later.
                    </div>
                </div>
            </div>
        </div>
    );
}
