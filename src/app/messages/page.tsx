"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Edit3, FileText, Image as ImageIcon, Loader2, MapPin, Paperclip, Search, Send, ShoppingBag, Trash2, X } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import {
    MessageAttachment,
    MessageMapLocation,
    MessageThread,
    ThreadMessage,
    deleteThreadMessage,
    getMessageThreads,
    getMessages,
    sendThreadMessage,
    updateThreadMessage,
} from "@/lib/neederoDatabase";

const DeliveryMap = dynamic(() => import("@/components/profile/DeliveryMap"), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="rounded-3xl bg-white p-8 text-sm font-black">Loading map...</div>
        </div>
    ),
});

type OrderContext = {
    needId: string;
    quoteId: string;
    bookingId: string;
    businessId: string;
    businessName: string;
    businessAvatar: string;
    orderStarted: boolean;
};

const emptyContext: OrderContext = {
    needId: "",
    quoteId: "",
    bookingId: "",
    businessId: "",
    businessName: "",
    businessAvatar: "",
    orderStarted: false,
};

function formatSender(type: string) {
    return type === "business" ? "Business" : "Customer";
}

function formatTime(value?: string | null) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function avatarLabel(name: string) {
    return (name || "U").charAt(0).toUpperCase();
}

function isValidMapLocation(location: MessageMapLocation) {
    return (
        Number.isFinite(location.latitude) &&
        Number.isFinite(location.longitude) &&
        location.latitude >= -90 &&
        location.latitude <= 90 &&
        location.longitude >= -180 &&
        location.longitude <= 180
    );
}

function mapsSearchUrl(location: MessageMapLocation) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
}

function mapsRouteUrl(location: MessageMapLocation) {
    return `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}&travelmode=driving`;
}

function AvatarCircle({ src, name, className }: { src?: string | null; name: string; className: string }) {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(src && !failed);

    return (
        <div className={`shrink-0 overflow-hidden rounded-full border border-[#dadbdd] bg-white text-xs font-black text-[#222325] ${className}`}>
            {showImage ? (
                <img src={src || ""} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
            ) : (
                <div className="flex h-full w-full items-center justify-center">{avatarLabel(name)}</div>
            )}
        </div>
    );
}

function AttachmentPreview({ attachment }: { attachment: MessageAttachment }) {
    const isImage = attachment.type.startsWith("image/") && attachment.dataUrl;
    const isVideo = attachment.type.startsWith("video/") && attachment.dataUrl;
    const isPdf = Boolean(
        attachment.type === "application/pdf" ||
        attachment.dataUrl?.startsWith("data:application/pdf") ||
        /\.pdf$/i.test(attachment.name || ""),
    );

    return (
        <div className="mt-2 overflow-hidden rounded-2xl bg-white/10 text-xs font-semibold">
            {isImage ? <img src={attachment.dataUrl} alt={attachment.name} className="max-h-64 w-full object-cover" /> : null}
            {isVideo ? <video src={attachment.dataUrl} controls className="max-h-64 w-full object-cover" /> : null}
            {isPdf ? (
                <div className="bg-white text-[#222325]">
                    <div className="flex items-center gap-2 border-b border-[#e4e5e7] p-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#222325] text-white">
                            <FileText size={16} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate font-black">{attachment.name || "PDF attachment"}</p>
                            <p className="text-[11px] font-semibold text-[#74767e]">PDF attachment</p>
                        </div>
                    </div>
                    {attachment.dataUrl ? <iframe src={attachment.dataUrl} title={attachment.name} className="h-64 w-full bg-white" /> : null}
                </div>
            ) : null}
            {!isImage && !isVideo && !isPdf ? (
                <div className="flex items-center gap-2 bg-white p-3 text-[#222325]">
                    <FileText size={16} />
                    <span className="truncate">{attachment.name}</span>
                </div>
            ) : (
                <p className="p-2">{attachment.name}</p>
            )}
        </div>
    );
}

