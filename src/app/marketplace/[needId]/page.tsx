"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Edit3,
    FileText,
    ImageIcon,
    MapPin,
    MessageSquare,
    Send,
    ShieldCheck,
    ShoppingBag,
    Star,
    Store,
    Trash2,
    X,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import {
    OfferRecord,
    createOffer,
    deleteNeed,
    deleteOffer,
    formatMoney,
    getNeedById,
    getOffers,
    NeedRecord,
    sendThreadMessage,
    updateOffer,
} from "@/lib/neederoDatabase";

type QuoteDraft = {
    price: string;
    serviceType: string;
    time: string;
    warranty: string;
    included: string;
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
    extraCharges: "",
    distance: "",
    distanceUnit: "m",
    availability: "",
    delayRefundRule: "",
    lateFee: "",
    note: "",
};

const serviceTypes = ["Visit Shop", "Home Visit", "Pickup & Return", "Delivery"];
const travelServiceTypes = ["Home Visit", "Pickup & Return", "Delivery"];

const needsTravelCharge = (serviceType: string) => travelServiceTypes.includes(serviceType);

const extraChargeLabel = (serviceType: string) => {
    if (serviceType === "Home Visit") return "Home visit fee";
    if (serviceType === "Pickup & Return") return "Pickup & return fee";
    if (serviceType === "Delivery") return "Delivery fee";
    return "Extra charge";
};

const parseDistanceDraft = (distance?: string) => {
    const match = String(distance || "").match(/(\d+(?:\.\d+)?)\s*(km|kilometer|kilometers|m|meter|meters)?/i);
    return {
        distance: match?.[1] || "",
        distanceUnit: match?.[2]?.toLowerCase().startsWith("k") ? "km" as const : "m" as const,
    };
};

const formatDistanceDraft = (distance: string, unit: QuoteDraft["distanceUnit"]) => {
    const value = distance.trim();
    if (!value) return "Nearby";
    return `${value} ${unit} away`;
};

const draftFromOffer = (offer: OfferRecord): QuoteDraft => ({
    price: String(parseAmount(offer.price) || ""),
    serviceType: offer.serviceType || "Visit Shop",
    time: offer.time || "",
    warranty: offer.warranty || "",
    included: offer.included || "",
    extraCharges: offer.extraCharges || "",
    ...parseDistanceDraft(offer.distance),
    availability: offer.availability || "",
    delayRefundRule: offer.delayRefundRule || "",
    lateFee: offer.lateFee || "",
    note: offer.businessNote || offer.note || "",
});

const parseAmount = (value: string) => {
    const match = value.replace(/,/g, "").match(/\d+(?:\.\d+)?/);
    return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
};

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
            <span className="flex w-12 shrink-0 items-center justify-center border-r border-[#dadbdd] bg-[#f7f7f7] text-sm font-black text-[#74767e]">$</span>
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

