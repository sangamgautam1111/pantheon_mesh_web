import { BUSINESS_PLANS } from "@/lib/businessPlans";

export type AssistantKnowledgeDoc = {
    id: string;
    title: string;
    category: "overview" | "jobs" | "plans" | "pricing" | "quality" | "marketplace";
    route?: string;
    text: string;
};

const planDocs: AssistantKnowledgeDoc[] = BUSINESS_PLANS.map((plan) => ({
    id: `plan-${plan.id}`,
    title: `${plan.name} plan`,
    category: "plans",
    route: plan.id === "free" ? "/pricing" : "/pricing",
    text: [
        `${plan.name} costs ${plan.price}${plan.cadence}.`,
        plan.description,
        `It allows ${plan.jobsPerMonth} with ${plan.activeJobs}.`,
        `Typical delivery target is ${plan.deliveryTarget}.`,
        `Model lane: ${plan.modelLane}.`,
        `Bidding access: ${plan.biddingLane}.`,
        `Review depth: ${plan.reviewDepth}.`,
        `Best for: ${plan.bestFor}.`,
        `Included features: ${plan.features.join("; ")}.`,
    ].join(" "),
}));

export const ASSISTANT_KNOWLEDGE: AssistantKnowledgeDoc[] = [
    {
        id: "overview-dashboard",
        title: "Business dashboard",
        category: "overview",
        route: "/dashboard",
        text:
            "The dashboard is the business command center. It shows submitted jobs, active jobs, completed jobs, committed budget, jobs with thumbnails, recent job history, and quick paths to the job center, pricing, plans, and the assistant.",
    },
    {
        id: "job-center",
        title: "Business job center",
        category: "jobs",
        route: "/client",
        text:
            "Businesses post work from the Business Job Center. A job includes a title, requirements, budget in USD, and an optional thumbnail or reference image. Posted jobs appear in job history with status, budget, and created date.",
    },
    {
        id: "pricing-summary",
        title: "Pricing summary",
        category: "pricing",
        route: "/pricing",
        text:
            "Pricing is based on job capacity, delivery speed, model lane, bidding access, and review depth. Free is for trying the workspace, Starter is for recurring weekly tasks, Growth is the best plan for most active businesses, and Scale is for higher-volume operations.",
    },
    {
        id: "quality-workflow",
        title: "Managed quality workflow",
        category: "quality",
        text:
            "Each request goes through planning, execution, review, and fallback handling. The platform keeps the workflow simple for the client while applying routing, review coverage, and delivery checks behind the scenes.",
    },
    {
        id: "marketplace-overview",
        title: "Marketplace",
        category: "marketplace",
        route: "/marketplace",
        text:
            "The marketplace shows live business work categories and recent posted jobs. It helps businesses understand the kinds of outcomes moving through Pantheon Mesh right now.",
    },
    ...planDocs,
];
