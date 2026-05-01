"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    BatteryCharging,
    Camera,
    Check,
    CheckCircle2,
    ChevronLeft,
    Clock3,
    Droplets,
    HelpCircle,
    Home,
    Loader2,
    MapPin,
    Mic,
    PlugZap,
    Smartphone,
    Store,
    UploadCloud,
    Wrench,
} from "lucide-react";
import { City, Country, State } from "country-state-city";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { createNeed } from "@/lib/neederoDatabase";
import type { NeedCard } from "@/lib/nearquote";

const DeliveryMap = dynamic(() => import("@/components/profile/DeliveryMap"), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="rounded-2xl bg-white px-6 py-5 text-sm font-black text-[#06111f] shadow-2xl">
                Loading map...
            </div>
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
    { label: "Issue", helper: "What happened?" },
    { label: "Phone details", helper: "Brand and proof" },
    { label: "Preference", helper: "How to repair" },
    { label: "Location", helper: "Area and urgency" },
    { label: "Review", helper: "Post repair need" },
];

const issueOptions = [
    { label: "Screen broken", value: "Screen broken", icon: Smartphone, tone: "bg-[#e9f9f0] text-[#0a8f45]" },
    { label: "Battery issue", value: "Battery issue", icon: BatteryCharging, tone: "bg-[#fff7ed] text-[#c2410c]" },
    { label: "Charging problem", value: "Charging problem", icon: PlugZap, tone: "bg-[#eef6ff] text-[#2563eb]" },
    { label: "Speaker/mic issue", value: "Speaker/mic issue", icon: Mic, tone: "bg-[#f5f3ff] text-[#6d28d9]" },
    { label: "Camera issue", value: "Camera issue", icon: Camera, tone: "bg-[#fdf2f8] text-[#be185d]" },
    { label: "Water damage", value: "Water damage", icon: Droplets, tone: "bg-[#ecfeff] text-[#0e7490]" },
    { label: "Phone not turning on", value: "Phone not turning on", icon: Clock3, tone: "bg-[#f1f5f9] text-[#334155]" },
    { label: "Other issue", value: "Other issue", icon: HelpCircle, tone: "bg-[#f8fafc] text-[#475569]" },
];

const brandOptions = ["Apple iPhone", "Samsung", "Xiaomi / Redmi", "Oppo", "Vivo", "OnePlus", "Google Pixel", "Realme", "Other"];
const servicePreferences = ["Visit shop", "Home repair", "Pickup & return", "Ask shop to suggest"];
const urgencyOptions = ["Today", "Tomorrow", "Flexible"];

const issueTitleMap: Record<string, string> = {
    "Screen broken": "screen repair",
    "Battery issue": "battery repair",
    "Charging problem": "charging repair",
    "Speaker/mic issue": "speaker or mic repair",
    "Camera issue": "camera repair",
    "Water damage": "water damage repair",
    "Phone not turning on": "power issue repair",
    "Other issue": "phone repair",
};

const inputClass =
    "mt-2 w-full rounded-xl border border-[#dfe8e3] bg-white px-4 py-3 text-sm font-semibold text-[#06111f] outline-none transition focus:border-[#0a8f45] focus:ring-4 focus:ring-[#e9f9f0] disabled:bg-[#f8faf9] disabled:text-[#94a3b8]";

const labelClass = "text-xs font-black uppercase tracking-[0.12em] text-[#64748b]";

function isPdfMedia(media?: UploadedMedia | null) {
    return Boolean(media?.type === "application/pdf" || media?.dataUrl?.startsWith("data:application/pdf") || /\.pdf$/i.test(media?.name || ""));
}

function UploadedMediaPreview({ media, compact = false }: { media: UploadedMedia; compact?: boolean }) {
    if (isPdfMedia(media)) {
        return (
            <div className={`overflow-hidden rounded-2xl border border-[#dfe8e3] bg-white ${compact ? "mt-0" : "mt-5"}`}>
                <div className="flex items-center gap-3 bg-[#f8faf9] p-4">
                    <div className="rounded-xl bg-[#06111f] p-2 text-white">
                        <Wrench size={18} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#06111f]">{media.name}</p>
                        <p className="text-xs font-semibold text-[#64748b]">Repair proof attached</p>
                    </div>
                </div>
            </div>
        );
    }

    if (media.type.startsWith("video/")) {
        return <video src={media.dataUrl} controls className={`${compact ? "h-32" : "mt-5 max-h-72"} w-full rounded-2xl object-cover`} />;
    }

    return <img src={media.dataUrl} alt={media.name} className={`${compact ? "h-32" : "mt-5 max-h-72"} w-full rounded-2xl object-cover`} />;
}

