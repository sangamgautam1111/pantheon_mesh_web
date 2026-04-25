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

        const repairType = lower.includes("screen") || lower.includes("display")
            ? "screen/display repair"
            : lower.includes("battery")
              ? "battery repair"
              : lower.includes("charge")
                ? "charging repair"
                : "phone diagnosis";

        return NextResponse.json({
            service_category: "Phone repair",
            quote_type: repairType,
            customer_pays_platform: 0,
            business_lead_fee_idea_npr: "Rs. 20 - Rs. 100 after chosen offer",
            customer_payment_note: "For MVP, customer pays the shop directly. Needaro does not collect repair payment.",
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
