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
    Pizza,
    PlugZap,
    ShoppingBag,
    ShoppingCart,
    Smartphone,
    Store,
    UploadCloud,
    Utensils,
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
    { label: "Category", helper: "What do you need?" },
    { label: "Details", helper: "Issue, description & photos" },
    { label: "Delivery", helper: "Preference, budget & location" },
    { label: "Review", helper: "Confirm and post" },
];

const categoryOptions = [
    { label: "Mobile Repair", value: "Mobile Repair", icon: Smartphone, tone: "bg-[#e9f9f0] text-[#0a8f45]" },
    { label: "Food Service & Delivery", value: "Food Service & Delivery", icon: ShoppingBag, tone: "bg-[#fdf2f8] text-[#be185d]" },
    { label: "Home & Local Services", value: "Home Service", icon: Home, tone: "bg-[#eef6ff] text-[#2563eb]" },
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

const foodIssueOptions = [
    { label: "Restaurant Order", value: "Restaurant Order", icon: Utensils, tone: "bg-[#fdf2f8] text-[#be185d]" },
    { label: "Grocery Items", value: "Grocery Items", icon: ShoppingCart, tone: "bg-[#eef6ff] text-[#2563eb]" },
    { label: "Bakery & Sweets", value: "Bakery & Sweets", icon: Pizza, tone: "bg-[#fff7ed] text-[#c2410c]" },
    { label: "Fresh Vegetables", value: "Fresh Vegetables", icon: Store, tone: "bg-[#e9f9f0] text-[#0a8f45]" },
    { label: "Custom Food Task", value: "Custom Food Task", icon: HelpCircle, tone: "bg-[#f8fafc] text-[#475569]" },
];

const homeIssueOptions = [
    { label: "Plumbing", value: "Plumbing", icon: Droplets, tone: "bg-[#eef6ff] text-[#2563eb]" },
    { label: "Electrical", value: "Electrical", icon: PlugZap, tone: "bg-[#fff7ed] text-[#c2410c]" },
    { label: "House Cleaning", value: "House Cleaning", icon: Store, tone: "bg-[#fdf2f8] text-[#be185d]" },
    { label: "Carpentry", value: "Carpentry", icon: Wrench, tone: "bg-[#e9f9f0] text-[#0a8f45]" },
    { label: "Other Task", value: "Other Task", icon: HelpCircle, tone: "bg-[#f8fafc] text-[#475569]" },
];

const brandOptions = ["Apple", "Samsung", "Xiaomi", "Other"];
const servicePreferences = ["Visit business", "Home service", "Pickup & return", "Ask provider to suggest"];
const foodPreferences = ["Delivery to my door", "Self pickup", "Order & I will collect", "Dine-in booking"];
const homePreferences = ["Home visit", "Visit business", "Pickup & return", "Phone consultation"];
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

function buildServiceTitle(category: string, issue: string, urgency: string, brand?: string, model?: string) {
    if (category === "Mobile Repair") {
        const device = [brand === "Other" ? "" : brand, model].filter(Boolean).join(" ").trim() || "Device";
        const repair = issueTitleMap[issue] || "service";
        const time = urgency === "Flexible" ? "needed" : `needed ${urgency.toLowerCase()}`;
        return `${device} ${repair} ${time}`;
    }
    const time = urgency === "Flexible" ? "needed" : `needed ${urgency.toLowerCase()}`;
    return `${issue} ${time}`;
}

function buildNeedCard(input: {
    category: "Mobile Repair" | "Food Service & Delivery" | "Home Service";
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
    const isFood = input.category === "Food Service & Delivery";
    const isHome = input.category === "Home Service";
    const title = buildServiceTitle(input.category, input.issueType, input.urgency, input.brand, input.model);

    const details = isFood
        ? [
            `Service: ${input.issueType}`,
            input.issueDescription ? `Details: ${input.issueDescription}` : "",
            `Delivery preference: ${input.servicePreference}`,
            `Estimated budget: ${input.budget || "Open for quotes"}`,
            `Urgency: ${input.urgency}`,
            `Area: ${input.location}`,
          ].filter(Boolean).join("\n")
        : isHome
        ? [
            `Task: ${input.issueType}`,
            input.issueDescription ? `Description: ${input.issueDescription}` : "",
            `Service preference: ${input.servicePreference}`,
            `Budget: ${input.budget || "Open for quotes"}`,
            `Urgency: ${input.urgency}`,
            `Area: ${input.location}`,
          ].filter(Boolean).join("\n")
        : [
            `Issue: ${input.issueType}`,
            `Item/Device: ${[input.brand, input.model].filter(Boolean).join(" ") || "Not specified"}`,
            input.issueDescription ? `Details: ${input.issueDescription}` : "",
            `Service preference: ${input.servicePreference}`,
            `Customer budget: ${input.budget || "Open for local service quotes"}`,
            `Urgency: ${input.urgency}`,
            `Area: ${input.location}`,
          ].filter(Boolean).join("\n");

    return {
        category: input.category,
        title,
        problem: input.issueDescription || `${input.issueType} needed.`,
        knownDetails: details,
        missingInfo: isFood || isHome ? ["Availability", "Price", "Time"] : ["Price", "Estimated time", "Warranty", "Quality"],
        questions: isFood || isHome ? ["Can you do this?", "What is the total price?", "How long will it take?"] : ["What is your service price?", "How long will it take?", "What warranty and quality do you provide?"],
        summaryForBusinesses: isFood || isHome ? "Send price, availability, and estimated time." : "Send price, estimated time, warranty, quality, availability, and service method.",
        tags: [input.category, input.issueType, input.servicePreference],
        customerAvatar: input.customerAvatar || null,
        serviceMode: input.servicePreference,
        preferredTime: input.urgency,
        warrantyImportant: isFood ? "N/A" : "Yes, service warranty preferred",
    };
}

export default function NewCustomerRequestPage() {
    const router = useRouter();
    const { user, profile, updateUserProfile } = useAuth();
    const [step, setStep] = useState(0);
    const [category, setCategory] = useState<"Mobile Repair" | "Food Service & Delivery" | "Home Service">("Mobile Repair");
    const [issueType, setIssueType] = useState("");
    const [phoneBrand, setPhoneBrand] = useState(brandOptions[0]);
    const [phoneModel, setPhoneModel] = useState("");
    const [issueDescription, setIssueDescription] = useState("");
    const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia | null>(null);
    const [servicePreference, setServicePreference] = useState("");
    const [budget, setBudget] = useState("");
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
            buildNeedCard({
                category,
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
        [category, budget, issueType, issueDescription, locationString, phoneBrand, phoneModel, profileAvatar, servicePreference, urgency],
    );

    useEffect(() => {
        if (!issueType) {
            setIssueType(category === "Food Service & Delivery" ? foodIssueOptions[0].value : category === "Home Service" ? homeIssueOptions[0].value : issueOptions[0].value);
        }
    }, [category, issueType]);

    useEffect(() => {
        if (!servicePreference) {
            setServicePreference(category === "Food Service & Delivery" ? foodPreferences[0] : category === "Home Service" ? homePreferences[0] : servicePreferences[0]);
        }
    }, [category, servicePreference]);

    useEffect(() => {
        if (!budget) {
            setBudget(category === "Mobile Repair" ? "Open for local repair quotes" : "Open for quotes");
        }
    }, [category, budget]);

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
        if (step === 0 && !category) return "Please select a category.";
        if (step === 1 && !issueType) return "Please choose what service you need.";
        if (step === 2 && (!city || !area)) return "Add city and area so nearby businesses can find this request.";
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
            setError("Verify your phone number from Profile before posting a new need.");
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
                "Businesses should send price, estimated time, and relevant details.",
            ]
                .filter(Boolean)
                .join("\n");

            await createNeed({
                customerId: user.uid,
                customerName: profile?.displayName || profile?.email || "Customer",
                customerAvatar: profileAvatar,
                title: repairCard.title,
                description,
                category,
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
            setError(nextError?.message || "Could not post this need. Please try again.");
        } finally {
            setPosting(false);
        }
    };

    const renderStep = () => {
        if (step === 0) {
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 1 of 4</p>
                    <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">What do you need help with?</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64748b]">Choose a category. Local businesses will compete to give you the best offer.</p>
                    <div className="mt-7 grid gap-4 sm:grid-cols-3">
                        {categoryOptions.map((option) => {
                            const Icon = option.icon;
                            const active = category === option.value;
                            return (
                                <button key={option.value} type="button"
                                    onClick={() => { setCategory(option.value as any); setIssueType(""); setServicePreference(""); setBudget(""); }}
                                    className={`min-h-[140px] rounded-2xl border p-6 text-left transition ${active ? "border-[#0a8f45] bg-[#f0fbf4] ring-4 ring-[#e9f9f0]" : "border-[#dfe8e3] bg-white hover:border-[#9bd6b2]"}`}
                                >
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${option.tone}`}><Icon size={24} /></div>
                                    <p className="mt-5 text-lg font-black text-[#06111f]">{option.label}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>
            );
        }

        if (step === 1) {
            const options = category === "Food Service & Delivery" ? foodIssueOptions : category === "Home Service" ? homeIssueOptions : issueOptions;
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 2 of 4</p>
                    <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">
                        {category === "Food Service & Delivery" ? "What would you like to order?" : category === "Home Service" ? "What's the issue?" : "What's wrong with your device?"}
                    </h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-[#64748b]">
                        {category === "Food Service & Delivery" ? "Select a type, add items and special instructions." : category === "Home Service" ? "Pick a service type and describe the problem." : "Select the issue, add phone details, and upload a photo."}
                    </p>
                    <div className="mt-7 grid gap-3 grid-cols-2 sm:grid-cols-3 xl:grid-cols-4">
                        {options.map((option) => {
                            const Icon = option.icon;
                            const active = issueType === option.value;
                            return (
                                <button key={option.value} type="button" onClick={() => setIssueType(option.value)}
                                    className={`min-h-[90px] rounded-2xl border p-4 text-left transition ${active ? "border-[#0a8f45] bg-[#f0fbf4] ring-4 ring-[#e9f9f0]" : "border-[#dfe8e3] bg-white hover:border-[#9bd6b2]"}`}
                                >
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${option.tone}`}><Icon size={18} /></div>
                                    <p className="mt-3 text-xs font-black text-[#06111f]">{option.label}</p>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                        {category === "Mobile Repair" && (
                            <>
                                <label><span className={labelClass}>Phone brand</span>
                                    <select value={phoneBrand} onChange={(event) => setPhoneBrand(event.target.value)} className={inputClass}>
                                        {brandOptions.map((option) => (<option key={option}>{option}</option>))}
                                    </select>
                                </label>
                                <label><span className={labelClass}>Model (optional)</span>
                                    <input value={phoneModel} onChange={(event) => setPhoneModel(event.target.value)} className={inputClass} placeholder="iPhone 13, Redmi Note 12..." />
                                </label>
                            </>
                        )}
                        <label className="md:col-span-2">
                            <span className={labelClass}>{category === "Food Service & Delivery" ? "Order list / special instructions" : category === "Home Service" ? "Describe the problem" : "Describe the issue"}</span>
                            <textarea value={issueDescription} onChange={(event) => setIssueDescription(event.target.value)}
                                className={`${inputClass} min-h-[120px] resize-y`}
                                placeholder={category === "Food Service & Delivery" ? "e.g. 2x Chicken Momos, 1x Coke 500ml, deliver to Thapathali" : category === "Home Service" ? "e.g. Leaking pipe in kitchen, need plumber urgently" : "e.g. Screen cracked, touch still works, need repair today"}
                            />
                        </label>
                    </div>
                    <label className="mt-5 block cursor-pointer rounded-2xl border border-dashed border-[#bdddc8] bg-[#fbfdfb] p-5 transition hover:border-[#0a8f45]">
                        <input type="file" accept="image/*,video/*,application/pdf,.pdf" onChange={handleMedia} className="hidden" />
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]"><UploadCloud size={20} /></div>
                            <div>
                                <p className="text-sm font-black text-[#06111f]">{category === "Food Service & Delivery" ? "Upload food or menu photo" : category === "Home Service" ? "Upload photo of the issue" : "Upload photo of the damage"}</p>
                                <p className="mt-1 text-xs text-[#64748b]">Optional — helps businesses quote accurately</p>
                            </div>
                        </div>
                        {uploadedMedia ? <UploadedMediaPreview media={uploadedMedia} /> : null}
                    </label>
                </section>
            );
        }

        if (step === 2) {
            const preferences = category === "Food Service & Delivery" ? foodPreferences : category === "Home Service" ? homePreferences : servicePreferences;
            return (
                <section>
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 3 of 4</p>
                    <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">How, where & when?</h1>
                    <p className="mt-3 text-sm leading-7 text-[#64748b]">Set your preference, budget, and location so businesses can send relevant offers.</p>
                    <p className="mt-7 text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">Service preference</p>
                    <div className="mt-3 grid gap-3 grid-cols-2 md:grid-cols-4">
                        {preferences.map((option) => {
                            const active = servicePreference === option;
                            return (
                                <button type="button" key={option} onClick={() => setServicePreference(option)}
                                    className={`rounded-2xl border px-4 py-3 text-left transition ${active ? "border-[#0a8f45] bg-[#f0fbf4] ring-4 ring-[#e9f9f0]" : "border-[#dfe8e3] bg-white hover:border-[#9bd6b2]"}`}
                                ><p className="text-xs font-black text-[#06111f]">{option}</p></button>
                            );
                        })}
                    </div>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <label><span className={labelClass}>Expected budget</span>
                            <input value={budget} onChange={(event) => setBudget(event.target.value)} className={inputClass} placeholder="NPR 1,500 or Open for quotes" />
                        </label>
                        <label><span className={labelClass}>Urgency</span>
                            <select value={urgency} onChange={(event) => setUrgency(event.target.value)} className={inputClass}>
                                {urgencyOptions.map((option) => (<option key={option}>{option}</option>))}
                            </select>
                        </label>
                    </div>
                    <p className="mt-7 text-xs font-black uppercase tracking-[0.12em] text-[#64748b]">Your location</p>
                    <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <label><span className={labelClass}>Country</span>
                            <select value={countryCode} onChange={(event) => { setCountryCode(event.target.value); setStateCode(""); setCity(""); }} className={inputClass}>
                                {countries.map((country) => (<option key={country.isoCode} value={country.isoCode}>{country.flag} {country.name}</option>))}
                            </select>
                        </label>
                        <label><span className={labelClass}>State / province</span>
                            <select value={stateCode} onChange={(event) => setStateCode(event.target.value)} className={inputClass} disabled={!countryCode}>
                                <option value="">Select state</option>
                                {states.map((state) => (<option key={state.isoCode} value={state.isoCode}>{state.name}</option>))}
                            </select>
                        </label>
                        <label><span className={labelClass}>City</span>
                            <select value={city} onChange={(event) => setCity(event.target.value)} className={inputClass} disabled={!countryCode}>
                                <option value="">Select city</option>
                                {cities.map((option) => (<option key={`${option.name}-${option.latitude}-${option.longitude}`} value={option.name}>{option.name}</option>))}
                            </select>
                        </label>
                        <label><span className={labelClass}>Area</span>
                            <input value={area} onChange={(event) => setArea(event.target.value)} className={inputClass} placeholder="Thapathali, New Road, Baneshwor..." />
                        </label>
                        <label><span className={labelClass}>Exact address (optional)</span>
                            <input value={exactAddress} onChange={(event) => setExactAddress(event.target.value)} className={inputClass} placeholder="Share after choosing a business" />
                        </label>
                    </div>
                    <div className="mt-5 rounded-2xl border border-[#dfe8e3] bg-white p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-start gap-3">
                                <div className="rounded-2xl bg-[#06111f] p-3 text-white"><MapPin size={20} /></div>
                                <div>
                                    <p className="font-black text-[#06111f]">Map pin (optional)</p>
                                    <p className="mt-1 text-sm leading-6 text-[#64748b]">{pinPoint?.address || "Pin for pickup, delivery, or home service navigation."}</p>
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
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0a8f45]">Step 4 of 4</p>
                <h1 className="mt-3 text-3xl font-black text-[#06111f] md:text-5xl">Review your Need.</h1>
                <p className="mt-3 text-sm leading-7 text-[#64748b]">Businesses will send price, time, and service details in their Offers.</p>
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
                            Back to my service requests
                        </Link>
                        <div className="rounded-full border border-[#dfe8e3] bg-white px-4 py-2 text-xs font-black text-[#0a8f45]">
                            Service Marketplace MVP
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
                                    <p className="mt-1 text-sm leading-6 text-amber-800">Verify your phone number with SMS OTP before posting a new need.</p>
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
                                            {profile?.phoneVerified ? `Post ${category} Need` : "Verify phone first"}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <aside className="border-t border-[#dfe8e3] bg-[#fbfdfb] p-5 lg:border-l lg:border-t-0">
                                <div className="sticky top-20 rounded-[22px] border border-[#dfe8e3] bg-white p-5 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#94a3b8]">Live preview</p>
                                            <h2 className="mt-2 text-xl font-black text-[#06111f]">{category} Card</h2>
                                        </div>
                                        {category === "Food Service & Delivery" ? <ShoppingBag size={22} className="text-[#be185d]" /> : category === "Home Service" ? <Home size={22} className="text-[#2563eb]" /> : <Smartphone size={22} className="text-[#0a8f45]" />}
                                    </div>
                                    <NeedPreview compact card={repairCard} location={locationString} urgency={urgency} budget={budget} media={uploadedMedia} pinPoint={pinPoint} />
                                </div>
                                <div className="mt-4 rounded-[22px] border border-[#dfe8e3] bg-white p-5">
                                    <p className="font-black text-[#06111f]">What happens next?</p>
                                    <div className="mt-4 space-y-3 text-sm leading-6 text-[#64748b]">
                                        <p>1. Verified businesses see this request.</p>
                                        <p>2. Businesses send price, time, and service details.</p>
                                        <p>3. You compare Offers and choose the best business.</p>
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
