import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const DB_URL = (process.env.FIREBASE_DATABASE_URL || "https://pantheon-mesh-default-rtdb.firebaseio.com").replace(/\/$/, "");
const DB_AUTH = process.env.FIREBASE_DATABASE_SECRET || process.env.NEEDERO_FIREBASE_DATABASE_AUTH || "";

const allowedTypes = new Set(["repairShop", "homeService"]);

function adminPassword() {
    return process.env.NEEDERO_ADMIN_PASSWORD || "";
}

function verifyPassword(value: unknown) {
    const configured = adminPassword();
    return Boolean(configured && typeof value === "string" && value === configured);
}

function firebaseUrl(path: string) {
    const authQuery = DB_AUTH ? `?auth=${encodeURIComponent(DB_AUTH)}` : "";
    return `${DB_URL}/${path}.json${authQuery}`;
}

async function readRegistrations(type: "repairShop" | "homeService") {
    const response = await fetch(firebaseUrl(`partnerRegistrations/${type}`), { cache: "no-store" });
    if (!response.ok) {
        throw new Error(`Firebase read failed for ${type}: ${response.status}`);
    }
    const data = await response.json();
    if (!data || typeof data !== "object") {
        return [];
    }
    return Object.entries(data as Record<string, Record<string, unknown>>).map(([id, value]) => ({
        id,
        type,
        registrationType: type === "repairShop" ? "Repair Shop" : "Home Service",
        data: value || {},
    }));
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        if (!adminPassword()) {
            return NextResponse.json({ error: "NEEDERO_ADMIN_PASSWORD is not configured." }, { status: 503 });
        }
        if (!verifyPassword(body?.password)) {
            return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
        }

        const [repairShops, homeServices] = await Promise.all([
            readRegistrations("repairShop"),
            readRegistrations("homeService"),
        ]);

        const registrations = [...repairShops, ...homeServices].sort((left, right) => {
            const leftTime = Date.parse(String(left.data.createdAt || ""));
            const rightTime = Date.parse(String(right.data.createdAt || ""));
            return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
        });

        return NextResponse.json({ registrations });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Could not load partner registrations." },
            { status: 500 },
        );
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        if (!adminPassword()) {
            return NextResponse.json({ error: "NEEDERO_ADMIN_PASSWORD is not configured." }, { status: 503 });
        }
        if (!verifyPassword(body?.password)) {
            return NextResponse.json({ error: "Invalid admin password." }, { status: 401 });
        }

        const type = String(body?.type || "");
        const id = String(body?.id || "");
        const status = String(body?.status || "");
        if (!allowedTypes.has(type) || !id) {
            return NextResponse.json({ error: "Invalid registration target." }, { status: 400 });
        }
        if (!["pending", "approved", "rejected", "manual_review"].includes(status)) {
            return NextResponse.json({ error: "Invalid status." }, { status: 400 });
        }

        const response = await fetch(firebaseUrl(`partnerRegistrations/${type}/${id}`), {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                status,
                adminNote: typeof body?.adminNote === "string" ? body.adminNote : "",
                reviewedAt: new Date().toISOString(),
                reviewedBy: "needero-admin",
            }),
        });
        if (!response.ok) {
            throw new Error(`Firebase update failed: ${response.status}`);
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Could not update registration." },
            { status: 500 },
        );
    }
}
