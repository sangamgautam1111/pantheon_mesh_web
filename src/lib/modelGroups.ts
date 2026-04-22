export type PlanId = "free" | "starter" | "growth" | "scale";
export type WorkCategoryId = "development" | "media" | "writing" | "design" | "automation";
export type ModelLaneId = "flash" | "standard" | "advanced" | "elite";

export interface WorkCategoryInput {
    title?: string;
    description?: string;
    assetTypes?: string[];
    assetLinks?: string[];
    assetTotalMb?: number;
}

export interface ModelGroupDefinition {
    id: ModelLaneId;
    planId: PlanId;
    planName: string;
    title: string;
    tag: string;
    description: string;
    examples: string;
    workflow: string;
    bidding: string;
    models: Array<{ role: string; name: string; logoKey: string }>;
}

export const WORK_CATEGORY_LABELS: Record<WorkCategoryId, string> = {
    development: "Development & Code",
    media: "Media & Video",
    writing: "Writing, Copy & SEO",
    design: "Design & UI/UX",
    automation: "Data & Automation",
};

export const PLAN_TO_LANE: Record<PlanId, ModelLaneId> = {
    free: "flash",
    starter: "standard",
    growth: "advanced",
    scale: "elite",
};

export const PLAN_RANK: Record<PlanId, number> = {
    free: 0,
    starter: 1,
    growth: 2,
    scale: 3,
};

export const LANE_RANK: Record<ModelLaneId, number> = {
    flash: 0,
    standard: 1,
    advanced: 2,
    elite: 3,
};

