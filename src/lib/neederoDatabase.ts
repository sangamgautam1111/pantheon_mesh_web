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
    countryCode?: string;
    stateCode?: string;
    city?: string;
    area?: string;
    latitude?: number | null;
    longitude?: number | null;
};

export type OfferRecord = BusinessOffer & {
    id: string;
    needId: string;
    status: "submitted" | "viewed" | "shortlisted" | "chatting" | "selected" | "declined" | "expired" | "sent" | "chosen";
    createdAt?: string;
    serviceType?: string;
    included?: string;
    extraCharges?: string;
    availability?: string;
    delayRefundRule?: string;
    businessNote?: string;
};

export type BookingRecord = {
    id: string;
    needId: string;
    quoteId: string;
    customerId: string;
    customerName?: string;
    businessId: string;
    businessName: string;
    serviceType?: string;
    scheduledTime?: string;
    paymentStatus: string;
    workStatus: string;
    status: string;
    quoteSnapshot?: BackendRecord;
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
    if (
        value === "draft" ||
        value === "open" ||
        value === "quoting" ||
        value === "quoted" ||
        value === "quote_chosen" ||
        value === "booked" ||
        value === "in_progress" ||
        value === "solved" ||
        value === "chosen" ||
        value === "closed"
    ) {
        return value;
    }
    return "open";
};

