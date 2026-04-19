import { NextResponse } from "next/server";

export async function GET(
    req: Request,
    { params }: { params: { uid: string } }
) {
    const { uid } = params;
    
    const apiBase = process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes("localhost")
        ? process.env.NEXT_PUBLIC_API_URL 
        : "https://pantheon-api-mlqrumx6cq-uc.a.run.app";
        
    const endpoint = `${apiBase}/v1/client/${uid}/jobs`;

    try {
        console.log(`Proxying GET to: ${endpoint}`);
        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend list error: ${response.status}`, errorText);
            return NextResponse.json(
                { detail: `Backend list error ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Proxy error while fetching jobs list:", error);
        return NextResponse.json(
            { detail: `The AI Network backend is unreachable. Error: ${error.message}` },
            { status: 502 }
        );
    }
}
