import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BatteryCharging, CheckCircle2, PlugZap, Shield, Smartphone, Star, TrendingUp, Wrench, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Mobile Repair Shops Near You | Needero",
    description:
        "Find mobile repair shops near you on Needero. Get quotes for phone screen repair, battery replacement, charging issues, water damage, and more.",
    keywords: ["mobile repair near me", "phone repair Nepal", "screen replacement Kathmandu", "iPhone repair Nepal", "Samsung repair"],
    alternates: { canonical: "/repair-shops" },
    openGraph: {
        title: "Find Mobile Repair Shops Near You - Needero",
        description: "Post your mobile repair Need and get competitive quotes from local repair shops.",
        url: "https://needero.com/repair-shops",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Mobile Repair Shops Near You - Needero",
        description: "Get the best phone repair quotes from local shops.",
    },
};

const repairTypes = [
    { name: "Screen Replacement", icon: Smartphone, services: "Cracked screen, display issue, touch problem" },
    { name: "Battery Replacement", icon: BatteryCharging, services: "Fast drain, swollen battery, phone shutting down" },
    { name: "Charging Port Repair", icon: PlugZap, services: "Loose port, slow charging, not charging" },
    { name: "Water Damage Repair", icon: Wrench, services: "Water exposure, power issue, speaker or mic problem" },
];

const howItWorks = [
    { step: "1", title: "Describe Your Phone Issue", description: "Tell us the phone brand, optional model, issue type, and upload a photo if possible.", icon: Zap },
    { step: "2", title: "Receive Repair Quotes", description: "Nearby repair shops send competitive quotes with price, warranty, and turnaround time.", icon: TrendingUp },
    { step: "3", title: "Choose & Get Fixed", description: "Compare repair quotes, pick the best shop, and get your phone fixed.", icon: Star },
];

const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Needero Mobile Repair",
    "url": "https://needero.com/repair-shops",
    "description": "Find and compare local mobile phone repair shops on Needero.",
    "areaServed": { "@type": "Country", "name": "Nepal" },
    "provider": {
        "@type": "Organization",
        "name": "Needero",
    },
};

export default function RepairShopsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <main className="min-h-screen bg-[#fafafa]">
                <section className="relative overflow-hidden bg-gradient-to-br from-[#0a8f45] via-[#38b000] to-[#70e000] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.1),transparent_40%)]" />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Needero Mobile Repair</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            Mobile repair shops{" "}
                            <span className="text-yellow-300">near you</span>,{" "}
                            competing for the best price
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                            Do not visit multiple shops for quotes. Post your phone issue once and local repair shops send price, warranty, and turnaround time.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href="/client/new" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-[#0a8f45] shadow-lg transition hover:shadow-xl">
                                <Wrench size={18} /> Get Repair Quotes
                            </Link>
                            <Link href="/register/repair-shop" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/10">
                                <Shield size={18} /> Register Mobile Repair Shop
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <h2 className="text-center text-3xl font-black text-[#222325]">How Needero Mobile Repair Works</h2>
                    <p className="mt-2 text-center text-[#62646a]">3 simple steps to get your phone fixed at the best price</p>
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

                <section className="border-t border-[#e4e5e7] bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <h2 className="text-3xl font-black text-[#222325]">Mobile Repairs Available</h2>
                        <p className="mt-2 text-[#62646a]">From cracked screens to dead batteries, find a shop for your phone</p>
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

                <section className="bg-[#050816] text-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                            <CheckCircle2 size={24} />
                        </div>
                        <h2 className="mt-5 text-3xl font-black">Own a mobile repair shop? Join Needero.</h2>
                        <p className="mt-3 text-white/60">Register your mobile repair shop and start receiving repair leads from nearby customers. Zero upfront cost for MVP onboarding.</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Link href="/register/repair-shop" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0a8f45] to-[#38b000] px-8 py-4 text-sm font-black text-white shadow-lg">
                                Register Mobile Repair Shop <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