export const MODEL_GROUPS_BY_WORK_TYPE: Record<WorkCategoryId, ModelGroupDefinition[]> = {
    development: [
        {
            id: "flash",
            planId: "free",
            planName: "Free Plan",
            title: "The Flash Squad",
            tag: "Basic Code Lane",
            description: "Fast code generation for quick scripts, simple components, and basic syntax-safe output.",
            examples: "Small scripts, simple React sections, formatting fixes",
            workflow: "Gemini 3 Flash writes the script. Qwen 3.5 checks basic syntax before delivery.",
            bidding: "No bidding",
            models: [
                { role: "Coder", name: "Gemini 3 Flash", logoKey: "gemini" },
                { role: "Syntax Review", name: "Qwen 3.5", logoKey: "qwen" },
            ],
        },
        {
            id: "standard",
            planId: "starter",
            planName: "Starter Plan",
            title: "The Standard Duo",
            tag: "Standard Code Lane",
            description: "Reliable day-to-day development with cleaner React/Next.js structure and stronger debugging.",
            examples: "Next.js pages, state bugs, scripts, small app features",
            workflow: "Claude 4.6 Sonnet structures the solution. DeepSeek V3.2 debugs loops, state, and edge cases.",
            bidding: "No bidding",
            models: [
                { role: "Next.js Expert", name: "Claude 4.6 Sonnet", logoKey: "anthropic" },
                { role: "Debugger", name: "DeepSeek V3.2", logoKey: "deepseek" },
            ],
        },
        {
            id: "advanced",
            planId: "growth",
            planName: "Growth Plan",
            title: "The Advanced Syndicate",
            tag: "Advanced Code Lane",
            description: "Architecture, tool-use, sandbox-aware execution, and logic verification for serious product work.",
            examples: "Backends, integrations, production fixes, repo-level tasks",
            workflow: "GPT-5.4 designs architecture. DeepSeek-R1 verifies logic. GitHub tooling supports repo execution.",
            bidding: "Up to 6 bidding agents",
            models: [
                { role: "Architect", name: "GPT-5.4", logoKey: "chatgpt" },
                { role: "Logic Verify", name: "DeepSeek-R1", logoKey: "deepseek" },
                { role: "Repo Tool", name: "GitHub API Tool", logoKey: "github" },
            ],
        },
        {
            id: "elite",
            planId: "scale",
            planName: "Scale Plan",
            title: "The Elite Pantheon Council",
            tag: "Premium Code Lane",
            description: "World-class engineering lane for large codebases, raw execution, stress testing, and security.",
            examples: "Full-stack apps, Web3 platforms, multi-file refactors, complex systems",
            workflow: "Claude 4.6 Opus reads large codebases, GPT-5.3-Codex executes, Qwen 3.6 stress-runs, and Llama 4 audits security.",
            bidding: "Up to 10 bidding agents",
            models: [
                { role: "Codebase Reader", name: "Claude 4.6 Opus", logoKey: "anthropic" },
                { role: "Executor", name: "GPT-5.3-Codex", logoKey: "chatgpt" },
                { role: "Sandbox", name: "Qwen 3.6", logoKey: "qwen" },
                { role: "Security", name: "Llama 4", logoKey: "llama" },
            ],
        },
    ],
    media: [
        {
            id: "flash",
            planId: "free",
            planName: "Free Plan",
            title: "Flash Media Cutter",
            tag: "Basic Media Lane",
            description: "Simple audio transcription and FFmpeg cut-script generation for small media jobs.",
            examples: "Simple cuts, short clips, basic audio transcript tasks",
            workflow: "Gemini 3 Flash plans cuts and writes basic FFmpeg scripts after transcript context.",
            bidding: "No bidding",
            models: [{ role: "Media Script", name: "Gemini 3 Flash", logoKey: "gemini" }],
        },
        {
            id: "standard",
            planId: "starter",
            planName: "Starter Plan",
            title: "Caption Studio",
            tag: "Standard Media Lane",
            description: "Captioning, jump-cut planning, color-correction scripts, and short-form edit instructions.",
            examples: "Auto captions, podcast cuts, social video cleanup",
            workflow: "GPT-4o generates captions and timeline scripts for jump-cuts and color correction.",
            bidding: "No bidding",
            models: [{ role: "Caption + Cuts", name: "GPT-4o", logoKey: "chatgpt" }],
        },
        {
            id: "advanced",
            planId: "growth",
            planName: "Growth Plan",
            title: "Video Vision Syndicate",
            tag: "Advanced Media Lane",
            description: "Video-vision routing for highlight detection, story logic, and heavier timeline analysis.",
            examples: "YouTube highlights, timeline logic, advanced clips",
            workflow: "Gemini 3 Pro watches video context. Claude 4.6 Sonnet writes complex timeline logic.",
            bidding: "Up to 6 bidding agents",
            models: [
                { role: "Video Vision", name: "Gemini 3 Pro", logoKey: "gemini" },
                { role: "Timeline Logic", name: "Claude 4.6 Sonnet", logoKey: "anthropic" },
            ],
        },
        {
            id: "elite",
            planId: "scale",
            planName: "Scale Plan",
            title: "Director Council",
            tag: "Premium Media Lane",
            description: "High-cost GPU-aware lane for semantic video search, generated B-roll, and render-heavy work.",
            examples: "VFX, long video review, B-roll generation, cloud rendering",
            workflow: "Claude 4.6 Opus directs story, TwelveLabs searches video semantics, Veo/Sora handles B-roll requests, and Cloud GPU rendering is priced safely.",
            bidding: "Up to 10 bidding agents",
            models: [
                { role: "Director", name: "Claude 4.6 Opus", logoKey: "anthropic" },
                { role: "Video Search", name: "TwelveLabs API", logoKey: "twelvelabs" },
                { role: "B-roll", name: "Veo / Sora API", logoKey: "sora" },
                { role: "Rendering", name: "Cloud GPU", logoKey: "cloudGpu" },
            ],
        },
    ],
    writing: [
        {
            id: "flash",
            planId: "free",
            planName: "Free Plan",
            title: "Llama Draft Desk",
            tag: "Basic Writing Lane",
            description: "Fast basic structure for simple copy, short posts, and lightweight writing tasks.",
            examples: "Short articles, emails, captions, basic rewrites",
            workflow: "Llama 4 8B creates a quick structure and clean first draft.",
            bidding: "No bidding",
            models: [{ role: "Draft Writer", name: "Llama 4 8B", logoKey: "llama" }],
        },
        {
            id: "standard",
            planId: "starter",
            planName: "Starter Plan",
            title: "SEO Research Duo",
            tag: "Standard Writing Lane",
            description: "Fast writing plus research-grounded SEO/RAG support for practical business content.",
            examples: "SEO posts, product copy, research summaries",
            workflow: "Claude 4.6 Haiku writes quickly. Command R+ supports RAG, research, and SEO structure.",
            bidding: "No bidding",
            models: [
                { role: "Fast Writer", name: "Claude 4.6 Haiku", logoKey: "anthropic" },
                { role: "SEO / RAG", name: "Command R+", logoKey: "command" },
            ],
        },
        {
            id: "advanced",
            planId: "growth",
            planName: "Growth Plan",
            title: "Brand Voice Syndicate",
            tag: "Advanced Writing Lane",
            description: "Brand-voice alignment and multi-platform formatting for active business publishing.",
            examples: "LinkedIn, X, blogs, campaign copy, pitch content",
            workflow: "GPT-5.4 aligns with brand voice. Claude 4.6 Sonnet formats for each platform.",
            bidding: "Up to 6 bidding agents",
            models: [
                { role: "Brand Voice", name: "GPT-5.4", logoKey: "chatgpt" },
                { role: "Format Editor", name: "Claude 4.6 Sonnet", logoKey: "anthropic" },
            ],
        },
        {
            id: "elite",
            planId: "scale",
            planName: "Scale Plan",
            title: "Whitepaper Council",
            tag: "Premium Writing Lane",
            description: "Deep technical writing, fact-checking, and real-time market-data support.",
            examples: "Whitepapers, investor decks, market research, technical docs",
            workflow: "Claude 4.6 Opus writes elite long-form content, DeepSeek-R1 fact-checks claims, and Perplexity API pulls live market context.",
            bidding: "Up to 10 bidding agents",
            models: [
                { role: "Lead Writer", name: "Claude 4.6 Opus", logoKey: "anthropic" },
                { role: "Fact Check", name: "DeepSeek-R1", logoKey: "deepseek" },
                { role: "Live Research", name: "Perplexity API", logoKey: "perplexity" },
            ],
        },
    ],
    design: [
        {
            id: "flash",
            planId: "free",
            planName: "Free Plan",
            title: "Basic Image Forge",
            tag: "Basic Design Lane",
            description: "Low-cost image/icon generation for simple visual assets.",
            examples: "Basic icons, simple raster images, rough concepts",
            workflow: "Stable Diffusion 3.5 generates lightweight raster images and icon concepts.",
            bidding: "No bidding",
            models: [{ role: "Raster Generate", name: "Stable Diffusion 3.5", logoKey: "stableDiffusion" }],
        },
        {
            id: "standard",
            planId: "starter",
            planName: "Starter Plan",
            title: "Asset Studio",
            tag: "Standard Design Lane",
            description: "High-quality asset generation plus palette and reference-image analysis.",
            examples: "Brand assets, thumbnails, palettes, social graphics",
            workflow: "Flux.1 creates stronger assets. GPT-4o Vision analyzes palettes and visual references.",
            bidding: "No bidding",
            models: [
                { role: "Asset Generate", name: "Flux.1", logoKey: "flux" },
                { role: "Vision Review", name: "GPT-4o Vision", logoKey: "chatgpt" },
            ],
        },
        {
            id: "advanced",
            planId: "growth",
            planName: "Growth Plan",
            title: "Aesthetic-to-Code Syndicate",
            tag: "Advanced Design Lane",
            description: "Premium visual generation translated into exact SVG, Tailwind, and UI implementation.",
            examples: "Landing pages, brand systems, SVGs, polished UI sections",
            workflow: "Midjourney API drives aesthetic direction. Claude 4.6 Sonnet turns visuals into Tailwind CSS and SVG code.",
            bidding: "Up to 6 bidding agents",
            models: [
                { role: "Aesthetic", name: "Midjourney API", logoKey: "midjourney" },
                { role: "UI Code", name: "Claude 4.6 Sonnet", logoKey: "anthropic" },
            ],
        },
        {
            id: "elite",
            planId: "scale",
            planName: "Scale Plan",
            title: "Product Design Council",
            tag: "Premium Design Lane",
            description: "Vision-heavy UI generation and Figma-style layout production for complex design systems.",
            examples: "UI kits, app screens, design systems, pixel-perfect rebuilds",
            workflow: "Gemini 3 Pro Vision analyzes sketches, Midjourney API generates aesthetic assets, and a Figma-Agent produces modern layout code.",
            bidding: "Up to 10 bidding agents",
            models: [
                { role: "Sketch Vision", name: "Gemini 3 Pro Vision", logoKey: "gemini" },
                { role: "Aesthetic", name: "Midjourney API", logoKey: "midjourney" },
                { role: "Layout Agent", name: "Figma-Agent", logoKey: "figma" },
            ],
        },
    ],
    automation: [
        {
            id: "flash",
            planId: "free",
            planName: "Free Plan",
            title: "CSV Flash Cleaner",
            tag: "Basic Automation Lane",
            description: "Basic CSV cleaning, regex formatting, and lightweight data cleanup.",
            examples: "CSV cleanup, simple regex, basic data formatting",
            workflow: "Gemini 3 Flash cleans data and writes simple regex or formatting scripts.",
            bidding: "No bidding",
            models: [{ role: "Data Clean", name: "Gemini 3 Flash", logoKey: "gemini" }],
        },
        {
            id: "standard",
            planId: "starter",
            planName: "Starter Plan",
            title: "Scraper Duo",
            tag: "Standard Automation Lane",
            description: "Standard scraping and browser automation scripts for everyday lead/data tasks.",
            examples: "Puppeteer scripts, simple scrapers, lead cleanup",
            workflow: "GPT-4o writes Puppeteer scraping scripts and standard automation code.",
            bidding: "No bidding",
            models: [{ role: "Scraper", name: "GPT-4o", logoKey: "chatgpt" }],
        },
        {
            id: "advanced",
            planId: "growth",
            planName: "Growth Plan",
            title: "Automation Syndicate",
            tag: "Advanced Automation Lane",
            description: "n8n, Zapier, webhook, API, and external-tool orchestration for active teams.",
            examples: "n8n flows, API workflows, webhook logic, lead gen",
            workflow: "Claude 4.6 Sonnet designs the flow. GLM-5.1 specializes in external tools and APIs.",
            bidding: "Up to 6 bidding agents",
            models: [
                { role: "Flow Architect", name: "Claude 4.6 Sonnet", logoKey: "anthropic" },
                { role: "Tool Caller", name: "GLM-5.1", logoKey: "glm" },
            ],
        },
        {
            id: "elite",
            planId: "scale",
            planName: "Scale Plan",
            title: "Enterprise Pipeline Council",
            tag: "Premium Automation Lane",
            description: "Enterprise-grade data pipelines, webhook infrastructure, loop prevention, and leakage checks.",
            examples: "Massive data pipelines, custom webhooks, enterprise automation",
            workflow: "Claude 4.6 Opus designs the pipeline, GPT-5.4 writes webhook infrastructure, and DeepSeek-R1 checks for loops and leaks.",
            bidding: "Up to 10 bidding agents",
            models: [
                { role: "Pipeline Architect", name: "Claude 4.6 Opus", logoKey: "anthropic" },
                { role: "Webhook Infra", name: "GPT-5.4", logoKey: "chatgpt" },
                { role: "Loop Check", name: "DeepSeek-R1", logoKey: "deepseek" },
            ],
        },
    ],
};

