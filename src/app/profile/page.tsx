"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import {
    AlertCircle,
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
    Loader2,
    Mail,
    MapPin,
    MessageSquare,
    Phone,
    ShieldCheck,
    Sparkles,
    Star,
    Store,
    Trash2,
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
import { PhoneAuthProvider, RecaptchaVerifier, unlink, updatePhoneNumber } from "firebase/auth";
import { get, ref, update } from "firebase/database";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import {
    businessVerificationStatusLabel,
    isBusinessVerificationApproved,
    requestBusinessVerification,
    type BusinessVerificationResult,
} from "@/lib/businessVerification";
import { getNeeds } from "@/lib/neederoDatabase";
import { normalizeUsername, validateUsername } from "@/lib/usernames";

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

type UsernameStatus = "idle" | "checking" | "available" | "taken" | "invalid";

type BusinessVerificationForm = {
    ownerName: string;
    businessName: string;
    category: string;
    address: string;
    city: string;
    country: string;
    googleMapsUrl: string;
    socialLinks: string;
    shopFrontPhoto: string;
    insideShopPhoto: string;
    documentUrl: string;
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
    currency: "NPR",
    currentAddress: "",
    category: "",
    openingHours: "",
    services: "",
    warrantyPolicy: "",
    deliveryAddress: "",
    deliveryCoords: null,
    preferredServiceMethod: "Ask shop to suggest",
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
    { value: "NPR", label: "NPR - Nepalese Rupee" },
];

const languageOptions = ["English", "Nepali", "Hindi", "Spanish", "French"];
const serviceMethodOptions = ["Visit shop", "Home repair", "Pickup & return", "Ask shop to suggest"];

const inputClass =
    "mt-1 w-full rounded-xl border border-[#dfe8e3] bg-white px-3.5 py-3 text-sm font-semibold text-[#06111f] outline-none transition focus:border-[#0a8f45] focus:ring-4 focus:ring-[#e9f9f0] disabled:bg-[#f8faf9] disabled:text-[#94a3b8]";

const labelClass = "text-xs font-black uppercase tracking-[0.12em] text-[#64748b]";
const PHONE_OTP_COOLDOWN_MS = 60_000;

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

function compactPhone(value?: string | null) {
    return (value || "").replace(/[^\d+]/g, "");
}

function buildDisplayPhone(dialCode: string, rawPhone: string) {
    const cleanRaw = rawPhone.trim();
    return cleanRaw ? `${dialCode} ${cleanRaw}` : "";
}

function buildE164Phone(dialCode: string, rawPhone: string) {
    const raw = rawPhone.trim();
    if (!raw) return "";
    if (raw.startsWith("+")) return `+${raw.replace(/[^\d]/g, "")}`;
    const dialDigits = dialCode.replace(/[^\d]/g, "");
    const rawDigits = raw.replace(/[^\d]/g, "");
    const phoneDigits = rawDigits.startsWith(dialDigits) ? rawDigits.slice(dialDigits.length) : rawDigits;
    return dialDigits && phoneDigits ? `+${dialDigits}${phoneDigits}` : "";
}

function isValidE164Phone(phone: string) {
    return /^\+\d{8,15}$/.test(phone);
}

function firebaseErrorCode(error: unknown) {
    return typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
}

function firebaseErrorMessage(error: unknown) {
    return typeof error === "object" && error && "message" in error ? String((error as { message?: string }).message) : "";
}

function isPhoneCredentialOwnershipConflict(error: unknown) {
    const code = firebaseErrorCode(error);
    return code === "auth/account-exists-with-different-credential" || code === "auth/credential-already-in-use";
}

function phoneCodeErrorMessage(error: unknown) {
    const code = firebaseErrorCode(error);
    if (code === "auth/invalid-verification-code") {
        return "That code does not match the latest SMS. Check the newest message and try again.";
    }
    if (code === "auth/code-expired" || code === "auth/session-expired") {
        return "That SMS session expired. Send a new code and enter the newest SMS.";
    }
    if (code === "auth/requires-recent-login") {
        return "For security, sign out and sign in again, then verify this phone number.";
    }
    if (isPhoneCredentialOwnershipConflict(error)) {
        return "This phone number is already linked to another account. Delete phone and restart here, or remove it from that other account first.";
    }
    if (code === "auth/too-many-requests") {
        return "Too many attempts. Wait a few minutes before trying again.";
    }
    const message = firebaseErrorMessage(error);
    if (code) {
        return `Phone verification failed (${code}). ${message || "Send a new SMS code and try again."}`;
    }
    return message || "Phone verification failed. Send a new SMS code and try again.";
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
        currency: profile.currency || "NPR",
        currentAddress: profile.currentAddress || "",
        category: profile.category || "",
        openingHours: profile.openingHours || "",
        services: profile.services || "",
        warrantyPolicy: profile.warrantyPolicy || "",
        deliveryAddress: profile.deliveryAddress || "",
        deliveryCoords: profile.deliveryCoords || null,
        preferredServiceMethod: profile.preferredServiceMethod || "Ask shop to suggest",
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

function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Could not read file."));
        reader.onload = () => resolve(String(reader.result || ""));
        reader.readAsDataURL(file);
    });
}

