"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    ArrowRight, Briefcase, CheckCircle2, Clock, MapPin,
    MessageSquare, Plus, Search, Star, RefreshCw, Flame, Trash2, FileText
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { NeedRecord, deleteNeed, getNeeds } from "@/lib/neederoDatabase";

function statusConfig(status: string) {
    switch (status) {
        case "solved":
            return { label: "Offer Completed", cls: "nd-badge nd-badge-green" };
        case "chosen":
            return { label: "Booked", cls: "nd-badge nd-badge-green" };
        case "quoted":
            return { label: "Offers Received", cls: "nd-badge nd-badge-blue" };
        case "open":
        default:
            return { label: "Awaiting Offers", cls: "nd-badge nd-badge-amber" };
    }
}

function NeedMedia({ src }: { src?: string | null }) {
    if (!src) return null;
    const isVideo = src.startsWith("data:video") || /\.(mp4|webm|mov)$/i.test(src);
    const isPdf = src.startsWith("data:application/pdf") || /\.pdf(?:\?|$)/i.test(src);
    if (isPdf) {
        return (
            <div className="flex h-20 w-24 flex-shrink-0 flex-col items-center justify-center rounded-xl border border-[#e4e5e7] bg-[#f7f7f7] text-[10px] font-black uppercase tracking-wide text-[#74767e]">
                <FileText size={18} className="mb-1 text-[#222325]" />
                PDF
            </div>
        );
    }
    return isVideo ? (
        <video src={src} controls className="h-20 w-24 rounded-xl object-cover flex-shrink-0" />
    ) : (
        <img src={src} alt="" className="h-20 w-24 rounded-xl object-cover flex-shrink-0" />
    );
}

