import { NextResponse } from "next/server";
import type {
    BusinessVerificationDecision,
    BusinessVerificationResult,
    BusinessVerificationSource,
    BusinessVerificationSubmission,
} from "@/lib/businessVerification";

export const runtime = "nodejs";

const TAVILY_SEARCH_URL = "https://api.tavily.com/search";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_BUSINESS_VERIFIER_MODEL || process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

type WebCheck = {
    webPresenceFound: boolean;
    matchedName: boolean;
    matchedPhone: boolean;
    matchedAddress: boolean;
    socialPageFound: boolean;
    locationMatch: "High" | "Medium" | "Low";
};

type LocalEvidence = WebCheck & {
    score: number;
    reasons: string[];
    riskFlags: string[];
    missingFields: string[];
};

type DeepSeekDecision = {
    decision?: BusinessVerificationDecision;
    confidence?: number;
    reasons?: string[];
    riskFlags?: string[];
};

function getText(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function getStringList(value: unknown) {
    return Array.isArray(value) ? value.map((item) => getText(item)).filter(Boolean).slice(0, 8) : [];
}

function getCoordinates(value: unknown) {
    if (!value || typeof value !== "object") return null;
    const data = value as { lat?: unknown; lng?: unknown };
    const lat = Number(data.lat);
    const lng = Number(data.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
    return { lat, lng };
}

function normalizeSubmission(body: Record<string, unknown>): BusinessVerificationSubmission {
    return {
        uid: getText(body.uid),
        businessName: getText(body.businessName),
        ownerName: getText(body.ownerName),
        phoneNumber: getText(body.phoneNumber),
        phoneVerified: Boolean(body.phoneVerified),
        email: getText(body.email),
        category: getText(body.category),
        address: getText(body.address),
        city: getText(body.city),
        country: getText(body.country),
        coordinates: getCoordinates(body.coordinates),
        logoUrl: getText(body.logoUrl) || null,
        shopFrontPhoto: getText(body.shopFrontPhoto) || null,
        insideShopPhoto: getText(body.insideShopPhoto) || null,
        documentUrl: getText(body.documentUrl) || null,
        socialLinks: getStringList(body.socialLinks),
        googleMapsUrl: getText(body.googleMapsUrl) || null,
    };
}

function normalizeText(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9+]+/g, " ").replace(/\s+/g, " ").trim();
}

function normalizePhone(value: string) {
    return value.replace(/[^\d]/g, "");
}

function hasUsefulMatch(haystack: string, needle: string) {
    const text = normalizeText(haystack);
    const tokens = normalizeText(needle).split(" ").filter((token) => token.length >= 3);
    if (tokens.length === 0) return false;
    const matches = tokens.filter((token) => text.includes(token)).length;
    return matches >= Math.min(2, tokens.length);
}

function validateRequired(input: BusinessVerificationSubmission) {
    const missing: string[] = [];
    if (!input.uid) missing.push("Signed-in user");
    if (!input.businessName) missing.push("Business name");
    if (!input.ownerName) missing.push("Owner name");
    if (!input.phoneVerified) missing.push("Verified phone number");
    if (!input.phoneNumber || normalizePhone(input.phoneNumber).length < 8) missing.push("Phone number");
    if (!input.email) missing.push("Email");
    if (!input.category) missing.push("Business category");
    if (!input.address) missing.push("Shop address");
    if (!input.city || !input.country) missing.push("City and country");
    if (!input.coordinates) missing.push("Map pin");
    if (!input.logoUrl) missing.push("Business logo");
    if (!input.shopFrontPhoto) missing.push("Shop front photo");
    if (!input.insideShopPhoto) missing.push("Inside shop photo");
    return missing;
}

function buildQueries(input: BusinessVerificationSubmission) {
    const category = input.category || "phone repair";
    return [
        `"${input.businessName}" "${input.city}" ${category}`,
        `"${input.businessName}" "${input.address}"`,
        `"${input.phoneNumber}" "${input.businessName}"`,
        `"${input.businessName}" Google Maps`,
    ];
}

async function searchTavily(query: string, apiKey: string) {
    const response = await fetch(TAVILY_SEARCH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            query,
            search_depth: "basic",
            max_results: 3,
            include_answer: false,
            include_raw_content: false,
            topic: "general",
        }),
    });

    if (!response.ok) {
        throw new Error(`Tavily search failed with ${response.status}`);
    }

    const data = await response.json() as { results?: Array<Record<string, unknown>> };
    return (data.results || []).map((result) => ({
        title: getText(result.title) || "Untitled result",
        url: getText(result.url),
        content: getText(result.content).slice(0, 600),
        score: typeof result.score === "number" ? result.score : undefined,
        query,
    })).filter((source) => source.url);
}

