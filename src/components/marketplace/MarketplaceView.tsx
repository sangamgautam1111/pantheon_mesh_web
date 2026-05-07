"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Briefcase,
    CheckCircle2,
    ChevronDown,
    Clock,
    FileText,
    Filter,
    Flame,
    Home,
    MapPin,
    MessageSquare,
    Navigation,
    Search,
    Send,
    ShoppingBag,
    ShieldCheck,
    SlidersHorizontal,
    Smartphone,
    Star,
    TrendingUp,
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

const serviceTypes = ["Visit Business", "Home Service", "Pickup & Return"];
const travelServiceTypes = ["Home Service", "Pickup & Return"];
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
                        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">{displayCategory(category)}</p>
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
    const rows = [
        ["Service type", offer.serviceType || "Not specified"],
        ["Estimated time", offer.time || "Not specified"],
        ["Condition/Note", offer.warranty || "Not specified"],
        ["Quality Level", offer.qualityLevel || "Not specified"],
        ["Availability", offer.availability || "Not specified"],
        ["Included", offer.included || "Service details in note"],
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
    "home": "Home Cleaning",
    "mobile": "Mobile Repair",
};

const slugToCategory = (slug: string) => categorySlugs[slug] || "All Categories";
const categoryToSlug = (cat: string) => {
    const normalized = cat === "General Service" ? "Mobile Repair" : cat === "Home Service" ? "Home Cleaning" : cat;
    return Object.keys(categorySlugs).find(k => categorySlugs[k] === normalized) || "all";
};
const displayCategory = (cat: string) => cat === "General Service" ? "Mobile Repair" : cat === "Home Service" ? "Home Cleaning" : cat;

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
            const normalizedCategory = need.category === "General Service" ? "Mobile Repair" : need.category === "Home Service" ? "Home Cleaning" : need.category;
            const matchesCategory = selectedCategory === "All Categories" || normalizedCategory === selectedCategory;
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
        ? "Browse customer needs"
        : `${selectedCategory} customer needs`;

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f7faf8] text-[#081a13]">
                <section className="border-b border-[#dfe8e3] bg-white">
                    <div className="mx-auto max-w-[1220px] px-4 py-5 sm:px-6">
                        <div className="overflow-hidden rounded-[16px] border border-[#dfe8e3] bg-[linear-gradient(110deg,#ffffff_0%,#f7fff9_58%,#eaf8f1_100%)] px-5 py-6 md:px-7">
                            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-center">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#009f58]">
                                        {isBusiness ? "Seller lead inbox" : "Needero marketplace"}
                                    </p>
                                    <h1 className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#081a13] md:text-4xl">
                                        {pageTitle}. <span className="text-[#009f58]">Send better offers.</span>
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#5c6c64]">
                                        Browse mobile repair and home service requests. Compare customer budget, location, urgency, and active offers from one clean dashboard.
                                    </p>
                                </div>
                                <div className="rounded-[14px] border border-[#d4e9dc] bg-white p-4 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-[#5c6c64]">Marketplace at a glance</span>
                                        <TrendingUp size={17} className="text-[#009f58]" />
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3">
                                        {[
                                            [loading ? "..." : String(needs.length), "Active Needs"],
                                            ["2", "Core categories"],
                                            ["24/7", "Quote access"],
                                            ["98%", "Trust focus"],
                                        ].map(([value, label]) => (
                                            <div key={label} className="rounded-[10px] bg-[#f1faf5] p-3">
                                                <p className="text-xl font-black text-[#009f58]">{value}</p>
                                                <p className="text-[10px] font-black text-[#5c6c64]">{label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex h-11 min-w-0 flex-1 items-center overflow-hidden rounded-[10px] border border-[#d7e5dc] bg-white shadow-sm lg:max-w-xl">
                                <Search size={16} className="ml-4 shrink-0 text-[#6b7a73]" />
                                <input
                                    type="text"
                                    placeholder="Search customer needs, phone repair, cleaning..."
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-[#081a13] outline-none"
                                />
                            </div>
                            <div className="flex gap-2 overflow-x-auto">
                                {Object.values(categorySlugs).map((cat) => {
                                    const Icon = cat === "Home Cleaning" ? Home : cat === "Mobile Repair" ? Smartphone : SlidersHorizontal;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => handleCategoryClick(cat)}
                                            className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border px-4 text-xs font-black transition ${
                                                selectedCategory === cat
                                                    ? "border-[#009f58] bg-[#009f58] text-white"
                                                    : "border-[#d7e5dc] bg-white text-[#081a13] hover:border-[#009f58]"
                                            } ${isCategoryLocked && selectedCategory !== cat ? "hidden" : ""}`}
                                        >
                                            <Icon size={14} />
                                            {cat}
                                        </button>
                                    );
                                })}
                                <button onClick={() => void requestLocation()} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[10px] border border-[#081a13] bg-white px-4 text-xs font-black text-[#081a13]">
                                    <Navigation size={14} />
                                    My Area
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid max-w-[1220px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[190px_minmax(0,1fr)_260px]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-20 rounded-[14px] border border-[#dfe8e3] bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-[#081a13]">Filters</p>
                                <Filter size={15} className="text-[#009f58]" />
                            </div>
                            <div className="mt-5 space-y-5">
                                {[
                                    ["Budget (NPR)", ["Min amount", "Max amount"]],
                                    ["Location", ["My city only", "Nearby areas"]],
                                    ["Delivery time", ["Today", "Tomorrow", "Flexible"]],
                                    ["Category", ["Mobile Repair", "Home Cleaning"]],
                                ].map(([title, items]) => (
                                    <div key={title as string} className="border-t border-[#edf2ef] pt-4">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.12em] text-[#5c6c64]">
                                            {title as string}
                                            <ChevronDown size={13} />
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            {(items as string[]).map((item) => (
                                                <label key={item} className="flex items-center gap-2 text-xs font-semibold text-[#5c6c64]">
                                                    <input type="checkbox" className="h-3.5 w-3.5 rounded border-[#cbdad2] text-[#009f58]" />
                                                    {item}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <div>
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="text-sm font-black text-[#5c6c64]">
                                {loading ? "Loading customer needs" : `${filteredNeeds.length} customer needs found`}
                                <span className="ml-2 text-xs font-semibold text-[#87958f]">{locationStatus}</span>
                            </div>
                            <button className="inline-flex h-9 items-center justify-center gap-2 rounded-[8px] border border-[#d7e5dc] bg-white px-3 text-xs font-black text-[#081a13]">
                                Sort by: Newest first
                                <ChevronDown size={13} />
                            </button>
                        </div>

                        {message && (
                            <div className="mb-4 rounded-[12px] border border-[#fde68a] bg-[#fffbeb] px-4 py-3 text-sm font-bold text-[#92630a]">
                                {message}
                            </div>
                        )}

                        {filteredNeeds.length === 0 && !loading ? (
                            <div className="rounded-[14px] border-2 border-dashed border-[#dfe8e3] bg-white py-20 text-center">
                                <Briefcase size={38} className="mx-auto mb-4 text-[#cbd5d0]" />
                                <h2 className="text-xl font-black text-[#081a13]">
                                    {searchQuery ? `No results for "${searchQuery}"` : "No live customer needs loaded"}
                                </h2>
                                <p className="mt-2 text-sm font-semibold text-[#6b7a73]">
                                    {searchQuery ? "Try mobile repair or home cleaning." : "Customer Needs appear here once users post them."}
                                </p>
                                {!searchQuery && (
                                    <button onClick={loadNeeds} className="mt-5 rounded-[9px] bg-[#081a13] px-6 py-3 text-sm font-black text-white">
                                        Refresh
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filteredNeeds.map((need) => {
                                    const localLabel = needDistanceLabel(need, viewerLocation);
                                    const category = displayCategory(need.category);
                                    return (
                                        <article
                                            key={need.id}
                                            className={`grid cursor-pointer gap-4 rounded-[14px] border border-[#dfe8e3] bg-white p-3 shadow-sm transition hover:border-[#b8d8c5] hover:shadow-md md:grid-cols-[126px_minmax(0,1fr)_190px] ${
                                                selectedNeedId === need.id ? "ring-2 ring-[#009f58]" : ""
                                            }`}
                                            onClick={() => router.push(`/marketplace/${encodeURIComponent(need.id)}`)}
                                        >
                                            <div className="relative h-36 overflow-hidden rounded-[10px] bg-[#eff8f3] md:h-full">
                                                <NeedMedia src={need.photoPreview} title={need.title} category={need.category} />
                                                {need.urgency === "Immediate" && (
                                                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-1 text-[10px] font-black text-white">
                                                        <Flame size={10} />
                                                        Urgent
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0 py-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-[5px] bg-[#edf7f1] px-2.5 py-1 text-[10px] font-black text-[#087646]">{category}</span>
                                                    {localLabel && (
                                                        <span className="rounded-[5px] bg-[#f3f7f5] px-2.5 py-1 text-[10px] font-black text-[#5c6c64]">{localLabel}</span>
                                                    )}
                                                    {need.status === "solved" && (
                                                        <span className="inline-flex items-center gap-1 rounded-[5px] bg-[#e9f8f0] px-2.5 py-1 text-[10px] font-black text-[#087646]">
                                                            <CheckCircle2 size={11} />
                                                            Completed
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="mt-3 line-clamp-2 text-lg font-black leading-tight tracking-[-0.02em] text-[#081a13]">{need.title}</h3>
                                                <p className="mt-2 line-clamp-2 text-sm font-medium leading-6 text-[#5c6c64]">
                                                    {need.issue || need.description || "Customer is waiting for trusted local offers."}
                                                </p>
                                                <div className="mt-4 grid gap-2 text-xs font-bold text-[#5c6c64] sm:grid-cols-3">
                                                    <span className="inline-flex items-center gap-1">
                                                        <MapPin size={12} />
                                                        {need.location || "Location pending"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {need.urgency || "Flexible"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <ShieldCheck size={12} />
                                                        Customer verified
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="rounded-[12px] border border-[#edf2ef] bg-[#fbfdfc] p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#87958f]">Budget</p>
                                                <p className="mt-1 text-base font-black text-[#009f58]">{need.budget || "Open for quotes"}</p>
                                                <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#5c6c64]">
                                                    <span>{need.offers || 0} Active offers</span>
                                                    <span className="inline-flex items-center gap-1 text-[#f59e0b]">
                                                        <Star size={12} fill="currentColor" />
                                                        High intent
                                                    </span>
                                                </div>
                                                <button
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        router.push(`/marketplace/${encodeURIComponent(need.id)}`);
                                                    }}
                                                    className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[9px] bg-[#081a13] text-xs font-black text-white transition hover:bg-black"
                                                >
                                                    {isBusiness ? <Send size={13} /> : <ShoppingBag size={13} />}
                                                    {isBusiness ? "Send Offer" : "View Offers"}
                                                </button>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <aside className="space-y-4">
                        <div className="rounded-[14px] border border-[#dfe8e3] bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-black text-[#081a13]">Trending requests</p>
                                <Flame size={16} className="text-[#009f58]" />
                            </div>
                            <div className="mt-4 space-y-3">
                                {[
                                    ["iPhone screen repair", "12 offers"],
                                    ["Deep home cleaning", "8 offers"],
                                    ["Battery replacement", "6 offers"],
                                ].map(([title, offers]) => (
                                    <button key={title} className="flex w-full items-center justify-between gap-3 rounded-[10px] border border-[#edf2ef] p-3 text-left hover:border-[#b8d8c5]">
                                        <span>
                                            <span className="block text-xs font-black text-[#081a13]">{title}</span>
                                            <span className="block text-[11px] font-semibold text-[#6b7a73]">{offers}</span>
                                        </span>
                                        <ChevronDown size={13} className="-rotate-90 text-[#87958f]" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isBusiness && !canSendBusinessOffer && (
                            <div className="rounded-[14px] border border-[#cfe8d9] bg-[#edf9f2] p-4">
                                <ShieldCheck size={20} className="text-[#009f58]" />
                                <h3 className="mt-3 text-sm font-black text-[#081a13]">Phone verification required</h3>
                                <p className="mt-2 text-xs font-bold leading-5 text-[#5c6c64]">{businessQuoteBlocker}</p>
                                <Link href="/profile" className="mt-3 inline-flex h-9 items-center justify-center rounded-[8px] bg-[#009f58] px-4 text-xs font-black text-white">
                                    Complete profile
                                </Link>
                            </div>
                        )}

                        <div className="rounded-[14px] border border-[#dfe8e3] bg-white p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f8f0] text-[#009f58]">
                                    <MessageSquare size={18} />
                                </span>
                                <div>
                                    <h3 className="text-sm font-black text-[#081a13]">Need help?</h3>
                                    <p className="mt-1 text-xs font-semibold leading-5 text-[#6b7a73]">Our team is here to support your first Needero deal.</p>
                                </div>
                            </div>
                            <Link href="/support" className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-[8px] border border-[#d7e5dc] text-xs font-black text-[#081a13]">
                                Contact support
                            </Link>
                        </div>
                    </aside>
                </section>
            </main>
        </RouteGuard>
    );
}
