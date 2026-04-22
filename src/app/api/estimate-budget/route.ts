import { NextResponse } from "next/server";
import { detectWorkCategory, normalizePlanId, type PlanId, type WorkCategoryId } from "@/lib/modelGroups";

const PRODUCTION_API_BASE = "https://pantheon-api-mlqrumx6cq-uc.a.run.app";
const DEEPSEEK_PRICING_MODEL = "deepseek-reasoner"; // R1 — best paid model for fair pricing
const DEEPSEEK_PRICING_FALLBACK = "deepseek-chat"; // V3 — fast fallback
const GLOBAL_MINIMUM_BUDGET_USD = 1;
const MINIMUM_MARGIN_MULTIPLIER = 2.8;
const BASE_PLATFORM_OVERHEAD_USD = 0.85;
const MAX_AI_PRICE_RATIO = 0.1;
const MARKET_SEARCH_MAX_RESULTS = 6;
const MARKET_SEARCH_TIMEOUT_MS = 8000;

const PLAN_PRICE_RATIO: Record<string, number> = {
    free: 0.16,
    starter: 0.14,
    growth: 0.12,
    scale: 0.1,
};

const PLAN_BID_AGENT_LIMIT: Record<PlanId, number> = {
    free: 0,
    starter: 0,
    growth: 6,
    scale: 10,
};

const MODEL_GROUP_COST_FLOORS: Record<WorkCategoryId, Record<PlanId, { base: number; marketFloor: number }>> = {
    development: {
        free: { base: 0.18, marketFloor: 18 },
        starter: { base: 0.75, marketFloor: 45 },
        growth: { base: 2.2, marketFloor: 120 },
        scale: { base: 5.5, marketFloor: 240 },
    },
    media: {
        free: { base: 0.75, marketFloor: 30 },
        starter: { base: 2.5, marketFloor: 90 },
        growth: { base: 7.5, marketFloor: 220 },
        scale: { base: 18, marketFloor: 450 },
    },
    writing: {
        free: { base: 0.05, marketFloor: 10 },
        starter: { base: 0.25, marketFloor: 25 },
        growth: { base: 0.8, marketFloor: 60 },
        scale: { base: 2.2, marketFloor: 180 },
    },
    design: {
        free: { base: 0.4, marketFloor: 25 },
        starter: { base: 1.5, marketFloor: 75 },
        growth: { base: 4.5, marketFloor: 180 },
        scale: { base: 10, marketFloor: 350 },
    },
    automation: {
        free: { base: 0.25, marketFloor: 30 },
        starter: { base: 0.95, marketFloor: 80 },
        growth: { base: 2.8, marketFloor: 180 },
        scale: { base: 6.2, marketFloor: 360 },
    },
};

const SIMPLE_WRITING_KEYWORDS = [
    "story",
    "email",
    "letter",
    "caption",
    "paragraph",
    "summary",
    "bio",
    "description",
    "rewrite",
    "copy",
];

const LONG_FORM_KEYWORDS = [
    "full book",
    "novel",
    "screenplay",
    "movie",
    "film",
    "bollywood",
    "chapter",
    "chapters",
    "series",
    "landing page",
    "website",
    "frontend",
    "backend",
    "dashboard",
    "automation",
    "integration",
    "high end",
    "premium",
    "production",
];

type RawEstimate = {
    human_market_cost_usd?: number;
    minimum_client_budget_usd?: number;
    min_budget_usd?: number;
    estimated_api_cost_usd?: number;
    api_cost_usd?: number;
    reason?: string;
    market_breakdown?: MarketBreakdownRow[];
};

type MarketBreakdownRow = {
    source: string;
    estimated_cost: string;
    delivery_time: string;
    quality: string;
};



function buildPricingDescription(body: Record<string, unknown>, description: string) {
    const details = [description.trim()];
    const timeline = typeof body.timeline === "string" ? body.timeline : "";
    const modelLane = typeof body.model_lane === "string" ? body.model_lane : "";
    const modelGroup = typeof body.model_group === "string" ? body.model_group : "";
    const workCategory = typeof body.work_category === "string" ? body.work_category : "";
    const complexityScore = numberFrom(body.complexity_score, 0);
    const complexityReasons = getStringArray(body.complexity_reasons);
    const assetTotalMb = numberFrom(body.asset_total_mb, 0);
    const assetCount = numberFrom(body.asset_count, 0);
    const assetSource = typeof body.asset_source === "string" ? body.asset_source : "uploaded-or-prompt";
    const assetTypes = Array.isArray(body.asset_types)
        ? body.asset_types.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        : [];
    const assetLinks = Array.isArray(body.asset_links)
        ? body.asset_links.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        : [];
    const assetTextPreview = typeof body.asset_text_preview === "string" ? body.asset_text_preview.trim() : "";
    const rush = Boolean(body.rush);

    if (timeline) {
        details.push(`Timeline constraint: ${timeline}.`);
    }
    if (rush) {
        details.push("Rush delivery requested under 1 hour.");
    }
    if (modelLane || modelGroup) {
        details.push(`Selected model routing: ${modelGroup || modelLane}.`);
    }
    if (workCategory) {
        details.push(`Detected work category: ${workCategory}.`);
    }
    if (complexityScore > 0 || complexityReasons.length > 0) {
        details.push(`Complexity score: ${complexityScore.toFixed(2)}. Complexity signals: ${complexityReasons.join(", ") || "none"}.`);
    }
    if (assetCount || assetTotalMb || assetTypes.length > 0) {
        details.push(
            `Raw assets: ${assetCount} files, asset total size: ${assetTotalMb.toFixed(2)} MB, asset types: ${
                assetTypes.join(", ") || "unknown"
            }, source: ${assetSource}.`,
        );
    }
    if (assetLinks.length > 0) {
        details.push(`Asset/reference links provided: ${assetLinks.slice(0, 5).join("; ")}.`);
    }
    if (assetTextPreview) {
        details.push(`Readable asset text preview: ${assetTextPreview.slice(0, 6000)}.`);
    }

    return details.filter(Boolean).join("\n");
}

