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
            ? "screen repair quote"
            : lower.includes("battery")
              ? "battery repair quote"
              : lower.includes("charging") || lower.includes("port")
                ? "charging repair quote"
                : "phone repair quote";

        return NextResponse.json({
            service_category: "Phone Repair",
            quote_type: quoteType,
            customer_pays_platform: 0,
            customer_payment_note: "Customers post free during the MVP. The customer pays the chosen repair shop directly in NPR.",
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
