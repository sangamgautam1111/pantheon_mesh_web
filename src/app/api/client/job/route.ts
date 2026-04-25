import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title : "Phone repair request";

    return NextResponse.json({
        id: `NQ-${Date.now().toString().slice(-6)}`,
        title,
        status: "open",
        detail: "Needaro MVP stores demo requests locally until the real marketplace database is connected.",
    });
}

export async function DELETE() {
    return NextResponse.json({
        detail: "Needaro MVP demo request deletion is local-only for now.",
    });
}
