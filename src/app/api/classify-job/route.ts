import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getText(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Record<string, unknown>;
        const title = getText(body.title);
        const description = getText(body.description);
        const combined = `${title} ${description}`.toLowerCase();

        if (!title && !description) {
            return NextResponse.json({ error: "A request title or description is required." }, { status: 400 });
        }

        const isMobileRepair = /\b(phone|iphone|samsung|redmi|screen|display|battery|charging|touch|camera|speaker|mic|water|mobile)\b/.test(combined);
        const isCleaning = /\b(clean|cleaning|deep clean|bathroom|kitchen|sofa|carpet|maid|house|home|office)\b/.test(combined);
        const category = isMobileRepair && !isCleaning ? "Mobile Repair" : "Home Cleaning";
        const reason = isMobileRepair && !isCleaning
            ? "Detected mobile repair language."
            : "Detected home cleaning language or defaulted to the first MVP category.";

        return NextResponse.json({
            service_category: category,
            label: category,
            confidence: 0.92,
            reason,
            strategy: "needero-two-category-mvp-classifier",
        });
    } catch {
        return NextResponse.json({ error: "Invalid classification request." }, { status: 400 });
    }
}