export default function RequestCenterPage() {
    const { accountType, user } = useAuth();
    const isBusiness = accountType === "business";
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [dbError, setDbError] = useState("");
    const [loading, setLoading] = useState(true);
    const [deletingNeedId, setDeletingNeedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");

    const fetchNeeds = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getNeeds(isBusiness ? undefined : user.uid);
            setNeeds(data);
            setDbError("");
        } catch (error) {
            console.error("Needero needs load failed:", error);
            setDbError("Could not load live Needs yet. Please wait for the backend deploy or try again.");
            setNeeds([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchNeeds(); }, [user, isBusiness]);

    const removeNeed = async (need: NeedRecord) => {
        if (!user) return;
        const confirmed = window.confirm("Delete this Need and all related Offers/messages?");
        if (!confirmed) return;
        setDeletingNeedId(need.id);
        setDbError("");
        try {
            await deleteNeed({ needId: need.id, customerId: user.uid });
            setNeeds((current) => current.filter((item) => item.id !== need.id));
        } catch (error) {
            setDbError(error instanceof Error ? error.message : "Could not delete this Need.");
        } finally {
            setDeletingNeedId(null);
        }
    };

    const visibleNeeds = useMemo(() => {
        let list = isBusiness ? needs : needs.filter((n) => n.customerId === user?.uid);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            list = list.filter(n =>
                n.title.toLowerCase().includes(q) ||
                n.category.toLowerCase().includes(q) ||
                n.location.toLowerCase().includes(q)
            );
        }
        if (selectedCategory !== "All Categories") {
            list = list.filter(n => {
                const normalizedCategory = n.category === "General Service" ? "Mobile Repair" : n.category === "Home Service" ? "Home Cleaning" : n.category;
                return normalizedCategory === selectedCategory;
            });
        }
        if (statusFilter !== "all") {
            list = list.filter(n => n.status === statusFilter);
        }
        return list;
    }, [isBusiness, needs, user?.uid, searchQuery, statusFilter, selectedCategory]);

    const openNeeds = needs.filter(n => n.status !== "chosen").length;
    const totalOffers = needs.reduce((s, n) => s + (n.offers || 0), 0);
    const bookedNeeds = needs.filter(n => n.status === "chosen").length;

    const FILTERS = [
        { key: "all", label: "All" },
        { key: "open", label: "Awaiting Offers" },
        { key: "quoted", label: "Offers Received" },
        { key: "chosen", label: "Booked" },
    ];

    return (
        <RouteGuard allowedTypes={["customer"]}>
            <div style={{ background: "#fafafa", minHeight: "100vh" }}>
                {/* ── PAGE HEADER ── */}
                <div style={{ background: "#ffffff", borderBottom: "1px solid #e4e5e7" }}>
                    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "#222325" }}>
                                    {isBusiness ? "Lead Inbox" : "My Orders"}
                                </p>
                                <h1 className="font-heading text-3xl font-bold" style={{ color: "#404145" }}>
                                    {isBusiness ? "Needs Near You" : "My Needs"}
                                </h1>
                                <p className="mt-1 text-sm" style={{ color: "#74767e" }}>
                                    {isBusiness
                                        ? "Browse and send Offers to open needs in your area."
                                        : "Track your posted needs and the offers you've received."}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={fetchNeeds}
                                    className="nd-btn nd-btn-ghost rounded-full gap-2"
                                    title="Refresh"
                                >
                                    <RefreshCw size={15} />
                                    Refresh
                                </button>
                                <Link
                                    href={isBusiness ? "/marketplace" : "/client/new"}
                                    className="nd-btn nd-btn-primary rounded-full gap-2"
                                >
                                    <Plus size={16} />
                                    {isBusiness ? "Browse Offers" : "Post a New Need"}
                                </Link>
                            </div>
                        </div>

                        {/* Stats row */}
                        <div className="mt-6 flex flex-wrap gap-6">
                            {[
                                { label: "Total Needs", value: needs.length, icon: Briefcase },
                                { label: "Open", value: openNeeds, icon: Clock },
                                { label: "Offers received", value: totalOffers, icon: MessageSquare },
                                { label: "Booked", value: bookedNeeds, icon: CheckCircle2 },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center gap-3">
                                    <div
                                        className="h-9 w-9 rounded-xl flex items-center justify-center"
                                        style={{ background: "#e9f9f0" }}
                                    >
                                        <s.icon size={16} style={{ color: "#222325" }} />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold leading-none" style={{ color: "#404145" }}>{s.value}</p>
                                        <p className="text-xs mt-0.5" style={{ color: "#74767e" }}>{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── FILTERS + SEARCH ── */}
                <div style={{ background: "#ffffff", borderBottom: "1px solid #e4e5e7" }}>
                    <div className="mx-auto max-w-7xl px-4 sm:px-6">
                        <div className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                            {/* Status filters */}
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                {["All Categories", "Home Cleaning", "Mobile Repair"].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className="nd-chip flex-shrink-0 text-sm"
                                        style={selectedCategory === cat ? {
                                            background: "#222325",
                                            color: "#ffffff",
                                            borderColor: "#222325",
                                        } : {}}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 border-l pl-2 border-[#e4e5e7]">
                                {FILTERS.map((f) => (
                                    <button
                                        key={f.key}
                                        onClick={() => setStatusFilter(f.key)}
                                        className="nd-chip flex-shrink-0 text-sm"
                                        style={statusFilter === f.key ? {
                                            background: "#222325",
                                            color: "#ffffff",
                                            borderColor: "#222325",
                                        } : {}}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                            {/* Search */}
                            <div className="relative flex-shrink-0">
                                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#74767e" }} />
                                <input
                                    type="text"
                                    placeholder="Search needs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="nd-input rounded-full pl-9 pr-4 py-2 text-sm"
                                    style={{ width: "220px" }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CONTENT ── */}
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                    {dbError && (
                        <div
                            className="mb-4 rounded-xl border px-4 py-3 text-sm"
                            style={{ borderColor: "#fde68a", background: "#fffbeb", color: "#92630a" }}
                        >
                            {dbError}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-32 rounded-2xl animate-pulse" style={{ background: "#f3f4f6" }} />
                            ))}
                        </div>
                    ) : visibleNeeds.length === 0 ? (
                        <div
                            className="rounded-2xl border-2 border-dashed py-20 text-center"
                            style={{ borderColor: "#e4e5e7" }}
                        >
                            <Briefcase size={40} className="mx-auto mb-4" style={{ color: "#d1d5db" }} />
                            <p className="font-semibold text-lg mb-1" style={{ color: "#404145" }}>
                                {searchQuery ? `No results for "${searchQuery}"` : "No local service Needs yet"}
                            </p>
                            <p className="text-sm mb-6" style={{ color: "#74767e" }}>
                                {isBusiness
                                    ? "No live service Needs in your area yet."
                                    : "Post your first local service Need to get Offers from local businesses."}
                            </p>
                            {!isBusiness && (
                                <Link href="/client/new" className="nd-btn nd-btn-primary rounded-full inline-flex">
                                    <Plus size={16} /> Post a Need
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {visibleNeeds.map((need) => {
                                const status = statusConfig(need.status);
                                return (
                                    <article
                                        key={need.id}
                                        className="rounded-2xl bg-white border transition-shadow hover:shadow-md"
                                        style={{ borderColor: "#e4e5e7" }}
                                    >
                                        <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                                            {/* Thumbnail */}
                                            <NeedMedia src={need.photoPreview} />

                                            {/* Main info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                                    <span className={status.cls}>{status.label}</span>
                                                    <span className="nd-badge nd-badge-gray">{need.category}</span>
                                                    {need.urgency === "Immediate" && (
                                                        <span className="nd-badge nd-badge-red">
                                                            <Flame size={12} className="mr-1 fill-current" /> Urgent
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="text-base font-bold mb-1" style={{ color: "#404145" }}>
                                                    {need.title}
                                                </h3>
                                                <p className="text-sm line-clamp-2 mb-3" style={{ color: "#74767e" }}>
                                                    {need.issue}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 text-xs" style={{ color: "#74767e" }}>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={12} /> {need.location}
                                                    </span>
                                                    <span>{need.budget || "Open budget"}</span>
                                                    <span className="font-mono text-[10px]" style={{ color: "#b5b6ba" }}>
                                                        ID: {need.id.slice(0, 8)}…
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Right stats + action */}
                                            <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-4 sm:text-right flex-shrink-0">
                                                <div>
                                                    <p className="text-2xl font-bold leading-none" style={{ color: "#404145" }}>
                                                        {need.offers || 0}
                                                    </p>
                                                    <p className="text-xs mt-0.5" style={{ color: "#74767e" }}>
                                                        {(need.offers || 0) === 1 ? "Offer" : "Offers"}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={isBusiness ? "/marketplace" : `/marketplace/${encodeURIComponent(need.id)}`}
                                                    className="nd-btn nd-btn-primary nd-btn-sm rounded-full flex-shrink-0 gap-1"
                                                >
                                                    {isBusiness ? "Send Offer" : "View Offers"}
                                                    <ArrowRight size={13} />
                                                </Link>
                                                {!isBusiness && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void removeNeed(need)}
                                                        disabled={deletingNeedId === need.id}
                                                        className="inline-flex items-center justify-center gap-1 rounded-full border border-[#222325] px-3 py-2 text-xs font-black text-[#222325] transition hover:bg-[#222325] hover:text-white disabled:opacity-50"
                                                    >
                                                        {deletingNeedId === need.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress bar for offers */}
                                        {(need.offers || 0) > 0 && (
                                            <div className="px-5 pb-4">
                                                <div className="nd-progress-bar">
                                                    <div
                                                        className="nd-progress-fill"
                                                        style={{ width: `${Math.min(100, ((need.offers || 0) / 10) * 100)}%` }}
                                                    />
                                                </div>
                                                <p className="mt-1 text-[11px]" style={{ color: "#74767e" }}>
                                                    {need.offers} of 10 max offers received
                                                </p>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </RouteGuard>
    );
}
