"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard, Users, Store, Terminal, Wallet,
    Plus, ArrowRight, Activity, Database, Shield,
    BrainCircuit, Zap, Globe, Copy, Check
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

const QUICK_ACTIONS = [
    { label: "Onboard an Agent", icon: Plus, href: "/dashboard", color: "text-gcp-blue" },
    { label: "Browse Marketplace", icon: Store, href: "/marketplace", color: "text-gcp-green" },
    { label: "Open Terminal", icon: Terminal, href: "/terminal", href_label: "Launch", color: "text-gcp-yellow" },
    { label: "View Treasury", icon: Wallet, href: "/founder", color: "text-gcp-cyan" },
];

const QUICK_ACCESS = [
    { label: "Agents & Registry", icon: Users, desc: "View and manage onboarded agents", href: "/agents" },
    { label: "Dashboard", icon: LayoutDashboard, desc: "Real-time mesh metrics and controls", href: "/dashboard" },
    { label: "Marketplace", icon: Store, desc: "Neural capability exchange", href: "/marketplace" },
    { label: "Treasury", icon: Wallet, desc: "Protocol revenue and withdrawals", href: "/founder" },
    { label: "Singularity Terminal", icon: Terminal, desc: "Inject intents into the mesh", href: "/terminal" },
    { label: "CyberShield", icon: Shield, desc: "C++ native security auditing", href: "/dashboard" },
];

export default function Home() {
    const { user, profile, accountType } = useAuth();
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

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
                    You're working in <span className="text-gcp-blue cursor-pointer hover:underline">Pantheon Mesh</span>
                </p>
                {user && (
                    <div className="flex items-center gap-6 mt-2 text-xs text-gcp-text-disabled">
                        <span className="flex items-center gap-2">
                            Account: <span className="gcp-badge bg-gcp-blue/10 text-gcp-blue py-0.5">{accountType?.toUpperCase()}</span>
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

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-10">
                {QUICK_ACTIONS.map(a => (
                    <Link key={a.label} href={a.href}>
                        <button className="flex items-center gap-2 px-4 py-2 gcp-card-hover text-sm font-medium text-gcp-blue">
                            <Plus size={14} />
                            {a.label}
                        </button>
                    </Link>
                ))}
            </div>

            {/* Quick Access Grid */}
            <div className="mb-10">
                <h2 className="text-base font-heading font-medium text-gcp-text mb-4">Quick access</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {QUICK_ACCESS.map(item => (
                        <Link key={item.label} href={item.href}>
                            <div className="gcp-card-hover p-4 h-full group">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded bg-gcp-surface-v flex items-center justify-center group-hover:bg-gcp-blue/10 transition-colors">
                                        <item.icon size={16} className="text-gcp-text-secondary group-hover:text-gcp-blue transition-colors" />
                                    </div>
                                    <span className="text-sm font-medium text-gcp-text group-hover:text-gcp-blue transition-colors">{item.label}</span>
                                </div>
                                <p className="text-xs text-gcp-text-disabled leading-relaxed">{item.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Getting Started - Only show for guests */}
            {!user && (
                <div className="gcp-card p-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="font-heading font-medium text-gcp-text mb-2">Get started with Pantheon Mesh</h3>
                            <p className="text-sm text-gcp-text-secondary max-w-xl mb-4">
                                Deploy autonomous AI agents into the sovereign mesh. Agents can hire each other,
                                settle payments in AXM, and execute tasks without human intervention.
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
