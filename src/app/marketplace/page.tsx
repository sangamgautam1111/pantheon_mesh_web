"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bell, Briefcase, CheckCircle2, Clock, MapPin, Navigation, Send, ShieldCheck } from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { createOffer, NeedRecord, getNeeds } from "@/lib/neederoDatabase";
import { SAMPLE_NEEDS } from "@/lib/nearquote";

type QuoteDraft = {
    price: string;
    time: string;
    warranty: string;
    distance: string;
    note: string;
};

const emptyDraft: QuoteDraft = {
    price: "",
    time: "",
    warranty: "",
    distance: "",
    note: "",
};

function NeedMedia({ src }: { src?: string | null }) {
    if (!src) {
        return (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-slate-200 to-slate-100">
                <Briefcase size={32} className="text-slate-300" />
            </div>
        );
    }

    const isVideo = src.startsWith("data:video") || /\.(mp4|webm|mov)$/i.test(src);
    return isVideo ? (
        <video src={src} controls className="h-full w-full object-cover" />
    ) : (
        <img src={src} alt="" className="h-full w-full object-cover" />
    );
}

export default function Marketplace() {
    const { user, profile, accountType } = useAuth();
    const isBusiness = accountType === "business";
    const [needs, setNeeds] = useState<NeedRecord[]>([]);
    const [selectedNeedId, setSelectedNeedId] = useState<string | null>(null);
    const [draft, setDraft] = useState<QuoteDraft>(emptyDraft);
    const [locationStatus, setLocationStatus] = useState("Location not shared yet");
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNeeds = async () => {
            setLoading(true);
            try {
                const data = await getNeeds();
                setNeeds(data);
            } catch (error) {
                console.error("Marketplace fetch failed:", error);
                setMessage("Live backend is not reachable yet, so example Needs are showing for now.");
            } finally {
                setLoading(false);
            }
        };
        fetchNeeds();
    }, []);

    const visibleNeeds = useMemo<NeedRecord[]>(() => {
        if (needs.length > 0) return needs;
        if (loading) return [];
        return SAMPLE_NEEDS.map((need) => ({
            ...need,
            description: need.issue,
            customerName: "Demo customer",
        }));
    }, [needs, loading]);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus("Location is not available in this browser.");
            return;
        }

        setLocationStatus("Checking your area...");
        navigator.geolocation.getCurrentPosition(
            () => setLocationStatus("Using your approximate area for better Need recommendations."),
            () => setLocationStatus("Location was not allowed. You can still browse all Needs."),
            { enableHighAccuracy: false, timeout: 8000 },
        );
    };

    const updateDraft = (key: keyof QuoteDraft, value: string) => {
        setDraft((current) => ({ ...current, [key]: value }));
    };

    const submitQuote = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user || !selectedNeedId || !isBusiness) return;

        setSaving(true);
        setMessage("");
        try {
            await createOffer({
                needId: selectedNeedId,
                businessId: user.uid,
                businessName: profile?.companyName || profile?.displayName || "Local Business",
                price: draft.price,
                time: draft.time,
                warranty: draft.warranty,
                distance: draft.distance || "Nearby",
                note: draft.note,
            });
            setDraft(emptyDraft);
            setSelectedNeedId(null);
            setMessage("Offer sent. The customer can now compare it.");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "Could not send offer. Check database rules.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f8f7f2] p-6 text-slate-950 md:p-10">
                <div className="mx-auto max-w-7xl">
                    <section className="mb-6 rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                                    Marketplace
                                </p>
                                <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight tracking-tight md:text-6xl">
                                    {isBusiness ? "Browse customer Needs. Send useful Offers." : "Browse Needs from nearby customers."}
                                </h1>
                                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600">
                                    {isBusiness
                                        ? "This is the business side of Needero. Customers post Needs. Your business replies with price, time, warranty, and a simple note."
                                        : "Customers can view the marketplace, but only local business accounts can send Offers."}
                                </p>
                            </div>
                            <button
                                onClick={requestLocation}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white"
                            >
                                <Navigation size={17} />
                                Use my area
                            </button>
                        </div>
                    </section>

                    <section className="mb-6 grid gap-4 md:grid-cols-4">
                        {[
                            { icon: Briefcase, label: "Visible Needs", value: String(visibleNeeds.length) },
                            { icon: Send, label: "Main action", value: isBusiness ? "Send Offer" : "Compare Offers" },
                            { icon: Bell, label: isBusiness ? "Business model" : "Customer fee", value: isBusiness ? "Subscription" : "$0" },
                            { icon: MapPin, label: "Area", value: locationStatus },
                        ].map((item) => (
                            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                <item.icon size={20} />
                                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                                <p className="mt-2 text-sm font-black leading-6">{item.value}</p>
                            </div>
                        ))}
                    </section>

                    {message && (
                        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                            {message}
                        </div>
                    )}

                    <section className="mt-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {visibleNeeds.map((need) => (
                                <article
                                    key={need.id}
                                    className={`group flex flex-col rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer ${
                                        selectedNeedId === need.id ? "border-slate-950 ring-2 ring-slate-950" : "border-slate-200"
                                    }`}
                                    onClick={() => {
                                        setSelectedNeedId(need.id);
                                        setMessage("");
                                        if (window.innerWidth < 1024 && isBusiness) {
                                            document.getElementById("offer-form")?.scrollIntoView({ behavior: "smooth" });
                                        }
                                    }}
                                >
                                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                        <NeedMedia src={need.photoPreview} />
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div>
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-600">
                                                    {need.category}
                                                </span>
                                                <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-amber-700">
                                                    {need.urgency}
                                                </span>
                                            </div>
                                            <h2 className="text-lg font-bold leading-tight group-hover:underline decoration-2 underline-offset-2">{need.title}</h2>
                                            <p className="mt-2 text-sm text-slate-600 line-clamp-2 flex-1">{need.issue}</p>
                                            
                                            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin size={13} />
                                                    {need.location}
                                                </span>
                                                <span className="text-slate-900">{need.budget || "No budget"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {selectedNeedId && !isBusiness && (
                        <section className="mx-auto mt-12 max-w-2xl rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <ShieldCheck size={22} />
                                <div>
                                    <h2 className="text-2xl font-black">Read-only marketplace view</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Customer accounts can browse Needs and understand demand. Sending a quote is only available from a local business account.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {selectedNeedId && isBusiness && (
                        <section id="offer-form" className="mt-12 max-w-2xl mx-auto">
                            <div className="mb-5 flex items-start gap-3">
                                <ShieldCheck size={22} />
                                <div>
                                    <h2 className="text-2xl font-black">Offer form</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600">
                                        Keep it simple. Customers compare price, time, warranty, distance, and trust.
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={submitQuote} className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <input
                                        value={draft.price}
                                        onChange={(event) => updateDraft("price", event.target.value)}
                                        placeholder="Price, e.g. Rs. 4,500"
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
                                        required
                                    />
                                    <input
                                        value={draft.time}
                                        onChange={(event) => updateDraft("time", event.target.value)}
                                        placeholder="Time, e.g. Today"
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
                                        required
                                    />
                                    <input
                                        value={draft.warranty}
                                        onChange={(event) => updateDraft("warranty", event.target.value)}
                                        placeholder="Warranty or service terms"
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
                                    />
                                    <input
                                        value={draft.distance}
                                        onChange={(event) => updateDraft("distance", event.target.value)}
                                        placeholder="Distance, e.g. 1.2 km"
                                        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-950"
                                    />
                                </div>
                                <textarea
                                    value={draft.note}
                                    onChange={(event) => updateDraft("note", event.target.value)}
                                    placeholder="Write a helpful note for the customer."
                                    className="min-h-[130px] w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-slate-950"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white disabled:bg-slate-300"
                                >
                                    {saving ? <Clock size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                    Send Offer
                                </button>
                            </form>
                        </section>
                    )}

                </div>
            </main>
        </RouteGuard>
    );
}
