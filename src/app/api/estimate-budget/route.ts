import { NextResponse } from "next/server";

async function fetchFromDeepSeek(systemPrompt: string, userPrompt: string, apiKey: string) {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.15,
            max_tokens: 300,
        })
    });

    if (!response.ok) {
        const errBase = await response.text();
        throw new Error(`DeepSeek API returned ${response.status}: ${errBase}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
}

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

        const deepseekKey = process.env.DEEPSEEK_API_KEY;
        const openRouterKey = process.env.OPENROUTER_API_KEY;
        const groqKey = process.env.GROQ_API_1;

        const systemPrompt = `You are the Pantheon Mesh Pricing Engine. Your goal is to provide Fair, Precise, and Hyper-Competitive AI-labor pricing.
Your decisions must significantly undercut human freelancer market rates (usually by 60-80%) while ensuring the platform remains profitable via computational markup.

USER BRIEF:
Title: ${title}
Requirements: ${description}

DECISION RULES:
1. ESTIMATE HUMAN COST: What would a human freelancer charge? (e.g., $100)
2. CALCULATE AI ADVANTAGE: Apply an 80% discount because an AI worker is executing this. (Result: $20)
3. RAW API OVERHEAD: Estimate the cost of tokens to execute this (usually $0.01 - $0.50).
4. FINAL MINIMUM: Ensure it's at least $5.00 but remains significantly attractive to a business owner.

Return ONLY a valid JSON object matching this structure:
{
  "base_cost_usd": number (the competitive budget for the client),
  "api_cost_usd": number (the raw cost of processing),
  "reason": "1 concise sentence justifying why this is a fair yet disruptive price point."
}`;

        const userPrompt = `Calculate the competitive AI-labor minimum for: ${title}`;

        let rawResponse = "";
        let usedStrategy = "";

        // Fallback Chain: DeepSeek Native -> OpenRouter -> Groq
        try {
            if (!deepseekKey) throw new Error("No DeepSeek key");
            rawResponse = await fetchFromDeepSeek(systemPrompt, userPrompt, deepseekKey);
            usedStrategy = "deepseek-v3-native";
        } catch (dsError) {
            console.warn("DeepSeek Native failed, trying OpenRouter:", dsError);
            try {
                if (!openRouterKey) throw new Error("No OpenRouter key");
                rawResponse = await fetchFromOpenRouter(systemPrompt, userPrompt, openRouterKey);
                usedStrategy = "openrouter-deepseek";
            } catch (orError) {
                console.warn("OpenRouter failed, falling back to Groq:", orError);
                if (!groqKey) throw new Error("All preferred AI sources failed.");
                rawResponse = await fetchFromGroq(systemPrompt, userPrompt, groqKey);
                usedStrategy = "groq-llama-fallback";
            }
        }

        let parsed = {
            base_cost_usd: 5,
            api_cost_usd: 0,
            reason: ""
        };

        try {
            // Remove potential markdown code blocks if the model ignored instructions
            const cleanJson = rawResponse.replace(/```json/g, "").replace(/```/g, "").trim();
            parsed = JSON.parse(cleanJson);
        } catch (e) {
            console.error("JSON parse error on AI response", e, rawResponse);
        }

        const baseCost = Number(parsed.base_cost_usd) || 5;
        const apiCost = Number(parsed.api_cost_usd) || 0;
        
        // Final guard: Ensure we don't go below $5 total
        const combinedMinimum = Math.max(5, Math.round((baseCost + apiCost) * 100) / 100);

        return NextResponse.json({
            min_budget_usd: combinedMinimum,
            estimated_api_cost_usd: apiCost,
            reason: parsed.reason || "AI labor provides significant savings over human freelancers.",
            strategy: usedStrategy
        });

    } catch (error) {
        console.error("Failed to calculate budget:", error);
        return NextResponse.json(
            { detail: "Failed to estimate budget via AI." },
            { status: 500 }
        );
    }
}
