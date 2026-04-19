import { NextResponse } from "next/server";

export async function POST(req: Request) {
    // Force the production URL if NEXT_PUBLIC_API_URL is missing or local in a production build
    const apiBase = process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")
        ? process.env.NEXT_PUBLIC_API_URL 
        : "https://pantheon-api-mlqrumx6cq-uc.a.run.app";
    
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
