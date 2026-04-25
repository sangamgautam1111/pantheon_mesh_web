import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = process.env.DEEPSEEK_REQUEST_CLEANER_MODEL || "deepseek-chat";

type CleanRequestInput = {
    description: string;
    location?: string;
    urgency?: string;
    category?: string;
    budget?: string;
};

function getString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function fallbackCard(input: CleanRequestInput) {
    const text = input.description.toLowerCase();
    const category =
        input.category ||
        (/(phone|screen|battery|charge|laptop|repair|fix)/i.test(text)
            ? "Repair & maintenance"
            : /(clean|plumber|electric|home|room|house)/i.test(text)
              ? "Home services"
              : /(logo|print|design|banner|menu)/i.test(text)
                ? "Design & printing"
                : /(tutor|lesson|class|study)/i.test(text)
                  ? "Lessons & tutoring"
                  : "Other");
    const title = input.description.length > 70 ? `${input.description.slice(0, 67)}...` : input.description;

    return {
        category,
        title: title || "New local Need",
        problem: input.description,
        knownDetails: input.description,
        missingInfo: [
            input.location ? "" : "Exact area or landmark",
            input.urgency ? "" : "When you need it",
            input.budget ? "" : "Budget if you have one",
        ].filter(Boolean),
        questions: [
            input.location ? "" : "Where should businesses be near?",
            input.urgency ? "" : "When do you need this done?",
            input.budget ? "" : "Do you have a budget?",
        ].filter(Boolean),
        summaryForBusinesses:
            "Please send price, time, warranty or service details, availability, and any important conditions.",
        customerSummary: input.description,
        businessPrompt: "Send a clear quote with price, timing, warranty or service terms, and availability.",
        tags: [category],
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
    const systemPrompt = `You are Needero's AI Need Card cleaner.
Needero is a reverse local service marketplace. Customers post a Need once; nearby businesses send Offers.
Classify any local service category. Do not force phone repair.
Return JSON only:
{
  "category": "simple local service category",
  "title": "short Need title",
  "problem": "plain problem summary",
  "knownDetails": "facts the customer already gave",
  "missingInfo": ["short missing info"],
  "questions": ["simple question to ask customer"],
  "summaryForBusinesses": "what businesses need to know before quoting",
  "customerSummary": "clean customer-facing summary",
  "businessPrompt": "simple instruction businesses see before replying",
  "tags": ["short tag"]
}
Use simple words for non-technical users. If the category is unclear, choose Other. Keep it short and useful.`;

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
                        `Budget: ${input.budget || "not specified"}`,
                        `Customer selected category: ${input.category || "not specified"}`,
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
            category: getString(body.category),
            budget: getString(body.budget),
        };

        if (input.description.length < 8) {
            return NextResponse.json({ error: "Describe what you need first." }, { status: 400 });
        }

        const apiKey = process.env.DEEPSEEK_API_KEY || "";
        if (!apiKey) {
            return NextResponse.json(fallbackCard(input));
        }

        try {
            return NextResponse.json(await callDeepSeek(input, apiKey));
        } catch (error) {
            console.error("Needero request cleaner failed:", error);
            return NextResponse.json(fallbackCard(input));
        }
    } catch {
        return NextResponse.json({ error: "Invalid request." }, { status: 400 });
    }
}
