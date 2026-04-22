import { NextResponse } from "next/server";
import {
    WORK_CATEGORY_LABELS,
    detectWorkCategory,
    type WorkCategoryId,
} from "@/lib/modelGroups";

export const runtime = "nodejs";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_CLASSIFIER_MODEL = process.env.DEEPSEEK_CLASSIFIER_MODEL || "deepseek-reasoner";
const DEEPSEEK_CLASSIFIER_FALLBACK = "deepseek-chat";
const WORK_CATEGORIES: WorkCategoryId[] = ["development", "media", "writing", "design", "automation"];

function isWorkCategoryId(value: unknown): value is WorkCategoryId {
    return typeof value === "string" && WORK_CATEGORIES.includes(value as WorkCategoryId);
}

function getStringArray(value: unknown) {
    return Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim()))
        : [];
}

function numberFrom(value: unknown, fallback = 0) {
    const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanJsonObject(text: string) {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    return start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
}

async function fetchDeepSeekClassification(systemPrompt: string, userPrompt: string, apiKey: string) {
    let lastError: Error | null = null;

    for (const model of [DEEPSEEK_CLASSIFIER_MODEL, DEEPSEEK_CLASSIFIER_FALLBACK]) {
        const isReasoner = model === "deepseek-reasoner";
        const payload: Record<string, unknown> = {
            model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            max_tokens: isReasoner ? 520 : 260,
            response_format: { type: "json_object" },
        };

        if (!isReasoner) {
            payload.temperature = 0.1;
        }

        try {
            const response = await fetch(DEEPSEEK_API_URL, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
                cache: "no-store",
            });

            if (!response.ok) {
                lastError = new Error(`DeepSeek ${model}: ${response.status}`);
                continue;
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;
            if (typeof content === "string" && content.trim()) {
                return { content, model };
            }

            lastError = new Error(`DeepSeek ${model}: empty response`);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
        }
    }

    throw lastError || new Error("DeepSeek classification failed.");
}

function fallbackClassification(body: Record<string, unknown>) {
    const title = typeof body.title === "string" ? body.title : "";
    const description = typeof body.description === "string" ? body.description : "";
    const assetTypes = getStringArray(body.asset_types);
    const assetLinks = getStringArray(body.asset_links);
    const assetTotalMb = numberFrom(body.asset_total_mb, 0);
    const workCategory = detectWorkCategory({ title, description, assetTypes, assetLinks, assetTotalMb });

    return {
        work_category: workCategory,
        label: WORK_CATEGORY_LABELS[workCategory],
        confidence: 0.62,
        reason: "Routed by local context because DeepSeek classification was unavailable.",
        strategy: "local-contextual-fallback",
    };
}

export async function POST(req: Request) {
    let body: Record<string, unknown> = {};
    try {
        body = (await req.json()) as Record<string, unknown>;
        const title = typeof body.title === "string" ? body.title.trim() : "";
        const description = typeof body.description === "string" ? body.description.trim() : "";

        if (!title || !description) {
            return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
        }

        const fallback = fallbackClassification(body);
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey) {
            return NextResponse.json(fallback);
        }

        const assetTypes = getStringArray(body.asset_types);
        const assetLinks = getStringArray(body.asset_links);
        const assetTotalMb = numberFrom(body.asset_total_mb, 0);
        const assetCount = numberFrom(body.asset_count, 0);

        const systemPrompt = `You are Pantheon Mesh's job routing classifier.
Choose exactly one work_category id:
- development: software, code, apps, websites, debugging, repositories.
- media: direct media editing, video/audio/VFX/rendering as the main task.
- writing: copy, SEO, articles, decks, research writing.
- design: logos, UI/UX, branding, visual assets.
- automation: workflows, data pipelines, API orchestration, scraping, scheduling, webhooks, tool-to-tool systems.

Classify the primary deliverable, not isolated nouns.
If the job builds an automated workflow/pipeline that connects tools or APIs, choose automation even when the output is a video, post, image, or report.
Choose media only when the client mainly wants creative video/audio editing or generation, not an automated tool chain.
Return JSON only: {"work_category":"development|media|writing|design|automation","confidence":0-1,"reason":"short routing reason"}.`;

        const userPrompt = [
            `Title: ${title}`,
            `Requirements: ${description}`,
            `Asset types: ${assetTypes.join(", ") || "none"}`,
            `Asset links: ${assetLinks.length}`,
            `Asset count: ${assetCount}`,
            `Asset size MB: ${assetTotalMb}`,
        ].join("\n");

        const result = await fetchDeepSeekClassification(systemPrompt, userPrompt, apiKey);
        const parsed = JSON.parse(cleanJsonObject(result.content)) as Record<string, unknown>;
        const workCategory = isWorkCategoryId(parsed.work_category) ? parsed.work_category : fallback.work_category;
        const confidence = numberFrom(parsed.confidence, fallback.confidence);
        const reason = typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim() : fallback.reason;

        return NextResponse.json({
            work_category: workCategory,
            label: WORK_CATEGORY_LABELS[workCategory],
            confidence: Math.max(0, Math.min(1, confidence)),
            reason,
            strategy: result.model === "deepseek-reasoner" ? "deepseek-r1-classifier" : "deepseek-v3-classifier",
            fallback_work_category: fallback.work_category,
        });
    } catch (error) {
        console.error("Job classification failed:", error);
        return NextResponse.json(fallbackClassification(body));
    }
}
