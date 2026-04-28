"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, CheckCircle, Clock, MessageSquare, Search, Send, ShieldCheck, Star, Sparkles, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NeedRecord, getNeeds } from "@/lib/neederoDatabase";

const CATEGORIES = [
    { label: "Home Repair", emoji: "🔧" },
    { label: "Plumbing", emoji: "🚿" },
    { label: "Electrical", emoji: "⚡" },
    { label: "Cleaning", emoji: "🧹" },
    { label: "Painting", emoji: "🎨" },
    { label: "Moving", emoji: "📦" },
    { label: "Gardening", emoji: "🌿" },
    { label: "Car Repair", emoji: "🚗" },
    { label: "IT Support", emoji: "💻" },
    { label: "Tutoring", emoji: "📚" },
];

const HOW_IT_WORKS = [
    {
        step: "1",
        icon: MessageSquare,
        title: "Post a Need",
        desc: "Describe your problem in plain words. Our AI turns it into a professional listing instantly.",
        color: "#e9f9f0",
        iconColor: "#1DBF73",
    },
    {
        step: "2",
        icon: Send,
        title: "Receive Offers",
        desc: "Local businesses see your Need and send clear, fixed-price Offers with time and warranty.",
        color: "#e8f0fe",
        iconColor: "#1a56db",
    },
    {
        step: "3",
        icon: CheckCircle,
        title: "Choose & Book",
        desc: "Compare Offers by price, speed, and rating. Choose the best one and unlock contact.",
        color: "#fff8e6",
        iconColor: "#e5a800",
    },
];

const TRUST_BADGES = [
    { icon: ShieldCheck, label: "Free for Customers", sub: "No hidden fees ever" },
    { icon: Zap, label: "AI Verified Leads", sub: "Smart need classification" },
    { icon: Star, label: "Real Offers Only", sub: "Structured, fixed-price" },
    { icon: Clock, label: "Fast Response", sub: "Avg. offer in 30 min" },
];

function NeedGigCard({ need }: { need: NeedRecord }) {
    const router = useRouter();
    return (
        <article
            className="nd-gig-card cursor-pointer group"
            onClick={() => router.push(`/marketplace?needId=${encodeURIComponent(need.id)}`)}
        >
            {/* Thumbnail */}
            <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: "4/3" }}>
                {need.photoPreview ? (
                    <img
                        src={need.photoPreview}
                        alt={need.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)" }}>
                        <Briefcase size={32} style={{ color: "#86efac" }} />
                    </div>
                )}
                {/* Urgency badge */}
                {need.urgency === "Immediate" && (
                    <span
                        className="absolute top-2 left-2 nd-badge nd-badge-red text-xs"
                        style={{ fontSize: "10px", padding: "2px 8px" }}
                    >
                        🔥 Urgent
                    </span>
                )}
            </div>

            {/* Body */}
            <div className="nd-gig-body">
                {/* Poster row */}
                <div className="nd-seller-row">
                    <div
                        className="nd-seller-avatar text-white"
                        style={{ background: "#1DBF73", fontSize: "11px", width: "28px", height: "28px" }}
                    >
                        {(need.title || "N").charAt(0).toUpperCase()}
                    </div>
                    <span className="nd-seller-name truncate">{need.category}</span>
                    <span className="nd-seller-level ml-auto">{need.offers || 0} quotes</span>
                </div>

                {/* Title */}
                <h3 className="nd-gig-title group-hover:text-green-600">{need.title}</h3>

                {/* Footer */}
                <div className="nd-gig-footer">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "#74767e" }}>
                        📍 {need.location}
                    </span>
                    <div className="nd-price">
                        {need.budget ? (
                            <>Budget: <strong>{need.budget}</strong></>
                        ) : (
                            <span style={{ color: "#74767e", fontStyle: "italic", fontSize: "12px" }}>Open budget</span>
                        )}
                    </div>
                </div>
            </div>
        </article>
    );
}

