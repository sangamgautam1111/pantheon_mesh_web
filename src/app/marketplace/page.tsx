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

    const labelColor: Record<string, string> = {
        "Best Match": "nd-badge-green",
        "Fastest": "nd-badge-blue",
        "Best Value": "nd-badge-amber",
        "Cheapest": "nd-badge-amber",
        "Selected": "nd-badge-green",
    };
    return (
        <article className={`nd-card p-5 ${
            offer.label === "Best Match" || offer.label === "Selected"
                ? "ring-2 ring-[#1DBF73]"
                : ""
        }`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className="nd-avatar h-9 w-9 text-sm" style={{background:"#1DBF73",color:"#fff"}}>
                        {(offer.businessName||"B").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="text-sm font-bold" style={{color:"#404145"}}>{offer.businessName}</p>
                        <p className="text-xs" style={{color:"#74767e"}}>Score: {offer.score}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className={`nd-badge ${labelColor[offer.label]||"nd-badge-gray"}`}>{offer.label}</span>
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
                <div className="mb-4 rounded-lg p-4" style={{background:"#f0fdf4",border:"1px solid #c9f0dd"}}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{color:"#0f8a4a"}}>Business Note</p>
                    <p className="text-sm" style={{color:"#404145"}}>{offer.businessNote}</p>
                </div>
            )}

            {(canOrder||canChat)&&(
                <div className="flex gap-2">
                    {canChat&&(
                        <button onClick={onChat} className="nd-btn nd-btn-ghost nd-btn-sm flex-1 rounded-full gap-1.5">
                            <MessageSquare size={14}/> Chat
                        </button>
                    )}
                    {canOrder&&(
                        <button onClick={onOrder} disabled={ordering} className="nd-btn nd-btn-primary nd-btn-sm flex-1 rounded-full gap-1.5">
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

    const selectedNeed = useMemo(
        () => needs.find((need) => need.id === selectedNeedId) || null,
        [needs, selectedNeedId],
    );
    const scoredOffers = useMemo(() => scoreOffers(offers), [offers]);
    const filteredNeeds = useMemo(() => {
        if (!searchQuery.trim()) return needs;
        const query = searchQuery.toLowerCase();
        return needs.filter(need => 
            need.title.toLowerCase().includes(query) || 
            (need.description && need.description.toLowerCase().includes(query)) ||
            (need.issue && need.issue.toLowerCase().includes(query)) ||
            need.category.toLowerCase().includes(query) ||
            need.location.toLowerCase().includes(query)
        );
    }, [needs, searchQuery]);

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
            <main style={{background:"#fafafa",minHeight:"100vh",color:"#404145"}}>
                {/* ── HEADER ── */}
                <div style={{background:"#fff",borderBottom:"1px solid #e4e5e7"}}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{color:"#1DBF73"}}>
                                    {isBusiness?"Lead Inbox":"Browse Needs"}
                                </p>
                                <h1 className="font-heading text-2xl font-bold" style={{color:"#404145"}}>
                                    {isBusiness?"Customer Needs Near You":"Find Local Help"}
                                </h1>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{color:"#74767e"}}/>
                                    <input type="text" placeholder="Search needs..." value={searchQuery}
                                        onChange={e=>setSearchQuery(e.target.value)}
                                        className="nd-input rounded-full pl-9 py-2 text-sm" style={{width:"220px"}}/>
                                </div>
                                <button onClick={requestLocation} className="nd-btn nd-btn-ghost nd-btn-sm rounded-full gap-1.5">
                                    <Navigation size={14}/> My Area
                                </button>
                            </div>
                        </div>
                        {/* Stats */}
                        <div className="mt-4 flex flex-wrap gap-5">
                            {[{label:"Live Needs",value:loading?"...":String(needs.length)},
                              {label:"Pipeline",value:"Need→Quote→Booking"},
                              {label:isBusiness?"Your action":"Your action",value:isBusiness?"Submit Quotes":"Choose Offer"},
                              {label:"Area",value:locationStatus}].map(s=>(
                                <div key={s.label} className="flex flex-col">
                                    <p className="text-xs" style={{color:"#74767e"}}>{s.label}</p>
                                    <p className="text-sm font-bold" style={{color:"#404145"}}>{s.value}</p>
                                </div>
                            ))}
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
                                {searchQuery?`No results for "${searchQuery}"`:'No live Needs loaded'}
                            </h2>
                            <p className="text-sm mb-5" style={{color:"#74767e"}}>
                                {searchQuery?'Try a different keyword.':'Needs appear here once customers post them.'}
                            </p>
                            {!searchQuery&&(
                                <button onClick={loadNeeds} className="nd-btn nd-btn-primary rounded-full">
                                    Refresh
                                </button>
                            )}
                        </div>
                    ):(
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredNeeds.map(need=>(
                                <article key={need.id}
                                    className={`nd-gig-card cursor-pointer ${
                                        selectedNeedId===need.id?"ring-2 ring-[#1DBF73]":""
                                    }`}
                                    onClick={()=>{setSelectedNeedId(need.id);setMessage("");}}
                                >
                                    <div className="relative w-full overflow-hidden bg-gray-100" style={{aspectRatio:"4/3"}}>
                                        <NeedMedia src={need.photoPreview}/>
                                        {need.urgency==="Immediate"&&(
                                            <span className="absolute top-2 left-2 nd-badge nd-badge-red" style={{fontSize:"10px",padding:"2px 8px"}}>🔥 Urgent</span>
                                        )}
                                    </div>
                                    <div className="nd-gig-body">
                                        <div className="nd-seller-row">
                                            <span className="nd-badge nd-badge-gray" style={{fontSize:"11px"}}>{need.category}</span>
                                            <span className="nd-seller-level ml-auto">{need.offers||0} quotes</span>
                                        </div>
                                        <h3 className="nd-gig-title">{need.title}</h3>
                                        <div className="nd-gig-footer">
                                            <span className="flex items-center gap-1 text-xs" style={{color:"#74767e"}}>
                                                <MapPin size={11}/>{need.location}
                                            </span>
                                            <div className="nd-price">
                                                {need.budget?<><strong>{need.budget}</strong></>:<span style={{color:"#74767e",fontSize:"12px",fontStyle:"italic"}}>Open</span>}
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
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
                                    <div className="h-2 w-2 rounded-full animate-pulse" style={{background:"#1DBF73"}}/>
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
                                            <p className="nd-stat-label">Budget</p>
                                            <p className="nd-stat-value" style={{fontSize:"20px"}}>{selectedNeed.budget||"Flexible"}</p>
                                        </div>
                                        <div className="nd-stat-tile flex-1">
                                            <p className="nd-stat-label">Timeline</p>
                                            <p className="text-sm font-bold" style={{color:"#404145"}}>{selectedNeed.urgency==="Immediate"?"ASAP":"Flexible"}</p>
                                        </div>
                                    </div>
                                    {selectedNeed.photoPreview&&(
                                        <div className="mt-5 overflow-hidden rounded-xl" style={{border:"1px solid #e4e5e7"}}>
                                            <NeedMedia src={selectedNeed.photoPreview}/>
                                        </div>
                                    )}
                                </div>

                                {/* Offers section */}
                                <div className="px-6 py-6">
                                    <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                                        <h3 className="text-lg font-bold" style={{color:"#404145"}}>Offers ({offers.length})</h3>
                                        <div className="flex gap-2 flex-wrap">
                                            {quoteTabs.map(tab=>(
                                                <button key={tab} onClick={()=>setQuoteTab(tab)}
                                                    className="nd-chip text-xs py-1 px-3"
                                                    style={quoteTab===tab?{background:"#1DBF73",color:"#fff",borderColor:"#1DBF73"}:{}}>
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
                                                <p className="text-xs mt-1" style={{color:"#b5b6ba"}}>Be the first to submit an offer!</p>
                                            </div>
                                        ):(
                                            visibleOffers.map(offer=>(
                                                <QuoteCard key={offer.id} offer={offer}
                                                    canOrder={canOrderSelectedNeed}
                                                    canChat={canOrderSelectedNeed}
                                                    ordering={orderingOfferId===offer.id}
                                                    onChat={()=>chatAboutQuote(offer)}
                                                    onOrder={()=>void chooseQuote(offer)}/>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Business quote form */}
                                {isBusiness&&!hasSubmittedQuote&&(
                                    <div className="px-6 pb-8">
                                        <div className="rounded-2xl p-6" style={{border:"2px solid #1DBF73",background:"#f0fdf4"}}>
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="h-10 w-10 flex items-center justify-center rounded-xl" style={{background:"#1DBF73"}}>
                                                    <ShieldCheck size={20} color="#fff"/>
                                                </div>
                                                <div>
                                                    <h3 className="text-base font-bold" style={{color:"#404145"}}>Post Your Offer</h3>
                                                    <p className="text-xs" style={{color:"#74767e"}}>Submit a professional, structured offer.</p>
                                                </div>
                                            </div>
                                            <form onSubmit={submitQuote} className="grid gap-4">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Price ($)*</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{color:"#74767e"}}>$</span>
                                                            <input type="text" value={draft.price} onChange={e=>updateDraft("price",e.target.value)} placeholder="50" required className="nd-input pl-7"/>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Service Type</label>
                                                        <select value={draft.serviceType} onChange={e=>updateDraft("serviceType",e.target.value)} className="nd-select w-full">
                                                            {serviceTypes.map(t=><option key={t}>{t}</option>)}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Arrival Date & Time*</label>
                                                        <input type="datetime-local" value={draft.time} onChange={e=>updateDraft("time",e.target.value)} required className="nd-input"/>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Warranty</label>
                                                        <input value={draft.warranty} onChange={e=>updateDraft("warranty",e.target.value)} placeholder="e.g. 30 days" className="nd-input"/>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>What's Included</label>
                                                        <input value={draft.included} onChange={e=>updateDraft("included",e.target.value)} placeholder="e.g. Parts, Labor" className="nd-input"/>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Extra Charges ($)</label>
                                                        <div className="relative">
                                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold" style={{color:"#74767e"}}>$</span>
                                                            <input value={draft.extraCharges} onChange={e=>updateDraft("extraCharges",e.target.value)} placeholder="0" className="nd-input pl-7"/>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Your Distance</label>
                                                        <input value={draft.distance} onChange={e=>updateDraft("distance",e.target.value)} placeholder="e.g. 5km away" className="nd-input"/>
                                                    </div>
                                                    {draft.serviceType!=="Visit Shop"&&(
                                                        <div className="md:col-span-2">
                                                            <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Delay Refund Rule</label>
                                                            <input value={draft.delayRefundRule} onChange={e=>updateDraft("delayRefundRule",e.target.value)} placeholder="e.g. 10% off if late 30min" className="nd-input"/>
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="text-xs font-bold uppercase tracking-widest block mb-1" style={{color:"#74767e"}}>Message to Customer*</label>
                                                    <textarea value={draft.note} onChange={e=>updateDraft("note",e.target.value)} placeholder="Why are you the best fit?" required rows={3} className="nd-input resize-none"/>
                                                </div>
                                                <button type="submit" disabled={saving} className="nd-btn nd-btn-primary w-full rounded-xl py-3.5 text-base">
                                                    {saving?<Clock size={18} className="animate-spin"/>:<Send size={18}/>}
                                                    Submit Offer to Customer
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {hasSubmittedQuote&&(
                                    <div className="px-6 pb-8">
                                        <div className="rounded-2xl p-8 text-center" style={{background:"#f0fdf4",border:"1px solid #c9f0dd"}}>
                                            <div className="mx-auto h-14 w-14 flex items-center justify-center rounded-full mb-4" style={{background:"#e9f9f0"}}>
                                                <CheckCircle2 size={32} style={{color:"#1DBF73"}}/>
                                            </div>
                                            <h3 className="text-lg font-bold mb-2" style={{color:"#404145"}}>Offer Submitted!</h3>
                                            <p className="text-sm" style={{color:"#74767e"}}>Your offer is visible in the list above.</p>
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
