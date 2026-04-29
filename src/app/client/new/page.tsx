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
import { Country, State, City } from "country-state-city";
import { useEffect } from "react";

type UploadedMedia = {
    dataUrl: string;
    type: string;
    name: string;
};

type DetectedCoords = {
    latitude: number;
    longitude: number;
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

    // Location structured states
    const [countryCode, setCountryCode] = useState(profile?.countryCode || "");
    const [stateCode, setStateCode] = useState(profile?.stateCode || "");
    const [city, setCity] = useState(profile?.city || "");
    const [area, setArea] = useState(profile?.area || "");
    const [detectedCoords, setDetectedCoords] = useState<DetectedCoords | null>(null);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const countries = Country.getAllCountries();

    // Auto-detect location if not in profile
    useEffect(() => {
        if (!profile?.countryCode) {
            fetch("https://ipapi.co/json/")
                .then(res => res.json())
                .then(data => {
                    if (data.country_code) {
                        setCountryCode(data.country_code);
                        if (data.region_code) setStateCode(data.region_code);
                        if (data.city) setCity(data.city);
                        if (data.city && !area) setArea(data.city);
                        const latitude = Number(data.latitude);
                        const longitude = Number(data.longitude);
                        if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
                            setDetectedCoords({ latitude, longitude });
                        }
                    }
                })
                .catch(() => console.log("Location detection skipped"));
        }
    }, [profile?.countryCode]);

    // Load states when country changes
    useEffect(() => {
        if (countryCode) {
            const countryStates = State.getStatesOfCountry(countryCode);
            setStates(countryStates);
            // If the current stateCode doesn't belong to this country, reset it
            if (stateCode && !countryStates.find(s => s.isoCode === stateCode)) {
                setStateCode("");
            }
        } else {
            setStates([]);
            setStateCode("");
            setCity("");
        }
    }, [countryCode]);

    // Load cities when state changes
    useEffect(() => {
        if (countryCode && stateCode) {
            const stateCities = City.getCitiesOfState(countryCode, stateCode);
            if (stateCities.length > 0) {
                setCities(stateCities);
            } else {
                setCities(City.getCitiesOfCountry(countryCode) || []);
            }
            if (!stateCities.find(c => c.name === city)) {
                setCity("");
            }
        } else if (countryCode) {
            setCities(City.getCitiesOfCountry(countryCode) || []);
        } else {
            setCities([]);
            setCity("");
        }
    }, [countryCode, stateCode]);

    const fullLocationString = [
        area,
        city,
        states.find(s => s.isoCode === stateCode)?.name,
        countries.find(c => c.isoCode === countryCode)?.name
    ].filter(Boolean).join(", ") || "Location not set";

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
                location: fullLocationString,
                countryCode,
                stateCode,
                city,
                area,
                latitude: detectedCoords?.latitude ?? null,
                longitude: detectedCoords?.longitude ?? null,
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
                                            Country
                                        </span>
                                        <select
                                            value={countryCode}
                                            onChange={(e) => setCountryCode(e.target.value)}
                                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                        >
                                            <option value="">Select Country</option>
                                            {countries.map((c) => (
                                                <option key={c.isoCode} value={c.isoCode}>
                                                    {c.flag} {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                            State / Province
                                        </span>
                                        <select
                                            value={stateCode}
                                            onChange={(e) => setStateCode(e.target.value)}
                                            disabled={!countryCode}
                                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5 disabled:opacity-50"
                                        >
                                            <option value="">Select State</option>
                                            {states.map((s) => (
                                                <option key={s.isoCode} value={s.isoCode}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </div>

                                <div className="mt-5 grid gap-4 md:grid-cols-2">
                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                            City
                                        </span>
                                        <select
                                            value={city}
                                            onChange={(e) => setCity(e.target.value)}
                                            disabled={!stateCode}
                                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5 disabled:opacity-50"
                                        >
                                            <option value="">Select City</option>
                                            {cities.map((c) => (
                                                <option key={c.name} value={c.name}>
                                                    {c.name}
                                                </option>
                                            ))}
                                        </select>
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                                            Specific Area (Optional)
                                        </span>
                                        <input
                                            value={area}
                                            onChange={(event) => setArea(event.target.value)}
                                            placeholder="e.g. New Road, Baneshwor..."
                                            className="mt-3 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5"
                                        />
                                    </label>
                                </div>

                                <div className="mt-5">
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
                                        <div className="relative mt-3">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                                                $
                                            </span>
                                            <input
                                                value={customBudget}
                                                onChange={(event) => setCustomBudget(event.target.value)}
                                                placeholder="100"
                                                disabled={budget !== "Custom"}
                                                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-8 pr-4 text-sm outline-none transition-all focus:border-slate-950 focus:bg-white focus:ring-4 focus:ring-slate-950/5 disabled:opacity-40"
                                            />
                                        </div>
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
                                                ["Area", fullLocationString],
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
