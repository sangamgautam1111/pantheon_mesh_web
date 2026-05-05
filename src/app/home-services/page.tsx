import type { Metadata } from "next";
import Link from "next/link";
import { Home, Star, Shield, ArrowRight, Zap, TrendingUp, Droplets, Zap as Electric, Paintbrush, Hammer, Wind, Bug } from "lucide-react";

export const metadata: Metadata = {
    title: "Home Services Near You — Plumber, Electrician, Cleaner & More | Needero",
    description: "Book the best home service professionals near you on Needero. Find plumbers, electricians, cleaners, painters, carpenters, AC technicians and more. Post your need and get competitive quotes. Founded by 13-year-old entrepreneur Sangam Gautam from Nepal.",
    keywords: ["home services near me", "plumber Nepal", "electrician Kathmandu", "house cleaning service", "painter near me", "carpenter Nepal", "AC repair", "Needero home services", "handyman Nepal", "Sangam Gautam"],
    alternates: { canonical: "/home-services" },
    openGraph: {
        title: "Book Home Services Near You — Needero",
        description: "Plumber, electrician, cleaner, painter — post your home service need and get competitive quotes from verified professionals. Needero — founded by 13-year-old Sangam Gautam.",
        url: "https://needero.com/home-services",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Home Services Near You — Needero",
        description: "Book plumbers, electricians, cleaners & more. Get the best quotes from verified professionals.",
    },
};

const serviceTypes = [
    { name: "Plumbing", icon: Droplets, services: "Pipe repair, tap fix, water heater, toilet repair" },
    { name: "Electrical", icon: Electric, services: "Wiring, switch repair, inverter, MCB installation" },
    { name: "Painting", icon: Paintbrush, services: "Interior, exterior, texture, waterproofing" },
    { name: "Carpentry", icon: Hammer, services: "Furniture repair, door fix, cabinet making" },
    { name: "AC / Refrigeration", icon: Wind, services: "AC service, gas refill, fridge repair" },
    { name: "Pest Control", icon: Bug, services: "Termite, cockroach, mosquito, bed bug treatment" },
];

const howItWorks = [
    { step: "1", title: "Describe What You Need", description: "Tell us the service you need — plumbing, electrical, cleaning, or anything else at your home.", icon: Zap },
    { step: "2", title: "Get Professional Quotes", description: "Nearby verified professionals see your need and send competitive quotes with price and availability.", icon: TrendingUp },
    { step: "3", title: "Book & Get It Done", description: "Compare quotes, choose the best professional, and get your home service completed with quality guarantee.", icon: Star },
];

const structuredData = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "name": "Needero Home Services",
    "url": "https://needero.com/home-services",
    "description": "Book plumbers, electricians, cleaners, painters, carpenters and more home service professionals near you via Needero.",
    "areaServed": { "@type": "Country", "name": "Nepal" },
    "provider": {
        "@type": "Organization",
        "name": "Needero",
        "founder": { "@type": "Person", "name": "Sangam Gautam", "description": "13-year-old tech entrepreneur from Nepal" },
    },
};

export default function HomeServicesPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <main className="min-h-screen bg-[#fafafa]">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-br from-[#2563eb] via-[#7c3aed] to-[#a855f7] text-white">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(0,0,0,0.1),transparent_40%)]" />
                    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-white/80">Needero Home Services</p>
                        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                            Home service pros{" "}
                            <span className="text-yellow-300">near you</span>,{" "}
                            ready to help today
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                            Need a plumber? Electrician? Cleaner? Just post your need — verified professionals in your area will compete to offer you the best price and fastest service.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link href="/client/new" className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-[#7c3aed] shadow-lg transition hover:shadow-xl">
                                <Home size={18} /> Book a Service
                            </Link>
                            <Link href="/register/home-service" className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-8 py-4 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/10">
                                <Shield size={18} /> Register as Professional
                            </Link>
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                    <h2 className="text-center text-3xl font-black text-[#222325]">How Needero Home Services Work</h2>
                    <p className="mt-2 text-center text-[#62646a]">3 simple steps to get the best professional at the best price</p>
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

                {/* Service categories */}
                <section className="border-t border-[#e4e5e7] bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                        <h2 className="text-3xl font-black text-[#222325]">Services Available</h2>
                        <p className="mt-2 text-[#62646a]">Professional help for every home need</p>
                        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

                {/* CTA */}
                <section className="bg-[#050816] text-white">
                    <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
                        <h2 className="text-3xl font-black">Are you a home service professional? Join Needero.</h2>
                        <p className="mt-3 text-white/60">Register as a plumber, electrician, cleaner, painter, or carpenter and start getting booked. Zero upfront cost.</p>
                        <div className="mt-8 flex flex-wrap justify-center gap-4">
                            <Link href="/register/home-service" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2563eb] to-[#7c3aed] px-8 py-4 text-sm font-black text-white shadow-lg">
                                Register as Professional <ArrowRight size={16} />
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