function extractPriceValues(text: string) {
    return Array.from(text.matchAll(/\$\s*([0-9][0-9,]*(?:\.[0-9]{1,2})?)/g))
        .map((match) => Number(match[1].replace(/,/g, "")))
        .filter((value) => Number.isFinite(value) && value >= 3 && value <= 10000);
}

function compactSearchText(value: string, limit = 220) {
    return value.replace(/\s+/g, " ").trim().slice(0, limit);
}

function normalizeMarketItems(items: Array<{ title?: string; snippet?: string; url?: string }>, source: string) {
    const prices: number[] = [];
    const lines = items.slice(0, MARKET_SEARCH_MAX_RESULTS).flatMap((item) => {
        const title = compactSearchText(item.title || "");
        const snippet = compactSearchText(item.snippet || "");
        const url = compactSearchText(item.url || "", 120);
        prices.push(...extractPriceValues(`${title}. ${snippet}`));
        return title || snippet ? [`- ${title}: ${snippet} (${url})`] : [];
    });

    if (lines.length === 0) {
        return "";
    }

    if (prices.length > 0) {
        const sortedPrices = [...prices].sort((left, right) => left - right);
        const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];
        lines.unshift(`${source} observed market prices include a median visible price around $${medianPrice.toFixed(2)}.`);
    }

    return lines.join("\n");
}

async function fetchWithTimeout(url: string, init: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), MARKET_SEARCH_TIMEOUT_MS);
    try {
        return await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
    } finally {
        clearTimeout(timeout);
    }
}

async function tavilyMarketSearch(query: string) {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
        return "";
    }
    const response = await fetchWithTimeout("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            api_key: apiKey,
            query,
            search_depth: "basic",
            max_results: MARKET_SEARCH_MAX_RESULTS,
            include_answer: false,
        }),
    });
    if (!response.ok) {
        return "";
    }
    const data = await response.json();
    const items = Array.isArray(data.results)
        ? data.results.map((item: any) => ({
              title: String(item.title || ""),
              snippet: String(item.content || ""),
              url: String(item.url || ""),
          }))
        : [];
    return normalizeMarketItems(items, "Live web search");
}

async function serperMarketSearch(query: string) {
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
        return "";
    }
    const response = await fetchWithTimeout("https://google.serper.dev/search", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-KEY": apiKey },
        body: JSON.stringify({ q: query, num: MARKET_SEARCH_MAX_RESULTS }),
    });
    if (!response.ok) {
        return "";
    }
    const data = await response.json();
    const items = Array.isArray(data.organic)
        ? data.organic.map((item: any) => ({
              title: String(item.title || ""),
              snippet: String(item.snippet || ""),
              url: String(item.link || ""),
          }))
        : [];
    return normalizeMarketItems(items, "Live web search");
}