export default function Home() {
    const router = useRouter();
    const { accountType, user, loading } = useAuth();
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [loadError, setLoadError] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const primaryHref = accountType === "business" ? "/marketplace" : "/client/new";
    const primaryLabel = accountType === "business" ? "Browse Needs" : "Post a Need";
    const liveNeeds = useMemo(() => needs.slice(0, 8), [needs]);

    useEffect(() => {
        if (!loading && !user) router.replace("/login");
    }, [loading, router, user]);

    useEffect(() => {
        const loadNeeds = async () => {
            if (!user) return;
            try {
                setLoadError("");
                setNeeds(await getNeeds());
            } catch {
                setLoadError("Live Need feed is not reachable yet.");
                setNeeds([]);
            }
        };
        void loadNeeds();
    }, [user]);

    if (loading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center" style={{ background: "#fafafa" }}>
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full animate-pulse" style={{ background: "#e9f9f0" }} />
                    <p className="text-sm font-semibold" style={{ color: "#74767e" }}>Loading Needero...</p>
                </div>
            </main>
        );
    }

    return (
        <main style={{ background: "#fafafa", color: "#404145" }}>
            {/* ── HERO ── */}
            <section
                className="relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #1a2e1a 0%, #0f2318 40%, #1a3a2e 100%)",
                    padding: "72px 24px 80px",
                }}
            >
                {/* Decorative circles */}
                <div
                    className="absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-10"
                    style={{ background: "#1DBF73" }}
                />
                <div
                    className="absolute -left-12 bottom-0 h-64 w-64 rounded-full opacity-5"
                    style={{ background: "#1DBF73" }}
                />

                <div className="relative mx-auto max-w-4xl text-center">
                    {/* Eyebrow */}
                    <div
                        className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                        style={{ borderColor: "rgba(29,191,115,0.4)", color: "#1DBF73", background: "rgba(29,191,115,0.08)" }}
                    >
                        <Sparkles size={14} />
                        Reverse Marketplace — AI Powered
                    </div>

                    <h1
                        className="font-heading font-extrabold leading-tight tracking-tight"
                        style={{ fontSize: "clamp(32px, 5vw, 60px)", color: "#ffffff", letterSpacing: "-1px" }}
                    >
                        Find local help the{" "}
                        <span style={{ color: "#1DBF73" }}>smart way.</span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.72)" }}>
                        Post what you need. Local businesses compete for your job with clear, fixed-price Offers. You choose the best one — free, fast, and safe.
                    </p>

                    {/* Search bar */}
                    <div
                        className="mx-auto mt-8 flex max-w-2xl items-center overflow-hidden rounded-full bg-white shadow-xl"
                        style={{ padding: "6px 6px 6px 20px" }}
                    >
                        <Search size={18} style={{ color: "#74767e", flexShrink: 0 }} />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") router.push(`/marketplace?q=${encodeURIComponent(searchInput)}`);
                            }}
                            placeholder="What do you need help with?"
                            className="flex-1 bg-transparent px-3 text-sm outline-none"
                            style={{ color: "#404145", height: "44px" }}
                        />
                        <button
                            onClick={() => router.push(`/marketplace?q=${encodeURIComponent(searchInput)}`)}
                            className="nd-btn nd-btn-primary rounded-full"
                            style={{ padding: "12px 24px", fontSize: "14px" }}
                        >
                            Search
                        </button>
                    </div>

                    {/* Popular searches */}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                        <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Popular:</span>
                        {["Phone Repair", "Plumber", "House Cleaning", "Electrician"].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => router.push(`/marketplace?q=${encodeURIComponent(tag)}`)}
                                className="rounded-full border px-3 py-1 text-xs font-medium transition-all hover:bg-white/10"
                                style={{ borderColor: "rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.75)" }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CATEGORY CHIPS ── */}
            <section className="border-b" style={{ borderColor: "#e4e5e7", background: "#ffffff" }}>
                <div className="mx-auto max-w-7xl px-4 py-4">
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                        <Link href="/marketplace" className="nd-chip flex-shrink-0">
                            🔍 All Categories
                        </Link>
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.label}
                                href={`/marketplace?q=${encodeURIComponent(cat.label)}`}
                                className="nd-chip flex-shrink-0"
                            >
                                {cat.emoji} {cat.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── HOW IT WORKS ── */}
            <section className="py-16 px-4" style={{ background: "#ffffff" }}>
                <div className="mx-auto max-w-7xl">
                    <div className="mb-10 text-center">
                        <h2 className="nd-section-title font-heading">How Needero works</h2>
                        <p className="nd-section-subtitle mt-2">Three simple steps to get local help fast</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {HOW_IT_WORKS.map((item) => (
                            <div
                                key={item.step}
                                className="rounded-2xl p-7 relative overflow-hidden"
                                style={{ background: item.color, border: `1px solid ${item.color}` }}
                            >
                                <div
                                    className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                                    style={{ background: "#ffffff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                                >
                                    <item.icon size={22} style={{ color: item.iconColor }} />
                                </div>
                                <div
                                    className="absolute top-4 right-5 font-heading font-extrabold"
                                    style={{ fontSize: "64px", color: "rgba(0,0,0,0.04)", lineHeight: 1 }}
                                >
                                    {item.step}
                                </div>
                                <p className="mb-1 text-xs font-bold uppercase tracking-widest" style={{ color: item.iconColor }}>
                                    Step {item.step}
                                </p>
                                <h3 className="text-lg font-bold mb-2" style={{ color: "#404145" }}>{item.title}</h3>
                                <p className="text-sm leading-relaxed" style={{ color: "#74767e" }}>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── LIVE NEEDS (gig cards) ── */}
            <section className="py-14 px-4" style={{ background: "#fafafa" }}>
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex items-end justify-between">
                        <div>
                            <h2 className="nd-section-title font-heading">Live Needs near you</h2>
                            <p className="nd-section-subtitle mt-1">Real customer posts waiting for your Offer</p>
                        </div>
                        <Link
                            href="/marketplace"
                            className="flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-80"
                            style={{ color: "#1DBF73" }}
                        >
                            View all
                            <ArrowRight size={15} />
                        </Link>
                    </div>

                    {loadError && (
                        <div
                            className="mb-6 rounded-xl border px-4 py-3 text-sm"
                            style={{ borderColor: "#fde68a", background: "#fffbeb", color: "#92630a" }}
                        >
                            {loadError}
                        </div>
                    )}

                    {liveNeeds.length === 0 ? (
                        <div
                            className="rounded-2xl border-2 border-dashed p-16 text-center"
                            style={{ borderColor: "#e4e5e7" }}
                        >
                            <Briefcase size={40} className="mx-auto mb-4" style={{ color: "#d1d5db" }} />
                            <p className="font-semibold" style={{ color: "#74767e" }}>No live Needs yet</p>
                            <p className="mt-1 text-sm" style={{ color: "#b5b6ba" }}>
                                When customers post Needs, they'll appear here as cards.
                            </p>
                            {accountType === "customer" && (
                                <Link href="/client/new" className="nd-btn nd-btn-primary mt-5 rounded-full inline-flex">
                                    Post the First Need
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {liveNeeds.map((need) => (
                                <NeedGigCard key={need.id} need={need} />
                            ))}
                        </div>
                    )}

                    <div className="mt-10 text-center">
                        <Link href="/marketplace" className="nd-btn nd-btn-secondary rounded-full inline-flex px-8 py-3">
                            Browse all Needs
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── TRUST BADGES ── */}
            <section className="py-14 px-4 border-t" style={{ background: "#ffffff", borderColor: "#e4e5e7" }}>
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {TRUST_BADGES.map((badge) => (
                            <div key={badge.label} className="flex items-start gap-4 p-5 rounded-xl" style={{ background: "#fafafa", border: "1px solid #e4e5e7" }}>
                                <div
                                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                                    style={{ background: "#e9f9f0" }}
                                >
                                    <badge.icon size={20} style={{ color: "#1DBF73" }} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold" style={{ color: "#404145" }}>{badge.label}</p>
                                    <p className="text-xs mt-0.5" style={{ color: "#74767e" }}>{badge.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA BANNER ── */}
            {accountType === "customer" && (
                <section
                    className="py-16 px-4 text-center"
                    style={{ background: "linear-gradient(135deg, #1DBF73 0%, #16a85d 100%)" }}
                >
                    <div className="mx-auto max-w-2xl">
                        <h2 className="font-heading text-3xl font-extrabold text-white mb-3">
                            Ready to get help?
                        </h2>
                        <p className="text-white/80 mb-7 text-lg">
                            It's 100% free for customers. Post your first Need in under 2 minutes.
                        </p>
                        <Link href="/client/new" className="nd-btn nd-btn-dark rounded-full inline-flex px-8 py-3.5 text-base">
                            Post a Need — It's Free
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>
            )}
        </main>
    );
}
