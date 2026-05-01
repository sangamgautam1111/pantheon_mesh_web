"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { BarChart3, CheckCircle2, Crown, Eye, MapPin, ShieldCheck, Sprout, Store, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PLANS = [
    {
        id: "free",
        name: "Free",
        icon: Sprout,
        price: { monthly: 0, annually: 0 },
        caption: "Get started and test Needero",
        tone: "blue",
        features: [
            "Basic business profile",
            "5 offer replies/month",
            "Appear in phone repair Needs",
        ],
        cta: "Get Started Free",
    },
    {
        id: "pro",
        name: "Pro",
        icon: Zap,
        price: { monthly: 1999, annually: 19190 },
        caption: "For businesses ready to grow",
        popular: true,
        tone: "primary",
        features: [
            "Unlimited offer replies",
            "AI quote helper",
            "Verified business profile",
            "Basic analytics",
            "Higher placement in relevant offer lists",
        ],
        cta: "Start Pro Plan",
    },
    {
        id: "premium",
        name: "Premium",
        icon: Crown,
        price: { monthly: 4999, annually: 47990 },
        caption: "For maximum growth and visibility",
        tone: "green",
        features: [
            "Everything in Pro",
            "Priority placement",
            "Featured business profile",
            "Instant lead alerts",
            "Advanced analytics",
            "Top Rated badge eligibility",
            "Stronger recommendation boost",
        ],
        cta: "Start Premium Plan",
    },
];

const TRUST_ITEMS = [
    {
        icon: ShieldCheck,
        title: "Verified Businesses",
        text: "Build trust with customers using verified profiles.",
    },
    {
        icon: Zap,
        title: "Faster Replies",
        text: "Respond quickly and win more customers.",
    },
    {
        icon: Eye,
        title: "More Visibility",
        text: "Higher placement means more real local leads.",
    },
    {
        icon: BarChart3,
        title: "AI-Powered Tools",
        text: "Smart quotes, insights, and recommendations.",
    },
];

