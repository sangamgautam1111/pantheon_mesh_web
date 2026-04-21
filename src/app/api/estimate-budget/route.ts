import { NextResponse } from "next/server";

const PRODUCTION_API_BASE = "https://pantheon-api-mlqrumx6cq-uc.a.run.app";
const GLOBAL_MINIMUM_BUDGET_USD = 1;
const MINIMUM_MARGIN_MULTIPLIER = 2.8;
const BASE_PLATFORM_OVERHEAD_USD = 1.25;

const PLAN_PRICE_RATIO: Record<string, number> = {
    free: 0.25,
    starter: 0.22,
    growth: 0.18,
    scale: 0.15,
};

type RawEstimate = {
    human_market_cost_usd?: number;
    minimum_client_budget_usd?: number;
    min_budget_usd?: number;
    estimated_api_cost_usd?: number;
    api_cost_usd?: number;
    reason?: string;
};

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

function guardLocalEstimate(parsed: RawEstimate, planId: string, strategy: string, model: string) {
    const suggestedMinimum = numberFrom(
        parsed.minimum_client_budget_usd ?? parsed.min_budget_usd,
        GLOBAL_MINIMUM_BUDGET_USD,
    );
    const estimatedInternalCost = Math.max(
        0.01,
        numberFrom(parsed.estimated_api_cost_usd ?? parsed.api_cost_usd, 0.35),
    );
    const humanMarketCost = Math.max(
        suggestedMinimum,
        numberFrom(parsed.human_market_cost_usd, suggestedMinimum * 4),
        5,
    );
    const ratio = PLAN_PRICE_RATIO[planId] ?? PLAN_PRICE_RATIO.free;
    const marginFloor = estimatedInternalCost * MINIMUM_MARGIN_MULTIPLIER;
    const platformFloor = estimatedInternalCost + Math.max(BASE_PLATFORM_OVERHEAD_USD, humanMarketCost * 0.025);
    const aiPriceTarget = humanMarketCost * ratio;
    const minBudget = roundBudget(Math.max(suggestedMinimum, marginFloor, platformFloor, aiPriceTarget));
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
1. Estimate human_market_cost_usd: what a real freelancer or small agency would normally charge.
2. Estimate estimated_api_cost_usd: hidden provider/model/tool cost, including retries and review. This is internal only.
3. Estimate minimum_client_budget_usd: a client-facing price that is much cheaper than the human market cost but never below internal cost plus platform margin.
4. Keep the reason client-friendly. Do not mention API cost, provider cost, margin, or internal calculations.

Return only JSON:
{
  "human_market_cost_usd": number,
  "minimum_client_budget_usd": number,
  "estimated_api_cost_usd": number,
  "reason": "one short client-facing sentence"
}`;

        const userPrompt = `Title: ${title}\nRequirements: ${description}\nPlan: ${planId}`;
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

        return NextResponse.json(guardLocalEstimate(parsed, planId, usedStrategy, usedModel));
    } catch (error) {
        console.error("Failed to calculate budget:", error);
        return NextResponse.json(
            { detail: "Failed to estimate the minimum project price." },
            { status: 500 },
        );
    }
}
