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
            "The Jobs page is the active jobs and history center. It shows posted work, status, price, thumbnails, and plan capacity. To create a new job, businesses use the guided intake at /client/new.",
    },
    {
        id: "guided-job-intake",
        title: "Guided job intake",
        category: "jobs",
        route: "/client/new",
        text:
            "New jobs use a Fiverr-style guided intake. Step 1 collects the job title, raw assets or reference files, readable file previews, asset links, the goal, and standard or rush timeline. Step 2 routes the job to a plan-based model cluster and shows the bidding toggle when the plan supports bidding. Free uses The Flash Squad, Starter uses The Standard Duo, Growth uses The Advanced Syndicate, and Scale uses The Elite Pantheon Council. Step 3 calculates the protected project minimum, shows market comparison, and lets the client fund the job and deploy agents.",
    },
    {
        id: "model-routing",
        title: "Model routing",
        category: "jobs",
        route: "/client/new",
        text:
            "Model routing depends on the current plan. The Flash Squad is the Free Basic AI Lane with Gemini 3 Flash as the coder and Qwen 3.5 27B as the reviewer for simple writing, formatting, small scripts, and lightweight tasks. The Standard Duo is the Starter Standard AI Lane with Claude Sonnet 4.6 as PM and architect plus DeepSeek V3.2 as debugger for frequent day-to-day coding. The Advanced Syndicate is the Growth Advanced AI Lane with Claude Sonnet 4.6, GPT-5.4, DeepSeek-R1, and GLM-5.1 plus up to 6 bidding agents for automations, backends, and integrations. The Elite Pantheon Council is the Scale Premium AI Lane with Claude Opus 4.7, GPT-5.3-Codex, Gemini 3 Pro, Llama 4 Maverick, and Qwen 3.6 A3B plus up to 10 bidding agents for complex full-stack, security, visual QA, and deep testing.",
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
        route: "/client/new",
        text:
            "The minimum project price is calculated from the actual job title, requirements, readable file previews, raw asset count and size, file types, asset links, timeline urgency, current plan, selected model routing, and marketplace pricing context. When configured, the price engine searches live market sources for Fiverr-style and freelancer rates, then shows a market comparison table such as Fiverr budget gigs, Upwork mid-range, elite freelancer or agency, and commercial UI kit where relevant. Pantheon targets a very low AI-labor price while keeping hidden compute and delivery cost protected. If a human freelancer would charge about $100, Pantheon aims around $10-$16 before delivery protection. Simple writing requests such as a short story, email, paragraph, caption, rewrite, or summary should stay low instead of being priced like premium film, screenplay, or full-book work.",
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
