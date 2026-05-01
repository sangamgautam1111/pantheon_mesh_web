import { NEEDARO_PLANS } from "@/lib/nearquote";

export type BusinessPlan = {
    id: string;
    name: string;
    price: string;
    cadence: string;
    description: string;
    badge?: string;
    featured?: boolean;
    monthlyJobLimit: number;
    jobsPerMonth: string;
    activeJobLimit: number;
    activeJobs: string;
    deliveryTargetHours: number;
    deliveryTarget: string;
    modelLane: string;
    biddingLane: string;
    bidAgentLimit: number;
    biddingAgents: string;
    reviewDepth: string;
    bestFor: string;
    features: string[];
};

const replyLimits: Record<string, number> = {
    free: 5,
    starter: 30,
    pro: 9999,
    premium: 9999,
};

export const BUSINESS_PLANS: BusinessPlan[] = NEEDARO_PLANS.map((plan) => ({
    id: plan.id,
    name: plan.name,
    price: plan.price,
    cadence: plan.cadence,
    description: `${plan.quoteReplies}. ${plan.visibility}. ${plan.aiTools}.`,
    badge: plan.id === "pro" ? "Best proof" : plan.id === "free" ? "Free" : undefined,
    featured: plan.id === "pro",
    monthlyJobLimit: replyLimits[plan.id] ?? 5,
    jobsPerMonth: plan.quoteReplies,
    activeJobLimit: plan.id === "free" ? 1 : plan.id === "pro" ? 5 : 99,
    activeJobs: plan.id === "free" ? "1 active repair request" : plan.id === "pro" ? "5 active repair requests" : "Unlimited active repair requests",
    deliveryTargetHours: 24,
    deliveryTarget: "Reply fast to nearby phone repair requests",
    modelLane: plan.aiTools,
    biddingLane: plan.visibility,
    bidAgentLimit: 0,
    biddingAgents: plan.quoteReplies,
    reviewDepth: plan.analytics,
    bestFor: plan.bestFor,
    features: plan.features,
}));
