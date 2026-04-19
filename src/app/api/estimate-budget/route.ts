import { NextResponse } from "next/server";

async function fetchFromOpenRouter(systemPrompt: string, userPrompt: string, apiKey: string) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://pantheon-mesh.app",
            "X-Title": "Pantheon Mesh",
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
        })
    });

    if (!response.ok) {
        const errBase = await response.text();
        throw new Error(`OpenRouter returned ${response.status}: ${errBase}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
}

async function fetchFromGroq(systemPrompt: string, userPrompt: string, apiKey: string) {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.2,
        })
    });

    if (!response.ok) {
        const errBase = await response.text();
        throw new Error(`Groq returned ${response.status}: ${errBase}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { title, description } = body;

        if (!title || !description) {
            return NextResponse.json(
                { detail: "Title and description are required constraints." },
                { status: 400 }
            );
        }

        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_1;

        if (!openRouterKey && !groqKey) {
            console.error("Missing all API keys (OpenRouter & Groq)");
            return NextResponse.json(
                { detail: "Internal Server Error regarding API keys." },
                { status: 500 }
            );
        }

        const systemPrompt = `You are an elite autonomous evaluator determining project costs to undercut human freelancers.
Review the following project title and requirements.
1. Estimate a competitive base cost in USD to execute this via an AI laborer vs human. It should be astonishingly cheap but realistic for AI computation value.
2. Estimate the raw token/API cost in USD (usually a few cents).
3. Return ONLY a valid JSON object matching EXACTLY this structure, with no markdown wrappers or additional text:
{
  "base_cost_usd": number,
  "api_cost_usd": number,
  "reason": "1 sentence explanation of the cost breakdown."
}`;

        const userPrompt = `Title: ${title}\nRequirements: ${description}`;

        let rawResponse = "";
        let usedStrategy = "";

        try {
            if (!openRouterKey) throw new Error("No OpenRouter key");
            rawResponse = await fetchFromOpenRouter(systemPrompt, userPrompt, openRouterKey);
            usedStrategy = "openrouter-deepseek-v3";
        } catch (orError) {
            console.warn("OpenRouter failed, falling back to Groq:", orError);
            if (!groqKey) throw new Error("OpenRouter failed and no Groq key available");
            rawResponse = await fetchFromGroq(systemPrompt, userPrompt, groqKey);
            usedStrategy = "groq-llama-3.3-70b";
        }

        let parsed = {
            base_cost_usd: 5,
            api_cost_usd: 0,
            reason: ""
        };

        try {
            parsed = JSON.parse(rawResponse);
        } catch (e) {
            console.error("JSON parse error on AI response", e, rawResponse);
        }

        const baseCost = Number(parsed.base_cost_usd) || 5;
        const apiCost = Number(parsed.api_cost_usd) || 0;
        
        // We secretely combine api cost within the base cost so users only see one value.
        const combinedMinimum = baseCost + apiCost;

        return NextResponse.json({
            min_budget_usd: combinedMinimum,
            estimated_api_cost_usd: apiCost,
            reason: parsed.reason || "Estimated minimum based on required computational steps.",
            strategy: usedStrategy
        });

    } catch (error) {
        console.error("Failed to calculate budget:", error);
        return NextResponse.json(
            { detail: "Failed to estimate budget." },
            { status: 500 }
        );
    }
}
