import { NextResponse } from "next/server";

function getApiBase() {
    return process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")
        : "https://pantheon-api-mlqrumx6cq-uc.a.run.app";
}

export async function POST(req: Request) {
    // Force the production URL if NEXT_PUBLIC_API_URL is missing or local in a production build
    const apiBase = getApiBase();
    
    const endpoint = `${apiBase}/v1/client/job`;

    try {
        const body = await req.json();
        console.log(`Proxying POST to: ${endpoint}`);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend responded with error: ${response.status}`, errorText);
            return NextResponse.json(
                { detail: `Backend error ${response.status}: ${errorText}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Proxy error while reaching backend:", error);
        return NextResponse.json(
            { detail: `The AI Network backend at ${apiBase} is currently unreachable. Error: ${error.message}` },
            { status: 502 }
        );
    }
}

export async function DELETE(req: Request) {
    const apiBase = getApiBase();
    const url = new URL(req.url);
    const jobId = url.searchParams.get("job_id");
    const uid = url.searchParams.get("uid");

    if (!jobId || !uid) {
        return NextResponse.json(
            { detail: "job_id and uid are required." },
            { status: 400 },
        );
    }

    const endpoint = `${apiBase}/v1/client/job/${encodeURIComponent(jobId)}?uid=${encodeURIComponent(uid)}`;

    try {
        const response = await fetch(endpoint, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { detail: `Backend delete error ${response.status}: ${errorText}` },
                { status: response.status },
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { detail: `The AI Network backend at ${apiBase} is currently unreachable. Error: ${error.message}` },
            { status: 502 },
        );
    }
}
