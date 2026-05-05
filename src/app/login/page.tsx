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
    UserRound,
    Lock,
    Smartphone,
    UtensilsCrossed,
    Home,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const destinationFor = () => "/client";

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
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && !authLoading && accountType) {
            router.push(accountType === "business" ? "/marketplace" : "/client");
        }
    }, [user, authLoading, accountType, router]);

    const handleProviderSignIn = async (provider: "google" | "github") => {
        setError(null);
        setLoading(provider);

        try {
            if (provider === "google") {
                await signInWithGoogle("customer");
            } else {
                await signInWithGitHub("customer");
            }
        } catch (err: any) {
            setError(err?.code === "auth/popup-closed-by-user"
                ? "Choose a Google or GitHub account to continue."
                : err?.message || `${provider} authentication failed`);
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
                    setError("Your name is required.");
                    return;
                }
                await signUpWithEmail(email, password, displayName.trim(), "customer");
            } else {
                await signInWithEmail(email, password, "customer");
            }

            router.push(destinationFor());
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
        <div className="min-h-screen bg-[#fbfdfb] px-4 py-7 text-[#08111f] md:px-8 md:py-10">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-[#64748b] transition hover:text-[#0a8f45]"
                >
                    <ArrowLeft size={14} />
                    Back to Needero
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

                <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="relative overflow-hidden rounded-[18px] border border-[#dfe8e3] bg-[radial-gradient(circle_at_90%_8%,rgba(10,143,69,0.08),transparent_30%),linear-gradient(180deg,#ffffff,#f8fcfa)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-12">
                        <div className="absolute bottom-0 left-0 h-44 w-72 rounded-tr-[120px] bg-[repeating-linear-gradient(45deg,rgba(10,143,69,0.05)_0,rgba(10,143,69,0.05)_1px,transparent_1px,transparent_12px)]" />
                        <div className="relative mb-8 inline-flex items-center gap-2 rounded-full border border-[#dfe8e3] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-[#0a8f45] shadow-sm">
                            <Building2 size={14} />
                            Customer Sign In
                        </div>

                        <h1 className="relative max-w-2xl text-4xl font-black leading-[0.96] tracking-[-0.055em] text-[#06111f] md:text-6xl">
                            Get things done. Post a Need, get Offers.
                        </h1>

                        <p className="relative mt-6 max-w-2xl text-base leading-7 text-[#64748b]">
                            Post what you need — mobile repair, food delivery, or home service — and local businesses compete to give you the best offer. Quick, transparent, and hassle-free.
                        </p>

                        <div className="relative mt-10 grid gap-4 md:grid-cols-3">
                            {[
                                {
                                    title: "Mobile Repair",
                                    copy: "Cracked screen, battery issue, or any phone problem. Get quotes from verified technicians.",
                                    icon: Smartphone,
                                },
                                {
                                    title: "Food Delivery",
                                    copy: "Order food from nearby restaurants and shops. Compare delivery offers instantly.",
                                    icon: UtensilsCrossed,
                                },
                                {
                                    title: "Home Service",
                                    copy: "Plumbing, electrical, cleaning — post your task and let professionals bid for the job.",
                                    icon: Home,
                                },
                            ].map((item) => {
                                const Icon = item.icon;
                                return (
                                <div key={item.title} className="rounded-2xl border border-[#dfe8e3] bg-white/90 p-5 shadow-sm">
                                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e9f9f0] text-[#0a8f45]">
                                        <Icon size={18} />
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-wider text-[#0f172a]">
                                        {item.title}
                                    </h2>
                                    <p className="mt-3 text-sm leading-6 text-[#64748b]">{item.copy}</p>
                                    <div className="mt-5 h-1 w-8 rounded-full bg-[#0a8f45]" />
                                </div>
                            );})}
                        </div>
                    </section>

                    <section className="rounded-[18px] border border-[#dfe8e3] bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-9">
                        <div className="mb-8">
                            <p className="text-xs font-black uppercase tracking-[0.26em] text-[#64748b]">
                                Customer account
                            </p>
                            <h2 className="mt-3 text-3xl font-black tracking-[-0.045em] text-[#06111f]">
                                Sign In to Needero
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-[#64748b]">
                                Post a Need, compare Offers, and choose the best local business.
                            </p>
                        </div>

                        <div className="mb-6 rounded-[18px] border border-[#0a8f45] bg-[#06111f] p-4 text-white shadow-xl shadow-[#06111f]/10 ring-2 ring-[#0a8f45]/30">
                            <div className="flex items-start gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-950">
                                    <UserRound size={20} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                        <h3 className="text-base font-black">Customer account</h3>
                                        <CheckCircle2 size={18} className="text-[#8bf3b4]" />
                                    </div>
                                    <p className="mt-1 text-sm leading-6 text-white/75">
                                        Post service Needs, compare NPR price and timing, choose the best offer.
                                    </p>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {["Post Needs for free", "Compare offers", "Contact unlocks after choosing"].map((point) => (
                                            <span
                                                key={point}
                                                className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold text-white"
                                            >
                                                {point}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {!emailMode ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 py-1">
                                    <div className="h-px flex-1 bg-[#e4ebe7]" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94a3b8]">
                                        Continue as customer
                                    </span>
                                    <div className="h-px flex-1 bg-[#e4ebe7]" />
                                </div>
                                <button
                                    onClick={() => handleProviderSignIn("google")}
                                    disabled={loading === "google"}
                                    className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#dfe8e3] bg-white px-6 py-3 text-sm font-black text-[#3c4043] transition-all hover:bg-[#f8f9fa] disabled:opacity-50"
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
                                    Continue with Google
                                </button>

                                <button
                                    onClick={() => handleProviderSignIn("github")}
                                    disabled={loading === "github"}
                                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#24292e] px-6 py-3 text-sm font-black text-white transition-all hover:bg-[#1b1f23] disabled:opacity-50"
                                >
                                    {loading === "github" ? (
                                        <Loader2 size={20} className="animate-spin" />
                                    ) : (
                                        <Github size={20} />
                                    )}
                                    Continue with GitHub
                                </button>

                                <button
                                    onClick={() => {
                                        setError(null);
                                        setEmailMode("signin");
                                    }}
                                    className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#06111f] px-6 py-3 text-sm font-black text-white transition-all hover:bg-black"
                                >
                                    <Mail size={20} />
                                    Continue with Email
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
                                            Your name
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(event) => setDisplayName(event.target.value)}
                                            className="gcp-input w-full"
                                            placeholder="Your name"
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
                                        placeholder="you@example.com"
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
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06111f] px-4 py-3 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-black disabled:opacity-50"
                                >
                                    {loading === "email" ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                    {emailMode === "signup"
                                        ? "Create customer account"
                                        : "Sign in"}
                                </button>

                                <div className="pt-2 text-center">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEmailMode((current) => (current === "signup" ? "signin" : "signup"))
                                        }
                                        className="text-xs font-bold text-[#0a8f45] transition-colors hover:underline"
                                    >
                                        {emailMode === "signup"
                                            ? "Already have an account? Sign in"
                                            : "Need a new Needero account? Create one"}
                                    </button>
                                </div>
                            </form>
                        )}
                        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-[#94a3b8]">
                            <Lock size={13} />
                            We never share your contact details. Learn more about privacy.
                        </div>
                        <div className="mt-3 text-center">
                            <Link href="/support" className="text-xs font-black text-[#0a8f45] hover:underline">
                                Need help? Contact support
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
