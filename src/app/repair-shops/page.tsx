import type { Metadata } from "next";
import Link from "next/link";
import { Smartphone, Star, Shield, ArrowRight, Zap, TrendingUp, Wrench, Laptop, Tv, Watch } from "lucide-react";

export const metadata: Metadata = {
    title: "Repair Shops Near You — Mobile, Laptop & Electronics Repair | Needero",
    description: "Find the best repair shops near you on Needero. Get quotes for mobile phone repair, laptop repair, TV repair, and electronics repair. Post your repair need and let local shops compete with the best prices. Founded by 13-year-old entrepreneur Sangam Gautam from Nepal.",
    keywords: ["mobile repair near me", "phone repair Nepal", "laptop repair Kathmandu", "electronics repair", "screen replacement", "best repair shop", "Needero repair", "iPhone repair Nepal", "Samsung repair", "Sangam Gautam"],
    alternates: { canonical: "/repair-shops" },
    openGraph: {
        title: "Find Repair Shops Near You — Needero Mobile & Electronics Repair",
        description: "Post your repair need and get competitive quotes from verified local repair shops. Needero — founded by 13-year-old Sangam Gautam.",
        url: "https://needero.com/repair-shops",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Repair Shops Near You — Needero",
        description: "Get the best repair quotes from local shops. Mobile, laptop, TV & electronics.",
    },
};

const repairTypes = [
    { name: "Mobile Phone Repair", icon: Smartphone, services: "Screen, battery, charging port, water damage" },
    { name: "Laptop / Computer Repair", icon: Laptop, services: "Screen, keyboard, SSD upgrade, virus removal" },
    { name: "TV & Display Repair", icon: Tv, services: "Panel replacement, power supply, backlight" },
    { name: "Smart Watch Repair", icon: Watch, services: "Screen, battery, strap, software" },
];

const howItWorks = [
    { step: "1", title: "Describe Your Device Issue", description: "Tell us what's broken — phone model, issue type, and upload a photo if possible.", icon: Zap },
    { step: "2", title: "Receive Repair Quotes", description: "Nearby verified repair shops see your need and send competitive quotes with price and warranty.", icon: TrendingUp },
    { step: "3", title: "Choose & Get Fixed", description: "Compare repair quotes, pick the best shop, and get your device fixed — with warranty.", icon: Star },
];

const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Needero Repair Services",
    "url": "https://needero.com/repair-shops",
    "description": "Find and compare local mobile phone, laptop, and electronics repair shops on Needero. Get competitive repair quotes instantly.",
    "areaServed": { "@type": "Country", "name": "Nepal" },
    "provider": {
        "@type": "Organization",
        "name": "Needero",
        "founder": { "@type": "Person", "name": "Sangam Gautam", "description": "13-year-old tech entrepreneur from Nepal" },
    },
};

export default function RepairShopsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <main className="min-h-screen bg-[#fafafa]">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#0a8f45] via-[#38b000] to-[#70e000] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.1),transparent_40%)]" />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Needero Repair Marketplace</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            Repair shops{" "}
                            <span className="text-yellow-300">near you</span>,{" "}
                            competing for the best price
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                            Don't visit 5 different shops for quotes. Post your device issue once — verified local repair shops will send you their best price, warranty, and turnaround time.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href="/client/new" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-[#0a8f45] shadow-lg transition hover:shadow-xl">
                                <Wrench size={18} /> Get Repair Quotes
                            </Link>
                            <Link href="/register/repair-shop" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/10">
                                <Shield size={18} /> Register Your Repair Shop
                            </Link>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <h2 className="text-center text-3xl font-black text-[#222325]">How Needero Repair Works</h2>
                    <p className="mt-2 text-center text-[#62646a]">3 simple steps to get your device fixed at the best price</p>
                    <div className="mt-12 grid gap-8 sm:grid-cols-3">
                        {howItWorks.map((item) => (
                            <div key={item.step} className="rounded-3xl border border-[#e4e5e7] bg-white p-8 text-center transition hover:shadow-lg">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0a8f45] to-[#38b000] text-xl font-black text-white">
                                    {item.step}
                                </div>
                                <h3 className="mt-5 text-lg font-black text-[#222325]">{item.title}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-[#62646a]">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Repair categories */}
                <section className="border-t border-[#e4e5e7] bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <h2 className="text-3xl font-black text-[#222325]">What We Repair</h2>
                        <p className="mt-2 text-[#62646a]">From cracked screens to dead batteries — find a shop for every device</p>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2">
                            {repairTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <Link
                                        key={type.name}
                                        href="/marketplace/category/mobile"
                                        className="group flex items-center gap-5 rounded-2xl border border-[#e4e5e7] bg-[#fafafa] p-6 transition hover:border-[#0a8f45] hover:shadow-md"
                                    >
                                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#0a8f45]/10 text-[#0a8f45]">
                                            <Icon size={24} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#222325] group-hover:text-[#0a8f45]">{type.name}</p>
                                            <p className="mt-1 text-xs text-[#74767e]">{type.services}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="bg-[#050816] text-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
                        <h2 className="text-3xl font-black">Own a repair shop? Join Needero today.</h2>
                        <p className="mt-3 text-white/60">Register your repair shop and start receiving repair leads from nearby customers. Zero upfront cost.</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Link href="/register/repair-shop" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0a8f45] to-[#38b000] px-8 py-4 text-sm font-black text-white shadow-lg">
                                Register Repair Shop <ArrowRight size={16} />
                            </Link>
                        </div>
                        <p className="mt-6 text-xs text-white/40">
                            Needero — Founded by 13-year-old entrepreneur Sangam Gautam from Nepal
                        </p>
                    </div>
                </section>
            </main>
        </>
    );
}
