"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
    AtSign,
    Bell,
    Briefcase,
    Camera,
    Check,
    CheckCircle2,
    ChevronRight,
    CreditCard,
    Edit,
    Eye,
    Globe,
    Lock,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    UploadCloud,
    UserRound,
    X,
    type LucideIcon,
} from "lucide-react";
import { Country, State, City } from "country-state-city";
import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type ReactNode,
} from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";

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

type ChecklistItem = {
    label: string;
    done: boolean;
    weight: number;
    tab: EditTab;
};

type EditTab = "general" | "contact" | "address" | "preferences" | "security";

type LocationDetection = {
    country: string;
    countryCode: string;
    city: string;
    currency: string;
};

type ProfileForm = {
    displayName: string;
    companyName: string;
    username: string;
    photoURL: string;
    dialCode: string;
    phoneNumberRaw: string;
    country: string;
    countryCode: string;
    state: string;
    stateCode: string;
    city: string;
    area: string;
    currency: string;
    currentAddress: string;
    category: string;
    openingHours: string;
    services: string;
    warrantyPolicy: string;
    deliveryAddress: string;
    deliveryCoords: { lat: number; lng: number } | null;
    preferredServiceMethod: string;
    language: string;
    shortBio: string;
    emailNotifications: boolean;
    smsNotifications: boolean;
    manualLocation: boolean;
};

const emptyForm: ProfileForm = {
    displayName: "",
    companyName: "",
    username: "",
    photoURL: "",
    dialCode: "+977",
    phoneNumberRaw: "",
    country: "",
    countryCode: "",
    state: "",
    stateCode: "",
    city: "",
    area: "",
    currency: "USD",
    currentAddress: "",
    category: "",
    openingHours: "",
    services: "",
    warrantyPolicy: "",
    deliveryAddress: "",
    deliveryCoords: null,
    preferredServiceMethod: "In person or online",
    language: "English",
    shortBio: "",
    emailNotifications: true,
    smsNotifications: true,
    manualLocation: false,
};

const tabItems: Array<{ key: EditTab; label: string; icon: LucideIcon }> = [
    { key: "general", label: "General", icon: UserRound },
    { key: "contact", label: "Contact", icon: Phone },
    { key: "address", label: "Address", icon: MapPin },
    { key: "preferences", label: "Preferences", icon: Sparkles },
    { key: "security", label: "Security", icon: Lock },
];

const currencyOptions = [
    { value: "USD", label: "USD - US Dollar" },
    { value: "NPR", label: "NPR - Nepalese Rupee" },
    { value: "INR", label: "INR - Indian Rupee" },
    { value: "EUR", label: "EUR - Euro" },
    { value: "GBP", label: "GBP - British Pound" },
];

const languageOptions = ["English", "Nepali", "Hindi", "Spanish", "French"];
const serviceMethodOptions = ["In person or online", "In person only", "Online only", "Pickup / delivery"];

const inputClass =
    "mt-1 w-full rounded-xl border border-[#dfe8e3] bg-white px-3.5 py-3 text-sm font-semibold text-[#06111f] outline-none transition focus:border-[#0a8f45] focus:ring-4 focus:ring-[#e9f9f0] disabled:bg-[#f8faf9] disabled:text-[#94a3b8]";

const labelClass = "text-xs font-black uppercase tracking-[0.12em] text-[#64748b]";

function completion(items: ChecklistItem[]) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    const done = items.reduce((sum, item) => sum + (item.done ? item.weight : 0), 0);
    return total > 0 ? Math.round((done / total) * 100) : 0;
}

function parsePhoneNumber(phoneNumber?: string | null) {
    const phone = phoneNumber?.trim() || "";
    if (!phone) {
        return { dialCode: "+977", phoneNumberRaw: "" };
    }
    const match = phone.match(/^(\+\d[\d-]*)\s*(.*)$/);
    return {
        dialCode: match?.[1] || "+977",
        phoneNumberRaw: match?.[2] || phone,
    };
}

function usernameFromProfile(displayName?: string | null, email?: string | null) {
    const base = displayName || email?.split("@")[0] || "needero-user";
    return base.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\.|\.$)/g, "");
}

function formFromProfile(profile: ReturnType<typeof useAuth>["profile"], isBusiness: boolean): ProfileForm {
    if (!profile) return emptyForm;
    const parsedPhone = parsePhoneNumber(profile.phoneNumber);
    return {
        ...emptyForm,
        displayName: profile.displayName || "",
        companyName: profile.companyName || (isBusiness ? profile.displayName || "" : ""),
        username: profile.username || usernameFromProfile(profile.displayName, profile.email),
        photoURL: profile.photoURL || "",
        dialCode: parsedPhone.dialCode,
        phoneNumberRaw: parsedPhone.phoneNumberRaw,
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
        preferredServiceMethod: profile.preferredServiceMethod || "In person or online",
        language: profile.language || "English",
        shortBio: profile.shortBio || "",
        emailNotifications: profile.emailNotifications ?? true,
        smsNotifications: profile.smsNotifications ?? true,
        manualLocation: false,
    };
}

function resizeProfilePhoto(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read image."));
        reader.onload = () => {
            const image = new Image();
            image.onerror = () => reject(new Error("Could not load image."));
            image.onload = () => {
                const maxSize = 480;
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
                resolve(canvas.toDataURL("image/jpeg", 0.84));
            };
            image.src = String(reader.result || "");
        };
        reader.readAsDataURL(file);
    });
}

