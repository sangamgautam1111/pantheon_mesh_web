"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Building2, CheckCircle2, Clock, MessageSquare, ShieldCheck } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { NEEDARO_PLANS, PHONE_REPAIR_REQUESTS } from "@/lib/nearquote";

export default function Dashboard() {
    const totalRequests = PHONE_REPAIR_REQUESTS.length;
    const requestsWithOffer = PHONE_REPAIR_REQUESTS.filter((request) => request.offers > 0).length;
    const chosenRequests = PHONE_REPAIR_REQUESTS.filter((request) => request.status === "chosen").length;
    const usefulQuoteRate = Math.round((requestsWithOffer / totalRequests) * 100);
    const starterPlan = NEEDARO_PLANS.find((plan) => plan.id === "starter") ?? NEEDARO_PLANS[1];

    return (
        <RouteGuard allowedTypes={["business"]}>
            <main className="w-full bg-[#f8f7f2] p-6 text-slate-950 md:p-8">
                <div className="mx-auto max-w-7xl">
                    <section className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                                    Needaro local business dashboard
                                </p>
                                <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                                    Turn nearby repair problems into quoted leads.
                                </h1>
                                <p className="mt-5 text-base leading-8 text-slate-600">
                                    The business account focuses on warm local requests, fast quote replies, and simple
                                    proof that repair shops will pay after receiving real leads.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Link href="/client" className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white">
                                    <MessageSquare size={16} />
                                    Open lead inbox
                                </Link>
                                <Link href="/pricing" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black">
                                    Business plans
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-4 md:grid-cols-4">
                        {[
                            { label: "Requests posted", value: String(totalRequests), icon: MessageSquare },
                            { label: "Useful quote rate", value: `${usefulQuoteRate}%`, icon: CheckCircle2 },
                            { label: "Chosen matches", value: String(chosenRequests), icon: ShieldCheck },
                            { label: "First paid plan", value: starterPlan.price, icon: Building2 },
                        ].map((item) => (
                            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <item.icon size={20} />
                                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                                <p className="mt-2 text-3xl font-black">{item.value}</p>
                            </div>
                        ))}
                    </section>

                    <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="mb-5 flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-black">Marketplace health</h2>
                                    <p className="mt-1 text-sm text-slate-500">The main metric is quote speed and usefulness.</p>
                                </div>
                                <BarChart3 size={24} />
                            </div>
                            <div className="space-y-4">
                                {[
                                    ["Requests with at least 1 offer", `${requestsWithOffer}/${totalRequests}`],
                                    ["Average first offer goal", "Under 30 minutes"],
                                    ["Manual shop onboarding target", "10 phone repair shops"],
                                    ["First revenue proof", "1 shop pays after leads"],
                                ].map(([label, value]) => (
                                    <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4">
                                        <span className="text-sm font-semibold text-slate-600">{label}</span>
                                        <span className="text-sm font-black">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
                            <h2 className="text-2xl font-black">Manual validation plan</h2>
                            <div className="mt-5 space-y-3">
                                {[
                                    "Visit or message 20 phone repair shops.",
                                    "Manually approve 10 shops.",
                                    "Post in local groups: broken phone? get nearby prices.",
                                    "Help shops reply fast until the flow is proven.",
                                    "Only charge after shops receive real leads.",
                                ].map((step, index) => (
                                    <div key={step} className="flex gap-3 rounded-2xl bg-white/10 p-4">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-slate-950">
                                            {index + 1}
                                        </span>
                                        <p className="text-sm font-semibold leading-6 text-slate-100">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center gap-3">
                            <Clock size={20} />
                            <h2 className="text-2xl font-black">Recent phone repair requests</h2>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-3">
                            {PHONE_REPAIR_REQUESTS.map((request) => (
                                <div key={request.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                                    <p className="text-sm font-black">{request.title}</p>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{request.issue}</p>
                                    <div className="mt-4 flex items-center justify-between text-xs font-bold text-slate-500">
                                        <span>{request.location}</span>
                                        <span>{request.offers} offers</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </RouteGuard>
    );
}
