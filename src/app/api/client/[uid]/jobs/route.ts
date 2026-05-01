import { NextResponse } from "next/server";

type RouteContext = {
    params: Promise<{ uid: string }>;
};

export async function GET(request: Request, context: RouteContext) {
    const { uid } = await context.params;
    const url = new URL("/api/needero/v1/needs", request.url);
    url.searchParams.set("customer_id", uid);

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        return NextResponse.json(
            { requests: [], jobs: [], detail: "Live Needero feed is unavailable right now." },
            { status: response.status },
        );
    }

    const data = await response.json();
    const needs = Array.isArray(data.needs) ? data.needs : [];

    return NextResponse.json({
        requests: needs,
        jobs: needs.map((request: Record<string, unknown>) => ({
            id: request.id,
            title: request.title,
            description: request.description,
            budget_npr: 0,
            status: request.status,
            created_at: request.created_at,
        })),
        detail: "Live Needero phone repair Need feed.",
    });
}
