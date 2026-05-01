import { NextRequest, NextResponse } from "next/server";
import { ASSISTANT_KNOWLEDGE } from "@/lib/assistantKnowledge";

export const runtime = "nodejs";

type ChatTurn = {
    role: "user" | "assistant";
    text: string;
};

const MAX_HISTORY_MESSAGES = 6;

const NAVIGATION_TARGETS: Array<{ path: string; label: string; keywords: string[] }> = [
    { path: "/", label: "Open Needero home", keywords: ["home", "overview", "needero", "needero.com"] },
    { path: "/client/new", label: "Post Phone Repair Need", keywords: ["post", "need", "repair", "phone", "request", "problem", "customer"] },
    { path: "/client", label: "Open My Phone Repair Needs", keywords: ["my needs", "needs", "history", "customer requests"] },
    { path: "/marketplace", label: "Browse Repair Offers", keywords: ["marketplace", "offers", "shops", "businesses", "repair offers"] },
    { path: "/pricing", label: "Open business plans", keywords: ["pricing", "plans", "business plan", "subscription", "npr", "1999", "4999"] },
    { path: "/messages", label: "Open messages", keywords: ["messages", "chat", "inbox"] },
];

function normalizeText(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9$.\s/-]+/g, " ").replace(/\s+/g, " ").trim();
}

function getGroqApiKeys() {
    return Object.entries(process.env)
        .filter(([key, value]) => key.startsWith("GROQ_API_") && typeof value === "string" && value.trim())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, value]) => value!.trim());
}

function parseHistory(value: unknown): ChatTurn[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(
            (entry): entry is ChatTurn =>
                Boolean(entry) &&
                typeof entry === "object" &&
                "role" in entry &&
                "text" in entry &&
                (((entry as ChatTurn).role === "user") || (entry as ChatTurn).role === "assistant") &&
                typeof (entry as ChatTurn).text === "string",
        )
        .slice(-MAX_HISTORY_MESSAGES);
}

function retrieveKnowledge(message: string) {
    const query = normalizeText(message);
    const tokens = new Set(query.split(" ").filter((token) => token.length > 2));

    return ASSISTANT_KNOWLEDGE.map((doc) => {
        const text = normalizeText(`${doc.title} ${doc.category} ${doc.text}`);
        let score = 0;
        for (const token of tokens) {
            if (text.includes(token)) score += 1;
        }
        return { doc, score };
    })
        .sort((left, right) => right.score - left.score)
        .slice(0, 5)
        .filter((item) => item.score > 0)
        .map((item) => item.doc);
}

function buildNavigationAction(message: string) {
    const query = normalizeText(message);
    const wantsNavigation = /(^|\b)(open|go to|take me to|navigate|show me|bring me|where)\b/.test(query) || query.trim().startsWith("/");
    if (!wantsNavigation) {
        return [];
    }

    const target = NAVIGATION_TARGETS.find((candidate) => candidate.keywords.some((keyword) => query.includes(keyword)));
    if (!target) {
        return [];
    }

    return [{ type: "navigate" as const, path: target.path, label: target.label }];
}

function buildKnowledgeBlock(docs: typeof ASSISTANT_KNOWLEDGE) {
    const selected = docs.length > 0 ? docs : ASSISTANT_KNOWLEDGE.slice(0, 5);
    return selected.map((doc, index) => `${index + 1}. ${doc.title}: ${doc.text}`).join("\n");
}

async function generateGroqReply(message: string, history: ChatTurn[], knowledgeBlock: string) {
    const keys = getGroqApiKeys();
    if (keys.length === 0) {
        throw new Error("No Groq key configured");
    }

    const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
    const messages = [
        {
            role: "system",
            content:
                "You are Needero Assist. Needero MVP is phone repair only. Customers post a phone repair Need, nearby repair shops send Repair Offers, and customers choose the best one. Use simple language for non-technical users.",
        },
        {
            role: "system",
            content: `Needero knowledge:\n${knowledgeBlock}`,
        },
        ...history.map((turn) => ({ role: turn.role, content: turn.text })),
        { role: "user", content: message },
    ];

    for (const apiKey of keys) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model,
                temperature: 0.35,
                max_tokens: 320,
                messages,
            }),
        });

        if (!response.ok) {
            continue;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === "string" && content.trim()) {
            return content.trim();
        }
    }

    throw new Error("Groq did not return content");
}

function fallbackReply(message: string, docs: ReturnType<typeof retrieveKnowledge>) {
    const query = normalizeText(message);

    if (query.includes("business model") || query.includes("money") || query.includes("pricing")) {
        return "Needero makes money from repair shops, not customers. Customers post phone repair Needs for free. Shops can use Free, Pro, or Premium subscriptions for more replies, better visibility, AI quote help, and analytics.";
    }

    if (query.includes("mvp") || query.includes("first") || query.includes("start")) {
        return "Start simple: real phone repair shops, real customer phone repair Needs, fast Repair Offers, completed matches, and one paying shop after value is proven.";
    }

    if (query.includes("customer") || query.includes("request")) {
        return "Customer flow: choose the phone issue, add brand, model, area and urgency, optionally upload proof, compare NPR repair Offers, then choose one shop.";
    }

    if (docs[0]) {
        return `${docs[0].text} What part should I help you open or refine next?`;
    }

    return "Needero MVP is phone repair only: post your phone issue, get repair prices from nearby shops, choose the best one.";
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const message = typeof body?.message === "string" ? body.message.trim() : "";
        const history = parseHistory(body?.messages);

        if (!message) {
            return NextResponse.json({ error: "No message provided." }, { status: 400 });
        }

        const docs = retrieveKnowledge(message);
        const actions = buildNavigationAction(message);
        const knowledgeBlock = buildKnowledgeBlock(docs);

        try {
            const response = await generateGroqReply(message, history, knowledgeBlock);
            return NextResponse.json({ response, actions });
        } catch {
            return NextResponse.json({ response: fallbackReply(message, docs), actions });
        }
    } catch {
        return NextResponse.json({ response: "Something went wrong. Please try again.", actions: [] }, { status: 500 });
    }
}