export default function MessagesPage() {
    const { user, profile, accountType } = useAuth();
    const [threads, setThreads] = useState<MessageThread[]>([]);
    const [messages, setMessages] = useState<ThreadMessage[]>([]);
    const [text, setText] = useState("");
    const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
    const [mapLocation, setMapLocation] = useState<MessageMapLocation | null>(null);
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [query, setQuery] = useState("");
    const [orderContext, setOrderContext] = useState<OrderContext>(emptyContext);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const showOrderPanel = accountType === "customer";

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setOrderContext({
            needId: params.get("needId") || "",
            quoteId: params.get("quoteId") || "",
            bookingId: params.get("bookingId") || "",
            businessId: params.get("businessId") || "",
            businessName: params.get("businessName") || "",
            businessAvatar: params.get("businessAvatar") || "",
            orderStarted: params.get("order") === "1",
        });
    }, []);

    const selectedThread = useMemo(() => {
        if (!orderContext.needId) return null;
        const existing = threads.find(
            (thread) => thread.needId === orderContext.needId && (thread.quoteId || "") === (orderContext.quoteId || ""),
        );
        if (existing) return existing;
        return {
            id: `${orderContext.needId}:${orderContext.quoteId}`,
            needId: orderContext.needId,
            quoteId: orderContext.quoteId || undefined,
            bookingId: orderContext.bookingId || undefined,
            needTitle: "New quote conversation",
            businessId: orderContext.businessId || undefined,
            businessName: orderContext.businessName || "Local Business",
            customerName: profile?.displayName || "Customer",
            otherName: accountType === "business" ? "Customer" : orderContext.businessName || "Local Business",
            otherAvatar: accountType === "customer" ? orderContext.businessAvatar || null : null,
            lastMessage: "No messages yet",
            lastMessageAt: null,
            messageCount: 0,
        } satisfies MessageThread;
    }, [accountType, orderContext, profile?.displayName, threads]);

    const filteredThreads = useMemo(() => {
        const needle = query.trim().toLowerCase();
        const base = threads.filter((thread) => thread.messageCount > 0);
        if (!needle) return base;
        return base.filter((thread) =>
            [thread.needTitle, thread.businessName, thread.customerName, thread.otherName, thread.lastMessage]
                .join(" ")
                .toLowerCase()
                .includes(needle),
        );
    }, [query, threads]);

    const loadThreads = async () => {
        if (!user) return;
        try {
            setThreads(await getMessageThreads(user.uid));
        } catch (error) {
            console.error("Failed to fetch threads:", error);
        }
    };

    const loadMessages = async () => {
        if (!user || !orderContext.needId) {
            setMessages([]);
            return;
        }
        try {
            setMessages(await getMessages(orderContext.needId, orderContext.quoteId || undefined));
        } catch (error) {
            console.error("Failed to fetch messages:", error);
        }
    };

    useEffect(() => {
        void loadThreads();
        const interval = setInterval(loadThreads, 5000);
        return () => clearInterval(interval);
    }, [user?.uid]);

    useEffect(() => {
        void loadMessages();
        const interval = setInterval(loadMessages, 3500);
        return () => clearInterval(interval);
    }, [orderContext.needId, orderContext.quoteId, user?.uid]);

    const selectThread = (thread: MessageThread) => {
        setOrderContext({
            needId: thread.needId,
            quoteId: thread.quoteId || "",
            bookingId: thread.bookingId || "",
            businessId: thread.businessId || "",
            businessName: thread.businessName || "",
            businessAvatar: thread.otherAvatar || "",
            orderStarted: Boolean(thread.bookingId),
        });
    };

    const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []).slice(0, 3);
        if (files.length === 0) return;

        Promise.all(
            files.map(
                (file) =>
                    new Promise<MessageAttachment>((resolve) => {
                        const reader = new FileReader();
                        reader.onload = () =>
                            resolve({
                                name: file.name,
                                type: file.type || "file",
                                dataUrl: typeof reader.result === "string" ? reader.result : undefined,
                            });
                        reader.readAsDataURL(file);
                    }),
            ),
        ).then(setAttachments);
    };

    const useLocation = () => {
        setIsMapPickerOpen(true);
        setStatus("Pin the location on the map, then confirm to attach it.");
    };

    const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !accountType || !orderContext.needId) return;
        if (!text.trim() && attachments.length === 0 && !mapLocation) return;

        setSaving(true);
        setStatus("");
        try {
            const activeEditMessageId = editingMessageId;
            if (activeEditMessageId) {
                const editedText = text.trim();
                await updateThreadMessage({
                    messageId: activeEditMessageId,
                    senderId: user.uid,
                    text: editedText,
                });
                setMessages((current) =>
                    current.map((message) =>
                        message.id === activeEditMessageId
                            ? { ...message, text: editedText }
                            : message,
                    ),
                );
                setThreads((current) =>
                    current.map((thread) =>
                        thread.needId === orderContext.needId && (thread.quoteId || "") === (orderContext.quoteId || "")
                            ? { ...thread, lastMessage: editedText }
                            : thread,
                    ),
                );
                setEditingMessageId(null);
                setText("");
                setAttachments([]);
                setMapLocation(null);
                await loadThreads();
            } else {
                await sendThreadMessage({
                    needId: orderContext.needId,
                    quoteId: orderContext.quoteId || undefined,
                    bookingId: orderContext.bookingId || undefined,
                    senderId: user.uid,
                    senderName: profile?.displayName || profile?.email || formatSender(accountType),
                    senderType: accountType,
                    senderAvatar: profile?.photoURL || user.photoURL || null,
                    text: text.trim(),
                    attachments,
                    mapLocation,
                });
                setText("");
                setAttachments([]);
                setMapLocation(null);
                await Promise.all([loadMessages(), loadThreads()]);
            }
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Could not send message.");
        } finally {
            setSaving(false);
        }
    };

    const startEditMessage = (message: ThreadMessage) => {
        setEditingMessageId(message.id);
        setText(message.text || "");
        setAttachments([]);
        setMapLocation(null);
        setStatus("Editing your message.");
    };

    const cancelEditMessage = () => {
        setEditingMessageId(null);
        setText("");
        setStatus("");
    };

    const removeMessage = async (message: ThreadMessage) => {
        if (!user) return;
        const confirmed = window.confirm("Delete this message?");
        if (!confirmed) return;
        setStatus("");
        try {
            await deleteThreadMessage({ messageId: message.id, senderId: user.uid });
            if (editingMessageId === message.id) cancelEditMessage();
            await Promise.all([loadMessages(), loadThreads()]);
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Could not delete message.");
        }
    };

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f5f5f5] text-[#222325]">
                <div className={`mx-auto grid min-h-[calc(100vh-64px)] max-w-[1480px] border-x border-[#e4e5e7] bg-white ${showOrderPanel ? "lg:grid-cols-[330px_1fr_310px]" : "lg:grid-cols-[330px_1fr]"}`}>
                    <aside className="border-b border-[#e4e5e7] bg-white lg:border-b-0 lg:border-r">
                        <div className="border-b border-[#e4e5e7] p-5">
                            <h1 className="text-2xl font-black">Inbox</h1>
                            <p className="mt-1 text-sm text-[#74767e]">Only active quote conversations appear here.</p>
                            <div className="mt-4 flex items-center rounded-full border border-[#dadbdd] bg-[#f7f7f7] px-3">
                                <Search size={15} className="text-[#74767e]" />
                                <input
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Search conversations"
                                    className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
                                />
                            </div>
                        </div>

                        <div className="max-h-[calc(100vh-196px)] overflow-y-auto p-3">
                            {filteredThreads.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#dadbdd] p-8 text-center">
                                    <Send className="mx-auto text-[#b5b6ba]" size={30} />
                                    <p className="mt-3 text-sm font-black">No conversations yet</p>
                                    <p className="mt-1 text-xs leading-5 text-[#74767e]">
                                        Open a Need, message a business quote, or choose an Offer to start a thread.
                                    </p>
                                </div>
                            ) : (
                                filteredThreads.map((thread) => {
                                    const active = selectedThread?.id === thread.id;
                                    return (
                                        <button
                                            key={thread.id}
                                            onClick={() => selectThread(thread)}
                                            className="mb-2 flex w-full gap-3 rounded-2xl p-3 text-left transition hover:bg-[#f5f5f5]"
                                            style={{ background: active ? "#f0f0f0" : "transparent" }}
                                        >
                                            <AvatarCircle src={thread.otherAvatar} name={thread.otherName} className="h-12 w-12 text-sm" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-black">{thread.otherName}</p>
                                                    <span className="shrink-0 text-[11px] text-[#95979d]">{formatTime(thread.lastMessageAt)}</span>
                                                </div>
                                                <p className="mt-1 truncate text-xs font-semibold text-[#62646a]">{thread.needTitle}</p>
                                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#74767e]">{thread.lastMessage}</p>
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </aside>

                    <section className="flex min-h-[720px] flex-col bg-[#fbfbfb]">
                        {selectedThread ? (
                            <>
                                <header className="flex items-center justify-between border-b border-[#e4e5e7] bg-white px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <AvatarCircle src={selectedThread.otherAvatar} name={selectedThread.otherName} className="h-11 w-11 text-sm" />
                                        <div>
                                            <p className="font-black">{selectedThread.otherName}</p>
                                            <p className="text-xs text-[#74767e]">{selectedThread.needTitle}</p>
                                        </div>
                                    </div>
                                    <span className="rounded-full bg-[#222325] px-3 py-1 text-xs font-black text-white">
                                        {orderContext.orderStarted ? "Booking" : "Quote chat"}
                                    </span>
                                </header>

                                <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-7">
                                    {messages.length === 0 ? (
                                        <div className="mx-auto mt-20 max-w-md rounded-3xl border border-dashed border-[#dadbdd] bg-white p-10 text-center">
                                            <Send className="mx-auto mb-4 text-[#b5b6ba]" size={34} />
                                            <p className="text-sm font-black">Start the conversation</p>
                                            <p className="mt-2 text-sm leading-6 text-[#74767e]">
                                                Ask about timing, warranty, pickup, delivery, or exact address. This thread will appear in both inboxes after the first message.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const mine = message.senderId === user?.uid;
                                            return (
                                                <div key={message.id} className={`flex items-end gap-3 ${mine ? "justify-end" : "justify-start"}`}>
                                                    {!mine && (
                                                        <AvatarCircle src={message.senderAvatar || selectedThread.otherAvatar} name={message.senderName} className="h-9 w-9" />
                                                    )}
                                                    <div className={`max-w-[74%] rounded-[22px] px-4 py-3 shadow-sm ${mine ? "bg-[#222325] text-white" : "bg-white text-[#222325]"}`}>
                                                        <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide opacity-55">
                                                            <span>{message.senderName}</span>
                                                            <span>{formatSender(message.senderType)}</span>
                                                            <span>{formatTime(message.createdAt)}</span>
                                                        </div>
                                                        {message.text && <p className="text-sm leading-6">{message.text}</p>}
                                                        {message.mapLocation && (
                                                            <div className={`mt-3 rounded-2xl border p-3 text-xs font-semibold ${mine ? "border-white/15 bg-white/10" : "border-[#dadbdd] bg-[#f7f7f7]"}`}>
                                                                <div className="flex items-start gap-3">
                                                                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${mine ? "bg-white text-[#222325]" : "bg-[#222325] text-white"}`}>
                                                                        <MapPin size={18} />
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="font-black">Exact location shared</p>
                                                                        <p className={`mt-1 leading-5 ${mine ? "text-white/70" : "text-[#74767e]"}`}>
                                                                            {message.mapLocation.label || "Open route in Maps for turn-by-turn navigation."}
                                                                        </p>
                                                                        {isValidMapLocation(message.mapLocation) && (
                                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                                <a
                                                                                    href={mapsRouteUrl(message.mapLocation)}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className={`rounded-full px-3 py-2 text-[11px] font-black ${mine ? "bg-white text-[#222325]" : "bg-[#222325] text-white"}`}
                                                                                >
                                                                                    Open route
                                                                                </a>
                                                                                <a
                                                                                    href={mapsSearchUrl(message.mapLocation)}
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className={`rounded-full border px-3 py-2 text-[11px] font-black ${mine ? "border-white/20 text-white" : "border-[#222325] text-[#222325]"}`}
                                                                                >
                                                                                    Full map
                                                                                </a>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {message.attachments?.map((attachment) => <AttachmentPreview key={attachment.name} attachment={attachment} />)}
                                                        {mine && (
                                                            <div className="mt-3 flex justify-end gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => startEditMessage(message)}
                                                                    disabled={!message.text}
                                                                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide hover:bg-white/20 disabled:opacity-40"
                                                                >
                                                                    <Edit3 size={11} />
                                                                    Edit
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => void removeMessage(message)}
                                                                    className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide hover:bg-white/20"
                                                                >
                                                                    <Trash2 size={11} />
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {mine && (
                                                        <AvatarCircle src={message.senderAvatar || profile?.photoURL || user?.photoURL} name={profile?.displayName || "Me"} className="h-9 w-9" />
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <form onSubmit={submitMessage} className="border-t border-[#e4e5e7] bg-white p-4">
                                    {status && <p className="mb-3 text-sm font-semibold text-[#62646a]">{status}</p>}
                                    {editingMessageId && (
                                        <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#dadbdd] bg-[#f7f7f7] px-4 py-3 text-sm font-bold">
                                            <span>Editing message</span>
                                            <button type="button" onClick={cancelEditMessage} className="rounded-full p-1 hover:bg-white">
                                                <X size={15} />
                                            </button>
                                        </div>
                                    )}
                                    {attachments.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {attachments.map((attachment) => (
                                                <span key={attachment.name} className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-bold text-[#62646a]">
                                                    {attachment.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    {mapLocation && (
                                        <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl border border-[#dadbdd] bg-[#f7f7f7] px-4 py-3 text-sm">
                                            <span className="min-w-0 truncate font-bold">
                                                <MapPin size={15} className="mr-2 inline" />
                                                {mapLocation.label || "Pinned map location attached"}
                                            </span>
                                            <button type="button" onClick={() => setMapLocation(null)} className="shrink-0 rounded-full p-1 hover:bg-white">
                                                <X size={15} />
                                            </button>
                                        </div>
                                    )}
                                    <div className="flex items-end gap-2 rounded-full border border-[#dadbdd] bg-[#f7f7f7] p-2">
                                        <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-[#62646a] shadow-sm">
                                            <input type="file" multiple onChange={handleFiles} className="hidden" />
                                            <Paperclip size={18} />
                                        </label>
                                        <button type="button" onClick={useLocation} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#62646a] shadow-sm">
                                            <MapPin size={18} />
                                        </button>
                                        <textarea
                                            value={text}
                                            onChange={(event) => setText(event.target.value)}
                                            placeholder={editingMessageId ? "Edit your message..." : "Type your message..."}
                                            className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none"
                                        />
                                        <button type="submit" disabled={saving} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#222325] text-white disabled:bg-[#b5b6ba]">
                                            {saving ? <Loader2 size={18} className="animate-spin" /> : editingMessageId ? <Edit3 size={18} /> : <Send size={18} />}
                                        </button>
                                    </div>
                                    <p className="mt-2 flex items-center gap-2 text-xs text-[#95979d]">
                                        <ImageIcon size={14} />
                                        Files, images, videos, and map location stay attached to this quote thread.
                                    </p>
                                </form>
                            </>
                        ) : (
                            <div className="flex flex-1 items-center justify-center p-8">
                                <div className="max-w-md text-center">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#222325] text-white">
                                        <Send size={26} />
                                    </div>
                                    <h2 className="mt-5 text-3xl font-black tracking-[-0.04em]">No chat selected</h2>
                                    <p className="mt-3 text-sm leading-6 text-[#74767e]">
                                        Your inbox stays clean until you message a Quote or choose an Offer. Open a marketplace Need to begin.
                                    </p>
                                </div>
                            </div>
                        )}
                    </section>

                    {showOrderPanel && (
                    <aside className="border-t border-[#e4e5e7] bg-white p-5 lg:border-l lg:border-t-0">
                        <div className="sticky top-20 rounded-3xl border border-[#e4e5e7] bg-white p-5 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#222325] text-white">
                                    <ShoppingBag size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black">Order panel</p>
                                    <p className="text-xs font-semibold text-[#74767e]">
                                        {selectedThread ? "Quote pipeline" : "No active quote"}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 space-y-3 text-sm">
                                <div className="rounded-2xl bg-[#f7f7f7] p-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#95979d]">Business</p>
                                    <p className="mt-1 font-bold">{selectedThread?.businessName || "Not selected"}</p>
                                </div>
                                <div className="rounded-2xl bg-[#f7f7f7] p-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#95979d]">Need</p>
                                    <p className="mt-1 break-all font-bold">{selectedThread?.needTitle || "Open from Marketplace"}</p>
                                </div>
                                <div className="rounded-2xl bg-[#f7f7f7] p-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#95979d]">Offer</p>
                                    <p className="mt-1 font-bold">{selectedThread?.offerPrice || "Not selected"}</p>
                                </div>
                            </div>
                            <button type="button" className="mt-5 w-full rounded-2xl bg-[#222325] px-5 py-4 text-sm font-black text-white">
                                Pay / Hold Payment
                            </button>
                            <p className="mt-3 text-xs leading-5 text-[#74767e]">
                                Payment is reserved for MVP3. This keeps the Fiverr-style order panel ready without charging users yet.
                            </p>
                        </div>
                    </aside>
                    )}
                </div>
                {isMapPickerOpen && (
                    <DeliveryMap
                        initialCoords={mapLocation ? { lat: mapLocation.latitude, lng: mapLocation.longitude } : profile?.deliveryCoords || null}
                        initialAddress={mapLocation?.label || profile?.deliveryAddress || profile?.currentAddress || "Pin exact location"}
                        onClose={() => setIsMapPickerOpen(false)}
                        onSelect={(data) => {
                            setMapLocation({
                                latitude: data.coords.lat,
                                longitude: data.coords.lng,
                                label: data.address || "Pinned location",
                            });
                            if (!text.trim()) setText("Here is my location.");
                            setStatus("Pinned location attached. Send it when ready.");
                            setIsMapPickerOpen(false);
                        }}
                    />
                )}
            </main>
        </RouteGuard>
    );
}
