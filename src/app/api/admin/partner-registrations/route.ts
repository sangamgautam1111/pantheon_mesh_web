import { NextRequest, NextResponse } from "next/server";
import { applicationDefault, cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

export const runtime = "nodejs";

const DATABASE_URL = (process.env.FIREBASE_DATABASE_URL || "https://pantheon-mesh-default-rtdb.firebaseio.com").replace(/\/$/, "");

const allowedTypes = new Set(["repairShop", "homeService"]);
type RegistrationType = "repairShop" | "homeService";

function adminPassword() {
    return process.env.NEEDERO_ADMIN_PASSWORD || "";
}

function verifyPassword(value: unknown) {
    const configured = adminPassword();
    return Boolean(configured && typeof value === "string" && value === configured);
}

function parseServiceAccount(raw: string): ServiceAccount | null {
    const trimmed = raw.trim();
    if (!trimmed) {
        return null;
    }

    const jsonText = trimmed.startsWith("{") ? trimmed : Buffer.from(trimmed, "base64").toString("utf8");
    const parsed = JSON.parse(jsonText) as Record<string, string>;
    return {
        projectId: parsed.project_id || parsed.projectId,
        clientEmail: parsed.client_email || parsed.clientEmail,
        privateKey: (parsed.private_key || parsed.privateKey || "").replace(/\\n/g, "\n"),
    };
}

function serviceAccountFromEnv() {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY || process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT || "";
    if (rawServiceAccount) {
        return parseServiceAccount(rawServiceAccount);
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
    if (projectId && clientEmail && privateKey) {
        return { projectId, clientEmail, privateKey };
    }

    return null;
}

function adminDb() {
    if (!getApps().length) {
        const serviceAccount = serviceAccountFromEnv();
        initializeApp({
            credential: serviceAccount ? cert(serviceAccount) : applicationDefault(),
            databaseURL: DATABASE_URL,
        });
    }

    return getDatabase();
}

async function readRegistrations(type: RegistrationType) {
    const snapshot = await adminDb().ref(`partnerRegistrations/${type}`).get();
    const data = snapshot.val();
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

        await adminDb().ref(`partnerRegistrations/${type}/${id}`).update({
            status,
            adminNote: typeof body?.adminNote === "string" ? body.adminNote : "",
            reviewedAt: new Date().toISOString(),
            reviewedBy: "needero-admin",
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Could not update registration." },
            { status: 500 },
        );
    }
}
