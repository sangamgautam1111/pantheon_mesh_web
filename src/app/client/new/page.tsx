"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Camera,
    Check,
    CheckCircle2,
    ChevronLeft,
    Loader2,
    MapPin,
    MessageSquare,
    Sparkles,
    UploadCloud,
} from "lucide-react";
import { City, Country, State } from "country-state-city";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { cleanNeedWithAI, createNeed } from "@/lib/neederoDatabase";
import { BUDGET_OPTIONS, NEED_CATEGORIES, NeedCard, URGENCY_OPTIONS, createFallbackNeedCard } from "@/lib/nearquote";

const DeliveryMap = dynamic(() => import("@/components/profile/DeliveryMap"), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="rounded-3xl bg-white p-8 text-sm font-black">Loading map...</div>
        </div>
    ),
});

type UploadedMedia = {
    dataUrl: string;
    type: string;
    name: string;
};

type PinPoint = {
    address: string;
    coords: { lat: number; lng: number };
};

const steps = [
    { label: "Describe", helper: "Tell us the problem" },
    { label: "Details", helper: "Category and media" },
    { label: "Location", helper: "Area and map pin" },
    { label: "Preferences", helper: "Budget and timing" },
    { label: "Preview", helper: "Review and post" },
];

const serviceModes = ["Ask businesses to suggest", "Visit shop", "Home visit", "Pickup & return", "Delivery"];
const examplePrompts = [
    "My iPhone screen broke and I need it fixed today near New Road.",
    "I need a pizza delivered near my area as soon as possible.",
    "My room AC is leaking water and I need a repair person today.",
];

const formatBudgetValue = (budget: string, customBudget: string) => {
    if (budget !== "Custom") return budget;
    const amount = customBudget.trim().replace(/^\$/, "");
    return amount ? `$${amount}` : "Custom";
};

