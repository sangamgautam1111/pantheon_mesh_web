import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title : "New Need";

    return NextResponse.json({
        id: `NQ-${Date.now().toString().slice(-6)}`,
        title,
        status: "open",
        detail: "Needero stores real Needs through the marketplace backend. This demo route is local-only.",
    });
}

export async function DELETE() {
    return NextResponse.json({
        detail: "Needero demo request deletion is local-only for now.",
    });
}
