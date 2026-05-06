import type { Metadata } from "next";
import Link from "next/link";
import {
    ArrowRight,
    BarChart3,
    Check,
    Headphones,
    Home,
    MapPin,
    ShieldCheck,
    Smartphone,
    Sparkles,
    TrendingUp,
    Users,
    Wrench,
    Zap,
} from "lucide-react";

export const metadata: Metadata = {
    title: "Become a Partner - Register Your Business | Needero",
    description:
        "Join Needero as a Home Service Partner or Repair Shop Partner. Needero connects local businesses with verified customers who need service now.",
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
            "Register your home service or mobile repair business on Needero and get real customer leads delivered directly to you.",
        url: "https://needero.com/register",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Register Your Business on Needero",
        description: "Join Needero's marketplace for local service leads.",
    },
};

const heroStats = [
    { title: "Verified customers", copy: "All leads come after phone checks and trust signals.", icon: ShieldCheck },
    { title: "Warm local leads", copy: "Customers near you post real service needs.", icon: MapPin },
    { title: "Fast quote pipeline", copy: "Reply with price, time, warranty, and scope.", icon: Zap },
    { title: "No upfront commission start", copy: "Start receiving leads with zero listing fee.", icon: TrendingUp },
];

const partnerTypes = [
    {
        title: "Repair Shop Partner",
        description:
            "Register your mobile repair shop. Local customers with broken devices and urgent repair needs can request quotes from your business.",
        href: "/register/repair-shop",
        icon: Wrench,
        accent: "green",
        button: "Join as Repair Shop",
        features: ["Get local repair leads daily", "Lead notifications in real time", "Send quotes and manage jobs", "Analytics to grow your business"],
    },
    {
        title: "Home Service Partner",
        description:
            "Offer home cleaning and doorstep services. Customers actively looking for trusted local help can compare and choose your offer.",
        href: "/register/home-service",
        icon: Home,
        accent: "blue",
        button: "Join as Home Service Partner",
        features: ["Receive nearby service leads", "Smart matching for your services", "Schedule and manage jobs", "Build your customer reputation"],
    },
];

const footerCards = [
    { title: "Trusted & Secure", copy: "Your data is protected with enterprise-grade security.", icon: ShieldCheck },
    { title: "Built for Professionals", copy: "Tools and support designed to help you win more jobs.", icon: BarChart3 },
    { title: "Growing Together", copy: "Thousands of partners growing their business with Needero.", icon: Users },
    { title: "Partner Support", copy: "Dedicated support to help you succeed every step of the way.", icon: Headphones },
];

