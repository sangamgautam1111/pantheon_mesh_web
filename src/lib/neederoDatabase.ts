"use client";

import { BusinessOffer, NeedCard, NeedStatus, ServiceRequest, makeCategorySlug } from "@/lib/nearquote";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export async function cleanNeedWithAI(messyText: string): Promise<NeedCard> {
    const response = await fetch(`${API_URL}/v1/ai/clean-need`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messy_text: messyText }),
    });
    if (!response.ok) throw new Error("AI cleaning failed");
    return await response.json();
}

export async function getNeeds(customerId?: string, category?: string): Promise<NeedRecord[]> {
    let url = `${API_URL}/v1/needs`;
    const params = new URLSearchParams();
    if (customerId) params.append("customer_id", customerId);
    if (category) params.append("category", category);
    if (params.toString()) url += `?${params.toString()}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch needs");
    const data = await response.json();
    return data.needs;
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
            budget_type: "fixed",
            budget_value: parseFloat(input.budget.replace(/[^0-9.]/g, "")) || 0,
            photo_url: input.photoPreview,
            ai_clean_card: input.cleanCard
        }),
    });
    if (!response.ok) throw new Error("Failed to post need");
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
            note: input.note
        }),
    });
    if (!response.ok) throw new Error("Failed to send offer");
    return await response.json();
}

export async function getOffers(needId: string): Promise<OfferRecord[]> {
    const response = await fetch(`${API_URL}/v1/needs/${needId}/offers`);
    if (!response.ok) throw new Error("Failed to fetch offers");
    const data = await response.json();
    return data.offers;
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
    const response = await fetch(`${API_URL}/v1/messages/${needId}`);
    if (!response.ok) throw new Error("Failed to fetch messages");
    const data = await response.json();
    // Map backend keys to frontend keys if necessary
    return data.messages.map((m: any) => ({
        id: String(m.id),
        needId: m.need_id,
        senderId: m.sender_id,
        senderName: m.sender_name || "User",
        senderType: m.sender_type || "customer",
        text: m.content,
        attachments: m.attachments || [],
        mapLocation: m.map_location,
        createdAt: m.created_at
    }));
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
            receiver_id: "system", // In MVP, we can just send to a generic receiver or the other party
            content: input.text,
            attachments: input.attachments,
            map_location: input.mapLocation
        }),
    });
    if (!response.ok) throw new Error("Failed to send message");
    return await response.json();
}

