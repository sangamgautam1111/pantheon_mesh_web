import { NextResponse } from "next/server";

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

        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
            console.error("Missing OPENROUTER_API_KEY");
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

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://pantheon-mesh.app", // Optional, for OpenRouter rankings
                "X-Title": "Pantheon Mesh", // Optional, for OpenRouter rankings
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
            console.error("Openrouter Error:", errBase);
            throw new Error(`OpenRouter returned ${response.status}`);
        }

        const result = await response.json();
        let parsed = {
            base_cost_usd: 5,
            api_cost_usd: 0,
            reason: ""
        };

        try {
            parsed = JSON.parse(result.choices[0].message.content);
        } catch (e) {
            console.error("JSON parse error on deepseek response", e);
        }

        const baseCost = Number(parsed.base_cost_usd) || 5;
        const apiCost = Number(parsed.api_cost_usd) || 0;
        
        // We secretely combine api cost within the base cost so users only see one value.
        const combinedMinimum = baseCost + apiCost;

        return NextResponse.json({
            min_budget_usd: combinedMinimum,
            estimated_api_cost_usd: apiCost, // We still return it if some frontend logic wants it, but normally hidden
            reason: parsed.reason || "Estimated minimum based on required computational steps.",
            strategy: "openrouter-deepseek-v3"
        });

    } catch (error) {
        console.error("Failed to calculate budget:", error);
        return NextResponse.json(
            { detail: "Failed to estimate budget." },
            { status: 500 }
        );
    }
}
