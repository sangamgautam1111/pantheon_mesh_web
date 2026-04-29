"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    BadgeCheck,
    BookOpen,
    Briefcase,
    Camera,
    CheckCircle2,
    Clock,
    Code2,
    CreditCard,
    DollarSign,
    GraduationCap,
    Headphones,
    Home as HomeIcon,
    MapPin,
    Megaphone,
    MessageSquare,
    Palette,
    PenLine,
    Search,
    ShieldCheck,
    Star,
    Store,
    Video,
    Wrench,
    Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NeedRecord, getNeeds } from "@/lib/neederoDatabase";

const HERO_SUGGESTIONS = ["Phone repair", "House cleaning", "Plumber", "Logo design", "Laptop repair"];

type CategoryCard = {
    label: string;
    icon: LucideIcon;
    href: string;
};

type IconInfoCard = {
    icon: LucideIcon;
    title: string;
    copy: string;
};

const CATEGORY_CARDS: CategoryCard[] = [
    { label: "Graphics & Design", icon: Palette, href: "/marketplace?q=graphics%20design" },
    { label: "Digital Marketing", icon: Megaphone, href: "/marketplace?q=digital%20marketing" },
    { label: "Writing & Translation", icon: PenLine, href: "/marketplace?q=writing%20translation" },
    { label: "Video & Animation", icon: Video, href: "/marketplace?q=video%20animation" },
    { label: "Music & Audio", icon: Headphones, href: "/marketplace?q=music%20audio" },
    { label: "Programming & Tech", icon: Code2, href: "/marketplace?q=programming%20tech" },
    { label: "Home Services", icon: HomeIcon, href: "/marketplace?q=home%20services" },
    { label: "Repair & Maintenance", icon: Wrench, href: "/marketplace?q=repair%20maintenance" },
    { label: "Consulting", icon: Briefcase, href: "/marketplace?q=consulting" },
    { label: "Personal Growth", icon: GraduationCap, href: "/marketplace?q=personal%20growth" },
    { label: "Photography", icon: Camera, href: "/marketplace?q=photography" },
    { label: "Finance", icon: DollarSign, href: "/marketplace?q=finance" },
];

const SERVICE_TILES = [
    { title: "Phone screen repair", copy: "Compare repair price, arrival time, warranty, and shop trust.", tone: "bg-[#06411f]" },
    { title: "Home deep cleaning", copy: "Get clear service scope, visit time, extra fees, and booking details.", tone: "bg-[#123b66]" },
    { title: "Logo and print work", copy: "Ask local designers and printers for package-ready Offers.", tone: "bg-[#5a3513]" },
    { title: "Website support", copy: "Post a technical Need and let nearby specialists quote the fix.", tone: "bg-[#25213f]" },
    { title: "Moving and delivery", copy: "Compare pickup, delivery, delay rules, and total service cost.", tone: "bg-[#4a1824]" },
];

const TRUST_ITEMS: IconInfoCard[] = [
    { icon: ShieldCheck, title: "Verified businesses", copy: "Profiles, ratings, and trust signals" },
    { icon: CreditCard, title: "Payment-ready pipeline", copy: "Designed for hold and release later" },
    { icon: MessageSquare, title: "Structured Offers", copy: "Price, time, warranty, service type" },
    { icon: Clock, title: "Fast local replies", copy: "Quote pipeline built for speed" },
];

const BUSINESS_ITEMS: IconInfoCard[] = [
    { icon: Store, title: "Lead inbox", copy: "Browse matching Needs from nearby customers." },
    { icon: Zap, title: "Quote tools", copy: "Send price, time, warranty, and service type." },
    { icon: Star, title: "Trust profile", copy: "Show services, photos, policies, and reviews." },
    { icon: BookOpen, title: "Pipeline analytics", copy: "Track quotes sent, bookings won, and response time." },
];

