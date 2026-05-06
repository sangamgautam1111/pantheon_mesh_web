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
    const normalizedCategory = input.category === "Mobile Repair" ? "Mobile Repair" : "Home Cleaning";
    const title = input.description.length > 70 ? `${input.description.slice(0, 67)}...` : input.description;

    return {
        category: normalizedCategory,
        title: title || `New ${normalizedCategory} Need`,
        problem: input.description,
        knownDetails: input.description,
        missingInfo: [
            input.location ? "" : "Exact area or landmark",
            input.urgency ? "" : "When you need it",
            input.budget ? "" : "NPR budget if you have one",
        ].filter(Boolean),
        questions: [
            input.location ? "" : "Where should businesses be near?",
            input.urgency ? "" : "When do you need this done?",
            input.budget ? "" : "Do you have an NPR budget?",
        ].filter(Boolean),
        summaryForBusinesses:
            "Please send NPR price, estimated time, service type, availability, quality or guarantee, and any important conditions.",
        customerSummary: input.description,
        businessPrompt: "Send a clear Service Offer with NPR price, timing, service type, quality or guarantee, and availability.",
        tags: [normalizedCategory],
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
Needero MVP has two active categories only: Home Cleaning first priority, and Mobile Repair second. Customers post one Need; nearby businesses send Service Offers.
Return JSON only:
{
  "category": "Home Cleaning | Mobile Repair",
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
Use simple words for non-technical users. For home cleaning, focus on rooms, cleaning type, service preference, location, urgency, photos, NPR price, and team/material needs. For mobile repair, focus on brand, optional model, issue, service preference, location, urgency, photos, NPR price, warranty, and parts quality. Keep it short and useful.`;

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
