"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Bell,
    Briefcase,
    CheckCircle2,
    Clock,
    MessageSquare,
    MapPin,
    MessageCircle,
    Navigation,
    Send,
    ShieldCheck,
    ShoppingBag,
    X,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import {
    OfferRecord,
    createBookingFromQuote,
    createOffer,
    getNeeds,
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

const serviceTypes = ["Visit Shop", "Home Visit", "Pickup & Return", "Delivery"];
const quoteTabs = ["All Quotes", "Recommended", "Cheapest", "Fastest", "Selected"] as const;

type QuoteTab = (typeof quoteTabs)[number];
type ScoredOffer = OfferRecord & {
    score: number;
    label: "Best Match" | "Fastest" | "Best Value" | "Cheapest" | "Selected";
};

const parseAmount = (value: string) => {
    const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
};

const parseSpeedScore = (value: string) => {
    const text = value.toLowerCase();
    if (text.includes("asap") || text.includes("now")) return 35;
    if (text.includes("hour") || text.includes("today")) return 28;
    if (text.includes("tomorrow")) return 18;
    if (text.includes("week")) return 10;
    return 14;
};

const scoreOffers = (offers: OfferRecord[]): ScoredOffer[] => {
    const prices = offers.map((offer) => parseAmount(offer.price)).filter(Number.isFinite);
    const minPrice = prices.length ? Math.min(...prices) : Number.POSITIVE_INFINITY;

    return offers
        .map((offer) => {
            const amount = parseAmount(offer.price);
            const priceScore = Number.isFinite(amount) && Number.isFinite(minPrice) ? Math.max(0, 35 - (amount - minPrice) * 0.2) : 12;
            const completenessScore = [
                offer.serviceType,
                offer.time,
                offer.warranty,
                offer.included,
                offer.distance,
                offer.availability,
                offer.delayRefundRule,
                offer.businessNote,
            ].filter(Boolean).length * 4;
            const statusBonus = offer.status === "selected" || offer.status === "chosen" ? 100 : 0;
            const score = Math.round(statusBonus + priceScore + parseSpeedScore(offer.time || offer.availability || "") + completenessScore);
            let label: ScoredOffer["label"] = "Best Match";
            if (offer.status === "selected" || offer.status === "chosen") label = "Selected";
            else if (Number.isFinite(amount) && amount === minPrice) label = "Cheapest";
            else if (parseSpeedScore(offer.time || "") >= 28) label = "Fastest";
            else if (score >= 70) label = "Best Value";

            return { ...offer, score, label };
        })
        .sort((a, b) => b.score - a.score);
};

function NeedMedia({ src }: { src?: string | null }) {
    if (!src) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-slate-200 to-slate-100">
                <Briefcase size={32} className="text-slate-300" />
            </div>
        );
    }

    const isVideo = src.startsWith("data:video") || /\.(mp4|webm|mov)$/i.test(src);
    return isVideo ? (
        <video src={src} controls className="h-full w-full object-cover" />
    ) : (
        <img src={src} alt="" className="h-full w-full object-cover" />
    );
}