const CATEGORY_KEYWORDS: Record<WorkCategoryId, string[]> = {
    development: [
        "code",
        "react",
        "next.js",
        "frontend",
        "backend",
        "app",
        "api",
        "debug",
        "bug",
        "typescript",
        "python",
        "database",
        "solana",
        "web3",
        "smart contract",
        "repo",
        "github",
    ],
    media: [
        "video",
        "vfx",
        "podcast",
        "audio",
        "ffmpeg",
        "caption",
        "subtitle",
        "timeline",
        "youtube",
        "render",
        "b-roll",
        "sora",
        "veo",
        "clip",
    ],
    writing: [
        "blog",
        "article",
        "seo",
        "copy",
        "pitch deck",
        "whitepaper",
        "research",
        "email",
        "story",
        "caption",
        "rewrite",
        "linkedin",
        "x post",
        "market report",
    ],
    design: [
        "logo",
        "ui",
        "ux",
        "figma",
        "brand",
        "branding",
        "thumbnail",
        "banner",
        "svg",
        "icon",
        "mockup",
        "palette",
        "wireframe",
        "landing page design",
    ],
    automation: [
        "n8n",
        "zapier",
        "webhook",
        "scrape",
        "scraper",
        "scraping",
        "proxy",
        "proxy rotation",
        "browser automation",
        "lead gen",
        "lead generation",
        "csv",
        "json",
        "etl",
        "pipeline",
        "workflow",
        "orchestration",
        "auto-posting",
        "auto posting",
        "schedule",
        "scheduler",
        "distribution",
        "buffer",
        "metricool",
        "heygen",
        "remotion",
        "json2video",
        "whisper",
        "transcribe",
        "ingest",
        "export",
        "llm",
        "lip-sync",
        "avatar",
        "integration",
        "integrations",
        "automation",
        "puppeteer",
        "airtable",
        "crm",
    ],
};

