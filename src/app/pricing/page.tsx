"use client";

import { useAuth } from "@/context/AuthContext";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PLANS = [
    {
        id: "free",
        name: "Free",
        price: "$0/month",
        bestFor: "New businesses testing Needaro",
        features: [
            "Basic business profile",
            "5 offer replies/month",
            "Appear in relevant local Needs",
        ],
    },
    {
        id: "pro",
        name: "Pro",
        price: "$19/month",
        bestFor: "Active businesses that want more customers",
        features: [
            "Unlimited offer replies",
            "AI quote helper",
            "Verified business profile",
            "Basic analytics",
            "Higher placement in relevant offer lists",
        ],
    },
    {
        id: "premium",
        name: "Premium",
        price: "$49/month",
        bestFor: "Serious businesses that want maximum visibility",
        features: [
            "Everything in Pro",
            "Priority placement",
            "Featured business profile",
            "Instant lead alerts",
            "Advanced analytics",
            "Top Rated badge eligibility",
            "Stronger recommendation boost",
        ],
    },
];

export default function PricingPage() {
    const { user, profile } = useAuth();
    const router = useRouter();
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSelectPlan = async (planId: string) => {
        if (!user) {
            router.push("/login?role=business");
            return;
        }

        setLoadingPlan(planId);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/account/upgrade`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: user.uid,
                    target_plan_id: planId,
                }),
            });

            if (res.ok) {
                // Success
                window.location.reload();
            }
        } catch (error) {
            console.error("Failed to upgrade plan:", error);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-[var(--text-primary)]">
                    Grow Your Local Business
                </h1>
                <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
                    Choose the plan that fits your business needs. Connect with local customers
                    and grow your revenue with Needero.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {PLANS.map((plan) => {
                    const isCurrentPlan = profile?.currentPlanId === plan.id;

                    return (
                        <div
                            key={plan.id}
                            className={`rounded-2xl p-8 border ${
                                plan.id === "pro"
                                    ? "border-blue-500 shadow-lg shadow-blue-500/10 relative"
                                    : "border-[var(--border-color)] bg-white/[0.02]"
                            }`}
                        >
                            {plan.id === "pro" && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                                {plan.name}
                            </h3>
                            <div className="text-3xl font-bold text-[var(--text-primary)] mb-4">
                                {plan.price}
                            </div>
                            <p className="text-sm text-[var(--text-secondary)] mb-6 h-10">
                                {plan.bestFor}
                            </p>

                            <ul className="space-y-4 mb-8 flex-1">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check
                                            size={20}
                                            className="text-green-500 flex-shrink-0 mt-0.5"
                                        />
                                        <span className="text-sm text-[var(--text-primary)]">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={isCurrentPlan || !!loadingPlan}
                                className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
                                    isCurrentPlan
                                        ? "bg-white/10 text-white/50 cursor-not-allowed"
                                        : plan.id === "pro"
                                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                                          : "bg-white/10 hover:bg-white/20 text-[var(--text-primary)]"
                                }`}
                            >
                                {loadingPlan === plan.id
                                    ? "Updating..."
                                    : isCurrentPlan
                                      ? "Current Plan"
                                      : "Select Plan"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