async function collectWebSources(input: BusinessVerificationSubmission) {
    const apiKey = process.env.TAVILY_API_KEY || "";
    if (!apiKey) {
        return { sources: [] as BusinessVerificationSource[], searchError: "Tavily API key is not configured." };
    }

    const settled = await Promise.allSettled(buildQueries(input).map((query) => searchTavily(query, apiKey)));
    const searchError = settled.find((item) => item.status === "rejected") ? "One or more Tavily searches failed." : "";
    const seen = new Set<string>();
    const sources: BusinessVerificationSource[] = [];

    for (const item of settled) {
        if (item.status !== "fulfilled") continue;
        for (const source of item.value) {
            if (seen.has(source.url)) continue;
            seen.add(source.url);
            sources.push(source);
        }
    }

    return { sources: sources.slice(0, 10), searchError };
}

function evaluateWebEvidence(input: BusinessVerificationSubmission, sources: BusinessVerificationSource[]): WebCheck {
    const sourceText = sources.map((source) => `${source.title} ${source.url} ${source.content || ""}`).join("\n");
    const matchedName = hasUsefulMatch(sourceText, input.businessName);
    const phoneDigits = normalizePhone(input.phoneNumber);
    const matchedPhone = Boolean(phoneDigits && normalizePhone(sourceText).includes(phoneDigits));
    const matchedAddress = Boolean(input.address && hasUsefulMatch(sourceText, input.address));
    const matchedCity = Boolean(input.city && hasUsefulMatch(sourceText, input.city));
    const matchedCountry = Boolean(input.country && hasUsefulMatch(sourceText, input.country));
    const socialPageFound = sources.some((source) => /facebook|instagram|linkedin|tiktok|google\.[^/]+\/maps|maps\.app\.goo\.gl/i.test(source.url));
    const locationMatch: WebCheck["locationMatch"] =
        matchedAddress || (matchedCity && matchedCountry)
            ? "High"
            : matchedCity || matchedCountry
              ? "Medium"
              : "Low";

    return {
        webPresenceFound: sources.length > 0 && matchedName,
        matchedName,
        matchedPhone,
        matchedAddress,
        socialPageFound,
        locationMatch,
    };
}

function scoreEvidence(input: BusinessVerificationSubmission, web: WebCheck, missingFields: string[]): LocalEvidence {
    const reasons: string[] = [];
    const riskFlags: string[] = [];
    let score = 0;

    if (input.phoneVerified) {
        score += 20;
        reasons.push("Phone number verified by OTP.");
    }
    if (input.email) {
        score += 10;
        reasons.push("Email is attached to the profile.");
    }
    if (input.shopFrontPhoto && input.insideShopPhoto) {
        score += 15;
        reasons.push("Shop front and inside shop photos were submitted.");
        riskFlags.push("Image authenticity still needs OCR/vision or manual review before guarantee-level trust.");
    }
    if (web.matchedName && web.matchedPhone) {
        score += 20;
        reasons.push("Public web evidence matches business name and phone.");
    } else if (web.webPresenceFound) {
        score += 12;
        reasons.push("Public web presence found for the business name.");
    }
    if (web.locationMatch === "High") {
        score += 15;
        reasons.push("Location appears consistent with web evidence.");
    } else if (web.locationMatch === "Medium") {
        score += 8;
        reasons.push("City or country matches public web evidence.");
    }
    if (web.socialPageFound || input.socialLinks?.length || input.googleMapsUrl) {
        score += 10;
        reasons.push("Social or Google Maps evidence was provided or found.");
    }
    if (input.documentUrl) {
        score += 20;
        reasons.push("Optional business document/license was uploaded.");
    }

    if (!web.webPresenceFound) riskFlags.push("No strong public web listing was found.");
    if (!web.matchedPhone) riskFlags.push("Phone number did not match public web results.");
    if (!web.matchedAddress) riskFlags.push("Address did not match public web results.");
    if (missingFields.length) riskFlags.push(`Missing required fields: ${missingFields.join(", ")}.`);

    return {
        ...web,
        score: Math.min(score, 100),
        reasons,
        riskFlags,
        missingFields,
    };
}

function localDecision(evidence: LocalEvidence): BusinessVerificationDecision {
    if (evidence.missingFields.length) return "reject";
    if (evidence.score >= 80 && evidence.riskFlags.length <= 1) return "approve";
    if (evidence.score >= 50) return "manual_review";
    return "reject";
}

function parseDeepSeekJson(content: string): DeepSeekDecision {
    const clean = content
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
    return JSON.parse(clean) as DeepSeekDecision;
}

