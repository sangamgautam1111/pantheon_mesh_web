"use client";

import { BusinessOffer, NeedCard, NeedStatus, ServiceRequest, createFallbackNeedCard } from "@/lib/nearquote";
import { db } from "@/lib/firebase";
import { ref, push, set, get, query as fbQuery, orderByChild, equalTo } from "firebase/database";

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
    qualityLevel?: string;
    extraCharges?: string;
    availability?: string;
    delayRefundRule?: string;
    lateFee?: string;
    businessNote?: string;
    businessAvatar?: string | null;
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

export type MessageThread = {
    id: string;
    needId: string;
    quoteId?: string;
    bookingId?: string;
    needTitle: string;
    businessId?: string;
    businessName: string;
    customerId?: string;
    customerName: string;
    otherName: string;
    otherAvatar?: string | null;
    lastMessage: string;
    lastMessageAt?: string | null;
    offerPrice?: string;
    offerStatus?: string;
    messageCount: number;
    category?: string;
};

export type SiteNotification = {
    id: string;
    type: "message" | "offer" | "booking" | string;
    title: string;
    body: string;
    href: string;
    createdAt?: string | null;
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
    const budgetValue = typeof need.budget_value === "number" ? need.budget_value : parseCurrencyAmount(String(need.budget_value || ""));
    const formatBudgetValue = (value: number) => `NPR ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    if (typeof need.budget_type === "string" && need.budget_type.trim()) {
        const budgetType = need.budget_type.trim();
        if (/^\d+(?:\.\d+)?$/.test(budgetType)) return formatBudgetValue(Number(budgetType));
        if (/^custom$/i.test(budgetType) && budgetValue > 0) return formatBudgetValue(budgetValue);
        return budgetType;
    }
    if (typeof need.budget === "string" && need.budget.trim()) {
        const budget = need.budget.trim();
        if (/^\d+(?:\.\d+)?$/.test(budget)) return formatBudgetValue(Number(budget));
        return budget;
    }
    if (typeof need.budget_value === "number" && need.budget_value > 0) {
        return formatBudgetValue(need.budget_value);
    }
    return "No budget yet";
};

const parseCurrencyAmount = (value: string) => {
    const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : 0;
};

export const formatMoney = (value: string | number | undefined | null) => {
    const amount = typeof value === "number" ? value : parseCurrencyAmount(String(value || ""));
    if (!Number.isFinite(amount) || amount <= 0) return "";
    return `NPR ${amount.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
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
        customerAvatar: typeof data.customerAvatar === "string" ? data.customerAvatar : typeof data.customer_avatar === "string" ? data.customer_avatar : null,
        serviceMode: typeof data.serviceMode === "string" ? data.serviceMode : typeof data.service_mode === "string" ? data.service_mode : undefined,
        preferredTime: typeof data.preferredTime === "string" ? data.preferredTime : typeof data.preferred_time === "string" ? data.preferred_time : undefined,
        warrantyImportant: typeof data.warrantyImportant === "string" ? data.warrantyImportant : typeof data.warranty_important === "string" ? data.warranty_important : undefined,
    };
};

