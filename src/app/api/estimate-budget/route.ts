import { NextResponse } from "next/server";

const PRODUCTION_API_BASE = "https://pantheon-api-mlqrumx6cq-uc.a.run.app";
const GLOBAL_MINIMUM_BUDGET_USD = 1;
const MINIMUM_MARGIN_MULTIPLIER = 2.8;
const BASE_PLATFORM_OVERHEAD_USD = 0.85;
const MAX_AI_PRICE_RATIO = 0.2;

const PLAN_PRICE_RATIO: Record<string, number> = {
    free: 0.2,
    starter: 0.18,
    growth: 0.16,
    scale: 0.15,
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
};

function buildPricingDescription(body: Record<string, unknown>, description: string) {
    const details = [description.trim()];
    const timeline = typeof body.timeline === "string" ? body.timeline : "";
    const modelLane = typeof body.model_lane === "string" ? body.model_lane : "";
    const modelGroup = typeof body.model_group === "string" ? body.model_group : "";
    const assetTotalMb = numberFrom(body.asset_total_mb, 0);
    const assetCount = numberFrom(body.asset_count, 0);
    const assetTypes = Array.isArray(body.asset_types)
        ? body.asset_types.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        : [];
    const assetLinks = Array.isArray(body.asset_links)
        ? body.asset_links.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        : [];
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
    if (assetCount || assetTotalMb || assetTypes.length > 0) {
        details.push(
            `Raw assets: ${assetCount} files, asset total size: ${assetTotalMb.toFixed(2)} MB, asset types: ${
                assetTypes.join(", ") || "unknown"
            }.`,
        );
    }
    if (assetLinks.length > 0) {
        details.push(`Asset/reference links provided: ${assetLinks.slice(0, 5).join("; ")}.`);
    }

    return details.filter(Boolean).join("\n");
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

function cleanJsonObject(text: string) {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
        return cleaned.slice(start, end + 1);
    }
    return cleaned;
}

function sanitizePublicEstimate(data: Record<string, unknown>, strategyFallback = "ai-estimate") {
    const minBudget = roundBudget(numberFrom(data.min_budget_usd, GLOBAL_MINIMUM_BUDGET_USD));
    const humanMarketCost = roundDisplay(Math.max(numberFrom(data.human_market_cost_usd, 0), minBudget));
    const savingsPercent =
        humanMarketCost > 0
            ? Math.round(Math.max(0, 100 - (minBudget / humanMarketCost) * 100) * 10) / 10
            : 0;

    return {
        min_budget_usd: minBudget,
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
        plan: data.plan,
        usage: data.usage,
    };
}

function normalizeEstimatesForScope(
    title: string,
    description: string,
    humanMarketCost: number,
    estimatedInternalCost: number,
) {
    const combined = `${title} ${description}`.toLowerCase();
    const wordCount = combined.split(/\s+/).filter(Boolean).length;
    const isSimpleWriting = SIMPLE_WRITING_KEYWORDS.some((keyword) => combined.includes(keyword));
    const isLongForm = LONG_FORM_KEYWORDS.some((keyword) => combined.includes(keyword));

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

    return { humanMarketCost, estimatedInternalCost };
}

function guardLocalEstimate(parsed: RawEstimate, title: string, description: string, planId: string, strategy: string, model: string) {
    const suggestedMinimum = numberFrom(
        parsed.minimum_client_budget_usd ?? parsed.min_budget_usd,
        GLOBAL_MINIMUM_BUDGET_USD,
    );
    let estimatedInternalCost = Math.max(
        0.01,
        numberFrom(parsed.estimated_api_cost_usd ?? parsed.api_cost_usd, 0.35),
    );
    let humanMarketCost = Math.max(
        numberFrom(parsed.human_market_cost_usd, suggestedMinimum * 4),
        5,
    );

    const normalized = normalizeEstimatesForScope(title, description, humanMarketCost, estimatedInternalCost);
    humanMarketCost = normalized.humanMarketCost;
    estimatedInternalCost = normalized.estimatedInternalCost;

    const ratio = PLAN_PRICE_RATIO[planId] ?? PLAN_PRICE_RATIO.free;
    const marginFloor = estimatedInternalCost * MINIMUM_MARGIN_MULTIPLIER;
    const platformFloor = estimatedInternalCost + Math.max(BASE_PLATFORM_OVERHEAD_USD, humanMarketCost * 0.015);
    const aiPriceTarget = humanMarketCost * ratio + estimatedInternalCost;
    const maxClientPrice = humanMarketCost * MAX_AI_PRICE_RATIO + estimatedInternalCost;
    const minBudget = roundBudget(Math.max(marginFloor, platformFloor, aiPriceTarget, Math.min(suggestedMinimum, maxClientPrice)));
    const savingsPercent = Math.round(Math.max(0, 100 - (minBudget / humanMarketCost) * 100) * 10) / 10;

    return {
        min_budget_usd: minBudget,
        human_market_cost_usd: roundDisplay(humanMarketCost),
        savings_percent: savingsPercent,
        reason: parsed.reason?.trim() || "Calculated as a low AI project price compared with typical freelancer rates.",
        strategy,
        model,
    };
}

