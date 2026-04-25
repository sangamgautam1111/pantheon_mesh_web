"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, Building2, Clock, MapPin, MessageSquare, Plus, Search } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { PHONE_REPAIR_REQUESTS } from "@/lib/nearquote";

function statusClass(status: string) {
    if (status === "chosen") return "bg-emerald-50 text-emerald-700";
    if (status === "quoted") return "bg-slate-950 text-white";
    return "bg-amber-50 text-amber-700";
}

export default function RequestCenterPage() {
    const { accountType } = useAuth();
    const isBusiness = accountType === "business";
    const openRequests = PHONE_REPAIR_REQUESTS.filter((request) => request.status !== "chosen").length;
    const totalOffers = PHONE_REPAIR_REQUESTS.reduce((sum, request) => sum + request.offers, 0);

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f8f7f2] px-4 py-8 text-slate-950 md:px-8">
            <div className="mx-auto max-w-7xl">
                <section className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-9">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                                <MessageSquare size={14} />
                                {isBusiness ? "Local business lead inbox" : "Customer request center"}
                            </div>
                            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                                {isBusiness ? "Nearby phone repair leads." : "Your phone repair requests."}
                            </h1>
                            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                                {isBusiness
                                    ? "See customer problems that match your local service area, then reply with price, time, warranty, and a helpful note."
                                    : "Post one local problem and compare offers from nearby shops without exposing your contact details to every business."}
                            </p>
                        </div>
                        <Link
                            href={isBusiness ? "/dashboard" : "/client/new"}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5"
                        >
                            <Plus size={17} />
                            {isBusiness ? "Open dashboard" : "New customer request"}
                        </Link>
                    </div>
                </section>

                <section className="mt-6 grid gap-4 md:grid-cols-4">
                    {[
                        { label: "First niche", value: "Phone repair", icon: BadgeCheck },
                        { label: isBusiness ? "Open leads" : "Open requests", value: String(openRequests), icon: MessageSquare },
                        { label: isBusiness ? "Quotes sent" : "Offers received", value: String(totalOffers), icon: Building2 },
                        { label: "Target response", value: "30 min", icon: Clock },
                    ].map((item) => (
                        <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                            <item.icon size={19} />
                            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                            <p className="mt-2 text-2xl font-black">{item.value}</p>
                        </div>
                    ))}
                </section>

                <section className="mt-6 overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-black">
                                {isBusiness ? "Customer leads" : "My requests and offers"}
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                {isBusiness
                                    ? "Demo lead feed for local repair shops."
                                    : "Demo customer feed for tracking repair offers."}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400">
                            <Search size={16} />
                            Search requests
                        </div>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {PHONE_REPAIR_REQUESTS.map((request) => (
                            <div key={request.id} className="grid gap-4 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                                <div>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h3 className="text-lg font-black">{request.title}</h3>
                                        <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${statusClass(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">{request.issue}</p>
                                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin size={13} />
                                            {request.location}
                                        </span>
                                        <span>{request.urgency}</span>
                                        <span>{request.device}</span>
                                        <span>ID {request.id}</span>
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Offers</p>
                                        <p className="mt-2 text-xl font-black">{request.offers}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">First offer</p>
                                        <p className="mt-2 text-xl font-black">{request.firstOfferTime}</p>
                                    </div>
                                    <Link href={isBusiness ? "/dashboard" : "/client/new"} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
                                        {isBusiness ? "Prepare quote" : "View flow"}
                                        <ArrowRight size={15} />
                                    </Link>
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
