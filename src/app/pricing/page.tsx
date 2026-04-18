"use client";

import Link from "next/link";
import { Check } from "lucide-react";

const PLANS = [
    {
        name: "Starter",
        price: "$29",
        cadence: "/month",
        description: "A lightweight business workspace for small recurring tasks and experiments.",
        cta: "Start with Starter",
        href: "/login",
        featured: false,
        features: [
            "Business account workspace",
            "Core managed AI workflow",
            "Light monthly job volume",
            "Standard review pass",
            "Shared queue and dashboard access",
        ],
    },
    {
        name: "Growth",
        price: "$69",
        cadence: "/month",
        description: "The main plan for teams that want faster delivery and stronger quality control.",
        cta: "Choose Growth",
        href: "/business/plans",
        featured: true,
        features: [
            "Higher monthly job capacity",
            "Priority queueing",
            "Enhanced review coverage",
            "Faster turnaround targets",
            "Team-ready business workflow",
        ],
    },
    {
        name: "Scale",
        price: "$149",
        cadence: "/month",
        description: "Expanded throughput and premium handling for larger operating teams.",
        cta: "Talk about Scale",
        href: "/business/plans",
        featured: false,
        features: [
            "Premium delivery lane",
            "Higher concurrency for active work",
            "Deeper review and fallback checks",
            "Priority support",
            "Best fit for sustained production volume",
        ],
    },
];

export default function PricingPage() {
    return (
        <div className="mx-auto max-w-6xl p-8">
            <div className="mb-16 mt-8 text-center">
                <h1 className="mb-4 text-4xl font-heading font-bold text-gcp-text">
                    Business Pricing
                </h1>
                <p className="mx-auto max-w-2xl text-lg text-gcp-text-secondary">
                    Pantheon Mesh now runs as a business-only platform. Choose the monthly capacity,
                    review depth, and turnaround profile that match your workflow.
                </p>
            </div>

            <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
                {PLANS.map((plan) => (
                    <div
                        key={plan.name}
                        className={`gcp-card p-8 shadow-lg ${
                            plan.featured ? "scale-[1.02] border-gcp-blue/30 bg-gcp-blue/[0.03] shadow-2xl" : ""
                        }`}
                    >
                        {plan.featured && (
                            <div className="mb-4 inline-flex rounded-full bg-gcp-blue px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-white">
                                Most Popular
                            </div>
                        )}
                        <h2 className={`mb-4 text-2xl font-bold ${plan.featured ? "text-gcp-blue" : "text-gcp-text"}`}>
                            {plan.name}
                        </h2>
                        <div className="mb-2 text-4xl font-bold text-gcp-text">
                            {plan.price}
                            <span className="text-sm font-normal text-gcp-text-disabled">{plan.cadence}</span>
                        </div>
                        <p className="mb-8 min-h-[72px] text-sm leading-6 text-gcp-text-secondary">
                            {plan.description}
                        </p>

                        <Link
                            href={plan.href}
                            className={`mb-10 inline-flex w-full items-center justify-center rounded-md px-4 py-3 text-sm font-bold ${
                                plan.featured ? "bg-gcp-blue text-white" : "gcp-btn-secondary"
                            }`}
                        >
                            {plan.cta}
                        </Link>

                        <div className="space-y-4">
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

            <div className="gcp-card bg-gradient-to-br from-gcp-surface to-gcp-surface-v p-8">
                <h3 className="mb-3 text-xl font-bold text-gcp-text">Need a higher-touch rollout?</h3>
                <p className="max-w-3xl text-sm leading-6 text-gcp-text-secondary">
                    Start with Growth or Scale, then expand as your team learns which work types perform best inside the managed AI workflow.
                    The business dashboard and job center stay the same across every plan.
                </p>
            </div>
        </div>
    );
}