async function fetchFromDeepSeek(systemPrompt: string, userPrompt: string, apiKey: string) {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.15,
            max_tokens: 320,
        }),
    });

    if (!response.ok) {
        throw new Error(`DeepSeek API returned ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    return result.choices[0].message.content as string;
}

async function fetchFromOpenRouter(systemPrompt: string, userPrompt: string, apiKey: string) {
    const model =
        process.env.OPENROUTER_BUDGET_MODEL ||
        process.env.BENCHMARK_MODEL ||
        "deepseek/deepseek-chat-v3-0324";
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://pantheon-mesh.app",
            "X-Title": "Pantheon Mesh Budget Estimator",
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.15,
            max_tokens: 320,
        }),
    });

    if (!response.ok) {
        throw new Error(`OpenRouter returned ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    return {
        content: result.choices[0].message.content as string,
        model,
    };
}

async function fetchFromGroq(systemPrompt: string, userPrompt: string, apiKey: string) {
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
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
            max_tokens: 320,
        }),
    });

    if (!response.ok) {
        throw new Error(`Groq returned ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    return {
        content: result.choices[0].message.content as string,
        model,
    };
}

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

        if (clientUid) {
            try {
                const response = await fetch(`${getApiBase()}/v1/client/job/estimate-budget`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...body,
                        client_uid: clientUid,
                        title,
                        description,
                    }),
                    cache: "no-store",
                });

                if (response.ok) {
                    const data = await response.json();
                    return NextResponse.json(sanitizePublicEstimate(data, "backend-estimate"));
                }
            } catch (error) {
                console.warn("Backend estimate failed; trying server-side model fallback:", error);
            }
        }

        const systemPrompt = `You are the Pantheon Mesh Pricing Engine.
Calculate the lowest safe AI project price for a business client.

Rules:
1. Classify the job by scope and difficulty from the actual words in the brief. Do not inflate vague/simple tasks.
2. Estimate human_market_cost_usd realistically. Simple writing such as a short story, email, paragraph, rewrite, caption, or summary is usually $10-$35 unless the brief asks for long-form, screenplay, film, book, chapters, research, or premium production work.
3. Estimate estimated_api_cost_usd: hidden provider/model/tool cost, including retries and review. This is internal only.
4. Estimate minimum_client_budget_usd as the lowest client-facing project price. If human_market_cost_usd is $100, the client-facing AI price should be about $20 maximum before hidden delivery cost protection. Smaller simple tasks should be much lower.
5. The final quote must stay above hidden delivery cost plus platform margin, but never pad the price just because the plan is higher.
6. If Requirements include raw asset size/count, file types, selected model routing, reference links, or rush timeline, use those signals carefully to adjust effort and hidden compute cost.
7. Keep the reason client-friendly. Do not mention API cost, provider cost, margin, or internal calculations.

Return only JSON:
{
  "human_market_cost_usd": number,
  "minimum_client_budget_usd": number,
  "estimated_api_cost_usd": number,
  "reason": "one short client-facing sentence"
}`;

        const userPrompt = `Title: ${title}\nRequirements: ${pricingDescription}\nPlan: ${planId}`;
        const deepseekKey = process.env.DEEPSEEK_API_KEY;
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_1;

        let rawResponse = "";
        let usedStrategy = "";
        let usedModel = "";

        try {
            if (!deepseekKey) {
                throw new Error("No DeepSeek key");
            }
            rawResponse = await fetchFromDeepSeek(systemPrompt, userPrompt, deepseekKey);
            usedStrategy = "deepseek-v3-native";
            usedModel = "deepseek-chat";
        } catch (deepSeekError) {
            console.warn("DeepSeek Native failed, trying OpenRouter:", deepSeekError);
            try {
                if (!openRouterKey) {
                    throw new Error("No OpenRouter key");
                }
                const openRouterResult = await fetchFromOpenRouter(systemPrompt, userPrompt, openRouterKey);
                rawResponse = openRouterResult.content;
                usedStrategy = "openrouter-deepseek-v3";
                usedModel = openRouterResult.model;
            } catch (openRouterError) {
                console.warn("OpenRouter failed, falling back to Groq:", openRouterError);
                if (!groqKey) {
                    throw new Error("All preferred AI sources failed.");
                }
                const groqResult = await fetchFromGroq(systemPrompt, userPrompt, groqKey);
                rawResponse = groqResult.content;
                usedStrategy = "groq-fallback";
                usedModel = groqResult.model;
            }
        }

        let parsed: RawEstimate = {};
        try {
            parsed = JSON.parse(cleanJsonObject(rawResponse)) as RawEstimate;
        } catch (error) {
            console.error("Budget JSON parse error:", error, rawResponse);
        }

        return NextResponse.json(guardLocalEstimate(parsed, title, pricingDescription, planId, usedStrategy, usedModel));
    } catch (error) {
        console.error("Failed to calculate budget:", error);
        return NextResponse.json(
            { detail: "Failed to estimate the minimum project price." },
            { status: 500 },
        );
    }
}