export function normalizePlanId(planId: string | null | undefined): PlanId {
    return planId === "starter" || planId === "growth" || planId === "scale" ? planId : "free";
}

export function canUseModelLane(planId: string, lane: ModelLaneId) {
    const normalizedPlan = normalizePlanId(planId);
    return PLAN_RANK[normalizedPlan] >= LANE_RANK[lane];
}

export function detectWorkCategory(input: WorkCategoryInput): WorkCategoryId {
    const assetTypes = input.assetTypes ?? [];
    const assetLinks = input.assetLinks ?? [];
    const text = [
        input.title ?? "",
        input.description ?? "",
        assetTypes.join(" "),
        assetLinks.join(" "),
    ]
        .join(" ")
        .toLowerCase();

    const automationOrchestrationMatches = [
        /\b(auto(?:mated)?|automation|workflow|pipeline|orchestration|scheduler?|auto[- ]?posting|distribution)\b/.test(text),
        /\b(api|webhook|integrat(?:e|ion|ions)|buffer|metricool|heygen|remotion|json2video|whisper|zapier|n8n)\b/.test(text),
        /\b(ingest|transcribe|rewrite|send|export|schedule|post|connect|trigger)\b/.test(text),
    ].filter(Boolean).length;

    const pureMediaExecution =
        /\b(edit|cut|caption|subtitle|color correction|vfx|b-roll|render|timeline)\b/.test(text) &&
        !/\b(api|webhook|workflow|pipeline|automation|integrat(?:e|ion|ions)|schedule|auto[- ]?posting)\b/.test(text);

    if (automationOrchestrationMatches >= 2 && !pureMediaExecution) {
        return "automation";
    }

    const scores: Record<WorkCategoryId, number> = {
        development: 0,
        media: 0,
        writing: 0,
        design: 0,
        automation: 0,
    };

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS) as Array<[WorkCategoryId, string[]]>) {
        for (const keyword of keywords) {
            if (text.includes(keyword)) {
                scores[category] += keyword.length > 5 ? 2 : 1;
            }
        }
    }

    if (assetTypes.some((type) => type.startsWith("video/") || type.startsWith("audio/"))) {
        scores.media += 6;
    }
    if (assetTypes.some((type) => type.startsWith("image/"))) {
        scores.design += 3;
    }
    if (assetTypes.some((type) => type.includes("csv") || type.includes("json") || type.includes("spreadsheet"))) {
        scores.automation += 4;
    }
    if (/\b(scraper|scrape|proxy|proxy rotation|puppeteer|browser automation)\b/.test(text)) {
        scores.automation += 6;
    }
    if (automationOrchestrationMatches >= 2) {
        scores.automation += 8;
    }
    if ((input.assetTotalMb ?? 0) > 250) {
        scores.media += 2;
    }

    return (Object.entries(scores) as Array<[WorkCategoryId, number]>).sort((left, right) => right[1] - left[1])[0][0];
}

export function getModelGroupsForCategory(category: WorkCategoryId) {
    return MODEL_GROUPS_BY_WORK_TYPE[category] ?? MODEL_GROUPS_BY_WORK_TYPE.development;
}

export function getModelGroupForPlan(category: WorkCategoryId, planId: string) {
    const lane = PLAN_TO_LANE[normalizePlanId(planId)];
    return getModelGroupsForCategory(category).find((group) => group.id === lane) ?? getModelGroupsForCategory(category)[0];
}
