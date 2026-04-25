"use client";

import { useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    CheckCircle2,
    Eye,
    EyeOff,
    Github,
    Loader2,
    Mail,
    Store,
    UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ActiveAccountType, useAuth } from "@/context/AuthContext";

const destinationFor = (accountType: ActiveAccountType | null | undefined) =>
    accountType === "business" ? "/dashboard" : "/client";

const accountOptions: Array<{
    type: ActiveAccountType;
    title: string;
    subtitle: string;
    icon: typeof UserRound;
    points: string[];
}> = [
    {
        type: "customer",
        title: "Customer account",
        subtitle: "Post a local problem, compare offers, and choose the best nearby shop.",
        icon: UserRound,
        points: ["Post phone repair requests", "Compare price, speed, warranty", "Contact unlocks after choosing"],
    },
    {
        type: "business",
        title: "Local Business account",
        subtitle: "Receive nearby customer requests, send quotes, and grow with paid plans later.",
        icon: Store,
        points: ["Lead inbox for local jobs", "Quote with price, time, warranty", "Profile, analytics, and plans"],
    },
];

export default function LoginPage() {
    const router = useRouter();
    const {
        user,
        loading: authLoading,
        signInWithGitHub,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        accountType,
    } = useAuth();

    const [emailMode, setEmailMode] = useState<"signin" | "signup" | null>(null);
    const [selectedAccountType, setSelectedAccountType] = useState<ActiveAccountType>("customer");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && !authLoading && accountType) {
            router.push(destinationFor(accountType));
        }
    }, [user, authLoading, accountType, router]);

    const handleProviderSignIn = async (provider: "google" | "github") => {
        setError(null);
        setLoading(provider);

        try {
            if (provider === "google") {
                await signInWithGoogle(selectedAccountType);
            } else {
                await signInWithGitHub(selectedAccountType);
            }
            router.push(destinationFor(selectedAccountType));
        } catch (err: any) {
            setError(err?.message || `${provider} authentication failed`);
        } finally {
            setLoading(null);
        }
    };

    const handleEmail = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setLoading("email");

        try {
            if (emailMode === "signup") {
                if (!displayName.trim()) {
                    setError(selectedAccountType === "business" ? "Shop or owner name is required." : "Your name is required.");
                    return;
                }
                await signUpWithEmail(email, password, displayName.trim(), selectedAccountType);
            } else {
                await signInWithEmail(email, password, selectedAccountType);
            }

            router.push(destinationFor(selectedAccountType));
        } catch (err: any) {
            if (err.code === "auth/user-not-found") {
                setError("No account was found for that email.");
            } else if (err.code === "auth/wrong-password") {
                setError("The password is incorrect.");
            } else if (err.code === "auth/email-already-in-use") {
                setError("This email is already registered. Sign in instead.");
            } else if (err.code === "auth/weak-password") {
                setError("Password must be at least 6 characters.");
            } else {
                setError(err?.message || "Authentication failed.");
            }
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-[calc(100vh-48px)] px-4 py-10 md:px-8 md:py-16">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/"
                    className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
                    style={{ color: "var(--text-secondary)" }}
                >
                    <ArrowLeft size={14} />
                    Back to Hub
                </Link>

                {error && (
                    <div className="mb-6 flex max-w-xl items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
                        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-700">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-1 text-xs text-red-500 transition-colors hover:text-red-700"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
                    <section className="rounded-[28px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(15,23,42,0.10),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(250,250,247,0.9))] p-8 shadow-xl md:p-12">
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-slate-600">
                            <Building2 size={14} />
                            Needaro account system
                        </div>

                        <h1 className="max-w-2xl text-4xl font-heading font-bold leading-tight md:text-6xl">
                            One marketplace. Two clear account flows.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-gcp-text-secondary md:text-lg">
                            Customers post problems once. Local businesses compete with clear offers. Needaro keeps
                            contact details protected until the customer chooses a shop.
                        </p>

                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            {[
                                {
                                    title: "Customer",
                                    copy: "Post phone repair issues, upload photos, and compare real offers.",
                                },
                                {
                                    title: "Business",
                                    copy: "Receive warm nearby leads and send price, time, and warranty.",
                                },
                                {
                                    title: "Marketplace",
                                    copy: "Start narrow with one city, one category, and fast quote replies.",
                                },
                            ].map((item) => (
                                <div key={item.title} className="rounded-2xl border border-gcp-border bg-white/80 p-5 shadow-sm">
                                    <h2 className="text-sm font-bold uppercase tracking-wider text-gcp-text">
                                        {item.title}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">{item.copy}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="gcp-card p-8 shadow-2xl md:p-10">
                        <div className="mb-8">
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">
                                Choose account type
                            </p>
                            <h2 className="mt-3 text-2xl font-heading font-bold text-gcp-text">
                                Access Needaro
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-gcp-text-secondary">
                                Pick the role first, then sign in with Google, GitHub, or email.
                            </p>
                        </div>

                        <div className="mb-6 grid gap-3">
                            {accountOptions.map((option) => {
                                const OptionIcon = option.icon;
                                const selected = selectedAccountType === option.type;

                                return (
                                    <button
                                        key={option.type}
                                        type="button"
                                        onClick={() => setSelectedAccountType(option.type)}
                                        className={`rounded-3xl border p-4 text-left transition-all ${
                                            selected
                                                ? "border-slate-950 bg-slate-950 text-white shadow-xl shadow-slate-900/10"
                                                : "border-slate-200 bg-white text-slate-950 hover:border-slate-950"
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                                                    selected ? "bg-white text-slate-950" : "bg-slate-100 text-slate-700"
                                                }`}
                                            >
                                                <OptionIcon size={20} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <h3 className="text-base font-black">{option.title}</h3>
                                                    {selected && <CheckCircle2 size={18} />}
                                                </div>
                                                <p className={`mt-1 text-sm leading-6 ${selected ? "text-white/75" : "text-slate-500"}`}>
                                                    {option.subtitle}
                                                </p>
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {option.points.map((point) => (
                                                        <span
                                                            key={point}
                                                            className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                                                                selected ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"
                                                            }`}
                                                        >
                                                            {point}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {!emailMode ? (
                            <div className="space-y-5">
                                <button
                                    onClick={() => handleProviderSignIn("google")}
                                    disabled={loading === "google"}
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[#dadce0] bg-white px-6 py-4 text-base font-bold text-[#3c4043] transition-all hover:bg-[#f8f9fa] disabled:opacity-50"
                                >
                                    {loading === "google" ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                        </svg>
                                    )}
                                    Continue with Google as {selectedAccountType === "business" ? "Local Business" : "Customer"}
                                </button>

                                <button
                                    onClick={() => handleProviderSignIn("github")}
                                    disabled={loading === "github"}
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#24292e] px-6 py-4 text-base font-bold text-white transition-all hover:bg-[#1b1f23] disabled:opacity-50"
                                >
                                    {loading === "github" ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Github size={20} />
                                    )}
                                    Continue with GitHub as {selectedAccountType === "business" ? "Local Business" : "Customer"}
                                </button>

                                <button
                                    onClick={() => {
                                        setError(null);
                                        setEmailMode("signin");
                                    }}
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gcp-blue px-6 py-4 text-base font-bold text-white transition-all hover:bg-gcp-blue-hover"
                                >
                                    <Mail size={20} />
                                    Continue with Email as {selectedAccountType === "business" ? "Local Business" : "Customer"}
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleEmail} className="space-y-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setEmailMode(null);
                                        setError(null);
                                    }}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gcp-text-secondary transition-opacity hover:opacity-70"
                                >
                                    <ArrowLeft size={14} />
                                    Back to options
                                </button>

                                {emailMode === "signup" && (
                                    <div>
                                        <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gcp-text-secondary">
                                            {selectedAccountType === "business" ? "Shop or owner name" : "Your name"}
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(event) => setDisplayName(event.target.value)}
                                            className="gcp-input w-full"
                                            placeholder={selectedAccountType === "business" ? "New Road Mobile Care" : "Sangam Gautam"}
                                            required
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gcp-text-secondary">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        className="gcp-input w-full"
                                        placeholder={selectedAccountType === "business" ? "shop@needaro.com" : "you@example.com"}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-gcp-text-secondary">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(event) => setPassword(event.target.value)}
                                            className="gcp-input w-full pr-10"
                                            placeholder="Enter your password"
                                            minLength={6}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gcp-text-secondary transition-opacity hover:opacity-70"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading === "email"}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gcp-blue px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-gcp-blue-hover disabled:opacity-50"
                                >
                                    {loading === "email" ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                    {emailMode === "signup"
                                        ? selectedAccountType === "business"
                                            ? "Create local business account"
                                            : "Create customer account"
                                        : "Sign in"}
                                </button>

                                <div className="pt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEmailMode((current) => (current === "signup" ? "signin" : "signup"))
                                        }
                                        className="text-xs font-medium text-gcp-blue transition-colors hover:underline"
                                    >
                                        {emailMode === "signup"
                                            ? "Already have an account? Sign in"
                                            : "Need a new Needaro account? Create one"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
