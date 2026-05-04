"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Award, CheckCircle2, Clock, Edit3, FileText, Image as ImageIcon, Info, Loader2, MapPin, Paperclip, Search, Send, SlidersHorizontal, Sparkles, Star, Trash2, X } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
    MessageAttachment,
    MessageMapLocation,
    MessageThread,
    OfferCompletion,
    ThreadMessage,
    deleteThreadMessage,
    getMessageThreads,
    getMessages,
    getOfferCompletionStatus,
    markOfferComplete,
    sendThreadMessage,
    submitReview,
    updateThreadMessage,
} from "@/lib/neederoDatabase";
import { storage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

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
    needTitle: string;
    customerName: string;
    customerAvatar: string;
    offerPrice: string;
    draftText: string;
    orderStarted: boolean;
};

const emptyContext: OrderContext = {
    needId: "",
    quoteId: "",
    bookingId: "",
    businessId: "",
    businessName: "",
    businessAvatar: "",
    needTitle: "",
    customerName: "",
    customerAvatar: "",
    offerPrice: "",
    draftText: "",
    orderStarted: false,
};

const chatContextKey = (needId: string, quoteId: string) => `needero-chat:${needId}:${quoteId}`;

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
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [mapLocation, setMapLocation] = useState<MessageMapLocation | null>(null);
    const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const [query, setQuery] = useState("");
    const [orderContext, setOrderContext] = useState<OrderContext>(emptyContext);
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [assistantLoadingAction, setAssistantLoadingAction] = useState<string | null>(null);
    const [assistantOutput, setAssistantOutput] = useState("");
    const [mobileShowDetails, setMobileShowDetails] = useState(false);
    const [offerCompletion, setOfferCompletion] = useState<OfferCompletion | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewHover, setReviewHover] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewSaving, setReviewSaving] = useState(false);
    const [completionSaving, setCompletionSaving] = useState(false);
    const showOrderPanel = accountType === "customer";

    const clearThread = () => {
        setOrderContext(emptyContext);
        setMobileShowDetails(false);
        if (typeof window !== "undefined") {
            window.history.pushState({}, "", "/messages");
        }
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const needId = params.get("needId") || "";
        const quoteId = params.get("quoteId") || "";
        let storedContext: Partial<OrderContext> = {};
        if (needId && quoteId) {
            try {
                storedContext = JSON.parse(window.sessionStorage.getItem(chatContextKey(needId, quoteId)) || "{}") as Partial<OrderContext>;
            } catch {
                storedContext = {};
            }
        }
        setOrderContext({
            needId,
            quoteId,
            bookingId: params.get("bookingId") || "",
            businessId: params.get("businessId") || "",
            businessName: params.get("businessName") || storedContext.businessName || "",
            businessAvatar: storedContext.businessAvatar || "",
            needTitle: storedContext.needTitle || "",
            customerName: storedContext.customerName || "",
            customerAvatar: storedContext.customerAvatar || "",
            offerPrice: storedContext.offerPrice || "",
            draftText: storedContext.draftText || "",
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
            needTitle: orderContext.needTitle || "New quote conversation",
            businessId: orderContext.businessId || undefined,
            businessName: orderContext.businessName || "Local Business",
            customerName: orderContext.customerName || profile?.displayName || "Customer",
            otherName: accountType === "business" ? orderContext.customerName || "Customer" : orderContext.businessName || "Local Business",
            otherAvatar: accountType === "customer" ? orderContext.businessAvatar || null : orderContext.customerAvatar || null,
            lastMessage: "No messages yet",
            lastMessageAt: null,
            offerPrice: orderContext.offerPrice || undefined,
            messageCount: 0,
        } satisfies MessageThread;
    }, [accountType, orderContext, profile?.displayName, threads]);

    const displayThreads = useMemo(() => {
        const needle = query.trim().toLowerCase();
        let base = threads.filter((thread) => thread.messageCount > 0);

        const merged = selectedThread && !base.some((thread) => thread.id === selectedThread.id)
            ? [selectedThread, ...base]
            : base;
        if (!needle) return merged;
        return merged.filter((thread) =>
            [thread.needTitle, thread.businessName, thread.customerName, thread.otherName, thread.lastMessage]
                .join(" ")
                .toLowerCase()
                .includes(needle),
        );
    }, [query, selectedThread, threads]);

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

    // Check offer completion status when thread changes
    useEffect(() => {
        if (!orderContext.needId || !orderContext.quoteId) {
            setOfferCompletion(null);
            return;
        }
        getOfferCompletionStatus(orderContext.needId, orderContext.quoteId)
            .then(setOfferCompletion)
            .catch(() => setOfferCompletion(null));
    }, [orderContext.needId, orderContext.quoteId]);

    const handleMarkComplete = async () => {
        if (!user || !accountType || !orderContext.needId || !orderContext.quoteId) return;
        setCompletionSaving(true);
        try {
            const completion = await markOfferComplete({
                needId: orderContext.needId,
                quoteId: orderContext.quoteId,
                completedBy: user.uid,
                completedByType: accountType,
            });
            setOfferCompletion(completion);
            toast.success("Offer marked as completed!");
            setShowReviewModal(true);
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Could not mark offer as complete.";
            setStatus(errorMsg);
            toast.error(errorMsg);
        } finally {
            setCompletionSaving(false);
        }
    };

    const alreadyReviewed = useMemo(() => {
        if (!offerCompletion || !accountType) return false;
        return accountType === "customer" ? offerCompletion.customerReviewDone : offerCompletion.businessReviewDone;
    }, [offerCompletion, accountType]);

    const handleSubmitReview = async () => {
        if (!user || !accountType || !selectedThread) return;
        setReviewSaving(true);
        try {
            const isCustomer = accountType === "customer";
            await submitReview({
                needId: orderContext.needId,
                needTitle: selectedThread.needTitle,
                quoteId: orderContext.quoteId || undefined,
                reviewerId: user.uid,
                reviewerName: profile?.displayName || (isCustomer ? "Customer" : "Business"),
                reviewerAvatar: profile?.photoURL || user.photoURL || null,
                reviewerType: accountType,
                targetId: isCustomer ? (selectedThread.businessId || "") : (selectedThread.customerId || ""),
                targetName: isCustomer ? selectedThread.businessName : selectedThread.customerName,
                targetType: isCustomer ? "business" : "customer",
                rating: reviewRating,
                comment: reviewComment.trim(),
            });
            // Refresh completion status
            if (orderContext.quoteId) {
                const updated = await getOfferCompletionStatus(orderContext.needId, orderContext.quoteId);
                setOfferCompletion(updated);
            }
            setShowReviewModal(false);
            setReviewComment("");
            setReviewRating(5);
            setStatus("Review submitted! Thank you for your feedback.");
            toast.success("Review submitted successfully!");
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : "Could not submit review.";
            setStatus(errorMsg);
            toast.error(errorMsg);
        } finally {
            setReviewSaving(false);
        }
    };

    useEffect(() => {
        if (!orderContext.draftText || messages.length > 0 || text || editingMessageId) return;
        setText(orderContext.draftText);
    }, [editingMessageId, messages.length, orderContext.draftText, text]);

    const selectThread = (thread: MessageThread) => {
        setOrderContext({
            needId: thread.needId,
            quoteId: thread.quoteId || "",
            bookingId: thread.bookingId || "",
            businessId: thread.businessId || "",
            businessName: thread.businessName || "",
            businessAvatar: thread.otherAvatar || "",
            needTitle: thread.needTitle || "",
            customerName: thread.customerName || "",
            customerAvatar: thread.otherAvatar || "",
            offerPrice: thread.offerPrice || "",
            draftText: "",
            orderStarted: Boolean(thread.bookingId),
        });
    };

    const handleFiles = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []).slice(0, 3);
        if (files.length === 0) return;

        // Note: With Firebase Storage, we no longer need the 5MB limit for DB payload reasons, 
        // but we can keep a higher reasonable limit if desired. For now, we allow any size.
        setPendingFiles(files);
    };

    const useLocation = () => {
        setIsMapPickerOpen(true);
        setStatus("Pin the location on the map, then confirm to attach it.");
    };

    const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !accountType || !orderContext.needId) return;
        if (!text.trim() && pendingFiles.length === 0 && !mapLocation) return;

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
                cancelEditMessage();
            } else {
                let finalAttachments: MessageAttachment[] = [];
                if (pendingFiles.length > 0) {
                    setStatus("Uploading files...");
                    for (const file of pendingFiles) {
                        const fileRef = storageRef(storage, `chats/${orderContext.needId}/${Date.now()}_${file.name}`);
                        await uploadBytes(fileRef, file);
                        const downloadUrl = await getDownloadURL(fileRef);
                        finalAttachments.push({
                            name: file.name,
                            type: file.type || "file",
                            dataUrl: downloadUrl,
                        });
                    }
                    setStatus("");
                }

                const messageText = text.trim();
                const senderAvatar = profile?.photoURL || user.photoURL || null;
                const receiverId = accountType === "customer"
                    ? selectedThread?.businessId || orderContext.businessId || undefined
                    : selectedThread?.customerId || undefined;
                await sendThreadMessage({
                    needId: orderContext.needId,
                    quoteId: orderContext.quoteId || undefined,
                    bookingId: orderContext.bookingId || undefined,
                    senderId: user.uid,
                    receiverId,
                    senderName: profile?.displayName || profile?.email || formatSender(accountType),
                    senderType: accountType,
                    senderAvatar,
                    text: messageText,
                    attachments: finalAttachments,
                    mapLocation,
                });
                const optimisticMessage: ThreadMessage = {
                    id: `local-${crypto.randomUUID()}`,
                    needId: orderContext.needId,
                    quoteId: orderContext.quoteId || undefined,
                    bookingId: orderContext.bookingId || undefined,
                    senderId: user.uid,
                    senderName: profile?.displayName || profile?.email || formatSender(accountType),
                    senderType: accountType,
                    senderAvatar,
                    text: messageText,
                    attachments: finalAttachments,
                    mapLocation,
                    createdAt: new Date().toISOString(),
                };
                setMessages((current) => [...current, optimisticMessage]);
                if (selectedThread) {
                    setThreads((current) => {
                        const nextThread = {
                            ...selectedThread,
                            lastMessage: messageText || finalAttachments[0]?.name || (mapLocation ? "Location shared" : "Message sent"),
                            lastMessageAt: optimisticMessage.createdAt,
                            messageCount: Math.max(1, selectedThread.messageCount + 1),
                        };
                        const exists = current.some((thread) => thread.id === nextThread.id);
                        return exists
                            ? current.map((thread) => thread.id === nextThread.id ? nextThread : thread)
                            : [nextThread, ...current];
                    });
                }
                setText("");
                setPendingFiles([]);
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
        setPendingFiles([]);
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

    const runAssistantAction = async (action: string) => {
        if (!selectedThread) return;

        const recentMessages = messages
            .slice(-10)
            .map((message) => `${message.senderName}: ${message.text || message.attachments?.[0]?.name || "Attachment shared"}`)
            .join("\n");
        const promptByAction: Record<string, string> = {
            "Suggest reply": "Write one short, polite customer reply for this phone repair quote chat. Focus on price, arrival time, warranty, or address safety.",
            "Compare offer": "Compare the current repair Offer using simple customer language. Mention price, timing, warranty, and what to ask before choosing.",
            "Check warranty": "Review the warranty conversation and suggest one clear question the customer should ask before accepting the repair Offer.",
        };
        const prompt = `${promptByAction[action] || action}

Need: ${selectedThread.needTitle || "Phone repair Need"}
Business: ${selectedThread.businessName || "Local Business"}
Offer: ${selectedThread.offerPrice || "Not selected"}
Recent chat:
${recentMessages || "No chat messages yet."}`;

        setAssistantLoadingAction(action);
        setAssistantOutput("");
        setStatus("");
        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: prompt,
                    messages: messages
                        .slice(-6)
                        .filter((message) => message.text)
                        .map((message) => ({
                            role: message.senderType === accountType ? "user" : "assistant",
                            text: message.text,
                        })),
                }),
            });
            if (!response.ok) throw new Error("Needero AI could not generate that yet.");
            const data = await response.json() as { response?: string };
            const generated = data.response || "Needero AI could not generate that yet.";
            if (action === "Suggest reply") {
                setText(generated);
                setStatus("Needero AI drafted a reply. Review it before sending.");
            } else {
                setAssistantOutput(generated);
            }
        } catch (error) {
            setAssistantOutput(error instanceof Error ? error.message : "Needero AI could not generate that yet.");
        } finally {
            setAssistantLoadingAction(null);
        }
    };

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-white text-[#222325]">
                <div className={`grid min-h-[calc(100vh-64px)] w-full bg-white ${showOrderPanel ? "lg:grid-cols-[330px_minmax(0,1fr)_310px]" : "lg:grid-cols-[330px_minmax(0,1fr)]"}`}>
                    <aside className={`border-b border-[#e4e5e7] bg-white lg:border-b-0 lg:border-r ${selectedThread ? "hidden lg:block" : "block"}`}>
                        <div className="border-b border-[#e4e5e7] p-5">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h1 className="text-2xl font-black tracking-[-0.04em]">Inbox</h1>
                                    <p className="mt-1 text-sm leading-5 text-[#74767e]">All your quote conversations in one place.</p>
                                </div>
                                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#dadbdd] bg-white text-[#62646a] hover:bg-[#f7f7f7]">
                                    <SlidersHorizontal size={16} />
                                </button>
                            </div>
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
                            {displayThreads.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-[#dadbdd] p-8 text-center">
                                    <Send className="mx-auto text-[#b5b6ba]" size={30} />
                                    <p className="mt-3 text-sm font-black">No conversations yet</p>
                                    <p className="mt-1 text-xs leading-5 text-[#74767e]">
                                        Open a Need, message a business quote, or choose an Offer to start a thread.
                                    </p>
                                </div>
                            ) : (
                                displayThreads.map((thread) => {
                                    const active = selectedThread?.id === thread.id;
                                    return (
                                        <button
                                            key={thread.id}
                                            onClick={() => selectThread(thread)}
                                            className={`mb-2 flex w-full gap-3 rounded-2xl border p-3 text-left transition ${
                                                active ? "border-[#0a8f45] bg-[#f4fbf7] shadow-sm" : "border-transparent hover:border-[#e4e5e7] hover:bg-[#f7f7f7]"
                                            }`}
                                        >
                                            <AvatarCircle src={thread.otherAvatar} name={thread.otherName} className="h-12 w-12 text-sm" />
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="flex min-w-0 items-center gap-1 truncate text-sm font-black">
                                                        <span className="truncate">{thread.otherName}</span>
                                                        {active && <CheckCircle2 size={13} className="shrink-0 text-[#0a8f45]" />}
                                                    </p>
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

                    <section className={`flex min-w-0 lg:min-h-[720px] h-[calc(100vh-64px)] lg:h-auto flex-col bg-[#fbfbfb] ${!selectedThread || mobileShowDetails ? "hidden lg:flex" : "flex"}`}>
                        {selectedThread ? (
                            <>
                                <header className="flex flex-col gap-3 border-b border-[#e4e5e7] bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex min-w-0 items-center gap-3">
                                        <button onClick={clearThread} className="lg:hidden -ml-2 p-2 text-[#62646a] hover:bg-[#f7f7f7] rounded-xl">
                                            <ArrowLeft size={20} />
                                        </button>
                                        <AvatarCircle src={selectedThread.otherAvatar} name={selectedThread.otherName} className="h-12 w-12 text-sm" />
                                        <div className="min-w-0">
                                            <p className="flex items-center gap-2 truncate font-black">
                                                {selectedThread.otherName}
                                                <CheckCircle2 size={15} className="text-[#0a8f45]" />
                                            </p>
                                            <p className="truncate text-xs font-semibold text-[#74767e]">Need: {selectedThread.needTitle}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded-full bg-[#e9f9f0] px-3 py-1.5 text-xs font-black text-[#0a8f45]">
                                            {orderContext.orderStarted ? "Booking" : "Quote Chat"}
                                        </span>
                                        <span className="rounded-full bg-[#f1efff] px-3 py-1.5 text-xs font-black text-[#5746d8]">Offer #1</span>
                                        {showOrderPanel && (
                                            <button type="button" onClick={() => setMobileShowDetails(true)} className="flex lg:hidden h-9 w-9 items-center justify-center rounded-full border border-[#dadbdd] text-[#62646a] hover:bg-[#f7f7f7]">
                                                <Info size={15} />
                                            </button>
                                        )}
                                    </div>
                                </header>

                                <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-7">
                                    {messages.length === 0 ? (
                                        <div className="mx-auto mt-20 max-w-md rounded-3xl border border-dashed border-[#dadbdd] bg-white p-10 text-center">
                                            <Send className="mx-auto mb-4 text-[#b5b6ba]" size={34} />
                                            <p className="text-sm font-black">Start the conversation</p>
                                            <p className="mt-2 text-sm leading-6 text-[#74767e]">
                                                Ask about timing, warranty, pickup and return, or exact address. This thread will appear in both inboxes after the first message.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const mine = message.senderId === user?.uid;
                                            return (
                                                <div key={message.id} className={`flex w-full items-end gap-3 ${mine ? "justify-end" : "justify-start"}`}>
                                                    {!mine && (
                                                        <AvatarCircle src={message.senderAvatar || selectedThread.otherAvatar} name={message.senderName} className="h-9 w-9 shrink-0" />
                                                    )}
                                                    <div className={`min-w-0 max-w-[85%] sm:max-w-[74%] rounded-[22px] px-4 py-3 shadow-sm ${mine ? "bg-[#222325] text-white" : "bg-white text-[#222325]"}`}>
                                                        <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wide opacity-55">
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

                                {/* ── Mark Offer Complete / Review Banner ── */}
                                {selectedThread && orderContext.quoteId && (
                                    <div className="border-t border-[#e4e5e7] bg-gradient-to-r from-[#f4fbf7] to-[#f0f7ff] px-4 py-3">
                                        {!offerCompletion ? (
                                            accountType === "customer" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleMarkComplete()}
                                                    disabled={completionSaving}
                                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a8f45] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#0a8f45]/20 transition-all hover:bg-[#078a3e] hover:shadow-xl hover:shadow-[#0a8f45]/30 active:scale-[0.98] disabled:opacity-60"
                                                >
                                                    {completionSaving ? (
                                                        <Loader2 size={18} className="animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 size={18} />
                                                    )}
                                                    Mark Offer Completed
                                                </button>
                                            ) : (
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5] text-[#62646a]">
                                                            <Clock size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-[#222325]">Waiting for Customer</p>
                                                            <p className="text-[11px] font-semibold text-[#64748b]">The customer must mark the offer as completed.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        ) : (
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a8f45] text-white">
                                                        <Award size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-[#0a8f45]">Offer Completed</p>
                                                        <p className="text-[11px] font-semibold text-[#64748b]">{formatTime(offerCompletion.completedAt)}</p>
                                                    </div>
                                                </div>
                                                {!alreadyReviewed ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowReviewModal(true)}
                                                        className="flex items-center gap-2 rounded-xl bg-[#f59e0b] px-4 py-2.5 text-sm font-black text-white shadow-md transition-all hover:bg-[#d97706] hover:shadow-lg active:scale-[0.98]"
                                                    >
                                                        <Star size={16} />
                                                        Leave a Review
                                                    </button>
                                                ) : (
                                                    <span className="flex items-center gap-1.5 rounded-xl bg-[#e9f9f0] px-4 py-2.5 text-xs font-black text-[#0a8f45]">
                                                        <CheckCircle2 size={14} />
                                                        Review Submitted
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                    {pendingFiles.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {pendingFiles.map((file) => (
                                                <span key={file.name} className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-bold text-[#62646a]">
                                                    {file.name}
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
                                        <button type="submit" disabled={saving} className="flex shrink-0 h-11 w-11 items-center justify-center rounded-full bg-[#222325] text-white disabled:bg-[#b5b6ba]">
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
                        <aside className={`border-t border-[#e4e5e7] bg-[#fbfdfb] p-4 lg:border-l lg:border-t-0 ${!mobileShowDetails ? "hidden lg:block" : "block"}`}>
                            <div className="sticky top-20 space-y-4">
                                <section className="rounded-2xl border border-[#dfe8e3] bg-white p-5 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => setMobileShowDetails(false)} className="lg:hidden p-2 -ml-2 text-[#62646a] hover:bg-[#f7f7f7] rounded-xl">
                                            <ArrowLeft size={20} />
                                        </button>
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0a8f45] text-white">
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black">Order Summary</p>
                                            <p className="text-[11px] font-bold text-[#64748b]">Ready to place order</p>
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3 text-xs">
                                        <div className="rounded-xl bg-[#f7faf8] p-3">
                                            <p className="font-black text-[#94a3b8]">Service Needed</p>
                                            <p className="mt-1 font-bold text-[#0f172a]">{selectedThread?.needTitle || "Open from Marketplace"}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="rounded-xl bg-[#f7faf8] p-3">
                                                <p className="font-black text-[#94a3b8]">Shop</p>
                                                <p className="mt-1 truncate font-bold text-[#0f172a]">{selectedThread?.businessName || "Not selected"}</p>
                                            </div>
                                            <div className="rounded-xl bg-[#f7faf8] p-3">
                                                <p className="font-black text-[#94a3b8]">Offer Price</p>
                                                <p className="mt-1 font-bold text-[#0a8f45]">{selectedThread?.offerPrice || "Awaiting quote"}</p>
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-[#f7faf8] p-3">
                                            <p className="font-black text-[#94a3b8]">Shop Details</p>
                                            <p className="mt-1 font-bold leading-5 text-[#0f172a]">Professional local repair shop offering fast service. We specialize in electronics and offer a warranty on labor.</p>
                                        </div>
                                    </div>

                                    <div className="mt-5">
                                        {selectedThread?.offerPrice ? (
                                            <a href={`/payment?needId=${selectedThread.needId}&quoteId=${selectedThread.quoteId}&price=${encodeURIComponent(selectedThread.offerPrice)}`} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a8f45] px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-[#0a8f45]/20 transition-all hover:bg-[#078a3e] hover:shadow-xl hover:shadow-[#0a8f45]/30 active:scale-[0.98]">
                                                Place Offer ({selectedThread.offerPrice})
                                            </a>
                                        ) : (
                                            <button disabled className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#e4e5e7] px-5 py-3.5 text-sm font-black text-[#95979d]">
                                                Place Offer
                                            </button>
                                        )}
                                        <p className="mt-3 text-center text-[10px] font-semibold leading-4 text-[#64748b]">
                                            When the offer is complete, confirm the offer to release the payment to the local shop. If you don't confirm within 3 days, it gets automatically transferred.
                                        </p>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-[#dfe8e3] bg-white p-4 shadow-sm">
                                    <p className="text-sm font-black">Recommended next steps</p>
                                    <div className="mt-4 space-y-3 text-xs font-semibold text-[#334155]">
                                        {[
                                            "Place your order to secure the price",
                                            "Share exact location/address",
                                            "Coordinate arrival time",
                                        ].map((step) => (
                                            <div key={step} className="flex gap-2">
                                                <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#0a8f45]" />
                                                <span>{step}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
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

                {/* ── Review Modal ── */}
                {showReviewModal && selectedThread && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="w-full max-w-md animate-in fade-in zoom-in-95 rounded-3xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#d97706] text-white">
                                        <Star size={22} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black">Leave a Review</p>
                                        <p className="text-xs font-semibold text-[#74767e]">
                                            {accountType === "customer" ? "Rate this business" : "Rate this customer"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#f7f7f7]"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="mt-5 rounded-2xl border border-[#e4e5e7] bg-[#fbfbfb] p-4">
                                <div className="flex items-center gap-3">
                                    <AvatarCircle
                                        src={selectedThread.otherAvatar}
                                        name={selectedThread.otherName}
                                        className="h-11 w-11 text-sm"
                                    />
                                    <div className="min-w-0">
                                        <p className="truncate font-black">{selectedThread.otherName}</p>
                                        <p className="truncate text-xs font-semibold text-[#74767e]">{selectedThread.needTitle}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Star Rating */}
                            <div className="mt-6 flex flex-col items-center gap-2">
                                <p className="text-sm font-black text-[#62646a]">How was your experience?</p>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onMouseEnter={() => setReviewHover(star)}
                                            onMouseLeave={() => setReviewHover(0)}
                                            onClick={() => setReviewRating(star)}
                                            className="rounded-lg p-1 transition-transform hover:scale-110 active:scale-95"
                                        >
                                            <Star
                                                size={36}
                                                className={`transition-colors ${
                                                    star <= (reviewHover || reviewRating)
                                                        ? "fill-[#f59e0b] text-[#f59e0b]"
                                                        : "fill-[#e4e5e7] text-[#e4e5e7]"
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs font-bold text-[#f59e0b]">
                                    {["Terrible", "Poor", "Okay", "Good", "Excellent"][((reviewHover || reviewRating) - 1)] || ""}
                                </p>
                            </div>

                            {/* Comment */}
                            <textarea
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
                                placeholder="Share details of your experience..."
                                rows={3}
                                className="mt-4 w-full resize-none rounded-2xl border border-[#e4e5e7] bg-[#fbfbfb] p-4 text-sm outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
                            />

                            {/* Actions */}
                            <div className="mt-5 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewModal(false)}
                                    className="flex-1 rounded-2xl border border-[#e4e5e7] px-5 py-3 text-sm font-black text-[#62646a] hover:bg-[#f7f7f7]"
                                >
                                    Later
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void handleSubmitReview()}
                                    disabled={reviewSaving}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#f59e0b] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#f59e0b]/20 transition-all hover:bg-[#d97706] disabled:opacity-60"
                                >
                                    {reviewSaving ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Star size={16} />
                                    )}
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </RouteGuard>
    );
}
