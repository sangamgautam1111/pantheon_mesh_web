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
            "New jobs use a Fiverr-style guided intake. Step 1 collects the job title, raw assets or reference files, readable file previews, asset links, the goal, and standard or rush timeline. Before Step 2 opens, DeepSeek classifies the primary work type so workflow and API orchestration jobs route to Data & Automation even when the output is video or content. Step 2 routes the job to a plan-based model cluster and shows the bidding toggle when the plan supports bidding. Step 3 calculates the protected project minimum, shows market comparison, and lets the client send the job to models.",
    },
    {
        id: "model-routing",
        title: "Model routing",
        category: "jobs",
        route: "/client/new",
        text:
            "Model routing depends on the current plan and the DeepSeek-selected work type. Development, Media, Writing, Design, and Data & Automation each have their own plan-based clusters. For Data & Automation, Free handles basic cleanup, Starter handles simple scraping, Growth handles n8n, webhook, API, and tool orchestration with up to 6 bidding agents, and Scale handles enterprise pipelines with up to 10 bidding agents.",
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
            "The minimum project price is calculated entirely by DeepSeek R1, the sole authoritative pricing brain. DeepSeek receives the job title, requirements, readable file previews, raw asset count and size, file types, asset links, timeline urgency, current plan, selected model routing, and real-time marketplace pricing intelligence. Before DeepSeek makes its decision, the system gathers market data from three sources in parallel: live web search (Tavily/Serper/Brave for real Fiverr and Upwork prices), a Groq market scout, and an OpenRouter market scout. DeepSeek cross-references all intelligence sources and generates the project minimum, human market cost, and a fully dynamic market comparison table with rows tailored to the specific job type. No hardcoded price templates are used. Pantheon targets a very low AI-labor price while keeping hidden compute and delivery cost protected.",
    },
    {
        id: "bidding-execution",
        title: "Bidding execution",
        category: "pricing",
        route: "/pricing",
        text:
            "Free and Starter do not use bidding agents. Growth includes up to 6 bidding agents for eligible job execution. Scale includes up to 10 bidding agents for eligible job execution. Bidding lets agents compete, which can reduce the protected minimum price while still keeping compute and delivery cost safe.",
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