async function askDeepSeek(input: BusinessVerificationSubmission, evidence: LocalEvidence, sources: BusinessVerificationSource[]) {
    const apiKey = process.env.DEEPSEEK_API_KEY || "";
    if (!apiKey) {
        throw new Error("DeepSeek API key is not configured.");
    }

    const evidenceForAi = {
        businessProfile: {
            businessName: input.businessName,
            ownerName: input.ownerName,
            phoneNumber: input.phoneNumber,
            email: input.email,
            category: input.category,
            address: input.address,
            city: input.city,
            country: input.country,
            coordinatesPresent: Boolean(input.coordinates),
            logoSubmitted: Boolean(input.logoUrl),
            shopFrontPhotoSubmitted: Boolean(input.shopFrontPhoto),
            insideShopPhotoSubmitted: Boolean(input.insideShopPhoto),
            documentUploaded: Boolean(input.documentUrl),
            socialLinks: input.socialLinks,
            googleMapsUrl: input.googleMapsUrl,
        },
        webResults: sources.map((source) => ({
            title: source.title,
            url: source.url,
            content: source.content,
            query: source.query,
        })),
        checks: evidence,
        scoringRules: {
            approve: "80-100 with low risk",
            manual_review: "50-79 or meaningful risk flags",
            reject: "under 50 or required fields missing",
        },
    };

    const systemPrompt = `You are Needero's AI-assisted business verification reviewer.
AI is not allowed to guarantee truth. You review structured evidence, flag risk, and return strict json only.
Use this exact json shape:
{
  "decision": "approve | manual_review | reject",
  "confidence": 82,
  "reasons": ["short reason"],
  "riskFlags": ["short risk flag"]
}
Prefer manual_review when evidence is plausible but images, address, or web evidence are uncertain. Reject when required evidence is missing.`;

    const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: DEEPSEEK_MODEL,
            response_format: { type: "json_object" },
            max_tokens: 900,
            thinking: { type: "enabled" },
            reasoning_effort: "high",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Return json for this verification evidence:\n${JSON.stringify(evidenceForAi)}` },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`DeepSeek failed with ${response.status}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: unknown } }> };
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
        throw new Error("DeepSeek returned empty content.");
    }
    return parseDeepSeekJson(content);
}

function toStatus(decision: BusinessVerificationDecision): BusinessVerificationResult["status"] {
    if (decision === "approve") return "approved";
    if (decision === "manual_review") return "manual_review";
    return "rejected";
}

function normalizeDecision(value: unknown): BusinessVerificationDecision | null {
    return value === "approve" || value === "manual_review" || value === "reject" ? value : null;
}

function buildBadges(status: BusinessVerificationResult["status"], input: BusinessVerificationSubmission, evidence: LocalEvidence) {
    const badges = ["Basic Verified"];
    if (input.phoneVerified && evidence.locationMatch !== "Low") badges.push("Location Verified");
    if (status === "approved") badges.push("Business Verified");
    return badges;
}

export async function POST(req: Request) {
    try {
        const body = await req.json() as Record<string, unknown>;
        const input = normalizeSubmission(body);
        const missingFields = validateRequired(input);
        const { sources, searchError } = await collectWebSources(input);
        const web = evaluateWebEvidence(input, sources);
        const localEvidence = scoreEvidence(input, web, missingFields);
        if (searchError) localEvidence.riskFlags.push(searchError);

        let decision = localDecision(localEvidence);
        let confidence = Math.max(25, Math.min(92, localEvidence.score));
        let aiProvider: BusinessVerificationResult["aiProvider"] = "local_fallback";
        let aiReasons: string[] = [];
        let aiRiskFlags: string[] = [];

        if (!missingFields.length) {
            try {
                const ai = await askDeepSeek(input, localEvidence, sources);
                decision = normalizeDecision(ai.decision) || decision;
                confidence = typeof ai.confidence === "number" ? Math.max(0, Math.min(100, Math.round(ai.confidence))) : confidence;
                aiReasons = Array.isArray(ai.reasons) ? ai.reasons.map(String).filter(Boolean).slice(0, 6) : [];
                aiRiskFlags = Array.isArray(ai.riskFlags) ? ai.riskFlags.map(String).filter(Boolean).slice(0, 6) : [];
                aiProvider = "deepseek";
            } catch (error) {
                console.error("DeepSeek business verification failed:", error);
                localEvidence.riskFlags.push("DeepSeek verifier was unavailable; local scoring fallback was used.");
            }
        }

        if (decision === "approve" && (localEvidence.score < 80 || localEvidence.riskFlags.length > 2)) {
            decision = "manual_review";
            localEvidence.riskFlags.push("AI approval was downgraded because deterministic checks did not reach the auto-approval threshold.");
        }

        if (missingFields.length) {
            decision = "reject";
        }

        const status = toStatus(decision);
        const result: BusinessVerificationResult = {
            status,
            decision,
            confidence,
            score: localEvidence.score,
            webPresenceFound: localEvidence.webPresenceFound,
            matchedName: localEvidence.matchedName,
            matchedPhone: localEvidence.matchedPhone,
            matchedAddress: localEvidence.matchedAddress,
            locationMatch: localEvidence.locationMatch,
            reasons: [...localEvidence.reasons, ...aiReasons].slice(0, 10),
            riskFlags: [...new Set([...localEvidence.riskFlags, ...aiRiskFlags])].slice(0, 10),
            badges: buildBadges(status, input, localEvidence),
            sources,
            model: aiProvider === "deepseek" ? DEEPSEEK_MODEL : undefined,
            aiProvider,
            reviewedAt: Date.now(),
        };

        return NextResponse.json(result);
    } catch (error) {
        console.error("Business verification request failed:", error);
        return NextResponse.json({ error: "Invalid business verification request." }, { status: 400 });
    }
}
