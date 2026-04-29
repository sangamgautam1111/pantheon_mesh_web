"use client";

import Link from "next/link";
import {
    Briefcase,
    CheckCircle2,
    CreditCard,
    MapPin,
    MessageSquare,
    ShieldCheck,
    Store,
    UserRound,
    Edit,
    X,
    UploadCloud,
    Globe,
    type LucideIcon,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Country, State, City } from "country-state-city";

const DeliveryMap = dynamic(() => import("@/components/profile/DeliveryMap"), { 
    ssr: false,
    loading: () => <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm"><div className="bg-white p-8 rounded-3xl font-black animate-pulse">LOADING MAP SYSTEM...</div></div>
});

interface ICountry {
    name: string;
    isoCode: string;
    phonecode: string;
    flag: string;
}

// Removed hardcoded countryDialCodes in favor of country-state-city package

type ChecklistItem = {
    label: string;
    done: boolean;
    weight: number;
};

function completion(items: ChecklistItem[]) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    const done = items.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
}

function ProgressCard({
    title,
    message,
    items,
}: {
    title: string;
    message: string;
    items: ChecklistItem[];
}) {
    const percent = completion(items);

    return (
        <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">
                        Profile completion
                    </p>
                    <h2 className="mt-2 text-2xl font-black">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
                </div>
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-white">
                    <p className="text-2xl font-black">{percent}%</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/50">complete</p>
                </div>
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-slate-950" style={{ width: `${percent}%` }} />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                    <div key={item.label} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 size={18} className={item.done ? "text-slate-950" : "text-slate-300"} />
                            <p className="text-sm font-bold">{item.label}</p>
                        </div>
                        <span className="text-xs font-black text-slate-400">+{item.weight}%</span>
                    </div>
                ))}
            </div>
        </section>
    );
}

function InfoTile({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <Icon size={20} />
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{label}</p>
            <p className="mt-2 text-sm font-black leading-6 truncate">{value}</p>
        </div>
    );
}

