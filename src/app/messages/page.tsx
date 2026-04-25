"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Loader2, MapPin, Paperclip, Send } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import {
    MessageAttachment,
    ThreadMessage,
    getMessages,
    sendThreadMessage,
} from "@/lib/neederoDatabase";

function formatSender(type: string) {
    return type === "business" ? "Business" : "Customer";
}

export default function MessagesPage() {
    const { user, profile, accountType } = useAuth();
    const [messages, setMessages] = useState<ThreadMessage[]>([]);
    const [text, setText] = useState("");
    const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
    const [mapLocation, setMapLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState("");
    const threadId = useMemo(() => `needero-demo-${user?.uid || "guest"}`, [user?.uid]);

    useEffect(() => {
        if (!user) return;
        const fetchMessages = async () => {
            try {
                const data = await getMessages(threadId);
                setMessages(data);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s for MVP
        return () => clearInterval(interval);
    }, [threadId, user]);

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
        if (!navigator.geolocation) {
            setStatus("Location is not available in this browser.");
            return;
        }

        setStatus("Getting location...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setMapLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setStatus("Location attached.");
            },
            () => setStatus("Location permission was not allowed."),
            { enableHighAccuracy: false, timeout: 8000 },
        );
    };

    const submitMessage = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !accountType) return;
        if (!text.trim() && attachments.length === 0 && !mapLocation) return;

        setSaving(true);
        setStatus("");
        try {
            await sendThreadMessage({
                needId: threadId,
                senderId: user.uid,
                senderName: profile?.displayName || profile?.email || formatSender(accountType),
                senderType: accountType,
                text: text.trim(),
                attachments,
                mapLocation,
            });
            setText("");
            setAttachments([]);
            setMapLocation(null);
        } catch (error) {
            setStatus(error instanceof Error ? error.message : "Could not send message.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f8f7f2] px-4 py-6 text-slate-950 md:px-8">
                <div className="mx-auto max-w-5xl">
                    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-xl">
                        <div className="border-b border-slate-100 p-6 md:p-8">
                            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                                Messages
                            </p>
                            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
                                Chat after an Offer is chosen.
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                                Send text, files, images, and map location. Every message is saved in the Needero
                                conversation.
                            </p>
                        </div>

                        <div className="grid min-h-[620px] lg:grid-cols-[0.75fr_1.25fr]">
                            <aside className="border-b border-slate-100 bg-slate-50 p-5 lg:border-b-0 lg:border-r">
                                <div className="rounded-3xl border border-slate-200 bg-white p-5">
                                    <p className="text-sm font-black">Demo conversation</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        This will become the real inbox list after offers and bookings are fully connected.
                                    </p>
                                </div>
                            </aside>

                            <section className="flex flex-col">
                                <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-6">
                                    {messages.length === 0 ? (
                                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                                            <Send className="mx-auto mb-4 text-slate-300" size={34} />
                                            <p className="text-sm font-semibold text-slate-500">
                                                No messages yet. Send a test message below.
                                            </p>
                                        </div>
                                    ) : (
                                        messages.map((message) => {
                                            const mine = message.senderId === user?.uid;
                                            return (
                                                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[78%] rounded-3xl px-4 py-3 ${mine ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-950"}`}>
                                                        <p className="text-[10px] font-black uppercase tracking-wide opacity-60">
                                                            {message.senderName} - {formatSender(message.senderType)}
                                                        </p>
                                                        {message.text && <p className="mt-2 text-sm leading-6">{message.text}</p>}
                                                        {message.mapLocation && (
                                                            <p className="mt-2 text-xs font-semibold opacity-80">
                                                                Location: {message.mapLocation.latitude.toFixed(4)}, {message.mapLocation.longitude.toFixed(4)}
                                                            </p>
                                                        )}
                                                        {message.attachments?.map((attachment) => (
                                                            <div key={attachment.name} className="mt-2 rounded-2xl bg-white/10 p-2 text-xs font-semibold">
                                                                {attachment.type.startsWith("image/") && attachment.dataUrl ? (
                                                                    <img src={attachment.dataUrl} alt={attachment.name} className="mb-2 max-h-40 rounded-xl object-cover" />
                                                                ) : null}
                                                                {attachment.type.startsWith("video/") && attachment.dataUrl ? (
                                                                    <video src={attachment.dataUrl} controls className="mb-2 max-h-40 rounded-xl object-cover" />
                                                                ) : null}
                                                                {attachment.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                <form onSubmit={submitMessage} className="border-t border-slate-100 p-4">
                                    {status && <p className="mb-3 text-sm font-semibold text-slate-500">{status}</p>}
                                    {attachments.length > 0 && (
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {attachments.map((attachment) => (
                                                <span key={attachment.name} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                                                    {attachment.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="flex items-end gap-2 rounded-3xl border border-slate-200 bg-slate-50 p-2">
                                        <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm">
                                            <input type="file" multiple onChange={handleFiles} className="hidden" />
                                            <Paperclip size={18} />
                                        </label>
                                        <button
                                            type="button"
                                            onClick={useLocation}
                                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-600 shadow-sm"
                                            title="Attach map location"
                                        >
                                            <MapPin size={18} />
                                        </button>
                                        <textarea
                                            value={text}
                                            onChange={(event) => setText(event.target.value)}
                                            placeholder="Write a message..."
                                            className="min-h-[44px] flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white disabled:bg-slate-300"
                                            title="Send message"
                                        >
                                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                        </button>
                                    </div>
                                    <p className="mt-2 flex items-center gap-2 text-xs text-slate-400">
                                        <ImageIcon size={14} />
                                        Files are saved in the message record for this MVP.
                                    </p>
                                </form>
                            </section>
                        </div>
                    </section>
                </div>
            </main>
        </RouteGuard>
    );
}
