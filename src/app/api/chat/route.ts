import { NextRequest, NextResponse } from "next/server";
import { ASSISTANT_KNOWLEDGE, type AssistantKnowledgeDoc } from "@/lib/assistantKnowledge";
import { BUSINESS_PLANS } from "@/lib/businessPlans";

export const runtime = "nodejs";

type ChatTurn = {
    role: "user" | "assistant";
    text: string;
};

type PineconeMetadata = {
    title?: string;
    category?: string;
    route?: string;
    text?: string;
};

type RetrievedDoc = {
    score: number;
    title: string;
    category: string;
    route?: string;
    text: string;
};

const ASSISTANT_NAMESPACE = "mesh-assistant-business";
const DEFAULT_DIMENSION = 1536;
const MAX_HISTORY_MESSAGES = 6;
const PINECONE_API_VERSION = "2025-10";

const NAVIGATION_TARGETS: Array<{ path: string; label: string; keywords: string[] }> = [
    { path: "/dashboard", label: "Open dashboard", keywords: ["dashboard", "overview", "home"] },
    { path: "/client", label: "Open job center", keywords: ["job center", "jobs", "job", "post"] },
    { path: "/pricing", label: "Open pricing", keywords: ["plans", "plan", "upgrade", "tier"] },
    { path: "/pricing", label: "Open pricing", keywords: ["pricing", "price", "starter", "$29", "growth", "$69", "scale", "$149"] },
    { path: "/marketplace", label: "Open marketplace", keywords: ["marketplace"] },
    { path: "/whitepaper", label: "Open whitepaper", keywords: ["whitepaper", "docs", "documentation"] },
];

const GROQ_MODELS = [
    process.env.GROQ_MODEL,
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
].filter((value): value is string => Boolean(value));

let seedPromise: Promise<void> | null = null;

function getGroqApiKeys() {
    return Object.entries(process.env)
        .filter(([key, value]) => key.startsWith("GROQ_API_") && typeof value === "string" && value.trim())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, value]) => value!.trim());
}

function normalizeText(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9$.\s/-]+/g, " ").replace(/\s+/g, " ").trim();
}

function hashToken(token: string) {
    let hash = 2166136261;
    for (let index = 0; index < token.length; index += 1) {
        hash ^= token.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
}

function buildDeterministicEmbedding(text: string, dimension: number) {
    const vector = new Array<number>(dimension).fill(0);
    const normalized = normalizeText(text);

    if (!normalized) {
        vector[0] = 1;
        return vector;
    }

    const tokens = normalized.split(" ").filter(Boolean);
    const charWindowSource = normalized.replace(/\s+/g, " ");

    for (const token of tokens) {
        const weight = Math.min(3, 1 + token.length / 10);
        const firstIndex = hashToken(token) % dimension;
        const secondIndex = hashToken(`${token}:context`) % dimension;
        vector[firstIndex] += weight;
        vector[secondIndex] += weight * 0.6;
    }

    for (let index = 0; index < Math.max(0, charWindowSource.length - 2); index += 1) {
        const trigram = charWindowSource.slice(index, index + 3);
        const trigramIndex = hashToken(`tri:${trigram}`) % dimension;
        vector[trigramIndex] += 0.12;
    }

    const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
    if (!magnitude) {
        vector[0] = 1;
        return vector;
    }

    return vector.map((value) => value / magnitude);
}

function buildKnowledgeText(doc: AssistantKnowledgeDoc) {
    return `${doc.title}. ${doc.text}`;
}

function getPineconeConfig() {
    const apiKey = process.env.PINECONE_API_KEY;
    const rawHost = process.env.PINECONE_HOST;
    const host = rawHost?.replace(/\/$/, "");

    if (!apiKey || !host) {
        throw new Error("Pinecone host or API key is missing.");
    }

    return { apiKey, host };
}

async function pineconeRequest<TResponse>(path: string, body: Record<string, unknown>) {
    const { apiKey, host } = getPineconeConfig();
    const response = await fetch(`${host}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Api-Key": apiKey,
            "X-Pinecone-API-Version": PINECONE_API_VERSION,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinecone request failed: ${response.status} ${errorText}`);
    }

    return (await response.json()) as TResponse;
}

