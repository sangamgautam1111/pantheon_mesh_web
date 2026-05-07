"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    BadgeCheck,
    BellRing,
    CheckCircle2,
    ChevronRight,
    Home,
    MapPin,
    MessageSquare,
    Search,
    ShieldCheck,
    ShoppingBag,
    Smartphone,
    Sparkles,
    Star,
    Store,
    Wrench,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NeedRecord, getNeeds } from "@/lib/neederoDatabase";
import { localRank, needDistanceLabel, ViewerLocation } from "@/lib/location";

const brandGreen = "#009f58";

const previewNeeds = [
    {
        title: "iPhone screen repair needed today",
        category: "Mobile Repair",
        location: "Kathmandu, Bagmati",
        offers: 12,
        budget: "NPR 2,500 - 5,000",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=420&q=80",
    },
    {
        title: "Deep home cleaning for 4 rooms",
        category: "Home Cleaning",
        location: "Lalitpur, Bagmati",
        offers: 8,
        budget: "NPR 3,000 - 6,500",
        image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=420&q=80",
    },
    {
        title: "Samsung battery replacement",
        category: "Mobile Repair",
        location: "Bhaktapur, Bagmati",
        offers: 6,
        budget: "NPR 1,800 - 3,200",
        image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=420&q=80",
    },
];

const offerRows = [
    ["QuickFix Mobile", "Screen replacement", "NPR 3,200", "30 min"],
    ["Sparkle Home Care", "Deep cleaning team", "NPR 4,500", "Today"],
    ["MobiCare Nepal", "Battery + warranty", "NPR 2,100", "1 hour"],
];

function NeederoLogo() {
    return (
        <Link href="/" className="inline-flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#e9f8f0] text-[#009f58]">
                <ShoppingBag size={18} />
            </span>
            <span className="text-xl font-black tracking-[-0.04em] text-[#062016]">
                Need<span className="text-[#009f58]">ero</span>
            </span>
        </Link>
    );
}