const mapNeed = (need: BackendRecord): NeedRecord => {
    const description = String(need.description || need.issue || need.ai_summary || "");
    const rawCard = need.ai_clean_card || need.cleanCard || {};
    const cleanCard = normalizeNeedCard(rawCard, description, need.category || "Other");
    const photoPreview = need.photoPreview || need.photo_url || need.video_url || null;
    const rawCardRecord = rawCard && typeof rawCard === "object" ? (rawCard as BackendRecord) : {};

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
        customerAvatar: need.customer_avatar || need.customerAvatar || rawCardRecord.customerAvatar || rawCardRecord.customer_avatar || cleanCard.customerAvatar || null,
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

const normalizeMessageLocation = (value: unknown): MessageMapLocation | null => {
    if (!value || typeof value !== "object") return null;
    const data = value as BackendRecord;
    const latitude = Number(data.latitude ?? data.lat);
    const longitude = Number(data.longitude ?? data.lng ?? data.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
    return {
        latitude,
        longitude,
        label: typeof data.label === "string" ? data.label : typeof data.address === "string" ? data.address : undefined,
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
        qualityLevel: String(parsedNote.details.qualityLevel || parsedNote.details.quality_level || parsedNote.details.partsQuality || parsedNote.details.parts_quality || ""),
        extraCharges: String(parsedNote.details.extraCharges || ""),
        availability: String(parsedNote.details.availability || ""),
        delayRefundRule: String(parsedNote.details.delayRefundRule || ""),
        lateFee: String(parsedNote.details.lateFee || ""),
        businessNote: parsedNote.note,
        businessAvatar: parsedNote.details.businessAvatar || offer.business_avatar || offer.businessAvatar || null,
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

    const [response, statusesSnap] = await Promise.all([
        fetch(url, { cache: "no-store" }),
        get(ref(db, "needStatuses")).catch(() => ({ exists: () => false, val: () => ({}) }))
    ]);
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load Needs right now."));
    }
    const data = await response.json();
    const statuses = statusesSnap.exists() ? statusesSnap.val() : {};

    return Array.isArray(data.needs) ? data.needs.map((n: any) => {
        const mapped = mapNeed(n);
        if (statuses[mapped.id] === "solved") mapped.status = "solved";
        return mapped;
    }) : [];
}

export async function getNeedById(needId: string, includeMedia = true): Promise<NeedRecord | null> {
    const params = new URLSearchParams();
    params.append("need_id", needId);
    if (includeMedia) params.append("include_media", "true");

    const [response, statusSnap] = await Promise.all([
        fetch(`${API_URL}/v1/needs?${params.toString()}`, { cache: "no-store" }),
        get(ref(db, `needStatuses/${needId}`)).catch(() => ({ exists: () => false, val: () => null }))
    ]);
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load this Need right now."));
    }
    const data = await response.json();
    const needs = Array.isArray(data.needs) ? data.needs.map(mapNeed) : [];
    const need = needs[0] || null;
    
    if (need && statusSnap.exists() && statusSnap.val() === "solved") {
        need.status = "solved";
    }
    return need;
}

export async function createNeed(input: {
    customerId: string;
    customerName: string;
    customerAvatar?: string | null;
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
            customer_avatar: input.customerAvatar || null,
            customerAvatar: input.customerAvatar || null,
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
            ai_clean_card: {
                ...(input.cleanCard || {}),
                customerAvatar: input.customerAvatar || input.cleanCard?.customerAvatar || null,
            },
        }),
    });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not post this Need right now."));
    }
    return await response.json();
}

export async function deleteNeed(input: { needId: string; customerId: string }) {
    const response = await fetch(
        `${API_URL}/v1/needs/${encodeURIComponent(input.needId)}?customer_id=${encodeURIComponent(input.customerId)}`,
        { method: "DELETE" },
    );
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not delete this Need right now."));
    }
    return await response.json();
}

export async function createOffer(input: {
    needId: string;
    businessId: string;
    businessName: string;
    businessAvatar?: string | null;
    price: string;
    serviceType?: string;
    time: string;
    warranty: string;
    distance: string;
    included?: string;
    qualityLevel?: string;
    extraCharges?: string;
    availability?: string;
    delayRefundRule?: string;
    lateFee?: string;
    note: string;
}) {
    const structuredNote = JSON.stringify({
        serviceType: input.serviceType || "",
        included: input.included || "",
        qualityLevel: input.qualityLevel || "",
        extraCharges: formatMoney(input.extraCharges) || input.extraCharges || "",
        distance: input.distance || "",
        availability: input.availability || "",
        delayRefundRule: input.delayRefundRule || "",
        lateFee: formatMoney(input.lateFee) || input.lateFee || "",
        businessAvatar: input.businessAvatar || "",
        businessNote: input.note || "",
    });

    const response = await fetch(`${API_URL}/v1/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            need_id: input.needId,
            business_id: input.businessId,
            business_name: input.businessName,
            price: formatMoney(input.price) || input.price,
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

export async function updateOffer(input: {
    offerId: string;
    businessId: string;
    businessAvatar?: string | null;
    price: string;
    time: string;
    warranty: string;
    serviceType?: string;
    included?: string;
    qualityLevel?: string;
    extraCharges?: string;
    distance?: string;
    availability?: string;
    delayRefundRule?: string;
    lateFee?: string;
    note: string;
}) {
    const structuredNote = JSON.stringify({
        serviceType: input.serviceType || "",
        included: input.included || "",
        qualityLevel: input.qualityLevel || "",
        extraCharges: formatMoney(input.extraCharges) || input.extraCharges || "",
        distance: input.distance || "",
        availability: input.availability || "",
        delayRefundRule: input.delayRefundRule || "",
        lateFee: formatMoney(input.lateFee) || input.lateFee || "",
        businessAvatar: input.businessAvatar || "",
        businessNote: input.note || "",
    });

    const response = await fetch(`${API_URL}/v1/offers/${encodeURIComponent(input.offerId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            business_id: input.businessId,
            price: formatMoney(input.price) || input.price,
            delivery_time: input.time,
            warranty: input.warranty,
            note: structuredNote,
        }),
    });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not update this Offer right now."));
    }
    return await response.json();
}