async function getIndexDimension() {
    try {
        const stats = await pineconeRequest<{ dimension?: number }>("/describe_index_stats", {
            namespace: ASSISTANT_NAMESPACE,
        });
        return stats.dimension || DEFAULT_DIMENSION;
    } catch {
        return DEFAULT_DIMENSION;
    }
}

async function seedKnowledge(dimension: number) {
    const records = ASSISTANT_KNOWLEDGE.map((doc) => ({
        id: doc.id,
        values: buildDeterministicEmbedding(buildKnowledgeText(doc), dimension),
        metadata: {
            title: doc.title,
            category: doc.category,
            route: doc.route,
            text: doc.text,
        },
    }));

    await pineconeRequest("/vectors/upsert", {
        vectors: records,
        namespace: ASSISTANT_NAMESPACE,
    });
}

async function ensureKnowledge(dimension: number) {
    if (!seedPromise) {
        seedPromise = seedKnowledge(dimension).catch((error) => {
            seedPromise = null;
            throw error;
        });
    }

    await seedPromise;
}

function getCurrentPlanSummary(currentPlanId?: string) {
    const currentPlan = BUSINESS_PLANS.find((plan) => plan.id === currentPlanId) ?? BUSINESS_PLANS[0];
    return `${currentPlan.name} is the current plan. It includes ${currentPlan.jobsPerMonth}, ${currentPlan.activeJobs}, ${currentPlan.deliveryTarget}, ${currentPlan.modelLane}, and ${currentPlan.reviewDepth} review.`;
}

async function retrieveKnowledge(message: string, currentPlanId?: string) {
    const dimension = await getIndexDimension();
    await ensureKnowledge(dimension);

    const response = await pineconeRequest<{ matches?: Array<{ score?: number; metadata?: PineconeMetadata }> }>("/query", {
        vector: buildDeterministicEmbedding(`${message} ${currentPlanId || "free"} business workspace`, dimension),
        topK: 4,
        includeMetadata: true,
        namespace: ASSISTANT_NAMESPACE,
    });

    const docs: RetrievedDoc[] = [];

    for (const match of response.matches || []) {
        const metadata = match.metadata;
        if (!metadata || typeof metadata.text !== "string" || typeof metadata.title !== "string") {
            continue;
        }

        docs.push({
            score: typeof match.score === "number" ? match.score : 0,
            title: metadata.title,
            category: typeof metadata.category === "string" ? metadata.category : "overview",
            route: typeof metadata.route === "string" ? metadata.route : undefined,
            text: metadata.text,
        });
    }

    return docs.sort((left, right) => right.score - left.score);
}

function isNavigationRequest(query: string) {
    return /(^|\b)(open|go to|take me to|navigate to|show me|bring me to)\b/.test(query) || query.trim().startsWith("/");
}

function buildNavigationAction(message: string, docs: RetrievedDoc[]) {
    const query = normalizeText(message);

    if (!isNavigationRequest(query)) {
        return [];
    }

    for (const target of NAVIGATION_TARGETS) {
        if (target.keywords.some((keyword) => query.includes(keyword))) {
            return [{ type: "navigate" as const, path: target.path, label: target.label }];
        }
    }

    const routedDoc = docs.find((doc) => doc.route);
    if (routedDoc?.route) {
        const target = NAVIGATION_TARGETS.find((candidate) => candidate.path === routedDoc.route);
        return [
            {
                type: "navigate" as const,
                path: routedDoc.route,
                label: target?.label || `Open ${routedDoc.title}`,
            },
        ];
    }

    return [];
}

