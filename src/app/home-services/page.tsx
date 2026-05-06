import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bath, CheckCircle2, Home, Shield, Sparkles, SprayCan, Star, TrendingUp, Zap } from "lucide-react";

export const metadata: Metadata = {
    title: "Home Cleaning Near You | Needero",
    description:
        "Book home cleaning professionals near you on Needero. Post your cleaning Need and get competitive quotes from local cleaning partners.",
    keywords: ["home cleaning Nepal", "house cleaning service", "deep cleaning Kathmandu", "cleaner near me", "Needero home cleaning"],
    alternates: { canonical: "/home-services" },
    openGraph: {
        title: "Book Home Cleaning Near You - Needero",
        description: "Post your cleaning Need and get competitive quotes from local cleaning partners.",
        url: "https://needero.com/home-services",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Home Cleaning Near You - Needero",
        description: "Regular cleaning, deep cleaning, kitchen, bathroom, sofa, carpet, and office cleaning quotes.",
    },
};

const serviceTypes = [
    { name: "Regular Cleaning", icon: Home, services: "Routine room cleaning, dusting, sweeping, mopping" },
    { name: "Deep Cleaning", icon: Sparkles, services: "Full home deep clean, stains, corners, appliances" },
    { name: "Kitchen Cleaning", icon: SprayCan, services: "Grease removal, counters, cabinets, sink, floor" },
    { name: "Bathroom Cleaning", icon: Bath, services: "Tiles, toilet, shower, sink, mirrors, disinfection" },
];

const howItWorks = [
    { step: "1", title: "Describe Cleaning Scope", description: "Tell us the rooms, cleaning type, area, urgency, and budget.", icon: Zap },
    { step: "2", title: "Get Cleaning Quotes", description: "Nearby cleaning partners send offers with price, time, team size, and materials.", icon: TrendingUp },
    { step: "3", title: "Choose a Partner", description: "Compare quotes, choose the best provider, and get the cleaning done.", icon: Star },
];

const structuredData = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "Needero Home Cleaning",
    "url": "https://needero.com/home-services",
    "description": "Find and compare local home cleaning professionals near you via Needero.",
    "areaServed": { "@type": "Country", "name": "Nepal" },
    "provider": {
        "@type": "Organization",
        "name": "Needero",
    },
};

export default function HomeServicesPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <main className="min-h-screen bg-[#fafafa]">
                <section className="relative overflow-hidden bg-gradient-to-br from-[#2563eb] via-[#7c3aed] to-[#a855f7] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.1),transparent_40%)]" />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Needero Home Cleaning</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            Home cleaning partners{" "}
                            <span className="text-yellow-300">near you</span>,{" "}
                            ready to quote
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                            Post one cleaning Need and receive clear offers from local cleaning businesses. Compare price, timing, team details, and service scope before choosing.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href="/client/new" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-[#7c3aed] shadow-lg transition hover:shadow-xl">
                                <Home size={18} /> Post Cleaning Need
                            </Link>
                            <Link href="/register/home-service" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/10">
                                <Shield size={18} /> Register Cleaning Business
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <h2 className="text-center text-3xl font-black text-[#222325]">How Needero Home Cleaning Works</h2>
                    <p className="mt-2 text-center text-[#62646a]">3 simple steps to get the best local cleaning offer</p>
                    <div className="mt-12 grid gap-8 sm:grid-cols-3">
                        {howItWorks.map((item) => (
                            <div key={item.step} className="rounded-3xl border border-[#e4e5e7] bg-white p-8 text-center transition hover:shadow-lg">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2563eb] to-[#7c3aed] text-xl font-black text-white">
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
                        <h2 className="text-3xl font-black text-[#222325]">Cleaning Services Available</h2>
                        <p className="mt-2 text-[#62646a]">Professional cleaning help for homes and offices</p>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {serviceTypes.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <Link
                                        key={type.name}
                                        href="/marketplace/category/home"
                                        className="group flex items-center gap-4 rounded-2xl border border-[#e4e5e7] bg-[#fafafa] p-5 transition hover:border-[#7c3aed] hover:shadow-md"
                                    >
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed]">
                                            <Icon size={22} />
                                        </div>
                                        <div>
                                            <p className="font-black text-[#222325] group-hover:text-[#7c3aed]">{type.name}</p>
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
                        <h2 className="mt-5 text-3xl font-black">Own a cleaning business? Join Needero.</h2>
                        <p className="mt-3 text-white/60">Register your cleaning business and start receiving customer leads. Zero upfront cost for MVP onboarding.</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Link href="/register/home-service" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-8 py-4 text-sm font-black text-white shadow-lg">
                                Register Cleaning Business <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
