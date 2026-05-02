"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Bell,
    Briefcase,
    CheckCircle2,
    Clock,
    FileText,
    Flame,
    MapPin,
    MessageCircle,
    MessageSquare,
    Navigation,
    Search,
    Send,
    ShieldCheck,
    ShoppingBag,
    X,
} from "lucide-react";
import {
    localRank,
    needDistanceLabel,
    normalizePlace,
    ViewerLocation,
} from "@/lib/location";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import {
    OfferRecord,
    createOffer,
    getNeeds,
    getOffers,
    NeedRecord,
} from "@/lib/neederoDatabase";
type QuoteDraft = {
    price: string;
    serviceType: string;
    time: string;
    warranty: string;
    included: string;
    partsQuality: string;
    extraCharges: string;
    distance: string;
    distanceUnit: "m" | "km";
    availability: string;
    delayRefundRule: string;
    lateFee: string;
    note: string;
};

const emptyDraft: QuoteDraft = {
    price: "",
    serviceType: "Visit Shop",
    time: "",
    warranty: "",
    included: "",
    partsQuality: "High-quality copy",
    extraCharges: "",
    distance: "",
    distanceUnit: "m",
    availability: "",
    delayRefundRule: "",
    lateFee: "",
    note: "",
};

const serviceTypes = ["Visit Shop", "Home Repair", "Pickup & Return"];
const travelServiceTypes = ["Home Repair", "Pickup & Return"];
const partsQualityOptions = ["Original", "High-quality copy", "Refurbished", "Not sure"];
const lateMinuteOptions = ["15 minutes", "30 minutes", "45 minutes", "60 minutes"];
const quoteTabs = ["All Offers", "Recommended", "Cheapest", "Fastest", "Selected"] as const;

type QuoteTab = (typeof quoteTabs)[number];
type ScoredOffer = OfferRecord & {
    score: number;
    label: "Best Match" | "Fastest" | "Best Value" | "Cheapest" | "Selected";
};

const chatContextKey = (needId: string, quoteId: string) => `needero-chat:${needId}:${quoteId}`;

function AvatarCircle({ src, name, className }: { src?: string | null; name: string; className: string }) {
    const [failed, setFailed] = useState(false);
    const showImage = Boolean(src && !failed);

    return (
        <div className={`shrink-0 overflow-hidden rounded-full border border-[#dadbdd] bg-white font-black text-[#222325] ${className}`}>
            {showImage ? (
                <img src={src || ""} alt={name} className="h-full w-full object-cover" onError={() => setFailed(true)} />
            ) : (
                <div className="flex h-full w-full items-center justify-center">{(name || "U").charAt(0).toUpperCase()}</div>
            )}
        </div>
    );
}

function MoneyInput({
    value,
    onChange,
    placeholder = "0",
    required = false,
    min = "0",
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    min?: string;
}) {
    return (
        <div className="flex overflow-hidden rounded-xl border border-[#dadbdd] bg-white focus-within:border-[#222325] focus-within:ring-4 focus-within:ring-black/5">
            <span className="flex w-16 shrink-0 items-center justify-center border-r border-[#dadbdd] bg-[#f7f7f7] text-xs font-black text-[#74767e]">NPR</span>
            <input
                type="number"
                min={min}
                step="0.01"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                required={required}
                className="min-w-0 flex-1 px-4 py-3 text-sm outline-none"
            />
        </div>
    );
}

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

const needsTravelCharge = (serviceType: string) => travelServiceTypes.includes(serviceType);

const extraChargeLabel = (serviceType: string) => {
    if (serviceType === "Home Repair") return "Home repair fee";
    if (serviceType === "Pickup & Return") return "Pickup & return fee";
    return "Extra charge";
};

