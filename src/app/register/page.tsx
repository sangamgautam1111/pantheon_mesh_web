import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Home, Shield, Smartphone, Star, TrendingUp, Users } from "lucide-react";

export const metadata: Metadata = {
    title: "Become a Partner - Register Your Business | Needero",
    description:
        "Join Needero as a Home Cleaning Partner or Mobile Repair Partner. Needero connects local businesses with verified customers who need service now. Register free and start receiving leads.",
    keywords: [
        "register business Needero",
        "home cleaning partner Nepal",
        "mobile repair shop registration",
        "Needero partner",
        "local business marketplace Nepal",
    ],
    alternates: { canonical: "/register" },
    openGraph: {
        title: "Become a Needero Partner - Grow Your Local Business",
        description:
            "Register your home cleaning or mobile repair business on Needero and get real customer leads delivered directly to you.",
        url: "https://needero.com/register",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Register Your Business on Needero",
        description: "Join Needero's marketplace for home cleaning and mobile repair leads.",
    },
};

const partnerTypes = [
    {
        title: "Home Cleaning Partner",
        description:
            "Register your cleaning business or team. Customers who need regular cleaning, deep cleaning, kitchen cleaning, bathroom cleaning, or office cleaning can request quotes from you.",
        href: "/register/home-service",
        icon: Home,
        gradient: "from-[#2563eb] to-[#7c3aed]",
        bgLight: "bg-gradient-to-br from-[#eff6ff] to-[#f5f3ff]",
        borderColor: "border-[#c7d2fe]",
        stats: "Home cleaning is the first MVP priority",
        features: ["Area-based matching", "Schedule management", "Customer reviews"],
    },
    {
        title: "Mobile Repair Partner",
        description:
            "Register your mobile repair shop. Customers with broken screens, battery issues, charging problems, or water damage can find you and request quotes instantly.",
        href: "/register/repair-shop",
        icon: Smartphone,
        gradient: "from-[#0a8f45] to-[#38b000]",
        bgLight: "bg-gradient-to-br from-[#f0fbf4] to-[#edfcf2]",
        borderColor: "border-[#c4edcf]",
        stats: "Built for phone repair shops",
        features: ["Lead notifications", "Quote system", "Warranty tracking"],
    },
];

const trustPoints = [
    { icon: Shield, title: "Verified Customers", description: "Every customer verifies their phone before posting a need" },
    { icon: TrendingUp, title: "Grow Revenue", description: "Turn idle hours into profitable jobs with warm leads" },
    { icon: Users, title: "Zero Commission Start", description: "No upfront fees - register free and start receiving leads" },
    { icon: Star, title: "Build Reputation", description: "Earn reviews and ratings to stand out from competitors" },
];

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-[#fafafa]">
            <section className="relative overflow-hidden bg-[#050816] text-white">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(10,143,69,0.15),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.12),transparent_40%)]" />
                <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-[#0a8f45]">Needero Partner Program</p>
                    <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                        Grow your business with{" "}
                        <span className="bg-gradient-to-r from-[#0a8f45] to-[#38b000] bg-clip-text text-transparent">Needero</span>
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/70">
                        Needero is a demand-based service marketplace for home cleaning and mobile repair. Customers post what they need, and qualified local partners send clear offers with price, timing, and service details.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-6">
                        {trustPoints.map((point) => (
                            <div key={point.title} className="flex items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                                    <point.icon size={18} className="text-[#0a8f45]" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">{point.title}</p>
                                    <p className="text-xs text-white/50">{point.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
                <div className="text-center">
                    <h2 className="text-3xl font-black tracking-[-0.03em] text-[#222325] sm:text-4xl">Choose your business type</h2>
                    <p className="mt-3 text-[#62646a]">Select the category that best describes your business to get started</p>
                </div>

                <div className="mx-auto mt-12 grid max-w-5xl gap-8 lg:grid-cols-2">
                    {partnerTypes.map((partner) => {
                        const Icon = partner.icon;
                        return (
                            <Link
                                key={partner.href}
                                href={partner.href}
                                className={`group relative overflow-hidden rounded-3xl border ${partner.borderColor} ${partner.bgLight} p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl`}
                            >
                                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${partner.gradient} text-white shadow-lg`}>
                                    <Icon size={28} />
                                </div>
                                <h3 className="mt-6 text-2xl font-black text-[#222325]">{partner.title}</h3>
                                <p className="mt-3 text-sm leading-relaxed text-[#62646a]">{partner.description}</p>

                                <ul className="mt-6 space-y-2">
                                    {partner.features.map((feature) => (
                                        <li key={feature} className="flex items-center gap-2 text-sm text-[#404145]">
                                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0a8f45]/10 text-[#0a8f45]">
                                                <Check size={12} />
                                            </span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-8 flex items-center justify-between gap-4">
                                    <span className="text-xs font-semibold text-[#74767e]">{partner.stats}</span>
                                    <span className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${partner.gradient} px-5 py-2.5 text-sm font-black text-white shadow-lg transition-transform group-hover:scale-105`}>
                                        Register <ArrowRight size={16} />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