async function braveMarketSearch(query: string) {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) {
        return "";
    }
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${MARKET_SEARCH_MAX_RESULTS}`;
    const response = await fetchWithTimeout(url, {
        headers: { Accept: "application/json", "X-Subscription-Token": apiKey },
    });
    if (!response.ok) {
        return "";
    }
    const data = await response.json();
    const results = data.web?.results;
    const items = Array.isArray(results)
        ? results.map((item: any) => ({
              title: String(item.title || ""),
              snippet: String(item.description || ""),
              url: String(item.url || ""),
          }))
        : [];
    return normalizeMarketItems(items, "Live web search");
}

async function buildMarketResearchContext(title: string, description: string) {
    const query = `Fiverr Upwork freelancer price ${title} ${compactSearchText(description, 120)} cost USD`;
    for (const provider of [tavilyMarketSearch, serperMarketSearch, braveMarketSearch]) {
        try {
            const context = await provider(query);
            if (context) {
                return context;
            }
        } catch (error) {
            console.warn("Market search provider failed:", error);
        }
    }
    return "";
}

function formatMarketRange(low: number, high: number) {
    const lowValue = Math.max(1, Math.round(low / 5) * 5);
    const highValue = Math.max(lowValue + 5, Math.round(high / 5) * 5);
    return `$${lowValue.toFixed(0)} - $${highValue.toFixed(0)}`;
}

function buildEmergencyFallbackBreakdown(humanMarketCost: number): MarketBreakdownRow[] {
    // Only used when DeepSeek fails to return market_breakdown.
    // These are generic placeholders — the real rows come from DeepSeek.
    return [
        {
            source: "Budget freelancers",
            estimated_cost: formatMarketRange(humanMarketCost * 0.35, humanMarketCost * 0.9),
            delivery_time: "2-4 days",
            quality: "Basic delivery; quality varies.",
        },
        {
            source: "Mid-range freelancers",
            estimated_cost: formatMarketRange(humanMarketCost, humanMarketCost * 1.8),
            delivery_time: "3-7 days",
            quality: "Custom implementation with communication and revisions.",
        },
        {
            source: "Agency / specialist",
            estimated_cost: `$${Math.max(400, Math.round(humanMarketCost * 2 / 25) * 25).toFixed(0)}+`,
            delivery_time: "1 week+",
            quality: "Full-service delivery with QA and project management.",
        },
    ];
}

function normalizeMarketBreakdown(
    aiRows: unknown,
    title: string,
    description: string,
    humanMarketCost: number,
    marketContext = "",
) {
    // Prefer AI-generated rows from DeepSeek
    if (Array.isArray(aiRows) && aiRows.length >= 2) {
        const valid = aiRows.filter(
            (row: any) => row && typeof row.source === "string" && typeof row.estimated_cost === "string",
        ) as MarketBreakdownRow[];
        if (valid.length >= 2) {
            return valid.map((row) => ({
                source: String(row.source || "").trim(),
                estimated_cost: String(row.estimated_cost || "").trim(),
                delivery_time: String(row.delivery_time || "").trim(),
                quality: String(row.quality || "").trim(),
            }));
        }
    }
    // Emergency fallback only — all real rows should come from DeepSeek
    return buildEmergencyFallbackBreakdown(humanMarketCost);
}

function getApiBase() {
    const configured = process.env.NEXT_PUBLIC_API_URL;
    if (configured && !configured.includes("localhost")) {
        return configured.replace(/\/$/, "");
    }
    return PRODUCTION_API_BASE;
}

function roundBudget(value: number) {
    return Math.round(Math.max(GLOBAL_MINIMUM_BUDGET_USD, value) * 100) / 100;
}

function roundDisplay(value: number) {
    return Math.round(Math.max(0, value) * 100) / 100;
}

function numberFrom(value: unknown, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}

function getStringArray(value: unknown) {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        : [];
}

function getWorkCategory(body: Record<string, unknown>, title: string, description: string): WorkCategoryId {
    const category = typeof body.work_category === "string" ? body.work_category : "";
    if (category === "development" || category === "media" || category === "writing" || category === "design" || category === "automation") {
        return category;
    }
    return detectWorkCategory({
        title,
        description,
        assetTypes: getStringArray(body.asset_types),
        assetLinks: getStringArray(body.asset_links),
        assetTotalMb: numberFrom(body.asset_total_mb, 0),
    });
}

function hasHeavyGpuSignals(text: string, assetTypes: string[], assetTotalMb: number) {
    return (
        assetTypes.some((type) => type.startsWith("video/") || type.startsWith("audio/")) ||
        /\b(video|vfx|render|ffmpeg|timeline|youtube|podcast|b-roll|sora|veo|gpu|4k|8k)\b/.test(text) ||
        assetTotalMb > 250
    );
}

function estimateProtectedInternalCost(body: Record<string, unknown>, title: string, description: string, planId: PlanId) {
    const category = getWorkCategory(body, title, description);
    const assetTypes = getStringArray(body.asset_types);
    const assetLinks = getStringArray(body.asset_links);
    const assetTotalMb = numberFrom(body.asset_total_mb, 0);
    const assetCount = numberFrom(body.asset_count, 0);
    const complexityScore = Math.max(0, numberFrom(body.complexity_score, 0));
    const complexityReasons = getStringArray(body.complexity_reasons);
    const assetTextPreview = typeof body.asset_text_preview === "string" ? body.asset_text_preview : "";
    const combined = `${title} ${description} ${assetTypes.join(" ")} ${assetLinks.join(" ")} ${complexityReasons.join(" ")}`.toLowerCase();
    const costFloor = MODEL_GROUP_COST_FLOORS[category][planId];
    let internalCost = costFloor.base;
    const marketLift: Record<WorkCategoryId, number> = {
        development: 35,
        media: 45,
        writing: 8,
        design: 28,
        automation: 40,
    };

    internalCost += Math.min(assetTextPreview.length / 12000, 1.5);
    internalCost += Math.min(assetLinks.length * 0.12, 1.2);
    internalCost += Math.min(assetCount * 0.08, 2.4);
    internalCost += Math.min(complexityScore * 0.75, 7.5);

    if (category === "media") {
        internalCost += Math.min(assetTotalMb * 0.035, 45);
        if (assetTotalMb > 100) internalCost += 6;
        if (assetTotalMb > 500) internalCost += 12;
        if (assetTotalMb > 1000) internalCost += 28;
        if (hasHeavyGpuSignals(combined, assetTypes, assetTotalMb)) internalCost += planId === "scale" ? 18 : 7;
        if (/\b(b-roll|sora|veo|generate video|missing footage)\b/.test(combined)) internalCost += planId === "scale" ? 35 : 14;
    } else if (category === "design") {
        internalCost += Math.min(assetTotalMb * 0.018, 8);
        if (assetTypes.some((type) => type.startsWith("image/"))) internalCost += 0.8;
        if (/\b(midjourney|figma|pixel perfect|design system|brand kit)\b/.test(combined)) internalCost += planId === "scale" ? 8 : 3;
    } else if (category === "development" || category === "automation") {
        internalCost += Math.min(assetTotalMb * 0.01, 6);
        if (/\b(repo|large codebase|multi-file|full-stack|database|webhook|pipeline|scraping|scraper|proxy|proxy rotation|puppeteer)\b/.test(combined)) {
            internalCost += planId === "scale" ? 5 : 2;
        }
    } else if (category === "writing") {
        if (/\b(whitepaper|market research|fact-check|sources|technical report|pitch deck)\b/.test(combined)) {
            internalCost += planId === "scale" ? 4 : 1.25;
        }
    }

    if (Boolean(body.rush)) {
        internalCost *= 1.45;
    }

    return {
        category,
        internalCost: roundDisplay(internalCost),
        marketFloor: roundDisplay(costFloor.marketFloor + complexityScore * marketLift[category]),
    };
}

function cleanJsonObject(text: string) {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
        return cleaned.slice(start, end + 1);
    }
    return cleaned;
}

function sanitizePublicEstimate(
    data: Record<string, unknown>,
    strategyFallback = "ai-estimate",
    title = "",
    description = "",
    marketContext = "",
) {
    const minBudget = roundBudget(numberFrom(data.min_budget_usd, GLOBAL_MINIMUM_BUDGET_USD));
    const humanMarketCost = roundDisplay(Math.max(numberFrom(data.human_market_cost_usd, 0), minBudget));
    const savingsPercent =
        humanMarketCost > 0
            ? Math.round(Math.max(0, 100 - (minBudget / humanMarketCost) * 100) * 10) / 10
            : 0;

    return {
        min_budget_usd: minBudget,
        estimated_api_cost_usd: roundDisplay(numberFrom(data.estimated_api_cost_usd ?? data.api_cost_usd, 0)),
        human_market_cost_usd: humanMarketCost,
        savings_percent: numberFrom(data.savings_percent, savingsPercent),
        reason:
            typeof data.reason === "string" && data.reason.trim()
                ? data.reason.trim()
                : "Calculated as a low AI project price compared with typical freelancer rates.",
        strategy:
            typeof data.strategy === "string" && data.strategy.trim()
                ? data.strategy.trim()
                : strategyFallback,
        model: typeof data.model === "string" ? data.model : undefined,
        market_breakdown: normalizeMarketBreakdown(data.market_breakdown, title, description, humanMarketCost, marketContext),
        market_context_available:
            typeof data.market_context_available === "boolean"
                ? data.market_context_available
                : Boolean(marketContext.trim()),
        plan: data.plan,
        usage: data.usage,
    };
}

function normalizeEstimatesForScope(
    title: string,
    description: string,
    humanMarketCost: number,
    estimatedInternalCost: number,
    body: Record<string, unknown> = {},
) {
    const rawDescription = typeof body.description === "string" ? body.description : description;
    const combined = `${title} ${rawDescription}`.toLowerCase();
    const wordCount = combined.split(/\s+/).filter(Boolean).length;
    const category = getWorkCategory(body, title, rawDescription);
    const assetTypes = getStringArray(body.asset_types).map((type) => type.toLowerCase());
    const assetTotalMb = numberFrom(body.asset_total_mb, 0);
    const assetCount = numberFrom(body.asset_count, 0);
    const hasUploadedFiles = body.asset_source === "uploaded-files" || assetCount > 0 || assetTotalMb > 0;
    const hasDetailedUploadedAssets =
        hasUploadedFiles &&
        (assetTotalMb > 5 ||
            assetCount > 2 ||
            assetTypes.some((type) => /video|audio|pdf|zip|figma|photoshop|illustrator|sketch/.test(type)));
    const hasReferenceLinks = getStringArray(body.asset_links).length > 0;
    const isSimpleWriting = SIMPLE_WRITING_KEYWORDS.some((keyword) => combined.includes(keyword));
    const isLongForm = LONG_FORM_KEYWORDS.some((keyword) => combined.includes(keyword));
    const isSimpleDesignRequest =
        category === "design" &&
        /\b(logo|icon|thumbnail|banner|brand mark|wordmark)\b/.test(combined) &&
        wordCount <= 24 &&
        !hasDetailedUploadedAssets &&
        !hasReferenceLinks &&
        !/\b(full brand|brand identity|brand kit|style guide|multiple|animation|animated|3d|vector pack|mockup|website|app)\b/.test(combined);
    const isSimpleAutomationRequest =
        category === "automation" &&
        wordCount <= 28 &&
        !hasDetailedUploadedAssets &&
        !hasReferenceLinks &&
        !/\b(proxy|database|dashboard|frontend|backend|login|auth|scale|production|multi|thousand|million)\b/.test(combined);

    if (isSimpleWriting && !isLongForm && wordCount <= 35) {
        return {
            humanMarketCost: Math.min(Math.max(humanMarketCost, 18), 35),
            estimatedInternalCost: Math.min(Math.max(estimatedInternalCost, 0.08), 0.45),
        };
    }

    if (isSimpleWriting && !isLongForm && wordCount <= 80) {
        return {
            humanMarketCost: Math.min(Math.max(humanMarketCost, 28), 70),
            estimatedInternalCost: Math.min(Math.max(estimatedInternalCost, 0.12), 0.9),
        };
    }

    if (isSimpleDesignRequest) {
        return {
            humanMarketCost: Math.min(Math.max(humanMarketCost, 50), 150),
            estimatedInternalCost: Math.min(Math.max(estimatedInternalCost, 0.25), 1.25),
        };
    }

    if (isSimpleAutomationRequest) {
        return {
            humanMarketCost: Math.min(Math.max(humanMarketCost, 60), 180),
            estimatedInternalCost: Math.min(Math.max(estimatedInternalCost, 0.35), 1.8),
        };
    }

    return { humanMarketCost, estimatedInternalCost };
}

function guardLocalEstimate(
    parsed: RawEstimate,
    title: string,
    description: string,
    planId: string,
    strategy: string,
    model: string,
    marketContext = "",
    body: Record<string, unknown> = {},
    extra: Record<string, unknown> = {},
) {
    const normalizedPlan = normalizePlanId(planId);
    const protectedCost = estimateProtectedInternalCost(body, title, description, normalizedPlan);
    const suggestedMinimum = numberFrom(
        parsed.minimum_client_budget_usd ?? parsed.min_budget_usd,
        GLOBAL_MINIMUM_BUDGET_USD,
    );
    let estimatedInternalCost = Math.max(
        0.01,
        numberFrom(parsed.estimated_api_cost_usd ?? parsed.api_cost_usd, 0.35),
        protectedCost.internalCost,
    );
    let humanMarketCost = Math.max(
        numberFrom(parsed.human_market_cost_usd, suggestedMinimum * 4),
        protectedCost.marketFloor,
        estimatedInternalCost * 8,
        5,
    );

    const normalized = normalizeEstimatesForScope(title, description, humanMarketCost, estimatedInternalCost, body);
    humanMarketCost = normalized.humanMarketCost;
    estimatedInternalCost = normalized.estimatedInternalCost;

    const ratio = PLAN_PRICE_RATIO[normalizedPlan] ?? PLAN_PRICE_RATIO.free;
    const biddingEnabled = Boolean(body.bidding_enabled);
    const bidAgentLimit = PLAN_BID_AGENT_LIMIT[normalizedPlan];
    const biddingReserve = biddingEnabled && bidAgentLimit > 0 ? estimatedInternalCost * Math.min(1.8, bidAgentLimit * 0.18) : 0;
    const marginFloor = estimatedInternalCost * MINIMUM_MARGIN_MULTIPLIER;
    const platformFloor = estimatedInternalCost + Math.max(BASE_PLATFORM_OVERHEAD_USD, humanMarketCost * 0.015);
    const biddingNoLossFloor = (estimatedInternalCost + biddingReserve) * MINIMUM_MARGIN_MULTIPLIER + BASE_PLATFORM_OVERHEAD_USD;
    
    // DeepSeek handles the 10-15% logic natively now. We only apply a hard ceiling (max 15%) to prevent AI math hallucinations.
    const maxClientPrice = Math.max(humanMarketCost * 0.15 + estimatedInternalCost, platformFloor);
    
    const minBudget = roundBudget(
        Math.max(marginFloor, platformFloor, biddingNoLossFloor, Math.min(suggestedMinimum, maxClientPrice)),
    );
    const savingsPercent = Math.round(Math.max(0, 100 - (minBudget / humanMarketCost) * 100) * 10) / 10;

    return {
        min_budget_usd: minBudget,
        estimated_api_cost_usd: roundDisplay(estimatedInternalCost),
        human_market_cost_usd: roundDisplay(humanMarketCost),
        savings_percent: savingsPercent,
        reason: parsed.reason?.trim() || "Calculated as a low AI project price compared with typical freelancer rates.",
        strategy,
        model,
        market_breakdown: normalizeMarketBreakdown(parsed.market_breakdown ?? extra.market_breakdown, title, description, humanMarketCost, marketContext),
        market_context_available:
            typeof extra.market_context_available === "boolean"
                ? extra.market_context_available
                : Boolean(marketContext.trim()),
        work_category: protectedCost.category,
        plan: extra.plan,
        usage: extra.usage,
        delivery_target: extra.delivery_target,
        bidding_lane: extra.bidding_lane,
        bid_agent_limit: extra.bid_agent_limit,
    };
}

async function fetchFromDeepSeek(systemPrompt: string, userPrompt: string, apiKey: string) {
    // Try the best model first (R1 reasoner), fall back to V3 chat
    const models = [DEEPSEEK_PRICING_MODEL, DEEPSEEK_PRICING_FALLBACK];
    let lastError: Error | null = null;

    for (const model of models) {
        try {
            const isReasoner = model === "deepseek-reasoner";
            const payload: Record<string, unknown> = {
                model,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                response_format: { type: "json_object" },
                max_tokens: isReasoner ? 1024 : 512,
            };
            // Reasoner doesn't support temperature
            if (!isReasoner) {
                payload.temperature = 0.12;
            }

            const response = await fetch("https://api.deepseek.com/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errText = await response.text();
                console.warn(`DeepSeek ${model} returned ${response.status}: ${errText}`);
                lastError = new Error(`DeepSeek ${model}: ${response.status}`);
                continue;
            }

            const result = await response.json();
            const content = result.choices?.[0]?.message?.content as string;
            if (!content) {
                lastError = new Error(`DeepSeek ${model}: empty response`);
                continue;
            }

            return { content, model };
        } catch (err) {
            lastError = err instanceof Error ? err : new Error(String(err));
            console.warn(`DeepSeek ${model} failed:`, lastError.message);
        }
    }

    throw lastError || new Error("All DeepSeek models failed");
}

/* ─────────────────────────────────────────────────────────────────────────────
   MARKET INTELLIGENCE SCOUTS
   OpenRouter and Groq are NOT pricing decision-makers.
   They are fast, cheap market-data scouts that gather additional real-time
   pricing intelligence BEFORE DeepSeek makes the final call.
   ───────────────────────────────────────────────────────────────────────────── */

const MARKET_SCOUT_PROMPT = `You are a freelancer marketplace price researcher.
Given a job description, estimate what a human freelancer would charge on Fiverr, Upwork, and Toptal.
Use the exact scope in the prompt. Short, vague, no-asset jobs must use low Fiverr/Upwork ranges; do not price them like enterprise packages.
Return ONLY a JSON object with these fields:
{
  "fiverr_low_usd": number,
  "fiverr_high_usd": number,
  "upwork_mid_usd": number,
  "agency_usd": number,
  "reasoning": "one sentence explaining your estimate"
}
Do NOT output anything except the JSON object.`;

async function scoutMarketIntelGroq(title: string, description: string, apiKey: string) {
    try {
        const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: MARKET_SCOUT_PROMPT },
                    { role: "user", content: `Job: ${title}\nDetails: ${compactSearchText(description, 800)}` },
                ],
                response_format: { type: "json_object" },
                temperature: 0.2,
                max_tokens: 200,
            }),
        });

        if (!response.ok) return "";
        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || "";
        return `Groq market scout (${model}): ${content}`;
    } catch {
        return "";
    }
}

async function scoutMarketIntelOpenRouter(title: string, description: string, apiKey: string) {
    try {
        const model = process.env.OPENROUTER_BUDGET_MODEL || "deepseek/deepseek-chat-v3-0324";
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://pantheon-mesh.app",
                "X-Title": "Pantheon Mesh Market Scout",
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: MARKET_SCOUT_PROMPT },
                    { role: "user", content: `Job: ${title}\nDetails: ${compactSearchText(description, 800)}` },
                ],
                response_format: { type: "json_object" },
                temperature: 0.15,
                max_tokens: 200,
            }),
        });

        if (!response.ok) return "";
        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || "";
        return `OpenRouter market scout (${model}): ${content}`;
    } catch {
        return "";
    }
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN PIPELINE
   Step 1: Gather market intelligence (web search + Groq scout + OpenRouter scout)
   Step 2: Feed ALL intelligence into DeepSeek R1 (the ONLY pricing brain)
   Step 3: Apply guardLocalEstimate safety floor (platform never loses money)
   ───────────────────────────────────────────────────────────────────────────── */

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const title = typeof body?.title === "string" ? body.title.trim() : "";
        const description = typeof body?.description === "string" ? body.description.trim() : "";
        const pricingDescription = buildPricingDescription(body, description);
        const clientUid = typeof body?.client_uid === "string" ? body.client_uid.trim() : "";
        const planId = typeof body?.current_plan_id === "string" ? body.current_plan_id.trim().toLowerCase() : "free";

        if (!title || !description) {
            return NextResponse.json(
                { detail: "Title and description are required." },
                { status: 400 },
            );
        }

        // NOTE: Backend /v1/client/job/estimate-budget is NOT used for pricing.
        // ALL pricing decisions are made exclusively by DeepSeek R1.
        // The backend is only used for job persistence and execution, never for price calculation.

        /* ── Step 1: Gather ALL market intelligence in parallel ── */
        const deepseekKey = process.env.DEEPSEEK_API_KEY;
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_1;

        const [webSearchContext, groqIntel, openRouterIntel] = await Promise.all([
            buildMarketResearchContext(title, pricingDescription),
            groqKey ? scoutMarketIntelGroq(title, pricingDescription, groqKey) : Promise.resolve(""),
            openRouterKey ? scoutMarketIntelOpenRouter(title, pricingDescription, openRouterKey) : Promise.resolve(""),
        ]);

        // Merge all intelligence sources into one context block
        const intelligenceSources = [
            webSearchContext ? `=== LIVE WEB SEARCH (GROUND TRUTH — extract real $ prices) ===\n${webSearchContext}` : "",
            groqIntel ? `=== GROQ MARKET SCOUT ESTIMATE ===\n${groqIntel}` : "",
            openRouterIntel ? `=== OPENROUTER MARKET SCOUT ESTIMATE ===\n${openRouterIntel}` : "",
        ].filter(Boolean).join("\n\n");

        const marketBlock = intelligenceSources
            || "No live market data available. Use your deep knowledge of Fiverr, Upwork, and freelancer marketplace pricing to estimate realistically.";

        /* ── Step 2: DeepSeek R1 — THE ONLY PRICING DECISION-MAKER ── */
        const workCategory = typeof body.work_category === "string" ? body.work_category : "general";
        const modelGroup = typeof body.model_group === "string" ? body.model_group : "";

        const systemPrompt = `You are the Pantheon Mesh Pricing Engine — the SOLE authoritative pricing brain.