export default function NewCustomerRequestPage() {
    const router = useRouter();
    const { user, profile } = useAuth();
    const [step, setStep] = useState(0);
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(NEED_CATEGORIES[0]);
    const [urgency, setUrgency] = useState(URGENCY_OPTIONS[1]);
    const [serviceMode, setServiceMode] = useState(serviceModes[0]);
    const [preferredTime, setPreferredTime] = useState("");
    const [warrantyImportant, setWarrantyImportant] = useState("Not sure");
    const [budget, setBudget] = useState(BUDGET_OPTIONS[0]);
    const [customBudget, setCustomBudget] = useState("");
    const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
    const [card, setCard] = useState<NeedCard | null>(null);
    const [isCleaning, setIsCleaning] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");
    const [countryCode, setCountryCode] = useState(profile?.countryCode || "");
    const [stateCode, setStateCode] = useState(profile?.stateCode || "");
    const [city, setCity] = useState(profile?.city || "");
    const [area, setArea] = useState(profile?.area || "");
    const [pinPoint, setPinPoint] = useState<PinPoint | null>(
        profile?.deliveryCoords
            ? {
                  address: profile.deliveryAddress || profile.currentAddress || "Pinned location",
                  coords: { lat: profile.deliveryCoords.lat, lng: profile.deliveryCoords.lng },
              }
            : null,
    );
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const countries = Country.getAllCountries();
    const profileAvatar = profile?.photoURL || user?.photoURL || null;
    const selectedCountry = countries.find((country) => country.isoCode === countryCode);
    const selectedState = states.find((state) => state.isoCode === stateCode);
    const fullLocationString = [area, city, selectedState?.name, selectedCountry?.name].filter(Boolean).join(", ") || "Location not set";
    const resolvedBudget = formatBudgetValue(budget, customBudget);

    useEffect(() => {
        if (!profile?.countryCode) {
            fetch("https://ipapi.co/json/")
                .then((res) => res.json())
                .then((data) => {
                    if (data.country_code) setCountryCode(data.country_code);
                    if (data.region_code) setStateCode(data.region_code);
                    if (data.city) {
                        setCity(data.city);
                        setArea((current) => current || data.city);
                    }
                    const lat = Number(data.latitude);
                    const lng = Number(data.longitude);
                    if (Number.isFinite(lat) && Number.isFinite(lng)) {
                        setPinPoint((current) => current || { address: data.city || "Detected area", coords: { lat, lng } });
                    }
                })
                .catch(() => undefined);
        }
    }, [profile?.countryCode]);

    useEffect(() => {
        if (!countryCode) {
            setStates([]);
            setStateCode("");
            setCities([]);
            return;
        }
        const nextStates = State.getStatesOfCountry(countryCode);
        setStates(nextStates);
        if (stateCode && !nextStates.some((state) => state.isoCode === stateCode)) setStateCode("");
    }, [countryCode, stateCode]);

    useEffect(() => {
        if (!countryCode) {
            setCities([]);
            return;
        }
        const nextCities = stateCode ? City.getCitiesOfState(countryCode, stateCode) : City.getCitiesOfCountry(countryCode) || [];
        setCities(nextCities.length ? nextCities : City.getCitiesOfCountry(countryCode) || []);
    }, [countryCode, stateCode]);

    const previewCard = useMemo(() => {
        const base = card || createFallbackNeedCard(description, category);
        return {
            ...base,
            category: base.category && base.category !== "Other" ? base.category : category,
            customerAvatar: profileAvatar,
            serviceMode,
            preferredTime,
            warrantyImportant,
            knownDetails: [
                base.knownDetails || description,
                `Service mode: ${serviceMode}`,
                preferredTime ? `Preferred time: ${preferredTime}` : "",
                `Warranty important: ${warrantyImportant}`,
            ]
                .filter(Boolean)
                .join("\n"),
        } satisfies NeedCard;
    }, [card, category, description, preferredTime, profileAvatar, serviceMode, warrantyImportant]);

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

    const buildPreviewCard = async () => {
        if (description.trim().length < 8) return;
        setIsCleaning(true);
        setError("");
        try {
            const data = await cleanNeedWithAI(description);
            setCard({
                ...data,
                category: data.category && data.category !== "Other" ? data.category : category,
            });
        } catch (nextError) {
            setCard(createFallbackNeedCard(description, category));
            setError(nextError instanceof Error ? nextError.message : "AI preview is delayed, so Needero used a safe preview.");
        } finally {
            setIsCleaning(false);
        }
    };

    const continueStep = async () => {
        setError("");
        if (step === 0 && description.trim().length < 8) {
            setError("Describe your Need in a little more detail first.");
            return;
        }
        if (step === 2 && (!countryCode || !city)) {
            setError("Add at least country and city so nearby businesses can find the Need.");
            return;
        }
        if (step === 3) await buildPreviewCard();
        setStep((current) => Math.min(current + 1, steps.length - 1));
    };

    const backStep = () => {
        setError("");
        setStep((current) => Math.max(current - 1, 0));
    };

    const handleSubmit = async () => {
        if (!user) return;
        setPosting(true);
        setError("");
        try {
            const title = previewCard.title || description.slice(0, 72) || "New Need";
            await createNeed({
                customerId: user.uid,
                customerName: profile?.displayName || profile?.email || "Customer",
                customerAvatar: profileAvatar,
                title,
                description: [
                    description,
                    `Service mode: ${serviceMode}`,
                    preferredTime ? `Preferred time: ${preferredTime}` : "",
                    `Warranty important: ${warrantyImportant}`,
                ]
                    .filter(Boolean)
                    .join("\n"),
                category: previewCard.category,
                location: fullLocationString,
                countryCode,
                stateCode,
                city,
                area,
                latitude: pinPoint?.coords.lat ?? null,
                longitude: pinPoint?.coords.lng ?? null,
                urgency,
                budget: resolvedBudget,
                photoPreview: uploadedMedia?.dataUrl || null,
                cleanCard: previewCard,
            });
            router.push("/client");
        } catch (nextError: any) {
            setError(nextError?.message || "Could not post this Need. Please try again.");
        } finally {
            setPosting(false);
        }
    };

    const renderStep = () => {
        if (step === 0) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#95979d]">Step 1 of 5</p>
                    <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#222325] md:text-6xl">Tell us what you need.</h1>
                    <p className="mt-4 max-w-2xl text-base leading-8 text-[#62646a]">
                        Describe the problem in your own words. Needero will turn it into a clean Need Card for local businesses.
                    </p>
                    <textarea
                        value={description}
                        onChange={(event) => {
                            setDescription(event.target.value);
                            setCard(null);
                        }}
                        placeholder="Example: My iPhone screen broke and I need someone to fix it today near New Road."
                        className="mt-8 min-h-[230px] w-full resize-y rounded-[28px] border border-[#dadbdd] bg-white p-6 text-lg leading-8 outline-none transition focus:border-[#222325] focus:ring-4 focus:ring-black/5"
                    />
                    <div className="mt-5 flex flex-wrap gap-2">
                        {examplePrompts.map((prompt) => (
                            <button
                                key={prompt}
                                type="button"
                                onClick={() => setDescription(prompt)}
                                className="rounded-full border border-[#dadbdd] bg-white px-4 py-2 text-xs font-bold text-[#62646a] transition hover:border-[#222325] hover:text-[#222325]"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </section>
            );
        }

        if (step === 1) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#95979d]">Step 2 of 5</p>
                    <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#222325] md:text-5xl">Add a few details.</h1>
                    <p className="mt-3 text-base leading-7 text-[#62646a]">Help businesses understand the category and the visual proof.</p>
                    <div className="mt-8 rounded-[28px] border border-[#e4e5e7] bg-white p-5">
                        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#95979d]">Suggested category</p>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {NEED_CATEGORIES.map((option) => (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setCategory(option)}
                                    className={`rounded-2xl border px-4 py-3 text-left text-sm font-black transition ${
                                        category === option ? "border-[#222325] bg-[#222325] text-white" : "border-[#dadbdd] bg-white text-[#222325] hover:border-[#222325]"
                                    }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>
                    <label className="mt-5 block cursor-pointer rounded-[28px] border border-dashed border-[#dadbdd] bg-white p-5 transition hover:border-[#222325]">
                        <input type="file" accept="image/*,video/*" onChange={handlePhoto} className="hidden" />
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f5f5f5] p-4">
                                <UploadCloud size={22} />
                            </div>
                            <div>
                                <p className="font-black">Upload photo or video</p>
                                <p className="mt-1 text-sm text-[#74767e]">Optional, but it helps businesses quote faster.</p>
                            </div>
                        </div>
                        {uploadedMedia ? (
                            uploadedMedia.type.startsWith("video/") ? (
                                <video src={uploadedMedia.dataUrl} controls className="mt-5 max-h-72 w-full rounded-2xl object-cover" />
                            ) : (
                                <img src={uploadedMedia.dataUrl} alt={uploadedMedia.name} className="mt-5 max-h-72 w-full rounded-2xl object-cover" />
                            )
                        ) : null}
                    </label>
                </section>
            );
        }

        if (step === 2) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#95979d]">Step 3 of 5</p>
                    <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#222325] md:text-5xl">Where do you need this?</h1>
                    <p className="mt-3 text-base leading-7 text-[#62646a]">Nearby businesses rank better when your area and optional pin are clear.</p>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">Country</span>
                            <select value={countryCode} onChange={(event) => setCountryCode(event.target.value)} className="nd-select mt-2 w-full rounded-2xl">
                                <option value="">Select country</option>
                                {countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                        {country.flag} {country.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">State / province</span>
                            <select value={stateCode} onChange={(event) => setStateCode(event.target.value)} className="nd-select mt-2 w-full rounded-2xl" disabled={!countryCode}>
                                <option value="">Select state</option>
                                {states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">City</span>
                            <select value={city} onChange={(event) => setCity(event.target.value)} className="nd-select mt-2 w-full rounded-2xl" disabled={!countryCode}>
                                <option value="">Select city</option>
                                {cities.map((option) => (
                                    <option key={option.name} value={option.name}>{option.name}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">Area</span>
                            <input value={area} onChange={(event) => setArea(event.target.value)} className="nd-input mt-2 rounded-2xl" placeholder="New Road, Baneshwor..." />
                        </label>
                    </div>
                    <div className="mt-5 rounded-[28px] border border-[#e4e5e7] bg-white p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-[#222325] p-3 text-white">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-black">Map pin optional</p>
                                    <p className="mt-1 text-sm leading-6 text-[#74767e]">{pinPoint?.address || "Pin a map point if the business needs exact navigation later."}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsMapOpen(true)} className="rounded-2xl bg-[#222325] px-5 py-3 text-sm font-black text-white">
                                {pinPoint ? "Change pin" : "Pin on map"}
                            </button>
                        </div>
                    </div>
                </section>
            );
        }

        if (step === 3) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#95979d]">Step 4 of 5</p>
                    <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#222325] md:text-5xl">Set your preference.</h1>
                    <p className="mt-3 text-base leading-7 text-[#62646a]">Choose urgency, budget, service method, and timing. Businesses can still offer alternatives.</p>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">Urgency</span>
                            <select value={urgency} onChange={(event) => setUrgency(event.target.value)} className="nd-select mt-2 w-full rounded-2xl">
                                {URGENCY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                            </select>
                        </label>
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">Budget</span>
                            <select value={budget} onChange={(event) => setBudget(event.target.value)} className="nd-select mt-2 w-full rounded-2xl">
                                {BUDGET_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                            </select>
                        </label>
                        {budget === "Custom" && (
                            <label>
                                <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">Custom budget</span>
                                <div className="relative mt-2">
                                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-[#74767e]">$</span>
                                    <input value={customBudget} onChange={(event) => setCustomBudget(event.target.value)} className="nd-input rounded-2xl pl-9" placeholder="50" />
                                </div>
                            </label>
                        )}
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">Preferred service method</span>
                            <select value={serviceMode} onChange={(event) => setServiceMode(event.target.value)} className="nd-select mt-2 w-full rounded-2xl">
                                {serviceModes.map((option) => <option key={option}>{option}</option>)}
                            </select>
                        </label>
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">Preferred time</span>
                            <input value={preferredTime} onChange={(event) => setPreferredTime(event.target.value)} className="nd-input mt-2 rounded-2xl" placeholder="Today 4 PM, tomorrow morning..." />
                        </label>
                        <label>
                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#74767e]">Warranty important?</span>
                            <select value={warrantyImportant} onChange={(event) => setWarrantyImportant(event.target.value)} className="nd-select mt-2 w-full rounded-2xl">
                                <option>Not sure</option>
                                <option>Yes, I prefer warranty</option>
                                <option>No, lowest price is okay</option>
                            </select>
                        </label>
                    </div>
                </section>
            );
        }

        return (
            <section>
                <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#95979d]">Step 5 of 5</p>
                <h1 className="mt-3 text-4xl font-black tracking-[-0.06em] text-[#222325] md:text-5xl">Review your Need.</h1>
                <p className="mt-3 text-base leading-7 text-[#62646a]">Businesses will see this summary and send structured Offers.</p>
                <NeedPreview
                    card={previewCard}
                    location={fullLocationString}
                    urgency={urgency}
                    budget={resolvedBudget}
                    media={uploadedMedia}
                    pinPoint={pinPoint}
                />
            </section>
        );
    };

    return (
        <RouteGuard allowedTypes={["customer"]}>
            <main className="min-h-screen bg-[#f7f7f7] px-4 py-5 text-[#222325] md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <Link href="/client" className="inline-flex items-center gap-2 text-sm font-black text-[#62646a] hover:text-[#222325]">
                            <ArrowLeft size={16} />
                            Back to my Needs
                        </Link>
                        <div className="rounded-full border border-[#dadbdd] bg-white px-4 py-2 text-xs font-black text-[#62646a]">
                            Post a Need in 5 easy steps
                        </div>
                    </div>

                    <section className="rounded-[34px] border border-[#e4e5e7] bg-white shadow-sm">
                        <div className="grid lg:grid-cols-[280px_1fr_360px]">
                            <aside className="border-b border-[#e4e5e7] p-4 lg:border-b-0 lg:border-r">
                                <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
                                    {steps.map((item, index) => {
                                        const active = index === step;
                                        const done = index < step;
                                        return (
                                            <button
                                                key={item.label}
                                                type="button"
                                                onClick={() => setStep(index)}
                                                className={`flex min-w-[180px] items-center gap-3 rounded-2xl p-3 text-left transition lg:w-full ${
                                                    active ? "bg-[#222325] text-white" : "bg-white text-[#222325] hover:bg-[#f5f5f5]"
                                                }`}
                                            >
                                                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${active ? "bg-white text-[#222325]" : "bg-[#f5f5f5]"}`}>
                                                    {done ? <Check size={16} /> : index + 1}
                                                </span>
                                                <span>
                                                    <span className="block text-sm font-black">{item.label}</span>
                                                    <span className={`block text-xs ${active ? "text-white/70" : "text-[#95979d]"}`}>{item.helper}</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-5 hidden rounded-3xl border border-[#e4e5e7] bg-[#fafafa] p-4 lg:block">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#95979d]">Progress</p>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e4e5e7]">
                                        <div className="h-full rounded-full bg-[#222325]" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
                                    </div>
                                    <p className="mt-3 text-sm font-bold">Step {step + 1} of {steps.length}</p>
                                </div>
                            </aside>

                            <div className="min-h-[640px] p-5 md:p-8">
                                {renderStep()}
                                {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
                                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#e4e5e7] pt-5">
                                    <button
                                        type="button"
                                        onClick={backStep}
                                        disabled={step === 0}
                                        className="inline-flex items-center gap-2 rounded-2xl border border-[#dadbdd] bg-white px-5 py-3 text-sm font-black text-[#222325] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft size={16} />
                                        Back
                                    </button>
                                    {step < steps.length - 1 ? (
                                        <button
                                            type="button"
                                            onClick={() => void continueStep()}
                                            disabled={isCleaning}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-[#222325] px-6 py-3 text-sm font-black text-white disabled:opacity-50"
                                        >
                                            {isCleaning ? <Loader2 size={16} className="animate-spin" /> : null}
                                            Continue
                                            <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => void handleSubmit()}
                                            disabled={posting}
                                            className="inline-flex items-center gap-2 rounded-2xl bg-[#222325] px-6 py-3 text-sm font-black text-white disabled:opacity-50"
                                        >
                                            {posting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            Post Need
                                        </button>
                                    )}
                                </div>
                            </div>

                            <aside className="border-t border-[#e4e5e7] bg-[#fafafa] p-5 lg:border-l lg:border-t-0">
                                <div className="sticky top-20 rounded-[28px] border border-[#e4e5e7] bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#95979d]">Live preview</p>
                                            <h2 className="mt-2 text-xl font-black">Need Card</h2>
                                        </div>
                                        <Sparkles size={22} className="text-[#95979d]" />
                                    </div>
                                    <NeedPreview
                                        compact
                                        card={previewCard}
                                        location={fullLocationString}
                                        urgency={urgency}
                                        budget={resolvedBudget}
                                        media={uploadedMedia}
                                        pinPoint={pinPoint}
                                    />
                                </div>
                                <div className="mt-4 rounded-[28px] border border-[#e4e5e7] bg-white p-5">
                                    <p className="font-black">What happens next?</p>
                                    <div className="mt-4 space-y-3 text-sm text-[#62646a]">
                                        <p>1. Nearby businesses see the Need.</p>
                                        <p>2. They send price, time, warranty, and service method.</p>
                                        <p>3. You compare Offers and message before choosing.</p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </section>
                </div>

                {isMapOpen && (
                    <DeliveryMap
                        initialCoords={pinPoint?.coords || null}
                        initialAddress={pinPoint?.address || fullLocationString}
                        onClose={() => setIsMapOpen(false)}
                        onSelect={(data) => {
                            setPinPoint(data);
                            if (!area && data.address) setArea(data.address.split(",")[0] || "");
                            setIsMapOpen(false);
                        }}
                    />
                )}
            </main>
        </RouteGuard>
    );
}

function NeedPreview({
    card,
    location,
    urgency,
    budget,
    media,
    pinPoint,
    compact = false,
}: {
    card: NeedCard;
    location: string;
    urgency: string;
    budget: string;
    media: UploadedMedia | null;
    pinPoint: PinPoint | null;
    compact?: boolean;
}) {
    return (
        <div className={compact ? "mt-5" : "mt-8"}>
            <div className="overflow-hidden rounded-[24px] border border-[#e4e5e7] bg-white">
                {media ? (
                    media.type.startsWith("video/") ? (
                        <video src={media.dataUrl} controls className={compact ? "h-36 w-full object-cover" : "max-h-80 w-full object-cover"} />
                    ) : (
                        <img src={media.dataUrl} alt={media.name} className={compact ? "h-36 w-full object-cover" : "max-h-80 w-full object-cover"} />
                    )
                ) : (
                    <div className={`${compact ? "h-32" : "h-52"} flex items-center justify-center bg-[#f5f5f5]`}>
                        <Camera className="text-[#b5b6ba]" size={32} />
                    </div>
                )}
                <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#95979d]">{card.category}</p>
                    <h3 className={`${compact ? "text-xl" : "text-3xl"} mt-2 font-black leading-tight tracking-[-0.05em]`}>{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#62646a]">{card.summaryForBusinesses || card.problem}</p>
                    <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                        <span className="rounded-2xl bg-[#f7f7f7] p-3"><strong>Area:</strong> {location}</span>
                        <span className="rounded-2xl bg-[#f7f7f7] p-3"><strong>Urgency:</strong> {urgency}</span>
                        <span className="rounded-2xl bg-[#f7f7f7] p-3"><strong>Budget:</strong> {budget}</span>
                        <span className="rounded-2xl bg-[#f7f7f7] p-3"><strong>Mode:</strong> {card.serviceMode || "Open"}</span>
                    </div>
                    {pinPoint && (
                        <div className="mt-3 rounded-2xl border border-[#dadbdd] p-3 text-sm font-semibold text-[#62646a]">
                            <MapPin size={15} className="mr-1 inline" />
                            Map pin saved: {pinPoint.address}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
