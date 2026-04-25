import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ProxyContext = {
    params: Promise<{ path?: string[] }>;
};

const DEFAULT_BACKEND_URL = "https://pantheon-api-mlqrumx6cq-uc.a.run.app";

const getBackendBaseUrl = () => {
    const raw =
        process.env.API_URL ||
        process.env.NEEDERO_API_URL ||
        process.env.NEXT_PUBLIC_API_URL ||
        DEFAULT_BACKEND_URL;

    return raw.replace(/\/+$/, "");
};

async function forward(request: NextRequest, context: ProxyContext) {
    const { path = [] } = await context.params;
    const targetUrl = new URL(`${getBackendBaseUrl()}/${path.join("/")}`);
    request.nextUrl.searchParams.forEach((value, key) => {
        targetUrl.searchParams.set(key, value);
    });

    const headers = new Headers();
    const contentType = request.headers.get("content-type");
    if (contentType) {
        headers.set("content-type", contentType);
    }

    try {
        const upstream = await fetch(targetUrl, {
            method: request.method,
            headers,
            body: request.method === "GET" || request.method === "HEAD" ? undefined : await request.text(),
            cache: "no-store",
        });

        const body = await upstream.text();
        const responseContentType = upstream.headers.get("content-type") || "application/json";

        return new NextResponse(body, {
            status: upstream.status,
            headers: {
                "content-type": responseContentType,
            },
        });
    } catch (error) {
        console.error("Needero backend proxy failed:", error);
        return NextResponse.json(
            {
                error: "Needero backend is unavailable right now. Please try again in a moment.",
            },
            { status: 502 },
        );
    }
}

export { forward as DELETE, forward as GET, forward as PATCH, forward as POST, forward as PUT };
