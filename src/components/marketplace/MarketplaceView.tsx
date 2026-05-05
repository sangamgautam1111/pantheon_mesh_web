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
    Star,
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
    formatMoney,
} from "@/lib/neederoDatabase";

type QuoteDraft = {
    price: string;
    serviceType: string;
    time: string;
    warranty: string;
    included: string;
    qualityLevel: string;
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
    serviceType: "Visit Business",
    time: "",
    warranty: "",
    included: "",
    qualityLevel: "Standard",
    extraCharges: "",
    distance: "",
    distanceUnit: "m",
    availability: "",
    delayRefundRule: "",
    lateFee: "",
    note: "",
};

const serviceTypes = ["Visit Business", "Home Service", "Pickup & Return", "Delivery"];
const travelServiceTypes = ["Home Service", "Pickup & Return", "Delivery"];
const qualityLevelOptions = ["Premium", "Standard", "Economy", "N/A"];
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
    category,
}: {
    offer: ScoredOffer;
    canOrder: boolean;
    canChat: boolean;
    ordering: boolean;
    onChat: () => void;
    onOrder: () => void;
    category?: string;
}) {
    const isFood = category === "Food Service & Delivery";
    const rows = [
        ["Service type", offer.serviceType || "Not specified"],
        [isFood ? "Prep/Delivery time" : "Estimated time", offer.time || "Not specified"],
        [isFood ? "Special Note" : "Condition/Note", offer.warranty || "Not specified"],
        [isFood ? "Food Source" : "Quality Level", offer.qualityLevel || "Not specified"],
        ["Availability", offer.availability || "Not specified"],
        ["Included", offer.included || (isFood ? "Order details in note" : "Service details in note")],
    ];

    return (
        <article className={`rounded-2xl border border-[#e4e5e7] bg-white p-5 shadow-sm ${
            offer.label === "Best Match" || offer.label === "Selected"
                ? "ring-2 ring-[#222325]"
                : ""
        }`}>
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <AvatarCircle src={offer.businessAvatar} name={offer.businessName || "Business"} className="h-9 w-9 text-sm" />
                    <div>
                        <p className="text-sm font-bold text-[#404145]">{offer.businessName}</p>
                        <p className="text-xs text-[#74767e]">Score: {offer.score}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-[#222325] px-3 py-1 text-[11px] font-black text-white">{offer.label}</span>
                    <p className="text-lg font-bold text-[#404145]">{offer.price||"Open"}</p>
                </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 mb-4">
                {rows.map(([label,value])=>(
                    <div key={label} className="rounded-lg p-3 bg-[#f9fafb] border border-[#e4e5e7]">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[#b5b6ba]">{label}</p>
                        <p className="text-sm font-semibold text-[#404145]">{value}</p>
                    </div>
                ))}
            </div>

            {offer.businessNote&&(
                <div className="mb-4 rounded-lg p-4 bg-[#f6f6f6] border border-[#e4e5e7]">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-[#222325]">Business Note</p>
                    <p className="text-sm text-[#404145]">{offer.businessNote}</p>
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

const categorySlugs: Record<string, string> = {
    "all": "All Categories",
    "general": "General Service",
    "food": "Food Service & Delivery",
    "home": "Home Service",
};

const slugToCategory = (slug: string) => categorySlugs[slug] || "All Categories";
const categoryToSlug = (cat: string) => Object.keys(categorySlugs).find(k => categorySlugs[k] === cat) || "all";

export interface MarketplaceViewProps {
    initialCategory?: string;
    isCategoryLocked?: boolean;
}

export function MarketplaceView({ initialCategory = "All Categories", isCategoryLocked = false }: MarketplaceViewProps) {
    const router = useRouter();
    const { user, profile, accountType } = useAuth();
    const isBusiness = accountType === "business";
    const canSendBusinessOffer = Boolean(isBusiness && profile?.phoneVerified && profile?.phoneNumber);
    const businessQuoteBlocker = !canSendBusinessOffer
        ? "Verify your phone number with SMS OTP from Profile before sending Offers."
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
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

    useEffect(() => {
        if (!isCategoryLocked) {
            setSelectedCategory(initialCategory);
        }
    }, [initialCategory, isCategoryLocked]);

    const selectedNeed = useMemo(
        () => needs.find((need) => need.id === selectedNeedId) || null,
        [needs, selectedNeedId],
    );
    
    const scoredOffers = useMemo(() => scoreOffers(offers), [offers]);
    
    const filteredNeeds = useMemo(() => {
        const visibleNeeds = needs.filter(need => {
            const matchesCategory = selectedCategory === "All Categories" || need.category === selectedCategory;
            if (!matchesCategory) return false;
            
            if (!searchQuery.trim()) return true;
            
            const query = searchQuery.toLowerCase();
            return (
                need.title.toLowerCase().includes(query) ||
                (need.description && need.description.toLowerCase().includes(query)) ||
                (need.issue && need.issue.toLowerCase().includes(query)) ||
                need.category.toLowerCase().includes(query) ||
                need.location.toLowerCase().includes(query)
            );
        });

        return [...visibleNeeds].sort((a, b) => {
            const rankDiff = localRank(b, viewerLocation) - localRank(a, viewerLocation);
            if (rankDiff !== 0) return rankDiff;
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
        });
    }, [needs, searchQuery, viewerLocation, selectedCategory]);

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

    const handleCategoryClick = (cat: string) => {
        if (isCategoryLocked) return;
        const slug = categoryToSlug(cat);
        if (slug === "all") {
            router.push("/marketplace");
        } else {
            router.push(`/marketplace/category/${slug}`);
        }
    };

    const pageTitle = selectedCategory === "All Categories" 
        ? (isBusiness ? "Service Needs Near You" : "Find Service Offers")
        : `Marketplace: ${selectedCategory}`;

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#fafafa] text-[#222325]">
                <div className="bg-white border-b border-[#e4e5e7]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-7">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] mb-2 text-[#222325]">
                                    {isBusiness?"Lead Inbox":"Browse Offers"}
                                </p>
                                <h1 className="font-heading text-3xl font-black tracking-[-0.04em] text-[#222325]">
                                    {pageTitle}
                                </h1>
                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#74767e]">
                                    <span className="font-semibold">{loading ? "Loading" : `${needs.length} live`} marketplace needs</span>
                                    <span className="h-1 w-1 rounded-full bg-[#b5b6ba]" />
                                    <span>{locationStatus}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="flex h-11 min-w-[280px] items-center overflow-hidden rounded-full border border-[#d7d9dc] bg-white">
                                    <Search size={16} className="ml-4 shrink-0 text-[#74767e]"/>
                                    <input type="text" placeholder="Search needs..." value={searchQuery}
                                        onChange={e=>setSearchQuery(e.target.value)}
                                        className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none text-[#222325]"/>
                                </div>
                                <button onClick={() => void requestLocation()} className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[#222325] px-5 text-sm font-black text-[#222325] transition hover:bg-[#222325] hover:text-white">
                                    <Navigation size={14}/> My Area
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 flex gap-6 border-b border-[#e4e5e7]">
                            {Object.values(categorySlugs).map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryClick(cat)}
                                    className={`pb-4 text-sm font-black transition-colors ${
                                        selectedCategory === cat
                                            ? "border-b-2 border-[#222325] text-[#222325]"
                                            : "text-[#74767e] hover:text-[#222325]"
                                    } ${isCategoryLocked && selectedCategory !== cat ? "hidden" : ""}`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
                            {["Issue", "Service option", "Trust", "Price", "Urgency"].map((filter) => (
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

                <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
                    {message&&(
                        <div className="mb-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm text-[#92630a]">
                            {message}
                        </div>
                    )}

                    {filteredNeeds.length===0&&!loading?(
                        <div className="rounded-2xl border-2 border-dashed border-[#e4e5e7] py-20 text-center">
                            <Briefcase size={40} className="mx-auto mb-4 text-[#d1d5db]"/>
                            <h2 className="text-xl font-bold mb-2 text-[#404145]">
                                {searchQuery?`No results for "${searchQuery}"`:'No live marketplace needs loaded'}
                            </h2>
                            <p className="text-sm mb-5 text-[#74767e]">
                                {searchQuery?'Try food delivery, home cleaning, or repair.':'Service Needs appear here once customers post them.'}
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
                                    className={`overflow-hidden rounded-xl border border-[#e4e5e7] bg-white shadow-sm transition hover:shadow-xl cursor-pointer ${
                                        selectedNeedId===need.id?"ring-2 ring-[#222325]":""
                                    }`}
                                    onClick={()=>router.push(`/marketplace/${encodeURIComponent(need.id)}`)}
                                >
                                    <div className="relative w-full overflow-hidden bg-gray-100 aspect-[4/3]">
                                        <NeedMedia src={need.photoPreview} title={need.title} category={need.category} />
                                        {need.status === "solved" && (
                                            <span className="absolute top-2 right-2 rounded bg-green-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm flex items-center">
                                                <CheckCircle2 size={12} className="mr-1" /> Offer Completed
                                            </span>
                                        )}
                                        {need.urgency==="Immediate"&&(
                                            <span className="absolute top-2 left-2 rounded bg-red-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm flex items-center">
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
                                            <span className="flex min-w-0 items-center gap-1 text-xs text-[#74767e]">
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
            </main>
        </RouteGuard>
    );
}
