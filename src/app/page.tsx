"use client";

import { useState } from "react";
import Link from "next/link";
import {
    LayoutDashboard, Users, Store, Wallet, Cpu,
    Plus, ArrowRight, Activity, Database, Shield,
    BrainCircuit, Zap, Globe, Copy, Check, FileText
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

/* ─────────────────────────────────────────────
   Quick action buttons shown below the welcome
   header. Each account type sees its own set.
   ───────────────────────────────────────────── */
const ACCOUNT_ACTIONS: Record<string, any[]> = {
    developer: [
        { label: "Connect Model", icon: Plus, href: "/connect", color: "text-gcp-blue" },
        { label: "Performance", icon: Activity, href: "/developer", color: "text-gcp-green" },
        { label: "View Payouts", icon: Wallet, href: "/withdraw", color: "text-gcp-cyan" },
    ],
    business: [
        { label: "Post a Gig", icon: Plus, href: "/client", color: "text-gcp-blue" },
        { label: "Fund Wallet", icon: Wallet, href: "/withdraw", color: "text-gcp-cyan" },
    ],
    personal: [
        { label: "Upload Agents", icon: Plus, href: "/connect", color: "text-gcp-blue" },
    ],
    founder: [
        { label: "Admin Console", icon: Shield, href: "/dashboard", color: "text-gcp-blue" },
        { label: "Mesh Registry", icon: Users, href: "/agents", color: "text-gcp-green" },
        { label: "Global Treasury", icon: Wallet, href: "/founder", color: "text-gcp-cyan" },
    ]
};

/* ─────────────────────────────────────────────
   Dashboard grid cards. We define a full set
   then filter per-account-type at render time.
   ───────────────────────────────────────────── */
const ALL_CARDS = [
    {
        label: "Agents & Registry",
        icon: Users,
        desc: "Global decentralized agent database for high-scale discovery",
        href: "/agents",
        show: ["developer", "personal", "business", "founder"],
    },
    {
        label: "Developer Central",
        icon: Cpu,
        desc: "Connect cloud & local model fleets to the mesh cluster",
        href: "/developer",
        show: ["developer", "founder"],
    },
    {
        label: "Business Gigs",
        icon: FileText,
        desc: "Post high-level tasks & hire autonomous agent swarms",
        href: "/client",
        show: ["business", "founder"],
    },
    {
        label: "Personal Node",
        icon: Zap,
        desc: "Monitor your contributed models and see real-time mesh performance",
        href: "/simple",
        show: ["personal"],
    },
    {
        label: "Marketplace",
        icon: Store,
        desc: "Intelligence capability exchange with unified billing",
        href: "/marketplace",
        show: ["developer", "personal", "business", "founder"],
    },
    {
        label: "Service Tiers",
        icon: Wallet,
        desc: "View pricing plans and automated revenue settlement",
        href: "/pricing",
        show: ["developer", "business", "founder"],
    },
];

export default function Home() {
    const { user, profile, accountType } = useAuth();
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Only show cards relevant to the current account type
    const currentType = accountType || "personal";
    const visibleCards = ALL_CARDS.filter(card => card.show.includes(currentType));

    return (
        <div className="p-8 max-w-6xl">
            {/* Welcome Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-gcp-blue/10 flex items-center justify-center">
                        <Zap size={20} className="text-gcp-blue" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-heading font-medium text-gcp-text">
                            {user ? `Welcome back, ${profile?.displayName || user.displayName || 'Agent'}` : 'Welcome'}
                        </h1>
                    </div>
                </div>
                <p className="text-sm text-gcp-text-secondary mt-2">
                    You're working in <span className="text-gcp-blue cursor-pointer hover:underline">Pantheon Mesh Routing</span>
                </p>
                {user && (
                    <div className="flex items-center gap-6 mt-2 text-xs text-gcp-text-disabled">
                        <span className="flex items-center gap-2">
                            Account: <span className="gcp-badge bg-gcp-blue/10 text-gcp-blue py-0.5">{currentType.toUpperCase()}</span>
                        </span>
                        <button
                            onClick={() => handleCopy(user.uid)}
                            className="flex items-center gap-1 hover:text-gcp-text-secondary transition-colors"
                        >
                            UID: <span className="text-gcp-text-secondary font-mono">{user.uid.slice(0, 8)}...</span>
                            {copied ? <Check size={12} className="text-gcp-green" /> : <Copy size={12} />}
                        </button>
                    </div>
                )}
            </div>

            {/* Dynamic Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-10">
                {(ACCOUNT_ACTIONS[currentType] || ACCOUNT_ACTIONS.personal).map(a => (
                    <Link key={a.label} href={a.href}>
                        <button className="flex items-center gap-2 px-4 py-2 gcp-card-hover text-sm font-medium text-gcp-blue">
                            <a.icon size={14} className={a.color} />
                            {a.label}
                        </button>
                    </Link>
                ))}
            </div>

            {/* Quick Access Grid — filtered per account type */}
            <div className="mb-16">
                <h2 className="text-xl font-heading font-bold text-gcp-text mb-8 tracking-tight">Explore the Pantheon Mesh</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {visibleCards.map(item => (
                        <Link key={item.label} href={item.href}>
                            <div className="gcp-card p-10 h-full group bg-white/50 backdrop-blur-sm border-gcp-border/40 hover:border-gcp-blue/50 hover:shadow-2xl hover:shadow-gcp-blue/5 transition-all duration-300 transform hover:-translate-y-1">
                                <div className="flex items-center gap-5 mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-gcp-surface-v flex items-center justify-center group-hover:bg-gcp-blue/10 transition-colors shadow-inner">
                                        <item.icon size={24} className="text-gcp-text-secondary group-hover:text-gcp-blue transition-colors" />
                                    </div>
                                    <span className="text-lg font-bold text-gcp-text group-hover:text-gcp-blue transition-colors tracking-tight">{item.label}</span>
                                </div>
                                <p className="text-sm text-gcp-text-secondary leading-relaxed opacity-70 group-hover:opacity-100 transition-opacity">{item.desc}</p>
                                <div className="mt-8 flex items-center gap-2 text-xs font-bold text-gcp-blue uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                                    Enter Dashboard <ArrowRight size={14} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Getting Started — shown only for guests */}
            {!user && (
                <div className="gcp-card p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-heading font-medium text-gcp-text mb-2">Outcome-Based AI Mesh</h3>
                            <p className="text-sm text-gcp-text-secondary max-w-xl mb-4">
                                Pantheon Mesh is an AI agent execution platform that turns connected models into real task automation.
                                Reduce LLM costs by 30–70% with smart routing across OpenAI, Gemini, Ollama, and private GPU nodes
                                through unified billing and revenue sharing for providers.
                            </p>
                            <div className="flex items-center gap-4">
                                <Link href="/login">
                                    <button className="gcp-btn-primary flex items-center gap-3 py-2.5 px-6 rounded-md shadow-md animate-in fade-in zoom-in slide-in-from-bottom-2">
                                        Get Started with Mesh <ArrowRight size={16} />
                                    </button>
                                </Link>
                                <Link href="/whitepaper">
                                    <button className="gcp-btn-text">Read whitepaper</button>
                                </Link>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-3 text-gcp-text-disabled">
                            <Globe size={48} className="opacity-20" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
