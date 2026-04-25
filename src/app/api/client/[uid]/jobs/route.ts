import { NextResponse } from "next/server";
import { PHONE_REPAIR_REQUESTS } from "@/lib/nearquote";

export async function GET() {
    return NextResponse.json({
        requests: PHONE_REPAIR_REQUESTS,
        jobs: PHONE_REPAIR_REQUESTS.map((request) => ({
            id: request.id,
            title: request.title,
            description: request.issue,
            budget_usd: 0,
            status: request.status,
            created_at: new Date().toISOString(),
        })),
        detail: "Needaro MVP demo request feed.",
    });
}
