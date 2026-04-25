"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2, Loader2, MapPin, MessageSquare, Phone, Sparkles, UploadCloud } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { SAMPLE_OFFERS } from "@/lib/nearquote";

type ProblemCard = {
    category: string;
    issue: string;
    device: string;
    status: string;
    missingInfo: string[];
    quoteNeeded: string;
    customerSummary: string;
    businessPrompt: string;
    fallback?: boolean;
    model?: string;
};

const urgencyOptions = ["Today", "Within 24 hours", "This week", "Just comparing prices"];

export default function NewCustomerRequestPage() {
    const [description, setDescription] = useState("");
    const [device, setDevice] = useState("");
    const [location, setLocation] = useState("");
    const [urgency, setUrgency] = useState(urgencyOptions[0]);
    const [budget, setBudget] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [card, setCard] = useState<ProblemCard | null>(null);
    const [posted, setPosted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setPhotoPreview(typeof reader.result === "string" ? reader.result : null);
        reader.readAsDataURL(file);
    };

    const cleanRequest = async () => {
        setLoading(true);
        setError("");
        setPosted(false);
        try {
            const response = await fetch("/api/nearquote/clean-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    description,
                    device,
                    location,
                    urgency,
                    category: "Phone repair",
                }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data?.error || "Could not clean this request.");
            }
            setCard(data);
        } catch (nextError) {
            setError(nextError instanceof Error ? nextError.message : "Could not clean this request.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!card) {
            await cleanRequest();
        }
        setPosted(true);
    };

    return (
        <RouteGuard allowedTypes={["customer"]}>
            <main className="min-h-screen bg-[#f8f7f2] px-4 py-8 text-slate-950 md:px-8">
            <div className="mx-auto max-w-7xl">
                <Link
                    href="/client"
                    className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-950 hover:text-slate-950"
                >
                    <ArrowLeft size={15} />
                    Back to request center
                </Link>

                <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
                    <form onSubmit={handleSubmit} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
                            <Sparkles size={14} />
                            Needaro customer request
                        </div>

                        <h1 className="max-w-2xl text-4xl font-black tracking-tight md:text-6xl">
                            Post the problem once. Get repair offers nearby.
                        </h1>
                        <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                            Start with phone repair in one city. Needaro cleans the customer problem into a quote card so
                            repair shops can reply with price, time, warranty, and distance.
                        </p>

                        <label className="mt-8 block">
                            <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                Problem description
                            </span>
                            <textarea
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="Example: My iPhone 11 screen is cracked. Touch works. Need repair today near New Road."
                                className="mt-3 min-h-[170px] w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 p-5 text-base leading-7 outline-none transition-all placeholder:text-slate-400 focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                            />
                        </label>

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                    Phone model
                                </span>
                                <input
                                    value={device}
                                    onChange={(event) => setDevice(event.target.value)}
                                    placeholder="iPhone 11, Samsung A52..."
                                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                    Location
                                </span>
                                <input
                                    value={location}
                                    onChange={(event) => setLocation(event.target.value)}
                                    placeholder="New Road, Kalanki, Baneshwor..."
                                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                    Urgency
                                </span>
                                <select
                                    value={urgency}
                                    onChange={(event) => setUrgency(event.target.value)}
                                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                >
                                    {urgencyOptions.map((option) => (
                                        <option key={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                    Budget optional
                                </span>
                                <input
                                    value={budget}
                                    onChange={(event) => setBudget(event.target.value)}
                                    placeholder="Rs. 4,000 - 5,000"
                                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                />
                            </label>
                        </div>

                        <label className="mt-5 block cursor-pointer rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-5 transition-colors hover:border-slate-950 hover:bg-white">
                            <input type="file" accept="image/*,video/*" onChange={handlePhoto} className="hidden" />
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                                    <UploadCloud size={20} />
                                </div>
                                <div>
                                    <p className="font-black">Upload photo or short video</p>
                                    <p className="mt-1 text-sm text-slate-500">Optional, but helps repair shops quote faster.</p>
                                </div>
                            </div>
                            {photoPreview && (
                                <img src={photoPreview} alt="" className="mt-4 h-40 w-full rounded-2xl object-cover" />
                            )}
                        </label>

                        {error && (
                            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                                {error}
                            </div>
                        )}

                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <button
                                type="button"
                                onClick={cleanRequest}
                                disabled={loading || description.trim().length < 8}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-950 transition-all hover:border-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                AI clean request
                            </button>
                            <button
                                type="submit"
                                disabled={!card}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                            >
                                <MessageSquare size={18} />
                                Post request
                            </button>
                        </div>
                    </form>

                    <div className="space-y-6">
                        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                            <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                                        AI problem card
                                    </p>
                                    <h2 className="mt-2 text-2xl font-black">Clean quote request</h2>
                                </div>
                                <Camera className="text-slate-300" size={28} />
                            </div>

                            {card ? (
                                <div className="mt-6 grid gap-4">
                                    {[
                                        ["Category", card.category],
                                        ["Likely issue", card.issue],
                                        ["Device", card.device],
                                        ["Known status", card.status],
                                        ["Quote needed", card.quoteNeeded],
                                    ].map(([label, value]) => (
                                        <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
                                            <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{value}</p>
                                        </div>
                                    ))}
                                    <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Missing info</p>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {(card.missingInfo?.length ? card.missingInfo : ["No major missing info"]).map((item) => (
                                                <span key={item} className="rounded-full bg-slate-950 px-3 py-1 text-xs font-bold text-white">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                    <Sparkles className="mx-auto mb-4 text-slate-300" size={38} />
                                    <p className="text-sm font-semibold text-slate-500">
                                        Enter the problem and click AI clean request.
                                    </p>
                                </div>
                            )}
                        </section>

                        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                            <div className="mb-5 flex items-center justify-between">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                                        Example offers
                                    </p>
                                    <h2 className="mt-2 text-2xl font-black">What customers compare</h2>
                                </div>
                                {posted && (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
                                        <CheckCircle2 size={14} />
                                        Request posted
                                    </span>
                                )}
                            </div>
                            <div className="space-y-3">
                                {SAMPLE_OFFERS.map((offer) => (
                                    <div key={offer.shop} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                            <div>
                                                <p className="font-black">{offer.shop}</p>
                                                <p className="mt-1 text-sm leading-6 text-slate-500">{offer.note}</p>
                                            </div>
                                            <p className="text-xl font-black">{offer.price}</p>
                                        </div>
                                        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
                                            <span className="rounded-2xl bg-white px-3 py-2 font-semibold">{offer.time}</span>
                                            <span className="rounded-2xl bg-white px-3 py-2 font-semibold">{offer.warranty}</span>
                                            <span className="rounded-2xl bg-white px-3 py-2 font-semibold">{offer.distance}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 grid gap-3 sm:grid-cols-3">
                                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white">
                                    <MapPin size={16} />
                                    Open map
                                </button>
                                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">
                                    <Phone size={16} />
                                    Call shop
                                </button>
                                <button className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">
                                    <MessageSquare size={16} />
                                    Message
                                </button>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
            </main>
        </RouteGuard>
    );
}