const formatDistanceDraft = (distance: string, unit: QuoteDraft["distanceUnit"]) => {
    const value = distance.trim();
    if (!value) return "Nearby";
    return `${value} ${unit} away`;
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

function NeedMedia({ src, title, category }: { src?: string | null; title: string; category: string }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="absolute inset-0 overflow-hidden bg-[#0b0b0f] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(255,255,255,0.14),transparent_28%)]" />
                <div className="relative flex h-full flex-col justify-between p-5">
                    <span className="w-fit rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/70">
                        Need
                    </span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">{category}</p>
                        <h3 className="mt-2 line-clamp-2 text-xl font-black leading-tight tracking-[-0.03em]">{title}</h3>
                    </div>
                </div>
            </div>
        );
    }

    const isVideo = src.startsWith("data:video") || /\.(mp4|webm|mov)$/i.test(src);
    const isPdf = src.startsWith("data:application/pdf") || /\.pdf(?:\?|$)/i.test(src);
    if (isPdf) {
        return (
            <div className="flex h-full w-full flex-col items-center justify-center bg-white p-5 text-center">
                <div className="rounded-2xl bg-[#222325] p-3 text-white">
                    <FileText size={24} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm font-black text-[#222325]">{title}</p>
                <p className="mt-1 text-xs font-semibold text-[#74767e]">PDF attachment</p>
            </div>
        );
    }
    return isVideo ? (
        <video src={src} controls className="h-full w-full object-cover" onError={() => setFailed(true)} />
    ) : (
        <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
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
        ["Estimated time", offer.time || "Not specified"],
        ["Warranty", offer.warranty || "Not specified"],
        ["Parts quality", offer.partsQuality || "Not specified"],
        ["Availability", offer.availability || "Not specified"],
        ["Included", offer.included || "Repair details in note"],
    ];

    return (
        <article className={`rounded-2xl border border-[#e4e5e7] bg-white p-5 shadow-sm ${
            offer.label === "Best Match" || offer.label === "Selected"
                ? "ring-2 ring-[#222325]"
                : ""
        }`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <AvatarCircle src={offer.businessAvatar} name={offer.businessName || "Business"} className="h-9 w-9 text-sm" />
                    <div>
                        <p className="text-sm font-bold" style={{color:"#404145"}}>{offer.businessName}</p>
                        <p className="text-xs" style={{color:"#74767e"}}>Score: {offer.score}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-[#222325] px-3 py-1 text-[11px] font-black text-white">{offer.label}</span>
                    <p className="text-lg font-bold" style={{color:"#404145"}}>{offer.price||"Open"}</p>
                </div>
            </div>

            {/* Details grid */}
            <div className="grid gap-2 sm:grid-cols-2 mb-4">
                {rows.map(([label,value])=>(
                    <div key={label} className="rounded-lg p-3" style={{background:"#f9fafb",border:"1px solid #e4e5e7"}}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:"#b5b6ba"}}>{label}</p>
                        <p className="text-sm font-semibold" style={{color:"#404145"}}>{value}</p>
                    </div>
                ))}
            </div>

            {offer.businessNote&&(
                <div className="mb-4 rounded-lg p-4" style={{background:"#f6f6f6",border:"1px solid #e4e5e7"}}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:"#222325"}}>Business Note</p>
                    <p className="text-sm" style={{color:"#404145"}}>{offer.businessNote}</p>
                </div>
            )}

            {(canOrder||canChat)&&(
                <div className="flex gap-2">
                    {canChat&&(
                        <button onClick={onChat} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#222325] px-4 py-2 text-sm font-black text-white transition hover:bg-black">
                            <MessageSquare size={14}/> Message
                        </button>
                    )}
                    {canOrder&&(
                        <button onClick={onOrder} disabled={ordering} className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#222325] px-4 py-2 text-sm font-black text-white transition hover:bg-black disabled:opacity-60">
                            {ordering?<Clock size={14} className="animate-spin"/>:<ShoppingBag size={14}/>}
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
    const canSendBusinessOffer = Boolean(isBusiness && profile?.phoneVerified && profile?.phoneNumber);
    const businessQuoteBlocker = !canSendBusinessOffer
        ? "Verify your phone number with SMS OTP from Profile before sending Repair Offers."
        : "";
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
    const [offers, setOffers] = useState<OfferRecord[]>([]);
    const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
    const [locationStatus, setLocationStatus] = useState("Finding your area...");
    const [viewerLocation, setViewerLocation] = useState<ViewerLocation | null>(null);
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

    const selectedNeed = useMemo(
        () => needs.find((need) => need.id === selectedNeedId) || null,
        [needs, selectedNeedId],
    );
    const scoredOffers = useMemo(() => scoreOffers(offers), [offers]);
    const filteredNeeds = useMemo(() => {
        const query = searchQuery.toLowerCase();
        const visibleNeeds = searchQuery.trim()
            ? needs.filter(need =>
                need.title.toLowerCase().includes(query) ||
                (need.description && need.description.toLowerCase().includes(query)) ||
                (need.issue && need.issue.toLowerCase().includes(query)) ||
                need.category.toLowerCase().includes(query) ||
                need.location.toLowerCase().includes(query)
            )
            : needs;

        return [...visibleNeeds].sort((a, b) => {
            const rankDiff = localRank(b, viewerLocation) - localRank(a, viewerLocation);
            if (rankDiff !== 0) return rankDiff;
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
        });
    }, [needs, searchQuery, viewerLocation]);

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
            const data = await getNeeds(undefined, undefined, true);
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

    const requestLocation = async () => {
        setLocationStatus("Finding nearby Needs from your IP area...");
        try {
            const response = await fetch("https://ipapi.co/json/");
            if (!response.ok) throw new Error("IP area lookup failed");
            const data = await response.json();
            const latitude = Number(data.latitude);
            const longitude = Number(data.longitude);
            const cityName = String(data.city || "").trim();
            const regionCode = String(data.region_code || "").trim();
            const countryCode = String(data.country_code || "").trim();
            const label = [cityName, data.region, countryCode].filter(Boolean).join(", ") || "your area";

            setViewerLocation({
                latitude: Number.isFinite(latitude) ? latitude : undefined,
                longitude: Number.isFinite(longitude) ? longitude : undefined,
                city: cityName,
                regionCode,
                countryCode,
                label,
                source: "ip",
            });
            setLocationStatus(`Nearest first near ${label}`);
        } catch (error) {
            console.error("Area detection failed:", error);
            setViewerLocation(null);
            setLocationStatus("Area lookup failed. Showing newest Needs first.");
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const key = "needero-marketplace-location-requested";
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "1");
        void requestLocation();
    }, []);

    const updateDraft = (key: keyof QuoteDraft, value: string) => {
        setDraft((current) => {
            const next = { ...current, [key]: value } as QuoteDraft;
            if (key === "serviceType" && !needsTravelCharge(value)) {
                next.extraCharges = "";
                next.lateFee = "";
                next.delayRefundRule = "";
            }
            return next;
        });
    };

    const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !selectedNeedId || !isBusiness) return;
        if (!canSendBusinessOffer) {
            setMessage(businessQuoteBlocker || "Phone OTP is required before sending Repair Offers.");
            return;
        }

        setSaving(true);
        setMessage("");
        try {
            await createOffer({
                needId: selectedNeedId,
                businessId: user.uid,
                businessName: profile?.companyName || profile?.displayName || "Local Business",
                businessAvatar: profile?.photoURL || user.photoURL || null,
                price: draft.price,
                serviceType: draft.serviceType,
                time: draft.time,
                warranty: draft.warranty,
                included: draft.included,
                partsQuality: draft.partsQuality,
                extraCharges: needsTravelCharge(draft.serviceType) ? draft.extraCharges : "",
                distance: formatDistanceDraft(draft.distance, draft.distanceUnit),
                availability: draft.availability,
                delayRefundRule: needsTravelCharge(draft.serviceType) ? draft.delayRefundRule : "",
                lateFee: "",
                note: draft.note,
            });
            setDraft(emptyDraft);
            setMessage("Repair Offer submitted. It is now inside the customer Offer Inbox.");
            await loadOffers(selectedNeedId);
            await loadNeeds();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not send quote.");
        } finally {
            setSaving(false);
        }
    };

    const startQuoteChat = async (offer: OfferRecord, mode: "chat" | "choose") => {
        if (!selectedNeed || !user) return;
        setMessage("");
        if (typeof window !== "undefined") {
            window.sessionStorage.setItem(chatContextKey(selectedNeed.id, offer.id), JSON.stringify({
                businessAvatar: offer.businessAvatar || "",
                businessName: offer.businessName || "Local Business",
                needTitle: selectedNeed.title || "Need conversation",
                customerName: selectedNeed.customerName || "Customer",
                customerAvatar: selectedNeed.customerAvatar || "",
                offerPrice: offer.price || "",
                draftText: mode === "choose"
                    ? `I want to choose this Offer for "${selectedNeed.title}". Offer: ${offer.price || "open price"} - ${offer.serviceType || "service"} - ${offer.time || "time to confirm"}.`
                    : `Hi, I want to talk about this Offer for "${selectedNeed.title}".`,
            }));
        }
        const params = new URLSearchParams({
            needId: selectedNeed.id,
            quoteId: offer.id,
            businessId: offer.businessId || "",
            businessName: offer.businessName || "Local Business",
            order: "0",
        });
        router.push(`/messages?${params.toString()}`);
    };

    const chooseQuote = async (offer: OfferRecord) => {
        if (!user || !selectedNeed || accountType !== "customer") return;
        setOrderingOfferId(offer.id);
        await startQuoteChat(offer, "choose");
        setOrderingOfferId(null);
    };

    const canOrderSelectedNeed = Boolean(
        selectedNeed && accountType === "customer" && selectedNeed.customerId === user?.uid,
    );

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main style={{background:"#fafafa",minHeight:"100vh",color:"#222325"}}>
                {/* ── HEADER ── */}
                <div style={{background:"#fff",borderBottom:"1px solid #e4e5e7"}}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-7">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] mb-2" style={{color:"#222325"}}>
                                    {isBusiness?"Repair Lead Inbox":"Browse Repair Offers"}
                                </p>
                                <h1 className="font-heading text-3xl font-black tracking-[-0.04em]" style={{color:"#222325"}}>
                                    {isBusiness?"Phone Repair Needs Near You":"Find Phone Repair Offers"}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm" style={{color:"#74767e"}}>
                                    <span className="font-semibold">{loading ? "Loading" : `${needs.length} live`} repair Needs</span>
                                    <span className="h-1 w-1 rounded-full bg-[#b5b6ba]" />
                                    <span>{locationStatus}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex h-11 min-w-[280px] items-center overflow-hidden rounded-full border bg-white" style={{borderColor:"#d7d9dc"}}>
                                    <Search size={16} className="ml-4 shrink-0" style={{color:"#74767e"}}/>
                                    <input type="text" placeholder="Search needs..." value={searchQuery}
                                        onChange={e=>setSearchQuery(e.target.value)}
                                        className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" style={{color:"#222325"}}/>
                                </div>
                                <button onClick={() => void requestLocation()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#222325] px-5 text-sm font-black text-[#222325] transition hover:bg-[#222325] hover:text-white">
                                    <Navigation size={14}/> My Area
                                </button>
                            </div>
                        </div>
                        {/* Stats */}
                        <div className="hidden">
                            {[{label:"Live Needs",value:loading?"...":String(needs.length)},
                              {label:"Pipeline",value:"Repair Need -> Offer -> Customer choice"},
                              {label:isBusiness?"Your action":"Your action",value:isBusiness?"Send Repair Offers":"Choose Offer"},
                              {label:"Area",value:locationStatus}].map(s=>(
                                <div key={s.label} className="flex flex-col">
                                    <p className="text-xs" style={{color:"#74767e"}}>{s.label}</p>
                                    <p className="text-sm font-bold" style={{color:"#404145"}}>{s.value}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
                            {["Phone issue", "Service option", "Shop trust", "NPR price", "Urgency"].map((filter) => (
                                <button key={filter} className="whitespace-nowrap rounded-full border border-[#d7d9dc] bg-white px-5 py-2.5 text-sm font-bold text-[#222325] transition hover:border-[#222325]">
                                    {filter}
                                </button>
                            ))}
                            <button className="whitespace-nowrap rounded-full bg-[#222325] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black">
                                Recommended
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── NEEDS GRID ── */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
                    {message&&(
                        <div className="mb-4 rounded-xl border px-4 py-3 text-sm" style={{borderColor:"#fde68a",background:"#fffbeb",color:"#92630a"}}>
                            {message}
                        </div>
                    )}

                    {filteredNeeds.length===0&&!loading?(
                        <div className="rounded-2xl border-2 border-dashed py-20 text-center" style={{borderColor:"#e4e5e7"}}>
                            <Briefcase size={40} className="mx-auto mb-4" style={{color:"#d1d5db"}}/>
                            <h2 className="text-xl font-bold mb-2" style={{color:"#404145"}}>
                                {searchQuery?`No results for "${searchQuery}"`:'No live phone repair Needs loaded'}
                            </h2>
                            <p className="text-sm mb-5" style={{color:"#74767e"}}>
                                {searchQuery?'Try screen, battery, charging, or water damage.':'Phone repair Needs appear here once customers post them.'}
                            </p>
                            {!searchQuery&&(
                                <button onClick={loadNeeds} className="rounded-full bg-[#222325] px-6 py-3 text-sm font-black text-white transition hover:bg-black">
                                    Refresh
                                </button>
                            )}
                        </div>
                    ):(
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredNeeds.map((need) => {
                                const localLabel = needDistanceLabel(need, viewerLocation);
                                return (
                                <article key={need.id}
                                    className={`overflow-hidden rounded-xl border border-[#e4e5e7] bg-white shadow-sm transition hover:shadow-xl ${
                                        selectedNeedId===need.id?"ring-2 ring-[#222325]":""
                                    }`}
                                    onClick={()=>router.push(`/marketplace/${encodeURIComponent(need.id)}`)}
                                >
                                    <div className="relative w-full overflow-hidden bg-gray-100" style={{aspectRatio:"4/3"}}>
                                        <NeedMedia src={need.photoPreview} title={need.title} category={need.category} />
                                        {need.status === "solved" && (
                                            <span className="absolute top-2 right-2 rounded bg-green-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm flex items-center">
                                                <CheckCircle2 size={12} className="mr-1" /> Offer Completed
                                            </span>
                                        )}
                                        {need.urgency==="Immediate"&&(
                                            <span className="absolute top-2 left-2 nd-badge nd-badge-red" style={{fontSize:"10px",padding:"2px 8px"}}>
                                                <Flame size={10} className="mr-1 fill-current" /> Urgent
                                            </span>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <div className="mb-3 flex items-center gap-2">
                                            <span className="rounded bg-[#f5f5f5] px-2.5 py-1 text-[11px] font-bold text-[#62646a]">{need.category}</span>
                                            {localLabel && (
                                                <span className="rounded bg-[#222325] px-2.5 py-1 text-[11px] font-bold text-white">{localLabel}</span>
                                            )}
                                            <span className="ml-auto text-xs font-semibold text-[#74767e]">{need.offers || 0} offers</span>
                                        </div>
                                        <div className="mb-3 flex items-center gap-2">
                                            <AvatarCircle src={need.customerAvatar} name={need.customerName || "Customer"} className="h-7 w-7 text-[11px]" />
                                            <span className="truncate text-xs font-bold text-[#62646a]">{need.customerName || "Customer"}</span>
                                        </div>
                                        <h3 className="line-clamp-2 min-h-[48px] text-base font-semibold leading-snug text-[#222325]">{need.title}</h3>
                                        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[#efeff0] pt-4">
                                            <span className="flex min-w-0 items-center gap-1 text-xs" style={{color:"#74767e"}}>
                                                <MapPin size={11}/>{need.location}
                                            </span>
                                            <div className="max-w-[45%] text-right">
                                                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#95979d]">Customer budget</p>
                                                <p className="truncate text-sm font-black text-[#222325]">
                                                    {need.budget || "Open"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── DETAIL PANEL ── */}
                {selectedNeed&&(
                    <div className="fixed inset-0 z-[90] flex justify-end" style={{background:"rgba(0,0,0,0.45)",backdropFilter:"blur(2px)"}} onClick={()=>setSelectedNeedId(null)}>
                        <aside
                            className={`flex h-full flex-col bg-white shadow-2xl transition-all duration-300 ${isSidebarExpanded?"w-full":"w-full max-w-3xl"}`}
                            style={{borderLeft:"1px solid #e4e5e7"}}
                            onClick={e=>e.stopPropagation()}
                        >
                            {/* Sticky header */}
                            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{background:"#fff",borderBottom:"1px solid #e4e5e7"}}>
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>setSelectedNeedId(null)}
                                        className="h-9 w-9 flex items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                                        style={{color:"#74767e"}}>
                                        <X size={18}/>
                                    </button>
                                    <button onClick={()=>setIsSidebarExpanded(!isSidebarExpanded)}
                                        className="hidden md:flex nd-btn nd-btn-ghost nd-btn-sm rounded-full text-xs">
                                        {isSidebarExpanded?"Compact":"Expand"}
                                    </button>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold" style={{color:"#74767e"}}>Quote Interaction</span>
                                    <div className="h-2 w-2 rounded-full animate-pulse" style={{background:"#222325"}}/>
                                </div>
                            </div>

                            {/* Scrollable */}
                            <div className="flex-1 overflow-y-auto">
                                {/* Need info */}
                                <div className="px-6 py-8" style={{borderBottom:"1px solid #e4e5e7"}}>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="nd-badge nd-badge-gray">{selectedNeed.category}</span>
                                        <span className="nd-badge nd-badge-amber">{selectedNeed.urgency}</span>
                                        <span className="nd-badge nd-badge-blue">{selectedNeed.location}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold mb-3" style={{color:"#404145"}}>{selectedNeed.title}</h2>
                                    <p className="text-sm leading-relaxed mb-5" style={{color:"#74767e"}}>{selectedNeed.issue}</p>
                                    <div className="flex gap-4">
                                        <div className="nd-stat-tile flex-1">
                                                <p className="nd-stat-label">Customer budget</p>
                                            <p className="nd-stat-value" style={{fontSize:"20px"}}>{selectedNeed.budget||"Flexible"}</p>
                                        </div>
                                        <div className="nd-stat-tile flex-1">
                                            <p className="nd-stat-label">Timeline</p>
                                            <p className="text-sm font-bold" style={{color:"#404145"}}>{selectedNeed.urgency==="Immediate"?"ASAP":"Flexible"}</p>
                                        </div>
                                    </div>
                                    {selectedNeed.photoPreview&&(
                                        <div className="mt-5 overflow-hidden rounded-xl" style={{border:"1px solid #e4e5e7"}}>
                                            <NeedMedia
                                                src={selectedNeed.photoPreview}
                                                title={selectedNeed.title}
                                                category={selectedNeed.category}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Offers section */}
                                <div className="px-6 py-6">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                        <h3 className="text-lg font-bold" style={{color:"#404145"}}>Repair Offers ({offers.length})</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {quoteTabs.map(tab=>(
                                                <button key={tab} onClick={()=>setQuoteTab(tab)}
                                                    className="nd-chip text-xs py-1 px-3"
                                                    style={quoteTab===tab?{background:"#222325",color:"#fff",borderColor:"#222325"}:{}}>
                                                    {tab}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {offersLoading?(
                                            <div className="py-12 text-center">
                                                <Clock size={32} className="mx-auto mb-3 animate-spin" style={{color:"#e4e5e7"}}/>
                                                <p className="text-sm" style={{color:"#74767e"}}>Loading offers...</p>
                                            </div>
                                        ):visibleOffers.length===0?(
                                            <div className="rounded-2xl border-2 border-dashed py-12 text-center" style={{borderColor:"#e4e5e7"}}>
                                                <MessageCircle size={32} className="mx-auto mb-3" style={{color:"#d1d5db"}}/>
                                                <p className="text-sm font-semibold" style={{color:"#74767e"}}>No quotes yet</p>
                                                <p className="text-xs mt-1" style={{color:"#b5b6ba"}}>Be the first repair shop to send an Offer.</p>
                                            </div>
                                        ):(
                                            visibleOffers.map(offer=>(
                                                <QuoteCard key={offer.id} offer={offer}
                                                    canOrder={canOrderSelectedNeed}
                                                    canChat={canOrderSelectedNeed}
                                                    ordering={orderingOfferId===offer.id}
                                                    onChat={()=>void startQuoteChat(offer, "chat")}
                                                    onOrder={()=>void chooseQuote(offer)}/>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Business quote form */}
                                {isBusiness&&!hasSubmittedQuote&&(
                                    <div className="px-6 pb-8">
                                        <div className="rounded-2xl p-6" style={{border:"2px solid #222325",background:"#ffffff"}}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-xl" style={{background:"#222325"}}>
                                                    <ShieldCheck size={20} color="#fff"/>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold" style={{color:"#404145"}}>Send Repair Offer</h3>
                                                    <p className="text-xs" style={{color:"#74767e"}}>
                                                        {canSendBusinessOffer ? "Submit price, time, warranty, parts quality, and availability." : businessQuoteBlocker}
                                                    </p>
                                                </div>
                                            </div>
                                            {!canSendBusinessOffer ? (
                                                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                                                    <ShieldCheck className="mx-auto text-amber-700" size={28} />
                                                    <p className="mt-3 text-sm font-black text-amber-950">Phone OTP required before quoting</p>
                                                    <p className="mt-1 text-xs leading-5 text-amber-800">{businessQuoteBlocker}</p>
                                                    <Link href="/profile" className="mt-4 inline-flex rounded-xl bg-[#222325] px-5 py-3 text-xs font-black text-white">
                                                        Verify Phone to Quote
                                                    </Link>
                                                </div>
                                            ) : (
                                            <form onSubmit={submitQuote} className="grid gap-4">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Price (NPR)*</label>
                                                        <MoneyInput value={draft.price} onChange={(value) => updateDraft("price", value)} placeholder="4500" required min="1" />
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Service Type</label>
                                                        <select value={draft.serviceType} onChange={e=>updateDraft("serviceType",e.target.value)} className="nd-select w-full">
                                                            {serviceTypes.map(t=><option key={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Estimated repair time*</label>
                                                        <input type="datetime-local" value={draft.time} onChange={e=>updateDraft("time",e.target.value)} required className="nd-input"/>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Warranty</label>
                                                        <input value={draft.warranty} onChange={e=>updateDraft("warranty",e.target.value)} placeholder="e.g. 30 days" className="nd-input"/>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Parts quality</label>
                                                        <select value={draft.partsQuality} onChange={e=>updateDraft("partsQuality",e.target.value)} className="nd-select w-full">
                                                            {partsQualityOptions.map(t=><option key={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Availability</label>
                                                        <input value={draft.availability} onChange={e=>updateDraft("availability",e.target.value)} placeholder="Available today 4 PM" className="nd-input"/>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Included / repair note</label>
                                                        <input value={draft.included} onChange={e=>updateDraft("included",e.target.value)} placeholder="e.g. Screen part + labor included" className="nd-input"/>
                                                    </div>
                                                    {needsTravelCharge(draft.serviceType)&&(
                                                        <div>
                                                            <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>{extraChargeLabel(draft.serviceType)} (NPR)</label>
                                                            <MoneyInput value={draft.extraCharges} onChange={(value) => updateDraft("extraCharges", value)} placeholder="0" required />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Distance from customer</label>
                                                        <div className="grid grid-cols-[1fr_86px] gap-2">
                                                            <input type="number" min="0" step="1" value={draft.distance} onChange={e=>updateDraft("distance",e.target.value)} placeholder="350" className="nd-input"/>
                                                            <select value={draft.distanceUnit} onChange={e=>updateDraft("distanceUnit",e.target.value)} className="nd-select w-full">
                                                                <option value="m">m</option>
                                                                <option value="km">km</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Message to Customer*</label>
                                                    <textarea value={draft.note} onChange={e=>updateDraft("note",e.target.value)} placeholder="Explain diagnosis, repair risk, warranty, and pickup/return terms." required rows={3} className="nd-input resize-none"/>
                                                </div>
                                                <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222325] py-3.5 text-base font-black text-white transition hover:bg-black disabled:opacity-60">
                                                    {saving?<Clock size={18} className="animate-spin"/>:<Send size={18}/>}
                                                    Send Repair Offer
                                                </button>
                                            </form>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {hasSubmittedQuote&&(
                                    <div className="px-6 pb-8">
                                        <div className="rounded-2xl p-8 text-center" style={{background:"#f6f6f6",border:"1px solid #e4e5e7"}}>
                                            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full mb-4" style={{background:"#ffffff",border:"1px solid #e4e5e7"}}>
                                                <CheckCircle2 size={32} style={{color:"#222325"}}/>
                                            </div>
                                            <h3 className="text-lg font-bold mb-2" style={{color:"#404145"}}>Repair Offer Submitted!</h3>
                                            <p className="text-sm" style={{color:"#74767e"}}>Your repair Offer is visible in the list above.</p>
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