function buildRepairTitle(brand: string, model: string, issue: string, urgency: string) {
    const device = [brand === "Other" ? "" : brand.replace("Apple ", ""), model].filter(Boolean).join(" ").trim() || "Phone";
    const repair = issueTitleMap[issue] || "phone repair";
    const time = urgency === "Flexible" ? "needed" : `needed ${urgency.toLowerCase()}`;
    return `${device} ${repair} ${time}`;
}

function buildRepairCard(input: {
    brand: string;
    model: string;
    issueType: string;
    issueDescription: string;
    servicePreference: string;
    urgency: string;
    location: string;
    budget: string;
    customerAvatar?: string | null;
}): NeedCard {
    const title = buildRepairTitle(input.brand, input.model, input.issueType, input.urgency);
    const details = [
        `Issue: ${input.issueType}`,
        `Phone: ${[input.brand, input.model].filter(Boolean).join(" ") || "Not specified"}`,
        input.issueDescription ? `Details: ${input.issueDescription}` : "",
        `Service preference: ${input.servicePreference}`,
        `Customer budget: ${input.budget || "Open for NPR repair quotes"}`,
        `Urgency: ${input.urgency}`,
        `Area: ${input.location}`,
    ]
        .filter(Boolean)
        .join("\n");

    return {
        category: "Phone Repair",
        title,
        problem: input.issueDescription || `${input.issueType} on ${input.model || "phone"}.`,
        knownDetails: details,
        missingInfo: ["Repair price", "Estimated time", "Warranty", "Parts quality"],
        questions: ["What is your repair price in NPR?", "How long will it take?", "What warranty and parts quality do you provide?"],
        summaryForBusinesses: "Send repair price in NPR, estimated time, warranty, parts quality, availability, and service method.",
        tags: ["Phone Repair", input.issueType, input.servicePreference],
        customerAvatar: input.customerAvatar || null,
        serviceMode: input.servicePreference,
        preferredTime: input.urgency,
        warrantyImportant: "Yes, repair warranty preferred",
    };
}

