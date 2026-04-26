"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Briefcase, MessageSquare, Send, ShieldCheck, Store, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { NeedRecord, getNeeds } from "@/lib/neederoDatabase";

export default function Home() {
    const router = useRouter();
    const { accountType, user, loading } = useAuth();
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [loadError, setLoadError] = useState("");
    const primaryHref = accountType === "business" ? "/marketplace" : "/client/new";
    const primaryLabel = accountType === "business" ? "Browse Needs" : "Post a Need";
    const liveNeeds = useMemo(() => needs.slice(0, 3), [needs]);

    useEffect(() => {
        if (!loading && !user) {
            router.replace("/login");
        }
    }, [loading, router, user]);

    useEffect(() => {
        const loadNeeds = async () => {
            if (!user) return;
            try {
                setLoadError("");
                setNeeds(await getNeeds());
            } catch (error) {
                console.error("Home live Needs failed:", error);
                setLoadError("Live Need feed is not reachable yet.");
                setNeeds([]);
            }
        };

        void loadNeeds();
    }, [user]);

    if (loading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#f8f7f2] px-4 text-slate-950">
                <div className="rounded-[30px] border border-slate-200 bg-white p-8 text-center shadow-xl">
                    <p className="text-sm font-black uppercase tracking-[0.24em] text-slate-400">Needero</p>
                    <h1 className="mt-3 text-3xl font-black">Redirecting to login...</h1>
                </div>
            </main>
        );
    }

    return (
        <main className="w-full bg-[#f8f7f2] px-4 py-6 text-slate-950 md:px-8 md:py-8">
            <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
                <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-12">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">
                            <Sparkles size={14} />
                            Welcome to Needero
                        </div>
                        <h1 className="max-w-4xl text-4xl font-black leading-[0.95] tracking-tight md:text-7xl">
                            The simple way to hire local help.
                        </h1>
                        <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">
                            Needero is free for customers. No complicated search. Just post what you need help with,
                            and wait for local businesses to send you clear, fixed-price Offers.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link href={primaryHref} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5">
                                {primaryLabel}
                                <ArrowRight size={16} />
                            </Link>
                            <Link href="/client" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-900 transition-all hover:border-slate-950">
                                My Needs
                            </Link>
                        </div>

                        <div className="mt-10 grid gap-4 md:grid-cols-4">
                            {[
                                { label: "Customer fee", value: "$0" },
                                { label: "Lead quality", value: "AI Verified" },
                                { label: "Privacy", value: "Protected" },
                                { label: "Competition", value: "Real Offers" },
                            ].map((metric) => (
                                <div key={metric.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
                                    <p className="mt-3 text-sm font-black">{metric.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[34px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl md:p-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-300">
                            Reverse Marketplace
                        </p>
                        <h2 className="mt-4 text-3xl font-black">
                            Post a Need. Get Offers from nearby businesses. Choose the best one.
                        </h2>
                        <div className="mt-6 space-y-3">
                            {[
                                "Describe your problem in plain words",
                                "AI cleans it into a professional Card",
                                "Local shops see it and send Offers",
                                "Compare price & time, then choose",
                            ].map((step, index) => (
                                <div key={step} className="flex items-center gap-4 rounded-3xl bg-white/10 p-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
                                        {index + 1}
                                    </span>
                                    <p className="font-black">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                    <div className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
                        <h2 className="text-3xl font-black">For customers</h2>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                            Customers do not pay Needero. They post a Need, compare Offers, choose a business, and then
                            unlock map, call, and messages.
                        </p>
                        <div className="mt-6 grid gap-3">
                            {["Free to post", "Contact stays private first", "Compare price, time, distance, and warranty"].map((item) => (
                                <div key={item} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                                    <ShieldCheck size={18} />
                                    <p className="text-sm font-bold">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            { icon: MessageSquare, title: "Need", copy: "The customer post. Simple, clear, location-aware." },
                            { icon: Send, title: "Offer", copy: "The business reply with price, time, and note." },
                            { icon: Briefcase, title: "Booking", copy: "The customer chooses one Offer and contacts the business." },
                        ].map((item) => (
                            <div key={item.title} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                <item.icon className="mb-5" size={24} />
                                <h3 className="text-xl font-black">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
                    <div className="mb-5 flex items-center gap-3">
                        <Store size={22} />
                        <h2 className="text-2xl font-black">Live Needs</h2>
                    </div>
                    {liveNeeds.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm font-semibold text-slate-500">
                            {loadError || "No customer Needs posted yet. When customers post, real Needs will appear here."}
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-3">
                            {liveNeeds.map((need) => (
                                <div key={need.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{need.category}</p>
                                    <h3 className="mt-3 text-lg font-black">{need.title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{need.issue}</p>
                                    <p className="mt-4 text-xs font-bold text-slate-500">{need.location} - {need.offers} Offers</p>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