function QuoteCard({
    offer,
    canOrder,
    canChat,
    ordering,
    onChat,
    onOrder,
}: {
    offer: ScoredOffer;
    canOrder: boolean;
    canChat: boolean;
    ordering: boolean;
    onChat: () => void;
    onOrder: () => void;
}) {
    const rows = [
        ["Service type", offer.serviceType || "Not specified"],
        ["Time", offer.time || "Not specified"],
        ["Warranty", offer.warranty || "Not specified"],
        ["Included", offer.included || "Not specified"],
        ["Extra charges", offer.extraCharges || "None listed"],
        ["Distance", offer.distance || "Nearby"],
        ["Availability", offer.availability || "Not specified"],
        ["Delay refund", offer.delayRefundRule || "Not specified"],
    ];

    return (
        <article className={`rounded-[26px] border bg-white p-5 shadow-sm ${offer.label === "Best Match" || offer.label === "Selected" ? "border-slate-950" : "border-slate-200"}`}>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-black text-slate-950">{offer.businessName}</p>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700">
                            {offer.label}
                        </span>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Structured Quote • Score {offer.score}
                    </p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-2 text-right text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Price</p>
                    <p className="text-xl font-black">{offer.price || "Open"}</p>
                </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {rows.map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-slate-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{label}</p>
                        <p className="mt-1 text-sm font-semibold leading-5 text-slate-800">{value}</p>
                    </div>
                ))}
            </div>

            {offer.businessNote && (
                <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Business note</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{offer.businessNote}</p>
                </div>
            )}

            {(canOrder || canChat) && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    {canChat && (
                        <button
                            onClick={onChat}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-950 transition-all hover:border-slate-950"
                        >
                            <MessageSquare size={16} />
                            Chat about Quote
                        </button>
                    )}
                    {canOrder && (
                        <button
                            onClick={onOrder}
                            disabled={ordering}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 disabled:bg-slate-300"
                        >
                            {ordering ? <Clock size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
                            Choose Offer
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}

export default function Marketplace() {
    const router = useRouter();
    const { user, profile, accountType } = useAuth();
    const isBusiness = accountType === "business";
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
    const [offers, setOffers] = useState<OfferRecord[]>([]);
    const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
    const [locationStatus, setLocationStatus] = useState("Location not shared yet");
    const [saving, setSaving] = useState(false);
    const [orderingOfferId, setOrderingOfferId] = useState<string | null>(null);
    const [message, setMessage] = useState("");
    const [quoteTab, setQuoteTab] = useState<QuoteTab>("Recommended");
    const [loading, setLoading] = useState(true);
    const [offersLoading, setOffersLoading] = useState(false);

    const selectedNeed = useMemo(
        () => needs.find((need) => need.id === selectedNeedId) || null,
        [needs, selectedNeedId],
    );
    const scoredOffers = useMemo(() => scoreOffers(offers), [offers]);
    const visibleOffers = useMemo(() => {
        if (quoteTab === "Cheapest") {
            return [...scoredOffers].sort((a, b) => parseAmount(a.price) - parseAmount(b.price));
        }
        if (quoteTab === "Fastest") {
            return [...scoredOffers].sort((a, b) => parseSpeedScore(b.time || b.availability || "") - parseSpeedScore(a.time || a.availability || ""));
        }
        if (quoteTab === "Selected") {
            return scoredOffers.filter((offer) => offer.status === "selected" || offer.status === "chosen");
        }
        if (quoteTab === "Recommended") {
            return scoredOffers.slice(0, Math.max(1, scoredOffers.length));
        }
        return scoredOffers;
    }, [quoteTab, scoredOffers]);

    const loadNeeds = async () => {
        setLoading(true);
        setMessage("");
        try {
            const data = await getNeeds();
            setNeeds(data);
            const requestedNeedId = new URLSearchParams(window.location.search).get("needId");
            if (requestedNeedId && data.some((need) => need.id === requestedNeedId)) {
                setSelectedNeedId(requestedNeedId);
            }
        } catch (error) {
            console.error("Marketplace fetch failed:", error);
            setNeeds([]);
            setMessage("Could not load live Needs yet. Please wait for the backend deploy or try again.");
        } finally {
            setLoading(false);
        }
    };

    const loadOffers = async (needId: string) => {
        setOffersLoading(true);
        try {
            setOffers(await getOffers(needId));
        } catch (error) {
            console.error("Offers fetch failed:", error);
            setOffers([]);
        } finally {
            setOffersLoading(false);
        }
    };

    useEffect(() => {
        void loadNeeds();
    }, []);

    useEffect(() => {
        if (selectedNeedId) {
            void loadOffers(selectedNeedId);
        } else {
            setOffers([]);
        }
    }, [selectedNeedId]);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("Location is not available in this browser.");
            return;
        }

        setLocationStatus("Checking your area...");
        navigator.geolocation.getCurrentPosition(
            () => setLocationStatus("Using your approximate area for better Need recommendations."),
            () => setLocationStatus("Location was not allowed. You can still browse all Needs."),
            { enableHighAccuracy: false, timeout: 8000 },
        );
    };

    const updateDraft = (key: keyof QuoteDraft, value: string) => {
        setDraft((current) => ({ ...current, [key]: value }));
    };

    const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !selectedNeedId || !isBusiness) return;

        setSaving(true);
        setMessage("");
        try {
            await createOffer({
                needId: selectedNeedId,
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
            setMessage("Quote submitted. It is now inside the customer Quote Inbox.");
            await loadOffers(selectedNeedId);
            await loadNeeds();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not send quote.");
        } finally {
            setSaving(false);
        }
    };

    const chatAboutQuote = (offer: OfferRecord) => {
        if (!selectedNeed) return;
        router.push(
            `/messages?needId=${encodeURIComponent(selectedNeed.id)}&quoteId=${encodeURIComponent(offer.id)}&businessId=${encodeURIComponent(offer.businessId || "")}&businessName=${encodeURIComponent(offer.businessName)}&order=0`,
        );
    };

    const chooseQuote = async (offer: OfferRecord) => {
        if (!user || !selectedNeed || accountType !== "customer") return;

        setOrderingOfferId(offer.id);
        setMessage("");
        try {
            const booking = await createBookingFromQuote({
                needId: selectedNeed.id,
                quoteId: offer.id,
                customerId: user.uid,
            });
            await sendThreadMessage({
                needId: selectedNeed.id,
                quoteId: offer.id,
                bookingId: booking.id,
                senderId: user.uid,
                senderName: profile?.displayName || profile?.email || "Customer",
                senderType: "customer",
                text: `Booking started from this Quote. Need: "${selectedNeed.title}". Quote price: ${offer.price}.`,
            });
            router.push(
                `/pay?needId=${encodeURIComponent(selectedNeed.id)}&quoteId=${encodeURIComponent(offer.id)}&bookingId=${encodeURIComponent(booking.id)}&businessId=${encodeURIComponent(offer.businessId || "")}&businessName=${encodeURIComponent(offer.businessName)}`,
            );
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not create this Booking.");
        } finally {
            setOrderingOfferId(null);
        }
    };

    const canOrderSelectedNeed = Boolean(
        selectedNeed && accountType === "customer" && selectedNeed.customerId === user?.uid,
    );

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f8f7f2] p-6 text-slate-950 md:p-10">
                <div className="mx-auto max-w-7xl">
                    <section className="mb-6 rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Needero marketplace pipeline</p>
                                <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                                    {isBusiness ? "Your Local Leads Pipeline." : "Compare live Needs and structured Offers."}
                                </h1>
                                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                                    {isBusiness
                                        ? "Open matching Needs, submit structured Quotes, then move selected work into chat, booking, payment hold, progress, and solved."
                                        : "Browse public Needs and Offers. If you own the Need, you can chat with businesses, choose a Quote, and create a Booking."}
                                </p>
                            </div>
                            <button
                                onClick={requestLocation}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white"
                            >
                                <Navigation size={17} />
                                Use my area
                            </button>
                        </div>
                    </section>

                    <section className="mb-6 grid gap-4 md:grid-cols-4">
                        {[
                            { icon: Briefcase, label: "Live Needs", value: loading ? "..." : String(needs.length) },
                            { icon: MessageCircle, label: "Pipeline", value: "Need → Quote → Booking" },
                            { icon: Bell, label: isBusiness ? "Business action" : "Customer action", value: isBusiness ? "Submit Quotes" : "Choose Offer" },
                            { icon: MapPin, label: "Area", value: locationStatus },
                        ].map((item) => (
                            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <item.icon size={20} />
                                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                                <p className="mt-2 text-sm font-black leading-6">{item.value}</p>
                            </div>
                        ))}
                    </section>

                    {message && (
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                            {message}
                        </div>
                    )}

                    <section className="mt-8">
                        {needs.length === 0 && !loading ? (
                            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center">
                                <Briefcase className="mx-auto mb-4 text-slate-300" size={38} />
                                <h2 className="text-2xl font-black">No live Needs loaded</h2>
                                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                    Needero is not showing demo marketplace data here anymore. Once customers post real Needs and the backend is live, they will appear in this feed.
                                </p>
                                <button onClick={loadNeeds} className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                                    Refresh live Needs
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {needs.map((need) => (
                                    <article
                                        key={need.id}
                                        className={`group flex cursor-pointer flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md ${
                                            selectedNeedId === need.id ? "border-slate-950 ring-2 ring-slate-950" : "border-slate-200"
                                        }`}
                                        onClick={() => {
                                            setSelectedNeedId(need.id);
                                            setMessage("");
                                        }}
                                    >
                                        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                                            <NeedMedia src={need.photoPreview} />
                                        </div>
                                        <div className="flex flex-1 flex-col p-4">
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                                                    {need.category}
                                                </span>
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                                                    {need.urgency}
                                                </span>
                                            </div>
                                            <h2 className="text-lg font-bold leading-tight group-hover:underline">{need.title}</h2>
                                            <p className="mt-2 line-clamp-2 flex-1 text-sm text-slate-600">{need.issue}</p>
                                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={13} />
                                                    {need.location}
                                                </span>
                                                <span className="text-slate-900">{need.offers || 0} quotes</span>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {selectedNeed && (
                    <div className="fixed inset-0 z-[90] bg-slate-950/30 backdrop-blur-sm" onClick={() => setSelectedNeedId(null)}>
                        <aside
                            className="absolute right-0 top-0 flex h-full w-full max-w-3xl flex-col overflow-hidden bg-[#f8f7f2] shadow-2xl md:rounded-l-[34px]"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="border-b border-slate-200 bg-white p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Quote Inbox</p>
                                        <h2 className="mt-2 text-2xl font-black">{selectedNeed.title}</h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">{selectedNeed.issue}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedNeedId(null)}
                                        className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                                    <span className="rounded-full bg-slate-100 px-3 py-1">{selectedNeed.category}</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1">{selectedNeed.location}</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1">{selectedNeed.urgency}</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1">{selectedNeed.budget || "No budget"}</span>
                                </div>
                                <div className="mt-5 flex flex-wrap gap-2">
                                    {quoteTabs.map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setQuoteTab(tab)}
                                            className={`rounded-full px-4 py-2 text-xs font-black transition-all ${
                                                quoteTab === tab ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                        >
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 overflow-y-auto p-5">
                                {offersLoading ? (
                                    <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm font-bold text-slate-500">
                                        Loading quotes...
                                    </div>
                                ) : visibleOffers.length === 0 ? (
                                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                        <MessageCircle className="mx-auto mb-3 text-slate-300" size={36} />
                                        <p className="text-sm font-bold text-slate-500">No Quotes in this pipeline view yet.</p>
                                    </div>
                                ) : (
                                    visibleOffers.map((offer) => (
                                        <QuoteCard
                                            key={offer.id}
                                            offer={offer}
                                            canOrder={canOrderSelectedNeed}
                                            canChat={canOrderSelectedNeed}
                                            ordering={orderingOfferId === offer.id}
                                            onChat={() => chatAboutQuote(offer)}
                                            onOrder={() => void chooseQuote(offer)}
                                        />
                                    ))
                                )}

                                {!canOrderSelectedNeed && accountType === "customer" && (
                                    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-sm font-semibold leading-6 text-slate-500">
                                        You can browse public Quote details. Chat and Choose Offer unlock only for the customer who owns this Need.
                                    </div>
                                )}
                            </div>

                            {isBusiness && (
                                <form onSubmit={submitQuote} className="border-t border-slate-200 bg-white p-5">
                                    <div className="mb-4 flex items-center gap-3">
                                        <ShieldCheck size={20} />
                                        <div>
                                            <h3 className="text-lg font-black">Submit a structured Quote</h3>
                                            <p className="text-sm text-slate-500">Submit a structured Offer into the customer Quote Inbox.</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-3 md:grid-cols-2">
                                        <input value={draft.price} onChange={(event) => updateDraft("price", event.target.value)} placeholder="Price, e.g. $50" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950" required />
                                        <select value={draft.serviceType} onChange={(event) => updateDraft("serviceType", event.target.value)} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-slate-950">
                                            {serviceTypes.map((type) => <option key={type}>{type}</option>)}
                                        </select>
                                        <input value={draft.time} onChange={(event) => updateDraft("time", event.target.value)} placeholder="Estimated arrival/completion, e.g. Today 4 PM" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950" required />
                                        <input value={draft.warranty} onChange={(event) => updateDraft("warranty", event.target.value)} placeholder="Warranty, e.g. 7 days warranty" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950" />
                                        <input value={draft.included} onChange={(event) => updateDraft("included", event.target.value)} placeholder="What is included" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950" />
                                        <input value={draft.extraCharges} onChange={(event) => updateDraft("extraCharges", event.target.value)} placeholder="Extra charges, e.g. Home visit fee: $10" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950" />
                                        <input value={draft.distance} onChange={(event) => updateDraft("distance", event.target.value)} placeholder="Location/distance, e.g. 1.2 km away" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950" />
                                        <input value={draft.availability} onChange={(event) => updateDraft("availability", event.target.value)} placeholder="Availability, e.g. Available today" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950" />
                                        <input value={draft.delayRefundRule} onChange={(event) => updateDraft("delayRefundRule", event.target.value)} placeholder="Delay refund rule" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950 md:col-span-2" />
                                    </div>
                                    <textarea value={draft.note} onChange={(event) => updateDraft("note", event.target.value)} placeholder="Business note, e.g. Original display available." className="mt-3 min-h-[90px] w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-slate-950" required />
                                    <button type="submit" disabled={saving} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white disabled:bg-slate-300">
                                        {saving ? <Clock size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                        Post Quote
                                    </button>
                                </form>
                            )}
                        </aside>
                    </div>
                )}
            </main>
        </RouteGuard>
    );
}
