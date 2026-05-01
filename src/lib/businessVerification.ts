export type BusinessVerificationStatus = "not_started" | "pending" | "manual_review" | "approved" | "rejected";

export type BusinessVerificationDecision = "approve" | "manual_review" | "reject";

export type BusinessVerificationSource = {
    title: string;
    url: string;
    content?: string;
    score?: number;
    query?: string;
};

export type BusinessVerificationSubmission = {
    uid: string;
    businessName: string;
    ownerName: string;
    phoneNumber: string;
    phoneVerified: boolean;
    email: string;
    category: string;
    address: string;
    city: string;
    country: string;
    coordinates?: { lat: number; lng: number } | null;
    logoUrl?: string | null;
    shopFrontPhoto?: string | null;
    insideShopPhoto?: string | null;
    documentUrl?: string | null;
    socialLinks?: string[];
    googleMapsUrl?: string | null;
};

export type BusinessVerificationResult = {
    status: BusinessVerificationStatus;
    decision: BusinessVerificationDecision;
    confidence: number;
    score: number;
    webPresenceFound: boolean;
    matchedName: boolean;
    matchedPhone: boolean;
    matchedAddress: boolean;
    locationMatch: "High" | "Medium" | "Low";
    reasons: string[];
    riskFlags: string[];
    badges: string[];
    sources: BusinessVerificationSource[];
    model?: string;
    aiProvider: "deepseek" | "local_fallback";
    reviewedAt: number;
};

async function readError(response: Response, fallback: string) {
    const text = await response.text().catch(() => "");
    if (!text) return fallback;

    try {
        const data = JSON.parse(text) as { error?: string; detail?: string; message?: string };
        return data.error || data.detail || data.message || fallback;
    } catch {
        return text.slice(0, 180) || fallback;
    }
}

export async function requestBusinessVerification(input: BusinessVerificationSubmission) {
    const response = await fetch("/api/business-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
    });

    if (!response.ok) {
        throw new Error(await readError(response, "Business verification could not run right now."));
    }

    return (await response.json()) as BusinessVerificationResult;
}

export function isBusinessVerificationApproved(profile?: { businessVerified?: boolean | null; businessVerificationStatus?: string | null } | null) {
    return Boolean(profile?.businessVerified || profile?.businessVerificationStatus === "approved");
}

export function businessVerificationStatusLabel(status?: string | null) {
    switch (status) {
        case "approved":
            return "Business verified";
        case "manual_review":
            return "Manual review";
        case "pending":
            return "Verification pending";
        case "rejected":
            return "Needs more proof";
        default:
            return "Not verified";
    }
}