function ProgressRing({ percent, size = "large" }: { percent: number; size?: "small" | "large" }) {
    const isSmall = size === "small";
    return (
        <div
            className={`${isSmall ? "h-16 w-16 p-1.5" : "h-24 w-24 p-2"} grid shrink-0 place-items-center rounded-full`}
            style={{ background: `conic-gradient(#0a8f45 ${percent}%, #edf5ef 0)` }}
        >
            <div className="grid h-full w-full place-items-center rounded-full bg-white text-center">
                <p className={`${isSmall ? "text-lg" : "text-2xl"} font-black text-[#0a8f45]`}>{percent}%</p>
                <p className={`${isSmall ? "-mt-2 text-[7px]" : "-mt-3 text-[9px]"} font-black uppercase tracking-[0.12em] text-[#64748b]`}>
                    complete
                </p>
            </div>
        </div>
    );
}

function SectionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <section className={`rounded-[22px] border border-[#dfe8e3] bg-white shadow-[0_12px_32px_rgba(15,23,42,0.04)] ${className}`}>
            {children}
        </section>
    );
}

function Field({
    label,
    hint,
    children,
    className = "",
}: {
    label: string;
    hint?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className={labelClass}>{label}</label>
            {hint && <p className="mt-1 text-xs leading-5 text-[#64748b]">{hint}</p>}
            {children}
        </div>
    );
}