const formatBudget = (need: BackendRecord) => {
    if (typeof need.budget_type === "string" && need.budget_type.trim()) return need.budget_type;
    if (typeof need.budget === "string" && need.budget.trim()) return need.budget;
    if (typeof need.budget_value === "number" && need.budget_value > 0) {
        return `$${need.budget_value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    }
    return "No budget yet";
};

const parseCurrencyAmount = (value: string) => {
    const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
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
        countryCode: need.country_code || need.countryCode || "",
        stateCode: need.state_code || need.stateCode || "",
        city: need.city || "",
        area: need.area || "",
        latitude: typeof need.latitude === "number" ? need.latitude : need.latitude ? Number(need.latitude) : null,
        longitude: typeof need.longitude === "number" ? need.longitude : need.longitude ? Number(need.longitude) : null,
        photoPreview,
        cleanCard,
    };
};

const parseOfferNote = (rawNote: unknown) => {
    if (typeof rawNote !== "string") return { note: "", details: {} as BackendRecord };
    try {
        const parsed = JSON.parse(rawNote);
        if (parsed && typeof parsed === "object") {
            return {
                note: String(parsed.businessNote || parsed.note || ""),
                details: parsed as BackendRecord,
            };
        }
    } catch {
        // Older offers stored plain text notes.
    }
    return { note: rawNote, details: {} as BackendRecord };
};

const mapOffer = (offer: BackendRecord): OfferRecord => {
    const parsedNote = parseOfferNote(offer.note);
    const rawStatus = String(offer.status || "submitted");
    const status = (["submitted", "viewed", "shortlisted", "chatting", "selected", "declined", "expired", "sent", "chosen"].includes(rawStatus)
        ? rawStatus
        : "submitted") as OfferRecord["status"];
    return {
        id: String(offer.id || offer.offer_id || crypto.randomUUID()),
        needId: String(offer.need_id || offer.needId || ""),
        businessId: String(offer.business_id || offer.businessId || ""),
        businessName: String(offer.business_name || offer.businessName || "Local Business"),
        price: String(offer.price || ""),
        time: String(offer.delivery_time || offer.time || ""),
        warranty: String(offer.warranty || ""),
        distance: String(parsedNote.details.distance || offer.distance || "Nearby"),
        note: parsedNote.note,
        status,
        createdAt: offer.created_at || offer.createdAt,
        serviceType: String(parsedNote.details.serviceType || ""),
        included: String(parsedNote.details.included || ""),
        extraCharges: String(parsedNote.details.extraCharges || ""),
        availability: String(parsedNote.details.availability || ""),
        delayRefundRule: String(parsedNote.details.delayRefundRule || ""),
        businessNote: parsedNote.note,
    };
};

const mapBooking = (booking: BackendRecord): BookingRecord => ({
    id: String(booking.id || booking.booking_id || ""),
    needId: String(booking.need_id || booking.needId || ""),
    quoteId: String(booking.quote_id || booking.quoteId || ""),
    customerId: String(booking.customer_id || booking.customerId || ""),
    customerName: booking.customer_name || booking.customerName,
    businessId: String(booking.business_id || booking.businessId || ""),
    businessName: String(booking.business_name || booking.businessName || "Local Business"),
    serviceType: booking.service_type || booking.serviceType,
    scheduledTime: booking.scheduled_time || booking.scheduledTime,
    paymentStatus: String(booking.payment_status || booking.paymentStatus || "awaiting_payment"),
    workStatus: String(booking.work_status || booking.workStatus || "pending_confirmation"),
    status: String(booking.status || "pending_confirmation"),
    quoteSnapshot: booking.quote_snapshot || booking.quoteSnapshot,
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

export async function getNeeds(customerId?: string, category?: string, includeMedia = false): Promise<NeedRecord[]> {
    let url = `${API_URL}/v1/needs`;
    const params = new URLSearchParams();
    if (customerId) params.append("customer_id", customerId);
    if (category) params.append("category", category);
    if (includeMedia) params.append("include_media", "true");
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load Needs right now."));
    }
    const data = await response.json();
    return Array.isArray(data.needs) ? data.needs.map(mapNeed) : [];
}

export async function getNeedById(needId: string, includeMedia = true): Promise<NeedRecord | null> {
    const params = new URLSearchParams();
    params.append("need_id", needId);
    if (includeMedia) params.append("include_media", "true");

    const response = await fetch(`${API_URL}/v1/needs?${params.toString()}`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load this Need right now."));
    }
    const data = await response.json();
    const needs = Array.isArray(data.needs) ? data.needs.map(mapNeed) : [];
    return needs[0] || null;
}

export async function createNeed(input: {
    customerId: string;
    customerName: string;
    title: string;
    description: string;
    category: string;
    location: string;
    countryCode?: string;
    stateCode?: string;
    city?: string;
    area?: string;
    latitude?: number | null;
    longitude?: number | null;
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
            country_code: input.countryCode || null,
            state_code: input.stateCode || null,
            city: input.city || null,
            area: input.area || null,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            urgency: input.urgency,
            budget_type: input.budget,
            budget_value: parseCurrencyAmount(input.budget),
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
    serviceType?: string;
    time: string;
    warranty: string;
    distance: string;
    included?: string;
    extraCharges?: string;
    availability?: string;
    delayRefundRule?: string;
    note: string;
}) {
    const structuredNote = JSON.stringify({
        serviceType: input.serviceType || "",
        included: input.included || "",
        extraCharges: input.extraCharges || "",
        distance: input.distance || "",
        availability: input.availability || "",
        delayRefundRule: input.delayRefundRule || "",
        businessNote: input.note || "",
    });

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
            note: structuredNote,
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

export async function getOffersByBusinessId(businessId: string): Promise<OfferRecord[]> {
    const response = await fetch(`${API_URL}/v1/offers?business_id=${businessId}`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load your Offers right now."));
    }
    const data = await response.json();
    return Array.isArray(data.offers) ? data.offers.map(mapOffer) : [];
}

export async function createBookingFromQuote(input: {
    needId: string;
    quoteId: string;
    customerId: string;
}): Promise<BookingRecord> {
    const response = await fetch(`${API_URL}/v1/bookings/from-quote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            need_id: input.needId,
            quote_id: input.quoteId,
            customer_id: input.customerId,
        }),
    });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not create this Booking right now."));
    }
    const data = await response.json();
    return mapBooking(data.booking || { id: data.booking_id, need_id: input.needId, quote_id: input.quoteId, customer_id: input.customerId });
}

export type MessageAttachment = {
    name: string;
    type: string;
    dataUrl?: string;
};

export type ThreadMessage = {
    id: string;
    needId: string;
    quoteId?: string;
    bookingId?: string;
    senderId: string;
    senderName: string;
    senderType: "customer" | "business";
    text: string;
    attachments: MessageAttachment[];
    mapLocation?: { latitude: number; longitude: number } | null;
    createdAt: string;
};

export async function getMessages(needId: string, quoteId?: string): Promise<ThreadMessage[]> {
    const url = new URL(`${API_URL}/v1/messages/${encodeURIComponent(needId)}`, window.location.origin);
    if (quoteId) url.searchParams.set("quote_id", quoteId);
    const response = await fetch(`${url.pathname}${url.search}`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load messages right now."));
    }
    const data = await response.json();
    return Array.isArray(data.messages)
        ? data.messages.map((message: BackendRecord) => ({
              id: String(message.id || message.message_id || crypto.randomUUID()),
              needId: String(message.need_id || needId),
              quoteId: message.quote_id || message.quoteId,
              bookingId: message.booking_id || message.bookingId,
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
    quoteId?: string;
    bookingId?: string;
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
            quote_id: input.quoteId || null,
            booking_id: input.bookingId || null,
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