function buildContextBlock(docs: RetrievedDoc[], currentPath?: string, currentPlanId?: string) {
    const contextLines = docs.map(
        (doc, index) => `${index + 1}. ${doc.title}${doc.route ? ` (${doc.route})` : ""}: ${doc.text}`,
    );

    return [
        `Current page: ${currentPath || "unknown"}.`,
        `Current business plan: ${getCurrentPlanSummary(currentPlanId)}.`,
        contextLines.length > 0 ? `Retrieved business context:\n${contextLines.join("\n")}` : "Retrieved business context: none.",
    ].join("\n\n");
}

async function generateGroqReply(options: {
    message: string;
    currentPath?: string;
    currentPlanId?: string;
    history: ChatTurn[];
    docs: RetrievedDoc[];
}) {
    const groqApiKeys = getGroqApiKeys();
    if (groqApiKeys.length === 0) {
        throw new Error("No Groq API key is configured.");
    }

    const contextBlock = buildContextBlock(options.docs, options.currentPath, options.currentPlanId);
    const chatHistory = options.history.slice(-MAX_HISTORY_MESSAGES).map((entry) => ({
        role: entry.role,
        content: entry.text,
    }));

    const messages = [
        {
            role: "system",
            content:
                "You are Mesh Assist for Pantheon Mesh. Be helpful, direct, and conversational. Use the business context when it helps. If the user is unclear, ask one short follow-up question. Reply naturally to greetings and small talk. Do not invent product details, plans, pricing, or workflow behavior.",
        },
        {
            role: "system",
            content: contextBlock,
        },
        ...chatHistory,
        {
            role: "user",
            content: options.message,
        },
    ];

    for (const apiKey of groqApiKeys) {
        for (const model of GROQ_MODELS) {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    temperature: 0.35,
                    max_tokens: 280,
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
    }

    throw new Error("Groq did not return a response.");
}

function buildRetrievalFallback(message: string, docs: RetrievedDoc[], currentPlanId?: string) {
    const query = normalizeText(message);
    const currentPlan = BUSINESS_PLANS.find((plan) => plan.id === currentPlanId) ?? BUSINESS_PLANS[0];

    if (docs.length > 0) {
        const bestDoc = docs[0];
        if (query.includes("$29") || query.includes("starter")) {
            const starterPlan = BUSINESS_PLANS.find((plan) => plan.id === "starter");
            if (starterPlan) {
                return `You are currently on ${currentPlan.name}. The $29 ${starterPlan.name} plan gives ${starterPlan.jobsPerMonth}, ${starterPlan.activeJobs}, ${starterPlan.deliveryTarget} delivery, ${starterPlan.modelLane}, and ${starterPlan.biddingLane} bidding.`;
            }
        }

        return `${bestDoc.text} What are you trying to do next?`;
    }

    return `You are currently on ${currentPlan.name}. Tell me whether you want help with jobs, pricing, delivery, or finding the right page and I'll guide you from there.`;
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

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const message = typeof body?.message === "string" ? body.message.trim() : "";
        const currentPath = typeof body?.currentPath === "string" ? body.currentPath : undefined;
        const currentPlanId = typeof body?.currentPlanId === "string" ? body.currentPlanId : "free";
        const history = parseHistory(body?.messages);

        if (!message) {
            return NextResponse.json({ error: "No message provided." }, { status: 400 });
        }

        const docs: RetrievedDoc[] = await retrieveKnowledge(message, currentPlanId).catch(
            () => [] as RetrievedDoc[],
        );
        const actions = buildNavigationAction(message, docs);

        try {
            const response = await generateGroqReply({
                message,
                currentPath,
                currentPlanId,
                history,
                docs,
            });

            return NextResponse.json({ response, actions });
        } catch {
            return NextResponse.json({
                response: buildRetrievalFallback(message, docs, currentPlanId),
                actions,
            });
        }
    } catch {
        return NextResponse.json(
            { response: "Something went wrong. Please try again.", actions: [] },
            { status: 500 },
        );
    }
}
