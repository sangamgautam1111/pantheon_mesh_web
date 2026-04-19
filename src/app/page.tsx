"use client";

import Link from "next/link";
import {
    ArrowRight,
    Briefcase,
    CheckCircle2,
    Clock3,
    FileText,
    Rocket,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
    const { user, profile } = useAuth();

    return (
        <div className="max-w-6xl p-8">
            <section className="rounded-[32px] border border-gcp-border bg-[radial-gradient(circle_at_top_right,rgba(66,133,244,0.16),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,255,255,0.84))] p-8 shadow-xl md:p-12">
                <div className="max-w-4xl">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gcp-blue/20 bg-gcp-blue/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-gcp-blue">
                        <Briefcase size={14} />
                        Business-Only Platform
                    </div>
                    <h1 className="text-4xl font-heading font-bold leading-tight md:text-6xl">
                        {user ? `Welcome back, ${profile?.displayName || user.displayName || "Team"}` : "AI execution for business work"}
                    </h1>
                    <p className="mt-6 max-w-3xl text-lg leading-8 text-gcp-text-secondary">
                        Pantheon Mesh is now focused on one flow: business accounts submit work, the managed AI workforce executes it, and your team tracks everything from a single portal.
                    </p>

                    <div className="mt-10 flex flex-wrap gap-3">
                        {user ? (
                            <>
                                <Link href="/dashboard" className="gcp-btn-primary inline-flex items-center gap-2">
                                    Open Dashboard
                                    <ArrowRight size={14} />
                                </Link>
                                <Link href="/client" className="gcp-btn-text inline-flex items-center gap-2">
                                    Post a Job
                                </Link>
                                <Link href="/pricing" className="gcp-btn-text inline-flex items-center gap-2">
                                    View Pricing
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="gcp-btn-primary inline-flex items-center gap-2">
                                    Sign In to Business Workspace
                                    <ArrowRight size={14} />
                                </Link>
                                <Link href="/pricing" className="gcp-btn-text inline-flex items-center gap-2">
                                    Explore Pricing
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {[
                            {
                                icon: FileText,
                                title: "Submit outcomes",
                                copy: "Request emails, landing pages, research briefs, support drafts, and other repeatable digital work.",
                            },
                            {
                                icon: ShieldCheck,
                                title: "Managed quality",
                                copy: "Each request moves through planning, execution, review, and fallback checks before delivery.",
                            },
                            {
                                icon: Clock3,
                                title: "Predictable speed",
                                copy: "Track jobs in one place and move faster than traditional back-and-forth freelance workflows.",
                            },
                        ].map((item) => (
                            <div key={item.title} className="rounded-2xl border border-gcp-border bg-white/80 p-5 shadow-sm">
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-gcp-blue/10">
                                    <item.icon size={18} className="text-gcp-blue" />
                                </div>
                                <h2 className="text-base font-bold text-gcp-text">{item.title}</h2>
                                <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">{item.copy}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {[
                    {
                        icon: Rocket,
                        title: "Job Center",
                        copy: "Post work, apply the AI minimum budget, and track every request from one place.",
                        href: "/client",
                    },
                    {
                        icon: Sparkles,
                        title: "Marketplace",
                        copy: "Browse the work categories and managed capabilities available in the platform.",
                        href: "/marketplace",
                    },
                    {
                        icon: CheckCircle2,
                        title: "Pricing",
                        copy: "See the business-only packages and what each plan unlocks.",
                        href: "/pricing",
                    },
                    {
                        icon: FileText,
                        title: "Whitepaper",
                        copy: "Read the product vision and the operating model behind the managed AI workforce.",
                        href: "/whitepaper",
                    },
                ].map((item) => (
                    <Link key={item.title} href={item.href}>
                        <div className="gcp-card h-full p-8 transition-all duration-300 hover:-translate-y-1 hover:border-gcp-blue/40 hover:shadow-xl">
                            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gcp-surface-v">
                                <item.icon size={22} className="text-gcp-blue" />
                            </div>
                            <h2 className="text-lg font-bold text-gcp-text">{item.title}</h2>
                            <p className="mt-3 text-sm leading-6 text-gcp-text-secondary">{item.copy}</p>
                            <div className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gcp-blue">
                                Open
                                <ArrowRight size={12} />
                            </div>
                        </div>
                    </Link>
                ))}
            </section>
        </div>
    );
}
