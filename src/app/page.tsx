"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, MapPin, MessageSquare, Phone, Sparkles, Timer } from "lucide-react";
import { NEEDARO_METRICS, SAMPLE_OFFERS } from "@/lib/nearquote";

const STEPS = [
    "Customer posts one local problem.",
    "Needaro AI cleans it into a quote card.",
    "Nearby businesses compete with offers.",
    "Customer chooses the best price, speed, warranty, and distance.",
];

const PROBLEMS = [
    "Customers waste time calling many shops.",
    "Google Maps shows lists, not exact offers.",
    "Repair shops need real high-intent leads.",
];

export default function Home() {
    return (
        <main className="w-full bg-[#f8f7f2] px-4 py-6 text-slate-950 md:px-8 md:py-8">
            <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-8">
                <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <div className="relative overflow-hidden rounded-[38px] border border-slate-200 bg-white p-7 shadow-xl md:p-12">
                        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-emerald-100 blur-3xl" />
                        <div className="relative z-10 max-w-4xl">
                            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-slate-600">
                                <Sparkles size={14} />
                                Needaro.com
                            </div>
                            <h1 className="text-4xl font-black leading-[0.95] tracking-tight md:text-7xl">
                                Post your problem.
                                <br />
                                Get prices from nearby businesses.
                            </h1>
                            <p className="mt-7 max-w-3xl text-lg leading-8 text-slate-600">
                                Needaro is a reverse local service marketplace. Customers describe what they need once,
                                then nearby businesses reply with price, time, warranty, distance, and availability.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link href="/client/new" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5">
                                    Post a phone repair request
                                    <ArrowRight size={16} />
                                </Link>
                                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-900 transition-all hover:border-slate-950">
                                    Business plans
                                </Link>
                            </div>
                        </div>

                        <div className="relative z-10 mt-10 grid gap-4 md:grid-cols-4">
                            {NEEDARO_METRICS.map((metric) => (
                                <div key={metric.label} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
                                    <p className="mt-3 text-lg font-black">{metric.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[38px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl md:p-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-emerald-200">
                            Phone repair first
                        </p>
                        <h2 className="mt-4 text-3xl font-black">Example customer request</h2>
                        <div className="mt-6 rounded-3xl bg-white p-5 text-slate-950">
                            <p className="text-lg font-black">iPhone screen cracked near New Road</p>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Touch works. Need repair today. Please send price, repair time, warranty, and shop distance.
                            </p>
                            <div className="mt-4 grid gap-2 sm:grid-cols-3">
                                <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold">Today</span>
                                <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold">Photo attached</span>
                                <span className="rounded-2xl bg-slate-100 px-3 py-2 text-xs font-bold">Phone repair</span>
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            {SAMPLE_OFFERS.slice(0, 2).map((offer) => (
                                <div key={offer.shop} className="rounded-3xl border border-white/10 bg-white/10 p-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-black">{offer.shop}</p>
                                            <p className="mt-1 text-sm text-slate-300">{offer.time} - {offer.warranty} - {offer.distance}</p>
                                        </div>
                                        <p className="text-lg font-black">{offer.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-sm md:p-8">
                        <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">Why this wins</p>
                        <h2 className="mt-3 text-3xl font-black">Directories are not outcomes.</h2>
                        <div className="mt-6 space-y-3">
                            {PROBLEMS.map((problem) => (
                                <div key={problem} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                                    <BadgeCheck size={18} />
                                    <p className="text-sm font-semibold text-slate-700">{problem}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        {STEPS.map((step, index) => (
                            <div key={step} className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                    {index === 0 && <MessageSquare size={20} />}
                                    {index === 1 && <Sparkles size={20} />}
                                    {index === 2 && <Building2 size={20} />}
                                    {index === 3 && <MapPin size={20} />}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Step {index + 1}</p>
                                <p className="mt-3 text-sm font-bold leading-6 text-slate-800">{step}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="grid gap-6 md:grid-cols-3">
                    {[
                        { icon: Phone, title: "Customers stay protected", copy: "Contact details unlock only after the customer chooses an offer." },
                        { icon: Building2, title: "Businesses get warm leads", copy: "Shops reply to people who already need a local service now." },
                        { icon: Timer, title: "Key metric", copy: "Win by getting useful quotes within 30 minutes." },
                    ].map((item) => (
                        <div key={item.title} className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">
                            <item.icon className="mb-5" size={24} />
                            <h3 className="text-xl font-black">{item.title}</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{item.copy}</p>
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
}
