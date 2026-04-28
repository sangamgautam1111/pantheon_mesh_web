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
    Search,
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
    const [searchQuery, setSearchQuery] = useState("");

    const hasSubmittedQuote = useMemo(() => {
        return isBusiness && offers.some((o) => o.businessId === user?.uid);
    }, [isBusiness, offers, user?.uid]);

    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

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
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-stretch">
                                <div className="flex w-full items-center gap-2 md:w-auto">
                                    <div className="relative flex-1 md:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search needs..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm font-semibold outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                        />
                                    </div>
                                    <button 
                                        className="hidden h-[60px] rounded-2xl bg-slate-950 px-6 text-sm font-black text-white transition-all hover:bg-slate-800 md:block"
                                    >
                                        Search
                                    </button>
                                </div>
                                <button
                                    onClick={requestLocation}
                                    className="inline-flex h-[60px] items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5"
                                >
                                    <Navigation size={17} />
                                    Use my area
                                </button>
                            </div>
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
                        {filteredNeeds.length === 0 && !loading ? (
                            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-10 text-center">
                                <Briefcase className="mx-auto mb-4 text-slate-300" size={38} />
                                <h2 className="text-2xl font-black">{searchQuery ? "No matching Needs" : "No live Needs loaded"}</h2>
                                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                                    {searchQuery 
                                        ? `We couldn't find any Needs matching "${searchQuery}". Try a different keyword.`
                                        : "Needero is not showing demo marketplace data here anymore. Once customers post real Needs and the backend is live, they will appear in this feed."}
                                </p>
                                {!searchQuery && (
                                    <button onClick={loadNeeds} className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">
                                        Refresh live Needs
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {filteredNeeds.map((need) => (
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
                    <div className="fixed inset-0 z-[90] flex justify-end bg-slate-950/30 backdrop-blur-sm" onClick={() => setSelectedNeedId(null)}>
                        <aside
                            className={`flex h-full flex-col bg-[#f8f7f2] shadow-2xl transition-all duration-300 md:rounded-l-[34px] ${isSidebarExpanded ? "w-full" : "w-full max-w-4xl"}`}
                            onClick={(event) => event.stopPropagation()}
                        >
                            {/* Sticky Header */}
                            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setSelectedNeedId(null)}
                                            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        >
                                            <X size={18} />
                                        </button>
                                        <button
                                            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                                            className="hidden h-10 px-4 items-center justify-center rounded-full bg-slate-100 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-200 md:flex"
                                        >
                                            {isSidebarExpanded ? "Compact View" : "Full Screen"}
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Quote Interaction</p>
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto pb-10">
                                {/* Need Details - Fiverr Style */}
                                <div className="bg-white px-6 py-10 md:px-10">
                                    <div className="mx-auto max-w-4xl">
                                        <div className="mb-8 flex flex-wrap gap-2">
                                            <span className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-black text-slate-600 uppercase tracking-widest">{selectedNeed.category}</span>
                                            <span className="rounded-full bg-amber-50 px-4 py-1.5 text-xs font-black text-amber-700 uppercase tracking-widest">{selectedNeed.urgency}</span>
                                            <span className="rounded-full bg-blue-50 px-4 py-1.5 text-xs font-black text-blue-700 uppercase tracking-widest">{selectedNeed.location}</span>
                                        </div>
                                        
                                        <h2 className="text-3xl font-black leading-tight tracking-tight md:text-5xl">{selectedNeed.title}</h2>
                                        
                                        <div className="mt-10 grid gap-10 lg:grid-cols-3">
                                            <div className="lg:col-span-2">
                                                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Problem Description</h3>
                                                <p className="mt-4 text-lg leading-relaxed text-slate-700">{selectedNeed.issue}</p>
                                                
                                                {selectedNeed.photoPreview && (
                                                    <div className="mt-8 overflow-hidden rounded-3xl border border-slate-100 shadow-lg">
                                                        <NeedMedia src={selectedNeed.photoPreview} />
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <div className="rounded-3xl bg-slate-50 p-6">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer Budget</p>
                                                    <p className="mt-2 text-3xl font-black text-slate-950">{selectedNeed.budget || "Flexible"}</p>
                                                </div>
                                                <div className="rounded-3xl border border-slate-200 p-6">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline</p>
                                                    <p className="mt-2 text-sm font-bold text-slate-700">{selectedNeed.urgency === "Immediate" ? "Needs help ASAP" : "Flexible schedule"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quotes Section */}
                                <div className="mt-10 px-6 md:px-10">
                                    <div className="mx-auto max-w-4xl">
                                        <div className="mb-8 flex items-center justify-between">
                                            <h3 className="text-xl font-black">Business Quotes ({offers.length})</h3>
                                            <div className="flex gap-2">
                                                {quoteTabs.map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setQuoteTab(tab)}
                                                        className={`rounded-full px-4 py-2 text-[10px] font-black tracking-widest uppercase transition-all ${
                                                            quoteTab === tab ? "bg-slate-950 text-white shadow-lg" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                                                        }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="grid gap-6">
                                            {offersLoading ? (
                                                <div className="rounded-[30px] border border-slate-200 bg-white p-12 text-center">
                                                    <Clock size={40} className="mx-auto mb-4 text-slate-200 animate-spin" />
                                                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">Loading live quotes...</p>
                                                </div>
                                            ) : visibleOffers.length === 0 ? (
                                                <div className="rounded-[30px] border border-dashed border-slate-300 bg-white p-12 text-center">
                                                    <MessageCircle size={40} className="mx-auto mb-4 text-slate-200" />
                                                    <p className="text-sm font-black uppercase tracking-widest text-slate-400">No quotes submitted yet</p>
                                                    <p className="mt-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">Be the first business to help!</p>
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
                                        </div>
                                    </div>
                                </div>

                                {/* Business Quote Form */}
                                {isBusiness && !hasSubmittedQuote && (
                                    <div className="mt-12 px-6 md:px-10">
                                        <div className="mx-auto max-w-4xl rounded-[40px] border border-slate-950 bg-white p-8 shadow-2xl md:p-12">
                                            <div className="mb-10 flex items-center gap-4">
                                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                                    <ShieldCheck size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black">Post your Quote</h3>
                                                    <p className="text-sm font-semibold text-slate-500">Submit a professional, structured offer to the customer.</p>
                                                </div>
                                            </div>

                                            <form onSubmit={submitQuote} className="grid gap-6">
                                                <div className="grid gap-6 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Price ($)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                                                            <input 
                                                                type="text"
                                                                value={draft.price} 
                                                                onChange={(event) => updateDraft("price", event.target.value)} 
                                                                placeholder="50" 
                                                                className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-black outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5" 
                                                                required 
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Service Type</label>
                                                        <select 
                                                            value={draft.serviceType} 
                                                            onChange={(event) => updateDraft("serviceType", event.target.value)} 
                                                            className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5 appearance-none"
                                                        >
                                                            {serviceTypes.map((type) => <option key={type}>{type}</option>)}
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Arrival Date & Time (24h)</label>
                                                        <input 
                                                            type="datetime-local"
                                                            value={draft.time} 
                                                            onChange={(event) => updateDraft("time", event.target.value)} 
                                                            className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5" 
                                                            required 
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Warranty (Optional)</label>
                                                        <input 
                                                            value={draft.warranty} 
                                                            onChange={(event) => updateDraft("warranty", event.target.value)} 
                                                            placeholder="e.g. 30 days" 
                                                            className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5" 
                                                        />
                                                    </div>

                                                    <div className="space-y-2 md:col-span-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">What's Included</label>
                                                        <input 
                                                            value={draft.included} 
                                                            onChange={(event) => updateDraft("included", event.target.value)} 
                                                            placeholder="e.g. Parts, Labor, Cleaning" 
                                                            className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5" 
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Extra Charges ($)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">$</span>
                                                            <input 
                                                                value={draft.extraCharges} 
                                                                onChange={(event) => updateDraft("extraCharges", event.target.value)} 
                                                                placeholder="0" 
                                                                className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-black outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5" 
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Your Location/Distance</label>
                                                        <input 
                                                            value={draft.distance} 
                                                            onChange={(event) => updateDraft("distance", event.target.value)} 
                                                            placeholder="e.g. 5km away" 
                                                            className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5" 
                                                        />
                                                    </div>

                                                    {draft.serviceType !== "Visit Shop" && (
                                                        <div className="space-y-2 md:col-span-2">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Delay Refund Rule</label>
                                                            <input 
                                                                value={draft.delayRefundRule} 
                                                                onChange={(event) => updateDraft("delayRefundRule", event.target.value)} 
                                                                placeholder="e.g. 10% off if late by 30 mins" 
                                                                className="h-[60px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-black outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5" 
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Personal Message to Customer</label>
                                                    <textarea 
                                                        value={draft.note} 
                                                        onChange={(event) => updateDraft("note", event.target.value)} 
                                                        placeholder="Write a professional note explaining why you're the best fit..." 
                                                        className="min-h-[120px] w-full rounded-[30px] border border-slate-200 bg-slate-50 p-6 text-sm font-semibold leading-relaxed outline-none focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5" 
                                                        required 
                                                    />
                                                </div>

                                                <button 
                                                    type="submit" 
                                                    disabled={saving} 
                                                    className="mt-4 inline-flex h-[70px] w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-8 text-lg font-black text-white shadow-2xl shadow-slate-900/20 transition-all hover:-translate-y-1 hover:shadow-slate-900/40 disabled:bg-slate-300"
                                                >
                                                    {saving ? <Clock size={20} className="animate-spin" /> : <Send size={20} />}
                                                    Submit Quote to Customer
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {hasSubmittedQuote && (
                                    <div className="mt-12 px-6 md:px-10">
                                        <div className="mx-auto max-w-4xl rounded-[40px] border-2 border-slate-100 bg-slate-50 p-12 text-center">
                                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 mb-6">
                                                <CheckCircle2 size={40} />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-950">Quote Already Submitted</h3>
                                            <p className="mt-4 text-lg font-semibold text-slate-500">You've already placed a quote for this Need. You can find it in the list above.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </aside>
                    </div>
                )}
            </main>
        </RouteGuard>
    );
}