export default function NewCustomerRequestPage() {
    const router = useRouter();
    const { user, profile, updateUserProfile } = useAuth();
    const [step, setStep] = useState(0);
    const [issueType, setIssueType] = useState(issueOptions[0].value);
    const [phoneBrand, setPhoneBrand] = useState(brandOptions[0]);
    const [phoneModel, setPhoneModel] = useState("");
    const [issueDescription, setIssueDescription] = useState("");
    const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
    const [servicePreference, setServicePreference] = useState(servicePreferences[0]);
    const [budget, setBudget] = useState("Open for NPR repair quotes");
    const [urgency, setUrgency] = useState(urgencyOptions[0]);
    const [countryCode, setCountryCode] = useState(profile?.countryCode || "NP");
    const [stateCode, setStateCode] = useState(profile?.stateCode || "");
    const [city, setCity] = useState(profile?.city || "");
    const [area, setArea] = useState(profile?.area || "");
    const [exactAddress, setExactAddress] = useState(profile?.currentAddress || "");
    const [pinPoint, setPinPoint] = useState<PinPoint | null>(
        profile?.deliveryCoords
            ? {
                  address: profile.deliveryAddress || profile.currentAddress || "Pinned location",
                  coords: { lat: profile.deliveryCoords.lat, lng: profile.deliveryCoords.lng },
              }
            : null,
    );
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState("");

    const countries = useMemo(() => Country.getAllCountries(), []);
    const selectedCountry = countries.find((country) => country.isoCode === countryCode);
    const states = useMemo(() => (countryCode ? State.getStatesOfCountry(countryCode) : []), [countryCode]);
    const selectedState = states.find((state) => state.isoCode === stateCode);
    const cities = useMemo(() => {
        if (!countryCode) return [];
        const list = stateCode ? City.getCitiesOfState(countryCode, stateCode) : City.getCitiesOfCountry(countryCode) || [];
        return list.length ? list : City.getCitiesOfCountry(countryCode) || [];
    }, [countryCode, stateCode]);
    const profileAvatar = profile?.photoURL || user?.photoURL || null;
    const locationString = [area, city, selectedState?.name, selectedCountry?.name].filter(Boolean).join(", ") || "Location not set";
    const repairCard = useMemo(
        () =>
            buildRepairCard({
                brand: phoneBrand,
                model: phoneModel,
                issueType,
                issueDescription,
                servicePreference,
                budget,
                urgency,
                location: locationString,
                customerAvatar: profileAvatar,
            }),
        [budget, issueType, issueDescription, locationString, phoneBrand, phoneModel, profileAvatar, servicePreference, urgency],
    );

    useEffect(() => {
        if (profile?.countryCode) return;
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
    }, [profile?.countryCode]);

    const handleMedia = (event: ChangeEvent<HTMLInputElement>) => {
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

    const validateStep = () => {
        if (step === 0 && !issueType) return "Choose what happened to your phone.";
        if (step === 1 && !phoneBrand) return "Choose the phone brand. The exact model is optional.";
        if (step === 3 && (!city || !area)) return "Add city and area so nearby repair shops can find this request.";
        return "";
    };

    const continueStep = () => {
        const nextError = validateStep();
        if (nextError) {
            setError(nextError);
            return;
        }
        setError("");
        setStep((current) => Math.min(current + 1, steps.length - 1));
    };

    const backStep = () => {
        setError("");
        setStep((current) => Math.max(current - 1, 0));
    };

    const handleSubmit = async () => {
        if (!user) return;
        if (!profile?.phoneVerified) {
            setError("Verify your phone number from Profile before posting a Phone Repair Need.");
            return;
        }
        const nextError = validateStep();
        if (nextError) {
            setError(nextError);
            return;
        }
        setPosting(true);
        setError("");
        try {
            const description = [
                repairCard.knownDetails,
                `Customer budget: ${budget.trim() || "Open for NPR repair quotes"}`,
                exactAddress ? `Exact address: ${exactAddress}` : "",
                pinPoint ? `Map pin: ${pinPoint.address}` : "",
                "Repair shops should send price, estimated time, warranty, parts quality, availability, and note.",
            ]
                .filter(Boolean)
                .join("\n");

            await createNeed({
                customerId: user.uid,
                customerName: profile?.displayName || profile?.email || "Customer",
                customerAvatar: profileAvatar,
                title: repairCard.title,
                description,
                category: "Phone Repair",
                location: locationString,
                countryCode,
                stateCode,
                city,
                area,
                latitude: pinPoint?.coords.lat ?? null,
                longitude: pinPoint?.coords.lng ?? null,
                urgency,
                budget: budget.trim() || "Open for NPR repair quotes",
                photoPreview: uploadedMedia?.dataUrl || null,
                cleanCard: repairCard,
            });
            await updateUserProfile({
                firstNeedCompleted: true,
                firstNeedCompletedAt: Date.now(),
            });
            router.push("/client");
        } catch (nextError: any) {
            setError(nextError?.message || "Could not post this phone repair Need. Please try again.");
        } finally {
            setPosting(false);
        }
    };

    const renderStep = () => {
        if (step === 0) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 1 of 5</p>
                    <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">What happened to your phone?</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64748b]">
                        Choose one repair issue. Needero MVP is focused only on phone repair so nearby shops can quote fast.
                    </p>
                    <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {issueOptions.map((option) => {
                            const Icon = option.icon;
                            const active = issueType === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setIssueType(option.value)}
                                    className={`min-h-[110px] rounded-2xl border p-4 text-left transition ${
                                        active ? "border-[#0a8f45] bg-[#f0fbf4] ring-4 ring-[#e9f9f0]" : "border-[#dfe8e3] bg-white hover:border-[#9bd6b2]"
                                    }`}
                                >
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${option.tone}`}>
                                        <Icon size={20} />
                                    </div>
                                    <p className="mt-4 text-sm font-black text-[#06111f]">{option.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>
            );
        }

        if (step === 1) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 2 of 5</p>
                    <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">Add phone details.</h1>
                    <p className="mt-3 text-sm leading-7 text-[#64748b]">Choose the brand. Add the model only if you know it; clear photos can help shops quote the right part and price.</p>
                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                        <label>
                            <span className={labelClass}>Phone brand</span>
                            <select value={phoneBrand} onChange={(event) => setPhoneBrand(event.target.value)} className={inputClass}>
                                {brandOptions.map((option) => (
                                    <option key={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={labelClass}>Model optional</span>
                            <input value={phoneModel} onChange={(event) => setPhoneModel(event.target.value)} className={inputClass} placeholder="Optional: iPhone 13, Redmi Note 12..." />
                        </label>
                        <label className="md:col-span-2">
                            <span className={labelClass}>Issue description</span>
                            <textarea
                                value={issueDescription}
                                onChange={(event) => setIssueDescription(event.target.value)}
                                className={`${inputClass} min-h-[150px] resize-y`}
                                placeholder="Example: screen cracked, touch still works, need repair today near Kathmandu."
                            />
                        </label>
                    </div>
                    <label className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-[#bdddc8] bg-[#fbfdfb] p-5 transition hover:border-[#0a8f45]">
                        <input type="file" accept="image/*,video/*,application/pdf,.pdf" onChange={handleMedia} className="hidden" />
                        <div className="flex items-center gap-4">
                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                                <UploadCloud size={22} />
                            </div>
                            <div>
                                <p className="font-black text-[#06111f]">Upload phone photo or video</p>
                                <p className="mt-1 text-sm text-[#64748b]">Optional, but cracked screens and charging ports are easier to quote with proof.</p>
                            </div>
                        </div>
                        {uploadedMedia ? <UploadedMediaPreview media={uploadedMedia} /> : null}
                    </label>
                </section>
            );
        }

        if (step === 2) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 3 of 5</p>
                    <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">Set your repair preference.</h1>
                    <p className="mt-3 text-sm leading-7 text-[#64748b]">Shops can still suggest alternatives, but this helps them send useful Offers.</p>
                    <div className="mt-7 grid gap-3 md:grid-cols-2">
                        {servicePreferences.map((option) => {
                            const active = servicePreference === option;
                            const Icon = option === "Visit shop" ? Store : option === "Home repair" ? Home : option === "Pickup & return" ? MapPin : Wrench;
                            return (
                                <button
                                    type="button"
                                    key={option}
                                    onClick={() => setServicePreference(option)}
                                    className={`flex min-h-[92px] items-center gap-4 rounded-2xl border p-4 text-left transition ${
                                        active ? "border-[#0a8f45] bg-[#f0fbf4] ring-4 ring-[#e9f9f0]" : "border-[#dfe8e3] bg-white hover:border-[#9bd6b2]"
                                    }`}
                                >
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                                        <Icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-[#06111f]">{option}</p>
                                        <p className="mt-1 text-xs leading-5 text-[#64748b]">
                                            {option === "Visit shop"
                                                ? "You go to the repair shop."
                                                : option === "Home repair"
                                                  ? "Shop visits your place if possible."
                                                  : option === "Pickup & return"
                                                    ? "Shop collects, repairs, and returns."
                                                    : "Let shop choose the safest method."}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <label className="mt-5 block">
                        <span className={labelClass}>Customer budget</span>
                        <input
                            value={budget}
                            onChange={(event) => setBudget(event.target.value)}
                            className={inputClass}
                            placeholder="Open for NPR repair quotes or NPR 4,500"
                        />
                    </label>
                </section>
            );
        }

        if (step === 3) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 4 of 5</p>
                    <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">Location & urgency.</h1>
                    <p className="mt-3 text-sm leading-7 text-[#64748b]">Exact address is optional. Shops see area first and quote in NPR.</p>
                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                        <label>
                            <span className={labelClass}>Country</span>
                            <select
                                value={countryCode}
                                onChange={(event) => {
                                    setCountryCode(event.target.value);
                                    setStateCode("");
                                    setCity("");
                                }}
                                className={inputClass}
                            >
                                {countries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                        {country.flag} {country.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={labelClass}>State / province</span>
                            <select value={stateCode} onChange={(event) => setStateCode(event.target.value)} className={inputClass} disabled={!countryCode}>
                                <option value="">Select state</option>
                                {states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={labelClass}>City</span>
                            <select value={city} onChange={(event) => setCity(event.target.value)} className={inputClass} disabled={!countryCode}>
                                <option value="">Select city</option>
                                {cities.map((option) => (
                                    <option key={`${option.name}-${option.latitude}-${option.longitude}`} value={option.name}>
                                        {option.name}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={labelClass}>Area</span>
                            <input value={area} onChange={(event) => setArea(event.target.value)} className={inputClass} placeholder="Thapathali, New Road, Baneshwor..." />
                        </label>
                        <label>
                            <span className={labelClass}>Urgency</span>
                            <select value={urgency} onChange={(event) => setUrgency(event.target.value)} className={inputClass}>
                                {urgencyOptions.map((option) => (
                                    <option key={option}>{option}</option>
                                ))}
                            </select>
                        </label>
                        <label>
                            <span className={labelClass}>Exact address optional</span>
                            <input value={exactAddress} onChange={(event) => setExactAddress(event.target.value)} className={inputClass} placeholder="Only share after choosing a shop if needed" />
                        </label>
                    </div>
                    <div className="mt-5 rounded-2xl border border-[#dfe8e3] bg-white p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-[#06111f] p-3 text-white">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="font-black text-[#06111f]">Map pin optional</p>
                                    <p className="mt-1 text-sm leading-6 text-[#64748b]">{pinPoint?.address || "Pin only if pickup, return, or home repair needs exact navigation."}</p>
                                </div>
                            </div>
                            <button type="button" onClick={() => setIsMapOpen(true)} className="rounded-xl bg-[#06111f] px-5 py-3 text-sm font-black text-white">
                                {pinPoint ? "Change pin" : "Pin on map"}
                            </button>
                        </div>
                    </div>
                </section>
            );
        }

        return (
            <section>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 5 of 5</p>
                <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">Review your phone repair Need.</h1>
                <p className="mt-3 text-sm leading-7 text-[#64748b]">Shops can send price, time, warranty, parts quality, availability, and repair notes.</p>
                <NeedPreview card={repairCard} location={locationString} urgency={urgency} budget={budget} media={uploadedMedia} pinPoint={pinPoint} />
            </section>
        );
    };

    return (
        <RouteGuard allowedTypes={["customer"]}>
            <main className="min-h-screen bg-[#f7faf8] px-4 py-5 text-[#06111f] md:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <Link href="/client" className="inline-flex items-center gap-2 text-sm font-black text-[#64748b] hover:text-[#06111f]">
                            <ArrowLeft size={16} />
                            Back to my repair Needs
                        </Link>
                        <div className="rounded-full border border-[#dfe8e3] bg-white px-4 py-2 text-xs font-black text-[#0a8f45]">
                            Phone Repair MVP only
                        </div>
                    </div>

                    {!profile?.phoneVerified && (
                        <div className="mb-5 flex flex-col gap-3 rounded-[22px] border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm md:flex-row md:items-center md:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700">
                                    <Smartphone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-black">Phone verification required</p>
                                    <p className="mt-1 text-sm leading-6 text-amber-800">Verify your phone number with SMS OTP before posting a repair Need.</p>
                                </div>
                            </div>
                            <Link href="/profile" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-[#06111f] px-5 py-3 text-sm font-black text-white transition hover:bg-black">
                                Verify phone number
                            </Link>
                        </div>
                    )}

                    <section className="overflow-hidden rounded-[24px] border border-[#dfe8e3] bg-white shadow-[0_18px_55px_rgba(15,23,42,0.06)]">
                        <div className="grid lg:grid-cols-[250px_minmax(0,1fr)_340px]">
                            <aside className="border-b border-[#dfe8e3] bg-[#fbfdfb] p-4 lg:border-b-0 lg:border-r">
                                <div className="flex gap-2 overflow-x-auto lg:block lg:space-y-2">
                                    {steps.map((item, index) => {
                                        const active = index === step;
                                        const done = index < step;
                                        return (
                                            <button
                                                key={item.label}
                                                type="button"
                                                onClick={() => setStep(index)}
                                                className={`flex min-w-[178px] items-center gap-3 rounded-2xl p-3 text-left transition lg:w-full ${
                                                    active ? "bg-[#0a8f45] text-white" : "bg-white text-[#06111f] hover:bg-[#f0fbf4]"
                                                }`}
                                            >
                                                <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-black ${active ? "bg-white text-[#0a8f45]" : "bg-[#e9f9f0] text-[#0a8f45]"}`}>
                                                    {done ? <Check size={16} /> : index + 1}
                                                </span>
                                                <span>
                                                    <span className="block text-sm font-black">{item.label}</span>
                                                    <span className={`block text-xs ${active ? "text-white/75" : "text-[#94a3b8]"}`}>{item.helper}</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-5 hidden rounded-2xl border border-[#dfe8e3] bg-white p-4 lg:block">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94a3b8]">Progress</p>
                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf5ef]">
                                        <div className="h-full rounded-full bg-[#0a8f45]" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
                                    </div>
                                    <p className="mt-3 text-sm font-black text-[#06111f]">Step {step + 1} of {steps.length}</p>
                                </div>
                            </aside>

                            <div className="min-h-[640px] p-5 md:p-8">
                                {renderStep()}
                                {error && <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{error}</div>}
                                <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe8e3] pt-5">
                                    <button
                                        type="button"
                                        onClick={backStep}
                                        disabled={step === 0}
                                        className="inline-flex items-center gap-2 rounded-xl border border-[#dfe8e3] bg-white px-5 py-3 text-sm font-black text-[#06111f] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        <ChevronLeft size={16} />
                                        Previous
                                    </button>
                                    {step < steps.length - 1 ? (
                                        <button type="button" onClick={continueStep} className="inline-flex items-center gap-2 rounded-xl bg-[#0a8f45] px-6 py-3 text-sm font-black text-white hover:bg-[#08783b]">
                                            Continue
                                            <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => void handleSubmit()}
                                            disabled={posting || !profile?.phoneVerified}
                                            className="inline-flex items-center gap-2 rounded-xl bg-[#0a8f45] px-6 py-3 text-sm font-black text-white hover:bg-[#08783b] disabled:opacity-50"
                                        >
                                            {posting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            {profile?.phoneVerified ? "Post Phone Repair Need" : "Verify phone first"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <aside className="border-t border-[#dfe8e3] bg-[#fbfdfb] p-5 lg:border-l lg:border-t-0">
                                <div className="sticky top-20 rounded-[22px] border border-[#dfe8e3] bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#94a3b8]">Live preview</p>
                                            <h2 className="mt-2 text-xl font-black text-[#06111f]">Repair Need Card</h2>
                                        </div>
                                        <Smartphone size={22} className="text-[#0a8f45]" />
                                    </div>
                                    <NeedPreview compact card={repairCard} location={locationString} urgency={urgency} budget={budget} media={uploadedMedia} pinPoint={pinPoint} />
                                </div>
                                <div className="mt-4 rounded-[22px] border border-[#dfe8e3] bg-white p-5">
                                    <p className="font-black text-[#06111f]">What happens next?</p>
                                    <div className="mt-4 space-y-3 text-sm leading-6 text-[#64748b]">
                                        <p>1. Verified repair shops see this request.</p>
                                        <p>2. Shops send NPR price, time, warranty, parts quality, and service method.</p>
                                        <p>3. You compare repair Offers and choose the safest shop.</p>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </section>
                </div>

                {isMapOpen && (
                    <DeliveryMap
                        initialCoords={pinPoint?.coords || null}
                        initialAddress={pinPoint?.address || locationString}
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
            <div className="overflow-hidden rounded-[22px] border border-[#dfe8e3] bg-white">
                {media ? (
                    <div className={compact ? "" : "p-5 pb-0"}>
                        <UploadedMediaPreview media={media} compact={compact} />
                    </div>
                ) : (
                    <div className={`${compact ? "h-32" : "h-52"} flex items-center justify-center bg-[#f1f5f9]`}>
                        <Camera className="text-[#94a3b8]" size={32} />
                    </div>
                )}
                <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#0a8f45]">{card.category}</p>
                    <h3 className={`${compact ? "text-xl" : "text-3xl"} mt-2 font-black leading-tight text-[#06111f]`}>{card.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[#64748b]">{card.summaryForBusinesses}</p>
                    <div className="mt-5 grid gap-2 text-sm sm:grid-cols-2">
                        <span className="rounded-2xl bg-[#f8faf9] p-3"><strong>Area:</strong> {location}</span>
                        <span className="rounded-2xl bg-[#f8faf9] p-3"><strong>Urgency:</strong> {urgency}</span>
                        <span className="rounded-2xl bg-[#f8faf9] p-3"><strong>Service:</strong> {card.serviceMode || "Open"}</span>
                        <span className="rounded-2xl bg-[#f8faf9] p-3"><strong>Customer budget:</strong> {budget || "Open"}</span>
                    </div>
                    {pinPoint && (
                        <div className="mt-3 rounded-2xl border border-[#dfe8e3] p-3 text-sm font-semibold text-[#64748b]">
                            <MapPin size={15} className="mr-1 inline" />
                            Map pin saved: {pinPoint.address}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
