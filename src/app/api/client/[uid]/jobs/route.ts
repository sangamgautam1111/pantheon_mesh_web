import { NextResponse } from "next/server";
import { SAMPLE_NEEDS } from "@/lib/nearquote";

export async function GET() {
    return NextResponse.json({
        requests: SAMPLE_NEEDS,
        jobs: SAMPLE_NEEDS.map((request) => ({
            id: request.id,
            title: request.title,
            description: request.issue,
            budget_usd: 0,
            status: request.status,
            created_at: new Date().toISOString(),
        })),
        detail: "Needero demo Need feed.",
    });
}
