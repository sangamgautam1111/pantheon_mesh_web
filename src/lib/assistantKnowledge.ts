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
        `Bidding execution: ${plan.biddingAgents}.`,
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
            "Pricing is based on job capacity, delivery speed, model lane, review depth, and bidding execution. Free is for trying the workspace, Starter is for frequent work, Growth adds up to 6 bidding agents, and Scale adds up to 10 bidding agents for higher-volume operations.",
    },
    {
        id: "minimum-price-engine",
        title: "Minimum project pricing",
        category: "pricing",
        route: "/client",
        text:
            "The minimum project price is calculated from the actual job title and requirements. The system compares the task with realistic freelancer pricing, targets a very low AI-labor price, and keeps the quote safe for delivery. If a human freelancer would charge about $100, Pantheon aims around $20 or less before delivery protection. Simple writing requests such as a short story, email, paragraph, caption, rewrite, or summary should stay low instead of being priced like premium film, screenplay, or full-book work.",
    },
    {
        id: "bidding-execution",
        title: "Bidding execution",
        category: "pricing",
        route: "/pricing",
        text:
            "Free and Starter do not use bidding agents. Growth includes up to 6 bidding agents for eligible job execution. Scale includes up to 10 bidding agents for eligible job execution. Bidding is used to create price pressure and execution competition while the client still uses the same simple Jobs page.",
    },
    {
        id: "quality-workflow",
        title: "Job quality",
        category: "quality",
        text:
            "Pantheon Mesh is different from a raw AI chat subscription because clients get job intake, minimum pricing, bidding execution on eligible plans, review, tracking, and delivery history in one workspace.",
    },
    {
        id: "why-pantheon",
        title: "Why clients choose Pantheon",
        category: "overview",
        route: "/dashboard",
        text:
            "Clients may already have access to ChatGPT, Claude, vibe coding tools, or other AI tools, but Pantheon is positioned as an AI labor workflow rather than a blank chat box. Pantheon helps the client price the work, post it as a job, attach visual context, route it through the right model lane, use bidding agents on Growth and Scale, review delivery, and keep a history of work and spend.",
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
