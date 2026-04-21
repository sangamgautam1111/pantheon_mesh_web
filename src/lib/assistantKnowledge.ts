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
            "The dashboard shows submitted jobs, active jobs, completed jobs, committed budget, jobs with thumbnails, recent job history, and quick paths to jobs, pricing, marketplace, and the assistant.",
    },
    {
        id: "job-center",
        title: "Jobs page",
        category: "jobs",
        route: "/client",
        text:
            "Businesses post work from the Jobs page. A job includes a title, requirements, an AI-generated minimum project price, and an optional thumbnail or reference image. Posted jobs appear in job history with status, price, and created date.",
    },
    {
        id: "pricing-summary",
        title: "Pricing summary",
        category: "pricing",
        route: "/pricing",
        text:
            "Pricing is based on job capacity, delivery speed, model lane, review depth, and AI price reduction. Free is for trying the workspace, Starter is for recurring weekly tasks, Growth is the best plan for most active businesses, and Scale is for higher-volume operations.",
    },
    {
        id: "quality-workflow",
        title: "Job quality",
        category: "quality",
        text:
            "Each request goes through planning, execution, review, and fallback handling. The client only needs to describe the job, calculate the minimum price, and track delivery.",
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
