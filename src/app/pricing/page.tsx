"use client";

import { Check, Sparkles } from "lucide-react";
import { BUSINESS_PLANS } from "@/lib/businessPlans";
import { useAuth } from "@/context/AuthContext";

export default function PricingPage() {
    const { user, profile, syncProfile } = useAuth();
    const currentPlanId = profile?.currentPlanId || "free";

    const handleUpgrade = async (planId: string) => {
        if (!user?.uid) return;
        try {
            const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${API}/v1/account/upgrade`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    target_plan_id: planId,
                }),
            });

            if (response.ok) {
                await syncProfile();
                window.location.reload();
            }
        } catch (error) {
            console.error("Upgrade failed:", error);
        }
    };

    return (
        <div className="mx-auto max-w-7xl p-6 md:p-8">
            <div className="mb-14 mt-8 max-w-4xl">
                <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-gcp-blue/20 bg-gcp-blue/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-gcp-blue">
                    <Sparkles size={14} />
                    Pricing
                </div>
                <h1 className="mb-4 text-4xl font-heading font-bold text-gcp-text md:text-6xl">
                    Pick the plan for your job volume, speed, and model quality.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-gcp-text-secondary">
                    Every plan uses the same simple workspace. Higher plans unlock more jobs, faster delivery,
                    stronger model lanes, deeper review, and bidding agents that compete to execute paid work.
                </p>
            </div>

            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {BUSINESS_PLANS.map((plan) => {
                    const isCurrentPlan = currentPlanId === plan.id;

                    return (
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
                                    ["Bidding execution", plan.biddingAgents],
                                    ["Review depth", plan.reviewDepth],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-start justify-between gap-4 text-sm">
                                        <span className="text-gcp-text-secondary">{label}</span>
                                        <span className="text-right font-semibold text-gcp-text">{value}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                type="button"
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={isCurrentPlan}
                                className={`mb-8 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold transition-all hover:scale-[1.02] ${
                                    isCurrentPlan
                                        ? "cursor-default border border-gcp-blue/20 bg-gcp-blue/10 text-gcp-blue"
                                        : plan.featured
                                          ? "bg-gcp-blue text-white shadow-lg shadow-gcp-blue/20"
                                          : "border border-gcp-border bg-gcp-surface-v text-gcp-text hover:bg-gcp-surface"
                                }`}
                            >
                                {isCurrentPlan ? "Current" : `Buy ${plan.name}`}
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
                    );
                })}
            </div>

            <div className="mb-8 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="gcp-card overflow-hidden">
                    <div className="border-b px-6 py-5" style={{ borderColor: "var(--border-color)" }}>
                        <h2 className="text-2xl font-bold text-gcp-text">Plan comparison</h2>
                        <p className="mt-2 text-sm leading-6 text-gcp-text-secondary">
                            Higher plans increase monthly capacity, speed up delivery, and route work through stronger
                            model, review, and bidding lanes.
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
                                    { label: "Bidding execution", key: "biddingAgents" },
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
                            <strong className="text-gcp-text">Free</strong> lets businesses try the real workspace with
                            lightweight jobs.
                        </p>
                        <p>
                            <strong className="text-gcp-text">Starter</strong> adds more monthly volume and faster
                            delivery for regular work.
                        </p>
                        <p>
                            <strong className="text-gcp-text">Growth</strong> is the best plan for most teams because it
                            improves model quality, delivery speed, and unlocks 6-agent bidding.
                        </p>
                        <p>
                            <strong className="text-gcp-text">Scale</strong> is for heavier usage, tighter deadlines, and
                            premium routing with up to 10 bidding agents.
                        </p>
                    </div>

                    <div className="mt-8 rounded-2xl border border-dashed border-gcp-blue/25 bg-gcp-blue/[0.04] p-4 text-sm text-gcp-text-secondary">
                        Buy plan buttons update the workspace plan now. Checkout can be connected later.
                    </div>
                </div>
            </div>
        </div>
    );
}
