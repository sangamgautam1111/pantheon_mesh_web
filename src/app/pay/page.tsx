"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CreditCard, LockKeyhole, MessageSquare, ShieldCheck, ShoppingBag } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

type PayContext = {
    needId: string;
    quoteId: string;
    bookingId: string;
    businessId: string;
    businessName: string;
};

export default function PayPage() {
    const [context, setContext] = useState<PayContext>({
        needId: "",
        quoteId: "",
        bookingId: "",
        businessId: "",
        businessName: "",
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setContext({
            needId: params.get("needId") || "",
            quoteId: params.get("quoteId") || "",
            bookingId: params.get("bookingId") || "",
            businessId: params.get("businessId") || "",
            businessName: params.get("businessName") || "Selected business",
        });
    }, []);

    const chatHref = `/messages?needId=${encodeURIComponent(context.needId)}&quoteId=${encodeURIComponent(context.quoteId)}&bookingId=${encodeURIComponent(context.bookingId)}&businessId=${encodeURIComponent(context.businessId)}&businessName=${encodeURIComponent(context.businessName)}&order=1`;

    return (
        <RouteGuard allowedTypes={["customer"]}>
            <main className="min-h-screen bg-[#f8f7f2] px-4 py-6 text-slate-950 md:px-8">
                <div className="mx-auto max-w-5xl">
                    <section className="rounded-[36px] border border-slate-200 bg-white p-8 shadow-xl md:p-12">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-slate-600">
                                    <ShieldCheck size={14} />
                                    Protected booking
                                </p>
                                <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight md:text-6xl">
                                    Hold payment before work starts.
                                </h1>
                                <p className="mt-5 text-base leading-8 text-slate-600">
                                    The Booking is created. Payment is not live yet, but this page is the exact place where
                                    Needero will hold money safely, track work status, and release payment after the customer
                                    marks the job solved.
                                </p>
                            </div>
                            <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-6 lg:w-80">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white">
                                    <ShoppingBag size={24} />
                                </div>
                                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Booking</p>
                                <p className="mt-2 break-all text-lg font-black">{context.bookingId || "Pending"}</p>
                                <p className="mt-4 text-sm font-semibold text-slate-500">{context.businessName}</p>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-4 md:grid-cols-3">
                        {[
                            ["Payment status", "Awaiting payment", CreditCard],
                            ["Money protection", "Hold first, release after solved", LockKeyhole],
                            ["Next step", "Continue in quote chat", MessageSquare],
                        ].map(([label, value, Icon]) => (
                            <div key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <Icon size={20} />
                                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{String(label)}</p>
                                <p className="mt-2 text-sm font-black leading-6">{String(value)}</p>
                            </div>
                        ))}
                    </section>

                    <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                        <h2 className="text-2xl font-black">Pipeline</h2>
                        <div className="mt-5 grid gap-3 md:grid-cols-5">
                            {["Quote selected", "Awaiting payment", "Booked", "In progress", "Solved"].map((step, index) => (
                                <div key={step} className={`rounded-2xl p-4 ${index <= 1 ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-500"}`}>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] opacity-60">Step {index + 1}</p>
                                    <p className="mt-2 text-sm font-black">{step}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white opacity-70"
                            >
                                <CreditCard size={17} />
                                Pay / Hold Payment soon
                            </button>
                            <Link
                                href={chatHref}
                                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-950 hover:border-slate-950"
                            >
                                Continue to Quote Chat
                                <ArrowRight size={17} />
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </RouteGuard>
    );
}
