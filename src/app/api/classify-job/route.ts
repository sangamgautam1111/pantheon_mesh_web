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

        let category = "Phone repair";
        let reason = "Needaro MVP defaults to phone repair in one city.";

        if (/\b(laptop|computer|pc|macbook)\b/.test(combined)) {
            category = "Laptop repair";
            reason = "Detected laptop/computer repair language. This is a later expansion category.";
        } else if (/\b(bike|scooter|motorcycle)\b/.test(combined)) {
            category = "Bike or scooter repair";
            reason = "Detected vehicle repair language. This is a later expansion category.";
        } else if (/\b(phone|iphone|samsung|redmi|screen|display|battery|charging|touch)\b/.test(combined)) {
            category = "Phone repair";
            reason = "Detected phone repair issue suitable for the first Needaro niche.";
        }

        return NextResponse.json({
            service_category: category,
            label: category,
            confidence: category === "Phone repair" ? 0.86 : 0.62,
            reason,
            strategy: "needaro-local-service-classifier",
        });
    } catch {
        return NextResponse.json({ error: "Invalid classification request." }, { status: 400 });
    }
}
