"use client";

import { useEffect, useState } from "react";
import {
    AlertCircle,
    ArrowLeft,
    Building2,
    Eye,
    EyeOff,
    Github,
    Loader2,
    Mail,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const {
        user,
        loading: authLoading,
        signInWithGitHub,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
    } = useAuth();

    const [emailMode, setEmailMode] = useState<"signin" | "signup" | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user && !authLoading) {
            router.push("/dashboard");
        }
    }, [user, authLoading, router]);

    const handleProviderSignIn = async (provider: "google" | "github") => {
        setError(null);
        setLoading(provider);

        try {
            if (provider === "google") {
                await signInWithGoogle();
            } else {
                await signInWithGitHub();
            }
            router.push("/dashboard");
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
                    setError("Business or contact name is required.");
                    return;
                }
                await signUpWithEmail(email, password, displayName.trim());
            } else {
                await signInWithEmail(email, password);
            }

            router.push("/dashboard");
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
                    <section className="rounded-[28px] border border-gcp-border bg-[radial-gradient(circle_at_top_left,rgba(66,133,244,0.12),transparent_45%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(255,255,255,0.82))] p-8 shadow-xl md:p-12">
                        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-gcp-blue/20 bg-gcp-blue/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-gcp-blue">
                            <Building2 size={14} />
                            Business Workspace
                        </div>

                        <h1 className="max-w-2xl text-4xl font-heading font-bold leading-tight md:text-6xl">
                            One business account. Email, Google, or GitHub all land in the same workspace.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-gcp-text-secondary md:text-lg">
                            Needaro helps customers post local problems and compare offers from nearby businesses.
                            Start with phone repair requests, shop offers, and simple lead validation.
                        </p>

                        <div className="mt-10 grid gap-4 md:grid-cols-3">
                            {[
                                {
                                    title: "Fast intake",
                                    copy: "Post a repair problem once and let nearby shops compete with offers.",
                                },
                                {
                                    title: "Managed delivery",
                                    copy: "Requests are planned, executed, reviewed, and routed by the internal AI workforce.",
                                },
                                {
                                    title: "Simple access",
                                    copy: "Email, Google, and GitHub all open the same business workspace with the same dashboard and billing flow.",
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
                            <p className="text-xs font-bold uppercase tracking-[0.28em] text-gcp-blue">
                                Business Sign In
                            </p>
                            <h2 className="mt-3 text-2xl font-heading font-bold text-gcp-text">
                                Access your workspace
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-gcp-text-secondary">
                                Choose your preferred sign-in method. New accounts are created as business accounts automatically.
                            </p>
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
                                    Continue with Google
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
                                    Continue with GitHub
                                </button>

                                <button
                                    onClick={() => {
                                        setError(null);
                                        setEmailMode("signin");
                                    }}
                                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gcp-blue px-6 py-4 text-base font-bold text-white transition-all hover:bg-gcp-blue-hover"
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
                                            Business or contact name
                                        </label>
                                        <input
                                            type="text"
                                            value={displayName}
                                            onChange={(event) => setDisplayName(event.target.value)}
                                            className="gcp-input w-full"
                                            placeholder="Acme Studio"
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
                                        placeholder="team@company.com"
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
                                    {emailMode === "signup" ? "Create business account" : "Sign in"}
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
                                            : "Need a new workspace? Create an account"}
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
