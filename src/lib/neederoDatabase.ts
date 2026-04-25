"use client";

import { BusinessOffer, NeedCard, NeedStatus, ServiceRequest, createFallbackNeedCard } from "@/lib/nearquote";

const API_URL = "/api/needero";

type BackendRecord = Record<string, any>;

export type NeedRecord = ServiceRequest & {
    id: string;
    description: string;
    cleanCard?: NeedCard | null;
    budget?: string;
    createdAt?: string;
};

export type OfferRecord = BusinessOffer & {
    id: string;
    needId: string;
    status: "sent" | "chosen" | "declined";
    createdAt?: string;
};

const readError = async (response: Response, fallback: string) => {
    const text = await response.text().catch(() => "");
    if (!text) return fallback;

    try {
        const data = JSON.parse(text);
        return data.detail || data.error || data.message || fallback;
    } catch {
        return text.slice(0, 180) || fallback;
    }
};

const normalizeStatus = (value: unknown): NeedStatus => {
    if (value === "quoted" || value === "chosen" || value === "closed") return value;
    return "open";
};

const formatBudget = (need: BackendRecord) => {
    if (typeof need.budget === "string" && need.budget.trim()) return need.budget;
    if (typeof need.budget_value === "number" && need.budget_value > 0) {
        return `Rs. ${need.budget_value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    if (typeof need.budget_type === "string" && need.budget_type.trim()) return need.budget_type;
    return "No budget yet";
};

export const normalizeNeedCard = (raw: unknown, messyText = "", category = "Other"): NeedCard => {
    const data = raw && typeof raw === "object" ? (raw as BackendRecord) : {};
    const fallback = createFallbackNeedCard(messyText || String(data.description || ""), category);
    const title = String(data.title || fallback.title);
    const resolvedCategory = String(data.category || category || fallback.category);
    const problem = String(data.problem || data.issue || data.description || data.ai_summary || fallback.problem);
    const knownDetails = String(data.knownDetails || data.known_details || data.ai_summary || data.description || problem);
    const missingInfo = Array.isArray(data.missingInfo)
        ? data.missingInfo.map(String)
        : Array.isArray(data.missing_info)
          ? data.missing_info.map(String)
          : fallback.missingInfo;
    const questions = Array.isArray(data.questions)
        ? data.questions.map(String)
        : Array.isArray(data.missing_questions)
          ? data.missing_questions.map(String)
          : fallback.questions;

    return {
        category: resolvedCategory,
        title,
        problem,
        knownDetails,
        missingInfo,
        questions,
        summaryForBusinesses: String(data.summaryForBusinesses || data.summary_for_businesses || data.ai_summary || problem),
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [resolvedCategory],
        fallback: Boolean(data.fallback),
        model: typeof data.model === "string" ? data.model : undefined,
    };
};

const mapNeed = (need: BackendRecord): NeedRecord => {
    const description = String(need.description || need.issue || need.ai_summary || "");
    const cleanCard = normalizeNeedCard(need.ai_clean_card || need.cleanCard || {}, description, need.category || "Other");
    const photoPreview = need.photoPreview || need.photo_url || need.video_url || null;

    return {
        id: String(need.id || need.need_id || crypto.randomUUID()),
        title: String(need.title || cleanCard.title || "New Need"),
        location: String(need.location || "Area not set"),
        urgency: String(need.urgency || "Flexible"),
        category: String(need.category || cleanCard.category || "Other"),
        issue: description || cleanCard.problem,
        description: description || cleanCard.problem,
        budget: formatBudget(need),
        status: normalizeStatus(need.status),
        offers: Number(need.offers_count ?? need.offers ?? 0),
        firstOfferTime: String(need.first_offer_time || need.firstOfferTime || "Waiting"),
        customerId: need.customer_id || need.customerId,
        customerName: need.customer_name || need.customerName || "Customer",
        createdAt: need.created_at || need.createdAt,
        photoPreview,
        cleanCard,
    };
};

const mapOffer = (offer: BackendRecord): OfferRecord => ({
    id: String(offer.id || offer.offer_id || crypto.randomUUID()),
    needId: String(offer.need_id || offer.needId || ""),
    businessId: String(offer.business_id || offer.businessId || ""),
    businessName: String(offer.business_name || offer.businessName || "Local Business"),
    price: String(offer.price || ""),
    time: String(offer.delivery_time || offer.time || ""),
    warranty: String(offer.warranty || ""),
    distance: String(offer.distance || "Nearby"),
    note: String(offer.note || ""),
    status: offer.status === "chosen" || offer.status === "declined" ? offer.status : "sent",
    createdAt: offer.created_at || offer.createdAt,
});

export async function cleanNeedWithAI(messyText: string): Promise<NeedCard> {
    const response = await fetch(`${API_URL}/v1/ai/clean-need`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messy_text: messyText }),
    });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not clean this Need right now."));
    }
    return normalizeNeedCard(await response.json(), messyText);
}

export async function getNeeds(customerId?: string, category?: string): Promise<NeedRecord[]> {
    let url = `${API_URL}/v1/needs`;
    const params = new URLSearchParams();
    if (customerId) params.append("customer_id", customerId);
    if (category) params.append("category", category);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load Needs right now."));
    }
    const data = await response.json();
    return Array.isArray(data.needs) ? data.needs.map(mapNeed) : [];
}

export async function createNeed(input: {
    customerId: string;
    customerName: string;
    title: string;
    description: string;
    category: string;
    location: string;
    urgency: string;
    budget: string;
    photoPreview?: string | null;
    cleanCard?: NeedCard | null;
}) {
    const response = await fetch(`${API_URL}/v1/needs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            customer_id: input.customerId,
            customer_name: input.customerName,
            title: input.title,
            description: input.description,
            category: input.category,
            location: input.location,
            urgency: input.urgency,
            budget_type: input.budget,
            budget_value: parseFloat(input.budget.replace(/[^0-9.]/g, "")) || 0,
            photo_url: input.photoPreview,
            ai_clean_card: input.cleanCard,
        }),
    });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not post this Need right now."));
    }
    return await response.json();
}

