"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Camera,
    CheckCircle2,
    Loader2,
    MapPin,
    MessageSquare,
    Sparkles,
    UploadCloud,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { cleanNeedWithAI, createNeed } from "@/lib/neederoDatabase";
import {
    BUDGET_OPTIONS,
    NEED_CATEGORIES,
    NeedCard,
    URGENCY_OPTIONS,
    createFallbackNeedCard,
} from "@/lib/nearquote";

type UploadedMedia = {
    dataUrl: string;
    type: string;
    name: string;
};

export default function NewCustomerRequestPage() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(NEED_CATEGORIES[0]);
    const [location, setLocation] = useState("");
    const [urgency, setUrgency] = useState(URGENCY_OPTIONS[1]);
    const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
    const [customBudget, setCustomBudget] = useState("");
    const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
    const [card, setCard] = useState<NeedCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");

    const resolvedBudget = budget === "Custom" ? customBudget.trim() || "Custom" : budget;

    const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setUploadedMedia({ dataUrl: reader.result, type: file.type || "file", name: file.name });
            }
        };
        reader.readAsDataURL(file);
    };

    const cleanRequest = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await cleanNeedWithAI(description);
            setCard({
                ...data,
                category: data.category && data.category !== "Other" ? data.category : category,
            });
        } catch (nextError) {
            setCard(createFallbackNeedCard(description, category));
            setError(nextError instanceof Error ? nextError.message : "Could not create a Need Card.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user) return;

        setPosting(true);
        setError("");
        try {
            const finalCard = card || createFallbackNeedCard(description, category);
            const title = finalCard.title || description.slice(0, 72) || "New Need";
            const resolvedCategory = finalCard.category && finalCard.category !== "Other" ? finalCard.category : category;
            await createNeed({
                customerId: user.uid,
                customerName: profile?.displayName || profile?.email || "Customer",
                title,
                description,
                category: resolvedCategory,
                location: location || "Area not set",
                urgency,
                budget: resolvedBudget,
                photoPreview: uploadedMedia?.dataUrl || null,
                cleanCard: finalCard,
            });
            router.push("/client");
        } catch (nextError: any) {
            setError(
                nextError?.message || "Could not post this Need. Please try again."
            );
        } finally {
            setPosting(false);
        }
    };

    return (
        <RouteGuard allowedTypes={["customer"]}>
            <main className="min-h-screen bg-[#f8f7f2] px-4 py-6 text-slate-950 md:px-8">
                <div className="mx-auto max-w-5xl">
                    <Link
                        href="/client"
                        className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-950 hover:text-slate-950"
                    >
                        <ArrowLeft size={15} />
                        Back to my Needs
                    </Link>

                    <section className="overflow-hidden rounded-[34px] border border-slate-200 bg-white shadow-xl">
                        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
                            <form onSubmit={handleSubmit} className="border-b border-slate-100 p-6 md:p-8 lg:border-b-0 lg:border-r">
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-black uppercase tracking-[0.22em] text-slate-600">
                                    <MessageSquare size={14} />
                                    Post a Need
                                </div>

                                <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                                    Tell nearby businesses what you need.
                                </h1>
                                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600">
                                    Post once. Needero cleans it into a simple card. Local businesses send offers.
                                    Customers never pay Needero.
                                </p>

                                <label className="mt-7 block">
                                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                        What do you need help with?
                                    </span>
                                    <select
                                        value={category}
                                        onChange={(event) => setCategory(event.target.value)}
                                        className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                    >
                                        {NEED_CATEGORIES.map((option) => (
                                            <option key={option}>{option}</option>
                                        ))}
                                    </select>
                                </label>

                                <label className="mt-5 block">
                                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                        Describe the problem
                                    </span>
                                    <textarea
                                        value={description}
                                        onChange={(event) => setDescription(event.target.value)}
                                        placeholder="Example: My room AC is leaking water. Need someone near Baneshwor today."
                                        className="mt-3 min-h-[160px] w-full resize-y rounded-3xl border border-slate-200 bg-slate-50 p-5 text-base leading-7 outline-none transition-all placeholder:text-slate-400 focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                        required
                                    />
                                </label>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                            Area
                                        </span>
                                        <input
                                            value={location}
                                            onChange={(event) => setLocation(event.target.value)}
                                            placeholder="New Road, Baneshwor, Kalanki..."
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
                                            {URGENCY_OPTIONS.map((option) => (
                                                <option key={option}>{option}</option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                            Budget optional
                                        </span>
                                        <select
                                            value={budget}
                                            onChange={(event) => setBudget(event.target.value)}
                                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                        >
                                            {BUDGET_OPTIONS.map((option) => (
                                                <option key={option}>{option}</option>
                                            ))}
                                        </select>
                                    </label>
                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                            Custom budget
                                        </span>
                                        <input
                                            value={customBudget}
                                            onChange={(event) => setCustomBudget(event.target.value)}
                                            placeholder="Rs. 3,000"
                                            disabled={budget !== "Custom"}
                                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5 disabled:opacity-40"
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
                                            <p className="font-black">Upload photo or video</p>
                                            <p className="mt-1 text-sm text-slate-500">Optional. Helps businesses quote faster.</p>
                                        </div>
                                    </div>
                                    {uploadedMedia && (
                                        uploadedMedia.type.startsWith("video/") ? (
                                            <video src={uploadedMedia.dataUrl} controls className="mt-4 h-44 w-full rounded-2xl object-cover" />
                                        ) : (
                                            <img src={uploadedMedia.dataUrl} alt={uploadedMedia.name} className="mt-4 h-44 w-full rounded-2xl object-cover" />
                                        )
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
                                        Make Need Card
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={posting || description.trim().length < 8}
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-lg shadow-slate-900/10 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                                    >
                                        {posting ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                        Post Need
                                    </button>
                                </div>
                            </form>

                            <aside className="bg-slate-50 p-6 md:p-8">
                                <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="mb-5 flex items-center justify-between">
                                        <div>
                                            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">
                                                Need preview
                                            </p>
                                            <h2 className="mt-2 text-2xl font-black">What businesses see</h2>
                                        </div>
                                        <Camera className="text-slate-300" size={28} />
                                    </div>

                                    {card ? (
                                        <div className="space-y-3">
                                            {[
                                                ["Need", card.title],
                                                ["Category", card.category],
                                                ["Problem", card.problem || card.summaryForBusinesses],
                                                ["Known details", card.knownDetails || card.summaryForBusinesses],
                                                ["Area", location || "Not set"],
                                                ["Urgency", urgency],
                                                ["Budget", resolvedBudget],
                                            ].map(([label, value]) => (
                                                <div key={label} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                        {label}
                                                    </p>
                                                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{value}</p>
                                                </div>
                                            ))}

                                            <div className="rounded-2xl border border-slate-100 bg-white p-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                                                    Missing questions
                                                </p>
                                                <div className="mt-3 space-y-2">
                                                    {(card.questions?.length ? card.questions : ["No major missing info."]).map((question) => (
                                                        <p key={question} className="rounded-2xl bg-slate-950 px-3 py-2 text-xs font-bold text-white">
                                                            {question}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
                                            <Sparkles className="mx-auto mb-4 text-slate-300" size={38} />
                                            <p className="text-sm font-semibold text-slate-500">
                                                Write your Need and click Make Need Card.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                                    <div className="flex items-start gap-3">
                                        <MapPin size={20} />
                                        <div>
                                            <h3 className="font-black">Privacy first</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                Businesses see your approximate area first. Call, map, and direct chat should unlock
                                                after you choose an offer.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </section>
                </div>
            </main>
        </RouteGuard>
    );
}