export async function deleteOffer(input: { offerId: string; businessId: string }) {
    const response = await fetch(
        `${API_URL}/v1/offers/${encodeURIComponent(input.offerId)}?business_id=${encodeURIComponent(input.businessId)}`,
        { method: "DELETE" },
    );
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not delete this Offer right now."));
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

export type MessageMapLocation = {
    latitude: number;
    longitude: number;
    label?: string;
};

export type ThreadMessage = {
    id: string;
    needId: string;
    quoteId?: string;
    bookingId?: string;
    senderId: string;
    senderName: string;
    senderType: "customer" | "business";
    senderAvatar?: string | null;
    text: string;
    attachments: MessageAttachment[];
    mapLocation?: MessageMapLocation | null;
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
              senderAvatar: message.sender_avatar || message.senderAvatar || null,
              text: String(message.content || message.text || ""),
              attachments: Array.isArray(message.attachments) ? message.attachments : [],
              mapLocation: normalizeMessageLocation(message.map_location || message.mapLocation),
              createdAt: String(message.created_at || message.createdAt || new Date().toISOString()),
          }))
        : [];
}

export async function getMessageThreads(userId: string): Promise<MessageThread[]> {
    const response = await fetch(`${API_URL}/v1/messages/threads?user_id=${encodeURIComponent(userId)}`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load conversations right now."));
    }
    const data = await response.json();
    return Array.isArray(data.threads)
        ? data.threads.map((thread: BackendRecord) => ({
              id: String(thread.id || `${thread.need_id || ""}:${thread.quote_id || ""}`),
              needId: String(thread.need_id || ""),
              quoteId: thread.quote_id || undefined,
              bookingId: thread.booking_id || undefined,
              needTitle: String(thread.need_title || "Need conversation"),
              businessId: thread.business_id || undefined,
              businessName: String(thread.business_name || "Local Business"),
              customerId: thread.customer_id || undefined,
              customerName: String(thread.customer_name || "Customer"),
              otherName: String(thread.other_name || thread.business_name || thread.customer_name || "Needero user"),
              otherAvatar: thread.other_avatar || null,
              lastMessage: String(thread.last_message || "Conversation update"),
              lastMessageAt: thread.last_message_at || null,
              offerPrice: thread.offer_price || undefined,
              offerStatus: thread.offer_status || undefined,
              messageCount: Number(thread.message_count || 0),
              category: thread.category || undefined,
          }))
        : [];
}

export async function getNotifications(userId: string): Promise<SiteNotification[]> {
    const response = await fetch(`${API_URL}/v1/notifications?user_id=${encodeURIComponent(userId)}`, { cache: "no-store" });
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not load notifications right now."));
    }
    const data = await response.json();
    return Array.isArray(data.notifications)
        ? data.notifications.map((notification: BackendRecord) => ({
              id: String(notification.id || crypto.randomUUID()),
              type: String(notification.type || "message"),
              title: String(notification.title || "Needero update"),
              body: String(notification.body || ""),
              href: String(notification.href || "/messages"),
              createdAt: notification.created_at || notification.createdAt || null,
          }))
        : [];
}

