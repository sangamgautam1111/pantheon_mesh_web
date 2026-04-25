import { NextResponse } from "next/server";

export const runtime = "nodejs";

function getText(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as Record<string, unknown>;
        const description = getText(body.description || body.requirements || body.problem);
        const location = getText(body.location);
        const urgency = getText(body.urgency);
        const lower = description.toLowerCase();

        const quoteType = lower.includes("screen") || lower.includes("display")
            ? "repair quote"
            : lower.includes("logo") || lower.includes("design")
              ? "design quote"
              : lower.includes("clean") || lower.includes("leak") || lower.includes("ac")
                ? "home service quote"
                : "local service quote";

        return NextResponse.json({
            service_category: "Local Need",
            quote_type: quoteType,
            customer_pays_platform: 0,
            customer_payment_note: "Customers do not pay Needero. The customer pays the chosen business directly.",
            request_quality: {
                has_location: Boolean(location),
                has_urgency: Boolean(urgency),
                has_clear_problem: description.length >= 12,
            },
        });
    } catch {
        return NextResponse.json({ error: "Invalid estimate request." }, { status: 400 });
    }
}
