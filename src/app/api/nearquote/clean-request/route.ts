import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DEEPSEEK_REQUEST_CLEANER_MODEL || "deepseek-chat";

type CleanRequestInput = {
    description: string;
    location?: string;
    urgency?: string;
    category?: string;
    device?: string;
};

function getString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function fallbackCard(input: CleanRequestInput) {
    const text = input.description.toLowerCase();
    const deviceMatch =
        input.device ||
        input.description.match(/\b(iphone\s?\d+|samsung\s?[a-z0-9]+|redmi\s?[a-z0-9 ]+|vivo\s?[a-z0-9 ]+|oppo\s?[a-z0-9 ]+)\b/i)?.[0] ||
        "Unknown phone model";
    const issue = text.includes("screen") || text.includes("display") || text.includes("black")
        ? "Possible screen or display damage"
        : text.includes("charge")
          ? "Possible charging port or battery issue"
          : text.includes("battery")
            ? "Possible battery issue"
            : "Phone repair diagnosis needed";

    return {
        category: input.category || "Phone repair",
        issue,
        device: deviceMatch,
        status: text.includes("touch") ? "Touch status mentioned" : "Touch status not confirmed",
        missingInfo: [
            input.location ? "" : "Exact area or landmark",
            input.urgency ? "" : "When the customer needs repair",
            deviceMatch === "Unknown phone model" ? "Phone model" : "",
        ].filter(Boolean),
        quoteNeeded: `${issue} estimate near ${input.location || "customer location"}`,
        customerSummary: input.description,
        businessPrompt:
            "Please reply with price range, repair time, warranty, parts quality, shop distance, and available slot.",
        fallback: true,
    };
}

function parseJson(content: string) {
    const cleaned = content
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
    return JSON.parse(cleaned);
}

async function callDeepSeek(input: CleanRequestInput, apiKey: string) {
    const systemPrompt = `You are Needaro's AI Problem Card cleaner.
Needaro is a local quote marketplace. Customers post local service problems; nearby businesses send offers.
For MVP, focus on phone repair in one city.
Return JSON only:
{
  "category": "Phone repair",
  "issue": "clear likely issue",
  "device": "device/model or Unknown",
  "status": "what is known about condition",
  "missingInfo": ["short missing info"],
  "quoteNeeded": "what businesses should quote",
  "customerSummary": "clean customer-facing summary",
  "businessPrompt": "instruction businesses see before replying"
}
Do not diagnose as certain. Use words like possible/likely if uncertain. Keep it short and useful.`;

    const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            temperature: 0.2,
            max_tokens: 700,
            messages: [
                { role: "system", content: systemPrompt },
                {
                    role: "user",
                    content: [
                        `Description: ${input.description}`,
                        `Location: ${input.location || "not specified"}`,
                        `Urgency: ${input.urgency || "not specified"}`,
                        `Category: ${input.category || "Phone repair"}`,
                        `Device: ${input.device || "not specified"}`,
                    ].join("\n"),
                },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`DeepSeek failed with ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
        throw new Error("Empty response");
    }

    return { ...parseJson(content), fallback: false, model: MODEL };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const input: CleanRequestInput = {
            description: getString(body.description),
            location: getString(body.location),
            urgency: getString(body.urgency),
            category: getString(body.category) || "Phone repair",
            device: getString(body.device),
        };

        if (input.description.length < 8) {
            return NextResponse.json({ error: "Describe the repair problem first." }, { status: 400 });
        }

        const apiKey = process.env.DEEPSEEK_API_KEY || "";
        if (!apiKey) {
            return NextResponse.json(fallbackCard(input));
        }

        try {
            return NextResponse.json(await callDeepSeek(input, apiKey));
        } catch (error) {
            console.error("Needaro request cleaner failed:", error);
            return NextResponse.json(fallbackCard(input));
        }
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
}