export async function sendThreadMessage(input: {
    needId: string;
    quoteId?: string;
    bookingId?: string;
    senderId: string;
    receiverId?: string;
    senderName: string;
    senderType: "customer" | "business";
    senderAvatar?: string | null;
    text: string;
    attachments?: MessageAttachment[];
    mapLocation?: MessageMapLocation | null;
}) {
    const response = await fetch(`${API_URL}/v1/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            need_id: input.needId,
            quote_id: input.quoteId || null,
            booking_id: input.bookingId || null,
            sender_id: input.senderId,
            receiver_id: input.receiverId || "thread",
            sender_name: input.senderName,
            sender_type: input.senderType,
            sender_avatar: input.senderAvatar || null,
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

export async function updateThreadMessage(input: {
    messageId: string;
    senderId: string;
    text: string;
}) {
    const payload = JSON.stringify({
        sender_id: input.senderId,
        content: input.text,
    });
    const headers = { "Content-Type": "application/json" };

    const response = await fetch(`${API_URL}/v1/messages/${encodeURIComponent(input.messageId)}/edit`, {
        method: "POST",
        headers,
        body: payload,
    });
    if (response.ok) {
        return await response.json();
    }

    const postError = await readError(response, "Needero could not edit this message right now.");
    const patchResponse = await fetch(`${API_URL}/v1/messages/${encodeURIComponent(input.messageId)}`, {
        method: "PATCH",
        headers,
        body: payload,
    });
    if (!patchResponse.ok) {
        throw new Error(await readError(patchResponse, postError));
    }
    return await patchResponse.json();
}

export async function deleteThreadMessage(input: {
    messageId: string;
    senderId: string;
}) {
    const response = await fetch(
        `${API_URL}/v1/messages/${encodeURIComponent(input.messageId)}?sender_id=${encodeURIComponent(input.senderId)}`,
        { method: "DELETE" },
    );
    if (!response.ok) {
        throw new Error(await readError(response, "Needero could not delete this message right now."));
    }
    return await response.json();
}

/* ─────────────────────────────────────────────
   Review & Offer Completion System (Firebase RTDB)
   ───────────────────────────────────────────── */

export type ReviewRecord = {
    id: string;
    needId: string;
    needTitle?: string;
    quoteId?: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string | null;
    reviewerType: "customer" | "business";
    targetId: string;
    targetName: string;
    targetType: "customer" | "business";
    rating: number; // 1-5 stars
    comment: string;
    createdAt: string;
};

export type OfferCompletion = {
    needId: string;
    quoteId: string;
    completedBy: string;
    completedByType: "customer" | "business";
    completedAt: string;
    customerReviewDone: boolean;
    businessReviewDone: boolean;
};

const completionKey = (needId: string, quoteId: string) => `${needId}__${quoteId}`;

export async function markOfferComplete(input: {
    needId: string;
    quoteId: string;
    completedBy: string;
    completedByType: "customer" | "business";
}): Promise<OfferCompletion> {
    const key = completionKey(input.needId, input.quoteId);
    const completionRef = ref(db, `completedOffers/${key}`);
    const existing = await get(completionRef);

    if (existing.exists()) {
        return existing.val() as OfferCompletion;
    }

    const record: OfferCompletion = {
        needId: input.needId,
        quoteId: input.quoteId,
        completedBy: input.completedBy,
        completedByType: input.completedByType,
        completedAt: new Date().toISOString(),
        customerReviewDone: false,
        businessReviewDone: false,
    };

    await set(completionRef, record);

    // Also store a quick lookup in Firebase since Postgres patch sometimes fails
    const needStatusRef = ref(db, `needStatuses/${input.needId}`);
    await set(needStatusRef, "solved");

    // Update the need status to "solved" on the backend
    try {
        await fetch(`${API_URL}/v1/needs/${input.needId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "solved" }),
        });
    } catch {
        // Non-critical — completion is already recorded in Firebase
    }

    return record;
}

export async function getOfferCompletionStatus(
    needId: string,
    quoteId: string,
): Promise<OfferCompletion | null> {
    const key = completionKey(needId, quoteId);
    const snapshot = await get(ref(db, `completedOffers/${key}`));
    return snapshot.exists() ? (snapshot.val() as OfferCompletion) : null;
}

export async function submitReview(input: {
    needId: string;
    needTitle?: string;
    quoteId?: string;
    reviewerId: string;
    reviewerName: string;
    reviewerAvatar?: string | null;
    reviewerType: "customer" | "business";
    targetId: string;
    targetName: string;
    targetType: "customer" | "business";
    rating: number;
    comment: string;
}): Promise<ReviewRecord> {
    const reviewsRef = ref(db, "reviews");
    const newRef = push(reviewsRef);
    const record: ReviewRecord = {
        id: newRef.key!,
        needId: input.needId,
        needTitle: input.needTitle || "",
        quoteId: input.quoteId,
        reviewerId: input.reviewerId,
        reviewerName: input.reviewerName,
        reviewerAvatar: input.reviewerAvatar || null,
        reviewerType: input.reviewerType,
        targetId: input.targetId,
        targetName: input.targetName,
        targetType: input.targetType,
        rating: Math.max(1, Math.min(5, Math.round(input.rating))),
        comment: input.comment,
        createdAt: new Date().toISOString(),
    };

    await set(newRef, record);

    // Mark the review as done on the completion record
    if (input.quoteId) {
        const key = completionKey(input.needId, input.quoteId);
        const completionRef = ref(db, `completedOffers/${key}`);
        const snap = await get(completionRef);
        if (snap.exists()) {
            const completion = snap.val() as OfferCompletion;
            const update = input.reviewerType === "customer"
                ? { ...completion, customerReviewDone: true }
                : { ...completion, businessReviewDone: true };
            await set(completionRef, update);
        }
    }

    return record;
}

export async function getReviewsForTarget(targetId: string): Promise<ReviewRecord[]> {
    try {
        const snapshot = await get(ref(db, "reviews"));
        if (!snapshot.exists()) return [];
        const all = snapshot.val() as Record<string, ReviewRecord>;
        return Object.values(all)
            .filter((r) => r.targetId === targetId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
        return [];
    }
}

export async function getReviewsForNeed(needId: string): Promise<ReviewRecord[]> {
    try {
        const snapshot = await get(ref(db, "reviews"));
        if (!snapshot.exists()) return [];
        const all = snapshot.val() as Record<string, ReviewRecord>;
        return Object.values(all)
            .filter((r) => r.needId === needId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
        return [];
    }
}