export async function createOffer(input: {
    needId: string;
    businessId: string;
    businessName: string;
    price: string;
    time: string;
    warranty: string;
    distance: string;
    note: string;
}) {
    const response = await fetch(`${API_URL}/v1/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            need_id: input.needId,
            business_id: input.businessId,
            business_name: input.businessName,
            price: input.price,
            delivery_time: input.time,
            warranty: input.warranty,
            note: input.note,
        }),
    });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not send this Offer right now."));
    }
    return await response.json();
}

export async function getOffers(needId: string): Promise<OfferRecord[]> {
    const response = await fetch(`${API_URL}/v1/needs/${needId}/offers`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load Offers right now."));
    }
    const data = await response.json();
    return Array.isArray(data.offers) ? data.offers.map(mapOffer) : [];
}

export type MessageAttachment = {
    name: string;
    type: string;
    dataUrl?: string;
};

export type ThreadMessage = {
    id: string;
    needId: string;
    senderId: string;
    senderName: string;
    senderType: "customer" | "business";
    text: string;
    attachments: MessageAttachment[];
    mapLocation?: { latitude: number; longitude: number } | null;
    createdAt: string;
};

export async function getMessages(needId: string): Promise<ThreadMessage[]> {
    const response = await fetch(`${API_URL}/v1/messages/${needId}`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load messages right now."));
    }
    const data = await response.json();
    return Array.isArray(data.messages)
        ? data.messages.map((message: BackendRecord) => ({
              id: String(message.id || message.message_id || crypto.randomUUID()),
              needId: String(message.need_id || needId),
              senderId: String(message.sender_id || ""),
              senderName: String(message.sender_name || "User"),
              senderType: message.sender_type === "business" ? "business" : "customer",
              text: String(message.content || message.text || ""),
              attachments: Array.isArray(message.attachments) ? message.attachments : [],
              mapLocation: message.map_location || message.mapLocation || null,
              createdAt: String(message.created_at || message.createdAt || new Date().toISOString()),
          }))
        : [];
}

export async function sendThreadMessage(input: {
    needId: string;
    senderId: string;
    senderName: string;
    senderType: "customer" | "business";
    text: string;
    attachments?: MessageAttachment[];
    mapLocation?: { latitude: number; longitude: number } | null;
}) {
    const response = await fetch(`${API_URL}/v1/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            need_id: input.needId,
            sender_id: input.senderId,
            receiver_id: "thread",
            sender_name: input.senderName,
            sender_type: input.senderType,
            content: input.text,
            attachments: input.attachments || [],
            map_location: input.mapLocation || null,
        }),
    });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not send this message right now."));
    }
    return await response.json();
}