function StatPill({ icon: Icon, title, copy }: { icon: typeof ShieldCheck; title: string; copy: string }) {
    return (
        <div className="flex min-w-[160px] items-center gap-3 rounded-[8px] border border-[#dceee4] bg-white px-4 py-3 shadow-sm">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-[#e9f8f0] text-[#009f58]">
                <Icon size={17} />
            </span>
            <span>
                <span className="block text-xs font-black text-[#082117]">{title}</span>
                <span className="block text-[11px] font-semibold text-[#6b7a73]">{copy}</span>
            </span>
        </div>
    );
}

function LiveNeedCard({ need, viewer }: { need: NeedRecord; viewer: ViewerLocation | null }) {
    const localLabel = needDistanceLabel(need, viewer);
    return (
        <article className="overflow-hidden rounded-[12px] border border-[#dfe8e3] bg-white shadow-sm">
            <div className="h-28 bg-[#eff8f3]">
                {need.photoPreview ? (
                    <img src={need.photoPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                    <div className="flex h-full items-center justify-center text-[#009f58]">
                        {need.category === "Home Cleaning" ? <Home size={34} /> : <Smartphone size={34} />}
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="rounded-[5px] bg-[#edf7f1] px-2 py-1 text-[10px] font-black text-[#087646]">{need.category}</span>
                    <span className="text-[11px] font-black text-[#5c6c64]">{need.offers || 0} offers</span>
                </div>
                <h3 className="mt-3 line-clamp-2 min-h-10 text-sm font-black leading-tight text-[#081a13]">{need.title}</h3>
                <div className="mt-4 flex items-center justify-between border-t border-[#edf2ef] pt-3">
                    <span className="inline-flex min-w-0 items-center gap-1 truncate text-xs font-semibold text-[#6b7a73]">
                        <MapPin size={12} />
                        {localLabel || need.location}
                    </span>
                    <span className="text-xs font-black text-[#081a13]">{need.budget || "Open"}</span>
                </div>
            </div>
        </article>
    );
}

function PreviewNeedCard({ item }: { item: (typeof previewNeeds)[number] }) {
    return (
        <article className="grid grid-cols-[96px_1fr] overflow-hidden rounded-[12px] border border-[#dfe8e3] bg-white shadow-sm">
            <img src={item.image} alt="" className="h-full min-h-[132px] w-full object-cover" />
            <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="rounded-[5px] bg-[#edf7f1] px-2 py-1 text-[10px] font-black text-[#087646]">{item.category}</span>
                    <span className="text-[11px] font-black text-[#5c6c64]">{item.offers} offers</span>
                </div>
                <h3 className="mt-3 line-clamp-2 text-sm font-black leading-tight text-[#081a13]">{item.title}</h3>
                <p className="mt-2 text-xs font-semibold text-[#6b7a73]">{item.location}</p>
                <p className="mt-2 text-sm font-black text-[#081a13]">{item.budget}</p>
            </div>
        </article>
    );
}

function OfferBoard() {
    return (
        <div className="rounded-[18px] border border-[#d9e8e0] bg-white p-4 shadow-[0_24px_60px_rgba(8,33,23,0.12)]">
            <div className="flex items-center justify-between border-b border-[#edf2ef] pb-3">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#009f58]">Live offers</p>
                    <p className="text-xl font-black text-[#081a13]">Customers are ready</p>
                </div>
                <span className="rounded-full bg-[#e9f8f0] px-3 py-1 text-xs font-black text-[#087646]">128 new</span>
            </div>
            <div className="mt-4 space-y-3">
                {offerRows.map(([seller, service, price, time]) => (
                    <div key={seller} className="grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-[10px] border border-[#e5eee9] bg-[#fbfdfc] p-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[9px] bg-[#e9f8f0] text-[#009f58]">
                            <Store size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-sm font-black text-[#081a13]">{seller}</p>
                            <p className="truncate text-xs font-semibold text-[#6b7a73]">{service} - {time}</p>
                        </div>
                        <p className="text-right text-sm font-black text-[#009f58]">{price}</p>
                    </div>
                ))}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 rounded-[12px] bg-[#081a13] p-3 text-white">
                {[
                    ["2,450+", "Active partners"],
                    ["98%", "Verified service"],
                    ["40%+", "Avg savings"],
                ].map(([value, label]) => (
                    <div key={label}>
                        <p className="text-lg font-black">{value}</p>
                        <p className="text-[10px] font-bold text-white/60">{label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function HomePage() {
    const router = useRouter();
    const { accountType } = useAuth();
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [searchInput, setSearchInput] = useState("");
    const [viewerLocation, setViewerLocation] = useState<ViewerLocation | null>(null);

    const liveNeeds = useMemo(() => {
        return [...needs].sort((a, b) => {
            const rankDiff = localRank(b, viewerLocation) - localRank(a, viewerLocation);
            if (rankDiff !== 0) return rankDiff;
            const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bDate - aDate;
        }).slice(0, 3);
    }, [needs, viewerLocation]);

    useEffect(() => {
        const loadNeeds = async () => {
            try {
                setNeeds(await getNeeds());
            } catch (error) {
                console.warn("Needero live feed unavailable:", error);
                setNeeds([]);
            }
        };

        const requestLocation = async () => {
            try {
                const response = await fetch("https://ipapi.co/json/");
                if (!response.ok) throw new Error("IP area lookup failed");
                const data = await response.json();
                setViewerLocation({
                    latitude: Number(data.latitude),
                    longitude: Number(data.longitude),
                    city: data.city,
                    regionCode: data.region_code,
                    countryCode: data.country_code,
                    label: [data.city, data.region, data.country_code].filter(Boolean).join(", "),
                    source: "ip",
                });
            } catch (error) {
                console.warn("Location detection failed:", error);
            }
        };

        void loadNeeds();
        void requestLocation();
    }, []);

    const runSearch = () => {
        const query = searchInput.trim();
        router.push(query ? `/marketplace?q=${encodeURIComponent(query)}` : "/marketplace");
    };

    return (
        <main className="min-h-screen bg-[#fbfdfc] text-[#081a13]">
            <section className="border-b border-[#dfe8e3] bg-white">
                <div className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-3 md:hidden">
                    <NeederoLogo />
                    <Link href="/login" className="rounded-full border border-[#dfe8e3] px-3 py-2 text-xs font-black">
                        Join
                    </Link>
                </div>
            </section>

            <section className="relative overflow-hidden bg-[linear-gradient(110deg,#ffffff_0%,#f4fff9_58%,#eaf8f1_100%)]">
                <div className="absolute left-0 top-0 hidden h-full w-1/2 bg-[radial-gradient(circle_at_10%_80%,rgba(0,159,88,0.12),transparent_28%)] md:block" />
                <div className="mx-auto grid max-w-[1180px] gap-8 px-4 py-10 md:grid-cols-[1fr_420px] md:px-6 md:py-14 lg:py-16">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 rounded-full border border-[#cfe8d9] bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#009f58]">
                            <Sparkles size={13} />
                            Needero reverse e-commerce
                        </div>
                        <h1 className="mt-5 max-w-xl text-[42px] font-black leading-[0.97] tracking-[-0.06em] text-[#081a13] md:text-[58px]">
                            Post what you need. Get <span className="text-[#009f58]">offers fast.</span>
                        </h1>
                        <p className="mt-4 max-w-xl text-base font-medium leading-7 text-[#5c6c64]">
                            Tell Needero your mobile repair or home service request. Verified local partners compete with price, timing, warranty, and service details.
                        </p>

                        <div className="mt-6 max-w-xl rounded-[14px] border border-[#d8e8df] bg-white p-2 shadow-[0_16px_40px_rgba(8,33,23,0.08)]">
                            <div className="flex items-center gap-2">
                                <Search size={18} className="ml-2 shrink-0 text-[#789087]" />
                                <input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter") runSearch();
                                    }}
                                    placeholder="What do you need?"
                                    className="h-11 min-w-0 flex-1 bg-transparent px-2 text-sm font-semibold text-[#081a13] outline-none placeholder:text-[#8ca098]"
                                />
                                <button onClick={runSearch} className="h-11 rounded-[10px] bg-[#081a13] px-5 text-sm font-black text-white transition hover:bg-black">
                                    Search
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            {[
                                ["Phone screen repair", Smartphone],
                                ["Home cleaning", Home],
                                ["Battery replacement", Wrench],
                                ["Deep cleaning", Sparkles],
                            ].map(([label, Icon]) => {
                                const TypedIcon = Icon as typeof Smartphone;
                                return (
                                    <button
                                        key={label as string}
                                        onClick={() => router.push(`/marketplace?q=${encodeURIComponent(label as string)}`)}
                                        className="inline-flex items-center gap-2 rounded-full border border-[#dfe8e3] bg-white px-4 py-2 text-xs font-black text-[#24352d] transition hover:border-[#009f58] hover:text-[#009f58]"
                                    >
                                        <TypedIcon size={14} />
                                        {label as string}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                            <Link href="/client/new" className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-[#009f58] px-6 text-sm font-black text-white shadow-[0_10px_24px_rgba(0,159,88,0.24)] transition hover:bg-[#087646]">
                                Post a Request
                                <ArrowRight size={16} />
                            </Link>
                            <Link href="/marketplace" className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] border border-[#d6e5dc] bg-white px-6 text-sm font-black text-[#081a13] transition hover:border-[#081a13]">
                                Browse Offers
                                <ChevronRight size={16} />
                            </Link>
                        </div>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <StatPill icon={ShieldCheck} title="Verified sellers" copy="Safer offers" />
                            <StatPill icon={BellRing} title="Fast replies" copy="Nearby partners" />
                            <StatPill icon={BadgeCheck} title="KYC reviewed" copy="Trust profiles" />
                            <StatPill icon={MessageSquare} title="Compare offers" copy="Price and timing" />
                        </div>
                    </div>

                    <div className="relative z-10">
                        <OfferBoard />
                    </div>
                </div>
            </section>

            <section className="border-y border-[#dfe8e3] bg-white">
                <div className="mx-auto grid max-w-[1180px] gap-4 px-4 py-7 md:grid-cols-3 md:px-6">
                    {[
                        ["1", "Post your Need", "Add issue, photos, budget, and location."],
                        ["2", "Businesses compete", "Receive structured offers from nearby partners."],
                        ["3", "Choose the best", "Compare price, speed, trust, and service details."],
                    ].map(([step, title, copy]) => (
                        <div key={step} className="rounded-[12px] border border-[#dfe8e3] bg-[#fbfdfc] p-5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#009f58] text-sm font-black text-white">{step}</span>
                            <h2 className="mt-4 text-lg font-black text-[#081a13]">{title}</h2>
                            <p className="mt-2 text-sm font-medium leading-6 text-[#6b7a73]">{copy}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-[#fbfdfc] px-4 py-10 md:px-6">
                <div className="mx-auto max-w-[1180px]">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#009f58]">Live customer needs</p>
                            <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#081a13]">Requests businesses can quote</h2>
                        </div>
                        <Link href="/marketplace" className="hidden text-sm font-black text-[#009f58] md:inline-flex">
                            View all requests
                        </Link>
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-3">
                        {liveNeeds.length > 0
                            ? liveNeeds.map((need) => <LiveNeedCard key={need.id} need={need} viewer={viewerLocation} />)
                            : previewNeeds.map((item) => <PreviewNeedCard key={item.title} item={item} />)}
                    </div>
                </div>
            </section>

            <section className="px-4 pb-12 md:px-6">
                <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-[16px] border border-[#cfe8d9] bg-[#081a13] md:grid-cols-[1fr_360px]">
                    <div className="p-7 text-white md:p-9">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#8ef0be]">For repair shops and home service teams</p>
                        <h2 className="mt-3 text-3xl font-black tracking-[-0.04em]">Get real customer requests without chasing ads.</h2>
                        <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-white/68">
                            Needero is built for first mobile repair and home services. Businesses receive active Needs, send quotes, and build trust from completed jobs.
                        </p>
                    </div>
                    <div className="flex items-center justify-center bg-[#0f2b20] p-7">
                        <Link href="/register" className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-white px-6 text-sm font-black text-[#081a13] transition hover:bg-[#e9f8f0]">
                            Become a Partner
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="border-t border-[#dfe8e3] bg-white px-4 py-8 md:px-6">
                <div className="mx-auto flex max-w-[1180px] flex-col gap-5 md:flex-row md:items-center md:justify-between">
                    <NeederoLogo />
                    <div className="flex flex-wrap gap-4 text-sm font-bold text-[#5c6c64]">
                        <Link href="/privacy">Privacy</Link>
                        <Link href="/terms">Terms</Link>
                        <Link href="/support">Support</Link>
                        <Link href="/register">Partner</Link>
                    </div>
                    <p className="text-xs font-semibold text-[#87958f]">2026 Needero. Post. Compare. Choose.</p>
                </div>
            </footer>
        </main>
    );
}
