"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    ImageIcon,
    MapPin,
    MessageSquare,
    Send,
    ShieldCheck,
    ShoppingBag,
    Star,
    Store,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import {
    OfferRecord,
    createBookingFromQuote,
    createOffer,
    getNeedById,
    getOffers,
    NeedRecord,
    sendThreadMessage,
} from "@/lib/neederoDatabase";

type QuoteDraft = {
    price: string;
    serviceType: string;
    time: string;
    warranty: string;
    included: string;
    extraCharges: string;
    distance: string;
    availability: string;
    delayRefundRule: string;
    note: string;
};

const emptyDraft: QuoteDraft = {
    price: "",
    serviceType: "Visit Shop",
    time: "",
    warranty: "",
    included: "",
    extraCharges: "",
    distance: "",
    availability: "",
    delayRefundRule: "",
    note: "",
};

const parseAmount = (value: string) => {
    const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
};

function NeedMedia({ need }: { need: NeedRecord }) {
    const [failed, setFailed] = useState(false);
    const src = need.photoPreview;
    const isVideo = src && (src.startsWith("data:video") || /\.(mp4|webm|mov)$/i.test(src));

    if (!src || failed) {
        return (
            <div className="flex min-h-[460px] flex-col justify-between rounded-[28px] bg-[#050816] p-8 text-white">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <ImageIcon size={24} />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">{need.category}</p>
                    <h2 className="mt-3 max-w-2xl text-5xl font-black leading-tight tracking-[-0.06em]">{need.title}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[28px] border border-[#e4e5e7] bg-white">
            {isVideo ? (
                <video src={src} controls className="max-h-[540px] w-full object-cover" onError={() => setFailed(true)} />
            ) : (
                <img src={src} alt={need.title} className="max-h-[540px] w-full object-cover" onError={() => setFailed(true)} />
            )}
        </div>
    );
}

function QuoteRow({
    offer,
    canOrder,
    ordering,
    onMessage,
    onChoose,
}: {
    offer: OfferRecord;
    canOrder: boolean;
    ordering: boolean;
    onMessage: () => void;
    onChoose: () => void;
}) {
    return (
        <article className="rounded-[24px] border border-[#e4e5e7] bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#222325] text-lg font-black text-white">
                        {(offer.businessName || "B").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-black text-[#222325]">{offer.businessName}</h3>
                            <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[11px] font-black text-[#62646a]">Verified-ready</span>
                        </div>
                        <p className="mt-2 text-sm text-[#74767e]">
                            {offer.serviceType || "Service"} - {offer.time || offer.availability || "Time not set"} - {offer.distance || "Nearby"}
                        </p>
                        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <span className="rounded-xl bg-[#f7f7f7] px-3 py-2"><strong>Warranty:</strong> {offer.warranty || "Not listed"}</span>
                            <span className="rounded-xl bg-[#f7f7f7] px-3 py-2"><strong>Includes:</strong> {offer.included || "Discuss in chat"}</span>
                            <span className="rounded-xl bg-[#f7f7f7] px-3 py-2"><strong>Extra:</strong> {offer.extraCharges || "None listed"}</span>
                            <span className="rounded-xl bg-[#f7f7f7] px-3 py-2"><strong>Delay:</strong> {offer.delayRefundRule || "Not listed"}</span>
                        </div>
                        {offer.businessNote && <p className="mt-4 text-sm leading-6 text-[#62646a]">{offer.businessNote}</p>}
                    </div>
                </div>
                <div className="min-w-[210px] rounded-2xl bg-[#050816] p-4 text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Offer price</p>
                    <p className="mt-1 text-3xl font-black">{offer.price || "Open"}</p>
                    <div className="mt-4 grid gap-2">
                        <button onClick={onMessage} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-black text-white hover:bg-white/10">
                            <MessageSquare size={15} />
                            Message
                        </button>
                        {canOrder && (
                            <button onClick={onChoose} disabled={ordering} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-[#050816] hover:bg-[#f5f5f5] disabled:opacity-60">
                                {ordering ? <Clock size={15} className="animate-spin" /> : <ShoppingBag size={15} />}
                                Choose Offer
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function NeedDetailPage() {
    const params = useParams<{ needId: string }>();
    const router = useRouter();
    const { user, profile, accountType } = useAuth();
    const [need, setNeed] = useState<NeedRecord | null>(null);
    const [offers, setOffers] = useState<OfferRecord[]>([]);
    const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [orderingOfferId, setOrderingOfferId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const isBusiness = accountType === "business";
    const isOwner = accountType === "customer" && need?.customerId === user?.uid;
    const sortedOffers = useMemo(() => [...offers].sort((a, b) => parseAmount(a.price) - parseAmount(b.price)), [offers]);
    const hasSubmittedQuote = isBusiness && offers.some((offer) => offer.businessId === user?.uid);

    const load = async () => {
        if (!params.needId) return;
        setLoading(true);
        try {
            const [loadedNeed, loadedOffers] = await Promise.all([
                getNeedById(params.needId, true),
                getOffers(params.needId),
            ]);
            setNeed(loadedNeed);
            setOffers(loadedOffers);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not load this Need.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [params.needId]);

    const updateDraft = (key: keyof QuoteDraft, value: string) => setDraft((current) => ({ ...current, [key]: value }));

    const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !need || !isBusiness) return;
        setSaving(true);
        setMessage("");
        try {
            await createOffer({
                needId: need.id,
                businessId: user.uid,
                businessName: profile?.companyName || profile?.displayName || "Local Business",
                price: draft.price,
                serviceType: draft.serviceType,
                time: draft.time,
                warranty: draft.warranty,
                included: draft.included,
                extraCharges: draft.extraCharges,
                distance: draft.distance || "Nearby",
                availability: draft.availability,
                delayRefundRule: draft.delayRefundRule,
                note: draft.note,
            });
            setDraft(emptyDraft);
            await load();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not send this Offer.");
        } finally {
            setSaving(false);
        }
    };

    const messageQuote = (offer: OfferRecord) => {
        if (!need) return;
        router.push(`/messages?needId=${encodeURIComponent(need.id)}&quoteId=${encodeURIComponent(offer.id)}&businessId=${encodeURIComponent(offer.businessId || "")}&businessName=${encodeURIComponent(offer.businessName || "Local Business")}&order=0`);
    };

    const chooseQuote = async (offer: OfferRecord) => {
        if (!user || !need || !isOwner) return;
        setOrderingOfferId(offer.id);
        try {
            const booking = await createBookingFromQuote({ needId: need.id, quoteId: offer.id, customerId: user.uid });
            await sendThreadMessage({
                needId: need.id,
                quoteId: offer.id,
                bookingId: booking.id,
                senderId: user.uid,
                senderName: profile?.displayName || profile?.email || "Customer",
                senderType: "customer",
                text: `Booking started from this Offer. Need: "${need.title}". Offer price: ${offer.price}.`,
            });
            router.push(`/pay?needId=${encodeURIComponent(need.id)}&quoteId=${encodeURIComponent(offer.id)}&bookingId=${encodeURIComponent(booking.id)}&businessId=${encodeURIComponent(offer.businessId || "")}&businessName=${encodeURIComponent(offer.businessName || "Local Business")}`);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not create Booking.");
        } finally {
            setOrderingOfferId(null);
        }
    };

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#fafafa] px-5 py-8 text-[#222325] md:px-8">
                <div className="mx-auto max-w-7xl">
                    <Link href="/marketplace" className="inline-flex items-center gap-2 text-sm font-black text-[#62646a] hover:text-black">
                        <ArrowLeft size={16} />
                        Back to Browse Needs
                    </Link>

                    {message && <div className="mt-5 rounded-xl border border-[#dadbdd] bg-white px-4 py-3 text-sm font-bold">{message}</div>}

                    {loading ? (
                        <div className="mt-10 rounded-[28px] border border-[#e4e5e7] bg-white p-12 text-center font-black">Loading Need...</div>
                    ) : need ? (
                        <>
                            <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
                                <NeedMedia need={need} />
                                <aside className="h-fit rounded-[28px] border border-[#e4e5e7] bg-white p-6 shadow-sm">
                                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#95979d]">Need owner</p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#222325] font-black text-white">
                                            {(need.customerName || "C").charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-black">{need.customerName || "Customer"}</p>
                                            <p className="text-sm text-[#74767e]">Contact hidden until Offer is chosen</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 space-y-3 text-sm">
                                        <div className="flex items-center justify-between"><span className="text-[#74767e]">Category</span><strong>{need.category}</strong></div>
                                        <div className="flex items-center justify-between"><span className="text-[#74767e]">Area</span><strong>{need.location}</strong></div>
                                        <div className="flex items-center justify-between"><span className="text-[#74767e]">Urgency</span><strong>{need.urgency}</strong></div>
                                        <div className="flex items-center justify-between"><span className="text-[#74767e]">Budget</span><strong>{need.budget || "Open"}</strong></div>
                                    </div>
                                </aside>
                            </section>

                            <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                                <div>
                                    <div className="rounded-[28px] border border-[#e4e5e7] bg-white p-6 shadow-sm">
                                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#95979d]">Need details</p>
                                        <h1 className="mt-3 text-4xl font-black leading-tight tracking-[-0.05em]">{need.title}</h1>
                                        <p className="mt-4 text-base leading-8 text-[#62646a]">{need.description || need.issue}</p>
                                    </div>

                                    <div className="mt-6 flex items-center justify-between">
                                        <h2 className="text-2xl font-black">Quotes from businesses</h2>
                                        <span className="rounded-full bg-[#222325] px-4 py-2 text-sm font-black text-white">{offers.length} Offers</span>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        {sortedOffers.length ? sortedOffers.map((offer) => (
                                            <QuoteRow
                                                key={offer.id}
                                                offer={offer}
                                                canOrder={Boolean(isOwner)}
                                                ordering={orderingOfferId === offer.id}
                                                onMessage={() => messageQuote(offer)}
                                                onChoose={() => void chooseQuote(offer)}
                                            />
                                        )) : (
                                            <div className="rounded-[24px] border-2 border-dashed border-[#dadbdd] bg-white p-10 text-center">
                                                <Store className="mx-auto text-[#b5b6ba]" size={34} />
                                                <p className="mt-3 font-black">No Offers yet</p>
                                                <p className="mt-1 text-sm text-[#74767e]">Businesses can be the first to quote this Need.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <aside className="h-fit rounded-[28px] border border-[#e4e5e7] bg-white p-6 shadow-sm">
                                    {isBusiness ? (
                                        hasSubmittedQuote ? (
                                            <div className="text-center">
                                                <CheckCircle2 className="mx-auto text-[#222325]" size={36} />
                                                <p className="mt-3 font-black">Offer already submitted</p>
                                                <p className="mt-1 text-sm text-[#74767e]">You can continue from Messages if the customer replies.</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={submitQuote} className="space-y-4">
                                                <h3 className="text-xl font-black">Send an Offer</h3>
                                                <input required value={draft.price} onChange={(e) => updateDraft("price", e.target.value)} className="nd-input rounded-xl" placeholder="Price, e.g. $50" />
                                                <input required value={draft.time} onChange={(e) => updateDraft("time", e.target.value)} className="nd-input rounded-xl" placeholder="Arrival/completion time" />
                                                <input value={draft.warranty} onChange={(e) => updateDraft("warranty", e.target.value)} className="nd-input rounded-xl" placeholder="Warranty / guarantee" />
                                                <input value={draft.included} onChange={(e) => updateDraft("included", e.target.value)} className="nd-input rounded-xl" placeholder="What is included" />
                                                <textarea required value={draft.note} onChange={(e) => updateDraft("note", e.target.value)} className="nd-input min-h-28 resize-none rounded-xl" placeholder="Write a useful note for the customer." />
                                                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222325] px-5 py-4 text-sm font-black text-white hover:bg-black disabled:opacity-60">
                                                    {saving ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                                                    Send Offer
                                                </button>
                                            </form>
                                        )
                                    ) : (
                                        <div>
                                            <ShieldCheck size={24} />
                                            <h3 className="mt-4 text-xl font-black">How choosing works</h3>
                                            <p className="mt-2 text-sm leading-6 text-[#74767e]">Compare price, timing, warranty, distance, and trust. Message businesses before choosing an Offer.</p>
                                            <div className="mt-5 flex items-center gap-2 text-sm font-bold">
                                                <Star size={16} />
                                                Contact unlocks after choosing.
                                            </div>
                                        </div>
                                    )}
                                </aside>
                            </section>
                        </>
                    ) : (
                        <div className="mt-10 rounded-[28px] border border-[#e4e5e7] bg-white p-12 text-center">
                            <p className="text-2xl font-black">Need not found</p>
                            <Link href="/marketplace" className="mt-5 inline-flex rounded-xl bg-[#222325] px-5 py-3 text-sm font-black text-white">Browse Needs</Link>
                        </div>
                    )}
                </div>
            </main>
        </RouteGuard>
    );
}