You are DeepSeek R1. You make ALL pricing decisions. No other model overrides you.

Your job: calculate the FAIR project minimum price for a business client.
You have been given real-time market intelligence from web searches and scout models below.
Cross-reference ALL sources to determine the most accurate human freelancer market rate.

CRITICAL ASSETS INSTRUCTIONS: 
You must explicitly analyze any "Asset/reference links provided" and "Readable asset text preview" (which contains extracted image data/text descriptions) within the user's Requirements. Use these to determine the actual scope and complexity of the job.

RULES:
1. Classify the job by scope and difficulty from the actual words in the brief and attached assets. Do not inflate vague/simple tasks.
2. Determine human_market_cost_usd:
   - If LIVE WEB SEARCH data exists, treat those prices as PRIMARY GROUND TRUTH.
   - If SCOUT ESTIMATES exist, use them as SECONDARY confirmation.
   - If neither exists, estimate conservatively from your training data.
   - Always average the exact-scope Fiverr budget range and Upwork mid-range first. Use agency/enterprise prices only as a high reference, not as the main anchor, unless the user gave detailed enterprise requirements.
   - Analyze request depth. If the prompt is extremely short (under 20 words), vague, and has no significant uploaded assets or reference links, anchor human_market_cost_usd at the LOWEST freelance end. A small reference image under 5 MB is not a brand-identity package by itself. For example, a one-sentence professional logo request should usually be $50-$150, not $2,000+.
   - Only use $2,000+ human pricing for detailed brand identity systems, multi-step workflows, heavy raw assets, production software, complex automations, or clearly enterprise scope.