export default function ProfilePage() {
    const { profile, accountType, updateUserProfile } = useAuth();
    const isBusiness = accountType === "business";
    const displayName = profile?.displayName || (isBusiness ? "Local Business" : "Customer");
    const email = profile?.email || "Email not added";
    const photo = profile?.photoURL || "";
    const businessName = profile?.companyName || displayName;
    const plan = profile?.currentPlanId || "free";
    
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [editForm, setEditForm] = useState({
        displayName: profile?.displayName || "",
        companyName: profile?.companyName || "",
        photoURL: profile?.photoURL || "",
        dialCode: profile?.phoneNumber?.split(" ")[0] || "+977",
        phoneNumberRaw: profile?.phoneNumber?.split(" ").slice(1).join(" ") || "",
        country: profile?.country || "",
        countryCode: profile?.countryCode || "",
        state: profile?.state || "",
        stateCode: profile?.stateCode || "",
        city: profile?.city || "",
        area: profile?.area || "",
        currency: "USD",
        currentAddress: profile?.currentAddress || "",
        category: profile?.category || "",
        openingHours: profile?.openingHours || "",
        services: profile?.services || "",
        warrantyPolicy: profile?.warrantyPolicy || "",
        deliveryAddress: profile?.deliveryAddress || "",
        deliveryCoords: profile?.deliveryCoords || null as {lat: number, lng: number} | null,
        manualLocation: false,
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Sync form with profile when it loads or changes
    useEffect(() => {
        if (!isEditing && profile) {
            setEditForm({
                displayName: profile.displayName || "",
                companyName: profile.companyName || "",
                photoURL: profile.photoURL || "",
                dialCode: profile.phoneNumber?.split(" ")[0] || "+977",
                phoneNumberRaw: profile.phoneNumber?.split(" ").slice(1).join(" ") || "",
                country: profile.country || "",
                countryCode: profile.countryCode || "",
                state: profile.state || "",
                stateCode: profile.stateCode || "",
                city: profile.city || "",
                area: profile.area || "",
                currency: profile.currency || "USD",
                currentAddress: profile.currentAddress || "",
                category: profile.category || "",
                openingHours: profile.openingHours || "",
                services: profile.services || "",
                warrantyPolicy: profile.warrantyPolicy || "",
                deliveryAddress: profile.deliveryAddress || "",
                deliveryCoords: profile.deliveryCoords || null,
                manualLocation: false,
            });
        }
    }, [profile, isEditing]);

    // Auto-detection state
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState<{country: string, countryCode: string, city: string, currency: string} | null>(null);
    const [hasPromptedLocation, setHasPromptedLocation] = useState(false);
    const [isChangingCountry, setIsChangingCountry] = useState(false);

    const countries = Country.getAllCountries();
    const [states, setStates] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);

    const topCountryCode = profile?.countryCode || detectedLocation?.countryCode || "US";
    const sortedCountries = [...countries].sort((a, b) => a.name.localeCompare(b.name));
    const displayCountries = [...sortedCountries];
    if (topCountryCode) {
        const idx = displayCountries.findIndex(c => c.isoCode === topCountryCode);
        if (idx !== -1) {
            const [top] = displayCountries.splice(idx, 1);
            displayCountries.unshift(top);
        }
    }

    useEffect(() => {
        if (profile && !profile.country && !hasPromptedLocation) {
            fetch("https://ipapi.co/json/")
                .then(res => res.json())
                .then(data => {
                    if (data.country_name) {
                        const foundCountry = countries.find(c => c.name === data.country_name);
                        setDetectedLocation({
                            country: data.country_name,
                            countryCode: foundCountry?.isoCode || "",
                            city: data.city || "",
                            currency: "USD"
                        });
                        setShowLocationPrompt(true);
                    }
                })
                .catch(() => console.log("Location auto-detect blocked or failed"))
                .finally(() => setHasPromptedLocation(true));
        }
    }, [profile, hasPromptedLocation, countries]);

    // Load states when country changes
    useEffect(() => {
        if (editForm.countryCode) {
            setStates(State.getStatesOfCountry(editForm.countryCode));
        } else {
            setStates([]);
        }
    }, [editForm.countryCode]);

    // Load cities when state changes
    useEffect(() => {
        if (editForm.countryCode && editForm.stateCode) {
            const stateCities = City.getCitiesOfState(editForm.countryCode, editForm.stateCode);
            if (stateCities.length > 0) {
                setCities(stateCities);
            } else {
                setCities(City.getCitiesOfCountry(editForm.countryCode) || []);
            }
        } else if (editForm.countryCode) {
            setCities(City.getCitiesOfCountry(editForm.countryCode) || []);
        } else {
            setCities([]);
        }
    }, [editForm.countryCode, editForm.stateCode]);

    const resizeProfilePhoto = (file: File) =>
        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = () => reject(new Error("Could not read image."));
            reader.onload = () => {
                const image = new Image();
                image.onerror = () => reject(new Error("Could not load image."));
                image.onload = () => {
                    const maxSize = 384;
                    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
                    const width = Math.max(1, Math.round(image.width * scale));
                    const height = Math.max(1, Math.round(image.height * scale));
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const context = canvas.getContext("2d");
                    if (!context) {
                        reject(new Error("Could not prepare image."));
                        return;
                    }
                    context.drawImage(image, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg", 0.82));
                };
                image.src = String(reader.result || "");
            };
            reader.readAsDataURL(file);
        });

    // Handle photo upload as a compressed data URL so refreshes do not restore broken Firebase Auth photo values.
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            void resizeProfilePhoto(file)
                .then((photoURL) => setEditForm(prev => ({ ...prev, photoURL })))
                .catch(() => alert("Could not process this image. Please try another photo."));
        }
    };

    // Initialize edit form whenever modal opens or profile changes
    useEffect(() => {
        if (profile) {
            setEditForm(prev => ({
                ...prev,
                displayName: profile.displayName || "",
                companyName: profile.companyName || "",
                photoURL: profile.photoURL || "",
                dialCode: profile.phoneNumber?.split(" ")[0] || prev.dialCode,
                phoneNumberRaw: profile.phoneNumber?.split(" ").slice(1).join(" ") || prev.phoneNumberRaw,
                country: profile.country || prev.country,
                countryCode: profile.countryCode || prev.countryCode,
                state: profile.state || prev.state,
                stateCode: profile.stateCode || prev.stateCode,
                city: profile.city || prev.city,
                area: profile.area || prev.area,
                currency: profile.currency || prev.currency,
                currentAddress: profile.currentAddress || prev.currentAddress,
                category: profile.category || "",
                openingHours: profile.openingHours || "",
                services: profile.services || "",
                warrantyPolicy: profile?.warrantyPolicy || "",
                deliveryAddress: profile.deliveryAddress || "",
                deliveryCoords: profile.deliveryCoords || null,
            }));
        }
    }, [profile, isEditing]);

    const handleConfirmLocation = async () => {
        if (!detectedLocation) return;
        await updateUserProfile({
            country: detectedLocation.country,
            countryCode: detectedLocation.countryCode,
            city: detectedLocation.city,
            currency: detectedLocation.currency,
        });
        setShowLocationPrompt(false);
    };


    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            const finalPhoneNumber = editForm.phoneNumberRaw.trim() ? `${editForm.dialCode} ${editForm.phoneNumberRaw}` : "";
            await updateUserProfile({
                ...editForm,
                phoneNumber: finalPhoneNumber,
            });
            setSaveSuccess(true);
            setTimeout(() => {
                setIsEditing(false);
                setSaveSuccess(false);
            }, 1500);
        } catch (error) {
            console.error("Failed to update profile", error);
            alert("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const customerChecklist: ChecklistItem[] = [
        { label: "Add profile photo", done: Boolean(photo), weight: 15 },
        { label: "Verify phone number", done: Boolean(profile?.phoneNumber), weight: 20 },
        { label: "Add country & city", done: Boolean(profile?.country && profile?.city), weight: 15 },
        { label: "Add current address", done: Boolean(profile?.currentAddress), weight: 15 },
        { label: "Add email", done: Boolean(profile?.email), weight: 15 },
        { label: "Complete first Need", done: false, weight: 20 },
    ];

    const businessChecklist: ChecklistItem[] = [
        { label: "Add business logo", done: Boolean(photo), weight: 10 },
        { label: "Add business name", done: Boolean(businessName), weight: 10 },
        { label: "Add category", done: Boolean(profile?.category), weight: 10 },
        { label: "Add service area/location", done: Boolean(profile?.country && profile?.city), weight: 15 },
        { label: "Add opening hours", done: Boolean(profile?.openingHours), weight: 10 },
        { label: "Add services/products", done: Boolean(profile?.services), weight: 15 },
        { label: "Add warranty policy", done: Boolean(profile?.warrantyPolicy), weight: 10 },
        { label: "Verify phone", done: Boolean(profile?.phoneNumber), weight: 10 },
        { label: "Verify email", done: Boolean(profile?.email), weight: 10 },
    ];

    const locationDisplay = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "No location set";

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#f8f7f2] px-4 py-6 text-slate-950 md:px-8">
                <div className="mx-auto max-w-7xl">
                    <section className="rounded-[34px] border border-slate-200 bg-white p-7 shadow-xl md:p-10 relative">
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            <Edit size={20} />
                        </button>

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-center gap-5">
                                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-[28px] bg-slate-950 text-3xl font-black text-white">
                                    {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : displayName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-slate-400">
                                        {isBusiness ? "Business Profile" : "Customer Profile"}
                                    </p>
                                    <h1 className="mt-2 text-4xl font-black tracking-tight md:text-6xl">
                                        {isBusiness ? businessName : displayName}
                                    </h1>
                                    <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold text-slate-600">
                                        {profile?.country && (
                                            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                                                <Globe size={14} className="text-slate-400" /> {profile.country}
                                            </span>
                                        )}
                                        {profile?.currency && (
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-800">
                                                $ {profile.currency}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={isBusiness ? "/marketplace" : "/client/new"}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white"
                            >
                                {isBusiness ? <Briefcase size={17} /> : <MessageSquare size={17} />}
                                {isBusiness ? "Browse Needs" : "Post a Need"}
                            </Link>
                        </div>
                    </section>

                    <section className="mt-6 grid gap-4 md:grid-cols-4">
                        <InfoTile icon={UserRound} label="Basic info" value={`${displayName} - ${email}`} />
                        <InfoTile icon={MapPin} label="Location" value={locationDisplay} />
                        <InfoTile icon={ShieldCheck} label="Trust" value={profile?.email || profile?.phoneNumber ? "Contact ready" : "Verify phone/email"} />
                        <InfoTile icon={CreditCard} label={isBusiness ? "Subscription" : "Payments later"} value={isBusiness ? plan : "Saved cards and refunds later"} />
                    </section>

                    <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
                        <ProgressCard
                            title={isBusiness ? "Business Profile" : "Profile"}
                            message={isBusiness
                                ? "Better profile equals more trust, better ranking, and more selected Bookings."
                                : "Keep it light. Add only the information that helps businesses quote safely."}
                            items={isBusiness ? businessChecklist : customerChecklist}
                        />

                        {isBusiness ? (
                            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Mini website preview</p>
                                        <h2 className="mt-2 text-2xl font-black">{businessName}</h2>
                                        <p className="mt-2 text-sm font-semibold text-slate-500">Verified-ready profile after checklist completion</p>
                                    </div>
                                    <Store size={28} />
                                </div>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {["Verified badge", "4.8 rating later", "1.2 km away later", "96% on-time later"].map((item) => (
                                        <span key={item} className="rounded-full bg-slate-100 px-4 py-2 text-xs font-black text-slate-700">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                                <div className="mt-6 grid gap-3 md:grid-cols-3">
                                    {[
                                        ["Overview", profile?.openingHours ? `Hours: ${profile.openingHours}` : "Description, location, hours"],
                                        ["Services", profile?.category || "Service menu and starting prices"],
                                        ["Products", profile?.services || "Accessories and local products"],
                                        ["Reviews", "Customer feedback"],
                                        ["Offers", "Active Quotes by this business"],
                                        ["Trust", profile?.warrantyPolicy ? `Warranty: ${profile.warrantyPolicy}` : "Verification, warranty, on-time score"],
                                    ].map(([title, copy]) => (
                                        <div key={title} className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm font-black">{title}</p>
                                            <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <section className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-400">Customer workspace</p>
                                <h2 className="mt-2 text-2xl font-black">Simple profile, safer Offers.</h2>
                                <div className="mt-6 grid gap-3 md:grid-cols-2">
                                    {[
                                        ["My Needs", "Active, completed, and cancelled Needs"],
                                        ["Orders / Bookings", "Booked local services and products"],
                                        ["Reviews", "Reviews given to businesses"],
                                        ["Safety", "Hidden contact settings and reports"],
                                    ].map(([title, copy]) => (
                                        <div key={title} className="rounded-2xl bg-slate-50 p-4">
                                            <p className="text-sm font-black">{title}</p>
                                            <p className="mt-2 text-xs leading-5 text-slate-500">{copy}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Location Detection Modal */}
                {showLocationPrompt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
                                <MapPin size={28} className="text-slate-900" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Location Detected</h2>
                            
                            {!isChangingCountry ? (
                                <>
                                    <p className="text-slate-600 mb-6">
                                        We detected <strong className="text-slate-900">{detectedLocation?.country}</strong>. Is this correct?
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={handleConfirmLocation}
                                            className="w-full rounded-xl bg-slate-950 px-4 py-4 font-bold text-white transition-colors hover:bg-slate-800"
                                        >
                                            Yes, continue
                                        </button>
                                        <button 
                                            onClick={() => setIsChangingCountry(true)}
                                            className="w-full rounded-xl bg-slate-100 px-4 py-4 font-bold text-slate-900 transition-colors hover:bg-slate-200"
                                        >
                                            Change country
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-slate-600 mb-4">Select your primary country</p>
                                    <select 
                                        className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 mb-6"
                                        onChange={(e) => {
                                            const selected = countries.find(c => c.name === e.target.value);
                                            if (selected) {
                                                setDetectedLocation({ country: selected.name, countryCode: selected.isoCode, city: "", currency: "USD" });
                                            }
                                        }}
                                        defaultValue={detectedLocation?.country || ""}
                                    >
                                        <option value="" disabled>Select Country</option>
                                        {displayCountries.map(c => <option key={c.isoCode} value={c.name}>{c.flag} {c.name}</option>)}
                                    </select>
                                    <div className="flex flex-col gap-3">
                                        <button 
                                            onClick={handleConfirmLocation}
                                            className="w-full rounded-xl bg-slate-950 px-4 py-4 font-bold text-white transition-colors hover:bg-slate-800"
                                        >
                                            Save Country
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Edit Profile Modal */}
                {isEditing && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-3xl font-black">Edit {isBusiness ? "Business" : "Customer"} Profile</h2>
                                <button onClick={() => setIsEditing(false)} className="rounded-full p-2 hover:bg-slate-100">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Profile Photo Upload */}
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                    <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-200 flex items-center justify-center">
                                        {editForm.photoURL ? (
                                            <img src={editForm.photoURL} alt="Profile" className="h-full w-full object-cover" />
                                        ) : (
                                            <UserRound size={24} className="text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold">Profile Photo</p>
                                        <p className="text-xs text-slate-500 mb-2">Upload from device gallery</p>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            onChange={handlePhotoUpload}
                                        />
                                        <button 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 rounded-lg bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-300 transition-colors"
                                        >
                                            <UploadCloud size={14} />
                                            Choose Image
                                        </button>
                                    </div>
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {isBusiness ? (
                                        <>
                                            <div>
                                                <label className="text-sm font-bold text-slate-700">Business Name</label>
                                                <input 
                                                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                                    value={editForm.companyName} 
                                                    onChange={(e) => setEditForm({...editForm, companyName: e.target.value})} 
                                                    placeholder="Your Company Name"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-slate-700">Category</label>
                                                <input 
                                                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                                    value={editForm.category} 
                                                    onChange={(e) => setEditForm({...editForm, category: e.target.value})} 
                                                    placeholder="e.g. Plumber, Electrician"
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                                            <input 
                                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                                value={editForm.displayName} 
                                                onChange={(e) => setEditForm({...editForm, displayName: e.target.value})} 
                                                placeholder="Your Name"
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-bold text-slate-700">Country</label>
                                        <select 
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                            value={editForm.countryCode}
                                            onChange={(e) => {
                                                const c = countries.find(x => x.isoCode === e.target.value);
                                                if (c) {
                                                    setEditForm({
                                                        ...editForm, 
                                                        country: c.name, 
                                                        countryCode: c.isoCode,
                                                        state: "",
                                                        stateCode: "",
                                                        city: "",
                                                        currency: "USD", 
                                                        dialCode: `+${c.phonecode}`
                                                    });
                                                }
                                            }}
                                        >
                                            <option value="" disabled>Select Country</option>
                                            {displayCountries.map(c => <option key={c.isoCode} value={c.isoCode}>{c.flag} {c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">State / Province</label>
                                        <select 
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 disabled:bg-slate-50"
                                            value={editForm.stateCode}
                                            disabled={!editForm.countryCode}
                                            onChange={(e) => {
                                                const s = states.find(x => x.isoCode === e.target.value);
                                                if (s) {
                                                    setEditForm({...editForm, state: s.name, stateCode: s.isoCode, city: ""});
                                                }
                                            }}
                                        >
                                            <option value="">Select State</option>
                                            {states.map(s => <option key={s.isoCode} value={s.isoCode}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-700">City</label>
                                            <button 
                                                type="button"
                                                onClick={() => setEditForm({...editForm, manualLocation: !editForm.manualLocation})}
                                                className="text-[10px] font-black text-slate-400 uppercase hover:text-slate-900"
                                            >
                                                {editForm.manualLocation ? "Use List" : "Manual Entry"}
                                            </button>
                                        </div>
                                        {editForm.manualLocation ? (
                                            <input 
                                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950"
                                                value={editForm.city}
                                                onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                                                placeholder="Enter City Name"
                                            />
                                        ) : (
                                            <select 
                                                className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 disabled:bg-slate-50"
                                                value={editForm.city}
                                                disabled={!editForm.countryCode}
                                                onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                                            >
                                                <option value="">Select City</option>
                                                {cities.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                                            </select>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-slate-700">Area</label>
                                        <input 
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                            value={editForm.area} 
                                            onChange={(e) => setEditForm({...editForm, area: e.target.value})} 
                                            placeholder="e.g. New Road"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700">Phone Number</label>
                                        <div className="mt-1 flex gap-2">
                                            <select 
                                                className="w-1/3 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 text-xs"
                                                value={editForm.dialCode}
                                                onChange={(e) => setEditForm({...editForm, dialCode: e.target.value})}
                                            >
                                                {displayCountries.map(c => (
                                                    <option key={c.isoCode} value={`+${c.phonecode}`}>{c.flag} {c.name} (+{c.phonecode})</option>
                                                ))}
                                            </select>
                                            <input 
                                                className="w-2/3 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                                value={editForm.phoneNumberRaw} 
                                                onChange={(e) => setEditForm({...editForm, phoneNumberRaw: e.target.value})} 
                                                placeholder="98XXXXXXXX"
                                                type="tel"
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700">Current Address</label>
                                        <p className="text-[10px] text-slate-500 mb-1">Detected or entered automatically for precise fetching</p>
                                        <input 
                                            className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                            value={editForm.currentAddress} 
                                            onChange={(e) => setEditForm({...editForm, currentAddress: e.target.value})} 
                                            placeholder="e.g. 123 Main St, Area 4"
                                        />
                                    </div>

                                    {isBusiness && (
                                        <>
                                            <div>
                                                <label className="text-sm font-bold text-slate-700">Opening Hours</label>
                                                <input 
                                                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                                    value={editForm.openingHours} 
                                                    onChange={(e) => setEditForm({...editForm, openingHours: e.target.value})} 
                                                    placeholder="Mon-Fri 9AM-5PM"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-slate-700">Warranty Policy</label>
                                                <input 
                                                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                                    value={editForm.warrantyPolicy} 
                                                    onChange={(e) => setEditForm({...editForm, warrantyPolicy: e.target.value})} 
                                                    placeholder="e.g. 30 days guarantee"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="text-sm font-bold text-slate-700">Services & Products</label>
                                                <textarea 
                                                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950" 
                                                    rows={3}
                                                    value={editForm.services} 
                                                    onChange={(e) => setEditForm({...editForm, services: e.target.value})} 
                                                    placeholder="Describe your services and starting prices..."
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="md:col-span-2 border-t border-slate-100 pt-4 mt-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-sm font-bold text-slate-700">
                                                {isBusiness ? "Precise Business Location" : "Precise Delivery Location"}
                                            </label>
                                            <button 
                                                type="button"
                                                onClick={() => setIsMapOpen(true)}
                                                className="text-xs font-black text-slate-950 flex items-center gap-1 hover:underline"
                                            >
                                                <MapPin size={14} />
                                                {editForm.deliveryCoords ? "Change on Map" : "Pin on Map"}
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <input 
                                                className="flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-slate-950 bg-slate-50 text-sm" 
                                                value={editForm.deliveryAddress} 
                                                onChange={(e) => setEditForm({...editForm, deliveryAddress: e.target.value})} 
                                                placeholder={isBusiness ? "Search or pin your business location..." : "Search or pin on map for precise delivery..."}
                                            />
                                        </div>
                                        {editForm.deliveryCoords && (
                                            <p className="mt-2 text-[10px] font-bold text-slate-950">
                                                Coordinates saved: {editForm.deliveryCoords.lat.toFixed(6)}, {editForm.deliveryCoords.lng.toFixed(6)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <button 
                                    onClick={handleSave}
                                    disabled={isSaving || saveSuccess}
                                    className={`mt-6 w-full rounded-xl px-4 py-4 font-bold text-white transition-all ${
                                        saveSuccess ? "bg-slate-700" : "bg-slate-950 hover:bg-slate-800"
                                    } disabled:bg-slate-400`}
                                >
                                    {isSaving ? "Saving..." : saveSuccess ? "Profile Updated!" : "Save Profile"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isMapOpen && (
                    <DeliveryMap 
                        initialCoords={editForm.deliveryCoords}
                        initialAddress={editForm.deliveryAddress}
                        onClose={() => setIsMapOpen(false)}
                        onSelect={(data) => {
                            setEditForm({
                                ...editForm,
                                deliveryAddress: data.address,
                                deliveryCoords: data.coords
                            });
                            setIsMapOpen(false);
                        }}
                    />
                )}
            </main>
        </RouteGuard>
    );
}
