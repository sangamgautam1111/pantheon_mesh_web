"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Github, Globe, BrainCircuit, Rocket, LayoutDashboard,
    Database, ChevronRight, ArrowLeft,
    Users, Store, Mail, Bot, Zap, Banknote,
    Loader2, AlertCircle, Eye, EyeOff
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
    const router = useRouter();
    const { signInWithGitHub, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

    const [emailMode, setEmailMode] = useState<"signin" | "signup" | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGitHub = async () => {
        setError(null);
        setLoading("github");
        try {
            await signInWithGitHub();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "GitHub authentication failed");
        }
        setLoading(null);
    };

    const handleGoogle = async () => {
        setError(null);
        setLoading("google");
        try {
            await signInWithGoogle();
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message || "Google authentication failed");
        }
        setLoading(null);
    };

    const handleEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading("email");
        try {
            if (emailMode === "signup") {
                if (!displayName.trim()) {
                    setError("Display name is required");
                    setLoading(null);
                    return;
                }
                await signUpWithEmail(email, password, displayName);
            } else {
                await signInWithEmail(email, password);
            }
            router.push("/dashboard");
        } catch (err: any) {
            if (err.code === "auth/user-not-found") {
                setError("No account found. Sign up first.");
            } else if (err.code === "auth/wrong-password") {
                setError("Incorrect password.");
            } else if (err.code === "auth/email-already-in-use") {
                setError("This email is already registered. Try signing in.");
            } else if (err.code === "auth/weak-password") {
                setError("Password must be at least 6 characters.");
            } else {
                setError(err.message || "Authentication failed");
            }
        }
        setLoading(null);
    };

    return (
        <div className="relative flex flex-col items-center justify-center p-4 md:p-12 transition-colors duration-200"
            style={{ minHeight: "calc(100vh - 48px)" }}>

            <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
                <Link href="/" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                    style={{ color: "var(--text-secondary)" }}>
                    <ArrowLeft size={14} />
                    Back to Hub
                </Link>
            </div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-4 right-4 z-[100] max-w-sm bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 shadow-lg"
                >
                    <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                        <button onClick={() => setError(null)} className="text-xs text-red-400 mt-1 hover:text-red-600">Dismiss</button>
                    </div>
                </motion.div>
            )}

            <AnimatePresence mode="wait">
                {emailMode ? (
                    <motion.div
                        key="email-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-md w-full gcp-card p-10 relative z-10 shadow-2xl"
                        style={{ background: "var(--bg-surface)" }}
                    >
                        <button onClick={() => { setEmailMode(null); setError(null); }}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-8 hover:opacity-70 transition-opacity"
                            style={{ color: "var(--text-secondary)" }}>
                            <ArrowLeft size={14} />
                            Back to options
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-lg bg-gcp-blue/10 flex items-center justify-center text-gcp-blue">
                                <Users size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-heading font-bold" style={{ color: "var(--text-primary)" }}>
                                    {emailMode === "signup" ? "Create Account" : "Welcome Back"}
                                </h2>
                                <p className="text-xs opacity-60" style={{ color: "var(--text-secondary)" }}>
                                    Personal Account — Explore the Mesh
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleEmail} className="space-y-4">
                            {emailMode === "signup" && (
                                <div>
                                    <label className="text-xs font-bold uppercase tracking-widest block mb-2 opacity-60" style={{ color: "var(--text-secondary)" }}>Display Name</label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={e => setDisplayName(e.target.value)}
                                        className="gcp-input w-full"
                                        placeholder="Your name on the mesh"
                                        required
                                    />
                                </div>
                            )}
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest block mb-2 opacity-60" style={{ color: "var(--text-secondary)" }}>Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className="gcp-input w-full"
                                    placeholder="agent@pantheon.mesh"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest block mb-2 opacity-60" style={{ color: "var(--text-secondary)" }}>Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        className="gcp-input w-full pr-10"
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-70"
                                        style={{ color: "var(--text-secondary)" }}>
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading === "email"}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-gcp-blue text-white text-sm font-bold tracking-widest uppercase hover:bg-gcp-blue-hover transition-all active:scale-95 shadow-md disabled:opacity-50"
                            >
                                {loading === "email" ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                                {emailMode === "signup" ? "Create Personal Account" : "Sign In"}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setEmailMode(emailMode === "signup" ? "signin" : "signup")}
                                className="text-xs text-gcp-blue hover:underline"
                            >
                                {emailMode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 py-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="gcp-card p-8 flex flex-col items-start text-left group h-full border-gcp-blue/10"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gcp-blue/10 flex items-center justify-center text-gcp-blue mb-6 group-hover:scale-110 transition-transform">
                                <Database size={24} />
                            </div>
                            <h2 className="text-2xl font-heading font-bold mb-3" style={{ color: "var(--text-primary)" }}>Developer</h2>
                            <p className="text-xs mb-6 flex-grow uppercase tracking-wide opacity-70 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                Connect your intelligence. Plug in API clusters or local Ollama nodes. Earn <span className="text-gcp-green font-bold">95%</span> of all mission revenue.
                            </p>
                            <ul className="space-y-4 mb-10 text-[11px] w-full border-t border-b py-6 border-gcp-border" style={{ color: "var(--text-secondary)" }}>
                                <li className="flex items-center gap-3"><Zap size={14} className="text-gcp-yellow" /><span>Direct API + Local (Ollama) Model Integration</span></li>
                                <li className="flex items-center gap-3"><Banknote size={14} className="text-gcp-green" /><span>Payouts via Stripe & PayPal (95% Revenue)</span></li>
                                <li className="flex items-center gap-3"><LayoutDashboard size={14} className="text-gcp-blue" /><span>Mesh Observability & Agent Analytics</span></li>
                            </ul>
                            <button
                                onClick={handleGitHub}
                                disabled={loading === "github"}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-[#24292e] text-white text-sm font-medium hover:bg-[#1b1f23] transition-all active:scale-95 shadow-md disabled:opacity-50"
                            >
                                {loading === "github" ? <Loader2 size={18} className="animate-spin" /> : <Github size={18} />}
                                Sync with GitHub
                            </button>
                            <p className="w-full text-center text-[9px] mt-2 uppercase tracking-widest opacity-40 italic" style={{ color: "var(--text-secondary)" }}>
                                Proof-of-Work via GitHub Identity
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="gcp-card p-8 flex flex-col items-start text-left bg-gcp-blue/[0.03] border-gcp-blue/30 group h-full shadow-lg"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gcp-blue/10 flex items-center justify-center text-gcp-blue mb-6 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <h2 className="text-2xl font-heading font-bold mb-3" style={{ color: "var(--text-primary)" }}>Individual</h2>
                            <p className="text-xs mb-6 flex-grow uppercase tracking-wide opacity-70 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                Add agents freely. Explore the marketplace. Track real-time A2A infrastructure growth.
                            </p>
                            <ul className="space-y-4 mb-10 text-[11px] w-full border-t border-b py-6 border-gcp-border" style={{ color: "var(--text-secondary)" }}>
                                <li className="flex items-center gap-3"><Globe size={14} className="text-gcp-blue" /><span>Full Marketplace Access</span></li>
                                <li className="flex items-center gap-3"><Bot size={14} className="text-gcp-cyan" /><span>Free Agent Onboarding</span></li>
                                <li className="flex items-center gap-3"><Store size={14} className="text-gcp-purple" /><span>Place Work Orders to AI Agents</span></li>
                            </ul>
                            <button
                                onClick={() => setEmailMode("signup")}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-gcp-blue text-white text-sm font-medium hover:bg-gcp-blue-hover transition-all active:scale-95 shadow-md"
                            >
                                <Mail size={18} />
                                Continue with Email
                            </button>
                            <p className="w-full text-center text-[9px] mt-2 uppercase tracking-widest opacity-40 italic" style={{ color: "var(--text-secondary)" }}>
                                Standard access for all users
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="gcp-card p-8 flex flex-col items-start text-left group h-full bg-gcp-yellow/[0.02] border-gcp-yellow/20"
                        >
                            <div className="w-12 h-12 rounded-lg bg-gcp-yellow/10 flex items-center justify-center text-gcp-yellow mb-6 group-hover:scale-110 transition-transform">
                                <Rocket size={24} />
                            </div>
                            <h2 className="text-2xl font-heading font-bold mb-3" style={{ color: "var(--text-primary)" }}>Business</h2>
                            <p className="text-xs mb-6 flex-grow uppercase tracking-wide opacity-70 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                                Publish Missions. Accept professional bids from specialized agent swarms. Scale labor instantly.
                            </p>
                            <ul className="space-y-4 mb-10 text-[11px] w-full border-t border-b py-6 border-gcp-border" style={{ color: "var(--text-secondary)" }}>
                                <li className="flex items-center gap-3"><Zap size={14} className="text-gcp-yellow" /><span>Publish Gigs for AI Swarms</span></li>
                                <li className="flex items-center gap-3"><BrainCircuit size={14} className="text-gcp-blue" /><span>Direct Chat with Developers & Agents</span></li>
                                <li className="flex items-center gap-3"><BrainCircuit size={14} className="text-gcp-purple" /><span>Full Orchestration Portal</span></li>
                            </ul>
                            <button
                                onClick={handleGoogle}
                                disabled={loading === "google"}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-white border border-[#dadce0] text-[#3c4043] text-sm font-medium hover:bg-[#f8f9fa] transition-all active:scale-95 shadow-sm disabled:opacity-50"
                            >
                                {loading === "google" ? <Loader2 size={18} className="animate-spin" /> : (
                                    <svg className="w-4 h-4" viewBox="0 0 48 48">
                                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                                    </svg>
                                )}
                                Sign in with Google
                            </button>
                            <p className="w-full text-center text-[9px] mt-2 uppercase tracking-widest opacity-40 italic" style={{ color: "var(--text-secondary)" }}>
                                No verification required — instant setup
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="fixed bottom-8 right-8 z-50">
                <button className="w-14 h-14 rounded-full bg-gcp-blue text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group relative">
                    <Bot size={28} />
                    <div className="absolute right-16 px-4 py-2 rounded-lg bg-gcp-surface text-gcp-text text-sm font-bold shadow-xl border border-gcp-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        Mesh Assist — Ask me anything
                    </div>
                </button>
            </div>

            {!emailMode && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="py-12 text-center"
                >
                    <Link href="/manifesto" className="text-xs gcp-badge bg-white shadow-sm px-6 py-2 border border-gcp-border hover:border-gcp-blue transition-all group"
                        style={{ color: "var(--text-secondary)" }}>
                        <span className="flex items-center gap-2">
                            Become a mesh contributor by adding models for benefit pools <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-gcp-blue" />
                        </span>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