function ToggleRow({
    icon: Icon,
    title,
    copy,
    checked,
    onChange,
}: {
    icon: LucideIcon;
    title: string;
    copy: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4">
            <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                    <Icon size={18} />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-black text-[#06111f]">{title}</p>
                    <p className="mt-1 text-xs leading-5 text-[#64748b]">{copy}</p>
                </div>
            </div>
            <button
                type="button"
                aria-pressed={checked}
                onClick={() => onChange(!checked)}
                className={`flex h-7 w-12 shrink-0 items-center rounded-full p-1 transition ${checked ? "bg-[#0a8f45]" : "bg-[#cbd5e1]"}`}
            >
                <span className={`h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`} />
            </button>
        </div>
    );
}

function InfoTile({
    icon: Icon,
    label,
    value,
    onClick,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex min-h-[118px] flex-col rounded-[18px] border border-[#dfe8e3] bg-white p-5 text-left shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#b7dac4] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                    <Icon size={20} />
                </div>
                <ChevronRight size={16} className="mt-1 text-[#94a3b8] transition group-hover:translate-x-1 group-hover:text-[#0a8f45]" />
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.22em] text-[#94a3b8]">{label}</p>
            <p className="mt-2 max-w-full truncate text-sm font-black leading-6 text-[#06111f]">{value}</p>
        </button>
    );
}

function ProgressCard({
    title,
    message,
    items,
    onSelect,
}: {
    title: string;
    message: string;
    items: ChecklistItem[];
    onSelect: (tab: EditTab) => void;
}) {
    const percent = completion(items);

    return (
        <SectionCard className="p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0a8f45]">Profile completion</p>
                    <h2 className="mt-2 text-2xl font-black text-[#06111f]">{title}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#64748b]">{message}</p>
                </div>
                <ProgressRing percent={percent} />
            </div>

            <div className="mt-6 h-3 overflow-hidden rounded-full bg-[#edf5ef]">
                <div className="h-full rounded-full bg-[#0a8f45] transition-all" style={{ width: `${percent}%` }} />
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
                {items.map((item) => (
                    <button
                        type="button"
                        key={item.label}
                        onClick={() => onSelect(item.tab)}
                        className="group flex min-h-[56px] items-center justify-between gap-3 rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4 text-left transition hover:border-[#b7dac4] hover:bg-[#f6fcf8]"
                    >
                        <div className="flex min-w-0 items-center gap-3">
                            <CheckCircle2 size={18} className={item.done ? "text-[#0a8f45]" : "text-[#c8d8cf]"} />
                            <p className="min-w-0 text-sm font-black text-[#06111f]">{item.label}</p>
                        </div>
                        <span className="shrink-0 text-xs font-black text-[#0a8f45]">+{item.weight}%</span>
                    </button>
                ))}
            </div>
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-[#f0fbf4] px-4 py-3 text-xs font-bold text-[#0a8f45]">
                <Check size={14} />
                A complete profile builds trust and brings better, faster offers.
            </div>
        </SectionCard>
    );
}

function WorkspaceTile({
    icon: Icon,
    title,
    copy,
    href,
    onClick,
}: {
    icon: LucideIcon;
    title: string;
    copy: string;
    href?: string;
    onClick?: () => void;
}) {
    const content = (
        <>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                <Icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-[#06111f]">{title}</p>
                <p className="mt-1 text-xs leading-5 text-[#64748b]">{copy}</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-[#94a3b8] transition group-hover:translate-x-1 group-hover:text-[#0a8f45]" />
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className="group flex min-h-[78px] items-center gap-4 rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4 transition hover:border-[#b7dac4] hover:bg-[#f6fcf8]"
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex min-h-[78px] w-full items-center gap-4 rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4 text-left transition hover:border-[#b7dac4] hover:bg-[#f6fcf8]"
        >
            {content}
        </button>
    );
}

function ProfileAvatar({
    photo,
    name,
    size = "large",
}: {
    photo: string;
    name: string;
    size?: "small" | "medium" | "large";
}) {
    const classes = {
        small: "h-16 w-16 text-xl",
        medium: "h-20 w-20 text-2xl",
        large: "h-24 w-24 text-3xl",
    };

    return (
        <div className={`${classes[size]} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#06111f] font-black text-white ring-4 ring-white shadow-xl`}>
            {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
    );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-[#edf2ef] bg-white p-3 text-center">
            <p className="text-base font-black text-[#06111f]">{value}</p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#94a3b8]">{label}</p>
        </div>
    );
}

export default function ProfilePage() {
    const { profile, accountType, updateUserProfile } = useAuth();
    const isBusiness = accountType === "business";
    const displayName = profile?.displayName || (isBusiness ? "Local Business" : "Customer");
    const businessName = profile?.companyName || displayName;
    const email = profile?.email || "Email not added";
    const photo = profile?.photoURL || "";
    const plan = profile?.currentPlanId || "free";

    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState<EditTab>("general");
    const [editForm, setEditForm] = useState<ProfileForm>(() => formFromProfile(profile, isBusiness));
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [isMapOpen, setIsMapOpen] = useState(false);
    const [showLocationPrompt, setShowLocationPrompt] = useState(false);
    const [detectedLocation, setDetectedLocation] = useState<LocationDetection | null>(null);
    const [hasPromptedLocation, setHasPromptedLocation] = useState(false);
    const [isChangingCountry, setIsChangingCountry] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const countries = useMemo(() => Country.getAllCountries(), []);
    const sortedCountries = useMemo(() => [...countries].sort((a, b) => a.name.localeCompare(b.name)), [countries]);
    const topCountryCode = profile?.countryCode || detectedLocation?.countryCode || "NP";
    const displayCountries = useMemo(() => {
        const list = [...sortedCountries];
        const idx = list.findIndex((country) => country.isoCode === topCountryCode);
        if (idx !== -1) {
            const [top] = list.splice(idx, 1);
            list.unshift(top);
        }
        return list;
    }, [sortedCountries, topCountryCode]);

    const states = useMemo(
        () => (editForm.countryCode ? State.getStatesOfCountry(editForm.countryCode) : []),
        [editForm.countryCode],
    );

    const cities = useMemo(() => {
        if (!editForm.countryCode) return [];
        if (editForm.stateCode) {
            const stateCities = City.getCitiesOfState(editForm.countryCode, editForm.stateCode);
            if (stateCities.length > 0) return stateCities;
        }
        return City.getCitiesOfCountry(editForm.countryCode) || [];
    }, [editForm.countryCode, editForm.stateCode]);

    useEffect(() => {
        if (!isEditing) {
            setEditForm(formFromProfile(profile, isBusiness));
        }
    }, [profile, isBusiness, isEditing]);

    useEffect(() => {
        if (profile && !profile.country && !hasPromptedLocation) {
            fetch("https://ipapi.co/json/")
                .then((res) => res.json())
                .then((data) => {
                    if (data.country_name) {
                        const foundCountry = countries.find((country) => country.name === data.country_name);
                        setDetectedLocation({
                            country: data.country_name,
                            countryCode: foundCountry?.isoCode || "",
                            city: data.city || "",
                            currency: data.currency || "USD",
                        });
                        setShowLocationPrompt(true);
                    }
                })
                .catch(() => undefined)
                .finally(() => setHasPromptedLocation(true));
        }
    }, [profile, hasPromptedLocation, countries]);

    const openEditor = useCallback(
        (tab: EditTab = "general") => {
            setEditForm(formFromProfile(profile, isBusiness));
            setActiveTab(tab);
            setSaveError("");
            setSaveSuccess(false);
            setIsEditing(true);
        },
        [profile, isBusiness],
    );

    const processPhotoFile = (file?: File) => {
        if (!file) return;
        void resizeProfilePhoto(file)
            .then((photoURL) => setEditForm((current) => ({ ...current, photoURL })))
            .catch(() => setSaveError("Could not process this image. Please try another photo."));
    };

    const handlePhotoUpload = (event: ChangeEvent<HTMLInputElement>) => {
        processPhotoFile(event.target.files?.[0]);
    };

    const handlePhotoDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        processPhotoFile(event.dataTransfer.files?.[0]);
    };

    const handleConfirmLocation = async () => {
        if (!detectedLocation) return;
        await updateUserProfile({
            country: detectedLocation.country,
            countryCode: detectedLocation.countryCode,
            city: detectedLocation.city,
            currency: detectedLocation.currency,
        });
        setShowLocationPrompt(false);
        setIsChangingCountry(false);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setSaveError("");

        try {
            const finalPhoneNumber = editForm.phoneNumberRaw.trim()
                ? `${editForm.dialCode} ${editForm.phoneNumberRaw.trim()}`
                : "";

            await updateUserProfile({
                ...editForm,
                displayName: editForm.displayName.trim() || displayName,
                companyName: isBusiness ? editForm.companyName.trim() || editForm.displayName.trim() || businessName : null,
                phoneNumber: finalPhoneNumber,
            });

            setSaveSuccess(true);
            window.setTimeout(() => {
                setIsEditing(false);
                setSaveSuccess(false);
            }, 900);
        } catch (error) {
            console.error("Failed to update profile", error);
            setSaveError("Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const customerChecklist: ChecklistItem[] = useMemo(
        () => [
            { label: "Add profile photo", done: Boolean(photo), weight: 15, tab: "general" },
            { label: "Verify phone number", done: Boolean(profile?.phoneNumber), weight: 20, tab: "contact" },
            { label: "Add country & city", done: Boolean(profile?.country && profile?.city), weight: 15, tab: "address" },
            { label: "Add current address", done: Boolean(profile?.currentAddress), weight: 15, tab: "address" },
            { label: "Add email", done: Boolean(profile?.email), weight: 15, tab: "contact" },
            { label: "Complete first Need", done: false, weight: 20, tab: "preferences" },
        ],
        [photo, profile?.phoneNumber, profile?.country, profile?.city, profile?.currentAddress, profile?.email],
    );

    const businessChecklist: ChecklistItem[] = useMemo(
        () => [
            { label: "Add business logo", done: Boolean(photo), weight: 10, tab: "general" },
            { label: "Add business name", done: Boolean(businessName), weight: 10, tab: "general" },
            { label: "Add category", done: Boolean(profile?.category), weight: 10, tab: "general" },
            { label: "Add service area/location", done: Boolean(profile?.country && profile?.city), weight: 15, tab: "address" },
            { label: "Add opening hours", done: Boolean(profile?.openingHours), weight: 10, tab: "preferences" },
            { label: "Add services/products", done: Boolean(profile?.services), weight: 15, tab: "preferences" },
            { label: "Add warranty policy", done: Boolean(profile?.warrantyPolicy), weight: 10, tab: "security" },
            { label: "Verify phone", done: Boolean(profile?.phoneNumber), weight: 10, tab: "contact" },
            { label: "Verify email", done: Boolean(profile?.email), weight: 10, tab: "contact" },
        ],
        [photo, businessName, profile?.category, profile?.country, profile?.city, profile?.openingHours, profile?.services, profile?.warrantyPolicy, profile?.phoneNumber, profile?.email],
    );

    const liveChecklist = useMemo<ChecklistItem[]>(
        () =>
            isBusiness
                ? [
                      { label: "Add business logo", done: Boolean(editForm.photoURL), weight: 10, tab: "general" },
                      { label: "Add business name", done: Boolean(editForm.companyName || editForm.displayName), weight: 10, tab: "general" },
                      { label: "Add category", done: Boolean(editForm.category), weight: 10, tab: "general" },
                      { label: "Add service area/location", done: Boolean(editForm.country && editForm.city), weight: 15, tab: "address" },
                      { label: "Add opening hours", done: Boolean(editForm.openingHours), weight: 10, tab: "preferences" },
                      { label: "Add services/products", done: Boolean(editForm.services), weight: 15, tab: "preferences" },
                      { label: "Add warranty policy", done: Boolean(editForm.warrantyPolicy), weight: 10, tab: "security" },
                      { label: "Verify phone", done: Boolean(editForm.phoneNumberRaw), weight: 10, tab: "contact" },
                      { label: "Verify email", done: Boolean(profile?.email), weight: 10, tab: "contact" },
                  ]
                : [
                      { label: "Add profile photo", done: Boolean(editForm.photoURL), weight: 15, tab: "general" },
                      { label: "Verify phone number", done: Boolean(editForm.phoneNumberRaw), weight: 20, tab: "contact" },
                      { label: "Add country & city", done: Boolean(editForm.country && editForm.city), weight: 15, tab: "address" },
                      { label: "Add current address", done: Boolean(editForm.currentAddress), weight: 15, tab: "address" },
                      { label: "Add email", done: Boolean(profile?.email), weight: 15, tab: "contact" },
                      { label: "Complete first Need", done: false, weight: 20, tab: "preferences" },
                  ],
        [editForm, isBusiness, profile?.email],
    );

    const checklist = isBusiness ? businessChecklist : customerChecklist;
    const completionPercent = completion(checklist);
    const liveCompletionPercent = completion(liveChecklist);
    const locationDisplay = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ") || "No location set";
    const profileName = isBusiness ? businessName : displayName;
    const shortBio =
        profile?.shortBio ||
        (isBusiness
            ? "Local business profile ready for nearby customers."
            : "I am a reliable and detail-oriented person who values quality service and clear communication.");

    const renderActiveForm = () => {
        if (activeTab === "general") {
            return (
                <div className="space-y-5">
                    <div
                        onDrop={handlePhotoDrop}
                        onDragOver={(event) => event.preventDefault()}
                        className="grid gap-4 rounded-2xl border border-dashed border-[#bdddc8] bg-[#fbfdfb] p-4 md:grid-cols-[150px_1fr]"
                    >
                        <div className="flex min-h-[140px] items-center justify-center rounded-2xl bg-white">
                            {editForm.photoURL ? (
                                <img src={editForm.photoURL} alt="Profile preview" className="h-24 w-24 rounded-full object-cover shadow-lg" />
                            ) : (
                                <div className="grid h-24 w-24 place-items-center rounded-full bg-[#f1f5f9] text-[#94a3b8]">
                                    <UploadCloud size={34} />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col justify-center">
                            <p className="text-sm font-black text-[#06111f]">Profile Photo</p>
                            <p className="mt-1 text-xs leading-5 text-[#64748b]">Drag and drop or upload a clear profile image.</p>
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="mt-4 inline-flex w-fit items-center gap-2 rounded-xl bg-[#e9f9f0] px-4 py-2.5 text-xs font-black text-[#0a8f45] transition hover:bg-[#d8f4e3]"
                            >
                                <Camera size={15} />
                                Choose Image
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {isBusiness ? (
                            <>
                                <Field label="Business Name">
                                    <input
                                        className={inputClass}
                                        value={editForm.companyName}
                                        onChange={(event) => setEditForm({ ...editForm, companyName: event.target.value })}
                                        placeholder="Your Company Name"
                                    />
                                </Field>
                                <Field label="Category">
                                    <input
                                        className={inputClass}
                                        value={editForm.category}
                                        onChange={(event) => setEditForm({ ...editForm, category: event.target.value })}
                                        placeholder="Plumber, Electrician, Designer..."
                                    />
                                </Field>
                            </>
                        ) : (
                            <Field label="Full Name">
                                <input
                                    className={inputClass}
                                    value={editForm.displayName}
                                    onChange={(event) => setEditForm({ ...editForm, displayName: event.target.value })}
                                    placeholder="Your Name"
                                />
                            </Field>
                        )}
                        <Field label="Username">
                            <div className="relative">
                                <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                                <input
                                    className={`${inputClass} pl-10`}
                                    value={editForm.username}
                                    onChange={(event) => setEditForm({ ...editForm, username: event.target.value })}
                                    placeholder="username"
                                />
                            </div>
                        </Field>
                        <Field label="Short Bio" className="md:col-span-2">
                            <textarea
                                className={`${inputClass} min-h-[108px] resize-none`}
                                value={editForm.shortBio}
                                maxLength={220}
                                onChange={(event) => setEditForm({ ...editForm, shortBio: event.target.value })}
                                placeholder={isBusiness ? "Describe your business and services..." : "Tell businesses what helps them quote safely..."}
                            />
                            <p className="mt-1 text-right text-[10px] font-bold text-[#94a3b8]">{editForm.shortBio.length}/220</p>
                        </Field>
                    </div>
                </div>
            );
        }

        if (activeTab === "contact") {
            return (
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Email">
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                                <input className={`${inputClass} pl-10`} value={email} disabled />
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs font-bold text-[#0a8f45]">
                                <CheckCircle2 size={14} />
                                Email verified
                            </div>
                        </Field>
                        <Field label="Phone Number">
                            <div className="mt-1 flex gap-2">
                                <select
                                    className="w-[42%] rounded-xl border border-[#dfe8e3] bg-[#fbfdfb] px-3 py-3 text-xs font-bold text-[#06111f] outline-none focus:border-[#0a8f45] focus:ring-4 focus:ring-[#e9f9f0]"
                                    value={editForm.dialCode}
                                    onChange={(event) => setEditForm({ ...editForm, dialCode: event.target.value })}
                                >
                                    {displayCountries.map((country) => (
                                        <option key={country.isoCode} value={`+${country.phonecode}`}>
                                            {country.flag} +{country.phonecode}
                                        </option>
                                    ))}
                                </select>
                                <input
                                    className={`${inputClass} mt-0 flex-1`}
                                    value={editForm.phoneNumberRaw}
                                    type="tel"
                                    onChange={(event) => setEditForm({ ...editForm, phoneNumberRaw: event.target.value })}
                                    placeholder="98XXXXXXXX"
                                />
                            </div>
                        </Field>
                    </div>
                    <ToggleRow
                        icon={Mail}
                        title="Email Notifications"
                        copy="Receive important updates about your needs and bookings."
                        checked={editForm.emailNotifications}
                        onChange={(value) => setEditForm({ ...editForm, emailNotifications: value })}
                    />
                    <ToggleRow
                        icon={Bell}
                        title="SMS Notifications"
                        copy="Get SMS alerts about offers, messages, and bookings."
                        checked={editForm.smsNotifications}
                        onChange={(value) => setEditForm({ ...editForm, smsNotifications: value })}
                    />
                </div>
            );
        }

        if (activeTab === "address") {
            return (
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Country">
                            <select
                                className={inputClass}
                                value={editForm.countryCode}
                                onChange={(event) => {
                                    const selected = countries.find((country) => country.isoCode === event.target.value);
                                    if (!selected) return;
                                    setEditForm({
                                        ...editForm,
                                        country: selected.name,
                                        countryCode: selected.isoCode,
                                        state: "",
                                        stateCode: "",
                                        city: "",
                                        currency: editForm.currency || "USD",
                                        dialCode: `+${selected.phonecode}`,
                                    });
                                }}
                            >
                                <option value="">Select Country</option>
                                {displayCountries.map((country) => (
                                    <option key={country.isoCode} value={country.isoCode}>
                                        {country.flag} {country.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="State / Province">
                            <select
                                className={inputClass}
                                value={editForm.stateCode}
                                disabled={!editForm.countryCode}
                                onChange={(event) => {
                                    const selected = states.find((state) => state.isoCode === event.target.value);
                                    setEditForm({
                                        ...editForm,
                                        state: selected?.name || "",
                                        stateCode: selected?.isoCode || "",
                                        city: "",
                                    });
                                }}
                            >
                                <option value="">Select State</option>
                                {states.map((state) => (
                                    <option key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="City">
                            <div className="flex items-center justify-between gap-3">
                                <button
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, manualLocation: !editForm.manualLocation })}
                                    className="mb-1 ml-auto text-[10px] font-black uppercase tracking-[0.08em] text-[#0a8f45]"
                                >
                                    {editForm.manualLocation ? "Use List" : "Manual Entry"}
                                </button>
                            </div>
                            {editForm.manualLocation ? (
                                <input
                                    className={`${inputClass} mt-0`}
                                    value={editForm.city}
                                    onChange={(event) => setEditForm({ ...editForm, city: event.target.value })}
                                    placeholder="Enter City Name"
                                />
                            ) : (
                                <select
                                    className={`${inputClass} mt-0`}
                                    value={editForm.city}
                                    disabled={!editForm.countryCode}
                                    onChange={(event) => setEditForm({ ...editForm, city: event.target.value })}
                                >
                                    <option value="">Select City</option>
                                    {cities.map((city) => (
                                        <option key={`${city.name}-${city.latitude}-${city.longitude}`} value={city.name}>
                                            {city.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </Field>
                        <Field label="Area / Neighborhood">
                            <input
                                className={inputClass}
                                value={editForm.area}
                                onChange={(event) => setEditForm({ ...editForm, area: event.target.value })}
                                placeholder="Bhattarai Danda, New Road..."
                            />
                        </Field>
                        <Field label="Current Address" className="md:col-span-2">
                            <input
                                className={inputClass}
                                value={editForm.currentAddress}
                                onChange={(event) => setEditForm({ ...editForm, currentAddress: event.target.value })}
                                placeholder="House, street, landmark, ward..."
                            />
                        </Field>
                    </div>

                    <div className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-sm font-black text-[#06111f]">
                                    {isBusiness ? "Precise Business Location" : "Precise Delivery Location"}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-[#64748b]">Pin the exact place on the map for safer matching.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMapOpen(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#06111f] px-4 py-2.5 text-xs font-black text-white transition hover:bg-black"
                            >
                                <MapPin size={14} />
                                {editForm.deliveryCoords ? "Change on Map" : "Pin on Map"}
                            </button>
                        </div>
                        <input
                            className={`${inputClass} mt-4 bg-white`}
                            value={editForm.deliveryAddress}
                            onChange={(event) => setEditForm({ ...editForm, deliveryAddress: event.target.value })}
                            placeholder={isBusiness ? "Search or pin your business location..." : "Search or pin a precise delivery point..."}
                        />
                        {editForm.deliveryCoords && (
                            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.08em] text-[#0a8f45]">
                                Coordinates saved: {editForm.deliveryCoords.lat.toFixed(6)}, {editForm.deliveryCoords.lng.toFixed(6)}
                            </p>
                        )}
                    </div>
                </div>
            );
        }

        if (activeTab === "preferences") {
            return (
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Field label="Preferred Service Method">
                            <select
                                className={inputClass}
                                value={editForm.preferredServiceMethod}
                                onChange={(event) => setEditForm({ ...editForm, preferredServiceMethod: event.target.value })}
                            >
                                {serviceMethodOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Language">
                            <select
                                className={inputClass}
                                value={editForm.language}
                                onChange={(event) => setEditForm({ ...editForm, language: event.target.value })}
                            >
                                {languageOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Currency">
                            <select
                                className={inputClass}
                                value={editForm.currency}
                                onChange={(event) => setEditForm({ ...editForm, currency: event.target.value })}
                            >
                                {currencyOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </Field>
                        {isBusiness && (
                            <Field label="Opening Hours">
                                <input
                                    className={inputClass}
                                    value={editForm.openingHours}
                                    onChange={(event) => setEditForm({ ...editForm, openingHours: event.target.value })}
                                    placeholder="Mon-Fri 9AM-5PM"
                                />
                            </Field>
                        )}
                        {isBusiness && (
                            <Field label="Services & Products" className="md:col-span-2">
                                <textarea
                                    className={`${inputClass} min-h-[130px] resize-none`}
                                    value={editForm.services}
                                    onChange={(event) => setEditForm({ ...editForm, services: event.target.value })}
                                    placeholder="Describe services, products, starting prices, and service areas..."
                                />
                            </Field>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="space-y-5">
                <Field label="Trust Status">
                    <div className="grid gap-3 md:grid-cols-2">
                        <div className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4">
                            <CheckCircle2 size={20} className="text-[#0a8f45]" />
                            <p className="mt-3 text-sm font-black text-[#06111f]">Contact ready</p>
                            <p className="mt-1 text-xs leading-5 text-[#64748b]">Email is connected to this account.</p>
                        </div>
                        <div className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4">
                            <ShieldCheck size={20} className="text-[#0a8f45]" />
                            <p className="mt-3 text-sm font-black text-[#06111f]">Safety controls</p>
                            <p className="mt-1 text-xs leading-5 text-[#64748b]">Hidden contact settings and reports stay tied to your profile.</p>
                        </div>
                    </div>
                </Field>
                <Field label={isBusiness ? "Warranty Policy" : "Profile Safety Note"}>
                    <textarea
                        className={`${inputClass} min-h-[118px] resize-none`}
                        value={editForm.warrantyPolicy}
                        onChange={(event) => setEditForm({ ...editForm, warrantyPolicy: event.target.value })}
                        placeholder={isBusiness ? "Example: 30-day service guarantee..." : "Add any note businesses should know before quoting..."}
                    />
                </Field>
            </div>
        );
    };

    return (
        <RouteGuard allowedTypes={["customer", "business"]}>
            <main className="min-h-screen bg-[#fbfdfb] px-4 py-6 text-[#06111f] md:px-8">
                <div className="mx-auto max-w-6xl">
                    <section className="relative overflow-hidden rounded-[24px] border border-[#dfe8e3] bg-[radial-gradient(circle_at_88%_22%,rgba(10,143,69,0.12),transparent_34%),linear-gradient(180deg,#ffffff,#fbfdfb)] p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] md:p-8">
                        <button
                            type="button"
                            onClick={() => openEditor("general")}
                            className="absolute right-5 top-5 rounded-full border border-[#dfe8e3] bg-white p-2 text-[#06111f] shadow-sm transition hover:bg-[#e9f9f0]"
                            aria-label="Edit profile"
                        >
                            <Edit size={19} />
                        </button>

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center">
                                <div className="relative w-fit">
                                    <ProfileAvatar photo={photo} name={profileName} />
                                    <button
                                        type="button"
                                        onClick={() => openEditor("general")}
                                        className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#0a8f45] text-white shadow-lg transition hover:bg-[#08783b]"
                                        aria-label="Change profile photo"
                                    >
                                        <Camera size={14} />
                                    </button>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#0a8f45]">
                                        {isBusiness ? "Business Profile" : "Customer Profile"}
                                    </p>
                                    <h1 className="mt-2 max-w-full break-words text-4xl font-black text-[#06111f] md:text-5xl">
                                        {profileName}
                                    </h1>
                                    <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
                                        <span className="flex items-center gap-1.5 rounded-full bg-[#e9f9f0] px-3 py-1 text-[#0a8f45]">
                                            <Globe size={14} />
                                            {profile?.country || "Add country"}
                                        </span>
                                        <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[#475569]">
                                            $ {profile?.currency || "USD"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <Link
                                href={isBusiness ? "/marketplace" : "/client/new"}
                                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#06111f] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-black"
                            >
                                {isBusiness ? <Briefcase size={17} /> : <MessageSquare size={17} />}
                                {isBusiness ? "Browse Needs" : "Post a Need"}
                            </Link>
                        </div>
                    </section>

                    <section className="mt-5 grid gap-4 md:grid-cols-4">
                        <InfoTile icon={UserRound} label="Basic Info" value={`${displayName} - ${email}`} onClick={() => openEditor("general")} />
                        <InfoTile icon={MapPin} label="Location" value={locationDisplay} onClick={() => openEditor("address")} />
                        <InfoTile
                            icon={ShieldCheck}
                            label="Trust"
                            value={profile?.email || profile?.phoneNumber ? "Contact ready" : "Verify phone/email"}
                            onClick={() => openEditor("security")}
                        />
                        <InfoTile
                            icon={CreditCard}
                            label={isBusiness ? "Subscription" : "Payments Later"}
                            value={isBusiness ? plan : "Saved cards and refunds later"}
                            onClick={() => openEditor("preferences")}
                        />
                    </section>

                    <div className="mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.15fr]">
                        <ProgressCard
                            title={isBusiness ? "Business Profile" : "Profile"}
                            message={
                                isBusiness
                                    ? "Better profile equals more trust, better ranking, and more selected bookings."
                                    : "Keep it light. Add only the information that helps businesses quote safely."
                            }
                            items={checklist}
                            onSelect={openEditor}
                        />

                        <SectionCard className="p-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#0a8f45]">
                                {isBusiness ? "Business workspace" : "Customer workspace"}
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-[#06111f]">
                                {isBusiness ? "Ready profile, better Bookings." : "Simple profile, safer Offers."}
                            </h2>
                            <div className="mt-6 grid gap-3 md:grid-cols-2">
                                {isBusiness ? (
                                    <>
                                        <WorkspaceTile icon={Store} title="Marketplace" copy="Browse local needs and send offers" href="/marketplace" />
                                        <WorkspaceTile icon={Briefcase} title="Plans" copy="Upgrade visibility and lead access" href="/pricing" />
                                        <WorkspaceTile icon={MessageSquare} title="Messages" copy="Customer chats and offer updates" href="/messages" />
                                        <WorkspaceTile icon={ShieldCheck} title="Trust" copy="Warranty, contact, and safety settings" onClick={() => openEditor("security")} />
                                    </>
                                ) : (
                                    <>
                                        <WorkspaceTile icon={CheckCircle2} title="My Needs" copy="Active, completed, and cancelled Needs" href="/client" />
                                        <WorkspaceTile icon={Briefcase} title="Orders / Bookings" copy="Booked local services and products" href="/client" />
                                        <WorkspaceTile icon={Star} title="Reviews" copy="Reviews given to businesses" href="/messages" />
                                        <WorkspaceTile icon={ShieldCheck} title="Safety" copy="Hidden contact settings and reports" onClick={() => openEditor("security")} />
                                    </>
                                )}
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {showLocationPrompt && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-md rounded-[24px] bg-white p-7 text-center shadow-2xl">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f9f0] text-[#0a8f45]">
                                <MapPin size={28} />
                            </div>
                            <h2 className="text-2xl font-black text-[#06111f]">Location Detected</h2>
                            {!isChangingCountry ? (
                                <>
                                    <p className="mt-2 text-sm leading-6 text-[#64748b]">
                                        We detected <strong className="text-[#06111f]">{detectedLocation?.country}</strong>. Is this correct?
                                    </p>
                                    <div className="mt-6 flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={handleConfirmLocation}
                                            className="w-full rounded-xl bg-[#0a8f45] px-4 py-4 font-black text-white transition hover:bg-[#08783b]"
                                        >
                                            Yes, continue
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsChangingCountry(true)}
                                            className="w-full rounded-xl bg-[#f1f5f9] px-4 py-4 font-black text-[#06111f] transition hover:bg-[#e2e8f0]"
                                        >
                                            Change country
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="mt-2 text-sm leading-6 text-[#64748b]">Select your primary country</p>
                                    <select
                                        className={inputClass}
                                        onChange={(event) => {
                                            const selected = countries.find((country) => country.name === event.target.value);
                                            if (selected) {
                                                setDetectedLocation({
                                                    country: selected.name,
                                                    countryCode: selected.isoCode,
                                                    city: "",
                                                    currency: "USD",
                                                });
                                            }
                                        }}
                                        defaultValue={detectedLocation?.country || ""}
                                    >
                                        <option value="">Select Country</option>
                                        {displayCountries.map((country) => (
                                            <option key={country.isoCode} value={country.name}>
                                                {country.flag} {country.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={handleConfirmLocation}
                                        className="mt-4 w-full rounded-xl bg-[#0a8f45] px-4 py-4 font-black text-white transition hover:bg-[#08783b]"
                                    >
                                        Save Country
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {isEditing && (
                    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 backdrop-blur-sm md:p-6">
                        <div className="mx-auto w-full max-w-7xl rounded-[24px] border border-[#dfe8e3] bg-[#fbfdfb] p-4 shadow-2xl md:p-5">
                            <div className="mb-5 flex flex-col gap-4 rounded-[20px] bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
                                <div className="min-w-0">
                                    <h2 className="text-2xl font-black text-[#06111f] md:text-3xl">Update Profile</h2>
                                    <p className="mt-1 text-sm leading-6 text-[#64748b]">Keep your profile complete for safer Offers and faster bookings.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEditForm(formFromProfile(profile, isBusiness));
                                        setIsEditing(false);
                                        setSaveError("");
                                    }}
                                    className="self-end rounded-full p-2 text-[#64748b] transition hover:bg-[#f1f5f9] md:self-auto"
                                    aria-label="Close profile editor"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="grid gap-5 xl:grid-cols-[230px_minmax(0,1fr)_320px]">
                                <aside className="space-y-4">
                                    <div className="rounded-[20px] border border-[#dfe8e3] bg-white p-4 shadow-sm">
                                        <div className="text-center">
                                            <div className="mx-auto w-fit">
                                                <ProfileAvatar photo={editForm.photoURL} name={editForm.companyName || editForm.displayName || profileName} size="medium" />
                                            </div>
                                            <p className="mt-3 truncate text-sm font-black text-[#06111f]">
                                                {isBusiness ? editForm.companyName || businessName : editForm.displayName || displayName}
                                            </p>
                                            <p className="truncate text-xs text-[#64748b]">{email}</p>
                                        </div>
                                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf5ef]">
                                            <div className="h-full rounded-full bg-[#0a8f45]" style={{ width: `${liveCompletionPercent}%` }} />
                                        </div>
                                        <p className="mt-2 text-center text-xs font-black text-[#0a8f45]">{liveCompletionPercent}% complete</p>
                                    </div>

                                    <div className="rounded-[20px] border border-[#dfe8e3] bg-white p-3 shadow-sm">
                                        {tabItems.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.key;
                                            return (
                                                <button
                                                    key={tab.key}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab.key)}
                                                    className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-black transition ${
                                                        isActive ? "bg-[#e9f9f0] text-[#0a8f45]" : "bg-white text-[#06111f] hover:bg-[#fbfdfb]"
                                                    }`}
                                                >
                                                    <Icon size={16} />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="rounded-[20px] border border-[#dfe8e3] bg-white p-4 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <ProgressRing percent={liveCompletionPercent} size="small" />
                                            <div>
                                                <p className="text-xs font-black text-[#06111f]">Profile complete</p>
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveTab(liveChecklist.find((item) => !item.done)?.tab || "general")}
                                                    className="mt-1 text-xs font-black text-[#0a8f45]"
                                                >
                                                    View progress
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </aside>

                                <section className="rounded-[20px] border border-[#dfe8e3] bg-white p-5 shadow-sm md:p-6">
                                    <div className="mb-5 flex flex-wrap gap-2 border-b border-[#edf2ef] pb-4">
                                        {tabItems.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.key;
                                            return (
                                                <button
                                                    key={tab.key}
                                                    type="button"
                                                    onClick={() => setActiveTab(tab.key)}
                                                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition ${
                                                        isActive ? "bg-[#06111f] text-white" : "bg-[#f8faf9] text-[#64748b] hover:bg-[#e9f9f0] hover:text-[#0a8f45]"
                                                    }`}
                                                >
                                                    <Icon size={14} />
                                                    {tab.label}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {renderActiveForm()}

                                    {saveError && (
                                        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
                                            {saveError}
                                        </div>
                                    )}

                                    <div className="mt-6 grid gap-3 border-t border-[#edf2ef] pt-5 sm:grid-cols-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditForm(formFromProfile(profile, isBusiness));
                                                setIsEditing(false);
                                                setSaveError("");
                                            }}
                                            className="rounded-xl border border-[#dfe8e3] bg-white px-4 py-3 text-sm font-black text-[#06111f] transition hover:bg-[#f8faf9]"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            disabled={isSaving || saveSuccess}
                                            className={`rounded-xl px-4 py-3 text-sm font-black text-white transition ${
                                                saveSuccess ? "bg-[#0a8f45]" : "bg-[#0a8f45] hover:bg-[#08783b]"
                                            } disabled:cursor-not-allowed disabled:opacity-70`}
                                        >
                                            {isSaving ? "Saving..." : saveSuccess ? "Profile Updated!" : "Save Changes"}
                                        </button>
                                    </div>
                                </section>

                                <aside className="space-y-4">
                                    <div className="overflow-hidden rounded-[20px] border border-[#dfe8e3] bg-white shadow-sm">
                                        <div className="h-24 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.28),transparent_28%),linear-gradient(135deg,#073b2c,#0a8f45)]" />
                                        <div className="-mt-10 px-5 pb-5 text-center">
                                            <div className="mx-auto w-fit">
                                                <ProfileAvatar photo={editForm.photoURL} name={editForm.companyName || editForm.displayName || profileName} size="small" />
                                            </div>
                                            <div className="mt-3 flex items-center justify-center gap-1.5">
                                                <p className="truncate text-base font-black text-[#06111f]">
                                                    {isBusiness ? editForm.companyName || businessName : editForm.displayName || displayName}
                                                </p>
                                                <CheckCircle2 size={15} className="shrink-0 text-[#0a8f45]" />
                                            </div>
                                            <p className="mt-1 text-xs font-semibold text-[#64748b]">{locationDisplay}</p>
                                            <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] font-black text-[#0a8f45]">
                                                <span className="rounded-full bg-[#e9f9f0] px-2.5 py-1">Email verified</span>
                                                <span className="rounded-full bg-[#e9f9f0] px-2.5 py-1">Address added</span>
                                                <span className="rounded-full bg-[#eef6ff] px-2.5 py-1 text-[#2563eb]">Trusted</span>
                                            </div>
                                            <div className="mt-4 grid grid-cols-3 gap-2">
                                                <PreviewStat label={isBusiness ? "Offers" : "My Needs"} value={isBusiness ? "12" : "5"} />
                                                <PreviewStat label="Rating" value="4.8" />
                                                <PreviewStat label="Safety" value="High" />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab("general")}
                                                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfe8e3] bg-white px-4 py-3 text-xs font-black text-[#06111f] transition hover:bg-[#fbfdfb]"
                                            >
                                                <Eye size={14} />
                                                View Public Profile
                                            </button>
                                        </div>
                                    </div>

                                    <div className="rounded-[20px] border border-[#dfe8e3] bg-white p-4 shadow-sm">
                                        <p className="text-sm font-black text-[#06111f]">What improves trust?</p>
                                        <p className="mt-1 text-xs leading-5 text-[#64748b]">Complete these fields to build more trust with businesses.</p>
                                        <div className="mt-4 space-y-2">
                                            {liveChecklist.slice(0, 5).map((item) => (
                                                <button
                                                    type="button"
                                                    key={item.label}
                                                    onClick={() => setActiveTab(item.tab)}
                                                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-[#fbfdfb]"
                                                >
                                                    <CheckCircle2 size={16} className={item.done ? "text-[#0a8f45]" : "text-[#c8d8cf]"} />
                                                    <span className="min-w-0 flex-1 text-xs font-black text-[#06111f]">{item.label}</span>
                                                    <ChevronRight size={14} className="text-[#94a3b8]" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </aside>
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
                                deliveryCoords: data.coords,
                            });
                            setIsMapOpen(false);
                        }}
                    />
                )}
            </main>
        </RouteGuard>
    );
}
