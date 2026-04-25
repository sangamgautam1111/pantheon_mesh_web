"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, CheckCircle2, Clock, MapPin, MessageSquare, Plus, Search } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { NeedRecord, getNeeds } from "@/lib/neederoDatabase";
import { SAMPLE_NEEDS } from "@/lib/nearquote";

function statusClass(status: string) {
    if (status === "chosen") return "bg-emerald-50 text-emerald-700";
    if (status === "quoted") return "bg-slate-950 text-white";
    return "bg-amber-50 text-amber-700";
}

export default function RequestCenterPage() {
    const { accountType, user } = useAuth();
    const isBusiness = accountType === "business";
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [dbError, setDbError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNeeds = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const data = await getNeeds(isBusiness ? undefined : user.uid);
                setNeeds(data);
            } catch (error) {
                setDbError(error instanceof Error ? error.message : "Could not read Needs.");
            } finally {
                setLoading(false);
            }
        };

        fetchNeeds();
    }, [user, isBusiness]);

    const visibleNeeds = useMemo(() => {
        const liveNeeds = needs.length > 0 ? needs : SAMPLE_NEEDS.map((need) => ({
            ...need,
            description: need.issue,
            customerName: "Demo customer",
        }));

        if (isBusiness) {
            return liveNeeds;
        }

        return liveNeeds.filter((need) => !need.customerId || need.customerId === user?.uid);
    }, [isBusiness, needs, user?.uid]);

    const openNeeds = visibleNeeds.filter((need) => need.status !== "chosen").length;
    const totalOffers = visibleNeeds.reduce((sum, need) => sum + (need.offers || 0), 0);

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f8f7f2] px-4 py-6 text-slate-950 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <section className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-9">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                                    <MessageSquare size={14} />
                                    {isBusiness ? "Lead inbox" : "My Needs"}
                                </div>
                                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                                    {isBusiness ? "Nearby Needs from customers." : "Post Needs and compare Offers."}
                                </h1>
                                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                                    {isBusiness
                                        ? "Browse posted Needs, then send clear Offers with price, timing, warranty, and a useful note."
                                        : "Needero is free for customers. Post a Need, wait for Offers, choose the best business, then unlock contact."}
                                </p>
                            </div>
                            <Link
                                href={isBusiness ? "/marketplace" : "/client/new"}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/15 transition-all hover:-translate-y-0.5"
                            >
                                <Plus size={17} />
                                {isBusiness ? "Browse Marketplace" : "Post a Need"}
                            </Link>
                        </div>
                    </section>

                    {dbError && (
                        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                            {dbError}
                        </div>
                    )}

                    <section className="mt-6 grid gap-4 md:grid-cols-4">
                        {[
                            { label: isBusiness ? "Visible Needs" : "My Needs", value: String(visibleNeeds.length), icon: Briefcase },
                            { label: "Open", value: String(openNeeds), icon: MessageSquare },
                            { label: isBusiness ? "Offer chances" : "Offers received", value: String(totalOffers), icon: CheckCircle2 },
                            { label: "Goal", value: "Fast quotes", icon: Clock },
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
                                    {isBusiness ? "Customer Needs" : "Needs timeline"}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {isBusiness ? "Each Need can receive an Offer from your business." : "Every posted Need and its offer count appears here."}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400">
                                <Search size={16} />
                                Search Needs
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {visibleNeeds.length === 0 ? (
                                <div className="p-10 text-center">
                                    <Briefcase className="mx-auto mb-4 text-slate-300" size={36} />
                                    <p className="text-sm font-semibold text-slate-500">
                                        {isBusiness ? "No Needs yet." : "You have not posted a Need yet."}
                                    </p>
                                </div>
                            ) : (
                                visibleNeeds.map((need) => (
                                    <div key={need.id} className="grid gap-4 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                                        <div>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <h3 className="text-lg font-black">{need.title}</h3>
                                                <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wide ${statusClass(need.status)}`}>
                                                    {need.status}
                                                </span>
                                            </div>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">{need.issue}</p>
                                            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
                                                <span>{need.category}</span>
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={13} />
                                                    {need.location}
                                                </span>
                                                <span>{need.urgency}</span>
                                                <span>{need.budget || "No budget yet"}</span>
                                                <span>ID {need.id}</span>
                                            </div>
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[360px]">
                                            <div className="rounded-2xl bg-slate-50 p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Offers</p>
                                                <p className="mt-2 text-xl font-black">{need.offers || 0}</p>
                                            </div>
                                            <div className="rounded-2xl bg-slate-50 p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">First offer</p>
                                                <p className="mt-2 text-xl font-black">{need.firstOfferTime || "Waiting"}</p>
                                            </div>
                                            <Link
                                                href={isBusiness ? "/marketplace" : "/messages"}
                                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white"
                                            >
                                                {isBusiness ? "Send Offer" : "Messages"}
                                                <ArrowRight size={15} />
                                            </Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </RouteGuard>
    );
}