function LeadMockup() {
    return (
        <div className="rounded-[14px] border border-[#dfe8e3] bg-white p-4 shadow-[0_18px_55px_rgba(15,23,42,0.10)]">
            <div className="grid gap-3 lg:grid-cols-[1fr_132px]">
                <div className="space-y-3">
                    <div className="rounded-[10px] border border-[#edf2ef] bg-[#fbfffd] p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7d8790]">Leads Overview</p>
                                <p className="mt-2 text-3xl font-black tracking-[-0.05em] text-[#07121f]">128</p>
                                <p className="text-xs font-semibold text-[#7d8790]">New leads this week</p>
                            </div>
                            <div className="rounded-full bg-[#e8f8ef] px-2.5 py-1 text-[10px] font-black text-[#0a8f45]">+34%</div>
                        </div>
                        <div className="mt-3 flex h-20 items-center justify-center rounded-[10px] bg-[#ecfdf4]">
                            <div className="relative h-16 w-40">
                                {[18, 44, 72, 102, 126].map((left, index) => (
                                    <span
                                        key={left}
                                        className="absolute flex h-7 w-7 items-center justify-center rounded-full bg-[#d6f6e1] text-[#0a8f45] shadow-sm"
                                        style={{ left, top: index % 2 ? 26 : 6 }}
                                    >
                                        <MapPin size={14} fill="currentColor" />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[10px] border border-[#edf2ef] bg-white p-4">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7d8790]">Recent Leads</p>
                        {[
                            ["AC not cooling", "15m ago", "High match"],
                            ["Washing machine repair", "45m ago", "High match"],
                            ["Water heater installation", "1h ago", "Medium match"],
                        ].map(([title, time, badge]) => (
                            <div key={title} className="mt-3 flex items-center gap-3 rounded-[8px] border border-[#f0f3f1] p-2.5">
                                <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#eef4ff] text-[#2563eb]">
                                    <Wrench size={15} />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-xs font-black text-[#07121f]">{title}</p>
                                    <p className="text-[10px] font-semibold text-[#8a94a0]">{time}</p>
                                </div>
                                <span className="rounded-full bg-[#e8f8ef] px-2 py-1 text-[9px] font-black text-[#0a8f45]">{badge}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-[12px] bg-[#071427] p-4 text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">Partner Impact</p>
                    {[
                        ["2,450+", "Active Partners"],
                        ["98%", "Partner Satisfaction"],
                        ["40%+", "Average Lead Conversion"],
                    ].map(([value, label]) => (
                        <div key={label} className="mt-6">
                            <p className="text-2xl font-black tracking-[-0.04em]">{value}</p>
                            <p className="mt-1 text-[10px] font-semibold leading-4 text-white/55">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <main className="min-h-screen bg-white text-[#07121f]">
            <section className="border-b border-[#e8edf0] bg-[linear-gradient(90deg,#f4fff8_0%,#ffffff_52%,#eef6ff_100%)]">
                <div className="mx-auto grid max-w-[1180px] items-center gap-10 px-5 py-12 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f8ef] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#0a8f45]">
                            <Sparkles size={12} />
                            Needero Partner Program
                        </div>
                        <h1 className="mt-5 max-w-xl text-[38px] font-black leading-[0.98] tracking-[-0.055em] text-[#07121f] sm:text-[56px]">
                            Grow your local service business with{" "}
                            <span className="text-[#0a8f45]">Needero.</span>
                        </h1>
                        <p className="mt-5 max-w-lg text-sm font-medium leading-6 text-[#526170]">
                            Customers in your area post what they need. You receive nearby leads, quote fast, and win more jobs.
                        </p>

                        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {heroStats.map((item) => (
                                <div key={item.title} className="rounded-[10px] border border-[#dcefe5] bg-white/90 p-3 shadow-sm">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[#e8f8ef] text-[#0a8f45]">
                                        <item.icon size={16} />
                                    </div>
                                    <p className="mt-3 text-xs font-black text-[#07121f]">{item.title}</p>
                                    <p className="mt-1 text-[10px] font-semibold leading-4 text-[#72808e]">{item.copy}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <LeadMockup />
                    </div>
                </div>
            </section>

            <section className="bg-white px-5 py-9 md:px-8">
                <div className="mx-auto max-w-[820px] text-center">
                    <h2 className="text-2xl font-black tracking-[-0.04em] text-[#07121f]">Choose your business type</h2>
                    <p className="mt-2 text-xs font-medium text-[#6b7886]">Select the category that best describes your business to get started.</p>
                </div>

                <div className="mx-auto mt-6 grid max-w-[820px] gap-5 lg:grid-cols-2">
                    {partnerTypes.map((partner) => {
                        const Icon = partner.icon;
                        const green = partner.accent === "green";
                        return (
                            <Link
                                key={partner.href}
                                href={partner.href}
                                className={`group rounded-[12px] border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(15,23,42,0.10)] ${
                                    green ? "border-[#bfe8cd]" : "border-[#bccbff]"
                                }`}
                            >
                                <div className="flex gap-5">
                                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[12px] ${green ? "bg-[#e8f8ef] text-[#0a8f45]" : "bg-[#eef3ff] text-[#2457ff]"}`}>
                                        <Icon size={26} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-black tracking-[-0.035em] text-[#07121f]">{partner.title}</h3>
                                        <p className="mt-2 text-xs font-medium leading-5 text-[#627181]">{partner.description}</p>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-1.5">
                                    {partner.features.map((feature) => (
                                        <p key={feature} className="flex items-center gap-2 text-xs font-bold text-[#405060]">
                                            <Check size={14} className={green ? "text-[#0a8f45]" : "text-[#2457ff]"} />
                                            {feature}
                                        </p>
                                    ))}
                                </div>

                                <div className="mt-5 flex justify-end">
                                    <span className={`inline-flex items-center gap-2 rounded-[8px] px-4 py-2.5 text-xs font-black text-white transition group-hover:translate-x-0.5 ${
                                        green ? "bg-[#0a8f45]" : "bg-[#2457ff]"
                                    }`}>
                                        {partner.button}
                                        <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="mx-auto mt-8 grid max-w-[930px] gap-3 rounded-[12px] border border-[#e6ebef] bg-white p-3 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
                    {footerCards.map((item) => (
                        <div key={item.title} className="flex gap-3 border-[#eef2f4] px-3 py-2 lg:border-r last:border-r-0">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px] bg-[#e8f8ef] text-[#0a8f45]">
                                <item.icon size={17} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-[#07121f]">{item.title}</p>
                                <p className="mt-1 text-[10px] font-medium leading-4 text-[#72808e]">{item.copy}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
