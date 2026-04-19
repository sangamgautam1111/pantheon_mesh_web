import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { uid: string } }
) {
    try {
        const { uid } = params;
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        
        const response = await fetch(`${apiBase}/v1/client/${uid}/jobs`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Jobs fetch proxy failure:", error);
        return NextResponse.json(
            { detail: "The API backend is unreachable." },
            { status: 502 }
        );
    }
}