function NeedMedia({ need }: { need: NeedRecord }) {
    const [failed, setFailed] = useState(false);
    const src = need.photoPreview;
    const isVideo = src && (src.startsWith("data:video") || /\.(mp4|webm|mov)$/i.test(src));
    const isPdf = src && (src.startsWith("data:application/pdf") || /\.pdf(?:\?|$)/i.test(src));

    if (!src || failed) {
        return (
            <div className="flex min-h-[260px] flex-col justify-between rounded-[24px] bg-[#050816] p-6 text-white sm:min-h-[360px] sm:rounded-[28px] sm:p-8 lg:min-h-[460px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <ImageIcon size={24} />
                </div>
                <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">{need.category}</p>
                    <h2 className="mt-3 max-w-2xl text-3xl font-black leading-tight tracking-[-0.06em] sm:text-5xl">{need.title}</h2>
                </div>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-[24px] border border-[#e4e5e7] bg-white sm:rounded-[28px]">
            {isPdf ? (
                <div>
                    <div className="flex items-center gap-3 border-b border-[#e4e5e7] bg-[#f7f7f7] p-4">
                        <div className="rounded-xl bg-[#222325] p-2 text-white">
                            <FileText size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-black">{need.title}</p>
                            <p className="text-xs font-semibold text-[#74767e]">PDF attachment</p>
                        </div>
                    </div>
                    <iframe src={src} title={need.title} className="h-[520px] w-full bg-white" onError={() => setFailed(true)} />
                </div>
            ) : isVideo ? (
                <video src={src} controls className="max-h-[320px] w-full object-cover sm:max-h-[540px]" onError={() => setFailed(true)} />
            ) : (
                <img src={src} alt={need.title} className="max-h-[320px] w-full object-cover sm:max-h-[540px]" onError={() => setFailed(true)} />
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
    canManage,
    deleting,
    onEdit,
    onDelete,
}: {
    offer: OfferRecord;
    canOrder: boolean;
    ordering: boolean;
    onMessage: () => void;
    onChoose: () => void;
    canManage: boolean;
    deleting: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <article className="rounded-[24px] border border-[#e4e5e7] bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex gap-4">
                    <AvatarCircle src={offer.businessAvatar} name={offer.businessName || "Business"} className="h-12 w-12 text-lg" />
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
                            <span className="rounded-xl bg-[#f7f7f7] px-3 py-2"><strong>Late fine:</strong> {offer.lateFee || offer.delayRefundRule || "Not listed"}</span>
                        </div>
                        {offer.businessNote && <p className="mt-4 text-sm leading-6 text-[#62646a]">{offer.businessNote}</p>}
                    </div>
                </div>
                <div className="w-full rounded-2xl bg-[#050816] p-4 text-white lg:min-w-[210px] lg:w-auto">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Offer price</p>
                    <p className="mt-1 text-3xl font-black">{formatMoney(offer.price) || offer.price || "Open"}</p>
                    <div className="mt-4 grid gap-2">
                        <button onClick={onMessage} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-3 text-sm font-black text-white hover:bg-white/10">
                            <MessageSquare size={15} />
                            Message
                        </button>
                        {canManage && (
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={onEdit} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-3 text-xs font-black text-white hover:bg-white/10">
                                    <Edit3 size={14} />
                                    Edit
                                </button>
                                <button onClick={onDelete} disabled={deleting} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-3 py-3 text-xs font-black text-white hover:bg-white/10 disabled:opacity-50">
                                    {deleting ? <Clock size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    Delete
                                </button>
                            </div>
                        )}
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
    const [deletingNeed, setDeletingNeed] = useState(false);
    const [deletingOfferId, setDeletingOfferId] = useState<string | null>(null);
    const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
    const [orderingOfferId, setOrderingOfferId] = useState<string | null>(null);
    const [message, setMessage] = useState("");

    const isBusiness = accountType === "business";
    const isOwner = accountType === "customer" && need?.customerId === user?.uid;
    const sortedOffers = useMemo(() => [...offers].sort((a, b) => parseAmount(a.price) - parseAmount(b.price)), [offers]);
    const ownOffer = isBusiness ? offers.find((offer) => offer.businessId === user?.uid) || null : null;
    const hasSubmittedQuote = Boolean(ownOffer);

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
        if (!user || !need || !isBusiness) return;
        setSaving(true);
        setMessage("");
        try {
            const businessAvatar = profile?.photoURL || user.photoURL || null;
            if (
                needsTravelCharge(draft.serviceType) &&
                (!draft.extraCharges.trim() || !draft.lateFee.trim() || !draft.delayRefundRule.trim())
            ) {
                setMessage("For home visit, pickup & return, or delivery, add the travel fee, late fine, and late rule.");
                setSaving(false);
                return;
            }
            if (editingOfferId) {
                await updateOffer({
                    offerId: editingOfferId,
                    businessId: user.uid,
                    businessAvatar,
                    price: draft.price,
                    serviceType: draft.serviceType,
                    time: draft.time,
                    warranty: draft.warranty,
                    included: draft.included,
                    extraCharges: needsTravelCharge(draft.serviceType) ? draft.extraCharges : "",
                    distance: formatDistanceDraft(draft.distance, draft.distanceUnit),
                    availability: draft.availability || draft.time,
                    delayRefundRule: needsTravelCharge(draft.serviceType) ? draft.delayRefundRule : "",
                    lateFee: needsTravelCharge(draft.serviceType) ? draft.lateFee : "",
                    note: draft.note,
                });
                setEditingOfferId(null);
            } else {
                await createOffer({
                    needId: need.id,
                    businessId: user.uid,
                    businessName: profile?.companyName || profile?.displayName || "Local Business",
                    businessAvatar,
                    price: draft.price,
                    serviceType: draft.serviceType,
                    time: draft.time,
                    warranty: draft.warranty,
                    included: draft.included,
                    extraCharges: needsTravelCharge(draft.serviceType) ? draft.extraCharges : "",
                    distance: formatDistanceDraft(draft.distance, draft.distanceUnit),
                    availability: draft.availability || draft.time,
                    delayRefundRule: needsTravelCharge(draft.serviceType) ? draft.delayRefundRule : "",
                    lateFee: needsTravelCharge(draft.serviceType) ? draft.lateFee : "",
                    note: draft.note,
                });
            }
            setDraft(emptyDraft);
            await load();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not send this Offer.");
        } finally {
            setSaving(false);
        }
    };

    const startEditOffer = (offer: OfferRecord) => {
        setEditingOfferId(offer.id);
        setDraft(draftFromOffer(offer));
        setMessage("Editing your Offer. Save changes in the Offer panel.");
    };

    const cancelEditOffer = () => {
        setEditingOfferId(null);
        setDraft(emptyDraft);
        setMessage("");
    };

    const removeOffer = async (offer: OfferRecord) => {
        if (!user) return;
        const confirmed = window.confirm("Delete this Offer? The customer will no longer see it.");
        if (!confirmed) return;
        setDeletingOfferId(offer.id);
        setMessage("");
        try {
            await deleteOffer({ offerId: offer.id, businessId: user.uid });
            if (editingOfferId === offer.id) cancelEditOffer();
            await load();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not delete this Offer.");
        } finally {
            setDeletingOfferId(null);
        }
    };

    const removeNeed = async () => {
        if (!user || !need || !isOwner) return;
        const confirmed = window.confirm("Delete this Need and all its Offers/messages?");
        if (!confirmed) return;
        setDeletingNeed(true);
        setMessage("");
        try {
            await deleteNeed({ needId: need.id, customerId: user.uid });
            router.push("/client");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not delete this Need.");
        } finally {
            setDeletingNeed(false);
        }
    };

    const startQuoteChat = async (offer: OfferRecord, mode: "chat" | "choose") => {
        if (!need || !user) return;
        const customerText = mode === "choose"
            ? `I want to choose this Offer for "${need.title}". Offer: ${offer.price || "open price"} - ${offer.serviceType || "service"} - ${offer.time || "time to confirm"}.`
            : `Hi, I want to talk about this Offer for "${need.title}". Offer: ${offer.price || "open price"} - ${offer.serviceType || "service"} - ${offer.time || "time to confirm"}.`;
        const businessText = `Hi, I am following up on my Offer for "${need.title}". Offer: ${offer.price || "open price"} - ${offer.serviceType || "service"} - ${offer.time || "time to confirm"}.`;
        try {
            await sendThreadMessage({
                needId: need.id,
                quoteId: offer.id,
                senderId: user.uid,
                senderName: profile?.displayName || profile?.email || (accountType === "business" ? "Business" : "Customer"),
                senderType: accountType === "business" ? "business" : "customer",
                senderAvatar: profile?.photoURL || user.photoURL || null,
                text: accountType === "business" ? businessText : customerText,
            });
        } catch (error) {
            console.error("Could not seed quote chat:", error);
        }
        router.push(`/messages?needId=${encodeURIComponent(need.id)}&quoteId=${encodeURIComponent(offer.id)}&businessId=${encodeURIComponent(offer.businessId || "")}&businessName=${encodeURIComponent(offer.businessName || "Local Business")}&businessAvatar=${encodeURIComponent(offer.businessAvatar || "")}&order=0`);
    };

    const chooseQuote = async (offer: OfferRecord) => {
        if (!user || !need || !isOwner) return;
        setOrderingOfferId(offer.id);
        await startQuoteChat(offer, "choose");
        setOrderingOfferId(null);
    };

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#fafafa] px-4 py-5 text-[#222325] sm:px-5 sm:py-8 md:px-8">
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
                            <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">
                                <NeedMedia need={need} />
                                <aside className="h-fit rounded-[28px] border border-[#e4e5e7] bg-white p-6 shadow-sm">
                                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#95979d]">Need owner</p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <AvatarCircle src={need.customerAvatar} name={need.customerName || "Customer"} className="h-12 w-12 text-base" />
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
                                    {isOwner && (
                                        <button
                                            type="button"
                                            onClick={() => void removeNeed()}
                                            disabled={deletingNeed}
                                            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#222325] px-5 py-3 text-sm font-black text-[#222325] transition hover:bg-[#222325] hover:text-white disabled:opacity-50"
                                        >
                                            {deletingNeed ? <Clock size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                            Delete Need
                                        </button>
                                    )}
                                </aside>
                            </section>

                            <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">
                                <div>
                                    <div className="rounded-[28px] border border-[#e4e5e7] bg-white p-6 shadow-sm">
                                        <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#95979d]">Need details</p>
                                        <h1 className="mt-3 text-3xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">{need.title}</h1>
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
                                                onMessage={() => void startQuoteChat(offer, "chat")}
                                                onChoose={() => void chooseQuote(offer)}
                                                canManage={Boolean(isBusiness && offer.businessId === user?.uid)}
                                                deleting={deletingOfferId === offer.id}
                                                onEdit={() => startEditOffer(offer)}
                                                onDelete={() => void removeOffer(offer)}
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
                                        hasSubmittedQuote && !editingOfferId ? (
                                            <div className="text-center">
                                                <CheckCircle2 className="mx-auto text-[#222325]" size={36} />
                                                <p className="mt-3 font-black">Offer already submitted</p>
                                                <p className="mt-1 text-sm text-[#74767e]">Use Edit or Delete on your Offer card if you need to change it.</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={submitQuote} className="space-y-4">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h3 className="text-xl font-black">{editingOfferId ? "Edit Offer" : "Send an Offer"}</h3>
                                                        <p className="mt-1 text-xs font-semibold text-[#74767e]">Customers compare price, service type, arrival time, warranty, and late fine.</p>
                                                    </div>
                                                    {editingOfferId && (
                                                        <button type="button" onClick={cancelEditOffer} className="rounded-full border border-[#dadbdd] p-2 hover:bg-[#f5f5f5]">
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#74767e]">Price</span>
                                                    <MoneyInput value={draft.price} onChange={(value) => updateDraft("price", value)} placeholder="50" required min="1" />
                                                </label>
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#74767e]">Service type</span>
                                                    <select value={draft.serviceType} onChange={(e) => updateDraft("serviceType", e.target.value)} className="nd-select w-full rounded-xl">
                                                        {serviceTypes.map((type) => <option key={type}>{type}</option>)}
                                                    </select>
                                                </label>
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#74767e]">Specific arrival / completion time</span>
                                                    <input required type="datetime-local" value={draft.time} onChange={(e) => updateDraft("time", e.target.value)} className="nd-input rounded-xl" />
                                                </label>
                                                <input value={draft.availability} onChange={(e) => updateDraft("availability", e.target.value)} className="nd-input rounded-xl" placeholder="Availability note, e.g. 4:00 PM - 6:00 PM" />
                                                <input value={draft.warranty} onChange={(e) => updateDraft("warranty", e.target.value)} className="nd-input rounded-xl" placeholder="Warranty / guarantee" />
                                                <input value={draft.included} onChange={(e) => updateDraft("included", e.target.value)} className="nd-input rounded-xl" placeholder="What is included" />
                                                {needsTravelCharge(draft.serviceType) && (
                                                    <label className="block">
                                                        <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#74767e]">{extraChargeLabel(draft.serviceType)}</span>
                                                        <MoneyInput value={draft.extraCharges} onChange={(value) => updateDraft("extraCharges", value)} placeholder="0" required />
                                                    </label>
                                                )}
                                                <label className="block">
                                                    <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#74767e]">Distance from customer</span>
                                                    <div className="grid grid-cols-[1fr_84px] gap-2">
                                                        <input type="number" min="0" step="1" value={draft.distance} onChange={(e) => updateDraft("distance", e.target.value)} className="nd-input rounded-xl" placeholder="350" />
                                                        <select value={draft.distanceUnit} onChange={(e) => updateDraft("distanceUnit", e.target.value)} className="nd-select w-full rounded-xl">
                                                            <option value="m">m</option>
                                                            <option value="km">km</option>
                                                        </select>
                                                    </div>
                                                </label>
                                                {needsTravelCharge(draft.serviceType) && (
                                                    <>
                                                        <label className="block">
                                                            <span className="mb-1 block text-xs font-black uppercase tracking-[0.14em] text-[#74767e]">Late fine</span>
                                                            <MoneyInput value={draft.lateFee} onChange={(value) => updateDraft("lateFee", value)} placeholder="5" required />
                                                        </label>
                                                        <input required value={draft.delayRefundRule} onChange={(e) => updateDraft("delayRefundRule", e.target.value)} className="nd-input rounded-xl" placeholder="Late rule, e.g. fine after 30 min late" />
                                                    </>
                                                )}
                                                <textarea required value={draft.note} onChange={(e) => updateDraft("note", e.target.value)} className="nd-input min-h-28 resize-none rounded-xl" placeholder="Write a useful note for the customer." />
                                                <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#222325] px-5 py-4 text-sm font-black text-white hover:bg-black disabled:opacity-60">
                                                    {saving ? <Clock size={16} className="animate-spin" /> : <Send size={16} />}
                                                    {editingOfferId ? "Save Offer" : "Send Offer"}
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
