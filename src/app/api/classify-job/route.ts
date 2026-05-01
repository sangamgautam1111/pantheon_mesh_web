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

        const category = "Phone Repair";
        const reason = /\b(phone|iphone|samsung|redmi|screen|display|battery|charging|touch|camera|speaker|mic|water)\b/.test(combined)
            ? "Detected phone repair language."
            : "Needero MVP accepts phone repair Needs only.";

        return NextResponse.json({
            service_category: category,
            label: category,
            confidence: 0.92,
            reason,
            strategy: "needero-phone-repair-mvp-classifier",
        });
    } catch {
        return NextResponse.json({ error: "Invalid classification request." }, { status: 400 });
    }
}