const PREVIEW_NEEDS = [
    {
        title: "Urgent phone screen repair",
        category: "Repair & maintenance",
        location: "New Road",
        offers: 3,
        bestPrice: "$45",
        fastest: "45 min",
    },
    {
        title: "Two-bedroom deep clean",
        category: "Home services",
        location: "Baneshwor",
        offers: 4,
        bestPrice: "$28",
        fastest: "Today",
    },
    {
        title: "Cafe logo and menu print",
        category: "Design & printing",
        location: "Lalitpur",
        offers: 5,
        bestPrice: "$55",
        fastest: "Tomorrow",
    },
];

const FOOTER_COLUMNS = [
    {
        title: "Categories",
        links: [
            "Graphics & Design",
            "Digital Marketing",
            "Writing & Translation",
            "Video & Animation",
            "Music & Audio",
            "Programming & Tech",
            "AI Services",
            "Consulting",
            "Data",
            "Business",
            "Photography",
            "Finance",
        ],
    },
    {
        title: "For Customers",
        links: [
            "How Needero Works",
            "Post a Need",
            "Compare Offers",
            "Choose a Business",
            "Quality Guide",
            "Safety Guide",
            "Browse by Category",
        ],
    },
    {
        title: "For Businesses",
        links: [
            "Join as a Business",
            "Lead Pipeline",
            "Quote Tools",
            "Business Profile",
            "Analytics",
            "Plans",
            "Community",
        ],
    },
    {
        title: "Business Solutions",
        links: [
            "Needero Pro",
            "Priority Visibility",
            "Instant Lead Alerts",
            "Verified Profile",
            "Profile Analytics",
            "AI Quote Helper",
            "Contact Sales",
        ],
    },
    {
        title: "Company",
        links: [
            "About Needero",
            "Help Center",
            "Trust & Safety",
            "Careers",
            "Terms of Service",
            "Privacy Policy",
            "Partnerships",
            "Press & News",
        ],
    },
];

function LiveNeedCard({ need }: { need: NeedRecord }) {
    return (
        <article className="group rounded-[24px] border border-[#e4e5e7] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-5 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-[11px] font-bold text-[#62646a]">
                    {need.category}
                </span>
                <span className="rounded-full bg-[#e9f9f0] px-3 py-1 text-[11px] font-bold text-[#0f8a4a]">
                    {need.offers || 0} Offers
                </span>
            </div>
            <h3 className="line-clamp-2 min-h-[52px] text-lg font-bold leading-snug text-[#222325] group-hover:text-[#1dbf73]">
                {need.title}
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#74767e]">{need.issue}</p>
            <div className="mt-5 flex items-center justify-between border-t border-[#efeff0] pt-4 text-sm">
                <span className="inline-flex items-center gap-1.5 font-semibold text-[#74767e]">
                    <MapPin size={15} />
                    {need.location}
                </span>
                <span className="font-bold text-[#222325]">{need.budget || "Open budget"}</span>
            </div>
        </article>
    );
}

function PreviewNeedCard({ item }: { item: (typeof PREVIEW_NEEDS)[number] }) {
    return (
        <article className="rounded-[24px] border border-[#e4e5e7] bg-white p-5 shadow-sm">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#1dbf73]">{item.category}</p>
            <h3 className="mt-3 text-lg font-bold leading-snug text-[#222325]">{item.title}</h3>
            <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-[#f7f7f7] p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#95979d]">Offers</p>
                    <p className="mt-1 font-black">{item.offers}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f7f7] p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#95979d]">Best</p>
                    <p className="mt-1 font-black">{item.bestPrice}</p>
                </div>
                <div className="rounded-2xl bg-[#f7f7f7] p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#95979d]">Fastest</p>
                    <p className="mt-1 font-black">{item.fastest}</p>
                </div>
            </div>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#74767e]">
                <MapPin size={15} />
                {item.location}
            </p>
        </article>
    );
}