export default function PricingPage() {
    const { user, profile, syncProfile } = useAuth();
    const router = useRouter();
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annually">("monthly");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [error, setError] = useState("");

    const activePlanId = profile?.currentPlanId || "free";
    const billingLabel = billingCycle === "monthly" ? "month" : "year";

    const handleSelectPlan = async (planId: string) => {
        if (!user) {
            router.push("/login?role=business");
            return;
        }

        setLoadingPlan(planId);
        setError("");
        try {
            const res = await fetch("/api/needero/v1/account/upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    target_plan_id: planId,
                }),
            });

            if (res.ok) {
                await syncProfile();
            } else {
                const data = await res.json().catch(() => null);
                setError(data?.detail || data?.error || "Could not update this plan right now.");
            }
        } catch (error) {
            console.error("Failed to upgrade plan:", error);
            setError("Needero could not update this plan right now.");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <RouteGuard allowedTypes={["business"]}>
            <main className="min-h-screen bg-[#fbfdfb] px-4 py-10 text-[#0f172a] sm:px-6 lg:px-8">
                <section className="relative mx-auto max-w-6xl overflow-hidden">
                    <div className="pointer-events-none absolute left-6 top-20 hidden text-[#d9efe3] md:block">
                        <MapPin size={82} strokeWidth={1.2} />
                    </div>
                    <div className="pointer-events-none absolute right-6 top-20 hidden text-[#d9efe3] md:block">
                        <Store size={82} strokeWidth={1.2} />
                    </div>

                    <div className="mx-auto max-w-2xl text-center">
                        <span className="inline-flex rounded-full bg-[#e9f9f0] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-[#0a8f45]">
                            Plans & Pricing
                        </span>
                        <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-[-0.055em] text-[#121a25] sm:text-5xl">
                            Choose the right plan to <span className="text-[#0a8f45]">grow your repair shop</span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#64748b]">
                            Connect with phone repair customers, send Repair Offers, and grow your revenue with Needero's tools and visibility.
                        </p>

                        <div className="mt-7 inline-flex items-center gap-3 rounded-full border border-[#dfe8e3] bg-white px-3 py-2 shadow-sm">
                            <span className={`text-xs font-bold ${billingCycle === "monthly" ? "text-[#121a25]" : "text-[#94a3b8]"}`}>Pay monthly</span>
                            <button
                                type="button"
                                onClick={() => setBillingCycle((current) => current === "monthly" ? "annually" : "monthly")}
                                className="relative h-6 w-12 rounded-full bg-[#0a8f45] transition"
                                aria-label="Toggle billing cycle"
                            >
                                <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${billingCycle === "annually" ? "left-7" : "left-1"}`} />
                            </button>
                            <span className={`text-xs font-bold ${billingCycle === "annually" ? "text-[#121a25]" : "text-[#94a3b8]"}`}>Pay annually</span>
                            <span className="rounded-full bg-[#e9f9f0] px-2 py-1 text-[10px] font-black text-[#0a8f45]">Save 20%</span>
                        </div>

                        {error && (
                            <p className="mx-auto mt-5 max-w-xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                                {error}
                            </p>
                        )}
                    </div>

                    <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
                        {PLANS.map((plan) => {
                            const Icon = plan.icon;
                            const isCurrentPlan = activePlanId === plan.id;
                            const price = plan.price[billingCycle];
                            const isPro = plan.id === "pro";
                            const monthlyEquivalent = billingCycle === "annually" && price > 0 ? Math.round(price / 12) : 0;

                            return (
                                <article
                                    key={plan.id}
                                    className={`relative flex min-h-[420px] flex-col rounded-3xl border bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)] ${
                                        isPro ? "border-[#1f6fff] ring-2 ring-[#1f6fff]/80" : "border-[#e4ebe7]"
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-[#1f6fff] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-white shadow-lg">
                                            <Crown size={12} fill="currentColor" />
                                            Most Popular
                                        </div>
                                    )}

                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                                            <Icon size={24} />
                                        </div>
                                        {isCurrentPlan && (
                                            <span className="rounded-full bg-[#eef2f7] px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#475569]">
                                                Current
                                            </span>
                                        )}
                                    </div>

                                    <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#121a25]">{plan.name}</h2>
                                    <div className="mt-2 flex items-end gap-1">
                                        <span className="text-4xl font-black tracking-[-0.05em] text-[#121a25]">NPR {price.toLocaleString("en-US")}</span>
                                        <span className="pb-1 text-sm font-semibold text-[#94a3b8]">/{billingLabel}</span>
                                    </div>
                                    {billingCycle === "annually" && monthlyEquivalent > 0 && (
                                        <p className="mt-1 text-xs font-bold text-[#0a8f45]">
                                            Equals NPR {monthlyEquivalent.toLocaleString("en-US")}/month, billed yearly
                                        </p>
                                    )}
                                    <p className="mt-3 min-h-10 text-sm leading-6 text-[#64748b]">{plan.caption}</p>

                                    <div className="my-6 h-px bg-[#edf2ef]" />

                                    <ul className="flex-1 space-y-3">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-2 text-sm font-semibold text-[#334155]">
                                                <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#0a8f45]" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        type="button"
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={isCurrentPlan || !!loadingPlan}
                                        className={`mt-8 h-12 rounded-xl text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60 ${
                                            isPro
                                                ? "bg-[#1f6fff] text-white shadow-lg shadow-blue-500/20 hover:bg-[#125be0]"
                                                : plan.id === "premium"
                                                  ? "border border-[#0a8f45] bg-white text-[#0a8f45] hover:bg-[#e9f9f0]"
                                                  : "border border-[#1f6fff] bg-white text-[#1f6fff] hover:bg-[#eef5ff]"
                                        }`}
                                    >
                                        {loadingPlan === plan.id ? "Updating..." : isCurrentPlan ? "Current Plan" : plan.cta}
                                    </button>

                                    {isPro && (
                                        <p className="mt-3 text-center text-xs font-semibold text-[#0a8f45]">
                                            Cancel anytime
                                        </p>
                                    )}
                                </article>
                            );
                        })}
                    </div>

                    <div className="mt-8 grid gap-4 rounded-3xl border border-[#e4ebe7] bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:grid-cols-2 lg:grid-cols-4">
                        {TRUST_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.title} className="flex items-center gap-4 rounded-2xl bg-[#fbfdfb] p-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                                        <Icon size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#121a25]">{item.title}</p>
                                        <p className="mt-1 text-xs leading-5 text-[#64748b]">{item.text}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold text-[#64748b]">
                        <CheckCircle2 size={14} className="text-[#0a8f45]" />
                        Secure payments. Cancel anytime. No hidden fees.
                    </p>
                </section>
            </main>
        </RouteGuard>
    );
}
