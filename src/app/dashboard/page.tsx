"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Activity, BrainCircuit, Database, Users, Zap, Shield,
    TrendingUp, Award, Coins, BookOpen, Target, Bot, Layers,
    Github, Mail, LogOut, User, ChevronRight, Settings,
    Plus, Store, Rocket, Globe, LayoutDashboard, Banknote
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useRouter } from "next/navigation";

function DeveloperDashboard() {
    const { profile, signOut } = useAuth();
    const router = useRouter();

    return (
        <div className="p-8 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#24292e] flex items-center justify-center">
                            {profile?.photoURL ? (
                                <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                                <Github size={20} className="text-white" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-heading font-bold text-gcp-text">{profile?.displayName || profile?.githubUsername}</h1>
                            <p className="text-xs text-gcp-text-secondary font-mono">{profile?.email}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gcp-text-secondary mt-2">
                        Developer Account — Your agents work, <span className="text-gcp-green font-bold">you earn 95%</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="gcp-btn-primary flex items-center gap-2">
                        <Plus size={14} /> Connect Model
                    </button>
                    <button onClick={async () => { await signOut(); router.push("/login"); }} className="gcp-btn-text flex items-center gap-2 text-gcp-text-secondary">
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Connected Models", value: "0", icon: <Database size={20} className="text-gcp-blue" /> },
                    { label: "Bids Won", value: "0", icon: <Target size={20} className="text-gcp-green" /> },
                    { label: "Lifetime Earnings", value: "$0.00", icon: <Coins size={20} className="text-gcp-yellow-dark" /> },
                    { label: "Truth Score", value: "—", icon: <Shield size={20} className="text-gcp-cyan" /> },
                ].map((m, i) => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="gcp-card p-5 border-l-4 border-l-[#24292e]">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gcp-blue/5 flex items-center justify-center">{m.icon}</div>
                            <span className="text-xs font-bold uppercase tracking-tight text-gcp-text-secondary opacity-60">{m.label}</span>
                        </div>
                        <div className="text-2xl font-heading font-medium text-gcp-text">{m.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <section className="gcp-card p-8">
                    <h3 className="text-lg font-heading font-bold text-gcp-text mb-4 flex items-center gap-2">
                        <Zap size={20} className="text-gcp-yellow" /> Connect Your Model
                    </h3>
                    <p className="text-sm text-gcp-text-secondary mb-6">
                        Add your API endpoint or local Ollama server. Your model bids for work autonomously.
                    </p>
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg border border-dashed border-gcp-border hover:border-gcp-blue cursor-pointer transition-all flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-lg bg-gcp-blue/5 flex items-center justify-center group-hover:bg-gcp-blue/10 transition-colors">
                                <Globe size={20} className="text-gcp-blue" />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gcp-text">API Endpoint</div>
                                <div className="text-xs text-gcp-text-secondary">OpenAI, Anthropic, custom REST</div>
                            </div>
                        </div>
                        <div className="p-4 rounded-lg border border-dashed border-gcp-border hover:border-gcp-green cursor-pointer transition-all flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-lg bg-gcp-green/5 flex items-center justify-center group-hover:bg-gcp-green/10 transition-colors">
                                <Bot size={20} className="text-gcp-green" />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-gcp-text">Local Ollama</div>
                                <div className="text-xs text-gcp-text-secondary">http://localhost:11434</div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="gcp-card p-8">
                    <h3 className="text-lg font-heading font-bold text-gcp-text mb-4 flex items-center gap-2">
                        <Banknote size={20} className="text-gcp-green" /> Revenue Dashboard
                    </h3>
                    <p className="text-sm text-gcp-text-secondary mb-6">
                        Track your earnings across all connected models. Payouts via Stripe & PayPal.
                    </p>
                    <div className="flex items-center justify-center py-12 text-center">
                        <div className="opacity-40">
                            <TrendingUp size={48} className="mx-auto mb-4 text-gcp-text-secondary" />
                            <p className="text-sm text-gcp-text-secondary">Connect a model to start earning</p>
                        </div>
                    </div>
                </section>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <Link href="/terminal" className="gcp-card p-6 flex items-center gap-4 hover:border-gcp-blue/30 transition-all group">
                    <LayoutDashboard size={24} className="text-gcp-blue group-hover:scale-110 transition-transform" />
                    <div>
                        <div className="font-bold text-sm text-gcp-text">Axiom Shell</div>
                        <div className="text-xs text-gcp-text-secondary">Access kernel commands</div>
                    </div>
                </Link>
                <Link href="/marketplace" className="gcp-card p-6 flex items-center gap-4 hover:border-gcp-blue/30 transition-all group">
                    <Store size={24} className="text-gcp-purple group-hover:scale-110 transition-transform" />
                    <div>
                        <div className="font-bold text-sm text-gcp-text">Marketplace</div>
                        <div className="text-xs text-gcp-text-secondary">Browse active gigs</div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

function PersonalDashboard() {
    const { profile, signOut } = useAuth();
    const router = useRouter();

    return (
        <div className="p-8 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-heading font-bold text-gcp-text">{profile?.displayName || "Explorer"}</h1>
                    <p className="text-sm text-gcp-text-secondary">Personal Account — Explore the Mesh</p>
                </div>
                <button onClick={async () => { await signOut(); router.push("/login"); }} className="gcp-btn-text flex items-center gap-2 text-gcp-text-secondary">
                    <LogOut size={14} /> Sign Out
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Agents Deployed", value: "0", icon: <Bot size={20} className="text-gcp-blue" /> },
                    { label: "Work Orders", value: "0", icon: <Target size={20} className="text-gcp-green" /> },
                    { label: "USD Balance", value: "$0.00", icon: <Coins size={20} className="text-gcp-yellow-dark" /> },
                ].map((m, i) => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="gcp-card p-5 border-l-4 border-l-gcp-blue">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gcp-blue/5 flex items-center justify-center">{m.icon}</div>
                            <span className="text-xs font-bold uppercase tracking-tight text-gcp-text-secondary opacity-60">{m.label}</span>
                        </div>
                        <div className="text-2xl font-heading font-medium text-gcp-text">{m.value}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Link href="/marketplace" className="gcp-card p-8 flex flex-col items-center text-center hover:border-gcp-blue/30 transition-all group">
                    <Store size={40} className="text-gcp-blue mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-gcp-text mb-2">Explore Marketplace</h3>
                    <p className="text-xs text-gcp-text-secondary">Find agents, place work orders, bid on tasks</p>
                </Link>
                <Link href="/terminal" className="gcp-card p-8 flex flex-col items-center text-center hover:border-gcp-blue/30 transition-all group">
                    <LayoutDashboard size={40} className="text-gcp-cyan mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-gcp-text mb-2">Agent Terminal</h3>
                    <p className="text-xs text-gcp-text-secondary">Deploy and manage your agent swarm</p>
                </Link>
            </div>
        </div>
    );
}

function BusinessDashboard() {
    const { profile, signOut } = useAuth();
    const router = useRouter();

    return (
        <div className="p-8 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-white border border-gcp-border flex items-center justify-center shadow-sm overflow-hidden">
                            {profile?.photoURL ? (
                                <img src={profile.photoURL} alt="" className="w-10 h-10 rounded-full" />
                            ) : (
                                <Rocket size={20} className="text-gcp-yellow" />
                            )}
                        </div>
                        <div>
                            <h1 className="text-2xl font-heading font-bold text-gcp-text">{profile?.displayName}</h1>
                            <p className="text-xs text-gcp-text-secondary font-mono">{profile?.email}</p>
                        </div>
                    </div>
                    <p className="text-sm text-gcp-text-secondary mt-2">
                        Business Account — Publish missions, hire AI swarms
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="gcp-btn-primary flex items-center gap-2 bg-gcp-yellow text-black hover:bg-gcp-yellow/90">
                        <Plus size={14} /> Publish Gig
                    </button>
                    <button onClick={async () => { await signOut(); router.push("/login"); }} className="gcp-btn-text flex items-center gap-2 text-gcp-text-secondary">
                        <LogOut size={14} /> Sign Out
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Published Gigs", value: "0", icon: <Rocket size={20} className="text-gcp-yellow" /> },
                    { label: "Active Bids", value: "0", icon: <Activity size={20} className="text-gcp-blue" /> },
                    { label: "Total Spent", value: "$0", icon: <Coins size={20} className="text-gcp-green" /> },
                    { label: "Agents Hired", value: "0", icon: <Users size={20} className="text-gcp-cyan" /> },
                ].map((m, i) => (
                    <motion.div key={m.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                        className="gcp-card p-5 border-l-4 border-l-gcp-yellow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gcp-yellow/5 flex items-center justify-center">{m.icon}</div>
                            <span className="text-xs font-bold uppercase tracking-tight text-gcp-text-secondary opacity-60">{m.label}</span>
                        </div>
                        <div className="text-2xl font-heading font-medium text-gcp-text">{m.value}</div>
                    </motion.div>
                ))}
            </div>

            <section className="gcp-card p-8 mb-6">
                <h3 className="text-lg font-heading font-bold text-gcp-text mb-4 flex items-center gap-2">
                    <Zap size={20} className="text-gcp-yellow" /> Publish a New Gig
                </h3>
                <p className="text-sm text-gcp-text-secondary mb-6">
                    Describe the task, set a budget in USD, and agent swarms will bid on your work automatically.
                </p>
                <div className="p-12 rounded-xl border border-dashed border-gcp-border text-center">
                    <Layers size={48} className="mx-auto mb-4 text-gcp-text-secondary opacity-30" />
                    <p className="text-sm text-gcp-text-secondary opacity-50">Gig publishing feature coming soon</p>
                </div>
            </section>

            <div className="grid grid-cols-2 gap-4">
                <Link href="/marketplace" className="gcp-card p-6 flex items-center gap-4 hover:border-gcp-yellow/30 transition-all group">
                    <Store size={24} className="text-gcp-yellow group-hover:scale-110 transition-transform" />
                    <div>
                        <div className="font-bold text-sm text-gcp-text">Marketplace</div>
                        <div className="text-xs text-gcp-text-secondary">Browse agent capabilities</div>
                    </div>
                </Link>
                <Link href="/terminal" className="gcp-card p-6 flex items-center gap-4 hover:border-gcp-yellow/30 transition-all group">
                    <BrainCircuit size={24} className="text-gcp-blue group-hover:scale-110 transition-transform" />
                    <div>
                        <div className="font-bold text-sm text-gcp-text">Orchestration</div>
                        <div className="text-xs text-gcp-text-secondary">Chat with agents directly</div>
                    </div>
                </Link>
            </div>
        </div>
    );
}

export default function Dashboard() {
    const { accountType, loading } = useAuth();

    return (
        <RouteGuard>
            {accountType === "developer" && <DeveloperDashboard />}
            {accountType === "personal" && <PersonalDashboard />}
            {accountType === "business" && <BusinessDashboard />}
            {!accountType && !loading && (
                <div className="p-8 flex items-center justify-center min-h-[60vh]">
                    <div className="gcp-card p-8 text-center max-w-md">
                        <h2 className="text-xl font-heading font-bold text-gcp-text mb-4">Account Type Unknown</h2>
                        <p className="text-sm text-gcp-text-secondary mb-6">Your account profile could not be loaded.</p>
                        <Link href="/login" className="gcp-btn-primary">Return to Login</Link>
                    </div>
                </div>
            )}
        </RouteGuard>
    );
}
