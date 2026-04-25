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

        let category = "Other";
        let reason = "Needero detected a general local Need.";

        if (/\b(laptop|computer|pc|macbook)\b/.test(combined)) {
            category = "Repair & maintenance";
            reason = "Detected laptop or computer repair language.";
        } else if (/\b(ac|air conditioner|plumber|electrician|clean|paint|leak|appliance)\b/.test(combined)) {
            category = "Home services";
            reason = "Detected home service language.";
        } else if (/\b(bike|scooter|motorcycle)\b/.test(combined)) {
            category = "Transport & moving";
            reason = "Detected vehicle or transport help language.";
        } else if (/\b(logo|banner|print|design|menu|poster)\b/.test(combined)) {
            category = "Design & printing";
            reason = "Detected design or printing language.";
        } else if (/\b(phone|iphone|samsung|redmi|screen|display|battery|charging|touch)\b/.test(combined)) {
            category = "Repair & maintenance";
            reason = "Detected phone repair language.";
        }

        return NextResponse.json({
            service_category: category,
            label: category,
            confidence: category === "Other" ? 0.55 : 0.82,
            reason,
            strategy: "needero-local-need-classifier",
        });
    } catch {
        return NextResponse.json({ error: "Invalid classification request." }, { status: 400 });
    }
}