export default function Home() {
    const router = useRouter();
    const { accountType } = useAuth();
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [feedMode, setFeedMode] = useState<"live" | "preview">("preview");
    const [searchInput, setSearchInput] = useState("");
    const liveNeeds = useMemo(() => needs.slice(0, 6), [needs]);

    useEffect(() => {
        const loadNeeds = async () => {
            try {
                const data = await getNeeds();
                setNeeds(data);
                setFeedMode(data.length > 0 ? "live" : "preview");
            } catch (error) {
                console.warn("Needero live feed unavailable, showing preview cards:", error);
                setNeeds([]);
                setFeedMode("preview");
            }
        };

        void loadNeeds();
    }, []);

    const runSearch = () => {
        const query = searchInput.trim();
        router.push(query ? `/marketplace?q=${encodeURIComponent(query)}` : "/marketplace");
    };

    return (
        <main className="bg-[#f7faf8] text-[#222325]">
            <section className="relative min-h-[680px] overflow-hidden bg-[#050816]">
                <video
                    className="absolute inset-0 h-full w-full object-cover opacity-60"
                    src="/video/video.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,22,0.94),rgba(5,8,22,0.66),rgba(5,8,22,0.32))]" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f7faf8] to-transparent" />

                <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-5 py-16 md:px-8 lg:grid-cols-[1fr_440px]">
                    <div className="max-w-4xl">
                        <p className="text-sm font-black uppercase tracking-[0.24em] text-[#1dbf73]">
                            Reverse local marketplace
                        </p>
                        <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.055em] text-white md:text-7xl">
                            Post a Need. Get local Offers.
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
                            Needero lets nearby businesses compete with price, time, warranty, and service type so you choose the best one safely.
                        </p>

                        <div className="mt-8 flex max-w-3xl items-center gap-2 rounded-[18px] bg-white p-2 shadow-2xl">
                            <Search className="ml-3 shrink-0 text-[#74767e]" size={21} />
                            <input
                                value={searchInput}
                                onChange={(event) => setSearchInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") runSearch();
                                }}
                                placeholder="What service do you need today?"
                                className="h-14 flex-1 bg-transparent px-2 text-base font-medium text-[#222325] outline-none"
                            />
                            <button
                                onClick={runSearch}
                                className="h-14 rounded-[14px] bg-[#1dbf73] px-7 text-sm font-black text-white transition hover:bg-[#18a864]"
                            >
                                Search
                            </button>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-white/55">Popular</span>
                            {HERO_SUGGESTIONS.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => router.push(`/marketplace?q=${encodeURIComponent(item)}`)}
                                    className="rounded-full border border-white/25 bg-white/5 px-4 py-2 text-sm font-bold text-white/85 backdrop-blur transition hover:bg-white/15"
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        <div className="mt-10 flex flex-wrap gap-5 text-sm font-semibold text-white/70">
                            {["Free for customers", "Structured Offers", "Contact protected", "Local businesses"].map((item) => (
                                <span key={item} className="inline-flex items-center gap-2">
                                    <CheckCircle2 size={17} className="text-[#1dbf73]" />
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>

                    <aside className="hidden rounded-[30px] border border-white/15 bg-white/95 p-5 shadow-2xl backdrop-blur lg:block">
                        <div className="flex items-center justify-between">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#95979d]">Offer preview</p>
                            <span className="rounded-full bg-[#e9f9f0] px-3 py-1 text-xs font-black text-[#0f8a4a]">Best Match</span>
                        </div>
                        <div className="mt-5 rounded-[24px] bg-[#f7f7f7] p-5">
                            <p className="text-lg font-black">Urgent phone repair</p>
                            <p className="mt-2 text-sm leading-6 text-[#74767e]">Customer needs screen replacement today near New Road.</p>
                            <div className="mt-5 grid grid-cols-3 gap-2">
                                {[
                                    ["Offers", "3"],
                                    ["Fastest", "45 min"],
                                    ["Best", "$45"],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-2xl bg-white p-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#95979d]">{label}</p>
                                        <p className="mt-1 font-black">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-4 rounded-[24px] border border-[#e4e5e7] bg-white p-5">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="font-black">Ram Mobile Repair</p>
                                    <p className="mt-1 text-sm text-[#74767e]">Verified - 4.8 rating - 1.2 km away</p>
                                </div>
                                <BadgeCheck className="text-[#1dbf73]" size={22} />
                            </div>
                            <div className="mt-4 rounded-2xl bg-[#050816] p-4 text-white">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Quote</p>
                                <p className="mt-1 text-2xl font-black">$45</p>
                                <p className="mt-2 text-sm text-white/70">Home Visit - Today 4:00 PM - 7-day warranty</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>

            <section className="border-y border-[#e4e5e7] bg-white">
                <div className="mx-auto grid max-w-7xl gap-4 px-5 py-6 md:grid-cols-4 md:px-8">
                    {TRUST_ITEMS.map((item) => (
                        <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-[#f7faf8] p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e9f9f0] text-[#1dbf73]">
                                <item.icon size={20} />
                            </div>
                            <div>
                                <p className="font-black">{item.title}</p>
                                <p className="mt-1 text-sm text-[#74767e]">{item.copy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="bg-white px-5 py-12 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-[#62646a]">Service catalog</p>
                            <h2 className="mt-1 text-3xl font-black tracking-[-0.04em]">Local services at your fingertips</h2>
                        </div>
                        <Link href="/marketplace" className="hidden items-center gap-2 text-sm font-black text-[#1dbf73] md:inline-flex">
                            Browse marketplace
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                        {CATEGORY_CARDS.map((item) => (
                            <Link
                                key={item.label}
                                href={item.href}
                                className="group min-h-[145px] rounded-[22px] border border-[#e4e5e7] bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                            >
                                <item.icon size={25} className="text-[#222325]" />
                                <p className="mt-8 text-base font-black leading-snug group-hover:text-[#1dbf73]">{item.label}</p>
                                <ArrowRight className="mt-4 text-[#95979d] transition group-hover:translate-x-1 group-hover:text-[#1dbf73]" size={18} />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-y border-[#e4e5e7] bg-[#fbfbfb] px-5 py-12 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-3xl font-black tracking-[-0.04em]">Popular Need types</h2>
                        <Link href="/client/new" className="rounded-xl bg-[#050816] px-5 py-3 text-sm font-black text-white transition hover:bg-[#1dbf73]">
                            Post a Need
                        </Link>
                    </div>
                    <div className="flex gap-5 overflow-x-auto pb-3">
                        {SERVICE_TILES.map((tile) => (
                            <article key={tile.title} className={`min-w-[260px] overflow-hidden rounded-[24px] ${tile.tone} p-5 text-white shadow-sm`}>
                                <h3 className="text-xl font-black leading-tight">{tile.title}</h3>
                                <p className="mt-16 text-sm leading-6 text-white/75">{tile.copy}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {[
                            ["1", "Post a Need", "Describe the problem once. Needero turns messy input into a clean local request card."],
                            ["2", "Receive Offers", "Nearby businesses submit structured Quotes with price, time, warranty, and service type."],
                            ["3", "Compare & Choose", "Chat inside the Quote, choose the best Offer, then move into Booking and payment hold."],
                        ].map(([step, title, copy]) => (
                            <div key={step} className="rounded-[30px] border border-[#e4e5e7] bg-white p-7 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#050816] text-lg font-black text-white">{step}</div>
                                <h3 className="mt-7 text-2xl font-black tracking-[-0.03em]">{title}</h3>
                                <p className="mt-3 text-base leading-7 text-[#74767e]">{copy}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-16 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <p className="text-sm font-black uppercase tracking-[0.2em] text-[#1dbf73]">
                                {feedMode === "live" ? "Live marketplace" : "Marketplace preview"}
                            </p>
                            <h2 className="mt-2 text-4xl font-black tracking-[-0.05em]">See local demand in action</h2>
                            <p className="mt-2 max-w-2xl text-[#74767e]">
                                New Needs appear as cards with category, location, budget, and Offer count. Preview cards keep the page useful while the live feed warms up.
                            </p>
                        </div>
                        <Link href="/marketplace" className="inline-flex items-center gap-2 rounded-xl border border-[#222325] px-5 py-3 text-sm font-black transition hover:bg-[#222325] hover:text-white">
                            Browse all Needs
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="grid gap-5 md:grid-cols-3">
                        {feedMode === "live" && liveNeeds.length > 0
                            ? liveNeeds.slice(0, 3).map((need) => <LiveNeedCard key={need.id} need={need} />)
                            : PREVIEW_NEEDS.map((item) => <PreviewNeedCard key={item.title} item={item} />)}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 md:px-8">
                <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[34px] border border-[#dfe8e3] bg-[#082c1d] shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="p-8 text-white md:p-12">
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-[#18c878]">For local businesses</p>
                        <h2 className="mt-5 text-4xl font-black leading-tight tracking-[-0.05em] md:text-5xl">
                            Get nearby customers who already need your service.
                        </h2>
                        <p className="mt-5 max-w-xl text-lg leading-8 text-white/70">
                            Needero gives businesses a lead pipeline, structured quote tools, profile trust, analytics, and subscription growth without needing a full website.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href="/login?role=business" className="rounded-xl bg-white px-6 py-4 text-sm font-black text-[#082c1d] transition hover:bg-[#e9f9f0]">
                                Join as Business
                            </Link>
                            <Link href="/pricing" className="rounded-xl border border-white/25 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10">
                                View plans
                            </Link>
                        </div>
                    </div>
                    <div className="grid gap-3 bg-white/5 p-8 md:grid-cols-2 md:p-12">
                        {BUSINESS_ITEMS.map((item) => (
                            <div key={item.title} className="rounded-[24px] border border-white/10 bg-white/10 p-5 text-white">
                                <item.icon size={22} className="text-[#18c878]" />
                                <p className="mt-5 font-black">{item.title}</p>
                                <p className="mt-2 text-sm leading-6 text-white/62">{item.copy}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-5 py-16 text-center md:px-8">
                <div className="mx-auto max-w-4xl rounded-[34px] bg-[linear-gradient(135deg,#050816,#082c1d)] p-10 text-white shadow-2xl md:p-14">
                    <h2 className="text-4xl font-black tracking-[-0.05em]">Ready to get your first Offer?</h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
                        Post a Need for free and let nearby businesses compete with clear, structured Offers.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-3">
                        <Link href={accountType === "business" ? "/marketplace" : "/client/new"} className="rounded-xl bg-[#1dbf73] px-7 py-4 text-sm font-black text-white transition hover:bg-[#18a864]">
                            {accountType === "business" ? "Browse Needs" : "Post a Need"}
                        </Link>
                        <Link href="/marketplace" className="rounded-xl border border-white/20 px-7 py-4 text-sm font-black text-white transition hover:bg-white/10">
                            Browse Needs
                        </Link>
                    </div>
                </div>
            </section>

            <footer className="border-t border-[#e4e5e7] bg-white px-5 py-12 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid gap-10 md:grid-cols-3 lg:grid-cols-5">
                        {FOOTER_COLUMNS.map((column) => (
                            <div key={column.title}>
                                <h3 className="font-black">{column.title}</h3>
                                <div className="mt-5 space-y-3">
                                    {column.links.map((link) => (
                                        <a key={link} className="block cursor-pointer text-sm font-medium text-[#62646a] transition hover:text-[#1dbf73]">
                                            {link}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 flex flex-col gap-4 border-t border-[#e4e5e7] pt-8 md:flex-row md:items-center md:justify-between">
                        <p className="text-3xl font-black tracking-[-0.06em]">
                            Need<span className="text-[#1dbf73]">ero</span>
                        </p>
                        <p className="text-sm font-semibold text-[#74767e]">Needero Local Marketplace Ltd. 2026</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