function businessVerificationFormFromProfile(profile: ReturnType<typeof useAuth>["profile"], fallbackName: string): BusinessVerificationForm {
    return {
        ownerName: profile?.displayName || "",
        businessName: profile?.companyName || fallbackName,
        category: profile?.category || "",
        address: profile?.currentAddress || profile?.deliveryAddress || "",
        city: profile?.city || "",
        country: profile?.country || "",
        googleMapsUrl: profile?.googleMapsUrl || "",
        socialLinks: Array.isArray(profile?.businessSocialLinks) ? profile.businessSocialLinks.join("\n") : "",
        shopFrontPhoto: profile?.shopFrontPhotoUrl || "",
        insideShopPhoto: profile?.shopInsidePhotoUrl || "",
        documentUrl: profile?.businessDocumentUrl || "",
    };
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
    const { user, profile, accountType, updateUserProfile } = useAuth();
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
    const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
    const didResetPhoneRef = useRef(false);
    const [phoneVerificationId, setPhoneVerificationId] = useState("");
    const [phoneOtp, setPhoneOtp] = useState("");
    const [phoneVerifyMessage, setPhoneVerifyMessage] = useState("");
    const [phoneVerifyError, setPhoneVerifyError] = useState("");
    const [isSendingPhoneCode, setIsSendingPhoneCode] = useState(false);
    const [isConfirmingPhoneCode, setIsConfirmingPhoneCode] = useState(false);
    const [isResettingPhone, setIsResettingPhone] = useState(false);
    const [isPhoneVerifyOpen, setIsPhoneVerifyOpen] = useState(false);
    const [phoneCooldownUntil, setPhoneCooldownUntil] = useState(0);
    const [phoneCooldownNow, setPhoneCooldownNow] = useState(Date.now());
    const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>("idle");
    const [usernameMessage, setUsernameMessage] = useState("");
    const [customerNeedCount, setCustomerNeedCount] = useState(0);
    const [isBusinessVerifyOpen, setIsBusinessVerifyOpen] = useState(false);
    const [businessVerifyForm, setBusinessVerifyForm] = useState<BusinessVerificationForm>(() =>
        businessVerificationFormFromProfile(profile, businessName),
    );
    const [businessVerifyResult, setBusinessVerifyResult] = useState<BusinessVerificationResult | null>(null);
    const [businessVerifyError, setBusinessVerifyError] = useState("");
    const [isBusinessVerifying, setIsBusinessVerifying] = useState(false);

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

    const editedPhoneDisplay = buildDisplayPhone(editForm.dialCode, editForm.phoneNumberRaw);
    const editedPhoneE164 = buildE164Phone(editForm.dialCode, editForm.phoneNumberRaw);
    const editedPhoneMatchesProfile = Boolean(
        profile?.phoneNumber &&
            compactPhone(profile.phoneNumber) === compactPhone(editedPhoneDisplay || editedPhoneE164),
    );
    const profilePhoneVerified = Boolean(profile?.phoneVerified && profile?.phoneNumber);
    const editedPhoneVerified = Boolean(profilePhoneVerified && editedPhoneMatchesProfile);
    const phoneCooldownSeconds = Math.max(0, Math.ceil((phoneCooldownUntil - phoneCooldownNow) / 1000));
    const businessVerificationApproved = isBusinessVerificationApproved(profile);
    const businessVerificationStatus =
        profile?.businessVerificationStatus || (businessVerificationApproved ? "approved" : "not_started");
    const businessVerificationLabel = businessVerificationStatusLabel(businessVerificationStatus);
    const customerFirstNeedDone = Boolean(profile?.firstNeedCompleted || customerNeedCount > 0);
    const todayProofDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

    useEffect(() => {
        if (!isEditing) {
            setEditForm(formFromProfile(profile, isBusiness));
        }
    }, [profile, isBusiness, isEditing]);

    useEffect(() => {
        return () => {
            recaptchaVerifierRef.current?.clear();
            recaptchaVerifierRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (didResetPhoneRef.current) {
            didResetPhoneRef.current = false;
            return;
        }
        setPhoneVerificationId("");
        setPhoneOtp("");
        setPhoneVerifyMessage("");
        setPhoneVerifyError("");
    }, [editedPhoneE164]);

    useEffect(() => {
        if (!user?.uid || !editedPhoneE164 || typeof window === "undefined") {
            setPhoneCooldownUntil(0);
            return;
        }

        const key = `needero-phone-otp-sent:${user.uid}:${editedPhoneE164}`;
        const stored = Number(window.localStorage.getItem(key) || "0");
        setPhoneCooldownUntil(Number.isFinite(stored) && stored > Date.now() ? stored : 0);
    }, [user?.uid, editedPhoneE164]);

    useEffect(() => {
        if (!phoneCooldownUntil) return;
        setPhoneCooldownNow(Date.now());
        const timer = window.setInterval(() => setPhoneCooldownNow(Date.now()), 1000);
        return () => window.clearInterval(timer);
    }, [phoneCooldownUntil]);

    useEffect(() => {
        if (!isEditing || activeTab !== "general") {
            return;
        }

        const validation = validateUsername(editForm.username);
        if (!validation.valid) {
            setUsernameStatus("invalid");
            setUsernameMessage(validation.error);
            return;
        }

        const currentUsername = profile?.username ? normalizeUsername(profile.username) : "";
        if (validation.username === currentUsername) {
            setUsernameStatus("available");
            setUsernameMessage("Current username.");
            return;
        }

        setUsernameStatus("checking");
        setUsernameMessage("Checking availability...");
        const timer = window.setTimeout(() => {
            void get(ref(db, `usernames/${validation.username}`))
                .then((snapshot) => {
                    if (!snapshot.exists()) {
                        setUsernameStatus("available");
                        setUsernameMessage(`@${validation.username} is available.`);
                        return;
                    }

                    const value = snapshot.val() as { uid?: string } | string | null;
                    const ownerUid = typeof value === "string" ? value : value?.uid;
                    if (ownerUid === user?.uid) {
                        setUsernameStatus("available");
                        setUsernameMessage("Current username.");
                    } else {
                        setUsernameStatus("taken");
                        setUsernameMessage(`@${validation.username} is already taken.`);
                    }
                })
                .catch(() => {
                    setUsernameStatus("idle");
                    setUsernameMessage("Username will be checked when you save.");
                });
        }, 350);

        return () => window.clearTimeout(timer);
    }, [activeTab, editForm.username, isEditing, profile?.username, user?.uid]);

    useEffect(() => {
        if (!user?.uid || isBusiness) return;

        let cancelled = false;
        void getNeeds(user.uid)
            .then((needs) => {
                if (cancelled) return;
                setCustomerNeedCount(needs.length);
                if (needs.length > 0 && !profile?.firstNeedCompleted) {
                    void updateUserProfile({
                        firstNeedCompleted: true,
                        firstNeedCompletedAt: Date.now(),
                    }).catch((error) => console.warn("Could not mark first Need completion:", error));
                }
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;
        };
    }, [isBusiness, profile?.firstNeedCompleted, user?.uid]);

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
                            currency: "NPR",
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

    const resetRecaptcha = () => {
        recaptchaVerifierRef.current?.clear();
        recaptchaVerifierRef.current = null;
    };

    const getRecaptchaVerifier = () => {
        if (!recaptchaVerifierRef.current) {
            recaptchaVerifierRef.current = new RecaptchaVerifier(auth, "needero-phone-recaptcha", {
                size: "invisible",
            });
        }
        return recaptchaVerifierRef.current;
    };

    const handleSendPhoneCode = async () => {
        setPhoneVerifyError("");
        setPhoneVerifyMessage("");

        if (!user) {
            setPhoneVerifyError("Please sign in again before verifying your phone.");
            return;
        }

        if (!isValidE164Phone(editedPhoneE164)) {
            setPhoneVerifyError("Enter a valid phone number with the country code.");
            return;
        }

        if (phoneCooldownSeconds > 0) {
            setPhoneVerifyError(`Wait ${phoneCooldownSeconds}s before sending another SMS code.`);
            return;
        }

        setIsSendingPhoneCode(true);
        try {
            const provider = new PhoneAuthProvider(auth);
            const verifier = getRecaptchaVerifier();
            const verificationId = await provider.verifyPhoneNumber(editedPhoneE164, verifier);
            const nextCooldownUntil = Date.now() + PHONE_OTP_COOLDOWN_MS;
            if (typeof window !== "undefined") {
                window.localStorage.setItem(`needero-phone-otp-sent:${user.uid}:${editedPhoneE164}`, String(nextCooldownUntil));
            }
            setPhoneCooldownUntil(nextCooldownUntil);
            setPhoneCooldownNow(Date.now());
            setPhoneVerificationId(verificationId);
            setPhoneVerifyMessage(`SMS code sent to ${editedPhoneE164}. You can resend after 60 seconds.`);
        } catch (error) {
            console.error("Phone verification SMS failed:", error);
            resetRecaptcha();
            setPhoneVerifyError("SMS could not be sent. Check Firebase Phone Auth, authorized domain, billing/SMS region, or add this number as a Firebase test phone number.");
        } finally {
            setIsSendingPhoneCode(false);
        }
    };

    const handleResetPhoneVerification = async () => {
        setPhoneVerifyError("");
        setPhoneVerifyMessage("");

        if (!user) {
            setPhoneVerifyError("Please sign in again before deleting this phone number.");
            return;
        }

        const phoneForCooldown = editedPhoneE164;
        const resetAt = Date.now();
        const resetPayload = {
            phoneNumber: null,
            phoneVerified: false,
            phoneVerifiedAt: null,
            phoneResetAt: resetAt,
            smsNotifications: editForm.smsNotifications,
        };

        setIsResettingPhone(true);
        try {
            if (user.phoneNumber) {
                await unlink(user, PhoneAuthProvider.PROVIDER_ID).catch((unlinkError) => {
                    console.warn("Could not unlink Firebase Auth phone provider; clearing app phone state:", unlinkError);
                });
                await user.reload().catch(() => undefined);
            }

            try {
                await updateUserProfile(resetPayload);
            } catch (profileError) {
                console.warn("Full profile phone reset failed; trying minimal phone reset:", profileError);
                await update(ref(db, `users/${user.uid}`), resetPayload);
                await Promise.all([
                    update(ref(db, `accounts/customer/${user.uid}`), resetPayload).catch((mirrorError) =>
                        console.warn("Customer phone mirror reset failed:", mirrorError),
                    ),
                    update(ref(db, `accounts/business/${user.uid}`), resetPayload).catch((mirrorError) =>
                        console.warn("Business phone mirror reset failed:", mirrorError),
                    ),
                ]);
            }

            if (typeof window !== "undefined" && phoneForCooldown) {
                window.localStorage.removeItem(`needero-phone-otp-sent:${user.uid}:${phoneForCooldown}`);
            }
            resetRecaptcha();
            setPhoneCooldownUntil(0);
            setPhoneCooldownNow(Date.now());
            setPhoneVerificationId("");
            setPhoneOtp("");
            didResetPhoneRef.current = true;
            setEditForm((current) => ({ ...current, phoneNumberRaw: "" }));
            setPhoneVerifyMessage("Phone number deleted. Enter it again and send a fresh SMS code.");
        } catch (error) {
            console.error("Phone reset failed:", error);
            setPhoneVerifyError(error instanceof Error ? error.message : "Could not delete this phone number. Try again.");
        } finally {
            setIsResettingPhone(false);
        }
    };

    const handleConfirmPhoneCode = async () => {
        setPhoneVerifyError("");
        setPhoneVerifyMessage("");

        if (!user) {
            setPhoneVerifyError("Please sign in again before confirming the code.");
            return;
        }

        const code = phoneOtp.trim();
        if (!phoneVerificationId) {
            setPhoneVerifyError("Send the SMS code first, then enter the code here.");
            return;
        }

        if (code.length < 4) {
            setPhoneVerifyError("Enter the SMS code first.");
            return;
        }

        setIsConfirmingPhoneCode(true);
        try {
            const credential = PhoneAuthProvider.credential(phoneVerificationId, code);
            await updatePhoneNumber(user, credential);
            await user.reload().catch(() => undefined);

            const verifiedPhoneNumber = editedPhoneDisplay || editedPhoneE164;
            const verifiedAt = Date.now();
            try {
                await updateUserProfile({
                    phoneNumber: verifiedPhoneNumber,
                    phoneVerified: true,
                    phoneVerifiedAt: verifiedAt,
                    phoneResetAt: null,
                    smsNotifications: editForm.smsNotifications,
                });
            } catch (profileError) {
                console.warn("Full profile phone verification save failed; trying minimal phone save:", profileError);
                await update(ref(db, `users/${user.uid}`), {
                    phoneNumber: verifiedPhoneNumber,
                    phoneVerified: true,
                    phoneVerifiedAt: verifiedAt,
                    phoneResetAt: null,
                    smsNotifications: editForm.smsNotifications,
                });
                if (accountType) {
                    await update(ref(db, `accounts/${accountType}/${user.uid}`), {
                        phoneNumber: verifiedPhoneNumber,
                        phoneVerified: true,
                        phoneVerifiedAt: verifiedAt,
                        phoneResetAt: null,
                        smsNotifications: editForm.smsNotifications,
                    }).catch((mirrorError) => console.warn("Minimal phone mirror save failed:", mirrorError));
                }
            }

            setEditForm((current) => ({
                ...current,
                dialCode: parsePhoneNumber(verifiedPhoneNumber).dialCode,
                phoneNumberRaw: parsePhoneNumber(verifiedPhoneNumber).phoneNumberRaw,
            }));
            setPhoneVerificationId("");
            setPhoneOtp("");
            setPhoneVerifyMessage("Phone number verified successfully.");
        } catch (error) {
            console.error("Phone verification code failed:", error);
            setPhoneVerifyError(phoneCodeErrorMessage(error));
        } finally {
            setIsConfirmingPhoneCode(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        setSaveError("");

        try {
            const finalPhoneNumber = buildDisplayPhone(editForm.dialCode, editForm.phoneNumberRaw);
            const phoneWasCleared = !finalPhoneNumber && Boolean(profile?.phoneNumber);
            const usernameValidation = validateUsername(editForm.username);
            if (!usernameValidation.valid) {
                setUsernameStatus("invalid");
                setUsernameMessage(usernameValidation.error);
                throw new Error(usernameValidation.error);
            }

            if (usernameStatus === "taken") {
                throw new Error(usernameMessage || "That @username is already taken.");
            }

            await updateUserProfile({
                ...editForm,
                displayName: editForm.displayName.trim() || displayName,
                companyName: isBusiness ? editForm.companyName.trim() || editForm.displayName.trim() || businessName : null,
                username: usernameValidation.username,
                phoneNumber: finalPhoneNumber || null,
                phoneResetAt: finalPhoneNumber ? profile?.phoneResetAt ?? null : phoneWasCleared ? Date.now() : profile?.phoneResetAt ?? null,
            });

            setSaveSuccess(true);
            window.setTimeout(() => {
                setIsEditing(false);
                setSaveSuccess(false);
            }, 900);
        } catch (error) {
            console.error("Failed to update profile", error);
            setSaveError(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const openBusinessVerification = () => {
        setBusinessVerifyForm(businessVerificationFormFromProfile(profile, businessName));
        setBusinessVerifyResult(null);
        setBusinessVerifyError("");
        setIsBusinessVerifyOpen(true);
    };

    const processBusinessVerificationFile = (field: "shopFrontPhoto" | "insideShopPhoto" | "documentUrl", file?: File) => {
        if (!file) return;

        const loader = file.type.startsWith("image/") ? resizeProfilePhoto(file) : readFileAsDataUrl(file);
        void loader
            .then((dataUrl) => setBusinessVerifyForm((current) => ({ ...current, [field]: dataUrl })))
            .catch(() => setBusinessVerifyError("Could not read that file. Try another image or document."));
    };

    const submitBusinessVerification = async () => {
        if (!user || !profile || !isBusiness) return;

        if (!profilePhoneVerified) {
            setBusinessVerifyError("Verify your phone number first, then submit business verification.");
            return;
        }

        setIsBusinessVerifying(true);
        setBusinessVerifyError("");
        setBusinessVerifyResult(null);

        try {
            const socialLinks = businessVerifyForm.socialLinks
                .split(/\r?\n|,/)
                .map((item) => item.trim())
                .filter(Boolean);
            const result = await requestBusinessVerification({
                uid: user.uid,
                businessName: businessVerifyForm.businessName,
                ownerName: businessVerifyForm.ownerName,
                phoneNumber: profile.phoneNumber || editedPhoneDisplay || editedPhoneE164,
                phoneVerified: profilePhoneVerified,
                email: profile.email || "",
                category: businessVerifyForm.category,
                address: businessVerifyForm.address,
                city: businessVerifyForm.city,
                country: businessVerifyForm.country,
                coordinates: profile.deliveryCoords || null,
                logoUrl: profile.photoURL || "",
                shopFrontPhoto: businessVerifyForm.shopFrontPhoto,
                insideShopPhoto: businessVerifyForm.insideShopPhoto,
                documentUrl: businessVerifyForm.documentUrl || null,
                socialLinks,
                googleMapsUrl: businessVerifyForm.googleMapsUrl || null,
            });

            await updateUserProfile({
                companyName: businessVerifyForm.businessName,
                category: businessVerifyForm.category,
                currentAddress: businessVerifyForm.address,
                city: businessVerifyForm.city,
                country: businessVerifyForm.country,
                googleMapsUrl: businessVerifyForm.googleMapsUrl || null,
                businessSocialLinks: socialLinks,
                shopFrontPhotoUrl: businessVerifyForm.shopFrontPhoto,
                shopInsidePhotoUrl: businessVerifyForm.insideShopPhoto,
                businessDocumentUrl: businessVerifyForm.documentUrl || null,
                businessVerificationStatus: result.status,
                businessVerificationScore: result.score,
                businessVerificationConfidence: result.confidence,
                businessVerificationDecision: result.decision,
                businessVerificationReasons: result.reasons,
                businessVerificationRiskFlags: result.riskFlags,
                businessVerificationSources: result.sources,
                businessVerificationVisionResults: result.visionResults || null,
                businessVerificationBadges: result.badges,
                businessVerificationRequestedAt: Date.now(),
                businessVerificationReviewedAt: result.reviewedAt,
                businessVerificationProvider: result.aiProvider,
                businessVerified: result.status === "approved",
                businessVerifiedAt: result.status === "approved" ? Date.now() : profile.businessVerifiedAt || null,
            });

            setBusinessVerifyResult(result);
        } catch (error) {
            console.error("Business verification failed", error);
            setBusinessVerifyError(error instanceof Error ? error.message : "Business verification could not run right now.");
        } finally {
            setIsBusinessVerifying(false);
        }
    };

    const customerChecklist: ChecklistItem[] = useMemo(
        () => [
            { label: "Add profile photo", done: Boolean(photo), weight: 15, tab: "general" },
            { label: "Verify phone number", done: profilePhoneVerified, weight: 20, tab: "contact" },
            { label: "Add country & city", done: Boolean(profile?.country && profile?.city), weight: 15, tab: "address" },
            { label: "Add current address", done: Boolean(profile?.currentAddress), weight: 15, tab: "address" },
            { label: "Add email", done: Boolean(profile?.email), weight: 15, tab: "contact" },
            { label: "Complete first Need", done: customerFirstNeedDone, weight: 20, tab: "preferences" },
        ],
        [photo, profilePhoneVerified, profile?.country, profile?.city, profile?.currentAddress, profile?.email, customerFirstNeedDone],
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
            { label: "Verify phone", done: profilePhoneVerified, weight: 10, tab: "contact" },
            { label: "Verify business", done: businessVerificationApproved, weight: 10, tab: "security" },
        ],
        [photo, businessName, profile?.category, profile?.country, profile?.city, profile?.openingHours, profile?.services, profile?.warrantyPolicy, profilePhoneVerified, businessVerificationApproved],
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
                      { label: "Verify phone", done: editedPhoneVerified, weight: 10, tab: "contact" },
                      { label: "Verify business", done: businessVerificationApproved, weight: 10, tab: "security" },
                  ]
                : [
                      { label: "Add profile photo", done: Boolean(editForm.photoURL), weight: 15, tab: "general" },
                      { label: "Verify phone number", done: editedPhoneVerified, weight: 20, tab: "contact" },
                      { label: "Add country & city", done: Boolean(editForm.country && editForm.city), weight: 15, tab: "address" },
                      { label: "Add current address", done: Boolean(editForm.currentAddress), weight: 15, tab: "address" },
                      { label: "Add email", done: Boolean(profile?.email), weight: 15, tab: "contact" },
                      { label: "Complete first Need", done: customerFirstNeedDone, weight: 20, tab: "preferences" },
                  ],
        [editForm, isBusiness, profile?.email, editedPhoneVerified, businessVerificationApproved, customerFirstNeedDone],
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
                                        placeholder="Phone repair shop, mobile service center..."
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
                            {usernameMessage && (
                                <p
                                    className={`mt-2 text-xs font-bold ${
                                        usernameStatus === "available"
                                            ? "text-[#0a8f45]"
                                            : usernameStatus === "taken" || usernameStatus === "invalid"
                                              ? "text-[#c2410c]"
                                              : "text-[#64748b]"
                                    }`}
                                >
                                    {usernameMessage}
                                </p>
                            )}
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
                        <Field label="Email" hint="Email is optional in the MVP. Phone verification is the trust gate.">
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
                                <input className={`${inputClass} pl-10`} value={email} disabled />
                            </div>
                        </Field>
                        <Field label="Phone Number" hint="Required for customers and repair shops. Step 1 sends SMS, Step 2 verifies the code." className="md:col-span-2">
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
                            <div className={`mt-3 flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black ${editedPhoneVerified ? "bg-[#e9f9f0] text-[#0a8f45]" : "bg-[#fff7ed] text-[#c2410c]"}`}>
                                {editedPhoneVerified ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                {editedPhoneVerified ? "Phone verified" : "Phone verification required"}
                            </div>
                            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() => setIsPhoneVerifyOpen(true)}
                                    disabled={editedPhoneVerified || !editForm.phoneNumberRaw.trim()}
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#06111f] px-4 py-3 text-xs font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
                                >
                                    <Phone size={14} />
                                    {editedPhoneVerified ? "Phone already verified" : "Open verification popup"}
                                </button>
                                {(profile?.phoneNumber || editForm.phoneNumberRaw.trim()) && (
                                    <button
                                        type="button"
                                        onClick={() => void handleResetPhoneVerification()}
                                        disabled={isResettingPhone}
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
                                    >
                                        {isResettingPhone ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                        Delete phone & restart
                                    </button>
                                )}
                            </div>
                            {phoneVerifyMessage && <p className="mt-2 text-xs font-bold text-[#0a8f45]">{phoneVerifyMessage}</p>}
                            {phoneVerifyError && <p className="mt-2 text-xs font-bold text-[#c2410c]">{phoneVerifyError}</p>}
                        </Field>
                    </div>
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
                                        currency: "NPR",
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
                                    {isBusiness ? "Precise Business Location" : "Precise Repair Location"}
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
                            placeholder={isBusiness ? "Search or pin your business location..." : "Search or pin a precise repair pickup point..."}
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
                        {isBusiness && (
                            <div className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4 md:col-span-2">
                                <ShieldCheck size={20} className={businessVerificationApproved ? "text-[#0a8f45]" : "text-[#c2410c]"} />
                                <p className="mt-3 text-sm font-black text-[#06111f]">{businessVerificationLabel}</p>
                                <p className="mt-1 text-xs leading-5 text-[#64748b]">
                                    Phone verification unlocks business verification. Approved businesses can send Repair Offers.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!profilePhoneVerified) {
                                            setActiveTab("contact");
                                            return;
                                        }
                                        openBusinessVerification();
                                    }}
                                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#06111f] px-4 py-3 text-xs font-black text-white transition hover:bg-black"
                                >
                                    <ShieldCheck size={14} />
                                    {profilePhoneVerified ? "Verify Business to Quote" : "Verify phone first"}
                                </button>
                            </div>
                        )}
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
                <div id="needero-phone-recaptcha" className="pointer-events-none fixed bottom-0 right-0 h-px w-px overflow-hidden opacity-0" />
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
                                            {profile?.currency || "NPR"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {isBusiness ? (
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (businessVerificationApproved) {
                                            window.location.href = "/marketplace";
                                            return;
                                        }
                                        if (!profilePhoneVerified) {
                                            openEditor("contact");
                                            return;
                                        }
                                        openBusinessVerification();
                                    }}
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#06111f] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-black"
                                >
                                    <Briefcase size={17} />
                                    {businessVerificationApproved
                                        ? "Browse Repair Offers"
                                        : profilePhoneVerified
                                          ? "Verify Business to Quote"
                                          : "Verify Phone First"}
                                </button>
                            ) : (
                                <Link
                                    href="/client/new"
                                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#06111f] px-6 py-4 text-sm font-black text-white shadow-lg transition hover:bg-black"
                                >
                                    <MessageSquare size={17} />
                                    Post Phone Repair Need
                                </Link>
                            )}
                        </div>
                    </section>

                    <section className="mt-5 grid gap-4 md:grid-cols-4">
                        <InfoTile icon={UserRound} label="Basic Info" value={`${displayName} - ${email}`} onClick={() => openEditor("general")} />
                        <InfoTile icon={MapPin} label="Location" value={locationDisplay} onClick={() => openEditor("address")} />
                        <InfoTile
                            icon={ShieldCheck}
                            label="Trust"
                            value={
                                isBusiness
                                    ? `${profilePhoneVerified ? "Phone ok" : "Phone needed"} - ${businessVerificationLabel}`
                                    : profilePhoneVerified
                                      ? "Phone verified"
                                      : profile?.phoneNumber
                                        ? "Verify phone number"
                                        : "Add phone number"
                            }
                            onClick={() => openEditor("contact")}
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
                                        <WorkspaceTile icon={Store} title="Repair Offers" copy="Browse phone repair Needs and send Offers" href="/marketplace" />
                                        <WorkspaceTile icon={Briefcase} title="Plans" copy="Upgrade visibility and lead access" href="/pricing" />
                                        <WorkspaceTile icon={MessageSquare} title="Messages" copy="Customer chats and offer updates" href="/messages" />
                                        <WorkspaceTile
                                            icon={ShieldCheck}
                                            title={businessVerificationApproved ? "Business Verified" : "Verify Business"}
                                            copy={businessVerificationApproved ? "Ready to quote customer Needs" : "Submit shop proof before quoting"}
                                            onClick={profilePhoneVerified ? openBusinessVerification : () => openEditor("contact")}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <WorkspaceTile icon={CheckCircle2} title="My Repair Needs" copy="Active, completed, and cancelled phone repairs" href="/client" />
                                        <WorkspaceTile icon={Briefcase} title="Orders / Bookings" copy="Booked phone repair services" href="/client" />
                                        <WorkspaceTile icon={Star} title="Reviews" copy="Reviews given to repair shops" href="/messages" />
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
                                                    currency: "NPR",
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

                {isPhoneVerifyOpen && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-[24px] border border-[#dfe8e3] bg-white p-6 shadow-2xl">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0a8f45]">Phone verification</p>
                                    <h2 className="mt-2 text-2xl font-black text-[#06111f]">Verify this number</h2>
                                    <p className="mt-2 text-sm leading-6 text-[#64748b]">
                                        {editedPhoneE164 || "Add a valid phone number first."}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsPhoneVerifyOpen(false)}
                                    className="rounded-full p-2 text-[#64748b] transition hover:bg-[#f1f5f9]"
                                    aria-label="Close phone verification"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            <div className="mt-6 grid gap-4">
                                <div className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">Step 1</p>
                                            <p className="mt-1 text-sm font-black text-[#06111f]">Send SMS code</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleSendPhoneCode}
                                            disabled={editedPhoneVerified || isSendingPhoneCode || !editForm.phoneNumberRaw.trim() || phoneCooldownSeconds > 0}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#06111f] px-4 py-3 text-xs font-black text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-55"
                                        >
                                            {isSendingPhoneCode ? <Loader2 size={14} className="animate-spin" /> : <Phone size={14} />}
                                            {phoneCooldownSeconds > 0
                                                ? `Wait ${phoneCooldownSeconds}s`
                                                : phoneVerificationId
                                                  ? "Resend code"
                                                  : "Send code"}
                                        </button>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-[#edf2ef] bg-[#fbfdfb] p-4">
                                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#94a3b8]">Step 2</p>
                                    <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
                                        <input
                                            className={`${inputClass} mt-0`}
                                            value={phoneOtp}
                                            onChange={(event) => setPhoneOtp(event.target.value)}
                                            placeholder="Enter SMS code"
                                            inputMode="numeric"
                                            disabled={editedPhoneVerified || !editForm.phoneNumberRaw.trim()}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleConfirmPhoneCode}
                                            disabled={editedPhoneVerified || isConfirmingPhoneCode || phoneOtp.trim().length < 4}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a8f45] px-4 py-3 text-xs font-black text-white transition hover:bg-[#08783b] disabled:cursor-not-allowed disabled:opacity-55"
                                        >
                                            {isConfirmingPhoneCode ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                            Verify code
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {phoneVerifyMessage && <p className="mt-4 rounded-xl bg-[#e9f9f0] px-4 py-3 text-xs font-bold text-[#0a8f45]">{phoneVerifyMessage}</p>}
                            {phoneVerifyError && <p className="mt-4 rounded-xl bg-[#fff7ed] px-4 py-3 text-xs font-bold text-[#c2410c]">{phoneVerifyError}</p>}
                            {(profile?.phoneNumber || editForm.phoneNumberRaw.trim()) && (
                                <button
                                    type="button"
                                    onClick={() => void handleResetPhoneVerification()}
                                    disabled={isResettingPhone}
                                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-3 text-xs font-black text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-55"
                                >
                                    {isResettingPhone ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                    Delete phone & restart
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {isBusinessVerifyOpen && (
                    <div className="fixed inset-0 z-[75] overflow-y-auto bg-black/55 p-4 backdrop-blur-sm md:p-6">
                        <div className="mx-auto w-full max-w-4xl rounded-[24px] border border-[#dfe8e3] bg-white p-5 shadow-2xl md:p-7">
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#0a8f45]">AI-assisted verification</p>
                                    <h2 className="mt-2 text-2xl font-black text-[#06111f]">Verify Business to Quote</h2>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">
                                        Needero checks submitted proof, Tavily web evidence, and DeepSeek risk reasoning. Risky cases go to manual review.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsBusinessVerifyOpen(false)}
                                    className="self-end rounded-full p-2 text-[#64748b] transition hover:bg-[#f1f5f9] md:self-auto"
                                    aria-label="Close business verification"
                                >
                                    <X size={22} />
                                </button>
                            </div>

                            {!profilePhoneVerified && (
                                <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
                                    Verify your phone number first. Then this business verification can run.
                                </div>
                            )}

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                                <Field label="Owner name">
                                    <input
                                        className={inputClass}
                                        value={businessVerifyForm.ownerName}
                                        onChange={(event) => setBusinessVerifyForm({ ...businessVerifyForm, ownerName: event.target.value })}
                                    />
                                </Field>
                                <Field label="Business name">
                                    <input
                                        className={inputClass}
                                        value={businessVerifyForm.businessName}
                                        onChange={(event) => setBusinessVerifyForm({ ...businessVerifyForm, businessName: event.target.value })}
                                    />
                                </Field>
                                <Field label="Category">
                                    <input
                                        className={inputClass}
                                        value={businessVerifyForm.category}
                                        onChange={(event) => setBusinessVerifyForm({ ...businessVerifyForm, category: event.target.value })}
                                        placeholder="Phone repair shop"
                                    />
                                </Field>
                                <Field label="City / country">
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <input
                                            className={inputClass}
                                            value={businessVerifyForm.city}
                                            onChange={(event) => setBusinessVerifyForm({ ...businessVerifyForm, city: event.target.value })}
                                            placeholder="City"
                                        />
                                        <input
                                            className={inputClass}
                                            value={businessVerifyForm.country}
                                            onChange={(event) => setBusinessVerifyForm({ ...businessVerifyForm, country: event.target.value })}
                                            placeholder="Country"
                                        />
                                    </div>
                                </Field>
                                <Field label="Shop address" className="md:col-span-2">
                                    <input
                                        className={inputClass}
                                        value={businessVerifyForm.address}
                                        onChange={(event) => setBusinessVerifyForm({ ...businessVerifyForm, address: event.target.value })}
                                        placeholder="Street, landmark, floor, shop number"
                                    />
                                </Field>
                                <Field label="Google Maps link">
                                    <input
                                        className={inputClass}
                                        value={businessVerifyForm.googleMapsUrl}
                                        onChange={(event) => setBusinessVerifyForm({ ...businessVerifyForm, googleMapsUrl: event.target.value })}
                                        placeholder="https://maps.google.com/..."
                                    />
                                </Field>
                                <Field label="Social links">
                                    <textarea
                                        className={`${inputClass} min-h-[92px] resize-none`}
                                        value={businessVerifyForm.socialLinks}
                                        onChange={(event) => setBusinessVerifyForm({ ...businessVerifyForm, socialLinks: event.target.value })}
                                        placeholder="Facebook, Instagram, website links"
                                    />
                                </Field>
                            </div>

                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                {[
                                    ["shopFrontPhoto", "Shop front photo", businessVerifyForm.shopFrontPhoto],
                                    ["insideShopPhoto", "Inside shop photo", businessVerifyForm.insideShopPhoto],
                                    ["documentUrl", "Optional document", businessVerifyForm.documentUrl],
                                ].map(([field, label, value]) => (
                                    <label key={field} className="block cursor-pointer rounded-2xl border border-dashed border-[#bdddc8] bg-[#fbfdfb] p-4 transition hover:border-[#0a8f45]">
                                        <input
                                            type="file"
                                            accept={field === "documentUrl" ? "image/*,application/pdf,.pdf" : "image/*"}
                                            className="hidden"
                                            onChange={(event) =>
                                                processBusinessVerificationFile(
                                                    field as "shopFrontPhoto" | "insideShopPhoto" | "documentUrl",
                                                    event.target.files?.[0],
                                                )
                                            }
                                        />
                                        <div className="flex h-24 items-center justify-center rounded-2xl bg-white">
                                            {value && String(value).startsWith("data:image") ? (
                                                <img src={String(value)} alt="" className="h-full w-full rounded-2xl object-cover" />
                                            ) : (
                                                <UploadCloud size={28} className="text-[#94a3b8]" />
                                            )}
                                        </div>
                                        <p className="mt-3 text-sm font-black text-[#06111f]">{label}</p>
                                        <p className="mt-1 text-xs leading-5 text-[#64748b]">
                                            {field === "shopFrontPhoto" ? `Use a fresh front photo holding paper: Needero ${todayProofDate}.` : value ? "File attached." : "Tap to upload."}
                                        </p>
                                    </label>
                                ))}
                            </div>

                            {businessVerifyResult && (
                                <div className="mt-5 rounded-2xl border border-[#dfe8e3] bg-[#fbfdfb] p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black text-[#06111f]">{businessVerificationStatusLabel(businessVerifyResult.status)}</p>
                                            <p className="mt-1 text-xs font-bold text-[#64748b]">
                                                Score {businessVerifyResult.score}/100 - Confidence {businessVerifyResult.confidence}%
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-[#e9f9f0] px-3 py-1 text-xs font-black text-[#0a8f45]">
                                            {businessVerifyResult.aiProvider === "deepseek" ? "DeepSeek reviewed" : "Local fallback"}
                                        </span>
                                        <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-xs font-black text-[#2563eb]">
                                            {businessVerifyResult.visionResults?.provider === "openrouter" ? "Vision checked" : "Vision review pending"}
                                        </span>
                                    </div>
                                    {businessVerifyResult.reasons.length > 0 && (
                                        <p className="mt-3 text-xs leading-5 text-[#0a8f45]">{businessVerifyResult.reasons.slice(0, 2).join(" ")}</p>
                                    )}
                                    {businessVerifyResult.riskFlags.length > 0 && (
                                        <p className="mt-2 text-xs leading-5 text-[#c2410c]">{businessVerifyResult.riskFlags.slice(0, 2).join(" ")}</p>
                                    )}
                                </div>
                            )}

                            {businessVerifyError && <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{businessVerifyError}</div>}

                            <div className="mt-6 flex flex-col gap-3 border-t border-[#edf2ef] pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setIsBusinessVerifyOpen(false)}
                                    className="rounded-xl border border-[#dfe8e3] bg-white px-5 py-3 text-sm font-black text-[#06111f] transition hover:bg-[#f8faf9]"
                                >
                                    Close
                                </button>
                                <button
                                    type="button"
                                    onClick={() => void submitBusinessVerification()}
                                    disabled={!profilePhoneVerified || isBusinessVerifying}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0a8f45] px-5 py-3 text-sm font-black text-white transition hover:bg-[#08783b] disabled:cursor-not-allowed disabled:opacity-55"
                                >
                                    {isBusinessVerifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                    Run verification
                                </button>
                            </div>
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
                                                {editedPhoneVerified && <CheckCircle2 size={15} className="shrink-0 text-[#0a8f45]" />}
                                            </div>
                                            <p className="mt-1 text-xs font-semibold text-[#64748b]">{locationDisplay}</p>
                                            <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] font-black text-[#0a8f45]">
                                                <span className={`rounded-full px-2.5 py-1 ${editedPhoneVerified ? "bg-[#e9f9f0] text-[#0a8f45]" : "bg-[#fff7ed] text-[#c2410c]"}`}>
                                                    {editedPhoneVerified ? "Phone verified" : "Phone required"}
                                                </span>
                                                <span className="rounded-full bg-[#f1f5f9] px-2.5 py-1 text-[#64748b]">Email optional</span>
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