3. Calculate the AI Labour Price:
   Apply an 85% to 90% savings discount to the human_market_cost_usd. This heavily discounted amount (the remaining 10% to 15%) is your "AI Labour Price" (which acts as the platform's profit).
4. Estimate estimated_api_cost_usd: 
   Calculate the expected LLM token, compute, and tool api costs required for the AI agents to actually develop/deliver this specific project (Internal only). IMPORTANT: LLM tokens cost micro-cents! Almost all projects cost between $0.05 and $2.50 maximum in compute. Do NOT include the client's 3rd-party SaaS API costs (like Stripe, Twilio) here. This is ONLY the AI platform's internal token burn rate.
5. Calculate minimum_client_budget_usd using this strict formula:
   [minimum_client_budget_usd] = [AI Labour Price] + [estimated_api_cost_usd]
   This ensures the client gets an insane 85-90% discount on labor, while still fully covering the exact API development costs so the platform pays nothing out of pocket.
6. The quote must stay above compute cost + platform margin. Never lose money.
7. Heavy media (video/VFX/GPU/B-roll/files >50MB): apply much higher compute cost.
8. If bidding is enabled, include reserve for agent bidding overhead.
9. Be FAIR. Do not over-charge. Do not under-charge below compute cost.
10. Keep the reason client-friendly. Never mention API cost, margin, or internal math.
11. Generate market_breakdown: an array of 3-4 marketplace comparison rows. Each row must be relevant to the SPECIFIC job type. Examples:
    - For a backend/IoT/API job: compare against "Fiverr gigs", "Upwork specialists", "Dev agency", "Enterprise BaaS (e.g., Supabase / AWS)"
    - For a video/media job: compare against "Fiverr editors", "Upwork video producers", "Production agency", "Cloud render / video API"
    - For a web/UI job: compare against "Fiverr designers", "Upwork React devs", "Design agency", "Premium UI kit (e.g., Tailwind UI)"
    - For an automation/scraping job: compare against "Fiverr automation gigs", "Upwork data engineers", "Agency", "Commercial SaaS (e.g., Apify)"
    Choose REAL marketplace comparators that match the actual job. The 4th row should be a relevant commercial tool/service alternative, NOT a generic "UI kit" for every job.
    Use realistic price ranges based on the market intelligence and your knowledge.

Return ONLY this JSON:
{
  "human_market_cost_usd": number,
  "minimum_client_budget_usd": number,
  "estimated_api_cost_usd": number,
  "reason": "one short client-facing sentence explaining the market comparison",
  "market_breakdown": [
    { "source": "string", "estimated_cost": "$X - $Y", "delivery_time": "string", "quality": "one sentence" },
    { "source": "string", "estimated_cost": "$X - $Y", "delivery_time": "string", "quality": "one sentence" },
    { "source": "string", "estimated_cost": "$X+", "delivery_time": "string", "quality": "one sentence" },
    { "source": "string", "estimated_cost": "$X - $Y/mo", "delivery_time": "string", "quality": "one sentence" }
  ]
}`;

        const userPrompt = `Title: ${title}
Work Category: ${workCategory}
Model Cluster: ${modelGroup}
Plan: ${planId}
Requirements: ${pricingDescription}

MARKET INTELLIGENCE:
${marketBlock}`;

        if (!deepseekKey) {
            // DeepSeek is mandatory — if no key, use protected local estimate as fallback
            console.error("CRITICAL: No DEEPSEEK_API_KEY configured. Using protected local estimate.");
            return NextResponse.json(
                guardLocalEstimate(
                    {} as RawEstimate,
                    title,
                    pricingDescription,
                    planId,
                    "local-protected-estimate",
                    "none",
                    intelligenceSources,
                    body,
                ),
            );
        }

        let rawResponse = "";
        let usedStrategy = "";
        let usedModel = "";

        try {
            const deepSeekResult = await fetchFromDeepSeek(systemPrompt, userPrompt, deepseekKey);
            rawResponse = deepSeekResult.content;
            usedStrategy = deepSeekResult.model === "deepseek-reasoner" ? "deepseek-r1-pricing" : "deepseek-v3-pricing";
            usedModel = deepSeekResult.model;
        } catch (deepSeekError) {
            // DeepSeek failed — do NOT fall back to another model for pricing.
            // Use the protected local estimate (safety floor) instead.
            console.error("DeepSeek pricing failed. Using protected local estimate:", deepSeekError);
            return NextResponse.json(
                guardLocalEstimate(
                    {} as RawEstimate,
                    title,
                    pricingDescription,
                    planId,
                    "local-protected-estimate",
                    "deepseek-unavailable",
                    intelligenceSources,
                    body,
                ),
            );
        }

        /* ── Step 3: Parse DeepSeek's decision + apply structural validation pipeline ── */
        let parsed: RawEstimate = {};
        try {
            parsed = JSON.parse(cleanJsonObject(rawResponse)) as RawEstimate;
            
            // ANTI-HALLUCINATION PIPELINE:
            // 1. Force API cost cap. AI token inference should never exceed $50 for consumer jobs even in extreme cases.
            if (parsed.estimated_api_cost_usd !== undefined) {
                parsed.estimated_api_cost_usd = Math.min(Math.max(0.01, parsed.estimated_api_cost_usd), 45.00);
            }
            if (parsed.api_cost_usd !== undefined) {
                parsed.api_cost_usd = Math.min(Math.max(0.01, parsed.api_cost_usd), 45.00);
            }
            
            // 2. Extract safe numbers as fallbacks
            const safeMarketCost = parsed.human_market_cost_usd ?? 0;
            const safeBudget = parsed.minimum_client_budget_usd ?? parsed.min_budget_usd ?? 0;
            
            // 3. Ensure the final budget NEVER exceeds the human market cost (otherwise it's not a discount)
            if (safeBudget > 0 && safeMarketCost > 0 && safeBudget > safeMarketCost) {
                parsed.minimum_client_budget_usd = safeMarketCost * 0.15; // Force fallback to 15% discount if hallucination flipped them
            }
            
        } catch (error) {
            console.error("DeepSeek budget JSON parse error:", error, rawResponse);
            // If completely unparsable, guardLocalEstimate's safety defaults will automatically catch it below.
        }

        return NextResponse.json(
            guardLocalEstimate(parsed, title, pricingDescription, planId, usedStrategy, usedModel, intelligenceSources, body),
        );
    } catch (error) {
        console.error("Failed to calculate budget:", error);
        return NextResponse.json(
            { detail: "Failed to estimate the minimum project price." },
            { status: 500 },
        );
    }
}
